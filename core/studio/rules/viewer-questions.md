# Ask the viewer questions, inside the dialogue

check: none for spacing (G6 watch); `script_lint.py` item 27 fails any `> QUIZ:` board

Questions stay in Professor of Us scripts about every 20-30 s (`> ASK:`), but they are part of the dialogue: the
Professor asks and You or Oog answers straight away at the normal line gap. No `> QUIZ:` three-option boards, no
answer cards, no 3-2-1 countdown, and no held silence after a question. Write questions a character answers (a
wrong guess from You or a deadpan one from Oog, then the Professor's sourced answer). The only held beats are
mood beats, such as before a tonal turn. A question never carries a new fact. Applies to Shorts too.

Why: on 2026-10-30, after video 2, the owner found it heavy and disconnected, so asks with a ~1 s pause were
added; video 5 grew them into 7 on-screen quizzes with 3 s holds. On 2026-11-06, watching the video 6 rough cut,
the owner said the three-option questions "kill the connectivity", "would look good for kids videos but not
here", and "we dont need to take a pause". This reverses the earlier ask-pause-answer rule.

Partly automated: `script_lint.py` item 27 fails any `> QUIZ:` board (since 2026-11-06; scripts approved before
then, such as video 5 in faceless-channel, are not re-linted). `compose.py` still renders boards so old videos can be
re-rendered. Item 10 checks re-engagement points, but nothing checks the 20-30 s spacing.

G6 watch: is there a question about every 20-30 s, answered at once by a character, with no pause and no quiz board?
