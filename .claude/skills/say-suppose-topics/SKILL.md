---
name: say-suppose-topics
description: Generate and score new Say Suppose what-if topics. Three idea agents (Claude Fable, Gemini 4 Argon, GPT-5.6 Sol) each pitch 8 topics as full briefs; Claude Opus scores them blind, content first; the owner picks 3 on a page. Use when the owner asks for new topics, ideas, a topic slate, or "what should we make next" for Say Suppose. Optional argument a theme (e.g. "time", "money").
---

# /say-suppose-topics

Three agents pitch, one scores, the owner picks three. Spec:
`docs/superpowers/specs/2026-11-10-say-suppose-topics-skill-design.md`. The pitch format and scorecard:
`channels/say-suppose/rules/topic-brief.md`. Cost: Claude and Cursor subscriptions only; no paid provider.

Run from the omni-studio root (in a worktree, use the main checkout's `.venv` with an absolute `PYTHONPATH`:
`PYTHONPATH="$PWD/core/openmontage:$PWD/core" <main>/.venv/bin/python -m studio.topics ...`).

## 1. Set up (one step)

- `D=channels/say-suppose/backlog/topics-<YYYY-MM-DD>` (add `-2` if it exists); `mkdir -p $D`.
- **Already made:** every video folder name under `channels/say-suppose/videos/` and every title in
  `channels/say-suppose/backlog/` (`topics.yaml`, earlier `topics-*.md`). Write them to `$D/made.txt`.
- **The pitch prompt** `$D/prompt-<lens>.md`, one per lens: the whole of `rules/topic-brief.md`, then
  `channels/say-suppose/audience.md` and `style.md` (no persona: "you" is anyone and the world follows the idea;
  owner, 2026-11-11, `taste.md`), then `$D/made.txt` under "Already made, never repeat", then the
  theme if the owner gave one, then the lens below.

| Pitcher | Lens (append to its prompt) |
|---|---|
| Claude Fable 5.1 | **The wild premise.** No web search: pure daydream and craft. The rule and its catch first; the strangest consequences and what they make you think; facts you are sure of, marked "verify" where you cannot give a source. |
| Gemini 4 Argon | **The content mine.** Research-heavy: search the web for real science, money and history, and give a source for every fact. |
| GPT-5.6 Sol | **The viewer's thrill.** Hooks, clicks and the thumbnail first: what a stranger anywhere taps tonight, with the views case. |

## 2. Pitch (in parallel, in one message)

- **Fable:** an `Agent` call, `model: "fable"`, `subagent_type: "general-purpose"`, the prompt from
  `$D/prompt-wild.md`, told to answer with the JSON only and to use no web tools. Save its JSON to `$D/fable.json`.
- **Gemini and GPT:** two background shell calls:
  `python -m studio.topics pitch gemini-4-argon-high $D/prompt-mine.md $D/gemini.json` and
  `python -m studio.topics pitch gpt-5.6-sol-high $D/prompt-thrill.md $D/gpt.json`. They run sandboxed in ask mode,
  like room seats; each may take up to 20 minutes.
- Add `"proposers": ["fable"]` (or `gemini`, `gpt`) to each topic and prefix each `id` (`f-`, `g-`, `o-`).
- `python -m studio.topics check $D/<each>.json`. A topic with problems goes back to its pitcher once with the problem
  list; if it still fails, drop it and say so in the hand-over. Never fill a gap yourself.

## 3. Score (Claude Opus, blind)

- Put every topic in one list, shuffled, with `proposers` removed: `$D/blind.json`.
- One `Agent` call, `model: "opus"`, `subagent_type: "general-purpose"`, given the scorecard from
  `rules/topic-brief.md` and `$D/blind.json`. It proposes nothing. It merges duplicates (same daydream and same twist:
  keep the richer brief, list the merged ids) and, for every remaining topic, returns
  `{"id", "scores": {"excitement": {"score", "reason"}, ...}, "copies_trending", "best_moment", "merged": [ids]}`.
- Put the scores back on the briefs, union the proposers of merged topics, and write
  `$D/scored.json` as `{"date": "<YYYY-MM-DD>", "topics": [...]}`.

## 4. The owner's list

- `python -m studio.topics rank $D/scored.json $D/topics.md` (also writes `$D/topics.json`, ranked).
- `python -m studio.topics page $D/scored.json <scratchpad>/topics-<date>.html`, then publish it with the Artifact
  tool, `capabilities: {"db": {"rules": [{"path": "picks", "read": "view", "write": "admin"}]}, "user": {}}`. The
  page saves the owner's picks to `picks/owner`.
- Show the owner the page link and the top five in one table (title, total, the line that sells it). Commit `$D/` on a
  branch and open a PR (`--repo priyanshu-kushwaha-stack/omni-studio`); the owner merges.

## 5. After the owner picks

- Read the picks with `Artifact` `read_db` (`picks/owner`). Record them at the top of `$D/topics.md` under
  "Picked (owner, <date>)".
- Each pick goes to G1 only when the owner says go: `omni new-video say-suppose "<title>" --format story`, then the
  G1 packaging skill with the pick's brief as its starting point. Never approve a gate.

## Never
- Score a topic yourself, or add up a total by hand (`studio.topics` computes it).
- Let a pitcher see another's topics or the scorer see who proposed what.
- Call a paid provider, or start G1 before the owner says go.
