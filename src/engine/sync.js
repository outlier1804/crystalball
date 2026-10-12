// ====== Progress a parent can open on their own phone ======
//
// Everything in the game is saved in the browser of the device it is played on,
// so a parent had to pick that device up to see anything. With this switched on
// (parent panel, behind the PIN) the device sends its profiles to the server
// after he plays, and a parent's phone holding the family link reads them back.
//
// No passwords and no accounts: the device makes one long random family key,
// and the link the parent sends themselves carries it. Whoever holds the link
// can read the progress, and nothing else. Viewing is read-only.
import { Game, Profiles } from "./game.js";
import { Parent } from "./passes.js";
import { Log } from "./log.js";

const KEY = "cq-sync";      // { key, device, on, sentAt }  on the device that is played on
const WATCH = "cq-watch";   // the family key, on a device that only looks
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const rand = (n, abc) => Array.from(crypto.getRandomValues(new Uint8Array(n)), (b) => abc[b % abc.length]).join("");

let timer = null, busy = false;

export const Sync = {
  cfg() { return read(KEY, {}) || {}; },
  on() { const c = this.cfg(); return !!(c.on && c.key); },
  link() { const c = this.cfg(); return c.key ? `${location.origin}/#family=${c.key}` : ""; },

  enable() {
    const c = this.cfg();
    const next = { key: c.key || rand(24, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"), device: c.device || rand(10, "abcdefghijklmnopqrstuvwxyz0123456789"), on: true, sentAt: c.sentAt || 0 };
    localStorage.setItem(KEY, JSON.stringify(next));
    return this.push();
  },

  /** Stop sending, and remove what was sent. */
  async disable() {
    const c = this.cfg();
    localStorage.removeItem(KEY);
    if (c.key) await fetch("/api/sync", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: c.key }) }).catch(() => {});
  },

  /** Everything a parent's view needs: each profile's save, and the pass settings. */
  payload() {
    const { pin, ...settings } = Parent.get();
    return {
      at: Date.now(),
      settings,
      log: Log.list().slice(0, 10),
      profiles: Profiles.list().map((p) => ({ ...p, save: read(Profiles.keyFor(p.id), null) })).filter((p) => p.save),
    };
  },

  async push() {
    const c = this.cfg();
    if (!c.on || !c.key || busy || typeof fetch === "undefined") return false;
    busy = true;
    try {
      const r = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: c.key, device: c.device, data: this.payload() }) });
      const j = await r.json();
      if (j.ok) localStorage.setItem(KEY, JSON.stringify({ ...this.cfg(), sentAt: Date.now() }));
      return !!j.ok;
    } catch { return false; } finally { busy = false; }
  },

  /** Called on every save: send a little later, so a burst of saves is one upload. */
  touch() {
    if (timer || !this.on()) return;
    timer = setTimeout(() => { timer = null; this.push(); }, 20000);
  },

  install() {
    Game.onSave = () => this.touch();
    if (typeof document === "undefined") return;
    // leaving the page (or locking the iPad) sends what is waiting
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && timer) { clearTimeout(timer); timer = null; this.push(); }
    });
    if (this.on() && Date.now() - (this.cfg().sentAt || 0) > 10 * 60 * 1000) this.touch();
  },

  // ---- the parent's side ----------------------------------------------------

  /** A family link was opened: remember the key, and take it out of the address bar. */
  adoptLink() {
    if (typeof location === "undefined") return false;
    const m = /[#&]family=([A-Z2-9]{20,40})/.exec(location.hash || "");
    if (!m) return false;
    localStorage.setItem(WATCH, JSON.stringify(m[1]));
    try { history.replaceState(null, "", location.pathname); } catch { /* ignore */ }
    return true;
  },
  watching() { return read(WATCH, null); },
  forget() { localStorage.removeItem(WATCH); },

  /** Every profile saved under the family key, newest first. */
  async fetchFamily() {
    const key = this.watching();
    if (!key) return { ok: false, reason: "no-key" };
    try {
      const r = await fetch(`/api/sync?key=${key}`, { cache: "no-store" });
      const j = await r.json();
      if (!j.ok) return j;
      const people = [];
      for (const d of j.devices) for (const p of d.data.profiles || [])
        people.push({ ...p, device: d.device, savedAt: d.data.at || d.savedAt, settings: d.data.settings || {}, log: d.data.log || [] });
      return { ok: true, people: people.sort((a, b) => b.savedAt - a.savedAt) };
    } catch { return { ok: false, reason: "offline" }; }
  },
};
