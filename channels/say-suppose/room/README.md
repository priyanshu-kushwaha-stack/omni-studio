# Say Suppose's room

Seats, models and caps: `../room.yaml`. The process: `core/openmontage/skills/studio/studio-room.md`. Adopted at
video 2 (`adopted: 2026-11-09`); the pause-time video and the UBI folder were reviewed by hand and stay that way.

| Seat (role) | Model | Brief | Fails a draft on |
|---|---|---|---|
| first-time viewer (viewer) | Grok 4.7 | `seats/first-time-viewer.md` | story #2, #3, #4, #11, the viewer's week; at G1 thumbnails K5-K7, K12, K13, K15 |
| story editor (story) | GPT-5.6 Sol | `seats/story-editor.md` | story #1, #5, #6, #7, #9, #12, the two late-rule fails, the 8-minute reason |
| fact-checker (fact) | Gemini 3.8 Flash | `seats/fact-checker.md` | every unsupported or overstated line (fact blockers are never dropped) |
| director (craft) | Claude Opus 5.5 | `seats/director.md` | story #2, #3, #8, #10 |
| judge | GPT-5.6 Sol | shared | breaks ties between candidates only |

Writer: **Claude Fable 5.1**. Each brief carries its checks, so a seat applies them even when a rules file is not among
its inputs; when `rules/` changes, change the briefs with it. Every story check has an owner: #1, #5-#7, #9 and #12
the story editor; #2 and #3 the viewer and the director; #4 and #11 the viewer; #8 and #10 the director.

**Room v2 (owner, 2026-11-10).** From the film 2 trial (`docs/research/2026-11-09-say-suppose-room-trial/RESULTS.md`):
Fable was the owner's blind pick as writer; the story editor's brief replaced the retention editor's (2 of 2 agreed);
the director joined (it found the two agreed blockers no other seat raised; it runs on Opus so the writer never reviews
its own draft); the voice director and the animator left (0 agreed blockers on scripts). Their briefs stay in
`seats/` for the narration room (G3) and the frame-pack room (G4), which do not exist yet. The fact-checker still runs at
G1, where there are no claims yet, because the fact role is mandatory at every gate; it runs beside the other seats, so
it costs calls, not round time. The viewer stays on Grok until a faster model is right as often (trial: Grok 2 of 3,
Gemini 0 raised).

## Inputs to pass

As the skill says (G1: `audience.md`, `style.md`, `taste.md`, `cast.md`; G2: the same plus the video's `claims.md`
and `packaging.md`), and also:

- every seat: the rules file its checks come from (`rules/story.md`; the viewer at G1 also `rules/thumbnails.md`).

## Not covered yet

- **The packaging seat** (next-phase spec, 2b: K1-K15 on three rendered candidates). Seats receive text only and
  every seat in `room.yaml` runs at both gates, so it waits for image inputs or per-gate seats in the room tools.
  Until then the viewer seat runs the text checks above, and K1-K4, K8-K11 and K14 are the owner's from the renders.
- **The frame-pack room at G4 and G5** has its own spec (next-phase spec, 2b).
