---
name: say-suppose-thumbnails
description: Make the three G1 thumbnails for a Say Suppose film with GPT Image 2.6 and set the caption in code. Use when a Say Suppose film needs its G1 packet thumbnails, or the owner asks for thumbnail variants.
---

# /say-suppose-thumbnails

Prompt: `channels/say-suppose/prompts/thumbnail.md`. Model: Higgsfield GPT Image 2.6, 2 credits an image. Nothing is
generated locally for this channel (owner, 2026-11-27, D5). Announce tool, model and cost (3 variants = 6 credits)
and wait for the owner's OK before any call.

Rules (L2, L5):
- One face readable at feed size, about 170 px wide. One premise prop. A lit ground with depth.
- At most 3 words or one number. A premise number is a glowing label in the world, the same readout as the film.
- The caption adds the stake or the emotion and never repeats the title. It is set in code in the channel typeface
  (Fredoka Bold, as in the kit), never painted by the model.
- Three variants, shown in a phone feed mock beside benchmark thumbnails (Awaken, YOUniverse, Ifverse, ConChaser) at
  feed size before the owner sees them.
- After upload, remind the owner to run YouTube's Test & Compare with the three variants.

Steps: fill the prompt three times (vary `{{emotion}}` or the composition); generate after the OK; set captions with
the kit's `Thumb` composition (`core/engines/suppose/kit`, Part B); build the feed mock page; show the owner.
