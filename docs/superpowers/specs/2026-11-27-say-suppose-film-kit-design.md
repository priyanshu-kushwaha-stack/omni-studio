# Say Suppose: the film kit

Owner approved the design in sections, 2026-11-27. It turns the look of pilot v8 ("What if only 100 people could ever
see you?", `channels/say-suppose/pilot/only-100/`) into a repeatable way to make every Say Suppose film. No real film is
started by this work.

## Why

On 2026-11-27 the owner passed pilot v8 as clearing the bar beside Awaken and YOUniverse. The pilot is 60 s with 14
shots, each built by hand in `Pilot60.tsx` (386 lines). A Say Suppose script is **900–1,050 words** (owner, 2026-11-27, from
the master script prompt), about 7 minutes in Luc's pace (141 words a minute in the pilot): about 90–110 shots and 5–8
sets. Building every shot by hand would be seven times the pilot's code per film, so the pilot's parts become a shared kit, and most shots become lines in a shot sheet.

The nine learnings (`docs/research/2026-11-27-say-suppose-learnings.md`) stay the brief for every film. Every rule in
CLAUDE.md still binds: the owner passes every gate, no paid call without the owner's OK, renders go through
`studio.jobs --queue render`, agents never upload.

## Decisions (owner, 2026-11-27)

1. **Scripts run 900–1,050 words** (never under 800 or over 1,100), about 7 minutes. This replaces the 8–12 minute
   design. No padding: a short script gets another consequence beat or a deeper climax, never filler.
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
11. **Body and mind first.** The main lane is one human ability or perception of the viewer's own, pushed to an
    extreme and walked through with real science. A strong "what if you" outside it (like the pilot's "only 100
    people could ever see you") can still be picked.
12. **The hero is never named.** Scarf is always "you". Side characters call him "dude", "mate" or a nickname, never a
    name that fixes a gender, age or country (L7.5). This overrides the script prompt's "Your name is Max".
13. **Topics come from one prompt.** One model runs `prompts/topic.md` and returns 35 titles; the owner picks. This
    replaces the three-model idea room and its blind scorer.
14. **The master prompts are the base.** The owner's topic and script prompts (2026-11-27) are the starting text of
    `prompts/topic.md` and `prompts/script.md`, adapted only where a decision above overrides them.

## What is shared and what each film adds

### The engine: `core/engines/suppose/`

Set up like the Professor of Us engine (`core/engines/pou/`), so `make test` covers its tests.

- **`kit/`**: a Remotion 4 package (pinned to the pilot's version, 4.0.484) copied from the pilot, without the earlier
  experiments (`LookA`, `LookB`, `LookC`, `CutoutC`, `CutoutC2`, `Cast2`, `ManRig`, `ScarfRig`, `Scarf2D`,
  `People2D`, `MotionC`).
  - `rig/`: `Person` (from `Person.tsx`), `Puppet`, `BigFace`, the joints with the v8 arms (reach ×1.44 of the waist
    cut, elbow at 0.86), `strideAt`, and the cast scale (`personH`, `PEER` 0.88, Scarf sets the scale).
  - `film/`: `Cam` and `View` with the edge clamp, `Crowd` (height at depth per set, feet never slide, kinds and tints),
    one `Readout` design (L5), fact pills with an optional source line (L9), rule cards, the title, grade and grain,
    and the workflow toolkit (W3–W7 below): camera roll and shake, `Rim` (a rim light from the set's key-light side),
    far-limb depth shading, `Atmosphere` (dust motes, rain, fog bands, god rays, lens streaks, stars), `Foreground`
    (a soft blurred near layer), `Letterbox` (scope bars for drama beats), `FreezeFrame` (time-stop with a flash, a
    cool tint, hanging particles and a corner badge), `Afterimage` (speed trails), data graphics (`DataCard` with a
    counter and curve, `Compare` bars, `Dimension` arrows, `Callout` labels, `Meter`, `Badge`, `Blueprint` diagrams)
    and `EndScreen` (the closing question in serif italic, a comment bubble, a subscribe pill, the cast lined up).
  - `actions/`: functions that return a pose over time. The first set: `walkIn`, `walkOut`, `stop`, `wave`, `point`,
    `shout`, `lookAt`, `react(mood)`, `hold(prop)`, `turn`, `idle` (a blink every 2.5–4 s, breathing, drift), plus
    `run`, `reach`, `shrug`, `cheer`, `armsCrossed`, `explain` (one arm out) and `handOff`. The moods are the
    workflow's named set (W2): neutral, smile, happy, joy, surprised, shocked, scared, worried, nervous, angry,
    determined, sad, cry, smirk, sleepy, thinking, confused, awe, each mapped onto BigFace for Scarf and onto the
    eyes and brows of the rest of the cast.
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

1. **Topic.** The topic skill runs `prompts/topic.md` and returns 35 titles (Decision 13). The owner picks the
   premise.
2. **G1 packet** (`proposal`):
   - the title and 3 thumbnails made by the thumbnail skill (GPT Image 2.6 with Scarf as the reference, caption and
     number set in code in the channel typeface), shown in a phone feed mock beside benchmark thumbnails;
   - the five lines and `> UNDER:` the stage already asks for;
   - three alternative titles, a one-paragraph synopsis, and the character reference: every cast member in the film
     with their role and signature item (W10);
   - an outline in the script prompt's ten-step arc (see Prompts and skills): the cold open, the one rule that limits
     the power, the consequence beats, the hidden cost, the heart and its planted detail, the crisis and its either/or,
     the resolution, whether "Is any of this real?" is used, the sting;
   - the art list from `art.yaml`, with the total credit quote.

   **G1**: the owner passes the packaging and OKs the art spend.
3. **After G1, two tracks at once:**
   - Words: the full script from `prompts/script.md`, checked by `scriptcheck.py`; the cast pass
     (`prompts/cast-pass.md`) tags the character lines and lists the claims for the ledger; then
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
  - `topic.md`: the owner's master topic prompt. Kept: the three title formats ("You Had [amount]", "[unit] Felt
    Like [extreme]", "Your [ability] Was [N]x [Faster…]"), "What If" and a question mark, one change only, a round
    dramatic number, understood in under two seconds, Title Case, 6–8 words, a curious and awed tone with no bait
    words, at most one ladder variant in five, and the "must carry a whole video" test. Adapted: the lane is body and
    mind first (Decision 11); the example titles are labelled as benchmark titles, not ours, and "no repeats" covers
    every title of the ten benchmark channels;
  - `script.md`: the owner's master script prompt. Kept: 900–1,050 words; one paragraph of spoken text; character
    lines inline, no speaker names; numbers in words, metric units; second person, present tense; the voice targets;
    the ten-step arc (cold open, baseline and rule and title question, consequence montage, hidden cost, the heart with
    a planted detail, crisis and an either/or choice, resolution where the hero picks people, an optional "Is any of
    this real?", sting, CTA); the small cast; one signature line; at least five real facts and nothing invented; the
    series rules for a Part 2. Adapted: the hero is never named (Decision 12); the sample paragraph of "the channel's
    own words" is replaced by a passage from our own pilot, so we never imitate a benchmark's sentences;
  - `cast-pass.md`: run on the finished script. It returns the same text with each character line tagged with its
    speaker and the cast library character who plays them, for the free character voices (Decision 8), and lists
    every factual claim for the claims ledger. The spoken text does not change;
  - `shots.md`: turns the script into the first draft of `shots.yaml`. It first splits the narration into beats of
    about 13 words (never more than 15, about 6 s each), then gives each beat a shot type from the vocabulary (W1),
    a set and angle, a camera move, who is in frame and what each does, the expression change on the beat word, any
    number to show on screen, readout changes, the mood of the light, and holds with their reasons;
  - `set-plate.md`: a painted set in style A (GPT Image 2.6, high, 2K, 16:9), one per angle. Self-contained every
    time, ending in a fixed style A footer and negatives (W8): no people, no text, no logos; one strong visible light
    source; 60–75% of the frame in dark mid-tones with 1–3 bright accents; a bright area where the characters will
    stand; depth layers from far to near; walls, floor and sky painted past the frame edge so camera moves never
    show an edge;
  - `parts-sheet.md`: a character parts sheet in the cast's layout, so `rig.py` can map it;
  - `cast-lineup.md`: a new character in the style A lineup, before its parts sheet;
  - `thumbnail.md`: the thumbnail art (used by the thumbnail skill);
  - `narration.md`: how Luc is directed, one job per line: a warm, clear storyteller, conversational and slightly awed,
    natural pauses at ellipses, weight on contrast words and numbers, emotional moments a little slower, never
    robotic, shouty or documentary (W9);
  - `character-voice.md`: the Qwen3 VoiceDesign description for a character's voice;
  - `score.md`: the ElevenLabs Music brief for a film's cues.

  Each file starts from the prompt that made the pilot's approved result, read back from its Higgsfield job, and is
  finalised with the owner's next round of suggestions before the first film.
- **Thumbnail skill: `say-suppose-thumbnails`.** Makes the G1 thumbnails from `prompts/thumbnail.md` and holds the L2
  and L5 rules: one face readable at about 170 px, one premise prop, a lit ground with depth, at most 3 words or one
  number; a premise number as a glowing label in the world, the same readout as the film; a caption that adds the
  stake or the emotion and never repeats the title; three variants checked at feed size beside the benchmark; a note
  to the owner to run Test & Compare after upload.
- **Script check: `core/engines/suppose/scripts/scriptcheck.py`.** Measures every draft before the owner reads it,
  against the script prompt's targets: 900–1,050 words (fails under 800 or over 1,100); about 4–5 words a sentence,
  about half at four words or fewer, almost none past fifteen; 18–25 ellipses; 15–20 questions; about seven "you" or
  "your" per 100 words; numbers written in words (years excepted); no speaker labels, quotation-mark dialogue,
  headings or stage directions; the hero never given a name. Word count and format fail; the voice targets warn, and
  the numbers go on the review page.
- **Stage skills: `skills/studio/studio-suppose-*.md`.** One per gate, each naming the prompts and kit tools its stage
  uses.
- **Topic skill.** `.claude/skills/say-suppose-topics/` is rewritten around `prompts/topic.md`: one model, 35 titles,
  the owner picks. The three-model room and the blind scorer are retired (Decision 13).

## Learnings from the "What If animation" workflow

The owner's final input (2026-11-27): a third-party guide with a manual and an agentic master prompt for this genre.
Its visual rules describe a dark-ink stick-figure look; ours stays style A (painted cut-outs, colour Scarf, BigFace)
as it cleared the bar. What we take is the film craft, translated to our kit:

- **W1 Shot vocabulary.** Every film mixes, in about these shares: establishing wide 10% (opens each new place, small
  figures, slow push-in), medium two-shot 25%, over-the-shoulder 10% (a big blurred near figure, the other sharp),
  giant face close-up 10–15% (reactions and "you" moments, the place blurred and darker behind), insert or macro 10%
  (a hand, a phone screen, a watch), top-down or diagram 5%, one to three freeze-frames, plus data cards, blueprint
  diagrams, the title card and the end screen. Never the same type twice in a row. Compose on thirds; only the giant
  close-up is centred.
- **W2 Acting on the beat.** Expressions change on the word that earns them, from the named set (see `actions/`).
  Everyone blinks every 2.5–4 s and breathes, so nobody is frozen. Talking is shown by expression, head and hands;
  there is no lip-sync and the narrator never has a mouth on screen.
- **W3 Camera never fully still.** Every shot has a push-in, a lateral drift, a pull-out for a reveal, a slight roll
  for unease or a shake for an impact. Moves stay inside one set; a hard cut is a change of place.
- **W4 A populated world.** Most scenes have two or three characters. When the narration mentions someone reacting,
  speaking or watching, they are in frame with a visible reaction. No more than about four characters in focus;
  background crowds are fine. Everyone has ground contact and a contact shadow.
- **W5 Every spoken number on screen.** A number or measurement the narrator says appears as it is spoken, at most
  one or two short labels at once, popped in with a bouncy scale and a soft blip, faded before the cut. Gold for key
  numbers, coral for alarming ones, cream for labels, blueprint blue for diagrams. The premise number stays the one
  `Readout` (L5); other numbers use the data graphics. Science segments and "Is any of this real?" use the
  `Blueprint` look: a navy grid, light-blue line art, gold highlights, labels on the words.
- **W6 The cast system.** Each recurring character keeps one signature item and colour for the whole film, chosen to
  differ in garment type and headwear so they read at small sizes. Scarf's colour is never used on anyone else.
  Crowd extras carry no signature colour (the existing desaturated tints). Children stand at 0.72 of adult height.
  New characters are made from roles (best friend, scientist, skeptic, authority, kid, antagonist) in
  `prompts/cast-lineup.md`, each with one signature item.
- **W7 Light, depth and atmosphere.** One key light per set with a visible source and its spill. Characters get a rim
  light on the side facing that source (`Rim`, from the set's key-light direction in `set.json`) and far limbs a
  touch darker. Most medium shots have something soft in the foreground. Nearly every shot has atmosphere (dust,
  rain, fog, god rays, lens streaks, stars). The mood follows the beat: tense goes darker and cooler, tender or
  triumphant goes warm, explanation goes to the dark void or blueprint. Scope letterbox bars (2.39:1) animate in for
  the title, freeze-frames, the climax and intense close-ups; other shots keep the v8 full frame.
- **W8 Self-contained image prompts.** Every GPT Image prompt describes everything from scratch, never "same as
  before", and ends with the fixed style A footer and its negatives. A character in a parts sheet or thumbnail is
  re-described in full each time, with the reference image attached.
- **W9 Narration direction.** The voice instruction above goes into `prompts/narration.md`.
- **W10 The G1 packet.** Title plus three alternatives, a one-paragraph synopsis and the character reference.
- **W11 Look check before the full cut.** The cold open (about 30 s) renders first at 720p, and the agent checks it
  against W1–W7 and the five qualities (L6.2) before rendering the whole film. Not an owner step.
- **W12 Quality checklists.** Each prompt ends with its own checklist, and the model fixes any failure before
  answering. `scriptcheck.py` and `sheetcheck.py` re-check the measurable items.

Not taken: per-clip AI image and video generation (we animate locally and reuse sets), the 35-clip cap, the aspect
question (16:9), the "no approval step" rule (our gates stand), the stick-figure character design and its colours,
and the third-party render plugin.

## Learnings checklist

Where each learning (`docs/research/2026-11-27-say-suppose-learnings.md`) is applied, with the owner's overrides.

| Learning | Applied in |
|---|---|
| L1 premise and title | Topic prompt: "What If…?", one change to the viewer, a round dramatic number, 6–8 words, the three title formats, the click test; body and mind first (Decision 11) |
| L2 thumbnail | Thumbnail skill. GPT Image 2.6 only (Decision 5 overrides L2.1) |
| L3 voice | Script stage: narrator to "you"; Luc after G2 (Decision 7); character lines in free local voices (Decision 8) |
| L4 script | Script prompt's ten-step arc, outlined at G1; 900–1,050 words, no padding; facts in the claims ledger, cut where they distract |
| L5 one number | One `Readout` design in the kit; changes only on story beats (`sheetcheck` warns); the same readout in the thumbnail; never forced |
| L6 look | Kit and library keep one look; the five-quality checklist on every review page; render time measured |
| L7 "you" | Scarf fixed in the cast library, never named (Decision 12), with one signature attitude carried in every film and thumbnail |
| L8 pacing | `sheetcheck`: every shot has a character acting; holds over 5 s warn unless given a reason (Decision 9). BigFace keeps its mouth (Decision 6); no lip-sync |
| L9 series and sign-off | Twist into a Part 2 in the outline; source line under fact pills; full sources in the description from the claims ledger at G5; one closing line tying like and subscribe to the climax choice |
| W1–W12 workflow | Kit toolkit and actions, `prompts/shots.md`, `prompts/set-plate.md`, `prompts/narration.md`, `sheetcheck.py`, the G1 packet and the cold-open look check |

## Credits per film

From free Higgsfield quotes taken on 2026-11-27: GPT Image 2.6 (high, 2K, 16:9) costs 2 credits an image; Luc (ElevenLabs
v4 preset) about 0.006 credits a character; ElevenLabs Music v2.5 about 0.145 credits a second.

| Item | Credits |
|---|---|
| New sets: 3–4 places × 2 angles, plus retakes | 12–20 |
| New characters: 1–2 parts sheets | 2–6 |
| Thumbnails: 3, plus a second round | 6–12 |
| Luc narration: about 6,000 characters (1,000 words), ×1.4 for retakes | about 50 |
| Score: 2–3 cues of 60–90 s | 20–40 |
| **Typical 7-minute film** | **about 90–130** |

The first film costs more, about 150–190, because the library holds only the station. At the 2026-11-27 balance of
1,731 credits that is roughly 13–17 films. Every one of these is still announced with tool, model and cost and run
only on the owner's OK; the G1 approval covers the listed art.

## Errors

- **A parts sheet that does not rig:** wrong piece count, merged pieces, a missing limb. `rig.py` stops, names the
  sheet, and writes a numbered contact sheet of the pieces so the mapping file can be fixed. A new sheet is a new paid
  call and needs the owner's OK.
- **A shot sheet that does not build:** `sheetcheck.py` runs before any render and fails on an unknown set, angle,
  character, prop, action or custom id; overlapping or gapped shot times; a shot past the narration's end; a camera
  move outside the set's bounds; a shot where no character acts (a camera move over a still set is a slide, L8.3).
  It also fails on a character line whose speaker is not in frame (W4). It warns, without failing, on a hold over
  5 s that has no `hold:` reason; a readout change that is not on a marked story beat (L5.2); two shots in a row of
  the same type; a shot mix far from the vocabulary's proportions (W1); more than four characters in focus; and a
  number the narrator says that does not appear on screen (W5).
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
