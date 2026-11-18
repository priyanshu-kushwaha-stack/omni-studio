# v7c: "plasm" or "plasma" (2026-11-18)

**Owner on v7b:** "is it plasm or plasma. Hearing it sounds like just plasm. Maybe a fraction of pause when its finishing
that sentence."

- **Why it said "plasm":** the take was fine, but the mix cuts each take 0.15 s after the transcript's end of its last
  word. The transcript ended "plasma" at 2.46 s, while the final "a" ran 2.64-2.76 s, so the cut removed it.
- **Fix:** a new free local take (voice B, same words) whose final "a" sits inside the kept part; a transcript of the
  rendered film's audio reads "...two thirds of the world's plasma." The pause after the line is 0.3 s longer (1.45 s).
  One breath-click mute after "Eleven fifty-eight" (about 11:35) is 90 ms longer, inside the silence between words.
- **The cut:** `renders/v7/v7c-720p.mp4`, 13:12; phone copy `renders/v7/v7c-480p-phone.mp4`. `omni qc final_edit`
  passes (-14.0 LUFS, -1.7 dBTP, clicks, similarity; the same opening warning); `omni qc story_script` passes.
- **Engine gap, recorded with `omni fix`:** the same cut can soften any line that ends on a quiet syllable.

# v7b: your three notes on the v7 cut (2026-11-18)

- **The cut:** `renders/v7/v7b-720p.mp4`, 13:11, 1280x720; phone copy `renders/v7/v7b-480p-phone.mp4`.
- **Checks:** `omni qc final_edit` passes loudness (-14.0 LUFS, -1.7 dBTP, LRA 7.6 LU), clicks and similarity; the
  opening warning is unchanged (v5's cold open). `omni qc story_script` passes on the new line. Cost $0.

| # | Note | What changed |
|---|---|---|
| 1 | 3:24, the woman card isn't needed | The bridge-woman tag is gone |
| 2 | 5:06, not needed either | The grandmother tag is gone. Cast tags left: the nurse, your brother, your boss, the clerk |
| 3 | 8:16, a better frame for blood and plasma; the line eats the word "plasma" | The US map is replaced by a drawn sheet: a blood tube that separates into red blood and gold plasma, then three plasma bags, two tagged USA and one WORLD, so two thirds read at a glance. The line is now "It supplies about two thirds of the world's plasma." with a new free local take (voice B), checked by transcript: "plasma" is said in full |

The rest of this file is the v7 review; everything in it still holds, except the two cards above.

# v7, the final version: "What If AI Rented Your Brain While You Slept?" (2026-11-17)

**Owner, 2026-11-17, after watching the G3 cut:** "go ahead with v5 and take learning from v7 and then create a final
version", "review music and voice at all places and then just move forward", then "i liked v5 more so keep v5 as the
base now".

- **The cut:** `renders/v7/v7-720p.mp4`, 13:11, 1280x720 (no 1080p before G4); a phone copy is
  `renders/v7/v7-480p-phone.mp4`.
- **The script:** v5, line for line, minus one line (the dish fact): 137 lines. The twist is v5's ("design the thing
  that will never need sleepers"). Same free local voice B takes as v5; one new take, the watts line.
- **Checks:** `omni qc final_edit` passes loudness (-14.0 LUFS, -1.8 dBTP, LRA 7.6 LU), clicks and similarity. The opening warning (first word at 7.4 s) is v5's cold open, which you preferred; say if the broker should speak sooner.
- **Cost:** no paid call; v7 cost $0 (local Qwen3 voice, local ACE-Step music, everything drawn in code).

## Gates

- **G2 needs your word again.** You approved G2 on the v6 script; v7 is v5's script with your notes, so the story_script
  stage's `omni qc` passes on v7, but the approval on file is for v6. On this template one sitting can sign both:
  `omni approve ... story_script`, then `omni approve ... final_edit`.
- **G3** (`checkpoint_final_edit.json`) is `awaiting_human`. Only you pass either gate.

## Your five notes on the G3 cut, applied to v5

| # | Note | What changed |
|---|---|---|
| 1 | Remove the grey-suit card | Gone. The cast cards left are the nurse, your brother, the bridge woman, your boss, the grandmother and the clerk |
| 2 | The music at 1:24-2:00 is off | The Rule has its own new cue, option A "fine print" (you picked it from three), under the whole leaflet section (1:21-2:28) |
| 3 | The camera moves too fast under narration | Every push and pull that runs under a spoken line is slowed or turned into a cut plus a slow push; list below |
| 4 | Drop "brother graduates in a month" | It was a v6 line, so it's gone; no graduation flyer or debt note anywhere |
| 5 | The 1:33 example isn't relatable | The brain-cells-in-a-dish line, its page and its IT'S TRUE card are cut. The line is now "Your brain burns about twenty watts, a dim bulb. At night, the leaflet calls that unused power", over one dim bulb that lights low on "twenty watts" |

**What came across from G3 (craft, not script):** the brother lying in the top bunk at Midnight; the held band always
the thin glowing strip; the bigger coin that catches the light; face and both hands in the pen-and-band shot; the lit
landing (wall lamp, HOME door, doormat, stair rail); the KEYS / DOOR / YOU strip clear of the bunk rail; the last 15 s
with the right third kept clear for end screens. Also from the v6 review list: the reveal drawing fills the frame,
coins fall into the jar and light pulses up the thread, the steaming boot, the HOME label, the folded square, the same
face in both notebook columns, KEYS and DOOR peeled off at the end, one dark pane in the window wall.

**Not brought across:** v6's cold open and the 0.47 s thumbnail flash (v5's opening is the one you liked), the debt
note, the three-rules leaflet, the label maker (v5's stamp stays), "a band for your days" and "Why choose?".

**Camera moves slowed:** the Rule pages (one slow push, not a pan); the two-bands page; the shelf of jars; the visa sign
and the suits; the news window; the grandmother's "out-earns the whole street"; More Hours' clinic shot; the Night Shift
bin and gown; the Warehouses front, bulk and arrival, and the home-to-broker pan (halved); the Contract (one push, it
used to pull fast); One Mind's two wides; Midnight's window wall; Night One's grin. Long holds from v5 (Problem one,
the rat maze, the shelf, the visa sign, Midnight) now have one slow move or a cut on a cue word. The globe push and the
hundred-window pull sit in wordless holds, so they are unchanged.

## Music and voice, section by section

Times are in v7. Music is local ACE-Step; it sits at about -26 dB under the voice and comes up in the wordless holds.
Voice is voice B (cool for the story, warm only for the lesson).

| Time | Section | Music (cue, feel) | Voice: what to listen for |
|---|---|---|---|
| 0:00-0:20 | The Chair | the channel theme, light | the nurse and the broker in their own voices; the first word is at 7.4 s, after the band goes on and the ghost rises (v5's opening) |
| 0:20-1:21 | Night One | "hush", D major, slow | the narrator's first long stretch, cool; your brother's "keeps score" lines, quick and dry |
| 1:21-2:28 | The Rule | **new: "fine print"**, G major, plucked, wry | the leaflet lines; the new watts take; "Still a scam" and "by Saturday he's wearing one" landing as jokes |
| 2:28-4:26 | Crumbs | "crumbs" | the boot, the tune, the bridge word; the bridge woman's voice |
| 4:26-6:13 | More Hours | "boom", the gold rush | the boss and the grandmother; the music lifts here, so check it never covers the voice |
| 6:13-7:14 | The Night Shift | "unease", E minor | the facts land; Problem 2 |
| 7:14-8:05 | The Photo | "photo", F major, dark | the slowest, quietest read in the film; the music is thin |
| 8:05-9:29 | The Warehouses | "market", D minor | Problem 3, the plasma fact, the clerk |
| 9:29-10:10 | The Contract | "dread", B minor | the pen, your brother's hand; the broker at his closest |
| 10:10-11:33 | One Mind | "awe", E major | the globe hold is wordless; the music comes up there, then down for "…is a machine" |
| 11:33-12:14 | Midnight | "release", A major, warm | the knock, "Nobody opens"; the voice turns warm here for the lesson |
| 12:14-13:11 | Morning | "dawn", warm | the twist ("design the thing that will never need sleepers"), the end tags, the street to the end |

Clicks and steps were checked across the whole mix: one spike inside the nurse's "rested" (3:11.6), the same one G3 had,
gets the same 60 ms 2 dB dip; a mute there would cut the word. Every other cut, mute and duck is ramped.

## For you to judge at 1x

- The Rule cue (1:21-2:28): option A in place, under the voice. Say if it is too busy under the leaflet lines.
- The new watts take (about 2:05): a plain read, stress on "twenty watts".
- Cards that sit just under a face: the bridge woman (about 3:25), the grandmother (about 5:06), Problem 2 (about 7:07).
- The leaflet's page one opens blank for about 1 s, as in v5.
- The visa sign is blank until the stamp, as in v5; the three grey suits in the queue are small.
- The reveal drawing's sun clips at the top late in its push (about 11:16).
