#!/usr/bin/env bash
# G4 final watch: the one 1920x1080 render, from the code and narration G3 approved (v7c, 2026-11-18).
# Picture and sound come from ONE Remotion render (RoughCut at scale 1, nothing stitched or muxed). Then the audio is
# mastered with the same chain as render_watch.sh (whatif_render's own limiter would leave this mix near -21 LUFS):
# +7.5 dB, a 13 kHz lowpass, the limiter, and the 2 dB dips in DIPS; the video stream is copied untouched.
# Usage: DIPS="191.684" render_final.sh   (run it through studio.jobs --queue render). MASTER_ONLY=1 re-masters the
# existing raw render. The 1080p raw puts the "rested" spike at 191.684 s, 39 ms later than the 720p cut (191.645).
set -euo pipefail
W=/Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.claude/worktrees/ai-rents-brain-g1-261894
V=$W/channels/say-suppose/videos/2026-11-13_what-if-ai-rented-your-brain-while-you-slept
E=$W/core/engines/whatif
out=$V/renders/final; work=$out/work; mkdir -p "$work"
cd "$E"
if [ -z "${MASTER_ONLY:-}" ]; then
rm -rf "$work/bundle"
npx remotion bundle "$V/scenes/index.ts" --out-dir="$work/bundle" --public-dir="$V/assets" --log=error >/dev/null
npx remotion render "$work/bundle" RoughCut "$work/raw-1080p.mp4" --props="$V/assets/narration/props.json" --log=error --concurrency=50% --crf=18
fi
dip=""
for t in ${DIPS:-}; do dip="$dip*(1-0.2*exp(-pow((t-$t)/0.03\,2)))"; done
af="volume=7.5dB,lowpass=f=13000,alimiter=limit=0.79:level=false:attack=4:release=80"
[ -n "$dip" ] && af="$af,aeval='val(ch)$dip':c=same"
ffmpeg -v error -y -i "$work/raw-1080p.mp4" -map 0:v -map 0:a -c:v copy -af "$af" -c:a aac -b:a 256k "$out/ai-rents-your-brain-1080p.mp4"
ffmpeg -hide_banner -nostats -i "$out/ai-rents-your-brain-1080p.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):"
ffprobe -v error -show_entries stream=width,height -of csv=p=0 "$out/ai-rents-your-brain-1080p.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/ai-rents-your-brain-1080p.mp4"
echo "$out/ai-rents-your-brain-1080p.mp4"
