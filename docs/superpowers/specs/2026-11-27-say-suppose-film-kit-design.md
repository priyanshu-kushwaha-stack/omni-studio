# Say Suppose: the film kit

Owner approved the design in sections, 2026-11-27. It turns the look of pilot v8 ("What if only 100 people could ever
see you?", `channels/say-suppose/pilot/only-100/`) into a repeatable way to make every Say Suppose film. No real film is
started by this work.

## Why

On 2026-11-27 the owner passed pilot v8 as clearing the bar beside Awaken and YOUniverse. The pilot is 60 s with 14
shots, each built by hand in `Pilot60.tsx` (386 lines). A Say Suppose film is designed around **8–12 minutes** (owner,
2026-11-27): about 120–170 shots and 8–12 sets. Building every shot by hand would be ten times the pilot's code per
film, so the pilot's parts become a shared kit, and most shots become lines in a shot sheet.

The nine learnings (`docs/research/2026-11-27-say-suppose-learnings.md`) stay the brief for every film. Every rule in
CLAUDE.md still binds: the owner passes every gate, no paid call without the owner's OK, renders go through
`studio.jobs --queue render`, agents never upload.

## Decisions (owner, 2026-11-27)

1. Films are designed around 8–12 minutes. L4 still holds: no padding, a film runs as long as its story needs.
2. **Art is approved at G1.** The G1 packet carries the list of new sets and characters with its credit quote; the
   owner's G1 approval OKs that spend. The first cut is then made in the real look. Narration stays voice B (free) and
   the score stays a library cue until after G2.
3. **Script read before animation.** After G1 the owner reads the full script and hears the voice B track. This is a
   checkpoint, not a gate. Animation starts only after the owner's OK on the read.
4. **Hybrid shots.** Most shots are lines in a shot sheet, built from a library of actions. The hero beats (cold open,
   title, climax, twist) are hand-built in code, as in the pilot. A custom move that proves good is added to the
   action library in a kit PR between films.
5. **GPT Image 2.6 only.** Thumbnails, sets and parts sheets are painted by Higgsfield GPT Image 2.6. Nothing is
   generated locally for this channel (local FLUX did not look good). This overrides L2.1.
6. **BigFace keeps its mouth.** Scarf's emoji face smiles, frowns and opens its mouth, as approved in pilot v5. This
   overrides L8.4's "no mouths". There is still no lip-sync.
7. **Luc is the channel's narrator.** Voice B (free, local) is the draft voice for the script read and the first cut;
   Luc replaces it after G2.
8. **Character lines use free local voices.** Each cast member gets one voice designed with local Qwen3 VoiceDesign
   (the recipe behind voice B), fitted to that character (a girl sounds like a girl). It is chosen by ear once, stored
   with the character in the cast library and reused in every film, in the first cut and the final. Lines are under
   about 6 words (L3.2), so they cost nothing.
9. **Pacing is a guide, not a hard rule.** Something meaningful changes about every 4–5 s (L8), but a longer hold is
   allowed where it makes sense (a joke landing, a held reaction). `sheetcheck.py` warns on a hold over 5 s unless the
   shot carries a `hold:` reason; a warning never blocks a render or a gate.
10. **Thumbnails get their own skill.** The L2 rules and the thumbnail prompts live in a thumbnail skill (see Prompts
    and skills), not in the kit.

## What is shared and what each film adds

### The engine: `core/engines/suppose/`

Set up like the Professor of Us engine (`core/engines/pou/`), so `make test` covers its tests.

- **`kit/`**: a Remotion 4 package (pinned to the pilot's version, 4.0.484) copied from the pilot, without the earlier
  experiments (`LookA`, `LookB`, `LookC`, `CutoutC`, `CutoutC2`, `Cast2`, `ManRig`, `ScarfRig`, `Scarf2D`,
  `People2D`, `MotionC`).
  - `rig/`: `Person` (from `Person.tsx`), `Puppet`, `BigFace`, the joints with the v8 arms (reach ×1.44 of the waist
    cut, elbow at 0.86), `strideAt`, and the cast scale (`personH`, `PEER` 0.88, Scarf sets the scale).
  - `film/`: `Cam` and `View` with the edge clamp, `Crowd` (height at depth per set, feet never slide, kinds and tints),
    one `Readout` design (L5), fact pills with an optional source line (L9), rule cards, the title, grade and grain.
  - `actions/`: functions that return a pose over time. The first set: `walkIn`, `walkOut`, `stop`, `wave`, `point`,
    `shout`, `lookAt`, `react(mood)` (neutral, smug, shocked, worried, proud, sad), `hold(prop)`, `turn`, `idle`
    (blink, breathe, drift).
  - `shots/`: the shot-sheet renderer. It reads a film's `shots.yaml`, builds each shot from a library set, the cast
    and actions, and slots in custom shots by id from the film's `custom/` folder.
- **`scripts/`** (Python, under the code-health gates):
  - `slice.py`: from the pilot, unchanged in behaviour.
  - `rig.py`: `rig4.py` generalised. A small mapping file per parts sheet (which piece is the head, torso, arms, legs,
    any split leg pieces, the hip line) replaces the hard-coded `CAST`. It measures shoulders, hips and the face, and
    writes the cast entry into the library. It also renders a rig check sheet (the `CastTest4` pose set) for every new
    character.
  - `stitch.py` and `timewarp`: per-line narration takes trimmed and stitched into a cue sheet; the cut is written on
    voice B's word times and warped onto Luc's, so every action stays on its word.
  - `mix.py`: `pilot_mix.py` generalised. Narration, a score ducked under the voice, ambience per set, and sound
    effects cued from the shot sheet. Every sound has faded edges, it loudnorms to -16 LUFS and -1.5 dBTP, and the
    clicks check runs on the result.
  - `review.py`: builds the film's review page.
  - `sheetcheck.py`: validates a shot sheet before any render (see Errors).

### The channel library: `channels/say-suppose/library/`

- `cast/`: Scarf (full colour, BigFace, fixed in every film, L7) and the seven style-A extras (salaryman, office
  worker, student, gent, gran, packer, worker). Each entry has its parts, its natural height, role tags and its
  character voice (Decision 8).
- `sets/`: one folder per painted place, with its plates (any of wide, close, high) and a `set.json`: floor line,
  height at depth, Scarf's scale, clear zones for the empty space around a subject, camera bounds, and the ambience
  bed. The pilot's Tokyo station (wide, close, high) is the first set.
- `scores/`: paid score cues the channel keeps, reused as temp scores for first cuts and as finals where they fit.
  The pilot's ElevenLabs cue is the first.
- `props/`: props cut from parts sheets (the rice ball, the phone).

Images and audio stay out of git. A committed `manifest.yaml` records each file's Higgsfield job id, prompt, reference
media and sha256, so a fresh clone can fetch them again and a changed file is caught. The pilot's painted pieces,
plates and audio exist today only in the git-ignored `remotion/public/` of the worktree
`.claude/worktrees/youtube-channel-optimization-6473b3`; the library is seeded by copying them from there (never
committing them) and recording each in the manifest.

### Each film: `channels/say-suppose/videos/<id>/`

- `premise.md`, `script.md`, `claims.md` (the claims ledger).
- `art.yaml`: library sets and cast the film reuses, and new sets, characters and props with their prompts, references
  and credit quote. New art joins the library once the film passes G3, so later films get cheaper.
- `shots.yaml`: one entry per shot: id, start and end (voice B seconds), set and angle, camera move, who is in it and
  what each does (actions with times), readout changes, labels, sound effects, and optional `custom: <id>`.
- `custom/*.tsx`: the hero beats.
- `audio/`, `qc/`, the review page, the OpenMontage checkpoints.

### Rules for the boundary

- A film session never changes the kit, the engine or the library code. It records the need with `omni fix` and
  carries on. Kit changes are their own PRs, between films.
- Every kit PR re-renders the pilot reference frames (see Testing) before it merges.

## From topic to a 720p first cut

The channel gets a new format, `film`, mapped to a new pipeline `studio-suppose`
(`core/openmontage/pipeline_defs/studio-suppose.yaml`, a new file with `studio` in the name). It keeps the five stage
names of `studio-whatif`, so `omni approve`, the stage checks, the media proofs and the signed upload work unchanged.
Its stage skills are new files, `skills/studio/studio-suppose-*.md`. The v1 format `story: studio-whatif` stays in
`channel.yaml` because tests read it.

1. **Topic.** The `say-suppose-topics` room runs with L1 as hard rules ("What if you…", one picturable frame, a number
   or status payoff, 37–49 characters, the click test). The owner picks the premise.
2. **G1 packet** (`proposal`):
   - the title and 3 thumbnails made by the thumbnail skill (GPT Image 2.6 with Scarf as the reference, caption and
     number set in code in the channel typeface), shown in a phone feed mock beside benchmark thumbnails;
   - the five lines and `> UNDER:` the stage already asks for;
   - a 12-beat outline in the L4 shape: cold open with one absurd detail, title by about 0:50, at most 3 rules, the
     power escalating, a dilemma promised early, a climax choice that costs something, a callback, a twist into a
     possible Part 2, one question to the viewer;
   - the art list from `art.yaml`, with the total credit quote.

   **G1**: the owner passes the packaging and OKs the art spend.
3. **After G1, two tracks at once:**
   - Words: the full script (L3 narrator to "you", short character lines every 15–20 s), the claims ledger, then
     voice B narration and the character lines in their own free voices, local. The owner reads the script and
     listens to the track. Their notes are applied before animation starts.
   - Art: the approved GPT Image calls, then `slice.py`, `rig.py` and a rig check sheet for each new character.
     `set.json` is measured for each new set.
4. **First cut:**
   - whisper word times on the voice B track; the shot sheet is written on them; custom TSX for the hero beats;
   - a temp score from `library/scores/`; `mix.py` at -16 LUFS;
   - a 720p render through `studio.jobs run --queue render`;
   - QC: loudness, clicks, on-screen text off faces and never overlapping, and every hold over 5 s listed with its
     reason (L8, a guide).
5. **G2** (`story_script`): the owner reviews the review page: the cut, the script with timestamps, the voice B track,
   benchmark frames at matching timestamps and the QC numbers.

After G2:

- Luc narration, paid: quote first, one job per line, each take's whisper transcript checked against the script (Luc
  can repeat phrases), trimmed and stitched, then the time warp.
- The final score, paid and quoted, or a library cue if it fits.
- The owner's notes applied, then a 1080p render.
- **G3** picture lock (`final_edit`), **G4** final watch at 1x with cold viewers (`final_watch`), **G5** private
  upload (`publish_prep`); the public flip is by hand in YouTube Studio.

Any paid call beyond what a gate approved (a retake, an extra set) needs its own quote and the owner's OK.

## The review page

`review.py` builds one page per film and stage, published as an Artifact:

- the cut in a player, with the script beside it and each line's timestamp;
- at G1, the thumbnails in a phone feed mock with benchmark thumbnails, and the outline and art list with its quote;
- benchmark frames at matching timestamps;
- QC: integrated loudness, true peak, clicks, holds over 5 s with their reasons, render minutes per film minute;
- the five-quality look checklist (L6.2) for the cut, ticked by the agent and confirmed by the owner;
- the owner's notes as a to-do list, each marked applied or with a one-line reason why not.

## Prompts and skills

The owner's focus for the next round. Every prompt the channel sends to a model is a committed file, so films reuse
what has worked instead of rewriting prompts each time.

- **Prompt library: `channels/say-suppose/prompts/`.** One file per kind of call, each with the model and settings, the
  prompt template with its blanks (place, character, premise prop), the reference media to attach, and the pilot job
  it came from:
  - `set-plate.md`: a painted set in style A (GPT Image 2.6, high, 2K, 16:9), one per angle;
  - `parts-sheet.md`: a character parts sheet in the cast's layout, so `rig.py` can map it;
  - `cast-lineup.md`: a new character in the style A lineup, before its parts sheet;
  - `thumbnail.md`: the thumbnail art (used by the thumbnail skill);
  - `narration.md`: how Luc is directed (storyteller, never documentary, one job per line);
  - `character-voice.md`: the Qwen3 VoiceDesign description for a character's voice;
  - `score.md`: the ElevenLabs Music brief for a film's cues.

  Each file starts from the prompt that made the pilot's approved result, read back from its Higgsfield job, and is
  finalised with the owner's next round of suggestions before the first film.
- **Thumbnail skill: `say-suppose-thumbnails`.** Makes the G1 thumbnails from `prompts/thumbnail.md` and holds the L2
  and L5 rules: one face readable at about 170 px, one premise prop, a lit ground with depth, at most 3 words or one
  number; a premise number as a glowing label in the world, the same readout as the film; a caption that adds the
  stake or the emotion and never repeats the title; three variants checked at feed size beside the benchmark; a note
  to the owner to run Test & Compare after upload.
- **Stage skills: `skills/studio/studio-suppose-*.md`.** One per gate, each naming the prompts and kit tools its stage
  uses.
- **Topic skill.** `say-suppose-topics` already exists; it gets the L1 rules as hard constraints if it does not carry
  them yet.

## Learnings checklist

Where each learning (`docs/research/2026-11-27-say-suppose-learnings.md`) is applied, with the owner's overrides.

| Learning | Applied in |
|---|---|
| L1 premise and title | Topic skill and the G1 packet: "What if you…", one frame, a payoff, 37–49 characters, the click test |
| L2 thumbnail | Thumbnail skill. GPT Image 2.6 only (Decision 5 overrides L2.1) |
| L3 voice | Script stage: narrator to "you"; Luc after G2 (Decision 7); character lines in free local voices (Decision 8) |
| L4 script | The 12-beat outline at G1 and the script stage; no padding; facts in the claims ledger, cut where they distract |
| L5 one number | One `Readout` design in the kit; changes only on story beats (`sheetcheck` warns); the same readout in the thumbnail; never forced |
| L6 look | Kit and library keep one look; the five-quality checklist on every review page; render time measured |
| L7 "you" | Scarf fixed in the cast library, with one signature attitude carried in every film and thumbnail |
| L8 pacing | `sheetcheck`: every shot has a character acting; holds over 5 s warn unless given a reason (Decision 9). BigFace keeps its mouth (Decision 6); no lip-sync |
| L9 series and sign-off | Twist into a Part 2 in the outline; source line under fact pills; full sources in the description from the claims ledger at G5; one closing line tying like and subscribe to the climax choice |

## Credits per film

From free Higgsfield quotes taken on 2026-11-27: GPT Image 2.6 (high, 2K, 16:9) costs 2 credits an image; Luc (ElevenLabs
v4 preset) about 0.006 credits a character; ElevenLabs Music v2.5 about 0.145 credits a second.

| Item | Credits |
|---|---|
| New sets: about 4 places × 2 angles, plus retakes | 16–24 |
| New characters: 1–2 parts sheets | 2–6 |
| Thumbnails: 3, plus a second round | 6–12 |
| Luc narration: about 9,000 characters, ×1.4 for retakes | about 75 |
| Score: 3–4 cues of 60–90 s | 30–50 |
| **Typical 10-minute film** | **about 130–170** |

The first film costs more, about 200–250, because the library holds only the station. At the 2026-11-27 balance of
1,731 credits that is roughly 9–11 films. Every one of these is still announced with tool, model and cost and run
only on the owner's OK; the G1 approval covers the listed art.

## Errors

- **A parts sheet that does not rig:** wrong piece count, merged pieces, a missing limb. `rig.py` stops, names the
  sheet, and writes a numbered contact sheet of the pieces so the mapping file can be fixed. A new sheet is a new paid
  call and needs the owner's OK.
- **A shot sheet that does not build:** `sheetcheck.py` runs before any render and fails on an unknown set, angle,
  character, prop, action or custom id; overlapping or gapped shot times; a shot past the narration's end; a camera
  move outside the set's bounds; a shot where no character acts (a camera move over a still set is a slide, L8.3).
  It warns, without failing, on a hold over 5 s that has no `hold:` reason, and on a readout change that is not on a
  marked story beat (L5.2).
- **A take that does not match the script:** the take is trimmed or retaken (a retake beyond the quote needs an OK).
- **The render queue is held:** `studio.jobs` waits; with `--no-wait` it exits 75 and the session says who holds it.
- **A library file that changed or is missing:** the manifest's sha256 check fails before render, and the file is
  fetched again from its Higgsfield job.

## Testing

- **The kit reproduces pilot v8.** The pilot is rebuilt on the kit: its shots as a shot sheet where the actions fit,
  the rest as custom shots. Frames at 8 timestamps are compared with the v8 render, and the mean pixel difference
  must stay under a small threshold set in the plan. Then the owner watches the two side by side. This is the
  acceptance test for the kit and the check every kit PR re-runs.
- Python tests for `slice.py` and `rig.py` (a small synthetic sheet), `sheetcheck.py` (each failure above),
  `mix.py` (fades, ducking, loudness of a short synthetic mix) and `stitch.py`.
- A pipeline test: `studio-suppose` loads, has the five stages, and names the same checks as `studio-whatif`.

## Out of scope

- A real film, its premise or its art. The first film starts in its own session after this kit lands.
- Shorts, dubbing, cadence and the sequel threshold (L9, parked).
- Removing the v1 `studio-whatif` pipeline or the whatif engine.
- Any change to gates, the approval key or upload rules.
