#!/bin/zsh
# films/render.sh <id> [<id> …] — render each film, then install it in the game as
# public/vid/film-<id>.mp4 (720p) with a poster, and refresh the video manifest.
# The bundled headless shell times out on this Mac, so point at the installed Chrome.
CLI=${HF_CLI:-/Users/wealtharchitect/.claude/plugins/cache/hyperframes/hyperframes/0.8.140/skills/hyperframes/scripts/plugin-cli.mjs}
export HYPERFRAMES_BROWSER_PATH="${HYPERFRAMES_BROWSER_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for id in "$@"; do
  cd "$ROOT/films/$id" || continue
  mkdir -p renders
  node $CLI render --quality looks --output renders/$id.mp4 > renders/render.log 2>&1
  if [[ ! -s renders/$id.mp4 ]]; then echo "FAILED $id (see films/$id/renders/render.log)"; continue; fi
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 renders/$id.mp4)
  ffmpeg -v error -y -i renders/$id.mp4 -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$ROOT/public/vid/film-$id.mp4"
  ffmpeg -v error -y -ss $(( ${d%.*} - 2 )) -i renders/$id.mp4 -frames:v 1 -vf scale=1280:720 "$ROOT/public/vid/film-$id.jpg"
  echo "OK $id ${d}s -> public/vid/film-$id.mp4"
done
cd "$ROOT" && node tools/gen-video-manifest.mjs
