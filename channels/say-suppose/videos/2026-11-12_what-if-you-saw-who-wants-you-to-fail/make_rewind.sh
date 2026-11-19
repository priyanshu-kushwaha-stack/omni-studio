#!/usr/bin/env bash
# The cold open's tape rewind (G4/G3 note, the owner, 2026-11-17: "Tape rewind sound/shot at 0:18 just before the
# script"). Generated, not downloaded: a motor whirr rising, the chattering squeal of tape running backwards past the
# heads, and a soft mechanical stop. Writes assets/sfx/rewind.wav (0.9 s); assets/ is git-ignored, so run this after
# a fresh clone: bash <video>/make_rewind.sh
set -euo pipefail
out="$(cd "$(dirname "$0")" && pwd)/assets/sfx/rewind.wav"
ffmpeg -v error -y -f lavfi \
  -i "aevalsrc='(1-exp(-t*40))*(0.30*sin(2*PI*(700+900*t+260*sin(2*PI*17*t))*t)+0.18*sin(2*PI*(1500+1400*t+400*sin(2*PI*29*t))*t))*(0.75+0.25*sin(2*PI*11*t))':d=0.9:s=44100" \
  -f lavfi -i "anoisesrc=d=0.9:c=pink:a=0.5" \
  -filter_complex "[1]bandpass=f=1800:width_type=h:w=2600,volume=0.55[n];[0][n]amix=inputs=2:normalize=0,highpass=f=180,lowpass=f=6500,afade=t=in:d=0.06,afade=t=out:st=0.78:d=0.12" \
  -ac 1 "$out"
echo "$out"
