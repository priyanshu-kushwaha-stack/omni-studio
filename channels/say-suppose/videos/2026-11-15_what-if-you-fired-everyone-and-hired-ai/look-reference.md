# The 3D look: reference study (One Small If)

The owner on the v2 cut (2026-11-19, `taste.md`): "The video looks more like plain 2D other people those who are
creating similar videos they have black characters and they are looking like better 3D in real", then pointed to
https://www.youtube.com/@onesmallif ("Look at this."). Studied 2026-11-19 in the owner's Chrome: the channel page and
frames of its newest video ("I Can Breathe Underwater. The Coast Guard Keeps Saving Me.", 9:04, 145K views in a day).
Their channel: original animated "What if...?" stories, about 9 minutes, 48 videos in about two months; their top
videos are "What If You Doubled in Size Every Hour?" (314K) and "What If Everyone Turned Into a Baby Except You?"
(200K). Nothing of theirs is copied: no characters, designs, sets, titles or frames. This note is about the kind of
look only, to build our own.

## What their picture is

- **Real 3D, toy-like.** Rendered 3D, not drawn: simple rounded bodies, low-poly sets, soft global light. Close to a
  Roblox or toy-figure look, clean and readable at phone size.
- **The characters.** A black sphere head and black skin on every character; flat white eyes (two white discs with
  black pupils, brows as dark strokes) and a small white mouth on the face; clothes and hair as soft solid shapes
  (hoodies, caps, helmets, goggles); black gloved-looking hands with clear fingers; a thin light rim around each
  figure that separates it from the set.
- **The sets.** Full 3D rooms and places with props (posters, shelves, a piano, a dock, a ship, a street), warm
  practical lights, sky and sea, god rays underwater, depth-of-field blur on the background, saturated colour.
- **The camera.** Close-ups on faces, mid shots, wides; the background soft behind the character.
- **Explainers.** Flat drawings on a notebook page between scenes (like our cards and the napkin).
- **Faces move with speech** (the mouth changes shape on lines). This channel bans lip-sync (CLAUDE.md, owner rules):
  our characters act with eyes, brows, the mouth as a held expression, hands, poses and the camera, as now.

## What we would keep that is ours

The story, the script and the narration (G2), the diner, the plant, the robots with screen faces and two happy arcs,
the napkin gag, the channel's colours (mustard, teal, crimson) in clothes and props, the paper napkin and cards as the
explainers.

## How it can be made here

Free and local, drawn in code, no AI images: Blender 5.2.3 (installed via Homebrew at /opt/homebrew/bin/blender; to
be pinned in `core/lock.yaml` before production use), scenes built by Python scripts, rendered with Eevee (fast, real
light, soft shadows, bloom, depth of field), the rim outline as an inverted-hull or Freestyle line. The look test
renders the film's opening frame (the thumbnail's moment) in two or three options for the owner to pick from.
