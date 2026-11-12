#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
# The band coming on (the rule device, rules/sound.md #8): a soft teal chime, two sine partials with a bell decay.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.4*(sin(2*PI*1318*t)+0.5*sin(2*PI*1975*t)+0.25*sin(2*PI*2637*t))*exp(-t*3.2)*min(1\,t/0.004)':d=1.6:s=48000" -af "lowpass=f=6000,afade=t=out:st=1.3:d=0.3" chime.wav
# The ghost typing: dry key clicks at about eleven a second with a little jitter, a 4 s loop that starts and ends silent.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=4:c=white:a=0.9:s=48000" -af "highpass=f=1800,lowpass=f=6500,volume='if(lt(mod(t*11.3+0.37*sin(t*7),1),0.09),1,0.02)':eval=frame,lowpass=f=5000,volume=0.35,afade=t=in:d=0.02,afade=t=out:st=3.98:d=0.02" typing.wav
# A coin landing in glass: a bright ping over a short tick.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.5*(sin(2*PI*3100*t)+0.6*sin(2*PI*4700*t)+0.3*sin(2*PI*6200*t))*exp(-t*14)*min(1\,t/0.002)':d=0.45:s=48000" -af "afade=t=out:st=0.35:d=0.1" clink.wav
# Paper: a stamp landing (KEYS, DOOR, YOU) and the leaflet unfolding.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.12:c=pink:a=0.9" -f lavfi -i "sine=f=120:d=0.12" -filter_complex \
  "[0]highpass=f=600,lowpass=f=3500,afade=t=in:d=0.004,afade=t=out:st=0.02:d=0.08[n];[1]volume=0.7,afade=t=out:st=0:d=0.07[t];[n][t]amix=inputs=2:normalize=0,volume=0.35,aresample=48000" stamp.wav
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.5:c=white:a=0.6" -af "highpass=f=1500,lowpass=f=7000,volume='0.4+0.6*sin(2*PI*9*t)^2':eval=frame,afade=t=in:d=0.05,afade=t=out:st=0.3:d=0.2,volume=0.15,aresample=48000" paper.wav
# The clinic's wall clock tick, and a knock on a door.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.05:c=white:a=0.9" -af "highpass=f=2000,lowpass=f=5000,afade=t=in:d=0.002,afade=t=out:st=0.01:d=0.03,volume=0.3,aresample=48000" tick.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.8*sin(2*PI*95*t)*exp(-t*30)+0.3*sin(2*PI*190*t)*exp(-t*40)':d=0.3:s=48000" -af "lowpass=f=900,afade=t=out:st=0.2:d=0.1" knock.wav
# The globe's one held note (rules/sound.md #3): a soft low A with its octave, a slow swell and a long release.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.35*(sin(2*PI*110*t)+0.4*sin(2*PI*220*t)+0.15*sin(2*PI*330*t))*min(1\,t/2.5)*exp(-max(0\,t-8)*0.9)':d=12:s=48000" -af "lowpass=f=900,afade=t=out:st=10.5:d=1.5" peak-note.wav
echo "$out"
