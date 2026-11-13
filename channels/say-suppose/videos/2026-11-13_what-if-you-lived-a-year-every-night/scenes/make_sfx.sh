#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
# The day counter's split-flap flutter: tiny clicks over 1.2 s (one inside year in one breath).
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=1.2:c=white:a=0.5" -af "highpass=f=2500,lowpass=f=8000,volume='0.5+0.5*sin(2*PI*22*t)':eval=frame,afade=t=in:d=0.04,afade=t=out:st=1.0:d=0.2,lowpass=f=4000,volume=0.18,aresample=48000" flutter.wav
# The click when the flaps stop on 365.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.08:c=white:a=0.9" -af "highpass=f=1200,lowpass=f=3500,afade=t=in:d=0.012,afade=t=out:st=0.02:d=0.05,volume=0.25,aresample=48000" click.wav
# The wall clock's one tick (one night out here): a short woody knock.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.6*sin(2*PI*1800*t)*exp(-t*90)+0.4*sin(2*PI*900*t)*exp(-t*60)':d=0.12:s=48000" -af "afade=t=in:d=0.002,afade=t=out:st=0.08:d=0.04,volume=0.5" tick.wav
# The crate lid tearing in the skit: a paper snap.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.18:c=white:a=0.9" -af "highpass=f=1500,lowpass=f=6000,afade=t=in:d=0.01,afade=t=out:st=0.04:d=0.12,volume=0.3,aresample=48000" snap.wav
# The hatch door: a soft pneumatic hiss and a thud.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.5:c=pink:a=0.6" -f lavfi -i "sine=f=90:d=0.5" -filter_complex "[0]highpass=f=600,lowpass=f=3000,afade=t=in:d=0.05,afade=t=out:st=0.2:d=0.25,volume=0.25[n];[1]afade=t=in:st=0.35:d=0.01,afade=t=out:st=0.37:d=0.12,volume=0.6[t];[n][t]amix=inputs=2:normalize=0,aresample=48000" hatch.wav
# The slow room's one held note under the wordless peak (rules/sound.md #3).
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.35*(sin(2*PI*110*t)+0.4*sin(2*PI*220*t)+0.15*sin(2*PI*330*t))*min(1\,t/2.5)*exp(-max(0\,t-8)*0.9)':d=12:s=48000" -af "lowpass=f=900,afade=t=out:st=10.5:d=1.5" peak-note.wav
echo "$out"
