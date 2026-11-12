# Room: G1 fact nits go to G2, and an owner note buys rounds (2026-11-12)

Owner's pick, 2026-11-12 ("G1 nits to G2"), after the doubled-money film's G1 room spent its 16-call cap in eight
rounds without a candidate (`core/studio/issues/2026-11-12-say-suppose-proposal-1.yaml`).

## The problem

- **The claims check fills its blocker limit.** Its brief makes "every unsupported or overstated line" a blocker, and
  fact blockers are never cut. At G1 every rewrite brought three new small ones ("$365.5" against "surpassed $365",
  "universe" against "observable universe", "seventeen thousand" without "about"), so no round was a candidate.
- **The owner's notes get no budget of their own.** `derived_cap` keeps calls for three owner-notes rounds
  (`OWNER_ROUNDS`). The owner's two notes on this film (no viewer persona; not India) rewrote the premise, and the rest
  of the budget went to rounds an agent started to apply the room's own notes. Nothing tells the two apart.

## The change

**1. At G1 the claims check blocks only on what G2 cannot fix.** A G1 fact blocker is one of:
- a real-world fact the packaging states as true that has no `claims.md` row ("needs a source");
- a line that contradicts its row's verbatim quote;
- a wrong belief (`rules/story.md` #7) that is a straw man, or that the row doesn't break.

Precision, rounding ("about"), scope wording ("observable"), a missing inline `(cNN)` and arithmetic slips are G1
suggestions, each with its corrected line. G2 is unchanged: every spoken line is checked against the ledger, and any
unsupported or overstated line is a blocker there and in `omni qc ... story_script` (claims). The brief also says: return
fewer blockers than the limit rather than fill it. This is a channel brief change
(`channels/<slug>/room/seats/fact-checker.md`, Say Suppose first; Professor of Us has no G1 room).

**2. An owner note at a gate adds two rounds to that gate's cap.** `room lint --owner-notes --owner-note "<words>"`
registers a dated `taste.md` note at the gate: the words must match the bold quote of one `taste.md` entry
(`**"..."**`), and the same note can't be registered twice at the same video and gate. The round's `meta.json` records
it. The gate's cap becomes

    gate_cap = derived_cap(cfg) + OWNER_NOTE_ROUNDS (2) x required seats x notes registered at this gate

and the ledger reservation (`CallContext.script_cap`), the room report's `cap` and so the evidence check all use it.
Rounds an agent starts to apply room notes register nothing and draw on the ordinary cap. `--owner-note` may be given
more than once (two notes in one sitting) and only with `--owner-notes`.

Only the owner's own words go into `taste.md` (its header already says so), so registering a note is the agent
recording what the owner said, not a way to raise its own cap. Like the approval key, this is a convention, not a
boundary against a process running as the owner.

## The doubled-money film

Its two 2026-11-11 notes were applied at round 4 with no budget. The next round (round 9) registers both, so the gate's
cap becomes 16 + 2 x 2 x 2 = 24, eight calls left (four rounds of two seats). Round 9 is the working `packaging.md`
with round 8's notes applied, read by the narrowed claims check.

## Tests

- `gate_cap` with no notes equals `derived_cap`; with one and two notes it adds 2 x required seats each.
- lint refuses `--owner-note` without `--owner-notes`, words that match no `taste.md` bold quote, and a note already
  registered at the same video and gate; it accepts the same note at another gate.
- the ledger refuses a call past `gate_cap`, and the report's `cap` is `gate_cap`.
- existing cap tests keep passing (`test_room_config`, `test_room_viewer_optional`).
