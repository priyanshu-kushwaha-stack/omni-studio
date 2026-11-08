# studio-whatif: publish_prep (G7)

Write `publish.md`: title, description with the sources from `claims.md`, audience (not made for kids), altered
content answer, pinned comment inviting what-ifs. Write `upload.yaml` (`file`, `title`, `description`, `tags`,
`made_for_kids`, `contains_synthetic_media`, optional `thumbnail`: a JPG or PNG of at most 2 MB in the video
folder; no privacy or schedule field) and run
`.venv/bin/omni upload <slug> <video>`: the dry run prints the exact private upload. Agents never upload and
never make a video public: a real upload (`--run`) only when the owner asks for it, always private; the public
flip is the owner's, by hand in YouTube Studio. `status: awaiting_human`, then stop.
