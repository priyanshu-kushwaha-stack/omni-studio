#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
# Every attack has a few milliseconds of fade so nothing reads as a click on near-silence (core/studio/qc/clicks.py).
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
ff() { ffmpeg -v error -y "$@"; }
# The tag's paper flap as it drops or turns: a filtered noise burst over a short low thump.
ff -f lavfi -i "anoisesrc=d=0.14:c=white:a=0.9" -f lavfi -i "sine=f=170:d=0.14" -filter_complex \
  "[0]highpass=f=1600,lowpass=f=6500,afade=t=in:d=0.012,afade=t=out:st=0.03:d=0.09[n];[1]volume=0.5,afade=t=out:st=0.0:d=0.07[t];[n][t]amix=inputs=2:normalize=0,afade=t=in:d=0.015,lowpass=f=4000,volume=0.28,aresample=48000" flap.wav
# The split-flap flutter of digits and rate boards: tiny clicks over 0.45 s.
ff -f lavfi -i "anoisesrc=d=0.45:c=white:a=0.5" -af "highpass=f=2500,lowpass=f=8000,volume='0.5+0.5*sin(2*PI*22*t)':eval=frame,afade=t=in:d=0.04,afade=t=out:st=0.32:d=0.13,lowpass=f=4000,volume=0.16,aresample=48000" flutter.wav
# The soft tick when a forecast comes true: a small bright knock.
ff -f lavfi -i "aevalsrc='0.6*(1-exp(-t*700))*(sin(2*PI*2100*t)*exp(-t*70)+0.6*sin(2*PI*1050*t)*exp(-t*50))':d=0.16:s=48000" -af "afade=t=out:st=0.1:d=0.06,volume=0.5" tick.wav
# The dull buzz when a tag goes crimson: a low square-ish hum, 0.35 s.
ff -f lavfi -i "aevalsrc='0.5*(1-exp(-t*300))*(sin(2*PI*98*t)+0.45*sin(2*PI*196*t)+0.25*sin(2*PI*294*t))*exp(-t*3)':d=0.38:s=48000" -af "lowpass=f=900,afade=t=in:d=0.01,afade=t=out:st=0.26:d=0.12,volume=0.55" buzz.wav
# A coin dropped into the tin box: two inharmonic metal partials.
ff -f lavfi -i "aevalsrc='0.45*(1-exp(-t*900))*(sin(2*PI*3150*t)+0.6*sin(2*PI*4720*t)+0.4*sin(2*PI*1830*t))*exp(-t*22)':d=0.3:s=48000" -af "afade=t=out:st=0.22:d=0.08,volume=0.6" coin.wav
# The peak's one held note (rules/sound.md #3): a soft low A with its octave, a slow swell and a long release.
ff -f lavfi -i "aevalsrc='0.35*(sin(2*PI*110*t)+0.4*sin(2*PI*220*t)+0.15*sin(2*PI*330*t))*min(1\,t/2.5)*exp(-max(0\,t-9)*0.9)':d=13:s=48000" -af "lowpass=f=900,afade=t=out:st=11.5:d=1.5" peak-note.wav
# The score at the key: the dark theme thinned (rules/sound.md #2: the signal, thinner, at the cost).
ff -i "$out/../music/theme-dark.mp3" -af "highpass=f=180,lowpass=f=1400,volume=1.4" -ar 48000 "$out/../music/theme-dark-thin.wav"
echo "$out"
