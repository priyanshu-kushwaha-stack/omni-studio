# Say Suppose Film Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn pilot v8's look into a repeatable way to make every Say Suppose film: committed prompts and skills, a
shared engine (`core/engines/suppose/`), a channel art library, and a `studio-suppose` pipeline with the five owner
gates. It is proven by rebuilding the pilot on the kit.

**Spec:** `docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md` (owner approved 2026-11-27). Read it
first. Decisions are cited as D1–D14, the workflow learnings as W1–W12 and the channel learnings as L1–L9.

**Architecture:** Three parts, in order. Part A writes the prompt library, the topic and thumbnail skills,
`scriptcheck.py` and `sheetcheck.py`: everything a film's words and shot plan need. Part B builds the engine: the
Python tools (slice, rig, library, voices, stitch, time warp, mix, review), and the Remotion kit (the rig and film
parts ported from the pilot, the action library, the W toolkit, and the shot-sheet renderer). Part C adds the pipeline,
its stage skills and the channel format, then rebuilds the pilot on the kit and compares frames with v8.

**Tech stack:** Python 3.12 (numpy, scipy, Pillow, PyYAML, soundfile, pytest), Remotion 4.0.484 with React 18.3.1 and
TypeScript 5.6, vitest 2, ffmpeg. Local voices and whisper run in `.venv-media` through the what-if engine's existing
`core/engines/whatif/pipeline/local_tts.py` and `transcribe.py`.

## Global constraints

- Worktrees have no `.venv`: symlink the main checkout's (`ln -s <main>/.venv .venv`, already ignored) and run Python
  as `PYTHONPATH="$PWD/core/openmontage:$PWD/core" .venv/bin/python ...`.
- Every commit passes `make precommit` (ruff format, ruff lint with complexity 12, size budgets: a module over 500
  lines or a function over 60 fails). A test over 2 s needs `@pytest.mark.slow`.
- Never touch `channels/say-suppose/pilot/` (the frozen reference), `~/Exploration/projects/faceless-channel` or
  `~/Exploration/sandbox/openmontage`.
- Inside `core/openmontage/` add only new files with `studio` in the name, and list each in `core/PATCHES.md`.
- No paid provider call in this plan. Higgsfield GPT Image 2.6 and Luc are used only in a film, after the owner's OK
  with tool, model and cost stated first. Reading a past job's prompt back from Higgsfield is free.
- Images, audio and renders stay out of git. The library commits only its manifest and JSON.
- Renders go through `.venv/bin/python -m studio.jobs run --step <name> --channel say-suppose --video <id> --queue
  render -- <command>`, one at a time.
- Remotion packages are pinned exactly in `core/lock.yaml` and installed with `pnpm install --frozen-lockfile`.
- No agent runs `omni approve`, reads the approval key, uploads, or passes a gate.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## File map

```
channels/say-suppose/prompts/
  sources/owner-topic-prompt.md, sources/owner-script-prompt.md   (committed with this plan, verbatim)
  README.md            how prompt files are laid out and used
  topic.md outline.md script.md cast-pass.md shots.md narration.md character-voice.md
  set-plate.md parts-sheet.md cast-lineup.md thumbnail.md score.md
.claude/skills/say-suppose-topics/SKILL.md     rewritten: one prompt, 35 titles (D13)
.claude/skills/say-suppose-thumbnails/SKILL.md new (D10, L2, L5)
channels/say-suppose/library/
  .gitignore manifest.yaml cast/cast.json cast/maps/*.yaml sets/station/set.json props/props.json scores/scores.json
core/engines/suppose/
  README.md
  scripts/  scriptcheck.py sheet.py sheetcheck.py slice.py rig.py library.py voices.py stitch.py timewarp.py
            sfx.py mix.py review.py framediff.py
  tests/    conftest.py test_*.py (one per script, plus test_prompts.py)
  kit/      package.json pnpm-lock.yaml tsconfig.json vitest.config.ts remotion.config.ts
            src/index.ts src/Root.tsx
            src/rig/{types.ts,keys.ts,Puppet.tsx,Person.tsx,scale.ts}
            src/film/{Cam.tsx,Set.tsx,Crowd.tsx,Readout.tsx,Grade.tsx,Cards.tsx}
            src/toolkit/{Rim.tsx,Atmosphere.tsx,Foreground.tsx,Letterbox.tsx,FreezeFrame.tsx,Afterimage.tsx,
                         Data.tsx,Blueprint.tsx,EndScreen.tsx,camera.ts,palette.ts}
            src/actions/{moods.ts,acts.ts,index.ts}
            src/shots/{types.ts,Film.tsx,ShotView.tsx,register.tsx}
            src/demo/Toolkit.tsx
            tests/*.test.ts(x)
  examples/only-100/  shots.yaml custom/*.tsx index.ts README.md
core/openmontage/pipeline_defs/studio-suppose.yaml
core/openmontage/skills/studio/studio-suppose-{proposal,script,edit,final-watch,publish}.md
core/studio/testgate.py, core/studio/tests/test_testgate.py, Makefile   (two new suites)
core/studio/tests/test_studio_suppose.py
channels/say-suppose/channel.yaml   (format film, loudness film)
core/PATCHES.md, core/lock.yaml
```

---

# Part A: prompts and skills

### Task 1: The prompt library layout and its test

**Files:**
- Create: `channels/say-suppose/prompts/README.md`
- Create: `core/engines/suppose/tests/conftest.py`
- Create: `core/engines/suppose/tests/test_prompts.py`

**Interfaces:**
- Produces: the prompt file format every later prompt task follows. A prompt file has, in this order, the headings
  `# <name>`, a `Model:` line, a `Used by:` line, a `Source:` line, `## Inputs`, `## Prompt`, `## Checklist`.
  Blanks in the prompt are `{{snake_case}}`, and every blank is listed under `## Inputs` as `- {{name}}: meaning`.

- [ ] **Step 1: Write the failing test**

`core/engines/suppose/tests/conftest.py`:

```python
from studio.pytest_speed import pytest_configure, pytest_runtest_makereport  # noqa: F401 (hooks)
```

`core/engines/suppose/tests/test_prompts.py`:

```python
"""Every Say Suppose prompt file follows the layout in channels/say-suppose/prompts/README.md."""

import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[4]
PROMPTS = ROOT / "channels" / "say-suppose" / "prompts"
EXPECTED = [
    "topic", "outline", "script", "cast-pass", "shots", "narration", "character-voice",
    "set-plate", "parts-sheet", "cast-lineup", "thumbnail", "score",
]
HEADINGS = ["# ", "Model:", "Used by:", "Source:", "## Inputs", "## Prompt", "## Checklist"]
BLANK = re.compile(r"\{\{([a-z_]+)\}\}")


def prompt_files() -> list[Path]:
    return sorted(p for p in PROMPTS.glob("*.md") if p.name != "README.md")


def test_readme_names_the_layout():
    text = (PROMPTS / "README.md").read_text(encoding="utf-8")
    for h in HEADINGS:
        assert h.strip() in text


@pytest.mark.parametrize("path", prompt_files(), ids=lambda p: p.stem)
def test_prompt_file_layout(path: Path):
    text = path.read_text(encoding="utf-8")
    at = [text.find(h) for h in HEADINGS]
    assert all(i >= 0 for i in at), f"{path.name}: missing one of {HEADINGS}"
    assert at == sorted(at), f"{path.name}: headings out of order"
    assert not re.search(r"\b(TODO|TBD|FIXME)\b", text), f"{path.name}: placeholder left in"
    inputs = text[text.index("## Inputs") : text.index("## Prompt")]
    body = text[text.index("## Prompt") : text.index("## Checklist")]
    for name in set(BLANK.findall(body)):
        assert f"{{{{{name}}}}}" in inputs, f"{path.name}: blank {{{{{name}}}}} not listed under Inputs"


def test_every_expected_prompt_exists():
    have = {p.stem for p in prompt_files()}
    missing = [n for n in EXPECTED if n not in have]
    assert not missing, f"prompt files still to write: {missing}"
```

- [ ] **Step 2: Run it and see it fail**

Run: `PYTHONPATH="$PWD/core/openmontage:$PWD/core" .venv/bin/python -m pytest core/engines/suppose/tests/test_prompts.py -q`
Expected: FAIL. `README.md` is missing and every expected prompt is missing.

- [ ] **Step 3: Write `channels/say-suppose/prompts/README.md`**

```markdown
# Say Suppose prompts

Every prompt the channel sends to a model is a file here, so films reuse what has worked
(spec: docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md, "Prompts and skills").
`sources/` keeps the owner's master prompts verbatim; never edit them.

## Layout of a prompt file

    # <name>
    Model: <model and settings, e.g. "Higgsfield gpt_image_2_6, quality high, 2K, 16:9" or "Claude (this session)">
    Used by: <skill or stage that runs it>
    Source: <owner master prompt, pilot job id, or spec section it came from>

    ## Inputs
    - {{blank_name}}: what to put there

    ## Prompt
    The text sent to the model, with {{blank_name}} blanks.

    ## Checklist
    What the model checks and fixes before it answers (W12), and what the agent checks after.

## Rules

- A prompt is self-contained (W8): it never says "same as before"; characters are re-described in full every time.
- Paid models (GPT Image 2.6, Luc, ElevenLabs Music) run only after the owner's OK, with tool, model and cost stated.
- Change a prompt in its own commit, with the reason, so films can be traced to the prompt that made them.
- `core/engines/suppose/tests/test_prompts.py` checks the layout.
```

Leave `test_every_expected_prompt_exists` failing; Tasks 2–6 make it pass. Run the two layout tests:

Run: `... -m pytest core/engines/suppose/tests/test_prompts.py -q -k "readme or layout"`
Expected: PASS (no prompt files yet, so the parametrized test collects zero cases).

- [ ] **Step 4: Commit**

```bash
git add channels/say-suppose/prompts/README.md core/engines/suppose/tests/conftest.py core/engines/suppose/tests/test_prompts.py
git commit -m "feat(say-suppose): prompt library layout and its test"
```

### Task 2: The topic prompt and the rewritten topic skill

**Files:**
- Create: `channels/say-suppose/prompts/topic.md`
- Modify: `.claude/skills/say-suppose-topics/SKILL.md` (replace whole file)
- Test: `core/engines/suppose/tests/test_prompts.py` (add tests)

**Interfaces:**
- Consumes: Task 1 layout.
- Produces: `prompts/topic.md` with the blanks `{{made_titles}}` and `{{theme}}`. The skill writes its run to
  `channels/say-suppose/backlog/topics-<YYYY-MM-DD>/` as `prompt.md` (filled prompt) and `titles.md` (the 35).

- [ ] **Step 1: Add the failing tests**

Append to `test_prompts.py`:

```python
def _text(name: str) -> str:
    return (PROMPTS / f"{name}.md").read_text(encoding="utf-8")


def test_topic_prompt_keeps_the_owner_rules_and_the_overrides():
    t = _text("topic")
    for must in [
        "Generate 35 new video titles",
        "What If You Had [extreme amount of a trait]?",
        "What If [a unit of everyday experience] Felt Like [extreme]?",
        "What If Your [body or brain ability] Was [N]x [Faster / Stronger / Sharper / Slower]?",
        "no more than one in every five titles",
        "It must carry a whole video",
        "Length: 6–8 words",
        "Benchmark titles",
        "up to five titles outside",
        "{{made_titles}}",
    ]:
        assert must in t, must
    assert "The channel's real titles" not in t


def test_topic_skill_uses_the_prompt_and_retires_the_room():
    skill = (ROOT / ".claude" / "skills" / "say-suppose-topics" / "SKILL.md").read_text(encoding="utf-8")
    assert "channels/say-suppose/prompts/topic.md" in skill
    assert "35" in skill
    for gone in ["Gemini", "GPT-5.6", "scores them blind"]:
        assert gone not in skill
```

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_prompts.py -q -k topic`
Expected: FAIL (`topic.md` missing).

- [ ] **Step 3: Write `prompts/topic.md`**

Write the header block, then copy the body of `prompts/sources/owner-topic-prompt.md` (everything after the HTML
comment) under `## Prompt`, then make exactly these edits inside the prompt body:

1. Replace `The channel's real titles (study the voice)` with
   `Benchmark titles from channels we compete with (study the voice; never reuse or reword them)`.
2. Replace rule 2 with: `2. Keep it about the viewer's body or mind. Stay in the lane of human abilities pushed past
   their natural limits. You may include up to five titles outside that lane when the one change still lands on the
   viewer's own life (for example "What If Only 100 People Could Ever See You?"); each must pass every other rule.
   Skip space, planet, animal, history or end-of-the-world scenarios unless the twist lands directly on the viewer.`
3. Replace rule 7 with: `7. No repeats. Don't reuse or reword any title above, any title of the ten benchmark
   channels (Awaken, YOUniverse, Ifverse, Jeremy Bearimy, Minute Zero, ConChaser, Ifinite, The Hidden Why,
   Hypothetically, AI In Context), or any title in the list below.`
4. After rule 7 add: `Already made or already pitched, never repeat:` then a line `{{made_titles}}`, then
   `Theme for this run (optional; empty means any): {{theme}}`.

The file starts:

```markdown
# topic
Model: Claude (this session, no extra cost)
Used by: .claude/skills/say-suppose-topics
Source: owner master topic prompt, 2026-11-27 (sources/owner-topic-prompt.md); D11, D13

## Inputs
- {{made_titles}}: every video folder name under channels/say-suppose/videos/ and every title in
  channels/say-suppose/backlog/, one per line
- {{theme}}: the owner's theme for this run, or empty

## Prompt
```

and ends:

```markdown
## Checklist
- Exactly 35 numbered titles, titles only.
- Each starts "What If", ends "?", is Title Case and 6–8 words, with one change and a round dramatic number.
- All three formats appear; at most 7 ladder variants; at most 5 titles outside body and mind.
- None repeats or rewords a benchmark title or a line of {{made_titles}}.
- The agent then checks the length and word rules with a short script before showing the owner.
```

(The checklist names `{{made_titles}}`, which is listed under Inputs; the test only scans `## Prompt`.)

- [ ] **Step 4: Rewrite `.claude/skills/say-suppose-topics/SKILL.md`**

```markdown
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
```

- [ ] **Step 5: Run the tests**

Run: `... -m pytest core/engines/suppose/tests/test_prompts.py -q -k "topic or layout"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add channels/say-suppose/prompts/topic.md .claude/skills/say-suppose-topics/SKILL.md core/engines/suppose/tests/test_prompts.py
git commit -m "feat(say-suppose): topic prompt from the owner's master prompt; one-prompt topic skill"
```

### Task 3: The outline, script, cast-pass and narration prompts

**Files:**
- Create: `channels/say-suppose/prompts/outline.md`, `script.md`, `cast-pass.md`, `narration.md`
- Test: `core/engines/suppose/tests/test_prompts.py` (add tests)

**Interfaces:**
- Produces:
  - `outline.md` blanks `{{title}}`, `{{series_context}}`, `{{cast_library}}`. Output, the G1 words: `TITLE:`,
    `ALT TITLES:` (three), `SYNOPSIS:` (one paragraph), `CHARACTERS:` (one line each: role, cast library id or
    `new`, signature item), `RULE:` (the one limiting rule), `OUTLINE:` (the ten steps, one or two lines each, with
    `PLANTED:` and `CHOICE:` lines).
  - `script.md` blanks `{{title}}`, `{{series_context}}`, `{{outline}}`. Output: `TOPIC: <title> SCRIPT: <one
    paragraph>`.
  - `cast-pass.md` blanks `{{script}}`, `{{characters}}`. Output: a YAML document
    `lines: [{n, text, speaker}]` where `speaker` is `narrator` or a cast id, in script order, the text unchanged;
    then `claims: [{n, claim}]`.
  - `narration.md` blank `{{line}}`. The Luc direction for one line.

- [ ] **Step 1: Add the failing tests**

```python
def test_script_prompt_keeps_the_owner_rules_and_the_overrides():
    t = _text("script")
    for must in [
        "900–1,050 words", "Never under 800, never over 1,100", "ONE continuous paragraph",
        "eighteen to twenty-five", "Fifteen to twenty questions", "about seven times per hundred words",
        "The hero is never named", "Dude! Your door hates me!", "{{outline}}",
        "You're standing in the middle of the busiest train station on Earth.",
    ]:
        assert must in t, must
    for gone in ['"Your name is Max."', "Leo! Your door hates me!", "A fly buzzes past your face."]:
        assert gone not in t, gone


def test_outline_cast_pass_and_narration_prompts():
    assert all(k in _text("outline") for k in ["ALT TITLES:", "SYNOPSIS:", "CHARACTERS:", "RULE:", "PLANTED:", "CHOICE:"])
    cp = _text("cast-pass")
    assert "speaker" in cp and "claims" in cp and "unchanged" in cp
    n = _text("narration")
    assert "Luc" in n and "ellipses" in n and "never robotic" in n
```

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_prompts.py -q -k "script or outline"`
Expected: FAIL.

- [ ] **Step 3: Write `script.md`**

Header:

```markdown
# script
Model: Claude (this session, no extra cost)
Used by: core/openmontage/skills/studio/studio-suppose-script.md (after G1)
Source: owner master script prompt, 2026-11-27 (sources/owner-script-prompt.md); D1, D12, D14

## Inputs
- {{title}}: the title the owner passed at G1
- {{series_context}}: "standalone", or the previous episode's script or summary
- {{outline}}: the G1 outline (the OUTLINE, RULE, CHARACTERS and PLANTED/CHOICE lines from outline.md's answer)

## Prompt
```

Then copy the body of `sources/owner-script-prompt.md` and make exactly these edits:

1. `TOPIC: [INSERT TOPIC HERE]` → `TOPIC: {{title}}`; the SERIES CONTEXT line → `SERIES CONTEXT: {{series_context}}`;
   after it add `OUTLINE (approved at G1; follow it): {{outline}}`.
2. `The channel's real scripts run 705, 832, 1,014 and 1,021 words, and the newest sit right around 1,000.` →
   `Benchmark scripts in this genre run 705 to 1,021 words; ours sit between 900 and 1,050.`
3. `("Leo! Your door hates me!")` → `("Dude! Your door hates me!")`.
4. `The hero may also get a name that other characters use (Max, Leo): "Your name is Max."` → `The hero is never
   named. Side characters call them dude, mate or a nickname that fixes no gender, age or country.`
5. `Here is a short sample of the voice (the channel's own words).` → `Here is a short sample of the voice (from our
   pilot).` and replace the sample paragraph with: `You're standing in the middle of the busiest train station on
   Earth. Hello?! About three and a half million people pass through here every day. Not one of them turns around.
   A man stops so close his rice ball brushes your nose. He checks the departures board. Straight through your face.
   He can't see you. Nobody here can. Except a hundred people. Exactly a hundred. And you picked them.`
6. In "Characters and world", `(Max, Leo, Mia, Jake, Nova, Sam, Theo, Dr. Lee, Mr. Black)` →
   `(Mia, Jake, Nova, Sam, Theo, Dr. Lee, Mr. Black; side characters only, never the hero)`.
7. Under "Final checks before you output" add: `* The hero is never named.` and `* Every person who speaks or
   reacts is someone the picture can show (W4): use the characters in the outline.`

`## Checklist` repeats the final checks as a list and adds: `The agent runs core/engines/suppose/scripts/scriptcheck.py
on the answer and fixes every FAIL before the owner reads it.`

- [ ] **Step 4: Write `outline.md`, `cast-pass.md` and `narration.md`**

`outline.md` `## Prompt`:

```text
You are the head writer of Say Suppose, narrated animated short films where the viewer ("you") gets one extreme
change to their body or mind and lives through what it would really cost, grounded in real science.

Plan the film for this title: {{title}}
Series context: {{series_context}}
Characters you may reuse (id, role, look, signature item): {{cast_library}}

Answer in exactly this layout:
TITLE: the title, unchanged
ALT TITLES: three alternatives, each "What If…?", 6–8 words, Title Case, one change, a round dramatic number
SYNOPSIS: one paragraph: the premise, the journey, the emotional payoff
CHARACTERS: two to four side characters, one per line: role | cast library id or "new" | one signature item and
  colour that no other character and never the hero's colour uses | headwear or hair. The hero is "you", never named.
RULE: the one rule that limits the power and will decide the climax
OUTLINE: the ten steps, one or two lines each:
  1 cold open (power-in-action or flash-forward) 2 baseline, rule and title question 3 consequence montage (list the
  six to ten beats, everyday to world-scale, each with its real number) 4 hidden cost (with its real mechanism)
  5 the heart (the one relationship) 6 crisis 7 resolution (the hero picks people; no violence or revenge)
  8 "Is any of this real?" (yes or no) 9 sting 10 CTA
PLANTED: the small specific detail planted in step 5 and how it pays off in step 7
CHOICE: the stark either/or in one line
FACTS: at least five real, checkable facts the script will use, each with where it can be verified
```

`outline.md` `## Inputs`: `{{title}}`, `{{series_context}}`, `{{cast_library}}` (the `id, roles, signature` lines from
`channels/say-suppose/library/cast/cast.json`). `## Checklist`: alt titles pass the topic rules; two to four
characters; no character shares Scarf's colour; RULE decides CHOICE; five FACTS, none invented.

`cast-pass.md` `## Prompt`:

```text
Here is a finished Say Suppose script and its characters. Do not change a single word of the script.

SCRIPT: {{script}}
CHARACTERS: {{characters}}

Split the script into sentences in order. Answer with one YAML document:
lines:
  - {n: 1, text: "<sentence exactly as written>", speaker: narrator}
  - {n: 2, text: "<sentence>", speaker: <cast id of the character who says it>}
claims:
  - {n: <sentence number>, claim: "<the real-world fact stated, in plain words>"}
A sentence is a character line only when a character says it aloud; everything else is narrator. List every
real-world number, record, mechanism or named study as a claim; story events are not claims.
```

Inputs: `{{script}}` (the paragraph after `SCRIPT:`), `{{characters}}` (the CHARACTERS block from the G1 outline,
with the cast ids). Checklist: the joined `text` values equal the script exactly (the agent checks this with code);
every speaker is `narrator` or an id in CHARACTERS; at least five claims.

`narration.md`:

```markdown
# narration
Model: Higgsfield elevenlabs_v4, Luc preset 04e867c7-9e41-5cff-80d3-5284e74d7bd1 (paid, after G2, owner OK first)
Used by: core/openmontage/skills/studio/studio-suppose-edit.md
Source: W9 (the workflow's voice instruction), memory "narration cinematic, not documentary", pilot v2 Luc takes

## Inputs
- {{line}}: one narrator line from the cast pass, exactly as written

## Prompt
Direction: a warm, clear storyteller talking to one friend, conversational and slightly awed, as if explaining
something mind-blowing over coffee. Moderate to slightly fast pace. Real pauses at ellipses. Weight on contrast
words and numbers. Emotional moments a little slower. Intimate, never robotic, never shouty, never documentary.
Line: {{line}}

## Checklist
- One job per line (Luc can repeat phrases inside long takes).
- whisper transcript of the take equals the line; otherwise trim or retake (a retake beyond the quote needs an OK).
- Takes are stitched with core/engines/suppose/scripts/stitch.py, never by hand.
```

- [ ] **Step 5: Run the tests**

Run: `... -m pytest core/engines/suppose/tests/test_prompts.py -q`
Expected: all PASS except `test_every_expected_prompt_exists`, which still lists the remaining prompts.

- [ ] **Step 6: Commit**

```bash
git add channels/say-suppose/prompts/{outline,script,cast-pass,narration}.md core/engines/suppose/tests/test_prompts.py
git commit -m "feat(say-suppose): outline, script, cast-pass and narration prompts"
```

### Task 4: `scriptcheck.py`

**Files:**
- Create: `core/engines/suppose/scripts/scriptcheck.py`
- Test: `core/engines/suppose/tests/test_scriptcheck.py`

**Interfaces:**
- Produces:
  - `extract(text: str) -> str`: the paragraph after `SCRIPT:` (or the whole text if absent).
  - `metrics(script: str) -> dict` with keys `words`, `sentences`, `avg_words`, `short_share` (share of
    sentences of 4 words or fewer), `long` (sentences over 15 words), `ellipses`, `questions`, `you_per_100`,
    `digits` (list of digit runs that are not 4-digit years).
  - `check(script: str, hero_names: tuple[str, ...] = ()) -> tuple[list[str], list[str]]`: (fails, warns).
  - CLI: `python scriptcheck.py <file> [--json]`, exit 1 when any fail.

- [ ] **Step 1: Write the failing tests**

```python
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import scriptcheck as sc  # noqa: E402

BEAT = "You catch it... in time. How? Your hand moves first. "


def script_of(words_target: int, beat: str = BEAT) -> str:
    out = []
    while len(" ".join(out).split()) < words_target:
        out.append(beat.strip())
    return " ".join(out)


def test_extract_takes_the_paragraph_after_script():
    assert sc.extract("TOPIC: What If X? SCRIPT: You run. Fast.") == "You run. Fast."


def test_metrics_count_the_voice_targets():
    m = sc.metrics("You run... fast. Why? Your legs, mate. In 2007 you ran 100 metres.")
    assert m["ellipses"] == 1
    assert m["questions"] == 1
    assert m["digits"] == ["100"]
    assert m["sentences"] == 4


def test_word_count_outside_800_to_1100_fails():
    fails, _ = sc.check(script_of(700))
    assert any("words" in f for f in fails)
    fails, _ = sc.check(script_of(1000))
    assert not any("words" in f for f in fails)


def test_format_breaks_fail():
    base = script_of(950)
    for bad in ["NARRATOR: You run.", '"Hey," she says.', "[camera pushes in]", "## Act one", "*You run*"]:
        fails, _ = sc.check(base + " " + bad)
        assert fails, bad


def test_digits_and_a_named_hero_fail():
    fails, _ = sc.check(script_of(950) + " You ran 42 laps.")
    assert any("numbers" in f for f in fails)
    fails, _ = sc.check(script_of(950) + " Your name is Max.", hero_names=("Max",))
    assert any("named" in f for f in fails)


def test_voice_targets_only_warn():
    flat = script_of(950, "The man walks to the shop and buys some bread for his lunch today. ")
    fails, warns = sc.check(flat)
    assert not fails
    assert any("ellipses" in w for w in warns) and any("questions" in w for w in warns)
```

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_scriptcheck.py -q`
Expected: FAIL with `ModuleNotFoundError: No module named 'scriptcheck'`.

- [ ] **Step 3: Write `scriptcheck.py`**

```python
"""Measure a Say Suppose script against the master script prompt's targets (spec: Prompts and skills).

python scriptcheck.py <script.md> [--json]   -> exit 1 on any FAIL

Word count (800-1,100 hard, 900-1,050 target) and format (one paragraph, no speaker labels, quotes, headings, stage
directions or markdown; numbers in words; the hero unnamed) fail. The voice targets only warn.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SENT = re.compile(r"[^.!?]+(?:\.\.\.|[.!?])+")
YEAR = re.compile(r"^(1[5-9]|20)\d\d$")
FORMAT = [
    (re.compile(r"(^|\s)[A-Z][A-Z .']{1,20}:\s"), "speaker label"),
    (re.compile(r"[\"“”]"), "double quotes around dialogue"),
    (re.compile(r"\[[^\]]*\]|\([^)]*(camera|cut|music|sfx|scene)[^)]*\)", re.I), "stage direction"),
    (re.compile(r"(^|\n)\s*#|\*\*?[^*]+\*|\n\s*[-*] "), "markdown"),
]


def extract(text: str) -> str:
    i = text.find("SCRIPT:")
    return (text[i + 7 :] if i >= 0 else text).strip()


def sentences(script: str) -> list[str]:
    return [s.strip() for s in SENT.findall(script) if s.strip()]


def metrics(script: str) -> dict:
    sents = sentences(script)
    words = script.split()
    lens = [len(s.split()) for s in sents] or [0]
    you = sum(1 for w in words if re.sub(r"\W", "", w.lower()) in {"you", "your", "you're", "youre", "yours"})
    digits = [d for d in re.findall(r"\d[\d,.]*", script) if not YEAR.match(d)]
    return {
        "words": len(words),
        "sentences": len(sents),
        "avg_words": round(sum(lens) / len(lens), 2),
        "short_share": round(sum(1 for n in lens if n <= 4) / len(lens), 2),
        "long": sum(1 for n in lens if n > 15),
        "ellipses": script.count("..."),
        "questions": script.count("?"),
        "you_per_100": round(100 * you / max(1, len(words)), 1),
        "digits": digits,
    }


def _format_fails(script: str, hero_names: tuple[str, ...]) -> list[str]:
    fails = [f"format: {name}" for pattern, name in FORMAT if pattern.search(script)]
    if "\n\n" in script.strip():
        fails.append("format: more than one paragraph")
    for name in hero_names:
        if re.search(rf"\b(your name is|you're|call you)\s+{re.escape(name)}\b", script, re.I):
            fails.append(f"hero named: {name}")
    return fails


def _warns(m: dict) -> list[str]:
    targets = [
        ("ellipses", 18, 25), ("questions", 15, 20), ("you_per_100", 5.5, 8.5), ("avg_words", 3.5, 5.5),
        ("short_share", 0.4, 1.0),
    ]
    warns = [f"{k} {m[k]} outside {lo}-{hi}" for k, lo, hi in targets if not lo <= m[k] <= hi]
    if m["long"] > 2:
        warns.append(f"{m['long']} sentences over 15 words")
    if not 900 <= m["words"] <= 1050:
        warns.append(f"words {m['words']} outside the 900-1,050 target")
    return warns


def check(script: str, hero_names: tuple[str, ...] = ()) -> tuple[list[str], list[str]]:
    m = metrics(script)
    fails = _format_fails(script, hero_names)
    if not 800 <= m["words"] <= 1100:
        fails.append(f"words {m['words']} outside 800-1,100")
    if m["digits"]:
        fails.append(f"numbers written as digits: {m['digits'][:5]}")
    return fails, _warns(m)


def main(argv: list[str]) -> int:
    script = extract(Path(argv[0]).read_text(encoding="utf-8"))
    fails, warns = check(script)
    if "--json" in argv:
        print(json.dumps({"metrics": metrics(script), "fails": fails, "warns": warns}, indent=1))
    else:
        for line in [*(f"FAIL {f}" for f in fails), *(f"WARN {w}" for w in warns)]:
            print(line)
        print("ok" if not fails else f"{len(fails)} fail(s)")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

- [ ] **Step 4: Run the tests**

Run: `... -m pytest core/engines/suppose/tests/test_scriptcheck.py -q`
Expected: PASS. If `test_format_breaks_fail` passes `*You run*` through, check that the markdown pattern
`\*\*?[^*]+\*` is present.

- [ ] **Step 5: Commit**

```bash
git add core/engines/suppose/scripts/scriptcheck.py core/engines/suppose/tests/test_scriptcheck.py
git commit -m "feat(suppose): scriptcheck measures a script against the master prompt's targets"
```

### Task 5: Art prompts and the thumbnail skill

**Files:**
- Create: `channels/say-suppose/prompts/set-plate.md`, `parts-sheet.md`, `cast-lineup.md`, `thumbnail.md`,
  `character-voice.md`, `score.md`
- Create: `.claude/skills/say-suppose-thumbnails/SKILL.md`
- Test: `core/engines/suppose/tests/test_prompts.py` (add tests)

**Interfaces:**
- Consumes: the pilot's Higgsfield job ids in `channels/say-suppose/pilot/only-100/remotion/README.md` (sets
  `2ecb2081`, `dd9ba780`, high plate in the v3 note; lineup `ca00753c`; parts sheets `aae0e723`, `f24defdd`,
  `fcedb67b`, `1ffdcdc8`, colour Scarf `f56184eb`; score `71870626`) and the thumbnail jobs in
  `pilot/only-100/thumbs/README.md`.
- Produces: a `STYLE A FOOTER` block, identical in `set-plate.md`, `parts-sheet.md`, `cast-lineup.md` and
  `thumbnail.md`, between the lines `<!-- style-a-footer -->` and `<!-- /style-a-footer -->`.

- [ ] **Step 1: Read the approved prompts back (free)**

For each job id above, call the Higgsfield `get_project_asset_prompt` tool (load it with ToolSearch
`select:mcp__higgsfield__get_project_asset_prompt`); it reads a finished job's prompt and costs nothing. If a job
is not found that way, use `show_generation_by_ids`. Save the answers to the scratchpad as `pilot-prompts.md`. Do not
generate anything.

- [ ] **Step 2: Add the failing tests**

```python
FOOTER = re.compile(r"<!-- style-a-footer -->(.*?)<!-- /style-a-footer -->", re.S)


def test_style_a_footer_is_identical_in_every_image_prompt():
    footers = {n: FOOTER.search(_text(n)) for n in ["set-plate", "parts-sheet", "cast-lineup", "thumbnail"]}
    assert all(footers.values()), [n for n, f in footers.items() if not f]
    assert len({f.group(1).strip() for f in footers.values()}) == 1


def test_set_plate_carries_the_w_rules():
    t = _text("set-plate")
    for must in ["no people", "no text", "one strong light source", "60–75%", "past the frame edge", "gpt_image_2_6"]:
        assert must in t, must


def test_thumbnail_skill_holds_the_l2_rules():
    skill = (ROOT / ".claude" / "skills" / "say-suppose-thumbnails" / "SKILL.md").read_text(encoding="utf-8")
    for must in ["170 px", "never repeats the title", "Test & Compare", "prompts/thumbnail.md", "2 credits"]:
        assert must in skill, must
```

- [ ] **Step 3: Write the six prompt files**

Each starts from the matching pilot prompt saved in Step 1, generalised with blanks, and keeps everything that made
the approved result (style words, layout instructions, the reference image roles). Contents:

- `set-plate.md`: Model `Higgsfield gpt_image_2_6, quality high, resolution 2k, aspect 16:9; reference: the station
  wide plate job 2ecb2081 as style reference`. Blanks `{{place}}` (the place in concrete detail),
  `{{angle}}` (wide eye-level, close, or high), `{{light}}` (the key light and where it comes from),
  `{{stage_area}}` (where the characters will stand). The prompt asks for: an empty painted set in style A; no people,
  no text, no logos, no signage lettering; one strong light source that is visible in frame, with its glow and spill;
  60–75% of the frame in dark mid-tones with 1–3 bright accents; the brightest area behind `{{stage_area}}` so dark
  figures read; depth layers from far background to a near floor; walls, floor and sky painted past the frame edge so
  a camera move never shows an edge. Ends with the style A footer. Checklist: no people, text or logos; the light
  source is in frame; a stage area is clear; the agent measures `set.json` (floor line, horizon) after slicing.
- `parts-sheet.md`: Model as above, with the character's lineup image as reference. Blanks `{{character}}` (full
  description: role, body, clothes, signature item and colour, headwear or hair), `{{reference}}`. Prompt: one
  character as separate cut-out pieces on a plain white background, the same layout as the cast (head; torso;
  upper arm left and right; forearm with hand left and right; thigh left and right; shin with foot left and right),
  front view, pieces not touching, nothing else on the sheet. Checklist: 10 separate pieces; `slice.py` finds 10
  blobs; a three-piece leg is mapped with `top`/`flip` in the rig map.
- `cast-lineup.md`: Model as above, references Scarf `fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b` and lineup job
  `ca00753c`. Blanks `{{role}}`, `{{signature}}` (one item and colour, not Scarf's colour and not another cast
  member's), `{{headwear}}`. Prompt: the new character standing in the style A lineup beside Scarf, same scale
  conventions (adults about 0.88 of Scarf's height; a child 0.72 of an adult). Checklist: one signature colour; the
  silhouette differs from the existing cast at small size (W6).
- `thumbnail.md`: Model `Higgsfield gpt_image_2_6, quality high, 2k, 16:9; Scarf reference
  fbbbe6fa-44a1-46b6-a5dd-06e1a045da3b`. Blanks `{{premise}}`, `{{prop}}` (the one premise prop), `{{readout}}`
  (the premise number as a glowing in-world label, or empty), `{{emotion}}` (Scarf's expression). The prompt keeps
  the pilot thumbnail prompt's wording ("Use the character from the reference image…") and asks for one face
  readable at feed size, one premise prop, a lit ground with depth, and no caption text (captions are set in code).
- `character-voice.md`: Model `local Qwen3 VoiceDesign (core/lock.yaml local_voices qwen3-design), free`. Blanks
  `{{character}}`, `{{age_and_gender}}`, `{{manner}}`. Prompt: a written voice description in the form the what-if
  engine uses ("A <age> <gender> voice: <manner>, clear diction, natural pace."). Checklist: picked by ear once from
  three seeds; the chosen seed and description go into `library/cast/cast.json` under the character's `voice`.
- `score.md`: Model `Higgsfield elevenlabs_music_v2_5 (paid, about 0.145 credits a second, after G2, owner OK)`.
  Blanks `{{mood}}`, `{{seconds}}`, `{{beat}}`. Prompt from the pilot score job `71870626`, generalised.

The shared footer (paste the same block into the four image prompts):

```markdown
<!-- style-a-footer -->
Style A: soft painted anime-style illustration, gouache texture, clean shapes, warm key light against cool deep
shadows, gentle film grain, cinematic depth. Consistent with the reference images. No photorealism, no 3D render, no
text, no letters, no logos, no watermark.
<!-- /style-a-footer -->
```

Adjust the footer's words only to match what the pilot prompts in Step 1 actually used, so the approved look is kept.

- [ ] **Step 4: Write `.claude/skills/say-suppose-thumbnails/SKILL.md`**

```markdown
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
```

The kit `Thumb` composition is added in Task 13 (toolkit); until then the skill's last step cannot run, which is fine.

- [ ] **Step 5: Run the tests**

Run: `... -m pytest core/engines/suppose/tests/test_prompts.py -q`
Expected: all PASS except `test_every_expected_prompt_exists` (only `shots` left).

- [ ] **Step 6: Commit**

```bash
git add channels/say-suppose/prompts/{set-plate,parts-sheet,cast-lineup,thumbnail,character-voice,score}.md .claude/skills/say-suppose-thumbnails core/engines/suppose/tests/test_prompts.py
git commit -m "feat(say-suppose): art, voice and score prompts from the pilot's approved jobs; thumbnail skill"
```

### Task 6: The shot sheet: schema, `shots.md` prompt and `sheetcheck.py`

**Files:**
- Create: `core/engines/suppose/scripts/sheet.py` (schema constants and loader)
- Create: `core/engines/suppose/scripts/sheetcheck.py`
- Create: `channels/say-suppose/prompts/shots.md`
- Test: `core/engines/suppose/tests/test_sheetcheck.py`

**Interfaces:**
- Produces, in `sheet.py`:
  - `SHOT_TYPES = ("wide", "two", "ots", "face", "insert", "top", "freeze", "data", "blueprint", "title", "end",
    "custom")`
  - `MIX = {"wide": 0.10, "two": 0.25, "ots": 0.10, "face": 0.125, "insert": 0.10, "top": 0.05}` (W1 shares)
  - `MOVES = ("push", "pull", "drift", "pan", "roll", "shake", "crane", "track", "still")`
  - `ACTS = ("idle", "walkIn", "walkOut", "stop", "wave", "point", "shout", "lookAt", "react", "hold", "turn", "run",
    "reach", "shrug", "cheer", "armsCrossed", "explain", "handOff")`
  - `MOODS = ("neutral", "smile", "happy", "joy", "surprised", "shocked", "scared", "worried", "nervous", "angry",
    "determined", "sad", "cry", "smirk", "sleepy", "thinking", "confused", "awe")`
  - `load_sheet(path: Path) -> dict` (YAML) and `NUMBER_WORDS` (the word list used to find spoken numbers).
- Produces, in `sheetcheck.py`:
  - `class Library` protocol used here: an object with `cast: dict[str, dict]`, `sets: dict[str, dict]` (each with
    `angles: dict[str, dict]`), `props: dict[str, dict]`. Task 8's `library.Library` provides it.
  - `check(sheet: dict, lib, words: list[dict], customs: set[str] = frozenset()) -> tuple[list[str], list[str]]`
    where `words` is whisper output `[{"word", "start", "end"}]`.
  - `emit(sheet: dict, lib, out: Path) -> Path`: writes `film.json` for the kit (Task 14 reads it).
  - CLI: `python sheetcheck.py <video_dir> [--emit]` reading `<video_dir>/shots.yaml`,
    `<video_dir>/audio/narration.words.json`, the channel library, and `<video_dir>/custom/*.tsx` export names.

The sheet format (document it at the top of `sheet.py` exactly like this):

```yaml
film: <video id>
fps: 30
size: [1280, 720]
audio: audio/mix.wav            # the mix the cut plays
beats: [{at: 23.2, name: list}]  # story beats; readout changes should sit on one (L5.2)
shots:
  - id: s01
    from: 0.0                   # seconds on the narration timeline
    to: 3.77
    type: wide                  # one of SHOT_TYPES
    set: station                # library set id (not needed for data, blueprint, title, end)
    angle: high                 # an angle of that set
    camera: {move: push, z: [1.0, 1.3], focus: [640, 420]}
    mood: warm                  # warm | cool | void | blueprint (W7)
    cast:
      - {who: scarf, at: [640, 470], acts: [{act: idle}, {act: react, mood: worried, at: 2.1}]}
    crowd: [{band: back, n: 22, speed: 95, seed: 0}]
    lines: [{who: kenji, at: 37.2}]           # character lines in this shot; the speaker must be in cast
    labels: [{kind: data, text: "≈ 3,500,000", says: "three and a half million", at: 6.0, to: 9.6}]
    readout: {text: "99 / 100", at: 23.2}
    sfx: [{name: whoosh, at: 23.2, gain: 0.06}]
    letterbox: scope            # optional (W7)
    hold: "the joke lands"      # required reason for a shot whose longest unchanged stretch is over 5 s
    custom: S2                  # optional: a hand-built shot exported from custom/*.tsx
```

- [ ] **Step 1: Write the failing tests**

```python
import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import sheetcheck as chk  # noqa: E402

LIB = SimpleNamespace(
    cast={"scarf": {}, "kenji": {}},
    sets={"station": {"angles": {"wide": {"bounds": {"zmax": 2.0}}, "high": {"bounds": {"zmax": 2.0}}}}},
    props={"rice": {}},
)
WORDS = [{"word": " three", "start": 6.1, "end": 6.3}, {"word": " million", "start": 6.4, "end": 6.7}]


def shot(i, a, b, **kw):
    base = {"id": f"s{i}", "from": a, "to": b, "type": "wide", "set": "station", "angle": "wide",
            "camera": {"move": "drift"}, "cast": [{"who": "scarf", "at": [640, 600], "acts": [{"act": "idle"}]}]}
    base.update(kw)
    return base


def sheet(*shots, beats=()):
    return {"film": "t", "fps": 30, "size": [1280, 720], "beats": list(beats), "shots": list(shots)}


def test_a_clean_sheet_passes():
    s = sheet(shot(1, 0, 3, type="wide"), shot(2, 3, 6, type="face"))
    fails, warns = chk.check(s, LIB, [])
    assert fails == []


def test_unknown_references_fail():
    bad = [
        shot(1, 0, 3, set="moon"), shot(1, 0, 3, angle="low"), shot(1, 0, 3, type="dolly"),
        shot(1, 0, 3, cast=[{"who": "bob", "at": [0, 0], "acts": [{"act": "idle"}]}]),
        shot(1, 0, 3, cast=[{"who": "scarf", "at": [0, 0], "acts": [{"act": "flip"}]}]),
        shot(1, 0, 3, cast=[{"who": "scarf", "at": [0, 0], "acts": [{"act": "react", "mood": "meh"}]}]),
        shot(1, 0, 3, custom="S9"),
    ]
    for b in bad:
        fails, _ = chk.check(sheet(b), LIB, [])
        assert fails, b


def test_gaps_overlaps_and_no_acting_fail():
    assert chk.check(sheet(shot(1, 0, 3), shot(2, 3.5, 6)), LIB, [])[0]
    assert chk.check(sheet(shot(1, 0, 3), shot(2, 2.5, 6)), LIB, [])[0]
    assert chk.check(sheet(shot(1, 0, 3, cast=[])), LIB, [])[0]


def test_speaker_must_be_in_frame():
    s = sheet(shot(1, 0, 3, lines=[{"who": "kenji", "at": 1.0}]))
    fails, _ = chk.check(s, LIB, [])
    assert any("kenji" in f for f in fails)


def test_warnings_hold_repeat_readout_and_spoken_number():
    long_hold = sheet(shot(1, 0, 7))
    assert any("hold" in w for w in chk.check(long_hold, LIB, [])[1])
    assert not any("hold" in w for w in chk.check(sheet(shot(1, 0, 7, hold="joke")), LIB, [])[1])
    twice = sheet(shot(1, 0, 3), shot(2, 3, 6))
    assert any("same type" in w for w in chk.check(twice, LIB, [])[1])
    off_beat = sheet(shot(1, 0, 3, readout={"text": "99", "at": 1.0}), beats=[{"at": 2.5, "name": "x"}])
    assert any("readout" in w for w in chk.check(off_beat, LIB, [])[1])
    unseen = sheet(shot(1, 0, 4, type="wide"), shot(2, 4, 8, type="face"))
    assert any("three" in w for w in chk.check(unseen, LIB, WORDS)[1])


def test_custom_shots_need_no_set_and_known_customs_pass():
    s = sheet({"id": "s1", "from": 0, "to": 3, "type": "custom", "custom": "S2"})
    assert chk.check(s, LIB, [], customs={"S2"})[0] == []
```

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_sheetcheck.py -q`
Expected: FAIL (`No module named 'sheetcheck'`).

- [ ] **Step 3: Write `sheet.py`**

The module docstring is the sheet format block above. Then the constants listed under Interfaces, and:

```python
from pathlib import Path

import yaml

NUMBER_WORDS = {
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty", "thirty", "forty",
    "fifty", "sixty", "seventy", "eighty", "ninety", "hundred", "thousand", "million", "billion", "half", "quarter",
}
NO_SET = {"data", "blueprint", "title", "end", "custom"}
EPS = 0.02


def load_sheet(path: Path) -> dict:
    return yaml.safe_load(Path(path).read_text(encoding="utf-8"))
```

- [ ] **Step 4: Write `sheetcheck.py`**

```python
"""Validate a Say Suppose shot sheet before any render, and emit film.json for the kit (spec: Errors, W1-W5, L5, L8).

python sheetcheck.py <video_dir> [--emit]   -> exit 1 on any FAIL
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from sheet import ACTS, EPS, MIX, MOODS, MOVES, NO_SET, NUMBER_WORDS, SHOT_TYPES, load_sheet


def _refs(s: dict, lib, customs: set[str]) -> list[str]:
    sid, out = s.get("id", "?"), []
    if s.get("type") not in SHOT_TYPES:
        out.append(f"{sid}: unknown type {s.get('type')!r}")
    if s.get("custom") and s["custom"] not in customs:
        out.append(f"{sid}: unknown custom shot {s['custom']!r}")
    if s.get("type") not in NO_SET:
        st = lib.sets.get(s.get("set"))
        if st is None:
            out.append(f"{sid}: unknown set {s.get('set')!r}")
        elif s.get("angle") not in st["angles"]:
            out.append(f"{sid}: set {s['set']} has no angle {s.get('angle')!r}")
    cam = s.get("camera", {})
    if cam and cam.get("move") not in MOVES:
        out.append(f"{sid}: unknown camera move {cam.get('move')!r}")
    return out


def _cast(s: dict, lib) -> list[str]:
    sid, out = s.get("id", "?"), []
    for c in s.get("cast", []):
        if c.get("who") not in lib.cast:
            out.append(f"{sid}: unknown character {c.get('who')!r}")
        for a in c.get("acts", []):
            if a.get("act") not in ACTS:
                out.append(f"{sid}: unknown action {a.get('act')!r}")
            if a.get("mood") is not None and a["mood"] not in MOODS:
                out.append(f"{sid}: unknown mood {a['mood']!r}")
            if a.get("prop") is not None and a["prop"] not in lib.props:
                out.append(f"{sid}: unknown prop {a['prop']!r}")
    in_frame = {c.get("who") for c in s.get("cast", [])}
    out += [f"{sid}: {ln['who']} speaks but is not in frame (W4)" for ln in s.get("lines", []) if ln["who"] not in in_frame]
    acting = s.get("custom") or s.get("type") in {"data", "blueprint", "title", "end"} or any(
        c.get("acts") for c in s.get("cast", [])
    )
    if not acting:
        out.append(f"{sid}: no character acts; a camera move over a still set is a slide (L8.3)")
    return out


def _timeline(shots: list[dict]) -> list[str]:
    out = []
    for a, b in zip(shots, shots[1:]):
        if b["from"] > a["to"] + EPS:
            out.append(f"gap {a['to']}-{b['from']} between {a['id']} and {b['id']}")
        if b["from"] < a["to"] - EPS:
            out.append(f"overlap between {a['id']} and {b['id']}")
    return out


def _changes(s: dict) -> list[float]:
    times = [s["from"], s["to"]]
    for c in s.get("cast", []):
        times += [a["at"] for a in c.get("acts", []) if "at" in a]
    times += [x["at"] for key in ("labels", "lines", "sfx") for x in s.get(key, [])]
    if s.get("readout"):
        times.append(s["readout"]["at"])
    return sorted(t for t in times if s["from"] <= t <= s["to"])


def _warns(sheet: dict, words: list[dict]) -> list[str]:
    shots, out = sheet["shots"], []
    for s in shots:
        ch = _changes(s)
        gap = max((b - a for a, b in zip(ch, ch[1:])), default=0)
        if gap > 5 + EPS and not s.get("hold"):
            out.append(f"{s['id']}: hold of {gap:.1f} s with no hold: reason (L8, a guide)")
        if sum(1 for c in s.get("cast", []) if c.get("focus", True)) > 4:
            out.append(f"{s['id']}: more than four characters in focus (W4)")
        if s.get("readout") and not any(abs(b["at"] - s["readout"]["at"]) <= 0.5 for b in sheet.get("beats", [])):
            out.append(f"{s['id']}: readout change at {s['readout']['at']} is not on a story beat (L5.2)")
    out += [f"{a['id']}, {b['id']}: same type {a['type']} twice in a row (W1)" for a, b in zip(shots, shots[1:]) if a["type"] == b["type"] and a["type"] != "custom"]
    out += _mix_warns(shots) + _number_warns(shots, words)
    return out


def _mix_warns(shots: list[dict]) -> list[str]:
    total = sum(s["to"] - s["from"] for s in shots) or 1
    if total < 120:
        return []
    out = []
    for t, share in MIX.items():
        have = sum(s["to"] - s["from"] for s in shots if s["type"] == t) / total
        if abs(have - share) > max(0.06, share * 0.6):
            out.append(f"shot mix: {t} is {have:.0%} of the film, aim for about {share:.0%} (W1)")
    return out


def _number_warns(shots: list[dict], words: list[dict]) -> list[str]:
    shown = [(lb["at"] - 0.6, lb.get("to", lb["at"] + 3) + 0.6) for s in shots for lb in s.get("labels", [])]
    shown += [(s["readout"]["at"] - 0.6, s["to"]) for s in shots if s.get("readout")]
    out = []
    for w in words:
        token = re.sub(r"[^a-z]", "", w["word"].lower())
        if token in NUMBER_WORDS - {"one", "half", "quarter"} and not any(a <= w["start"] <= b for a, b in shown):
            out.append(f"spoken number '{token}' at {w['start']:.1f} s is not on screen (W5)")
    return out


def check(sheet: dict, lib, words: list[dict], customs: set[str] = frozenset()) -> tuple[list[str], list[str]]:
    shots = sheet.get("shots", [])
    fails = _timeline(shots)
    for s in shots:
        fails += _refs(s, lib, set(customs)) + _cast(s, lib)
    return fails, _warns(sheet, words) if not fails else []


def emit(sheet: dict, lib, out: Path) -> Path:
    used_sets = {s["set"] for s in sheet["shots"] if s.get("set")}
    used_cast = {c["who"] for s in sheet["shots"] for c in s.get("cast", [])} | {"scarf"}
    data = {
        **{k: sheet[k] for k in ("film", "fps", "size", "beats", "shots")},
        "audio": sheet.get("audio", "audio/mix.wav"),
        "duration": max(s["to"] for s in sheet["shots"]),
        "cast": {k: v for k, v in lib.cast.items() if k in used_cast},
        "crowd": {k: v for k, v in lib.cast.items() if "crowd" in v.get("roles", [])},
        "sets": {k: v for k, v in lib.sets.items() if k in used_sets},
        "props": lib.props,
    }
    out.write_text(json.dumps(data, indent=1), encoding="utf-8")
    return out


def customs_in(video: Path) -> set[str]:
    names: set[str] = set()
    for f in (video / "custom").glob("*.tsx"):
        names |= set(re.findall(r"export const (\w+)\s*:\s*Shot", f.read_text(encoding="utf-8")))
    return names


def main(argv: list[str]) -> int:
    from library import Library

    video = Path(argv[0]).resolve()
    sheet = load_sheet(video / "shots.yaml")
    words_path = video / "audio" / "narration.words.json"
    words = json.loads(words_path.read_text()) if words_path.is_file() else []
    lib = Library.for_channel("say-suppose")
    fails, warns = check(sheet, lib, words, customs_in(video))
    for line in [*(f"FAIL {f}" for f in fails), *(f"WARN {w}" for w in warns)]:
        print(line)
    if not fails and "--emit" in argv:
        print(emit(sheet, lib, video / "film.json"))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

If ruff flags `_warns` for complexity over 12, move the per-shot loop body into `_shot_warns(s, sheet)`.

- [ ] **Step 5: Write `prompts/shots.md`**

Header: Model `Claude (this session)`; Used by `studio-suppose-script` (first cut); Source `spec W1–W7, D9, L5, L8;
the workflow's shot vocabulary`. Inputs: `{{lines}}` (the cast-pass `lines` with whisper start and end times),
`{{sets}}` (library sets with their angles), `{{cast}}` (cast ids with roles and signature items), `{{beats}}`
(story beats: title question, rule, each montage beat, cost, heart, crisis, choice, resolution, sting), `{{readout}}`
(the premise number, or "none"). Prompt:

```text
You are the director of a Say Suppose film. Turn the narration below into a shot sheet in the YAML format given at
the end. The picture is a cut-out puppet film in painted sets; characters act with eyes, brows, mouth shapes, hands
and posture; there is no lip-sync.

1. Split the narration into beats of about 13 words (never more than 15, about 6 seconds each). Each beat is one
   shot, or two when a reaction cut helps.
2. Give every shot a type from: wide (opens each new place, small figures, slow push-in), two (two-shot, side view),
   ots (over-the-shoulder: a big blurred near figure, the other sharp), face (giant close-up for reactions and
   "you" moments), insert (a hand, a phone, a watch), top (top-down or diagram), freeze (time-stop, one to three per
   film), data, blueprint (science segments and "Is any of this real?"), title, end. Aim for about: wide 10%, two
   25%, ots 10%, face 10-15%, insert 10%, top 5%. Never the same type twice in a row. Compose on thirds; only face is
   centred.
3. Every shot moves the camera: push, pull, drift, pan, roll (unease) or shake (impact); moves stay inside one set.
4. Anyone the narration mentions speaking, reacting or watching is in frame and visibly reacting. Most scenes have
   two or three characters; never more than four in focus.
5. Change an expression on the word that earns it, using: neutral, smile, happy, joy, surprised, shocked, scared,
   worried, nervous, angry, determined, sad, cry, smirk, sleepy, thinking, confused, awe.
6. Every number the narrator says appears as a label on that word (at most two labels at once). The premise number
   {{readout}} is the readout and changes only on a story beat.
7. Light follows the beat: warm for tender or triumphant, cool for tense, void or blueprint for explanation. Scope
   letterbox for the title, freezes, the climax and intense close-ups.
8. Something meaningful changes about every 4-5 s. A longer hold needs a hold: reason.

Narration: {{lines}}
Sets: {{sets}}
Cast: {{cast}}
Story beats: {{beats}}

Answer with only the YAML, in the format documented in core/engines/suppose/scripts/sheet.py.
```

Checklist: the agent runs `sheetcheck.py <video_dir>` and fixes every FAIL; WARNs are reviewed and either fixed or
given a reason.

- [ ] **Step 6: Run all Part A tests**

Run: `... -m pytest core/engines/suppose/tests -q`
Expected: PASS, including `test_every_expected_prompt_exists`. (`sheetcheck.main` imports `library`, which Task 8
adds; the tests do not call `main`.)

- [ ] **Step 7: Commit**

```bash
git add core/engines/suppose/scripts/{sheet,sheetcheck}.py core/engines/suppose/tests/test_sheetcheck.py channels/say-suppose/prompts/shots.md
git commit -m "feat(suppose): shot sheet format, sheetcheck and the shots prompt"
```

---

# Part B: the engine

### Task 7: Engine scaffold, kit package and the two test suites

**Files:**
- Create: `core/engines/suppose/README.md`
- Create: `core/engines/suppose/kit/{package.json,tsconfig.json,vitest.config.ts,remotion.config.ts,src/index.ts,src/Root.tsx}`
- Create: `core/engines/suppose/kit/tests/smoke.test.ts`
- Modify: `core/studio/testgate.py` (TEST_DIRS, default_suites), `core/studio/tests/test_testgate.py:343`, `Makefile`
  (test-serial), `core/lock.yaml` (a `suppose_kit` entry)

**Interfaces:**
- Produces: suites named `suppose` (pytest on `core/engines/suppose/tests`) and `suppose-kit` (vitest + tsc in
  `core/engines/suppose/kit`). The kit resolves `@suppose/kit` to `kit/src` (tsconfig paths and the Remotion webpack
  override), so film entries in `channels/say-suppose/videos/<id>/remotion/` and `examples/` can import it.

- [ ] **Step 1: Update the testgate test first**

In `core/studio/tests/test_testgate.py`, change the expected suite list to:

```python
    assert names == ["openmontage", "openmontage-qa", "openmontage-rest", "studio", "pou", "whatif", "suppose", "suppose-kit"]
```

Run: `... -m pytest core/studio/tests/test_testgate.py -q -k suites`
Expected: FAIL (two names missing).

- [ ] **Step 2: Add the suites**

In `core/studio/testgate.py`, add `"core/engines/suppose/tests", "core/engines/suppose/kit/tests"` to `TEST_DIRS`, and
append to the list returned by `default_suites`:

```python
        Suite("suppose", str(root), f"{py} -m pytest core/engines/suppose/tests -q -p no:cacheprovider"),
        Suite(
            "suppose-kit",
            str(root / "core/engines/suppose/kit"),
            "test -d node_modules || { echo \"core/engines/suppose/kit: run 'pnpm install --frozen-lockfile' "
            'there first" >&2; exit 1; }; npx vitest run && npx tsc --noEmit',
        ),
```

In `Makefile` `test-serial`, after the whatif lines, add:

```make
	cd $(ROOT) && $(PYTHON) -m pytest core/engines/suppose/tests -q -p no:cacheprovider
	@test -d $(ROOT)/core/engines/suppose/kit/node_modules || { echo "core/engines/suppose/kit: run 'pnpm install --frozen-lockfile' there first" >&2; exit 1; }
	cd $(ROOT)/core/engines/suppose/kit && npx vitest run && npx tsc --noEmit
```

- [ ] **Step 3: Create the kit package**

`kit/package.json`:

```json
{
  "name": "suppose-kit",
  "private": true,
  "type": "module",
  "description": "Say Suppose film kit: the pilot v8 cut-out rig, film parts, actions, toolkit and shot-sheet renderer (spec docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md). Versions pinned in core/lock.yaml suppose_kit.",
  "scripts": {"test": "vitest run", "typecheck": "tsc --noEmit", "studio": "remotion studio src/index.ts"},
  "dependencies": {
    "@remotion/cli": "4.0.484",
    "@remotion/google-fonts": "4.0.484",
    "remotion": "4.0.484",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {"@types/node": "22.10.2", "@types/react": "18.3.12", "typescript": "5.6.3", "vitest": "2.1.8"}
}
```

`kit/tsconfig.json`: copy `core/engines/whatif/tsconfig.json`, with `"paths": {"@suppose/kit": ["src/index.ts"],
"@suppose/kit/*": ["src/*"]}` and `"include": ["src", "tests", "../examples", "remotion.config.ts",
"vitest.config.ts"]`. Copy `core/engines/whatif/tests/react-dom-server.d.ts` to `kit/tests/`.

`kit/vitest.config.ts`:

```ts
import path from 'node:path';
import {defineConfig} from 'vitest/config';

const here = path.dirname(new URL(import.meta.url).pathname);
const nm = (p: string) => path.join(here, 'node_modules', p);

// The pilot's files are imported by the parity tests; they live outside this package, so pin their bare imports
// to this package's node_modules.
export default defineConfig({
  resolve: {alias: {remotion: nm('remotion'), react: nm('react'), 'react-dom': nm('react-dom'), '@suppose/kit': path.join(here, 'src/index.ts')}},
  test: {include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'], setupFiles: ['tests/setup.ts']},
});
```

`kit/tests/setup.ts` (Remotion's `Img` needs a composition context; tests render plain markup):

```ts
import React from 'react';
import {vi} from 'vitest';

vi.mock('remotion', async (orig) => {
  const real = await orig<typeof import('remotion')>();
  return {...real, Img: (p: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', p), staticFile: (s: string) => `/public/${s}`};
});
```

`kit/remotion.config.ts`:

```ts
import path from 'node:path';
import {Config} from '@remotion/cli/config';

const kit = process.cwd();
Config.setVideoImageFormat('jpeg');
Config.overrideWebpackConfig((c) => ({
  ...c,
  resolve: {
    ...c.resolve,
    alias: {...(c.resolve?.alias ?? {}), '@suppose/kit': path.join(kit, 'src/index.ts')},
    modules: [path.join(kit, 'node_modules'), 'node_modules'],
  },
}));
```

`kit/src/index.ts` (grows in later tasks):

```ts
export const KIT_VERSION = '0.1.0';
```

`kit/src/Root.tsx`:

```tsx
import React from 'react';
export const Root: React.FC = () => <></>;
```

`kit/tests/smoke.test.ts`:

```ts
import {expect, it} from 'vitest';
import {KIT_VERSION} from '../src/index';

it('loads the kit', () => expect(KIT_VERSION).toMatch(/^\d+\.\d+\.\d+$/));
```

Run: `cd core/engines/suppose/kit && pnpm install && npx vitest run && npx tsc --noEmit`
Expected: 1 test passes; tsc clean. Commit `pnpm-lock.yaml`.

- [ ] **Step 4: Pin in `core/lock.yaml`**

Add after `pilot_remotion`:

```yaml
suppose_kit:
  # core/engines/suppose/kit (2026-11-27): the Say Suppose film kit. Exact versions; pnpm-lock.yaml pins the tree.
  remotion: 4.0.484          # remotion, @remotion/cli, @remotion/google-fonts
  react: 18.3.1
  dev: [typescript 5.6.3, "@types/react 18.3.12", "@types/node 22.10.2", vitest 2.1.8]
```

- [ ] **Step 5: Write `core/engines/suppose/README.md`**

```markdown
# Say Suppose engine

The film kit for Say Suppose (spec: docs/superpowers/specs/2026-11-27-say-suppose-film-kit-design.md).

- `scripts/`: Python tools, run as siblings (`python core/engines/suppose/scripts/<tool>.py`): scriptcheck,
  sheetcheck, slice, rig, library, voices, stitch, timewarp, mix, review, framediff.
- `kit/`: the Remotion package. `pnpm install --frozen-lockfile` once. A film renders from its own entry:
  `cd core/engines/suppose/kit && npx remotion render <video>/remotion/index.ts Film <out.mp4>
  --props=<video>/film.json --public-dir=<staged public>` wrapped in `studio.jobs run --queue render`.
- `examples/only-100/`: the pilot rebuilt on the kit, the kit's acceptance test.

Film sessions never change this engine; they record needs with `omni fix`.
```

- [ ] **Step 6: Run the testgate test and commit**

Run: `... -m pytest core/studio/tests/test_testgate.py -q`
Expected: PASS.

```bash
git add core/engines/suppose/README.md core/engines/suppose/kit core/studio/testgate.py core/studio/tests/test_testgate.py Makefile core/lock.yaml
git commit -m "feat(suppose): engine scaffold, kit package and its two test suites"
```

### Task 8: `slice.py`, `rig.py` and the channel library

**Files:**
- Create: `core/engines/suppose/scripts/slice.py` (the pilot's, unchanged in behaviour)
- Create: `core/engines/suppose/scripts/rig.py`
- Create: `core/engines/suppose/scripts/library.py`
- Create: `channels/say-suppose/library/{.gitignore,manifest.yaml,cast/cast.json,cast/maps/*.yaml,sets/station/set.json,props/props.json,scores/scores.json}`
- Test: `core/engines/suppose/tests/test_slice_rig.py`, `core/engines/suppose/tests/test_library.py`

**Interfaces:**
- `slice.py`: `slice_sheet(sheet: Path, out_dir: Path, prefix: str) -> list[dict]` (`{"name", "box"}` in reading
  order); CLI unchanged from the pilot.
- `rig.py`:
  - map file (YAML), one per character: `id`, `sheet` (prefix), `pieces` (ten refs in the order head, torso, uarmL,
    farmL, uarmR, farmR, thighL, shinL, thighR, shinR; an int, or `"<n>top"`, or `"<n>flip"`), `hip`, `roles`,
    `signature`, optional `voice: {desc, seed}`.
  - `face(head: Image) -> list[float]`, `shoulders(torso: Image) -> list[float]` (from the pilot's `rig4.py`).
  - `rig_character(map_path: Path, pieces_dir: Path) -> dict`: the cast entry
    `{"head": {"src", "w", "h"}, ..., "hip", "sh", "face", "height", "roles", "signature", "voice"}` with `src`
    relative to the library (`cast/pieces/<file>`), and `height = personH` from the pilot formula.
  - CLI: `python rig.py <library_dir>` rigs every map in `cast/maps/` into `cast/cast.json`.
- `library.py`: `class Library` with `root: Path`, `cast`, `sets`, `props`, `scores` (dicts from the JSON files);
  `Library.for_channel(slug: str) -> Library`; `verify() -> list[str]` (problems: missing file or sha256 mismatch per
  manifest entry); `add(path: Path, job: str, prompt: str) -> None` (adds or updates a manifest entry);
  `stage(video: Path, out: Path) -> Path` (a public dir of symlinks: the library's `cast/`, `sets/`, `props/`,
  `scores/`, plus the video's `art/` and `audio/`).

- [ ] **Step 1: Write the failing tests**

`test_slice_rig.py`:

```python
import sys
from pathlib import Path

import numpy as np
import yaml
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import rig  # noqa: E402
import slice as slicer  # noqa: E402

SIZES = [(120, 140), (140, 220), (50, 140), (45, 150), (50, 140), (45, 150), (50, 130), (55, 160), (50, 130), (55, 160)]


def sheet(path: Path) -> Path:
    img = Image.new("RGB", (1400, 600), "white")
    d = ImageDraw.Draw(img)
    x = 20
    for i, (w, h) in enumerate(SIZES):
        y = 20 if i < 5 else 320
        if i == 5:
            x = 20
        d.rectangle([x, y, x + w, y + h], fill=(200, 160, 130) if i == 0 else (60, 120, 90))
        x += w + 60
    img.save(path)
    return path


def test_slice_finds_ten_pieces_in_reading_order(tmp_path):
    pieces = slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "out", "t")
    assert [p["name"] for p in pieces] == [f"t_{k}.png" for k in range(10)]
    assert pieces[0]["box"][1] < pieces[5]["box"][1]


def test_rig_character_builds_a_cast_entry(tmp_path):
    slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "pieces", "t")
    m = tmp_path / "t.yaml"
    m.write_text(yaml.safe_dump({"id": "tester", "sheet": "t", "pieces": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], "hip": 0.6,
                                 "roles": ["friend"], "signature": "green cap"}))
    entry = rig.rig_character(m, tmp_path / "pieces")
    assert entry["head"]["src"] == "cast/pieces/t_0.png"
    assert entry["hip"] == 0.6 and entry["roles"] == ["friend"]
    p = entry
    expect = p["thighL"]["h"] * 0.86 + p["shinL"]["h"] * 0.95 + p["torso"]["h"] * 0.6 + p["head"]["h"] * 0.95
    assert abs(entry["height"] - expect) < 1e-6
    assert len(entry["sh"]) == 2 and len(entry["face"]) == 3


def test_top_and_flip_refs_make_derived_pieces(tmp_path):
    slicer.slice_sheet(sheet(tmp_path / "s.png"), tmp_path / "pieces", "t")
    m = tmp_path / "t.yaml"
    m.write_text(yaml.safe_dump({"id": "x", "sheet": "t", "pieces": [0, 1, 2, 3, 4, 5, "7top", 7, "9top", "9flip"],
                                 "hip": 0.6, "roles": [], "signature": ""}))
    e = rig.rig_character(m, tmp_path / "pieces")
    full = Image.open(tmp_path / "pieces" / "t_7.png")
    assert e["thighL"]["h"] == int(full.height * 0.52)
    assert e["shinR"]["src"].endswith("x_shinR.png")
```

`test_library.py`:

```python
import hashlib
import json
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import library  # noqa: E402


def make_lib(root: Path) -> Path:
    for d in ["cast", "sets/station", "props", "scores"]:
        (root / d).mkdir(parents=True)
    (root / "cast" / "cast.json").write_text(json.dumps({"scarf": {"roles": ["hero"]}}))
    (root / "sets" / "station" / "set.json").write_text(json.dumps({"id": "station", "angles": {"wide": {}}}))
    (root / "props" / "props.json").write_text("{}")
    (root / "scores" / "scores.json").write_text("{}")
    (root / "sets" / "station" / "wide.png").write_bytes(b"png")
    (root / "manifest.yaml").write_text(yaml.safe_dump({"files": []}))
    return root


def test_loads_cast_sets_props(tmp_path):
    lib = library.Library(make_lib(tmp_path / "lib"))
    assert "scarf" in lib.cast and "wide" in lib.sets["station"]["angles"]


def test_add_then_verify_catches_a_changed_file(tmp_path):
    root = make_lib(tmp_path / "lib")
    lib = library.Library(root)
    lib.add(root / "sets" / "station" / "wide.png", job="2ecb2081", prompt="set-plate.md")
    entry = yaml.safe_load((root / "manifest.yaml").read_text())["files"][0]
    assert entry == {"path": "sets/station/wide.png", "sha256": hashlib.sha256(b"png").hexdigest(),
                     "job": "2ecb2081", "prompt": "set-plate.md"}
    assert lib.verify() == []
    (root / "sets" / "station" / "wide.png").write_bytes(b"changed")
    assert any("sha256" in p for p in lib.verify())


def test_stage_links_library_and_video_media(tmp_path):
    root = make_lib(tmp_path / "lib")
    video = tmp_path / "v"
    (video / "art").mkdir(parents=True)
    (video / "audio").mkdir()
    out = library.Library(root).stage(video, tmp_path / "public")
    assert (out / "sets" / "station" / "wide.png").read_bytes() == b"png"
    assert (out / "art").is_symlink() and (out / "audio").is_symlink()
```

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_slice_rig.py core/engines/suppose/tests/test_library.py -q`
Expected: FAIL (modules missing).

- [ ] **Step 3: Write `slice.py`**

Copy `channels/say-suppose/pilot/only-100/cutout/slice.py`. Rename its `main` body into
`slice_sheet(sheet: Path, out_dir: Path, prefix: str) -> list[dict]` that returns `meta`, and keep
`main(sheet, out_dir, prefix)` calling it and printing the count. No other change.

- [ ] **Step 4: Write `rig.py`**

```python
"""Rig a character from its sliced parts sheet into the channel's cast library (the pilot's rig4.py, generalised:
a map file per character replaces the hard-coded cast).

python rig.py <library_dir>   (maps in <library_dir>/cast/maps/*.yaml, pieces in <library_dir>/cast/pieces/)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import yaml
from PIL import Image

NAMES = ["head", "torso", "uarmL", "farmL", "uarmR", "farmR", "thighL", "shinL", "thighR", "shinR"]


def face(head: Image.Image) -> list[float]:
    """Face centre (x, y as fractions of the head) and width fraction, from the skin colour of the neck."""
    a = np.array(head.convert("RGBA")).astype(float)
    h, w = a.shape[:2]
    neck = a[int(h * 0.9) : int(h * 0.97), int(w * 0.42) : int(w * 0.58)]
    neck = neck[neck[..., 3] > 200][:, :3]
    if not len(neck):
        return [0.5, 0.6, 0.5]
    d = np.abs(a[..., :3] - np.median(neck, axis=0)).sum(axis=2)
    m = (d < 60) & (a[..., 3] > 200)
    m[int(h * 0.8) :] = False
    ys, xs = np.nonzero(m)
    if not len(xs):
        return [0.5, 0.6, 0.5]
    return [round(xs.mean() / w, 3), round(ys.mean() / h, 3), round((np.percentile(xs, 95) - np.percentile(xs, 5)) / w, 3)]


def shoulders(torso: Image.Image) -> list[float]:
    al = np.array(torso.convert("RGBA"))[..., 3]
    h, w = al.shape
    row = np.nonzero(al[int(h * 0.2)] > 128)[0]
    return [round(row.min() / w, 3), round(row.max() / w, 3)] if len(row) else [0.13, 0.87]


def piece(pieces: Path, prefix: str, ref, char: str, part: str) -> tuple[str, Image.Image]:
    if isinstance(ref, int):
        return f"cast/pieces/{prefix}_{ref}.png", Image.open(pieces / f"{prefix}_{ref}.png")
    k = int("".join(c for c in str(ref) if c.isdigit()))
    im = Image.open(pieces / f"{prefix}_{k}.png")
    im = im.crop((0, 0, im.width, int(im.height * 0.52))) if str(ref).endswith("top") else im.transpose(Image.FLIP_LEFT_RIGHT)
    name = f"{char}_{part}.png"
    im.save(pieces / name)
    return f"cast/pieces/{name}", im


def rig_character(map_path: Path, pieces: Path) -> dict:
    m = yaml.safe_load(Path(map_path).read_text(encoding="utf-8"))
    entry: dict = {}
    ims: dict[str, Image.Image] = {}
    for part, ref in zip(NAMES, m["pieces"], strict=True):
        src, im = piece(pieces, m["sheet"], ref, m["id"], part)
        ims[part] = im
        entry[part] = {"src": src, "w": im.width, "h": im.height}
    hip = float(m["hip"])
    entry.update(hip=hip, sh=shoulders(ims["torso"]), face=face(ims["head"]), roles=m.get("roles", []),
                 signature=m.get("signature", ""), voice=m.get("voice"))
    entry["height"] = (entry["thighL"]["h"] * 0.86 + entry["shinL"]["h"] * 0.95 + entry["torso"]["h"] * hip
                       + entry["head"]["h"] * 0.95)
    return entry


def main(library_dir: str) -> None:
    lib = Path(library_dir)
    cast = {}
    for mp in sorted((lib / "cast" / "maps").glob("*.yaml")):
        cid = yaml.safe_load(mp.read_text())["id"]
        cast[cid] = rig_character(mp, lib / "cast" / "pieces")
    (lib / "cast" / "cast.json").write_text(json.dumps(cast, indent=1) + "\n")
    print(f"{len(cast)} characters -> {lib / 'cast' / 'cast.json'}")


if __name__ == "__main__":
    main(sys.argv[1])
```

- [ ] **Step 5: Write `library.py`**

```python
"""The Say Suppose art library: cast, sets, props and scores. Media stay out of git; manifest.yaml records each
file's sha256, Higgsfield job and prompt so a clone can fetch it again (spec: The channel library)."""

from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[4]


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


class Library:
    def __init__(self, root: Path):
        self.root = Path(root)
        self.cast = self._json("cast/cast.json")
        self.sets = {p.parent.name: json.loads(p.read_text()) for p in sorted(self.root.glob("sets/*/set.json"))}
        self.props = self._json("props/props.json")
        self.scores = self._json("scores/scores.json")

    @classmethod
    def for_channel(cls, slug: str) -> "Library":
        return cls(REPO / "channels" / slug / "library")

    def _json(self, rel: str) -> dict:
        p = self.root / rel
        return json.loads(p.read_text()) if p.is_file() else {}

    def _manifest(self) -> dict:
        p = self.root / "manifest.yaml"
        return yaml.safe_load(p.read_text()) or {"files": []} if p.is_file() else {"files": []}

    def verify(self) -> list[str]:
        problems = []
        for f in self._manifest()["files"]:
            p = self.root / f["path"]
            if not p.is_file():
                problems.append(f"missing {f['path']} (fetch Higgsfield job {f.get('job')})")
            elif _sha(p) != f["sha256"]:
                problems.append(f"sha256 changed: {f['path']}")
        return problems

    def add(self, path: Path, job: str, prompt: str) -> None:
        m = self._manifest()
        rel = str(Path(path).resolve().relative_to(self.root.resolve()))
        entry = {"path": rel, "sha256": _sha(Path(path)), "job": job, "prompt": prompt}
        m["files"] = [f for f in m["files"] if f["path"] != rel] + [entry]
        m["files"].sort(key=lambda f: f["path"])
        (self.root / "manifest.yaml").write_text(yaml.safe_dump(m, sort_keys=False))

    def stage(self, video: Path, out: Path) -> Path:
        out.mkdir(parents=True, exist_ok=True)
        links = {d: self.root / d for d in ("cast", "sets", "props", "scores")}
        links.update({d: Path(video) / d for d in ("art", "audio") if (Path(video) / d).exists()})
        for name, target in links.items():
            link = out / name
            if link.is_symlink() or link.exists():
                link.unlink()
            os.symlink(target.resolve(), link)
        return out
```

- [ ] **Step 6: Run the tests**

Run: `... -m pytest core/engines/suppose/tests/test_slice_rig.py core/engines/suppose/tests/test_library.py -q`
Expected: PASS.

- [ ] **Step 7: Seed the library from the pilot**

The pilot media exist only in the git-ignored `remotion/public/` of
`/Users/priyanshu.kushwaha/Exploration/projects/omni-studio/.claude/worktrees/youtube-channel-optimization-6473b3/channels/say-suppose/pilot/only-100/remotion/public/`
(call it `$P`). Copy, never commit:

1. `channels/say-suppose/library/.gitignore`:
   ```
   *.png
   *.jpg
   *.wav
   *.mp3
   *.mp4
   ```
2. `cp $P/cut4/*.png library/cast/pieces/`.
3. Write one map per character in `library/cast/maps/`, translating `CAST` in the pilot's `cutout/rig4.py`:
   `scarf.yaml` from `SCARFC` (sheet `s5`, pieces `[0,1,2,6,3,7,4,8,5,9]`, hip 0.5, roles `[hero]`, signature
   "Scarf's full-colour scarf; this colour is never used on anyone else"), `scarf-faded.yaml` from `SCARF` (roles
   `[hero-alt]`), and `salary`, `office`, `student`, `gent`, `gran`, `packer`, `worker` from their rows (roles include
   `crowd` for all seven; signature from their look). Map ids are lower-case.
4. Run `python core/engines/suppose/scripts/rig.py channels/say-suppose/library`. Then check the result against
   the pilot's `castV4.ts`: for each character, every piece `w`/`h`, `hip`, `sh` and `face` must equal the pilot's
   numbers (only `src` differs). Write that check as `test_seeded_cast_matches_the_pilot` in `test_library.py`,
   marked `@pytest.mark.skipif(not (LIB / "cast/cast.json").is_file(), ...)`, parsing `castV4.ts` with a regex.
5. Props: copy the eight pieces named in rig4's `PROPS` and write `library/props/props.json`
   `{"rice": {"src": "props/rice.png", "w": .., "h": ..}, ...}`.
6. Station set: copy `$P/cut/set_wide.png`, `set_close.png`, `set_high.png` to `library/sets/station/{wide,close,high}.png`
   and write `set.json` from the pilot's numbers in `Pilot60.tsx`:
   ```json
   {
     "id": "station",
     "place": "Shinjuku-style station concourse at rush hour",
     "ambience": "murmur",
     "angles": {
       "wide":  {"plate": "sets/station/wide.png",  "scarf": {"x": 640, "y": 600, "s": 0.2},   "h": {"horizon": 430, "at": 600},  "crowd": {"back": [470, 596], "front": [606, 650]}, "clear": [500, 780, 560, 700], "bounds": {"zmax": 2.0}, "key": {"side": "left", "color": "#ffd9a0"}},
       "high":  {"plate": "sets/station/high.png",  "scarf": {"x": 640, "y": 470, "s": 0.133}, "h": {"horizon": -150, "at": 470}, "crowd": {"back": [205, 466], "front": [474, 670]}, "clear": [500, 780, 395, 545], "bounds": {"zmax": 2.0}, "key": {"side": "top", "color": "#ffe6b8"}},
       "close": {"plate": "sets/station/close.png", "scarf": {"x": 640, "y": 652, "s": 0.28},  "h": {"fixed": 0.92},              "crowd": {"back": [612, 622]},                        "clear": [500, 780],           "bounds": {"zmax": 2.6}, "key": {"side": "left", "color": "#ffd9a0"}}
     }
   }
   ```
   (`h.fixed` is a fraction of the peer height at Scarf's scale, matching the pilot's `closeH`.)
7. Scores: copy the pilot's ElevenLabs cue if present (`$P/score.wav` or the file `pilot_mix.py` was given) to
   `library/scores/pilot-station.wav`; `scores.json` `{"pilot-station": {"src": "scores/pilot-station.wav", "mood":
   "warm curious", "job": "71870626"}}`.
8. For every copied media file run `Library.add(path, job, prompt)` with the job ids from the pilot README (pieces:
   their sheet's job; prompt: `parts-sheet.md`, `set-plate.md` or `score.md`). Then `Library.verify()` returns `[]`.

- [ ] **Step 8: Run all engine tests and commit**

Run: `... -m pytest core/engines/suppose/tests -q`
Expected: PASS (the seeded-cast test runs and passes).

```bash
git add core/engines/suppose/scripts/{slice,rig,library}.py core/engines/suppose/tests/test_slice_rig.py core/engines/suppose/tests/test_library.py channels/say-suppose/library
git status --short channels/say-suppose/library   # must list no .png/.wav
git commit -m "feat(suppose): slice, rig and the channel library seeded from the pilot"
```

### Task 9: Voices, stitch and time warp

**Files:**
- Create: `core/engines/suppose/scripts/voices.py`, `stitch.py`, `timewarp.py`
- Test: `core/engines/suppose/tests/test_voices.py`, `test_stitch_warp.py`

**Interfaces:**
- `voices.py`:
  - `jobs(lines: list[dict], cast: dict, narrator_ref: Path, narrator_text: str, out_dir: Path) -> dict`: the
    `local_tts.py` spec `{"jobs": [...]}`: narrator lines as `{"engine": "qwen3", "text", "out", "ref", "ref_text"}`
    (voice B clone); character lines as `{"engine": "qwen3-design", "text", "out", "instruct", "seed"}` from the
    character's `voice` in the cast library. `out` is `<out_dir>/<n:03d>_<speaker>.wav`.
  - `run(spec_path: Path) -> None`: runs `<main>/.venv-media/bin/python core/engines/whatif/pipeline/local_tts.py
    <spec>`; `words(paths: list[Path]) -> None` runs `transcribe.py` the same way.
  - CLI: `python voices.py <video_dir>` reads `<video_dir>/cast-pass.yaml`, writes `audio/takes/`, then stitches.
- `stitch.py`: `stitch(takes: list[tuple[str, Path, float]], out_wav: Path, out_cues: Path) -> dict` where each
  take is `(line id, wav, gap after)`; 12 ms faded edges, 0.4 s lead-in, peak −1 dBFS, 44.1 kHz mono. Returns
  `{"duration", "cues": [{"line", "start", "end"}]}`. Default gaps: 0.25 s after narrator lines, 0.30 s after
  character lines, 0.6 s after a line ending in `...`, 1.2 s after the last.
- `timewarp.py`: `knots(old: dict, new: dict, old_end: float) -> tuple[list[float], list[float]]` (from two cue
  sheets, as in the pilot's `load_warp`); `warp(t: float, k) -> float`; `unwarp(t: float, k) -> float`.

- [ ] **Step 1: Write the failing tests**

```python
# test_stitch_warp.py
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import stitch  # noqa: E402
import timewarp  # noqa: E402


def tone(path: Path, secs: float) -> Path:
    t = np.arange(int(secs * 44100)) / 44100
    sf.write(path, 0.5 * np.sin(2 * np.pi * 220 * t), 44100)
    return path


def test_stitch_places_lines_with_gaps_and_fades(tmp_path):
    takes = [("n1", tone(tmp_path / "a.wav", 1.0), 0.25), ("k1", tone(tmp_path / "b.wav", 0.5), 1.2)]
    cues = stitch.stitch(takes, tmp_path / "t.wav", tmp_path / "c.json")
    assert cues["cues"][0] == {"line": "n1", "start": 0.4, "end": 1.4}
    assert cues["cues"][1]["start"] == 1.65
    y, sr = sf.read(tmp_path / "t.wav")
    assert sr == 44100 and abs(np.abs(y).max() - 10 ** (-1 / 20)) < 1e-3
    i = int(0.4 * sr)
    assert abs(y[i]) < 0.01  # faded edge, no click
    assert json.loads((tmp_path / "c.json").read_text()) == cues


def test_timewarp_maps_line_edges_both_ways():
    old = {"cues": [{"line": "a", "start": 0.4, "end": 3.5}, {"line": "b", "start": 3.8, "end": 4.6}]}
    new = {"cues": [{"line": "a", "start": 0.4, "end": 4.0}, {"line": "b", "start": 4.3, "end": 5.2}]}
    k = timewarp.knots(old, new, old_end=6.0)
    assert timewarp.warp(3.5, k) == 4.0
    assert abs(timewarp.unwarp(timewarp.warp(2.0, k), k) - 2.0) < 1e-9
    assert timewarp.warp(6.0, k) == 5.2 + (6.0 - 4.6)
```

```python
# test_voices.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import voices  # noqa: E402

CAST = {"kenji": {"voice": {"desc": "A young man's voice: warm, quick.", "seed": 4242}}}


def test_jobs_route_narrator_and_characters(tmp_path):
    lines = [{"n": 1, "text": "You run.", "speaker": "narrator"}, {"n": 2, "text": "You're late!", "speaker": "kenji"}]
    spec = voices.jobs(lines, CAST, Path("/ref.wav"), "ref text", tmp_path)
    a, b = spec["jobs"]
    assert a["engine"] == "qwen3" and a["ref"] == "/ref.wav" and a["out"].endswith("001_narrator.wav")
    assert b["engine"] == "qwen3-design" and b["seed"] == 4242 and b["instruct"].startswith("A young man")


def test_a_character_without_a_voice_is_refused(tmp_path):
    import pytest

    with pytest.raises(SystemExit, match="kenji"):
        voices.jobs([{"n": 1, "text": "Hi.", "speaker": "kenji"}], {"kenji": {}}, Path("/r.wav"), "t", tmp_path)
```

Before writing `voices.jobs`, open `core/engines/whatif/pipeline/local_tts.py` `voice_args` and match its exact job
keys (`ref`, `ref_text`, `instruct`, `seed`, `out`); if they differ from the names above, use local_tts's names and
update the test.

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_stitch_warp.py core/engines/suppose/tests/test_voices.py -q`
Expected: FAIL (modules missing).

- [ ] **Step 3: Write `stitch.py`**

Port the pilot's `audio/stitch.py`: keep `SR`, `FADE` and `load()`; replace `ORDER` and `main` with:

```python
LEAD = 0.4


def stitch(takes: list[tuple[str, Path, float]], out_wav: Path, out_cues: Path) -> dict:
    parts, cues, t = [np.zeros(int(LEAD * SR), "float32")], [], LEAD
    for name, path, gap in takes:
        clip = load(Path(path))
        cues.append({"line": name, "start": round(t, 3), "end": round(t + len(clip) / SR, 3)})
        parts += [clip, np.zeros(int(gap * SR), "float32")]
        t += len(clip) / SR + gap
    track = np.concatenate(parts)
    track *= 10 ** (-1 / 20) / max(1e-6, float(np.abs(track).max()))
    sf.write(out_wav, track, SR)
    data = {"duration": round(t, 3), "cues": cues}
    Path(out_cues).write_text(json.dumps(data, indent=1))
    return data


def gap_after(text: str, speaker: str, last: bool) -> float:
    if last:
        return 1.2
    if text.rstrip().endswith("..."):
        return 0.6
    return 0.25 if speaker == "narrator" else 0.30
```

- [ ] **Step 4: Write `timewarp.py`**

```python
"""Film time on the voice B timeline <-> film time on the final narration (pilot timewarp.ts, in Python)."""

from __future__ import annotations

import numpy as np


def knots(old: dict, new: dict, old_end: float) -> tuple[list[float], list[float]]:
    o, n = [0.0], [0.0]
    for a, b in zip(old["cues"], new["cues"], strict=True):
        o += [a["start"], a["end"]]
        n += [b["start"], b["end"]]
    o.append(old_end)
    n.append(new["cues"][-1]["end"] + (old_end - old["cues"][-1]["end"]))
    return o, n


def warp(t: float, k: tuple[list[float], list[float]]) -> float:
    return float(np.interp(t, k[0], k[1]))


def unwarp(t: float, k: tuple[list[float], list[float]]) -> float:
    return float(np.interp(t, k[1], k[0]))
```

- [ ] **Step 5: Write `voices.py`**

```python
"""Free local voices for a film: voice B narration (a Qwen3 clone) and each character's own designed voice
(Qwen3 VoiceDesign, one seed per character from the cast library), through the what-if engine's local_tts.py.

python voices.py <video_dir>   (reads cast-pass.yaml; writes audio/takes/, audio/narration.wav, cues and words)
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import yaml

REPO = Path(__file__).resolve().parents[4]
MAIN = Path(subprocess.run(["git", "-C", str(REPO), "worktree", "list", "--porcelain"], capture_output=True,
                           text=True).stdout.split("\n")[0].removeprefix("worktree "))
MEDIA_PY = MAIN / ".venv-media" / "bin" / "python"
WHATIF = REPO / "core" / "engines" / "whatif" / "pipeline"
NARRATOR_REF = MAIN / "channels" / "say-suppose" / "brand" / "voice" / "narrator-b-cool.wav"


def jobs(lines: list[dict], cast: dict, narrator_ref: Path, narrator_text: str, out_dir: Path) -> dict:
    out = []
    for ln in lines:
        path = str(Path(out_dir) / f"{ln['n']:03d}_{ln['speaker']}.wav")
        if ln["speaker"] == "narrator":
            out.append({"engine": "qwen3", "text": ln["text"], "out": path, "ref": str(narrator_ref), "ref_text": narrator_text})
            continue
        voice = cast.get(ln["speaker"], {}).get("voice")
        if not voice:
            raise SystemExit(f"{ln['speaker']} has no voice in the cast library; design one with prompts/character-voice.md")
        out.append({"engine": "qwen3-design", "text": ln["text"], "out": path, "instruct": voice["desc"], "seed": voice["seed"]})
    return {"jobs": out}


def run(spec_path: Path) -> None:
    subprocess.run([str(MEDIA_PY), str(WHATIF / "local_tts.py"), str(spec_path)], check=True)


def words(paths: list[Path]) -> None:
    subprocess.run([str(MEDIA_PY), str(WHATIF / "transcribe.py"), *map(str, paths)], check=True)


def main(video_dir: str) -> None:
    from library import Library
    from stitch import gap_after, stitch

    video = Path(video_dir).resolve()
    lines = yaml.safe_load((video / "cast-pass.yaml").read_text())["lines"]
    takes_dir = video / "audio" / "takes"
    takes_dir.mkdir(parents=True, exist_ok=True)
    ref_text = (MAIN / "channels" / "say-suppose" / "brand" / "voice" / "narrator-b-cool.txt").read_text().strip()
    spec = jobs(lines, Library.for_channel("say-suppose").cast, NARRATOR_REF, ref_text, takes_dir)
    (takes_dir / "spec.json").write_text(json.dumps(spec, indent=1))
    run(takes_dir / "spec.json")
    takes = [(f"{ln['n']:03d}_{ln['speaker']}", Path(j["out"]), gap_after(ln["text"], ln["speaker"], i == len(lines) - 1))
             for i, (ln, j) in enumerate(zip(lines, spec["jobs"], strict=True))]
    stitch(takes, video / "audio" / "narration.wav", video / "audio" / "cues_b.json")
    words([video / "audio" / "narration.wav"])
    print(video / "audio" / "narration.wav")


if __name__ == "__main__":
    main(sys.argv[1])
```

Voice B's reference read text: the v1 narrator files record it in `narrator.py`'s `COOL_TEXT` under tag
`say-suppose-v1`. Before the first film, write it to `channels/say-suppose/brand/voice/narrator-b-cool.txt` in the
main checkout (git-ignored with the wav), or record its absence with `omni fix`.

- [ ] **Step 6: Run the tests and commit**

Run: `... -m pytest core/engines/suppose/tests -q`
Expected: PASS.

```bash
git add core/engines/suppose/scripts/{voices,stitch,timewarp}.py core/engines/suppose/tests/test_voices.py core/engines/suppose/tests/test_stitch_warp.py
git commit -m "feat(suppose): free local voices, stitch and time warp"
```

### Task 10: `sfx.py` and `mix.py`

**Files:**
- Create: `core/engines/suppose/scripts/sfx.py` (sound synths from the pilot: `tick`, `thump`, `glide`, `whoosh`,
  `blip`, `murmur`, `echo`)
- Create: `core/engines/suppose/scripts/mix.py`
- Test: `core/engines/suppose/tests/test_mix.py`

**Interfaces:**
- `sfx.py`: `SR = 48000`; `env(n, fade=0.012) -> ndarray`; `place(bus, sound, at, gain)`; `tick(freq=1300,
  dur=0.05)`, `thump()`, `glide(f0, f1, dur)`, `whoosh(dur, rng)`, `blip()` (the W5 label pop: a 40 ms 1800 Hz tick),
  `murmur(rng, length, ducks: list[tuple[float, float]])`, `echo(voice, at, end, bus)`; `SYNTHS: dict[str,
  Callable]` keyed by the sheet's `sfx.name`.
- `mix.py`: `mix(narr: Path, score: Path | None, film: dict, out: Path, warp_k=None) -> Path`. Events come from
  `film["shots"][*]["sfx"]` and a `blip` at every label's `at`; ambience is the set's `ambience` (only `murmur`
  for now) under shots on that set, ducked under `insert` and `data` shots; the score is ducked about 8 dB under the
  voice (the pilot's `score()`). Writes 48 kHz stereo 16-bit, peak ≤ 0.89, then runs `ffmpeg -af
  loudnorm=I=-16:TP=-1.5:LRA=11` to `out`.

- [ ] **Step 1: Write the failing tests**

```python
import sys
from pathlib import Path

import numpy as np
import pytest
from scipy.io import wavfile

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import mix  # noqa: E402
import sfx  # noqa: E402


def test_place_fades_both_edges():
    bus = np.zeros(sfx.SR)
    sfx.place(bus, np.ones(4800), 0.1, 1.0)
    i = int(0.1 * sfx.SR)
    assert bus[i] == 0 and bus[i + 2400] == 1.0 and bus[i + 4799] < 0.01


def test_every_sheet_sfx_name_has_a_synth():
    for name in ["tick", "thump", "glide", "whoosh", "blip"]:
        assert name in sfx.SYNTHS


def film(seconds: float = 4.0) -> dict:
    return {"duration": seconds, "sets": {"station": {"ambience": "murmur"}},
            "shots": [{"id": "s1", "from": 0, "to": seconds, "type": "wide", "set": "station",
                       "sfx": [{"name": "thump", "at": 1.0, "gain": 0.3}],
                       "labels": [{"kind": "data", "text": "3", "at": 2.0, "to": 3.0}]}]}


def voice(tmp_path: Path, seconds: float) -> Path:
    t = np.arange(int(seconds * 44100)) / 44100
    wavfile.write(tmp_path / "n.wav", 44100, (0.3 * np.sin(2 * np.pi * 180 * t) * (t > 0.5) * 32767).astype(np.int16))
    return tmp_path / "n.wav"


def test_raw_bus_has_voice_events_and_no_clipping(tmp_path):
    bus = mix.raw_bus(voice(tmp_path, 4.0), None, film(), warp_k=None)
    assert len(bus) == 4 * sfx.SR
    assert np.abs(bus).max() <= 0.89 + 1e-9
    i = int(1.0 * sfx.SR)
    assert np.abs(bus[i : i + 2000]).max() > np.abs(bus[i - 2000 : i]).max()


@pytest.mark.slow
def test_mix_writes_minus_16_lufs(tmp_path):
    out = mix.mix(voice(tmp_path, 4.0), None, film(), tmp_path / "m.wav")
    sr, y = wavfile.read(out)
    assert sr == 48000 and y.ndim == 2
```

- [ ] **Step 2: Run and see them fail**

Run: `... -m pytest core/engines/suppose/tests/test_mix.py -q`
Expected: FAIL.

- [ ] **Step 3: Write `sfx.py`**

Copy `env`, `place`, `tick`, `thump`, `glide`, `whoosh` verbatim from the pilot's `audio/pilot_mix.py`. Add:

```python
def blip() -> np.ndarray:
    return tick(1800, 0.04)


def murmur(rng: np.random.Generator, length: float, ducks: list[tuple[float, float]]) -> np.ndarray:
    """Station murmur (the pilot's), ducked 75% inside each (start, end) window with 0.3 s ramps."""
    n = int(length * SR)
    pink = signal.lfilter([0.049922035, -0.095993537, 0.050612699, -0.004408786],
                          [1, -2.494956002, 2.017265875, -0.522189400], rng.standard_normal(n))
    m = signal.lfilter(*signal.butter(2, [180, 2600], btype="band", fs=SR), pink)
    slow = signal.lfilter(*signal.butter(1, 0.6, fs=SR), rng.standard_normal(n))
    m *= 1 + 3 * slow / (np.abs(slow).max() + 1e-9)
    t = np.arange(n) / SR
    duck = np.ones(n)
    for a0, a1 in ducks:
        ramp = np.clip(np.minimum((t - a0 + 0.3) / 0.3, (a1 - t) / 0.3 + 1), 0, 1)
        duck -= 0.75 * ramp * ((t > a0 - 0.3) & (t < a1 + 0.3))
    return m / (np.abs(m).max() + 1e-9) * np.clip(duck, 0.15, 1)


def echo(voice: np.ndarray, at: float, end: float, bus: np.ndarray) -> None:
    """The shout's three-tap echo from the pilot."""
    clip = voice[int(at * SR) : int(end * SR)]
    b, a = signal.butter(2, 1800, fs=SR)
    for k, g in [(1, 0.32), (2, 0.18), (3, 0.09)]:
        place(bus, signal.lfilter(b, a, clip), at + 0.28 * k, g)


SYNTHS = {
    "tick": tick, "thump": thump, "blip": blip,
    "glide": lambda: glide(620, 140, 1.3),
    "whoosh": lambda: whoosh(0.5, np.random.default_rng(7)),
}
```

- [ ] **Step 4: Write `mix.py`**

```python
"""Mix a Say Suppose film: narration, a ducked score, set ambience, sheet sound effects and label blips, faded edges,
then ffmpeg loudnorm to -16 LUFS / -1.5 dBTP (spec; the pilot's pilot_mix.py, generalised).

python mix.py <video_dir> [score.wav]   (reads film.json and audio/narration.wav; writes audio/mix.wav)
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

from sfx import SR, SYNTHS, blip, murmur, place
from timewarp import warp


def _load(path: Path, n: int) -> np.ndarray:
    sr, x = wavfile.read(path)
    x = x.astype(np.float64)
    x = x.mean(axis=1) if x.ndim > 1 else x
    x /= 32768.0 if np.abs(x).max() > 2 else 1.0
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    out = np.zeros(n)
    out[: min(n, len(x))] = x[:n]
    return out


def _ducked_score(path: Path, voice: np.ndarray) -> np.ndarray:
    m = _load(path, len(voice))
    m /= np.abs(m).max() + 1e-9
    rms = np.sqrt(signal.lfilter(*signal.butter(1, 3, fs=SR), voice**2).clip(0))
    gain = 1 - 0.6 * signal.lfilter(*signal.butter(1, 2, fs=SR), np.clip(rms / 0.02, 0, 1))
    return m * gain


def _events(film: dict, k):
    t = (lambda x: warp(x, k)) if k else (lambda x: x)
    for s in film["shots"]:
        for e in s.get("sfx", []):
            yield SYNTHS[e["name"]](), t(e["at"]), e.get("gain", 0.1)
        for lb in s.get("labels", []):
            yield blip(), t(lb["at"]), 0.05


def raw_bus(narr: Path, score: Path | None, film: dict, warp_k=None) -> np.ndarray:
    n = int(film["duration"] * SR)
    voice = _load(narr, n)
    bus = voice.copy()
    rng = np.random.default_rng(7)
    on = [(s["from"], s["to"]) for s in film["shots"] if film.get("sets", {}).get(s.get("set"), {}).get("ambience") == "murmur"]
    if on:
        quiet = [(s["from"], s["to"]) for s in film["shots"] if s["type"] in {"insert", "data"}]
        amb = murmur(rng, film["duration"], quiet)
        mask = np.zeros(n)
        for a, b in on:
            mask[int(a * SR) : int(b * SR)] = 1
        bus += amb * signal.lfilter(*signal.butter(1, 4, fs=SR), mask) * 0.045
    if score:
        bus += _ducked_score(score, voice) * 0.16
    for sound, at, gain in _events(film, warp_k):
        place(bus, sound, at, gain)
    peak = np.abs(bus).max()
    return bus / peak * 0.89 if peak > 0.89 else bus


def mix(narr: Path, score: Path | None, film: dict, out: Path, warp_k=None) -> Path:
    bus = raw_bus(narr, score, film, warp_k)
    raw = out.with_suffix(".raw.wav")
    wavfile.write(raw, SR, (np.stack([bus, bus], axis=1) * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                    "-ar", str(SR), str(out)], check=True)
    raw.unlink()
    return out


def main(argv: list[str]) -> None:
    video = Path(argv[0]).resolve()
    film = json.loads((video / "film.json").read_text())
    score = Path(argv[1]) if len(argv) > 1 else None
    print(mix(video / "audio" / "narration.wav", score, film, video / "audio" / "mix.wav"))


if __name__ == "__main__":
    main(sys.argv[1:])
```

- [ ] **Step 5: Run the tests**

Run: `... -m pytest core/engines/suppose/tests/test_mix.py -q`
Expected: PASS. Then check loudness by hand once: `ffmpeg -i <tmp>/m.wav -af ebur128 -f null - 2>&1 | grep "I:"`
shows about −16 LUFS. Run the studio clicks check on the result: `omni qc` is per-video, so call
`studio.checks` clicks directly on the file (see `core/studio/checks.py`) and confirm no clicks.

- [ ] **Step 6: Commit**

```bash
git add core/engines/suppose/scripts/{sfx,mix}.py core/engines/suppose/tests/test_mix.py
git commit -m "feat(suppose): mix with ducked score, set ambience, sheet sfx and label blips at -16 LUFS"
```

### Task 11: Kit rig, ported with parity tests

**Files:**
- Create: `kit/src/rig/types.ts`, `keys.ts`, `Puppet.tsx`, `Person.tsx`, `scale.ts`
- Modify: `kit/src/index.ts`
- Test: `kit/tests/rig.parity.test.tsx`

**Interfaces:**
- `types.ts`: `Piece = {src: string; w: number; h: number}`; `Parts = Record<'head'|'torso'|'uarmL'|'uarmR'|'farmL'|
  'farmR'|'thighL'|'thighR'|'shinL'|'shinR', Piece> & {hip?: number; sh?: [number, number]; face?: [number, number,
  number]}`; `CastMember = Parts & {height: number; roles: string[]; signature: string; voice?: {desc: string; seed:
  number} | null}`.
- `keys.ts`: `Ease`, `IO`, `OUT`, `BACK`, `LIN`, `Key`, `keys`, `limb`, `drift`, `blinkAt` (the pilot's `rig.ts`).
- `Puppet.tsx`: `Part`, `Face`, `Shadow`, `out`. One change from the pilot: `Part` uses `staticFile(src)` as-is
  (library srcs always contain a folder).
- `Person.tsx`: `PersonPose`, `Person`, `strideAt` (the pilot's v8, byte-for-byte logic), plus an optional
  `rim?: {side: 'left'|'right'|'top'; color: string}` and `farShade?: number` prop, both off by default (Task 13
  fills them in).
- `scale.ts`: `PEER = 0.88`, `personH(p: Parts)`, `SCARF_H = 1357`, `MAN_H = 1712` (legacy constants the pilot
  rebuild needs).

- [ ] **Step 1: Write the parity test**

```tsx
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {Person as PilotPerson} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/Person';
import {SCARFC, SALARY} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/castV4';
import {Person} from '../src/rig/Person';

const POSES = [
  {},
  {phase: 1.3, walk: 1, dir: 1 as const, turn: 0.6},
  {big: true, smile: 0.8, lid: 0.5, browLift: 20, armL: {a: 140, f: 15}, armR: {a: 30, f: -40}, mouth: 0.7},
  {eyes: 0, headTilt: -8, headDip: 12, armRFront: true},
];

describe('rig parity with pilot v8', () => {
  for (const [name, parts] of [['scarf', SCARFC], ['salary', SALARY]] as const) {
    POSES.forEach((p, i) => {
      it(`${name} pose ${i}`, () => {
        const a = renderToStaticMarkup(<Person parts={parts} x={100} y={600} s={0.3} p={p} />);
        const b = renderToStaticMarkup(<PilotPerson parts={parts} x={100} y={600} s={0.3} p={p} />);
        expect(a).toBe(b);
      });
    });
  }
});
```

- [ ] **Step 2: Run and see it fail**

Run: `cd core/engines/suppose/kit && npx vitest run tests/rig.parity.test.tsx`
Expected: FAIL (`../src/rig/Person` not found).

- [ ] **Step 3: Port the files**

```bash
P=../../../../channels/say-suppose/pilot/only-100/remotion/src   # from core/engines/suppose/kit/src/rig
cd core/engines/suppose/kit/src/rig
cp $P/rig.ts keys.ts
cp $P/Puppet.tsx Puppet.tsx
cp $P/Person.tsx Person.tsx
```

Then edit:
- `Puppet.tsx`: replace `staticFile(src.includes("/") ? src : \`cut/${src}\`)` with `staticFile(src)`. (The parity
  test's srcs contain `/`, so markup stays equal.)
- `Person.tsx`: change `import type {Parts} from './castData'` to `import type {Parts} from './types'`. Leave all
  logic unchanged. Add the two optional props `rim` and `farShade` to the props type, unused for now.
- `types.ts`: the types above (`Piece` and `Parts` copied from the pilot's `castData.ts`, without the KENJI/WOMAN/
  GREY/RICEMAN data).
- `scale.ts`:
  ```ts
  import type {Parts} from './types';
  export const SCARF_H = 1357;
  export const MAN_H = 1712;
  export const PEER = 0.88;
  export const personH = (p: Parts) => p.thighL.h * 0.86 + p.shinL.h * 0.95 + p.torso.h * (p.hip ?? 0.9) + p.head.h * 0.95;
  ```
- `index.ts`: `export * from './rig/types'; export * from './rig/keys'; export * from './rig/Puppet'; export * from
  './rig/Person'; export * from './rig/scale';`

- [ ] **Step 4: Run the tests and typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: 8 parity cases PASS; tsc clean. A failing case means the port changed logic: diff against the pilot file.

- [ ] **Step 5: Commit**

```bash
git add core/engines/suppose/kit/src/rig core/engines/suppose/kit/src/index.ts core/engines/suppose/kit/tests/rig.parity.test.tsx
git commit -m "feat(suppose-kit): rig ported from pilot v8 with markup parity tests"
```

### Task 12: Kit film parts and the set loader

**Files:**
- Create: `kit/src/film/Cam.tsx`, `Set.tsx`, `Crowd.tsx`, `Readout.tsx`, `Grade.tsx`, `Cards.tsx`
- Modify: `kit/src/index.ts`
- Test: `kit/tests/film.test.tsx`

**Interfaces:**
- `Cam.tsx`: `W = 1280`, `H = 720`, `FPS = 30`; `Cam` (pilot's), `clampF(z, f, half)`, `View` (pilot's, from
  `Pilot60.tsx`).
- `Set.tsx`: `SetAngle` type (the `set.json` angle: `plate`, `scarf {x,y,s}`, `h {horizon, at} | {fixed}`, `crowd`,
  `clear`, `bounds`, `key`); `hAtFor(angle: SetAngle, scarfH: number): (y: number) => number` (pilot formulas:
  `PEER * scarfH * s * (y - horizon) / (at - horizon)`, or `PEER * scarfH * s * fixed`); `SetPlate: React.FC<{angle:
  SetAngle; blur?: number}>` (the pilot's `SetImg` with `angle.plate`).
- `Crowd.tsx`: the pilot's `Crowd` with one change: it takes `kinds: Parts[]` as a prop instead of importing the v4
  cast (the film passes the library members with role `crowd`, in the pilot's weighted order when given).
- `Readout.tsx`: the pilot's `Readout` and `FactPill` (generalised: `text`, `source?`, `t`, `t0`, `t1`).
- `Grade.tsx`: the pilot's `Grade`, plus `mood?: 'warm'|'cool'|'void'|'blueprint'` that tints the wash (warm: the
  pilot's; cool: `rgba(120,160,255,.10)`; void: darker vignette; blueprint: navy `rgba(20,40,90,.25)`).
- `Cards.tsx`: the pilot's `RuleCard` and `Title` (moved from FilmParts), using `FONT` from `toolkit/palette.ts`
  (Task 13; until then define `FONT` locally as the pilot's).

- [ ] **Step 1: Write the tests**

```tsx
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {Crowd as PilotCrowd} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/FilmParts';
import {SALARY, OFFICE, STUDENT, GENT, GRAN, PACKER, WORKER} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/castV4';
import {clampF, hAtFor, Crowd} from '../src/index';

const KINDS = [SALARY, OFFICE, STUDENT, GENT, GRAN, SALARY, OFFICE, STUDENT, GRAN, GENT, SALARY, PACKER, GRAN, WORKER];

describe('film parts', () => {
  it('clamps the focus so a push never shows past the plate', () => {
    expect(clampF(2, 0, 640)).toBe(320);
    expect(clampF(2, 1280, 640)).toBe(960);
    expect(clampF(1, 100, 640)).toBe(640);
  });
  it('height at depth matches the pilot wide formula', () => {
    const h = hAtFor({plate: '', scarf: {x: 640, y: 600, s: 0.2}, h: {horizon: 430, at: 600}} as never, 1357);
    expect(h(600)).toBeCloseTo(0.88 * 1357 * 0.2);
    expect(h(430)).toBeCloseTo(0);
  });
  it('crowd markup matches the pilot for the same kinds', () => {
    const hAt = (y: number) => 0.88 * 1357 * 0.2 * ((y - 430) / 170);
    const props = {t: 3.3, n: 14, seed: 200, y0: 470, y1: 596, hAt, speed: 170, clear: [500, 780, 560, 700] as [number, number, number, number]};
    expect(renderToStaticMarkup(<Crowd {...props} kinds={KINDS} />)).toBe(renderToStaticMarkup(<PilotCrowd {...props} />));
  });
});
```

- [ ] **Step 2: Run, see it fail, port, run again**

Run `npx vitest run tests/film.test.tsx`: FAIL. Port: copy the named pieces out of the pilot's `FilmParts.tsx`,
`Overlays.tsx` and `Pilot60.tsx` (`View`, `clampF`) into the files above; replace pilot-relative imports with kit
ones (`../rig/...`); `Crowd` gets the `kinds` prop and uses it where the pilot used `KINDS`; `rnd` comes from the
pilot's `People2D.tsx` (copy the function into `Crowd.tsx`). Export everything from `index.ts`. Run `npx vitest run
&& npx tsc --noEmit`: PASS.

- [ ] **Step 3: Commit**

```bash
git add core/engines/suppose/kit/src/film core/engines/suppose/kit/src/index.ts core/engines/suppose/kit/tests/film.test.tsx
git commit -m "feat(suppose-kit): camera, set loader, crowd, readout, grade and cards from the pilot"
```

### Task 13: The W toolkit, the action library and the demo

**Files:**
- Create: `kit/src/toolkit/{palette.ts,camera.ts,Rim.tsx,Atmosphere.tsx,Foreground.tsx,Letterbox.tsx,FreezeFrame.tsx,Afterimage.tsx,Data.tsx,Blueprint.tsx,EndScreen.tsx,Thumb.tsx}`
- Create: `kit/src/actions/{moods.ts,acts.ts,index.ts}`
- Create: `kit/src/demo/Toolkit.tsx`; modify `kit/src/Root.tsx`, `kit/src/rig/Person.tsx` (rim, farShade),
  `kit/src/index.ts`
- Test: `kit/tests/toolkit.test.tsx`, `kit/tests/actions.test.ts`

**Interfaces:**
- `palette.ts`: `GOLD = '#ffc24a'`, `CORAL = '#ff6b5a'`, `CREAM = '#f4efe6'`, `BLUEPRINT = '#7fb6ff'`, `NAVY =
  '#0f1d3a'`; fonts loaded with `@remotion/google-fonts` (`Fredoka` 700, `Nunito` 900, `Playfair Display` 900
  italic): `TITLE_FONT`, `LABEL_FONT`, `END_FONT`; `FONT` (alias of `LABEL_FONT`).
- `camera.ts`: `camAt(move: CameraSpec, l: number /* 0..1 through the shot */, t: number) -> {z, fx, fy, roll}`
  for `push`, `pull`, `drift`, `pan`, `roll`, `shake`, `crane`, `track`, `still` (still still drifts 2 px: W3).
  `CameraSpec = {move: string; z?: [number, number]; focus?: [number, number]; to?: [number, number]; amount?:
  number}`.
- `Rim`: SVG filter id per side; `Person` with `rim` set draws a `drop-shadow(±3px 0 0 color)` on the lit side
  (opacity 0.85) and darkens far limbs by `farShade` (CSS `brightness(1 - farShade)` on the z<0 thigh/shin and the
  far arm). Defaults: off, so Task 11 parity holds.
- `Atmosphere: React.FC<{kind: 'dust'|'rain'|'fog'|'rays'|'streak'|'stars'; t: number; seed?: number; strength?:
  number}>` (deterministic from `seed` and `t`).
- `Foreground: React.FC<{src?: string; children?: React.ReactNode; blur?: number; x: number; y: number; s?:
  number}>` (a blurred near layer).
- `Letterbox: React.FC<{ratio: 2.39 | null; t: number; t0: number}>`: bars animate in over 0.4 s.
- `FreezeFrame: React.FC<{t: number; t0: number; t1: number; badge?: string; children: React.ReactNode}>`: a 3-frame
  white flash at `t0`, cool tint, hanging particles, corner badge.
- `Afterimage: React.FC<{trail: number; render: (dt: number) => React.ReactNode}>`: 4 fading copies.
- `Data.tsx`: `DataCard` (title, counter that counts up as spoken, small curve), `Compare` (two bars), `Dimension`
  (an arrow with a label), `Callout` (leader line), `Meter`, `Badge`; all pop in with `BACK` scale over 0.25 s and
  fade before `to`.
- `Blueprint: React.FC<{t: number; children?: React.ReactNode}>`: navy grid, light-blue line art layer, gold
  highlights.
- `EndScreen: React.FC<{t: number; question: string; cast: React.ReactNode}>`: question in `END_FONT`, a comment
  bubble, a subscribe pill, the cast lined up.
- `Thumb: React.FC<{art: string; caption?: string; number?: string}>`: the thumbnail caption in code (D10 skill).
- `actions/moods.ts`: `MOOD_FACE: Record<Mood, Partial<PersonPose>>` for the 18 moods (W2), e.g. `shocked: {open:
  1.3, browLift: 30, mouth: 0.8, smile: 0}`, `smirk: {smile: 0.6, lid: 0.25, browLift: 6}`, `sad: {browSad: 20,
  smile: -0.6, lid: 0.2}`, `awe: {open: 1.25, browLift: 22, mouth: 0.5}`, `sleepy: {lid: 0.6, smile: 0}`.
- `actions/acts.ts`: `Act = {act: string; at?: number; to?: number; mood?: Mood; prop?: string; dir?: 1|-1; from?:
  [number, number]}`; one function per act returning a partial pose over time, e.g. `wave(t, a)` raises the right arm
  to 150° with a ±18° forearm swing at 3 Hz; `walkIn(t, a, stride)` returns `{x, phase, walk: 1, dir}`.
- `actions/index.ts`: `poseAt(acts: Act[], t: number, base?: Partial<PersonPose>, seed?: number): {pose: PersonPose;
  dx: number}`. Later acts override earlier ones from their `at`; `idle` always runs underneath (a blink every 2.5–4 s
  from `seed`, a breathing bob of 0.8% torso height at 0.25 Hz).

- [ ] **Step 1: Write the tests**

```ts
// actions.test.ts
import {describe, expect, it} from 'vitest';
import {poseAt, MOOD_FACE} from '../src/index';

const MOODS = ['neutral','smile','happy','joy','surprised','shocked','scared','worried','nervous','angry','determined','sad','cry','smirk','sleepy','thinking','confused','awe'];

describe('actions', () => {
  it('maps all eighteen moods', () => expect(Object.keys(MOOD_FACE).sort()).toEqual([...MOODS].sort()));
  it('blinks every 2.5 to 4 s', () => {
    const closed = Array.from({length: 600}, (_, i) => i / 30).filter((t) => (poseAt([{act: 'idle'}], t, {}, 3).pose.lid ?? 0) > 0.9);
    const starts = closed.filter((t, i) => i === 0 || t - closed[i - 1] > 0.2);
    const gaps = starts.slice(1).map((t, i) => t - starts[i]);
    expect(gaps.length).toBeGreaterThan(3);
    gaps.forEach((g) => { expect(g).toBeGreaterThanOrEqual(2.5); expect(g).toBeLessThanOrEqual(4.01); });
  });
  it('a react changes the face from its time on', () => {
    const acts = [{act: 'idle'}, {act: 'react', mood: 'shocked' as const, at: 1}];
    expect(poseAt(acts, 0.5).pose.browLift ?? 0).toBeLessThan(10);
    expect(poseAt(acts, 1.4).pose.browLift).toBe(30);
  });
  it('walkIn moves without foot slide', () => {
    const a = poseAt([{act: 'walkIn', at: 0, to: 2, from: [0, 0], dir: 1}], 1);
    const b = poseAt([{act: 'walkIn', at: 0, to: 2, from: [0, 0], dir: 1}], 1.1);
    expect(b.dx).toBeGreaterThan(a.dx);
    expect(b.pose.phase! - a.pose.phase!).toBeGreaterThan(0);
  });
});
```

```tsx
// toolkit.test.tsx
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {camAt, Letterbox, DataCard, Person, Atmosphere} from '../src/index';
import {SCARFC} from '../../../../../channels/say-suppose/pilot/only-100/remotion/src/castV4';

describe('toolkit', () => {
  it('every camera move moves (W3)', () => {
    for (const move of ['push','pull','drift','pan','roll','shake','crane','track','still']) {
      const a = camAt({move, z: [1, 1.3], focus: [640, 360], to: [800, 360]}, 0, 0);
      const b = camAt({move, z: [1, 1.3], focus: [640, 360], to: [800, 360]}, 0.5, 2);
      expect(JSON.stringify(a), move).not.toBe(JSON.stringify(b));
    }
  });
  it('letterbox is absent before t0 and present after', () => {
    expect(renderToStaticMarkup(<Letterbox ratio={2.39} t={0} t0={1} />)).toBe('');
    expect(renderToStaticMarkup(<Letterbox ratio={2.39} t={2} t0={1} />)).toContain('height');
  });
  it('a data card shows its number only once spoken', () => {
    expect(renderToStaticMarkup(<DataCard t={0.5} at={1} to={4} title="people / day" value={3500000} />)).toBe('');
    expect(renderToStaticMarkup(<DataCard t={3} at={1} to={4} title="people / day" value={3500000} />)).toContain('3,500,000');
  });
  it('rim light is off unless asked', () => {
    const off = renderToStaticMarkup(<Person parts={SCARFC} x={0} y={600} s={0.3} p={{}} />);
    const on = renderToStaticMarkup(<Person parts={SCARFC} x={0} y={600} s={0.3} p={{}} rim={{side: 'left', color: '#ffd9a0'}} />);
    expect(off).not.toContain('drop-shadow');
    expect(on).toContain('drop-shadow');
  });
  it('atmosphere is deterministic', () => {
    const a = renderToStaticMarkup(<Atmosphere kind="dust" t={1.2} seed={4} />);
    expect(a).toBe(renderToStaticMarkup(<Atmosphere kind="dust" t={1.2} seed={4} />));
  });
});
```

- [ ] **Step 2: Run, see them fail, implement**

Run `npx vitest run tests/actions.test.ts tests/toolkit.test.tsx`: FAIL. Implement each file to its interface above.
Keep each file under 150 lines; no randomness except seeded functions of `(seed, i)` (reuse `rnd` from
`film/Crowd.tsx`). `DataCard` formats numbers with `toLocaleString('en-US')` and counts up from 0 to `value` over the
first 0.6 s after `at`, so the test at `t=3` shows the full number.

- [ ] **Step 3: The demo composition**

`kit/src/demo/Toolkit.tsx`: a 24 s composition on the station set (staged from the library) showing in turn: a push
with rim light and dust; a two-shot with Scarf and the salaryman reacting (`shocked`, `smirk`); a giant face
close-up with scope letterbox; a data card counting "3,500,000 people / day"; a freeze-frame with a "100x" badge; a
blueprint card; the end screen. Register it in `Root.tsx` as `Toolkit` (and `Thumb` with `defaultProps`). This is the
rendered option the owner sees for W1–W7 in Task 17; nothing in it ships until the owner has watched it.

- [ ] **Step 4: Run all kit tests and typecheck, then commit**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS (rig parity still passes because rim and farShade default off).

```bash
git add core/engines/suppose/kit/src core/engines/suppose/kit/tests
git commit -m "feat(suppose-kit): W toolkit, the action library with 18 moods, and the toolkit demo"
```

### Task 14: The shot-sheet renderer

**Files:**
- Create: `kit/src/shots/types.ts`, `ShotView.tsx`, `Film.tsx`, `register.tsx`
- Modify: `kit/src/index.ts`
- Test: `kit/tests/film-render.test.tsx`

**Interfaces:**
- Consumes: `film.json` from `sheetcheck.emit` (Task 6): `{film, fps, size, duration, audio, beats, shots, cast,
  crowd, sets, props}`.
- `types.ts`: `FilmData` and `ShotData` mirroring the sheet format in `sheet.py`; `Shot = React.FC<{t: number; l:
  number; film: FilmData}>` (the type custom shots export: `export const S2: Shot = ...`).
- `ShotView.tsx`: `ShotView: React.FC<{shot: ShotData; film: FilmData; t: number}>`. For a set shot: `View` with
  `camAt` over the plate (parallax 0.6), crowd bands from `set.json` `crowd` using `film.crowd` kinds, each cast
  member placed at `at` with `poseAt(acts, t)`, scale from the set's `hAtFor` (Scarf at his set scale; others at
  `PEER` of Scarf at that depth, children 0.72), `Shadow` under each, rim light from the angle's `key` only
  when the sheet asks (`rim: true`), so a pilot rebuild stays unlit; labels
  (`data` → `DataCard`, `dim` → `Dimension`, `callout` → `Callout`, `pill` → `FactPill`), `readout` → `Readout`,
  `letterbox` → `Letterbox`, `mood` → `Grade` mood, `atmosphere` → `Atmosphere`. For `data`, `blueprint`, `title`
  and `end` types: the matching toolkit component full frame.
- `Film.tsx`: `Film: React.FC<FilmData & {customs: Record<string, Shot>}>`: picks the shot covering the current
  time, renders a custom shot by id when `shot.custom` is set (passing `t` in film seconds and `l` = seconds into
  the shot), always draws `Grade`, plays `<Audio src={staticFile(film.audio)} />`.
- `register.tsx`: `registerFilm(customs: Record<string, Shot>)` registers a `Film` composition whose
  `calculateMetadata` reads `duration` and `fps` from props.

- [ ] **Step 1: Write the test**

```tsx
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';
import {ShotView} from '../src/index';

const film = {
  film: 't', fps: 30, size: [1280, 720], duration: 6, audio: 'audio/mix.wav', beats: [],
  cast: {scarf: {height: 1357, roles: ['hero'], signature: '', head: {src: 'cast/pieces/h.png', w: 10, h: 10}} as never},
  crowd: {}, props: {},
  sets: {station: {id: 'station', angles: {wide: {plate: 'sets/station/wide.png', scarf: {x: 640, y: 600, s: 0.2}, h: {horizon: 430, at: 600}, crowd: {back: [470, 596]}, clear: [500, 780, 560, 700], bounds: {zmax: 2}, key: {side: 'left', color: '#ffd9a0'}}}}},
} as never;

describe('ShotView', () => {
  it('draws the plate and a label once spoken', () => {
    const shot = {id: 's1', from: 0, to: 6, type: 'wide', set: 'station', angle: 'wide', camera: {move: 'push', z: [1, 1.2]}, cast: [], labels: [{kind: 'data', text: '≈ 3,500,000', at: 2, to: 5}]} as never;
    expect(renderToStaticMarkup(<ShotView shot={shot} film={film} t={1} />)).toContain('sets/station/wide.png');
    expect(renderToStaticMarkup(<ShotView shot={shot} film={film} t={3} />)).toContain('3,500,000');
  });
});
```

(The test's `cast.scarf` lacks most pieces; `ShotView` must not crash on an empty `cast` list, which this shot uses.)

- [ ] **Step 2: Run, see it fail, implement, run again**

Run `npx vitest run tests/film-render.test.tsx`: FAIL → implement → PASS. Then `npx vitest run && npx tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add core/engines/suppose/kit/src/shots core/engines/suppose/kit/src/index.ts core/engines/suppose/kit/tests/film-render.test.tsx
git commit -m "feat(suppose-kit): the shot-sheet renderer and registerFilm"
```

### Task 15: `review.py` and `framediff.py`

**Files:**
- Create: `core/engines/suppose/scripts/review.py`, `core/engines/suppose/scripts/framediff.py`
- Test: `core/engines/suppose/tests/test_review.py`, `core/engines/suppose/tests/test_framediff.py`

**Interfaces:**
- `framediff.py`: `mean_abs_diff(a: Path, b: Path) -> float` (0–255 scale, RGB, same size required);
  CLI `python framediff.py <a_dir> <b_dir> <threshold>` compares same-named PNGs, prints each, exit 1 above threshold.
- `review.py`: `build(video: Path, stage: str) -> Path` writes `<video>/review/<stage>.html`, a self-contained page
  (Artifact-ready: inline CSS, no external fetch except Google Fonts) with: the title; the cut (a `<video>` tag
  pointing at the render path, plus a note to open it locally, since Artifacts cannot load local files); the script
  with each line's start time from `audio/cues_b.json` or `cues_luc.json`; `scriptcheck` metrics; `sheetcheck`
  warnings (holds with reasons, mix, numbers); QC numbers from `qc/<stage>.json` when present (integrated loudness,
  true peak, clicks); render minutes per film minute from `python -m studio.jobs report`'s JSON when available; the
  five-quality look checklist (L6.2) and the W1–W7 checklist as unticked boxes for the owner; the owner notes from
  `review/notes.md` as a to-do list. At G1 (`stage == "proposal"`): the packaging (title, alt titles, synopsis,
  characters, outline, art list with its credit quote from `art.yaml`) and a thumbnail feed mock grid of `art/thumb_*.png`
  beside benchmark thumbnails in `channels/say-suppose/analytics/benchmark-thumbs/` if present.

- [ ] **Step 1: Write the failing tests**

```python
# test_framediff.py
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import framediff  # noqa: E402


def test_identical_frames_differ_by_zero_and_shifted_ones_do_not(tmp_path):
    a = np.zeros((10, 10, 3), np.uint8)
    b = a.copy()
    b[:5] = 40
    Image.fromarray(a).save(tmp_path / "a.png")
    Image.fromarray(b).save(tmp_path / "b.png")
    assert framediff.mean_abs_diff(tmp_path / "a.png", tmp_path / "a.png") == 0
    assert framediff.mean_abs_diff(tmp_path / "a.png", tmp_path / "b.png") == 20
```

```python
# test_review.py
import json
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import review  # noqa: E402


def video(tmp_path: Path) -> Path:
    v = tmp_path / "2026-12-01_what-if-x"
    (v / "audio").mkdir(parents=True)
    (v / "review").mkdir()
    (v / "script.md").write_text("TOPIC: What If X? SCRIPT: You run... fast. Why?")
    (v / "audio" / "cues_b.json").write_text(json.dumps({"cues": [{"line": "001_narrator", "start": 0.4, "end": 1.2}]}))
    (v / "cast-pass.yaml").write_text(yaml.safe_dump({"lines": [{"n": 1, "text": "You run... fast.", "speaker": "narrator"}]}))
    (v / "review" / "notes.md").write_text("- make the crowd slower\n")
    return v


def test_story_script_page_has_script_times_checklists_and_notes(tmp_path):
    html = review.build(video(tmp_path), "story_script").read_text()
    for must in ["You run... fast.", "0:00.4", "light with a visible source", "make the crowd slower", "W1"]:
        assert must in html, must
```

- [ ] **Step 2: Run, see them fail, implement, pass**

`framediff.mean_abs_diff`: load both with Pillow as RGB arrays (float), assert equal shape, return
`float(np.abs(a - b).mean())`. `review.build`: build the HTML with small helper functions (one per section, each
under 60 lines), `html.escape` every user string, time format `m:ss.s`. Run the tests: PASS.

- [ ] **Step 3: Commit**

```bash
git add core/engines/suppose/scripts/{review,framediff}.py core/engines/suppose/tests/test_review.py core/engines/suppose/tests/test_framediff.py
git commit -m "feat(suppose): review page builder and frame diff"
```

---

# Part C: pipeline and proof

### Task 16: The `studio-suppose` pipeline, its skills and the channel format

**Files:**
- Create: `core/openmontage/pipeline_defs/studio-suppose.yaml`
- Create: `core/openmontage/skills/studio/studio-suppose-{proposal,script,edit,final-watch,publish}.md`
- Modify: `channels/say-suppose/channel.yaml` (format `film`, loudness `film`), `core/PATCHES.md`
- Test: `core/studio/tests/test_studio_suppose.py`

**Interfaces:**
- Consumes: everything above. The stage names are the five of `studio-whatif` (so `omni approve`, checks, media
  proofs and the signed upload work unchanged).

- [ ] **Step 1: Write the failing test**

```python
"""The studio-suppose pipeline (Say Suppose film kit): five owner gates, its skills and checks."""

from pathlib import Path

import yaml

from lib.pipeline_loader import load_pipeline_readonly
from studio import checks

REAL_ROOT = Path(__file__).resolve().parents[3]
OM = REAL_ROOT / "core" / "openmontage"
STAGES = ["proposal", "story_script", "final_edit", "final_watch", "publish_prep"]


def test_five_owner_gates_and_skills():
    m = load_pipeline_readonly("studio-suppose")
    assert [s["name"] for s in m["stages"]] == STAGES
    assert all(s["human_approval_default"] is True and s["checkpoint_required"] is True for s in m["stages"])
    for skill in m["required_skills"]:
        assert (OM / "skills" / f"{skill}.md").is_file(), skill


def test_checks_match_studio_whatif():
    for stage in STAGES:
        assert checks.stage_checks("studio-suppose", stage) == checks.stage_checks("studio-whatif", stage)


def test_channel_has_the_film_format_at_minus_16():
    ch = yaml.safe_load((REAL_ROOT / "channels" / "say-suppose" / "channel.yaml").read_text())
    assert ch["formats"]["film"] == "studio-suppose"
    assert ch["formats"]["story"] == "studio-whatif"
    assert ch["loudness"]["film"]["integrated_lufs"] == -16


def test_stage_skills_name_their_prompts_and_tools():
    text = {s: (OM / "skills" / "studio" / f"studio-suppose-{s}.md").read_text() for s in ["proposal", "script", "edit", "final-watch", "publish"]}
    assert "prompts/outline.md" in text["proposal"] and "say-suppose-thumbnails" in text["proposal"]
    assert all(k in text["script"] for k in ["prompts/script.md", "scriptcheck.py", "cast-pass.md", "sheetcheck.py", "voices.py", "cold open"])
    assert "prompts/narration.md" in text["edit"] and "timewarp" in text["edit"]
```

Run: `... -m pytest core/studio/tests/test_studio_suppose.py -q`
Expected: FAIL (pipeline missing).

- [ ] **Step 2: Write `studio-suppose.yaml`**

Copy `studio-whatif.yaml`. Change: the header comment (the film kit, spec path, art approved at G1, Luc after G2,
free local character voices, the five gates); `name: studio-suppose`; `description` (Say Suppose films on the kit,
900–1,050 word scripts, about 7 minutes, five owner gates); `required_skills` to the five `studio/studio-suppose-*`
plus `meta/checkpoint-protocol`; `metadata.target_seconds: 420`, `min_seconds: 330`, `max_seconds: 510`; keep
`studio_checks` and `studio_warnings` identical; every stage's `skill` to its new skill; `tools_available: []` for
all stages (the kit runs through its own scripts, like the whatif `render_runtime: external`); review_focus and
success_criteria rewritten for the kit:
- proposal: G1 packet (title + three alternatives, synopsis, characters, outline, three thumbnails in a feed mock,
  the art list and its credit quote; the owner's G1 approval OKs that art spend).
- story_script: G2 on the 720p first cut: script from `prompts/script.md` passing `scriptcheck.py`, the owner's script
  read applied, voice B narration and free character voices, shot sheet passing `sheetcheck.py`, cold-open look check
  done, `omni qc ... story_script` passes.
- final_edit: G3 picture lock: Luc narration (paid, quoted), time warp applied, final score, notes applied, 1080p.
- final_watch, publish_prep: as in `studio-whatif`.

- [ ] **Step 3: Write the five skills**

Each skill names its stage, the gate, the files it reads and writes, the prompts and scripts in order, the paid calls
and their approval rule, and ends with "write `awaiting_human` and stop; only the owner passes the gate". The
`studio-suppose-script.md` order:

1. Fill `prompts/script.md` with the G1 title, series context and outline; answer; save `script.md`.
2. `python core/engines/suppose/scripts/scriptcheck.py <video>/script.md`; fix every FAIL; note WARNs.
3. Fill `prompts/cast-pass.md`; save the answer as `cast-pass.yaml`; check with code that the joined lines equal the
   script; add the claims to `claims.md`.
4. `python core/engines/suppose/scripts/voices.py <video>` (voice B and character voices, free); the owner reads the
   script and listens (not a gate); apply their notes, re-run 2–4 if words changed.
5. Art (approved at G1): run the approved GPT Image calls from `art.yaml` with `prompts/set-plate.md`,
   `parts-sheet.md`, `cast-lineup.md`; slice, write each character's map, `rig.py`; render a rig check sheet; measure
   `set.json`; `Library.add` each file.
6. Fill `prompts/shots.md`; save `shots.yaml`; write custom hero shots in `custom/*.tsx`; `sheetcheck.py <video>
   --emit` until no FAIL.
7. `mix.py <video> <library score>`; stage the public dir with `Library.stage`; render the cold open (first ~30 s)
   at 720p through `studio.jobs --queue render`; check it against W1–W7 and L6.2 (not an owner step); then render the
   full 720p cut.
8. `omni qc say-suppose <video> story_script`; `review.py <video> story_script`; publish the page; write
   `awaiting_human`.

`studio-suppose-edit.md`: quote Luc (lines × characters × 0.006 credits, ×1.4 retakes), wait for the OK, one job per
line with `prompts/narration.md`, whisper-check each take, `stitch.py` into `cues_luc.json`, `timewarp` the sheet
times (shots stay on voice B time; the film plays on Luc time), final score per `prompts/score.md` after its own
quote and OK or a library cue, 1080p render, `omni qc ... final_edit`, review page.

- [ ] **Step 4: Channel format and patches**

`channel.yaml`:

```yaml
formats:
  story: studio-whatif            # v1, archived; tests read it
  film: studio-suppose            # the film kit (spec 2026-11-27): five owner gates, about 7 minutes
...
loudness:
  story: {integrated_lufs: -14, tolerance_lu: 1, true_peak_dbtp_max: -1, lra_lu_max: 11}
  film: {integrated_lufs: -16, tolerance_lu: 1, true_peak_dbtp_max: -1.5, lra_lu_max: 11}
```

`core/PATCHES.md`: add rows for `pipeline_defs/studio-suppose.yaml` and `skills/studio/studio-suppose-*.md` in the
same table style as the studio-whatif rows.

- [ ] **Step 5: Run the tests and `omni check`**

Run: `... -m pytest core/studio/tests/test_studio_suppose.py core/studio/tests/test_studio_whatif.py -q` and
`.venv/bin/omni check say-suppose`
Expected: PASS; `omni check` clean.

- [ ] **Step 6: Commit**

```bash
git add core/openmontage/pipeline_defs/studio-suppose.yaml core/openmontage/skills/studio/studio-suppose-*.md channels/say-suppose/channel.yaml core/PATCHES.md core/studio/tests/test_studio_suppose.py
git commit -m "feat(say-suppose): studio-suppose pipeline, its five stage skills and the film format"
```

### Task 17: Rebuild the pilot on the kit and compare with v8

**Files:**
- Create: `core/engines/suppose/examples/only-100/{shots.yaml,index.ts,README.md}`,
  `core/engines/suppose/examples/only-100/custom/{Shots.tsx,FilmParts.tsx}`
- Test: frame comparison (manual run, recorded in `examples/only-100/README.md`), plus `make test`

**Interfaces:**
- Consumes: the kit (Tasks 11–14), the library (Task 8), `sheetcheck.emit` (Task 6), `framediff.py` (Task 15).

- [ ] **Step 1: Port the pilot's shots**

- `custom/FilmParts.tsx`: the pilot-only pieces from `FilmParts.tsx` (`Phone`, `LIST`, `BoardDots`, `scarfRest`,
  `fadeIn`) and from `CutoutC.tsx` (`scarfAt`, `manAt`) and `Cast2.tsx` (`ScarfCutPose`, `ManCutPose`, `Arm`), and
  `Cast4.tsx` (`Scarf4`, `Man4`, `RiceBall`, `faceY` helpers), importing kit parts from `@suppose/kit` and cast
  parts from `film.cast` (passed in) instead of `castV4.ts`.
- `custom/Shots.tsx`: every shot of `Pilot60.tsx` except S1, S3a and S3b, each as `export const <Name>: Shot = ({t,
  l, film}) => ...`, with the body unchanged except imports and `toOld` time mapping (the example plays on Luc's time
  through `timewarp`, as the pilot does).
- `shots.yaml`: the pilot's 14 shots with their times from `Pilot60.tsx` (old timeline). S1, S3a and S3b as sheet
  shots (`type: wide`, set `station`, angles `high`/`high`/`wide`, camera push/pull with the pilot's zoom values,
  crowd bands with the pilot's `n`, `seed`, `speed`, Scarf with `idle` and the pilot's look-around as `lookAt` acts);
  every other shot `type: custom`, `custom: <Name>`.
- `index.ts`: `import {registerFilm} from '@suppose/kit'; import * as shots from './custom/Shots'; registerFilm(shots);`

- [ ] **Step 2: Validate and stage**

```bash
python core/engines/suppose/scripts/sheetcheck.py core/engines/suppose/examples/only-100 --emit
python -c "import sys; sys.path.insert(0,'core/engines/suppose/scripts'); from library import Library; from pathlib import Path; print(Library.for_channel('say-suppose').stage(Path('core/engines/suppose/examples/only-100'), Path('/tmp/suppose-only100-public')))"
```

(Use the scratchpad instead of `/tmp`.) Copy the pilot's `pilot_mix_luc.wav` from `$P` into the staged public dir as
`audio/mix.wav`. Expected: no FAIL from sheetcheck; WARNs listed (the pilot predates W5, so spoken-number warnings
are expected and recorded, not fixed).

- [ ] **Step 3: Render 8 stills from each and diff**

From the pilot worktree (`$P/..`, which has `node_modules`), render v8 stills at 8 timestamps across the film,
covering S1, S2, S3b, a two-shot, the phone list, the title, a rule card and the last shot:

```bash
.venv/bin/python -m studio.jobs run --step stills_v8 --channel say-suppose --video pilot-only-100 --queue render -- \
  bash -c 'cd <pilot remotion dir> && for f in 60 140 260 480 900 1350 1650 1990; do npx remotion still src/index.ts Pilot60 <scratch>/v8/f$f.png --frame=$f; done'
.venv/bin/python -m studio.jobs run --step stills_kit --channel say-suppose --video pilot-only-100 --queue render -- \
  bash -c 'cd core/engines/suppose/kit && for f in 60 140 260 480 900 1350 1650 1990; do npx remotion still ../examples/only-100/index.ts Film <scratch>/kit/f$f.png --frame=$f --props=../examples/only-100/film.json --public-dir=<staged public>; done'
python core/engines/suppose/scripts/framediff.py <scratch>/v8 <scratch>/kit 2.0
```

Expected: custom-shot frames at or under 1.0 mean absolute difference; sheet-shot frames (f60, f260) at or under 6.0
(crowd and acts reproduce the pilot closely, not to the pixel). If a custom frame is above 1.0, the port changed
something: diff the shot's code against `Pilot60.tsx`. Record every number in `examples/only-100/README.md`.

- [ ] **Step 4: Full renders and the owner's side-by-side page**

Render the full kit cut at 720p and the toolkit demo (Task 13) through the render queue. Build one review page (an
Artifact, via `review.py` plus a small extra section) with: v8 and the kit cut side by side, the frame-diff table,
and the toolkit demo with the W1–W7 list beside it. Send the owner the link. The owner watching both is the
acceptance test for the kit; their notes are a to-do list.

- [ ] **Step 5: Full test run and commit**

Run: `make test`
Expected: all suites pass, including `suppose` and `suppose-kit`.

```bash
git add core/engines/suppose/examples
git commit -m "test(suppose): the pilot rebuilt on the kit, frame diff against v8"
```

### Task 18: Close out

- [ ] Run `/simplify` on the branch's code changes, then `make lint` and `make test`.
- [ ] Update `channels/say-suppose/RESTART.md`: add a section "Film kit (2026-11-27)" with the spec and plan paths,
  where prompts, library, engine and pipeline live, and that the first real film starts in its own session with the
  topic skill.
- [ ] Open a PR with `gh pr create --repo priyanshu-kushwaha-stack/omni-studio`, base `claude/say-suppose-restart-870236`
  if PR #68 is still open (this branch is stacked on it), otherwise `main`. Body: what the kit is, the frame-diff
  numbers, the review page link, and that no gate was passed and no paid call made.

---

## Self-review notes (for the executor)

- Spec coverage: decisions D1–D14 are in Tasks 2–6 (prompts, checks), 8–9 (library, voices), 16 (pipeline, G1 art
  approval, Luc after G2). W1–W12: W1/W3–W5 in `shots.md`, `sheetcheck.py`, toolkit and `ShotView`; W2 in actions;
  W6 in `cast-lineup.md`, `outline.md` and the cast library; W7 in the toolkit and `set-plate.md`; W8 in the art
  prompts; W9 in `narration.md`; W10 in `outline.md`; W11 in `studio-suppose-script.md` step 7; W12 in every prompt's
  checklist. L1–L9 per the spec's checklist table. Errors: rig stops on a bad sheet (Task 8, `zip(strict=True)`),
  sheetcheck fails (Task 6), take mismatch (narration checklist), queue held (`studio.jobs`), changed library file
  (`Library.verify`). Testing: parity (Tasks 11–12), Python tests per tool, pipeline test (Task 16), frame diff (17).
- Not in this plan, by the spec: a real film, Shorts, dubbing, cadence, removing `studio-whatif`.
