#!/usr/bin/env bash
# The film's synthesised effects (style.md: effects are made with ffmpeg). assets/ is git-ignored; run once per machine.
#   bash scenes/make_sfx.sh
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/assets/sfx"; mkdir -p "$out"; cd "$out"
# The band coming on (the rule device, rules/sound.md #8): a soft teal chime, two sine partials with a bell decay.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.4*(sin(2*PI*1318*t)+0.5*sin(2*PI*1975*t)+0.25*sin(2*PI*2637*t))*exp(-t*3.2)*min(1\,t/0.004)':d=1.6:s=48000" -af "lowpass=f=6000,afade=t=out:st=1.3:d=0.3" chime.wav
# The ghost typing: dry key clicks at about eleven a second with a little jitter, a 4 s loop that starts and ends silent.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=4:c=white:a=0.9:s=48000" -af "highpass=f=1800,lowpass=f=6500,volume='if(lt(mod(t*11.3+0.37*sin(t*7),1),0.09),1,0.02)':eval=frame,lowpass=f=5000,volume=0.35,afade=t=in:d=0.02,afade=t=out:st=3.98:d=0.02" typing.wav
# A coin landing in glass: a bright ping over a short tick. G3: a 6 ms attack, a slower decay and a short glass-room
# tail, and 4 dB lower (with the knock below), so the full mix's click check stops reading it as a pop (v6 0:53.4).
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.5*(sin(2*PI*3100*t)+0.6*sin(2*PI*4700*t)+0.3*sin(2*PI*6200*t))*exp(-t*8)*min(1\,t/0.006)':d=0.6:s=48000" -af "lowpass=f=7000,aecho=0.6:0.5:20|45:0.3|0.15,volume=0.63,afade=t=out:st=0.45:d=0.15" clink.wav
# Paper: a stamp landing (KEYS, DOOR, YOU) and the leaflet unfolding.
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.12:c=pink:a=0.9" -f lavfi -i "sine=f=120:d=0.12" -filter_complex \
  "[0]highpass=f=600,lowpass=f=3500,afade=t=in:d=0.004,afade=t=out:st=0.02:d=0.08[n];[1]volume=0.7,afade=t=out:st=0:d=0.07[t];[n][t]amix=inputs=2:normalize=0,volume=0.35,aresample=48000" stamp.wav
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=0.5:c=white:a=0.6" -af "highpass=f=1500,lowpass=f=7000,volume='0.4+0.6*sin(2*PI*9*t)^2':eval=frame,afade=t=in:d=0.05,afade=t=out:st=0.3:d=0.2,volume=0.15,aresample=48000" paper.wav
# The clock tick and a knock on a door. Both have a soft attack and a short room tail, so the full mix's click check
# (core/studio/qc/clicks.py: a burst under 80 ms that falls 15 dB) doesn't read them as pops.
ffmpeg -v error -y -f lavfi -i "aevalsrc='(0.35*sin(2*PI*1320*t)*exp(-t*12)+0.2*sin(2*PI*2640*t)*exp(-t*18))*min(1\\,t/0.004)':d=0.4:s=48000" -af "lowpass=f=5000,aecho=0.6:0.5:25|55:0.3|0.15,afade=t=out:st=0.3:d=0.1" tick.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='(0.8*sin(2*PI*95*t)*exp(-t*9)+0.3*sin(2*PI*190*t)*exp(-t*14)+0.12*sin(2*PI*410*t)*exp(-t*20))*min(1\\,t/0.006)':d=0.7:s=48000" -af "lowpass=f=900,aecho=0.6:0.5:35|70:0.35|0.2,volume=1.26,afade=t=out:st=0.5:d=0.2" knock.wav
# The globe's one held note (rules/sound.md #3): a soft low A with its octave, a slow swell and a long release.
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.35*(sin(2*PI*110*t)+0.4*sin(2*PI*220*t)+0.15*sin(2*PI*330*t))*min(1\,t/2.5)*exp(-max(0\,t-8)*0.9)':d=12:s=48000" -af "lowpass=f=900,afade=t=out:st=10.5:d=1.5" peak-note.wav
echo "$out"
