#!/usr/bin/env python3
"""Stitch a scene's micro-clips into one web-ready video for the game.

  python3 stitch.py --scene arc1-intro
  python3 stitch.py --scene all

Per scene: normalise every shot to 1280x720 / 24fps / silent, crossfade them
together, fade in and out, encode a faststart H.264 mp4, and cut a poster JPG so
the game shows a still instantly and never a black box while the video loads.

Loop scenes (ambient backgrounds) skip the fades and instead crossfade the tail
back over the head, which is what makes a 6s loop not visibly jump.

Output: public/vid/<scene>.mp4 + public/vid/<scene>.jpg — exactly what
SceneVideo.jsx looks for. No video present = the game falls back to its PNG art,
so this is additive and can never break a build.
"""
import argparse, json, pathlib, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
RAW = HERE / "raw"
OUT = ROOT / "public" / "vid"
W, H, FPS = 1280, 720, 24
XFADE = 0.6          # crossfade between shots, seconds


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(p.stderr[-1500:])
    return p


def dur(path):
    p = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(path)])
    return float(p.stdout.strip())


def normalise(src, dst, seconds):
    """Same size, same fps, no audio, exact length — xfade refuses mixed inputs."""
    vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
          f"crop={W}:{H},fps={FPS},setsar=1,format=yuv420p")
    run(["ffmpeg", "-y", "-t", str(seconds), "-i", str(src),
         "-an", "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
         str(dst)])


def concat_xfade(parts, dst):
    """Chain the clips with crossfades. One filter graph, one pass."""
    if len(parts) == 1:
        run(["ffmpeg", "-y", "-i", str(parts[0]), "-c", "copy", str(dst)])
        return
    inputs = []
    for p in parts:
        inputs += ["-i", str(p)]
    graph, prev, offset = [], "[0:v]", dur(parts[0]) - XFADE
    for i, p in enumerate(parts[1:], start=1):
        label = f"[x{i}]"
        graph.append(f"{prev}[{i}:v]xfade=transition=fade:duration={XFADE}:offset={offset:.3f}{label}")
        prev = label
        if i < len(parts) - 1:
            offset += dur(p) - XFADE
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(graph),
         "-map", prev, "-c:v", "libx264", "-preset", "medium", "-crf", "22",
         "-pix_fmt", "yuv420p", str(dst)])


def polish(src, dst, loop):
    total = dur(src)
    if loop:
        # Seamless: overlap the last XFADE seconds back onto the first, so the
        # wrap-around is a dissolve instead of a cut.
        vf = (f"split[a][b];[a]trim=0:{total - XFADE:.3f},setpts=PTS-STARTPTS[main];"
              f"[b]trim={total - XFADE:.3f}:{total:.3f},setpts=PTS-STARTPTS[tail];"
              f"[main][tail]xfade=transition=fade:duration={XFADE}:offset={total - 2 * XFADE:.3f}")
    else:
        vf = f"fade=t=in:st=0:d=0.5,fade=t=out:st={max(0, total - 0.7):.3f}:d=0.7"
    run(["ffmpeg", "-y", "-i", str(src), "-an", "-filter_complex", vf,
         "-c:v", "libx264", "-preset", "medium", "-crf", "23",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dst)])


def poster(src, dst):
    run(["ffmpeg", "-y", "-ss", "0.6", "-i", str(src), "-frames:v", "1",
         "-q:v", "4", str(dst)])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", default="all")
    a = ap.parse_args()

    doc = json.loads((HERE / "scenes.json").read_text())
    todo = doc["scenes"] if a.scene == "all" else [s for s in doc["scenes"] if s["id"] == a.scene]
    if not todo:
        sys.exit(f"no scene '{a.scene}'")

    OUT.mkdir(parents=True, exist_ok=True)
    tmp = HERE / "tmp"
    tmp.mkdir(exist_ok=True)
    made = 0

    for scene in todo:
        srcs = [RAW / f"{sh['id']}.mp4" for sh in scene["shots"]]
        missing = [p.name for p in srcs if not p.exists()]
        if missing:
            print(f"  - {scene['id']}: skipped, missing {', '.join(missing)} (run gen.py first)")
            continue
        print(f"  · {scene['id']}: {len(srcs)} shots")
        parts = []
        for sh, src in zip(scene["shots"], srcs):
            n = tmp / f"n-{sh['id']}.mp4"
            normalise(src, n, sh["seconds"])
            parts.append(n)
        joined = tmp / f"j-{scene['id']}.mp4"
        concat_xfade(parts, joined)
        final = OUT / f"{scene['id']}.mp4"
        polish(joined, final, scene.get("loop", False))
        poster(final, OUT / f"{scene['id']}.jpg")
        kb = final.stat().st_size // 1024
        print(f"    -> public/vid/{final.name}  {dur(final):.1f}s  {kb} KB")
        made += 1

    for f in tmp.glob("*.mp4"):
        f.unlink()
    print(f"\n{made} scene video(s) ready in public/vid/")


if __name__ == "__main__":
    main()
