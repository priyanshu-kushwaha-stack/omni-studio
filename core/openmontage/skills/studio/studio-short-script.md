# studio-short: short_script (G2, script)

1. Write `script.md` as `## [mm:ss]` sections, 130-145 spoken words (45-55 s). Two of the cast talk to each
   other in their own voices (`PROF:`, `OOG:`, `YOU:`, `GRANDMA:`); `core/studio/rules/dialogue-characters.md`.
2. One `> ASK:` question inside the dialogue that a character answers at once, at the normal line gap. No pause,
   no `> QUIZ:` boards (`core/studio/rules/viewer-questions.md`; `script_lint.py` item 27 fails a board).
3. The last line flows back into the first (the loop).
4. Claims ledger: every factual claim, number, date or name spoken has a row in `claims.md` (id, claim, source
   URL, status `sourced` / `contested` / `spot-checked`), and the script cites it inline, e.g. `(c03)`.
5. `.venv/bin/omni qc <slug> <video> short_script` must pass (claims, no quiz boards).
6. `status: awaiting_human`, then stop. The owner reads the whole script before any asset is generated.
