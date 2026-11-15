#!/usr/bin/env bash
# G3 watch copy (1280x720, never 1080p before G4): picture at 0.75 (Remotion's 0.6667 scale bug), sound separately,
# then the master: +7.5 dB and a limiter, so the mix sits at about -14 LUFS (channel loudness.story) with peaks under
# -1 dBTP, a 13 kHz lowpass (the brother's 'Still' sibilant tripped the step check) and a 60 ms 2 dB dip at 155.807 s (a
# spike inside the nurse's 'rested', too loud for the step check; a mute there would cut the word); then downscale to 720p and mux. Usage: render_g3.sh <tag> [sound-only]
set -euo pipefail
tag=${1:?tag}; mode=${2:-full}
W=/Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.claude/worktrees/ai-rents-brain-g1-261894
V=$W/channels/say-suppose/videos/2026-11-13_what-if-ai-rented-your-brain-while-you-slept
E=$W/core/engines/whatif
out=$V/renders/g3; work=$out/work-$tag; mkdir -p "$work"
cd "$E"
rm -rf "$work/bundle"
npx remotion bundle "$V/scenes/index.ts" --out-dir="$work/bundle" --public-dir="$V/assets" --log=error >/dev/null
if [ "$mode" = full ]; then
  npx remotion render "$work/bundle" RoughCut "$work/picture.mp4" --props="$V/assets/narration/props.json" --scale=0.75 --muted --log=error --concurrency=50%
fi
npx remotion render "$work/bundle" RoughCutSound "$work/sound.wav" --props="$V/assets/narration/props.json" --codec=wav --log=error
ffmpeg -v error -y -i "$work/sound.wav" -af "volume=7.5dB,lowpass=f=13000,alimiter=limit=0.79:level=false:attack=4:release=80,aeval='val(ch)*(1-0.2*exp(-pow((t-155.807)/0.03\,2)))':c=same" -c:a pcm_s24le "$work/master.wav"
pic=${PICTURE:-$work/picture.mp4}
ffmpeg -v error -y -i "$pic" -i "$work/master.wav" -map 0:v -map 1:a -vf "scale=1280:720:flags=lanczos" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -c:a aac -b:a 256k -shortest "$out/$tag-720p.mp4"
ffmpeg -hide_banner -nostats -i "$out/$tag-720p.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$tag-720p.mp4"
echo "$out/$tag-720p.mp4"
