#!/usr/bin/env python3
"""Pre-render every spoken line in Candle Quest as a shipped mp3.

Replaces the browser's built-in speechSynthesis (a robot reading to a 10-year-old)
with a real neural voice per character, rendered ahead of time so the game keeps
working offline, with no API key and no network call from the browser.

Engine: Kokoro-82M via ~/jarvis/bridge/tts.py — local, $0, Apache-2.0 weights
(full commercial rights, unlike the ElevenLabs free tier). Pass --engine elevenlabs
if a paid key ever lands in bridge/.env; the cast's `voice` names are Kokoro's, so
that route needs ELEVENLABS_VOICE_ID overrides per character.

The cast (which voice plays whom) lives in src/engine/speech.js, NOT here.

  node tools/vogen/lines.mjs > /tmp/lines.json   # done automatically
  python3 tools/vogen/gen.py                     # incremental: only new/changed lines
  python3 tools/vogen/gen.py --force             # re-render everything
  python3 tools/vogen/gen.py --limit 3           # smoke test

Writes:
  public/vo/*.mp3                  the audio, ~1 file per line
  public/vo/.render.json           what was rendered with which voice (change detection)
  src/engine/vo-manifest.js        key -> filename, bundled by vite (no fetch, works on file://)
"""
import argparse
import hashlib
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import time

HERE = pathlib.Path(__file__).resolve().parent
PROJECT = HERE.parents[1]                        # projects/crystalball
JARVIS = PROJECT.parents[1]                      # ~/jarvis
VO_DIR = PROJECT / "public" / "vo"
STATE = VO_DIR / ".render.json"
MANIFEST = PROJECT / "src" / "engine" / "vo-manifest.js"

sys.path.insert(0, str(JARVIS / "bridge"))

MAX_CHUNK = 300          # chars; Kokoro degrades on very long single passes
GAP = 0.12               # seconds of silence between sentence chunks


def sh(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def load_lines():
    """Ask lines.mjs for the game's dialogue. Node owns the parsing; we just render."""
    r = subprocess.run(["node", str(HERE / "lines.mjs")], cwd=PROJECT,
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"lines.mjs failed:\n{r.stderr.strip()}")
    return json.loads(r.stdout)


def chunk(text):
    """Split on sentence boundaries so no single Kokoro pass exceeds MAX_CHUNK."""
    if len(text) <= MAX_CHUNK:
        return [text]
    parts, cur = [], ""
    for piece in re.split(r"(?<=[.!?])\s+", text):
        if cur and len(cur) + 1 + len(piece) > MAX_CHUNK:
            parts.append(cur)
            cur = piece
        else:
            cur = f"{cur} {piece}".strip()
    if cur:
        parts.append(cur)
    return parts


# The cast in speech.js names Kokoro voices. ElevenLabs needs its own ids, so map
# them here rather than polluting the cast — speech.js stays the single source of
# truth for WHO speaks, this file just knows what that sounds like per engine.
#
# Sensei Hoshi is deliberately the same George used for the lesson films, so the
# teacher sounds like the teacher wherever the boy meets him.
ELEVEN_VOICES = {
    "bm_george": "JBFqnCBsd6RMkjVDRZzb",   # Sensei Hoshi — warm British storyteller
    "af_bella":  "FGY2WhTYpPnrIDTdsKH5",   # Kitsu the Fox — bright, quirky, young
    "am_puck":   "IKne3meq5aSn9XLyUdCD",   # Rival Kazuo — confident, energetic
    "af_heart":  "JBFqnCBsd6RMkjVDRZzb",   # narrator falls back to the sensei voice
}


def render(line, engine, tmp):
    """Synthesize one line to mp3 in public/vo/. Returns (filename, seconds)."""
    from tts import synth   # noqa: E402  (needs the sys.path insert above)

    name = hashlib.sha1(line["key"].encode()).hexdigest()[:16] + ".mp3"
    dest = VO_DIR / name
    pieces = chunk(line["text"])

    wavs = []
    for i, piece in enumerate(pieces):
        w = tmp / f"{name}.{i}.wav"
        voice = line["voice"]
        if engine == "elevenlabs":
            voice = ELEVEN_VOICES.get(voice, ELEVEN_VOICES["bm_george"])
        synth(piece, str(w), engine=engine, voice=voice, speed=line["speed"])
        wavs.append(w)

    joined = tmp / f"{name}.all.wav"
    if len(wavs) == 1:
        shutil.copy(wavs[0], joined)
    else:
        # concat with a short breath between sentences
        sil = tmp / "gap.wav"
        if not sil.exists():
            sh(["ffmpeg", "-v", "error", "-y", "-f", "lavfi",
                "-i", f"anullsrc=r=48000:cl=mono", "-t", str(GAP),
                "-c:a", "pcm_s16le", str(sil)])
        listing = tmp / f"{name}.txt"
        seq = []
        for w in wavs:
            seq.append(w)
            seq.append(sil)
        listing.write_text("".join(f"file '{p}'\n" for p in seq[:-1]))
        sh(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0",
            "-i", str(listing), "-c", "copy", str(joined)])

    # mono 48 kbps mp3: speech-transparent, ~350 KB per minute, universally playable
    sh(["ffmpeg", "-v", "error", "-y", "-i", str(joined),
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-c:a", "libmp3lame", "-b:a", "48k", "-ar", "44100", "-ac", "1", str(dest)])

    secs = float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "default=nw=1:nk=1", str(dest)]).stdout.strip())
    if secs < 0.15:
        sys.exit(f"{name} came out {secs:.2f}s — refusing to ship a silent line")
    for w in wavs + [joined]:
        w.unlink(missing_ok=True)
    return name, secs


def write_manifest(state):
    body = {v["key"]: v["file"] for v in state.values()}
    lines = ["// GENERATED by tools/vogen/gen.py — do not edit by hand.",
             "// Maps \"<character>|<spoken text>\" to a file in public/vo/.",
             "// Anything missing here falls back to the browser's built-in voice.",
             "export const VO = {"]
    for k in sorted(body):
        lines.append(f"  {json.dumps(k)}: {json.dumps(body[k])},")
    lines.append("};")
    MANIFEST.write_text("\n".join(lines) + "\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--engine", default="kokoro", choices=["kokoro", "elevenlabs"])
    ap.add_argument("--force", action="store_true", help="re-render lines that already exist")
    ap.add_argument("--limit", type=int, help="only do the first N lines (smoke test)")
    args = ap.parse_args()

    lines = load_lines()
    if args.limit:
        lines = lines[:args.limit]

    VO_DIR.mkdir(parents=True, exist_ok=True)
    tmp = VO_DIR / ".tmp"
    tmp.mkdir(exist_ok=True)
    state = json.loads(STATE.read_text()) if STATE.exists() and not args.force else {}

    # The ENGINE is part of the identity of a rendered line. Without it, switching
    # kokoro -> elevenlabs detected no change (the cast's voice name is the same
    # either way) and re-rendered nothing, silently leaving the old robot audio.
    todo = [l for l in lines
            if l["key"] not in state
            or state[l["key"]].get("voice") != l["voice"]
            or state[l["key"]].get("engine", "kokoro") != args.engine
            or state[l["key"]].get("speed") != l["speed"]
            or not (VO_DIR / state[l["key"]]["file"]).exists()]

    print(f"{len(lines)} lines total, {len(todo)} to render ({args.engine})", flush=True)
    t0 = time.time()
    for i, line in enumerate(todo, 1):
        name, secs = render(line, args.engine, tmp)
        state[line["key"]] = {"key": line["key"], "file": name, "voice": line["voice"],
                              "speed": line["speed"], "secs": round(secs, 2),
                              "who": line["who"], "src": line["src"]}
        print(f"  [{i}/{len(todo)}] {line['src']:<22} {line['voice']:<10} "
              f"{secs:5.1f}s  {line['text'][:52]}", flush=True)

    # drop audio for lines that no longer exist in the game
    live = {l["key"] for l in lines}
    for key in [k for k in state if k not in live]:
        (VO_DIR / state[key]["file"]).unlink(missing_ok=True)
        del state[key]

    STATE.write_text(json.dumps(state, indent=2))
    write_manifest(state)
    shutil.rmtree(tmp, ignore_errors=True)

    total = sum(v["secs"] for v in state.values())
    size = sum(f.stat().st_size for f in VO_DIR.glob("*.mp3"))
    print(f"\ndone in {time.time() - t0:.0f}s — {len(state)} lines, "
          f"{total / 60:.1f} min of audio, {size / 1e6:.1f} MB in public/vo/")


if __name__ == "__main__":
    main()
