#!/usr/bin/env bash
# The G2 story reel at 720p: re-export the shot list (stops on any anchor or order problem), make the music beds and
# wind, bundle with the video's assets as the public dir, render the muted picture in 2,000-frame chunks (a fresh
# process each, retried once, joined losslessly), render the sound alone, and mux with the tools' limiter. Every render
# runs in the render queue (timed). Chunks are rebuilt each run; RESUME=1 keeps chunks from an interrupted run.
#   bash reel/render.sh            # -> renders/reel/reel-720p.mp4
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
V="$(dirname "$HERE")"
W="$(cd "$V/../../../.." && pwd)"
ID="$(basename "$V")"
OUT="$V/renders/reel"
PROPS="$V/assets/narration/props.json"
PY="$W/.venv/bin/python"
export PYTHONPATH="$W/core"

"$PY" "$V/scenes3d/export_shots.py"
bash "$HERE/prep_sound.sh" > /dev/null
[ "${RESUME:-0}" = 1 ] || rm -rf "$OUT/chunks" "$OUT/bundle"
mkdir -p "$OUT/chunks"
cd "$W/core/engines/whatif"
[ -d "$OUT/bundle" ] || npx remotion bundle "$V/reel/index.ts" --out-dir="$OUT/bundle" --public-dir="$V/assets" --log=error
TOTAL=$("$PY" -c "import json;print(json.load(open('$PROPS'))['timeline']['totalFrames'])")
J=("$PY" -m studio.jobs run --channel say-suppose --video "$ID" --queue render)
: > "$OUT/chunks/list.txt"
for ((a = 0; a < TOTAL; a += 2000)); do
  b=$(( a + 1999 < TOTAL - 1 ? a + 1999 : TOTAL - 1 ))
  f="$OUT/chunks/p-$(printf %05d $a).mp4"
  if [ ! -s "$f" ]; then
    for try in 1 2; do
      if "${J[@]}" --step reel_render.picture-720p -- npx remotion render "$OUT/bundle" ReelPicture "$f" --muted \
          --props="$PROPS" --frames="$a-$b" --scale=0.6666666666666666 --timeout=300000 --concurrency=3 --log=error; then
        break
      fi
      rm -f "$f"; echo "chunk $a-$b failed (try $try)"
      [ "$try" = 2 ] && exit 1
    done
  fi
  echo "file '$f'" >> "$OUT/chunks/list.txt"; echo "chunk $a-$b ok"
done
ffmpeg -v error -y -f concat -safe 0 -i "$OUT/chunks/list.txt" -c copy "$OUT/picture.mp4"
"${J[@]}" --step reel_render.audio -- npx remotion render "$OUT/bundle" ReelSound "$OUT/sound.wav" --codec=wav \
  --props="$PROPS" --timeout=300000 --log=error
ffmpeg -v error -y -i "$OUT/picture.mp4" -i "$OUT/sound.wav" -map 0:v -map 1:a -c:v copy \
  -af "alimiter=limit=0.84:level=false" -c:a aac -b:a 256k -shortest "$OUT/reel-720p.mp4"
ffprobe -v error -show_entries stream=width,height:format=duration -of csv=p=0 "$OUT/reel-720p.mp4"
