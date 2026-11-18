#!/usr/bin/env bash
# Render the Foundation panels at half size, one at a time (low load), and tile them 3 across into a contact sheet.
#   bash scenes/foundation/sheet.sh [<frame> ...]     (default: every panel)
# Writes renders/foundation/<frame>.png and renders/foundation/sheet.jpg. Uses the engine's node_modules.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
video="$(cd "$here/../.." && pwd)"
engine="$(cd "$here/../../../../../../core/engines/whatif" && pwd)"
out="$video/renders/foundation"; mkdir -p "$out"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
cd "$engine"
npx remotion bundle "$here/index.ts" --out-dir="$work/bundle" --log=error >/dev/null
frames=("$@")
if (( ${#frames[@]} == 0 )); then
  n=$(grep -c '{ label: "' "$here/Root.tsx")
  frames=($(seq 0 $((n - 1))))
fi
for f in "${frames[@]}"; do
  npx remotion still "$work/bundle" Foundation "$out/$f.png" --frame="$f" --scale=0.5 --concurrency=1 --log=error >/dev/null
  echo "panel $f"
done
inputs=(); stack=""; layout=""; i=0
for p in $(ls "$out" | grep -E '^[0-9]+\.png$' | sort -n); do
  inputs+=(-i "$out/$p"); stack+="[$i]"; layout+="$(( (i % 3) * 960 ))_$(( (i / 3) * 540 ))|"; i=$((i + 1))
done
ffmpeg -v error -y "${inputs[@]}" -filter_complex "${stack}xstack=inputs=$i:layout=${layout%|}:fill=black[o]" -map "[o]" -q:v 3 "$out/sheet.jpg"
echo "$out/sheet.jpg"
