#!/usr/bin/env bash
# Synthesises the sound set into public/sfx/ (license-free: generated, not downloaded).
set -euo pipefail
out="${1:-public/sfx}"
mkdir -p "$out"
ff() { ffmpeg -v error -y "$@"; }

ff -f lavfi -i "anoisesrc=d=0.5:c=pink:a=0.9" \
  -af "bandpass=f=1400:width_type=h:w=2200,afade=t=in:d=0.2,afade=t=out:st=0.22:d=0.28" -ar 44100 -ac 1 "$out/whoosh.wav"
# Pop: a 4 ms attack so it does not read as a click on near-silence (G5, 2026-11-08).
ff -f lavfi -i "aevalsrc='0.8*(1-exp(-t*600))*sin(2*PI*(900-2500*t)*t)*exp(-t*35)':d=0.12:s=44100" -ac 1 "$out/pop.wav"
# Split-flap: a card clack over a low knock. A 3 ms attack and a slower decay keep the clack but not the 10 ms spike
# that the click check
# (core/studio/qc/clicks.py) flags when a flip lands on near-silence (G5, 2026-11-07).
ff -f lavfi -i "aevalsrc='0.8*(1-exp(-t*900))*(0.7*sin(2*PI*1900*t)*exp(-t*90)+0.8*sin(2*PI*210*t)*exp(-t*28))':d=0.24:s=44100" -ac 1 "$out/flip.wav"
# Mug catch: two inharmonic ceramic partials.
ff -f lavfi -i "aevalsrc='0.45*(sin(2*PI*2350*t)+0.7*sin(2*PI*3710*t))*exp(-t*26)':d=0.35:s=44100" -ac 1 "$out/clink.wav"
# Time stop: everything sucked downward into a thud with a long tail.
ff -f lavfi -i "aevalsrc='0.6*sin(2*PI*(760*exp(-3.4*t))*t)*exp(-t*1.1)+0.45*sin(2*PI*52*t)*exp(-t*3.6)':d=1.5:s=44100" \
  -af "aecho=0.8:0.6:90|170:0.35|0.2,afade=t=out:st=1.0:d=0.5" -ac 1 "$out/timestop.wav"
# Resume: the same gesture rising, ending as colour returns.
ff -f lavfi -i "aevalsrc='0.55*sin(2*PI*(90+1500*t*t)*t)*t*2':d=0.5:s=44100" -af "afade=t=out:st=0.42:d=0.08" -ac 1 "$out/resume.wav"
# Sting: a low dissonant swell over a hit, ringing out.
ff -f lavfi -i "aevalsrc='0.5*(sin(2*PI*55*t)+0.8*sin(2*PI*58.3*t)+0.5*sin(2*PI*110*t)+0.35*sin(2*PI*233*t))*exp(-t*0.9)':d=2.6:s=44100" \
  -af "aecho=0.8:0.7:120|260:0.4|0.25,lowpass=f=1500,afade=t=out:st=1.9:d=0.7" -ac 1 "$out/sting.wav"
# Bed: a quiet minor drone with slow movement.
ff -f lavfi -i "aevalsrc='0.22*(sin(2*PI*110*t)+0.7*sin(2*PI*130.8*t)+0.6*sin(2*PI*164.8*t))*(0.75+0.25*sin(2*PI*0.09*t))':d=40:s=44100" \
  -af "lowpass=f=600,afade=t=in:d=1.5" -ac 1 "$out/pad.wav"
# Street: filtered traffic hum.
ff -f lavfi -i "anoisesrc=d=25:c=brown:a=0.8" -af "bandpass=f=420:width_type=h:w=700,afade=t=in:d=0.2" -ar 44100 -ac 1 "$out/street.wav"
# Bus: a low engine that swells as it nears.
ff -f lavfi -i "aevalsrc='0.5*(sin(2*PI*62*t)+0.5*sin(2*PI*124*t)+0.3*sin(2*PI*187*t))*min(1\,t/3.2)':d=7:s=44100" -ac 1 "$out/bus.wav"
echo "sfx -> $out"
