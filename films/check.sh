#!/bin/zsh
# films/check.sh <id> "<t1,t2,…>"  — run the HyperFrames gate on one film and tile
# snapshots at the given times into films/<id>/sheet.jpg for a visual read.
CLI=${HF_CLI:-/Users/wealtharchitect/.claude/plugins/cache/hyperframes/hyperframes/0.8.140/skills/hyperframes/scripts/plugin-cli.mjs}
cd "$(dirname "$0")/$1" || exit 1
node $CLI check 2>&1 | sed 's/\x1b\[[0-9;?]*[A-Za-z]//g' | grep -E "✗|⚠ t=|Check (passed|failed)|[1-9][0-9]* error" | grep -v "Fix:" | cut -c1-230
rm -rf snapshots
node $CLI snapshot --at "$2" > /dev/null 2>&1
python3 - <<PY
from PIL import Image
import glob
fs = sorted(glob.glob("snapshots/frame-*.png"))[:len("$2".split(","))]
tiles = [Image.open(f).convert("RGB").resize((800, 450)) for f in fs]
cols = 2; rows = (len(tiles) + 1) // 2
s = Image.new("RGB", (cols * 800, rows * 450), (40, 40, 40))
for i, t in enumerate(tiles): s.paste(t, ((i % cols) * 800, (i // cols) * 450))
s.save("sheet.jpg", quality=80)
print("sheet:", len(tiles), "frames")
PY
