# Say Suppose's room

Seats, models and caps: `../room.yaml`. The process: `core/openmontage/skills/studio/studio-room.md`. Adopted at
video 2 (`adopted: 2026-11-09`); the pause-time video and the UBI folder were reviewed by hand and stay that way.

| Seat (role) | Model | Brief | Fails a draft on |
|---|---|---|---|
| story editor (story) | GPT-5.6 Sol | `seats/story-editor.md` | story #1-#3, #5-#10, #12-#19, and #4 and #11 (the viewer seat's, since 2026-11-11), the two late-rule fails, the 8-minute reason, the world follows the idea (`taste.md`, 2026-11-11) |
| claims check (fact) | Gemini 3.8 Flash | `seats/fact-checker.md` | every unsupported or overstated line; claims only, no story notes (fact blockers are never dropped) |

No judge: the writer merges the reviewer's and the claims check's notes, and a note it will not take goes to the owner as one line.

Writer: **Claude Fable 5.1**. Each brief carries its checks, so a seat applies them even when a rules file is not among
its inputs; when `rules/` changes, change the briefs with it. Every story check has an owner: #1, #5-#7, #9 and #12
the story editor; since 2026-11-11 every story check, #1-#19, is the story editor's.

**Three films a week (owner, 2026-11-11).** One reviewer, the story editor, plus the claims check; the first-time
viewer seat left (`viewer_required: false` lets a room omit it). Spec:
`docs/superpowers/specs/2026-11-11-say-suppose-three-a-week-design.md`.

**First-cut review (owner, 2026-11-10).** One or two reviewers per room: the director seat and the judge left, the
story editor took the director's checks, and the fact-checker became the claims check. The owner's first review is on
the script, the free local narration (Qwen3 cloned from Arthur, `voices.yaml` `use: local`) and a 720p first cut
(`pitch_clip: pre_g2_local`). Spec: `docs/superpowers/specs/2026-11-10-say-suppose-first-cut-review-design.md`.

**Room v2 (owner, 2026-11-10).** From the film 2 trial (`docs/research/2026-11-09-say-suppose-room-trial/RESULTS.md`):
Fable was the owner's blind pick as writer; the story editor's brief replaced the retention editor's (2 of 2 agreed);
the director joined (it found the two agreed blockers no other seat raised; it runs on Opus so the writer never reviews
its own draft); the voice director and the animator left (0 agreed blockers on scripts). Their briefs stay in
`seats/` for the narration room (G3) and the frame-pack room (G4), which do not exist yet. The fact-checker still runs at
G1, where there are no claims yet, because the fact role is mandatory at every gate; it runs beside the other seats, so
it costs calls, not round time. The viewer runs on Claude Opus 5.5, which is also the director. In the viewer trial
(`docs/research/2026-11-10-say-suppose-viewer-trial/RESULTS.md`) it found 5 of the 10 problems the owner agreed with,
in about a minute, with 5 of its 6 cards agreed. The best Grok found 6 in 7.5 minutes with 2 of 8 cards agreed. The
viewer may be the writer's family but never the writer's own model: Fable missed on its own script what Opus found.

**Pipeline v2 (owner, 2026-11-10).** One room round (`rounds: 1`); the owner reads round 1's draft first
(`owner_first`, `python -m studio.room present`) while the room runs; at most three blockers, three suggestions and
three keep lines per seat (`limits`; fact blockers are never cut); the viewer is off the critical path
(`viewer_required: false`): a round ships on the story editor and the fact-checker, and a late viewer's notes join the
owner-notes round as suggestions. The report shows the author's cut and what review cost the voice; `python -m
studio.room times` and `scorecard` measure the gates and the seats. Spec:
`docs/superpowers/specs/2026-11-10-say-suppose-pipeline-v2-design.md`.

## Inputs to pass

As the skill says (G1: `audience.md`, `style.md`, `taste.md`, `cast.md`; G2: the same plus the video's `claims.md`
and `packaging.md`), and also:

- every seat: the rules file its checks come from (`rules/story.md`; the viewer at G1 also `rules/thumbnails.md`).

## Not covered yet

- **The packaging seat** (next-phase spec, 2b: K1-K15 on three rendered candidates). Seats receive text only and
  every seat in `room.yaml` runs at both gates, so it waits for image inputs or per-gate seats in the room tools.
  Until then the viewer seat runs the text checks above, and K1-K4, K8-K11 and K14 are the owner's from the renders.
- **The frame-pack room at G4 and G5** has its own spec (next-phase spec, 2b).
