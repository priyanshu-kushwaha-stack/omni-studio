# Ask the viewer questions

check: none (G6 watch)

Every Professor of Us script puts a direct question to the viewer about every 20-30 s, then pauses about 1 s
and answers it (marked `> ASK:` in script.md). Use guess-the-number, predict-the-result and which-would-you-trust
questions, not rhetorical filler. A question never carries a new fact; the answer line cites the claim.

Why: after video 2 the owner said it was "okay", but it didn't hold their full attention, and at times felt
heavy, plain or disconnected. Questions make the viewer think first, so the answer lands better.

Partly automated: `script_lint.py` item 10 checks re-engagement points and item 27 checks that a `> QUIZ:`
follows an `> ASK:`. Nothing checks the 20-30 s spacing, so at G6 the owner watches for it.

G6 watch: is there a question to the viewer about every 20-30 s, each followed by a pause and the answer?
