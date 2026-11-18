#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
# The dot's tick: a pen tapped on a desk, a short filtered knock with a 5 ms rise (no click).
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.09:c=white:a=0.8" -f lavfi -i "sine=f=900:d=0.09" -filter_complex \
  "[0]highpass=f=1500,lowpass=f=5000[n];[1]volume=0.4[t];[n][t]amix=inputs=2:normalize=0,afade=t=in:d=0.005,afade=t=out:st=0.015:d=0.06,volume=0.28,aresample=48000" tick.wav
# A phone buzz: two short low hums.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.3*sin(2*PI*170*t)*(lt(mod(t\,0.35)\,0.22))':d=0.6:s=48000" -af "lowpass=f=600,afade=t=in:d=0.01,afade=t=out:st=0.5:d=0.1" buzz.wav
# The roof peak's one held note (rules/sound.md #3): a soft low A with its octave, a slow swell and a long release.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.35*(sin(2*PI*110*t)+0.4*sin(2*PI*220*t)+0.15*sin(2*PI*330*t))*min(1\,t/2.5)*exp(-max(0\,t-8)*0.9)':d=12:s=48000" -af "lowpass=f=900,afade=t=out:st=10.5:d=1.5" peak-note.wav
# The dark city's score: the dark theme thinned (rules/sound.md #2: the signal, thinner, at the cost).
ffmpeg -v error -y -i "$out/../music/theme-dark.mp3" -af "highpass=f=180,lowpass=f=1400,volume=1.4" -ar 48000 "$out/../music/theme-dark-thin.wav"
echo "$out"
