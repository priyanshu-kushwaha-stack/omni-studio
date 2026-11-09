# Say Suppose's room

Seats, models and caps: `../room.yaml`. The process: `core/openmontage/skills/studio/studio-room.md`. Adopted at
video 2 (`adopted: 2026-11-09`); the pause-time video and the UBI folder were reviewed by hand and stay that way.

| Seat (role) | Model | Brief | Fails a draft on |
|---|---|---|---|
| first-time viewer (viewer) | Grok 4.7 | `seats/first-time-viewer.md` | story #2, #3, #4, #11, the viewer's week; at G1 thumbnails K5-K7, K12, K13, K15 |
| retention editor (story) | GPT-5.6 Sol | `seats/retention-editor.md` | story #1, #5-#10, #12, the two late-rule fails, the 8-minute reason |
| fact-checker (fact) | Gemini 3.7 Flash | `seats/fact-checker.md` | every unsupported or overstated line (fact blockers are never dropped) |
| voice director (voice) | Claude Sonnet 5.5 | `seats/voice-director.md` | story #11, #12 (last line) |
| animator (craft) | Claude Sonnet 5.5 | `seats/animator.md` | pick card #8 (buildable); at G2 sound #1 and #3 on `cues.yaml` |
| judge | GPT-5.6 Sol | shared | breaks ties between candidates only |

Writer: Claude Opus 5.5. Each brief carries its checks, so a seat applies them even when a rules file is not among
its inputs; when `rules/` changes, change the briefs with it.

## Inputs to pass

As the skill says (G1: `audience.md`, `style.md`, `taste.md`, `cast.md`; G2: the same plus the video's `claims.md`
and `packaging.md`), and also:

- every seat: the rules file its checks come from (`rules/story.md`; the viewer at G1 also `rules/thumbnails.md`;
  the animator `rules/ideas.md` and, at G2, `rules/sound.md`);
- the animator at G2: the video's `cues.yaml`, when it exists.

## Not covered yet

- **The packaging seat** (next-phase spec, 2b: K1-K15 on three rendered candidates). Seats receive text only and
  every seat in `room.yaml` runs at both gates, so it waits for image inputs or per-gate seats in the room tools.
  Until then the viewer seat runs the text checks above, and K1-K4, K8-K11 and K14 are the owner's from the renders.
- **The frame-pack room at G4 and G5** has its own spec (next-phase spec, 2b).
