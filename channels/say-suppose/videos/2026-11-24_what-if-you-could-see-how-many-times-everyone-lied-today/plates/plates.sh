set -e
M=/Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.venv-media/bin/mflux-generate-flux2
STY="Soft 2D vector illustration background plate for an animated explainer, painted storybook animation style like a hand-made animated film background, smooth flat gradients, simplified shapes, soft painted light and glow, gentle atmospheric depth, not photorealistic, not a 3D render, no people, no characters, no text, muted harmonious palette, eye-level wide view with open floor space in the middle, 16:9"
i=0
while IFS=$'\t' read -r name prompt; do
  i=$((i+1))
  [ -f channels/say-suppose/videos/2026-11-24_what-if-you-could-see-how-many-times-everyone-lied-today/renders/plates/$name.png ] && continue
  $M -m flux2-klein-4b --steps 4 --seed $((100+i)) --width 1536 --height 864 --prompt "$prompt. $STY" --output channels/say-suppose/videos/2026-11-24_what-if-you-could-see-how-many-times-everyone-lied-today/renders/plates/$name.png
done < channels/say-suppose/videos/2026-11-24_what-if-you-could-see-how-many-times-everyone-lied-today/renders/plates/plates.tsv
echo PLATES DONE
