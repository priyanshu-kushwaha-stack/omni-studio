# Say Suppose is restarting (2026-11-26)

The owner is restarting the channel from scratch:

> "i think i rushed very quickly to form it a pipeline even when all the steps are not upto the expectations ...
> I am not happy with the quality of the content that we are pushing currently."

The owner's rating against the benchmark (@awaken.studios, @youniverse_tv) is about 30-40% on quality and about 5% on thumbnails. Rule for the restart: **quality first, pipeline last.**
- No pipeline, template or cadence work until one thumbnail and one 60 s pilot, shown next to the benchmark at feed size, clear the owner's bar.
- Looks are chosen from rendered options.

## Where v1 went

| What | Where |
|---|---|
| Everything on `main` before the restart | tag `say-suppose-v1` |
| The 10 unfinished film and research PRs (#38, #39, #40, #54, #55, #56, #60, #64, #65, #66), closed unmerged | tags `archive/say-suppose-v1/<branch>` |
| The git-ignored media of those worktrees (renders, narration, final cuts; about 32 GB) | `~/Exploration/projects/omni-studio-archive/say-suppose-v1-media/<branch>/`, outside the repo |
| The handover for the restart session | `say-suppose-restart-handover.md` in the shared session notes folder |

## What is still in this folder, and why

These files are **v1**. They stay only because shared studio code and tests read them. The room's owner notes read `taste.md`, the `studio-whatif` pipeline and its skills read `style.md`, `cast.md`, `brand/`, `rules/` and `backlog/`, and the tests read `room.yaml`, `voices.yaml` and the pause-time video. None of them is the starting point for the restart. Whether the `studio-whatif` pipeline and the whatif engine are kept at all is a restart decision. Removing them is a studio code change, made in that design.

- **`channel.yaml`, `page/`, `analytics/`:** the channel's identity, ids and upload settings. Kept.
- **`videos/2026-11-06_pause-time-for-10-seconds-a-day`:** a public video and a test fixture.
- **`taste.md`:** the owner's dated notes. The ones that still hold:
  - It's a film, not slides. Watch the references and write the storyline before building.
  - Characters talk to each other with distinct voices. No documentary narration; direct for performance.
  - The film is clear in one watch: one idea at a time, each set up before it's used.
  - Every real fact lands as a surprise: the viewer's guess first, then the fact that flips it. Every section ends pulling the viewer into the next.
  - Exciting, not sad.
  - Looks are decided from rendered options shown next to the references, never from descriptions.
  - Black figures that look like real 3D were preferred over the paper-cut 2D. This was a direction; no execution has met the bar yet.
  - Thumbnails must meet the bar of similar channels.
- **`style.md`, `cast.md`, `brand/`, `rules/`, `voices.yaml`, `room.yaml`, `backlog/`, `audience.md`:** the v1 look, cast, idents, craft rules, voices, topic room and topic history. Reuse only what the restart re-approves.

The four public videos (pause time, AI rents your brain, who wants you to fail, AI predicts every choice) are the owner's to keep or set private in YouTube Studio.

## Film kit (2026-11-27)

The look of pilot v8 is now a repeatable way to make every film. Spec: `docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md`;
plan: `docs/superpowers/plans/2026-11-27-say-suppose-film-kit.md`.

- Prompts: `channels/say-suppose/prompts/` (the owner's master prompts are kept verbatim in `prompts/sources/`).
- Skills: `.claude/skills/say-suppose-topics` (one prompt, 35 titles) and `.claude/skills/say-suppose-thumbnails`.
- Art library: `channels/say-suppose/library/` (manifest and JSON in git; images git-ignored), seeded from the pilot.
- Engine: `core/engines/suppose/` (`scripts/` Python tools, `kit/` Remotion kit, `examples/only-100/` the pilot rebuilt
  on the kit as its acceptance test).
- Pipeline: `studio-suppose`, format `film` in `channel.yaml`, the same five owner gates.

The first real film starts in its own session with the topic skill. Nothing in the kit passes a gate or spends credits.
