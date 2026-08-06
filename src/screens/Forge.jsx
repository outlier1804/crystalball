import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../store.jsx";
import { Forge, UPGRADES, LINES } from "../engine/upgrades.js";
import { Sound } from "../engine/audio.js";
import { FX } from "../engine/fx.js";

// ====== The Forge ========================================================
//
// The screen that answers "why should I read another lesson?" with a shelf of
// things he wants and cannot buy yet. Three states per card, and the state is
// the whole design:
//
//   FORGED   — owned, glowing, effect listed in plain words
//   READY    — learned AND affordable: the card pulses and begs to be tapped
//   SAVING   — learned but broke: shows exactly how many scrolls short he is
//   LOCKED   — not learned: shows the ARC that unlocks it, and taps through to it
//
// A locked card never says "locked". It says "pass Arc 4's quiz" and takes him
// there. That's the whole loop in one tap.

export default function ForgeScreen() {
  const { bump, popup, go } = useApp();
  const s = Forge.summary();
  const [justForged, setJustForged] = useState(null);
  const anvilRef = useRef(null);

  function doForge(u, e) {
    const el = e.currentTarget;
    if (!Forge.canForge(u)) {
      // Not a dead tap — send him at the thing that WOULD unlock it.
      Sound.play("wrong");
      FX.shake(el);
      if (u.arc) go("map");
      return;
    }
    Sound.play("powerup");
    Forge.forge(u.id);
    setJustForged(u);
    // The forge strike: sparks, a shockwave, a screen flash, a slow bloom.
    FX.sparks(el, 40);
    FX.shockwave(el, "#ffd34f");
    FX.stars(...FX.centerOf(el), 22);
    FX.flash("#ffb13d", 520);
    FX.comboPop(`${u.emoji} FORGED!`, u.name);
    FX.shake(document.body);
    bump();
    setTimeout(() => setJustForged(null), 2600);
  }

  const grouped = Object.keys(LINES).map((k) => ({
    key: k, ...LINES[k],
    items: UPGRADES.filter((u) => u.line === k).sort((a, b) => a.tier - b.tier),
  }));

  return (
    <div className="screen forge-screen">
      {/* ── The anvil header: scrolls, progress, and the ONE next goal ──── */}
      <motion.div className="forge-hero" ref={anvilRef}
        initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }}>
        <div className="forge-embers" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <motion.span key={i} className="ember"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: -90 - (i % 5) * 26, opacity: [0, 1, 0], x: (i % 3 - 1) * 22 }}
              transition={{ repeat: Infinity, duration: 2.6 + (i % 4) * 0.7, delay: i * 0.22, ease: "easeOut" }}
              style={{ left: `${6 + i * 6.6}%` }} />
          ))}
        </div>

        <h2 className="forge-title">🔨 The Forge</h2>
        <p className="forge-sub">Gear is not bought with luck. It is earned with lessons.</p>

        <motion.div className="scroll-purse"
          key={s.scrolls}
          initial={{ scale: 1.35 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 12 }}>
          <span className="scroll-emoji">📜</span>
          <span className="scroll-n">{s.scrolls}</span>
          <span className="scroll-word">scrolls</span>
        </motion.div>

        <div className="forge-progress">
          <div className="forge-progress-bar">
            <motion.div className="forge-progress-fill"
              initial={{ width: 0 }} animate={{ width: `${(s.have / s.total) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }} />
          </div>
          <span>{s.have} / {s.total} pieces forged</span>
        </div>

        {/* The single most important line on the screen. */}
        <NextGoal s={s} go={go} />
      </motion.div>

      {/* ── The five lines of gear ─────────────────────────────────────── */}
      {grouped.map((g, gi) => (
        <motion.section key={g.key} className="forge-line"
          initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * gi, duration: 0.4 }}>
          <header className="forge-line-head">
            <span className="forge-line-emoji">{g.emoji}</span>
            <div>
              <h3>{g.name}</h3>
              <p>{g.blurb}</p>
            </div>
          </header>

          <div className="forge-row">
            {g.items.map((u, i) => {
              const owned = Forge.owned(u.id);
              const ready = Forge.canForge(u);
              const reason = Forge.lockReason(u);
              const saving = Forge.isAffordableSoon(u);
              const cls = owned ? "forged" : ready ? "ready" : saving ? "saving" : "locked";
              return (
                <motion.button key={u.id}
                  className={`forge-card ${cls}`}
                  onClick={(e) => doForge(u, e)}
                  disabled={owned}
                  initial={{ opacity: 0, scale: 0.9, rotateY: -18 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.06 * gi + 0.07 * i, type: "spring", stiffness: 220, damping: 18 }}
                  whileHover={owned ? { y: -4 } : { y: -7, scale: 1.03, rotateX: 4 }}
                  whileTap={owned ? {} : { scale: 0.95 }}>

                  {/* the sweeping shine on anything he can actually forge */}
                  {ready && <span className="forge-shine" />}
                  {owned && <span className="forge-halo" />}

                  <div className="forge-card-top">
                    <motion.span className="forge-emoji"
                      animate={ready ? { scale: [1, 1.14, 1], rotate: [0, -6, 6, 0] }
                             : owned ? { y: [0, -3, 0] } : {}}
                      transition={{ repeat: Infinity, duration: ready ? 1.5 : 3 }}>
                      {u.emoji}
                    </motion.span>
                    <span className="forge-tier">Tier {u.tier}</span>
                  </div>

                  <h4>{u.name}</h4>
                  <p className="forge-desc">{u.desc}</p>
                  <p className="forge-flavor">“{u.flavor}”</p>

                  <div className="forge-card-foot">
                    {owned ? (
                      <span className="forge-tag done">✅ Equipped</span>
                    ) : ready ? (
                      <span className="forge-tag go">🔨 FORGE — {u.cost} 📜</span>
                    ) : saving ? (
                      <span className="forge-tag save">📜 {Forge.scrolls()} / {u.cost} — keep learning!</span>
                    ) : (
                      <span className="forge-tag lock">🔒 {reason}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      ))}

      {/* ── The forged-it cinematic ────────────────────────────────────── */}
      <AnimatePresence>
        {justForged && (
          <motion.div className="forge-cinematic"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="forge-cine-card"
              initial={{ scale: 0.3, rotate: -14, y: 40 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 14 }}>
              <motion.span className="forge-cine-emoji"
                animate={{ scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.9, repeat: 2 }}>
                {justForged.emoji}
              </motion.span>
              <div className="forge-cine-label">FORGED</div>
              <div className="forge-cine-name">{justForged.name}</div>
              <div className="forge-cine-desc">{justForged.desc}</div>
              <motion.div className="forge-cine-cta"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                Take it to the Dojo →
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// One sentence telling him precisely what to go do next, and a button that
// does it. Ordering matters: something he can forge RIGHT NOW beats a goal.
function NextGoal({ s, go }) {
  if (s.nextBuyable) {
    return (
      <motion.div className="forge-next ready"
        animate={{ scale: [1, 1.03, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
        🔨 You have enough for <strong>{s.nextBuyable.emoji} {s.nextBuyable.name}</strong> — forge it!
      </motion.div>
    );
  }
  if (s.nextSaving) {
    const short = s.nextSaving.cost - s.scrolls;
    return (
      <div className="forge-next">
        <strong>{s.nextSaving.emoji} {s.nextSaving.name}</strong> is {short} 📜 away.
        <button className="ghost-btn tiny" onClick={() => go("map")}>Earn scrolls →</button>
      </div>
    );
  }
  if (s.nextLearn) {
    return (
      <div className="forge-next">
        🔒 <strong>{s.nextLearn.emoji} {s.nextLearn.name}</strong> unlocks when you pass that arc's quiz.
        <button className="ghost-btn tiny" onClick={() => go("map")}>Go learn it →</button>
      </div>
    );
  }
  return <div className="forge-next done">👑 Every piece forged. You are a Grandmaster.</div>;
}
