# studio-dialogue: dialogue_script (G2, script)

1. Write `script.md` as dialogue between the cast in `channels/<slug>/cast.md` (`PROF:`, `OOG:`, `YOU:`,
   `GRANDMA:` lines). About half the runtime is two characters talking to each other, each in their own voice.
   Rule: `core/studio/rules/dialogue-characters.md`.
2. Put a `> ASK:` question about every 20-30 s inside the dialogue: a character answers at once, no pause, no
   `> QUIZ:` boards (`core/studio/rules/viewer-questions.md`). A question never carries a new fact.
3. Every spoken number gets a row in `claims.md`.
4. Lint: `.venv/bin/python core/engines/pou/scripts/script_lint.py <video>/script.md --target-minutes 5`.
5. `status: awaiting_human`, then stop. The owner reads the whole script before any asset is generated.
