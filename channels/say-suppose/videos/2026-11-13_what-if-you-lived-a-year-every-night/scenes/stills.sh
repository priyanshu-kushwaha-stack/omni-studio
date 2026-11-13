#!/usr/bin/env bash
# Render frames of the rough cut and tile them into one contact sheet, 3 across, in the order given (left to right, top to bottom).
#   bash scenes/stills.sh <out.png> <frame> [<frame> ...]
# Bundles once, then renders each frame from the bundle. Run from anywhere; uses the engine's node_modules.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
video="$(dirname "$here")"
engine="$(cd "$here/../../../../../core/engines/whatif" && pwd)"
out="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"; shift
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
cd "$engine"
npx remotion bundle "$here/index.ts" --out-dir="$work/bundle" --public-dir="$video/assets" --log=error >/dev/null
inputs=(); filters=""; i=0
for f in "$@"; do
  npx remotion still "$work/bundle" RoughCut "$work/$i.png" --frame="$f" --props="$video/assets/narration/props.json" --log=error --scale=0.5 >/dev/null
  inputs+=(-i "$work/$i.png")
  filters+="[$i]null[v$i];"
  i=$((i + 1))
done
cols=$(( i < 3 ? i : 3 )); rows=$(( (i + 2) / 3 ))
layout=""; for ((k = 0; k < i; k++)); do layout+="$(( (k % 3) * 960 ))_$(( (k / 3) * 540 ))|"; done
if (( i == 1 )); then
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "${filters%;}" -map "[v0]" "$out"
else
  stack=""; for ((k = 0; k < i; k++)); do stack+="[v$k]"; done
  ffmpeg -v error -y "${inputs[@]}" -filter_complex "${filters}${stack}xstack=inputs=$i:layout=${layout%|}:fill=black[o]" -map "[o]" "$out"
fi
echo "$out"
