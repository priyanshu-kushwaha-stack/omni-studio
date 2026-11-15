#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
# Every attack has a few milliseconds of fade so nothing reads as a click on near-silence (core/studio/qc/clicks.py).
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
ff() { ffmpeg -v error -y "$@"; }
# The tag's paper flap as it drops or turns: a filtered noise burst over a short low thump.
ff -f lavfi -i "anoisesrc=d=0.16:c=white:a=0.9" -f lavfi -i "sine=f=170:d=0.16" -filter_complex \
  "[0]highpass=f=1600,lowpass=f=6500,afade=t=in:d=0.012,afade=t=out:st=0.03:d=0.09[n];[1]volume=0.3,afade=t=in:d=0.012,afade=t=out:st=0.0:d=0.14[t];[n][t]amix=inputs=2:normalize=0,afade=t=in:d=0.015,lowpass=f=4000,volume=0.28,aresample=48000" flap.wav
# The split-flap flutter of digits and rate boards: tiny clicks over 0.45 s.
ff -f lavfi -i "anoisesrc=d=0.45:c=white:a=0.5" -af "highpass=f=2500,lowpass=f=8000,volume='0.5+0.5*sin(2*PI*22*t)':eval=frame,afade=t=in:d=0.04,afade=t=out:st=0.32:d=0.13,lowpass=f=4000,volume=0.16,aresample=48000" flutter.wav
# The soft tick when a forecast comes true: a dull knock with a 20 ms rise and a 0.3 s ring. The clicks check flags any
# burst under 80 ms that stands 15 dB over its surroundings, so the decay must be long (a 45/s decay failed qc on the
# first cut).
ff -f lavfi -i "aevalsrc='0.6*min(1\,t/0.02)*(sin(2*PI*1600*t)*exp(-t*10)+0.7*sin(2*PI*800*t)*exp(-t*8))':d=0.3:s=48000" -af "lowpass=f=2400,afade=t=out:st=0.22:d=0.08,volume=0.22" tick.wav
# The dull buzz when a tag goes crimson: a low square-ish hum, 0.35 s.
ff -f lavfi -i "aevalsrc='0.5*min(1\,t/0.012)*(sin(2*PI*98*t)+0.45*sin(2*PI*196*t)+0.25*sin(2*PI*294*t))*exp(-t*3)':d=0.38:s=48000" -af "lowpass=f=700,afade=t=in:d=0.02,afade=t=out:st=0.26:d=0.12,volume=0.45" buzz.wav
# A coin dropped into the tin box: two inharmonic metal partials.
ff -f lavfi -i "aevalsrc='0.45*min(1\,t/0.015)*(sin(2*PI*3150*t)+0.6*sin(2*PI*4720*t)+0.4*sin(2*PI*1830*t))*exp(-t*9)':d=0.45:s=48000" -af "afade=t=out:st=0.33:d=0.12,volume=0.45" coin.wav
# The peak's one held note (rules/sound.md #3): a soft low A with its octave, a slow swell and a long release.
ff -f lavfi -i "aevalsrc='0.35*(sin(2*PI*110*t)+0.4*sin(2*PI*220*t)+0.15*sin(2*PI*330*t))*min(1\,t/2.5)*exp(-max(0\,t-9)*0.9)':d=13:s=48000" -af "lowpass=f=900,afade=t=out:st=11.5:d=1.5" peak-note.wav
# The score at the key: the dark theme thinned (rules/sound.md #2: the signal, thinner, at the cost).
ff -i "$out/../music/theme-dark.mp3" -af "highpass=f=180,lowpass=f=1400,volume=1.4" -ar 48000 "$out/../music/theme-dark-thin.wav"
# v2 (2026-11-14): the sounds the script names (cues.yaml fx). Each has a soft attack and a long tail so none reads as
# a click on near-silence (core/studio/qc/clicks.py flags bursts under 80 ms).
# A cup or plate scraped across steel: band-passed noise swept down, 0.45 s.
ff -f lavfi -i "anoisesrc=d=0.45:c=pink:a=0.8" -af "bandpass=f=2200:w=1400,volume='1-0.6*t/0.45':eval=frame,afade=t=in:d=0.04,afade=t=out:st=0.25:d=0.2,volume=0.35,aresample=48000" scrape.wav
# Paper torn: crackled bright noise, 0.35 s.
ff -f lavfi -i "anoisesrc=d=0.4:c=white:a=0.8" -af "highpass=f=1800,volume='0.75+0.25*sin(2*PI*55*t)':eval=frame,afade=t=in:d=0.07,afade=t=out:st=0.14:d=0.26,volume=0.3,aresample=48000" tear.wav
# Train doors: a soft pneumatic hiss, 0.7 s.
ff -f lavfi -i "anoisesrc=d=0.7:c=pink:a=0.7" -af "highpass=f=900,lowpass=f=6000,afade=t=in:d=0.08,afade=t=out:st=0.35:d=0.35,volume=0.3,aresample=48000" hiss.wav
# A shutter rolled down: a rattle of small metal knocks over 1.2 s.
ff -f lavfi -i "anoisesrc=d=1.2:c=brown:a=0.9" -af "bandpass=f=900:w=700,volume='0.5+0.5*sin(2*PI*18*t)':eval=frame,afade=t=in:d=0.1,afade=t=out:st=0.8:d=0.4,volume=0.45,aresample=48000" rattle.wav
# The shutter stopping: a dull metal clank with a long ring, 0.5 s.
ff -f lavfi -i "aevalsrc='0.5*min(1\,t/0.02)*(sin(2*PI*220*t)+0.5*sin(2*PI*587*t))*exp(-t*7)':d=0.5:s=48000" -af "lowpass=f=1500,afade=t=out:st=0.35:d=0.15,volume=0.4" clank.wav
# A cup set down: a soft ceramic knock with a 0.3 s ring.
ff -f lavfi -i "aevalsrc='0.5*min(1\,t/0.02)*(sin(2*PI*1200*t)*exp(-t*12)+0.6*sin(2*PI*700*t)*exp(-t*9))':d=0.3:s=48000" -af "lowpass=f=2600,afade=t=out:st=0.22:d=0.08,volume=0.25" clack.wav
echo "$out"
