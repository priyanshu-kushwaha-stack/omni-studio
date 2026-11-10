# studio-whatif: final_watch (G4, final watch)

**The one 1080p render.** First render the film once at 1920x1080 with `whatif_render` `quality: final` (`mode`
full, no `frames`) from the code and narration G3 (picture lock) approved; the tool waits for the render queue. Never stitch the
final-watch file from cached beats and never mux it: G4's media proof covers this exact file. Run
`.venv/bin/omni qc <slug> <video> final_watch --media <render>` on it, then hand it over.

Hand the owner the render path, its duration and every check result, plus the watch list: is each real-world
claim on screen the one in `claims.md`; does anything hold longer than 6 seconds; any click or pop; any text on
a face or out of the safe area. The owner watches at 1x with cold viewers. Tests passing is not done; the owner
watching is. `status: awaiting_human`, then stop.

After the watch, add one line per cold viewer to `channels/<slug>/taste.md`, dated: where they looked away, laughed,
asked a question or reached for the phone. No model reviews this stage. While the final-watch render runs, prepare G5
(`studio-whatif-publish`) so the owner can take G4 and G5 in one sitting.
