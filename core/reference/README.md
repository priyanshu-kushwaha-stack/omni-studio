# Reference clips

Owner-approved renders that show what a format should look and sound like. One YAML file per clip under
`core/reference/<format>/`: the path to the media inside the repo, its sha256 and size, who approved it and when.
The media itself is never committed (`*.mp4` and `core/reference/**/media/` are git-ignored); the YAML is.
`studio.reference.verify(path)` re-hashes the file and fails when it is missing or changed.

| Format | Clip | Approved |
|---|---|---|
| short | [tails-rerender-noboil](short/tails-rerender-noboil.yaml) | owner, 2026-11-06 |
