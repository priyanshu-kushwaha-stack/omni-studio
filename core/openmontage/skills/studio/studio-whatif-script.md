# studio-whatif: story_script (G2, story lock)

The owner reviews a film, not a text (owner, 2026-11-10; `docs/superpowers/specs/2026-11-10-say-suppose-first-cut-review-design.md`).
The first review gets the script, a free local narration and a 720p first cut. Nothing paid is made before G2.

## Write

1. Research first. Write `research.md` from sources you fetched and read in this session, each with its URL.
   Never write a number, a result or a source from memory.
2. Write `claims.md`: one row per real-world claim (id, claim as it will be spoken, source URL, verbatim quote,
   status, note). Status is `sourced`, `contested`, `spot-checked` or `dropped`.
3. Write `script.md` to the beats and script rules in `channels/<slug>/style.md`: second person, one narrator,
   three jumps of consequence, no word count (about 115 words a minute; past about 8 minutes the story seat must
   name why a viewer stays), 15 to 20% wordless (`> HOLD:`), a mood light per scene (`> MOOD:`), stakes the premise
   earns, and a line planted in minute one that returns in the last. Open with the five lines (Situation, Desire,
   Conflict, Change, Result) and pass the must-pass checks in `channels/<slug>/rules/story.md` where the channel has one. Bare
   lines are spoken by the narrator. `> SCENE:`, `> BUBBLE:`, `> TAG:`, `> MOOD:` and `> HOLD:` lines are directions
   and are not spoken (`channels/<slug>/cast.md`).
4. **Digits mean facts.** Every spoken number, date, name or finding about the real world cites its row inline,
   e.g. `(c03)`. Story numbers are written as words ("day twelve"). What the viewer does in the story is never
   stated as fact. Where the science is uncertain the narrator says so and the row is `contested`.
5. **The meaning layer.** Keep the `> UNDER:` line approved at G1 after the five lines; never answer it aloud. Name
   up to three `> DARLING:` lines, each a spoken line you defend against review. Aim for the shelf hooks in
   `rules/story.md` (the loophole beat every 60-90 s, the dilemma a cold reader can argue either way, the residue in
   the viewer's week); they are craft aims, not checks yet.
6. The room's writer (Claude Fable 5.1) keeps the pen; the session does the research, the claims and every revision.
   The writer marks one emotion per line and the delivery directions in `say.yaml` (in the video folder, tracked) as
   `"<script line>": "<what the voice says>"`, with numbers spelled out; the script keeps its digits for the claims check.
7. `.venv/bin/omni qc <slug> <video> story_script` must pass its claims check before anything is shown.

## Drop 1: script and local narration (minutes)

8. `whatif_story` turns `script.md` into `story.json`. The narrator comes from `channels/<slug>/voices.yaml`; with
   `use: local` it is the free local voice (Qwen3 cloned on this Mac from `narrator.local.ref`; the clip is
   git-ignored, so copy it in by hand on a new machine). `whatif_narration` with no approval and no credits makes the
   local takes, word timings and `props.json` in `assets/narration/` (git-ignored). Takes are cached per line by a hash
   of voice and spoken text, so after a note only the changed lines are re-voiced. Bracket directions are dropped for
   the local voice; they pay off in the paid A/B at picture lock. Fade every line edge and mute end-of-take pops
   (`core/studio/rules/no-audio-clicks.md`).
9. **The owner gets it at once.** Show the script and the narration together and run `python -m studio.room present`
   (`studio-room`); the room runs one round beside the owner's listen.

## Drop 2: the first cut (same day)

10. Build the film from each `> SCENE:` as `studio-whatif-edit` describes (kit scenes in `scenes/`, motion on cue
    words), on the local narration and the channel's music bed (`channels/<slug>/brand/music/`). It is a first cut:
    every scene present and moving, polish later. Render the watch copy at 1280x720: `whatif_render` `mode: picture`,
    `whatif_render` `mode: audio` (`composition: RoughCutSound`), then `whatif_mux`. The owner's full first review is
    on this cut.

## The story loop

11. The owner's notes come tagged by part: script, narration, picture, music. Script and narration notes are this
    loop's work: revise, re-run lint and qc, re-voice (only changed lines), and re-render the scenes whose words
    changed (picture notes are kept for picture lock unless they are quick). Show the updated cut each pass. One room
    round per gate; owner notes outrank the room and an owner-notes round takes them in (`studio-room`).
    **Listen, don't just read.** Play the local narration end to end each pass; a line that tires on the second listen
    is cut (Dr Plants). Offer the owner the stranger test: the opening played to one person who doesn't care about the
    topic, alone and unannounced, with where they looked away noted in `taste.md`.
12. `.venv/bin/omni qc <slug> <video> story_script` (claims, clicks) must pass on the current narration.
13. When the owner says the script and narration are right: `status: awaiting_human`, then stop. G2 locks the script
    and the local narration together.

A video whose `story_script` was approved under the seven-gate pipeline (before 2026-11-10) makes drop 1 and drop 2,
then writes `story_script` `awaiting_human` again: the old approval stays in its checkpoint history, and G2 now locks
the narration too.

## Never
- Call a paid provider before G2, or approve a gate yourself.
- Make the owner wait for the room, the first cut or the tests before the drop 1 read.
