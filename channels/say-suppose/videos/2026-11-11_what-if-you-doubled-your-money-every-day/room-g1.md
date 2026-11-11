# Room report, G1 (proposal)

Shipped: none. No round is a candidate (lint ok, an ok verdict from story, fact, no fact blocker), so the gate check will fail.
Calls: 16 of 16

Owner first: round 1's draft went to the owner at 2026-11-11T18:11:59+00:00

## Open notes in round 8

- claims check (fact) blocker, line 43: ""Day two hundred and sixty-seven. More dollars than atoms in the universe." (about 10^80, c09)". Overstates scope beyond what c09 and its source support. The source URL (en.wikipedia.org/wiki/Observable_universe) and verbatim quote ("approximately 10^80 hydrogen atoms, also known as the Eddington number") measure the observable universe, not the entire universe, which may be infinite. The claim row in claims.md c09 explicitly specifies "atoms in the observable universe". Fix: "Day two hundred and sixty-seven. More dollars than atoms in the observable universe." (about 10^80, c09)
- claims check (fact) blocker, line 41: "Counting it out loud now takes seventeen thousand years (c08).". Overstates precision. 2^39 seconds is approximately 17,421 years (or 17,400 years as given in the c08 quote). The claim in claims.md c08 explicitly requires the caveat "about seventeen thousand", but the draft speaks it as an exact number without "about". Fix: Counting it out loud now takes about seventeen thousand years (c08).
- claims check (fact) blocker, line 41: ""This morning you were given more than you had ever had in your life, added together."". Arithmetic error on doubling series. On day forty (2^39 = $550 billion), the new money given at midnight is 2^38 ($275 billion), which is not more than all previous days' balances added together ($550 billion), nor more than all previous credits added together ($275 billion). As correctly stated in line 37 ("Today is always your whole life so far, plus one"), it is your total balance that exceeds everything before it added together, not the morning increment. Fix: "This morning your balance is more than your whole life so far, added together."
- claims check keep, line 38: ""Most money, sir, is made when a bank lends. And when a loan is repaid, the money doesn't go anywhere. It stops existing. The Bank of England wrote that down in 2014." (c03, c04)"
- claims check keep, line 43: ""On most computer systems, the number box is sixty-four bits. And because the bank counts in cents, day fifty-eight overflows into a negative nineteen-digit number (c06).""
- claims check keep, line 36: "Wagenaar and Sagaria (1975) (c05): asked to extend a doubling series, people guess a small fraction of the truth, and being told doesn't fix it."
- story editor (story) blocker, line 36: "You put down a deposit on a flat with a view, half a million's worth, sure that doubling grows slowly enough to leave you with just enough for this one.". Check #5 But / therefore fails. Because the power doubles the remaining balance, this deposit—and every later transfer—must change all subsequent balances and crossover days, but the outline continues using the untouched powers-of-two sequence. Fix: Either recalculate every later balance and deadline after each withdrawal, or make the uses leave the doubling account untouched. For this beat: sign a binding purchase agreement payable on day thirty-one, with no deposit leaving the account; apply the same accounting explicitly to the camera, Nana's transfer, the loan test and the giving montage.
- story editor (story) blocker, line 47: "You look at your balance out of habit: 0. "Mrs. Vance. On the tab."". Check #4 A habit, then the change fails. The opening habit is checking the balance before deciding and asking for a tab when it is thin; the ending repeats that exact sequence. Fix: Morning: you point to the notebook before touching the phone. Mrs. Vance writes two. Only then does the phone light up with 0; you glance once and turn it face-down.
- story editor (story) blocker, line 36: "Day fifteen: the camera Theo wanted; he points it at your balance and never puts it down.". Check #6 Every use has a gap fails. You expect to obtain the camera and obtain exactly the camera; no surprising result turns the use. Fix: Day fifteen: you expect the camera to preserve a private joke between you and Theo; instead it records proof that escapes the flat, so by day twenty-five strangers on the pier know your name.
- story editor keep, line 41: "Your double is her half."
- story editor keep, line 38: "That is the most important boring sentence in this video."
- story editor keep, line 45: "for the part that ends."

## Rounds

| round | lint | seats ok | blockers | judge |
|---|---|---|---|---|
| 1 | ok | 2/2 | 6 | - |
| 2 | ok | 2/2 | 6 | - |
| 3 | ok | 2/2 | 5 | - |
| 4 | ok | 2/2 | 6 | - |
| 5 | ok | 2/2 | 6 | - |
| 6 | ok | 2/2 | 5 | - |
| 7 | ok | 2/2 | 6 | - |
| 8 | ok | 2/2 | 6 | - |
