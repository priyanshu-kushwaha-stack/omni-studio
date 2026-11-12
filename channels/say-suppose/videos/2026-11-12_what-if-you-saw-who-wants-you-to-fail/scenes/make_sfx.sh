#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
# The meter's paper snap as the card unfolds: a filtered noise burst over a short low thump.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.12:c=white:a=0.9" -f lavfi -i "sine=f=180:d=0.12" -filter_complex \
  "[0]highpass=f=1800,lowpass=f=7000,afade=t=in:d=0.012,afade=t=out:st=0.02:d=0.08[n];[1]volume=0.5,afade=t=out:st=0.0:d=0.06[t];[n][t]amix=inputs=2:normalize=0,afade=t=in:d=0.015,lowpass=f=4000,volume=0.3,aresample=48000" snap.wav
# Ji-yoon's cards: the same snap, slower and softer.
ffmpeg -v error -y -i snap.wav -af "atempo=0.5,lowpass=f=3500,volume=0.6,afade=t=out:st=0.05:d=0.18" snap-soft.wav
# The split-flap flutter: twelve tiny clicks over 0.6 s.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.6:c=white:a=0.5" -af "highpass=f=2500,lowpass=f=8000,volume='0.5+0.5*sin(2*PI*20*t)':eval=frame,afade=t=in:d=0.04,afade=t=out:st=0.45:d=0.15,lowpass=f=4000,volume=0.18,aresample=48000" flutter.wav
# The click when the flaps stop.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.08:c=white:a=0.9" -af "highpass=f=1200,lowpass=f=3500,afade=t=in:d=0.012,afade=t=out:st=0.02:d=0.05,volume=0.25,aresample=48000" click.wav
# A very low room tone under the whole film (style.md, sound: an ambience bed), about -60 dBFS, 10 s, looped by Film.tsx.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=10:c=pink:a=0.004,lowpass=f=3000,aresample=48000" -af "afade=t=in:d=0.05,afade=t=out:st=9.95:d=0.05" roomtone.wav
echo "$out"
