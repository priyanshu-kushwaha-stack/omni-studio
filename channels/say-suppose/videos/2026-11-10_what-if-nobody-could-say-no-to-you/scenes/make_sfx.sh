#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
# The YES tag's paper snap: a filtered noise burst over a short low thump.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.12:c=white:a=0.9" -f lavfi -i "sine=f=180:d=0.12" -filter_complex \
  "[0]highpass=f=1800,lowpass=f=7000,afade=t=out:st=0.005:d=0.07[n];[1]volume=0.5,afade=t=out:st=0.0:d=0.06[t];[n][t]amix=inputs=2:normalize=0,afade=t=in:d=0.002,volume=0.6,aresample=48000" snap.wav
# The mother's slow, soft flip.
ffmpeg -v error -y -i snap.wav -af "atempo=0.5,lowpass=f=3500,volume=0.6,afade=t=out:st=0.05:d=0.18" snap-soft.wav
echo "$out"
