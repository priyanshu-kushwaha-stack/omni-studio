#!/usr/bin/env bash
# The reel's music beds and wind, into assets/reel/ (git-ignored): each channel theme (brand/music, 60 s) chained
# seven times with 3 s crossfades into one seamless 6.7 min bed, so no loop seam lands in the reel; and 150 s of quiet
# synthesized wind (brown noise, band-limited, slow gusts) for the blackout. Local and free. Skips files already made.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
V="$(dirname "$HERE")"
BRAND="$V/../../brand/music"
OUT="$V/assets/reel"
mkdir -p "$OUT/music" "$OUT/sfx"

bed() { # bed <theme mp3> <out wav>
  [ -s "$2" ] && return 0
  local n=7 args=() chain="" last="[0:a]"
  for ((i = 0; i < n; i++)); do args+=(-i "$1"); done
  for ((i = 1; i < n; i++)); do
    chain+="${last}[$i:a]acrossfade=d=3:c1=qsin:c2=qsin[x$i];"
    last="[x$i]"
  done
  ffmpeg -v error -y "${args[@]}" -filter_complex "${chain%;}" -map "$last" -ar 48000 -ac 2 -c:a pcm_s16le "$2"
}
bed "$BRAND/theme-dark.mp3" "$OUT/music/dark.wav"
bed "$BRAND/theme-light.mp3" "$OUT/music/light.wav"

if [ ! -s "$OUT/sfx/wind.wav" ]; then
  ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:duration=150:seed=11:sample_rate=48000" \
    -af "highpass=f=70,lowpass=f=520,volume='0.55+0.3*sin(2*PI*t/9)+0.15*sin(2*PI*t/3.7)':eval=frame,loudnorm=I=-34:TP=-9:LRA=7,afade=t=in:d=1,afade=t=out:st=148:d=2" \
    -ar 48000 -ac 1 -c:a pcm_s16le "$OUT/sfx/wind.wav"
fi
ls -la "$OUT/music" "$OUT/sfx"
