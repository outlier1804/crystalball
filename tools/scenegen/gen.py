#!/usr/bin/env python3
"""Generate the micro-clips for one scene (or all of them).

Two providers, same interface:

  --provider pexels   FREE. Pulls the closest real stock clip for each shot using
                      the Pexels key already in bridge/.env. The look is wrong on
                      purpose — this exists so the whole pipeline (stitch, poster,
                      in-game playback) can be proven end to end for $0 before any
                      generation money is spent.

  --provider fal      PAID. fal.ai queue API. One key covers Seedance / Veo /
                      Kling / Wan, so the model is a flag, not a rewrite. Needs
                      FAL_KEY in bridge/.env.

Nothing here spends money without --provider fal AND --yes. Default is a dry run
that prints the bill and exits.

  python3 gen.py --scene arc1-intro --provider pexels
  python3 gen.py --scene all --provider fal --model seedance-fast      # cost only
  python3 gen.py --scene arc1-intro --provider fal --model seedance-fast --yes
"""
import argparse, json, os, pathlib, re, sys, time, urllib.parse
import requests

ROOT = pathlib.Path(__file__).resolve().parents[2]          # projects/crystalball
HERE = pathlib.Path(__file__).resolve().parent
RAW = HERE / "raw"
ENV = ROOT.parents[1] / "bridge" / ".env"                    # ~/jarvis/bridge/.env

# fal model paths + published per-second rates (memory/Agents/Media/Media.md,
# repriced 2026-08-05 — re-verify before a funding decision, this segment moves fast).
MODELS = {
    "seedance-fast": ("fal-ai/bytedance/seedance/v2/fast/text-to-video", 0.022),
    "seedance-720":  ("fal-ai/bytedance/seedance/v2/text-to-video",      0.16),
    "wan":           ("fal-ai/wan/v2.6/text-to-video",                   0.07),
    "kling":         ("fal-ai/kling-video/v3/standard/text-to-video",    0.153),
    "veo":           ("fal-ai/veo3.1/text-to-video",                     0.09),
}
REJECT_MULTIPLIER = 3     # usable hit rate on first generation is well under 50%


def load_env():
    if not ENV.exists():
        return {}
    out = {}
    for line in ENV.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def scenes():
    return json.loads((HERE / "scenes.json").read_text())


def pick(doc, which):
    return doc["scenes"] if which == "all" else [s for s in doc["scenes"] if s["id"] == which]


# ----------------------------------------------------------------- pexels (free)
STOPWORDS = set("a an the of in on at with and or to from its their toward into over under "
                "slow gentle push pull tilt orbit tracking shot camera cel shaded anime bold "
                "ink outlines indigo crimson palette seamless loop locked off wide subtle "
                "motion only minimal".split())


def pexels_terms(prompt, n=4):
    words = [w for w in re.findall(r"[a-z]+", prompt.lower()) if w not in STOPWORDS and len(w) > 3]
    seen, out = set(), []
    for w in words:
        if w not in seen:
            seen.add(w); out.append(w)
        if len(out) >= n:
            break
    return " ".join(out)


def gen_pexels(shot, key, out_path):
    q = pexels_terms(shot["prompt"])
    r = requests.get(
        "https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
            {"query": q, "orientation": "landscape", "per_page": 8}),
        headers={"Authorization": key}, timeout=30)
    r.raise_for_status()
    vids = r.json().get("videos") or []
    if not vids:                                   # fall back to a broad term
        r = requests.get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode(
            {"query": "lantern night", "orientation": "landscape", "per_page": 8}),
            headers={"Authorization": key}, timeout=30)
        vids = r.json().get("videos") or []
    if not vids:
        raise RuntimeError(f"no pexels result for '{q}'")
    want = shot["seconds"]
    vid = min(vids, key=lambda v: abs(v.get("duration", 99) - want))
    files = [f for f in vid["video_files"] if f.get("width") and f["width"] <= 1920]
    f = max(files, key=lambda f: f["width"]) if files else vid["video_files"][0]
    with requests.get(f["link"], stream=True, timeout=120) as resp:
        resp.raise_for_status()
        with open(out_path, "wb") as fh:
            for chunk in resp.iter_content(1 << 16):
                fh.write(chunk)
    return f"pexels:{vid['id']} ({q})"


# -------------------------------------------------------------------- fal (paid)
def gen_fal(shot, style, key, model, out_path):
    path, _rate = MODELS[model]
    body = {
        "prompt": f"{shot['prompt']} {style['look']}",
        "negative_prompt": style["negative"],
        "duration": shot["seconds"],
        "resolution": "720p",
        "aspect_ratio": "16:9",
        "generate_audio": False,
    }
    r = requests.post(f"https://queue.fal.run/{path}",
                      headers={"Authorization": f"Key {key}", "Content-Type": "application/json"},
                      json=body, timeout=60)
    r.raise_for_status()
    status_url = r.json()["status_url"]
    resp_url = r.json()["response_url"]
    for _ in range(120):                                    # up to ~10 min
        time.sleep(5)
        st = requests.get(status_url, headers={"Authorization": f"Key {key}"}, timeout=30).json()
        if st.get("status") == "COMPLETED":
            break
        if st.get("status") in ("FAILED", "ERROR"):
            raise RuntimeError(f"fal job failed: {st}")
    else:
        raise RuntimeError("fal job timed out")
    out = requests.get(resp_url, headers={"Authorization": f"Key {key}"}, timeout=60).json()
    url = (out.get("video") or {}).get("url") or out.get("url")
    if not url:
        raise RuntimeError(f"no video url in fal response: {out}")
    with requests.get(url, stream=True, timeout=300) as resp:
        resp.raise_for_status()
        with open(out_path, "wb") as fh:
            for chunk in resp.iter_content(1 << 16):
                fh.write(chunk)
    return f"fal:{model}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", default="all")
    ap.add_argument("--provider", choices=["pexels", "fal"], default="pexels")
    ap.add_argument("--model", choices=list(MODELS), default="seedance-fast")
    ap.add_argument("--yes", action="store_true", help="actually spend money (fal only)")
    a = ap.parse_args()

    doc = scenes()
    chosen = pick(doc, a.scene)
    if not chosen:
        sys.exit(f"no scene '{a.scene}'. Have: {', '.join(s['id'] for s in doc['scenes'])}")
    shots = [(s, sh) for s in chosen for sh in s["shots"]]
    secs = sum(sh["seconds"] for _, sh in shots)

    if a.provider == "fal":
        rate = MODELS[a.model][1]
        one = secs * rate
        print(f"{len(shots)} shots / {secs}s on {a.model} @ ${rate}/s")
        print(f"  one pass:              ${one:,.2f}")
        print(f"  realistic ({REJECT_MULTIPLIER}x retakes): ${one * REJECT_MULTIPLIER:,.2f}")
        if not a.yes:
            print("\nDry run — nothing generated, nothing charged. Re-run with --yes to spend.")
            return

    env = load_env()
    key = env.get("FAL_KEY") if a.provider == "fal" else env.get("PEXELS_API_KEY")
    if not key:
        sys.exit(f"missing {'FAL_KEY' if a.provider == 'fal' else 'PEXELS_API_KEY'} in {ENV}")

    RAW.mkdir(exist_ok=True)
    ledger = []
    for scene, shot in shots:
        out = RAW / f"{shot['id']}.mp4"
        if out.exists():
            print(f"  = {shot['id']} already there, skipping")
            continue
        try:
            src = (gen_pexels(shot, key, out) if a.provider == "pexels"
                   else gen_fal(shot, doc["style"], key, a.model, out))
            size = out.stat().st_size // 1024
            print(f"  + {shot['id']:8s} {size:>6d} KB  {src}")
            ledger.append({"shot": shot["id"], "scene": scene["id"], "src": src,
                           "seconds": shot["seconds"]})
        except Exception as e:
            print(f"  ! {shot['id']} FAILED: {e}")

    if ledger:
        p = HERE / "ledger.jsonl"
        with open(p, "a") as fh:
            for row in ledger:
                fh.write(json.dumps(row) + "\n")
        print(f"\n{len(ledger)} clips -> {RAW}  (logged to {p.name})")


if __name__ == "__main__":
    main()
