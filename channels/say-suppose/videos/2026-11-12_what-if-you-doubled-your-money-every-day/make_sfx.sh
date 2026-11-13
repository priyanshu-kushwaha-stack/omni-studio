#!/usr/bin/env bash
# The film's effects, synthesised with ffmpeg (style.md: effects are made, not downloaded), v4 (2026-11-13): until v3
# the film had no effects at all. Each has a soft attack and release (no-audio-clicks.md). assets/ is git-ignored;
# run once per machine:  bash <this video>/make_sfx.sh
# Where they play: the `sfx` of each shot in scenes/shots.tsx, and the tag flutter and card snap in scenes/Film.tsx.
set -euo pipefail
out="$(cd "$(dirname "$0")" && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
fx() { ffmpeg -v error -y "$@"; }
# Your phone tapped on the card reader: one soft high beep.
fx -f lavfi -i "sine=f=1760:d=0.11" -af "afade=t=in:d=0.008,afade=t=out:st=0.06:d=0.05,volume=0.25,aresample=48000" tap.wav
# Declined: two low buzzes, a square-ish tone with its odd partials.
fx -f lavfi -i "aevalsrc='(sin(2*PI*330*t)+0.33*sin(2*PI*990*t)+0.2*sin(2*PI*1650*t))*(lt(mod(t\,0.24)\,0.15))':d=0.46:s=48000" \
  -af "lowpass=f=2500,afade=t=in:d=0.01,afade=t=out:st=0.38:d=0.08,volume=0.22" declined.wav
# The midnight rip, the rule's sound (rules/sound.md #8): paper tearing, a crackle of noise in short grains.
fx -f lavfi -i "anoisesrc=d=0.5:c=white:a=0.9" -af "highpass=f=900,lowpass=f=7000,volume='0.35+0.65*gt(sin(2*PI*37*t)+0.6*sin(2*PI*61*t)\,0.2)':eval=frame,afade=t=in:d=0.03,afade=t=out:st=0.3:d=0.2,lowpass=f=5000,volume=0.3,aresample=48000" rip.wav
# Herr Brandt tearing the form, slower and longer.
fx -f lavfi -i "anoisesrc=d=1.0:c=white:a=0.9" -af "highpass=f=700,lowpass=f=6000,volume='0.3+0.7*gt(sin(2*PI*23*t)+0.7*sin(2*PI*41*t)\,0.1)':eval=frame,afade=t=in:d=0.08,afade=t=out:st=0.7:d=0.3,lowpass=f=4500,volume=0.32,aresample=48000" tear.wav
# The split-flap flutter (a day tag turning): twelve tiny clicks over 0.6 s.
fx -f lavfi -i "anoisesrc=d=0.6:c=white:a=0.5" -af "highpass=f=2500,lowpass=f=8000,volume='0.5+0.5*sin(2*PI*20*t)':eval=frame,afade=t=in:d=0.04,afade=t=out:st=0.45:d=0.15,lowpass=f=4000,volume=0.16,aresample=48000" flutter.wav
# The billion cents pouring over the counter: the flutter, long and swelling.
fx -f lavfi -i "anoisesrc=d=6:c=white:a=0.5" -af "highpass=f=2000,lowpass=f=7000,volume='(0.5+0.5*sin(2*PI*24*t))*min(1\,t/1.5)':eval=frame,afade=t=out:st=4.5:d=1.5,lowpass=f=4200,volume=0.2,aresample=48000" pour.wav
# A fact or problem card snapping onto the screen: a filtered noise burst over a short low thump.
fx -f lavfi -i "anoisesrc=d=0.12:c=white:a=0.9" -f lavfi -i "sine=f=180:d=0.12" -filter_complex \
  "[0]highpass=f=1800,lowpass=f=7000,afade=t=in:d=0.012,afade=t=out:st=0.02:d=0.08[n];[1]volume=0.5,afade=t=out:st=0.0:d=0.06[t];[n][t]amix=inputs=2:normalize=0,afade=t=in:d=0.015,lowpass=f=4000,volume=0.3,aresample=48000" snap.wav
# The bank stamp: a low thud with a short knock on top.
fx -f lavfi -i "aevalsrc='(0.9*sin(2*PI*85*t)+0.4*sin(2*PI*170*t))*exp(-t*28)*min(1\,t/0.004)':d=0.3:s=48000" -f lavfi -i "anoisesrc=d=0.05:c=pink:a=0.6" -filter_complex \
  "[1]lowpass=f=1800,afade=t=in:d=0.004,afade=t=out:st=0.01:d=0.04[k];[0][k]amix=inputs=2:normalize=0,afade=t=out:st=0.2:d=0.1,volume=0.5,aresample=48000" stamp.wav
# The phone buzzing on the table: two pulses of a low motor hum.
fx -f lavfi -i "aevalsrc='sin(2*PI*165*t)*(0.6+0.4*sin(2*PI*31*t))*(lt(mod(t\,0.55)\,0.35))':d=1.0:s=48000" \
  -af "lowpass=f=900,afade=t=in:d=0.02,afade=t=out:st=0.85:d=0.12,volume=0.3" buzz.wav
# One cent into Lotte's palm: a small, muffled clink (a palm, not a counter).
fx -f lavfi -i "aevalsrc='(sin(2*PI*3150*t)+0.6*sin(2*PI*4420*t)+0.3*sin(2*PI*6120*t))*exp(-t*22)*min(1\,t/0.004)':d=0.35:s=48000" \
  -af "lowpass=f=5000,afade=t=out:st=0.25:d=0.1,volume=0.12" coin.wav
# Lotte turning the key: two small metal clicks.
fx -f lavfi -i "anoisesrc=d=0.35:c=white:a=0.8" -af "highpass=f=1500,lowpass=f=5000,volume='exp(-mod(t\,0.17)*60)':eval=frame,afade=t=in:d=0.006,afade=t=out:st=0.28:d=0.07,volume=0.18,aresample=48000" key.wav
# Her lamp going out: one soft switch click.
fx -f lavfi -i "anoisesrc=d=0.08:c=white:a=0.9" -af "highpass=f=1200,lowpass=f=3500,afade=t=in:d=0.006,afade=t=out:st=0.02:d=0.05,volume=0.2,aresample=48000" lamp.wav
echo "$out"
