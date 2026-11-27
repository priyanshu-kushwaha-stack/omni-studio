---
name: say-suppose-topics
description: Generate new Say Suppose what-if titles. One model runs the owner's master topic prompt and returns 35 titles; the owner picks. Use when the owner asks for new topics, ideas, a topic slate, or "what should we make next" for Say Suppose. Optional argument a theme (e.g. "memory", "sleep").
---

# /say-suppose-topics

One prompt, 35 titles, the owner picks (owner, 2026-11-27; spec D13). Prompt:
`channels/say-suppose/prompts/topic.md`. Cost: this session only, no paid provider.

1. `D=channels/say-suppose/backlog/topics-<YYYY-MM-DD>` (add `-2` if it exists); `mkdir -p $D`.
2. Collect every video folder name under `channels/say-suppose/videos/` and every title under
   `channels/say-suppose/backlog/`; that list is `{{made_titles}}`. The owner's theme, if any, is `{{theme}}`.
3. Fill the `## Prompt` section of `prompts/topic.md` with both blanks and save it as `$D/prompt.md`.
4. Answer the prompt yourself, in this session. Save the 35 titles as `$D/titles.md`.
5. Check them with code before showing them: 35 lines; each starts `What If`, ends `?`, has 6–8 words, is Title
   Case; no line matches a made title (case-insensitive). Fix and re-check until clean.
6. Show the owner the 35 titles as a numbered list. The owner picks; record the pick as `$D/picked.md`.

Never start a film from a title the owner has not picked.
