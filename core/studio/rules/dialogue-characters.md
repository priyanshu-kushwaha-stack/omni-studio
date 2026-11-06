# Dialogue between characters

check: none (G6 watch)

From video 5 on, scripts use dialogue between different characters in between the narration, so the video feels
interactive rather than a documentary. Owner, 2026-11-01: "The format of the video isn't that interactive i feel
and it feels more like documentary still but it has improved with every video... We need to add Dialogues in
between now which would make it more interactive fro different characters".

How: characters talk to each other (and to the viewer) in distinct voices, e.g. Oog the caveman against the
modern "You" figure, with the Professor as host. Each speaker has its own voice (`channels/professor-of-us/voices.yaml`)
and on-screen acting: the speaker's mouth moves with their own line audio and listeners look at the speaker
(`short_rigs.py` `dialogue_actions`, engine test `test_dialogue_speaker_talks_and_the_listener_looks_at_them`).
Keep viewer questions; put some of them in a character's mouth. Script lines `PROF:`, `OOG:`, `YOU:`, `GRANDMA:`.

G6 watch: do characters talk to each other in distinct voices for about half the runtime, or does it slide back
into narration?
