# Ledger for the page pass

No paid calls. The picture, banner and watermark are drawn by `studio.page`:

    python -m studio.page build power-and-citizen -o channels/power-and-citizen/page

## Decisions (owner, 2026-11-06)
- Picture: option A, a pillar and a person at equal height, picked from three code-drawn options.
- Picture and banner approved as built ("Both good").

## Studio session (2026-11-06, agent-driven Chrome; owner said "Publish all three")
- Branding: picture `avatar.png`, banner `banner.png` (name and line inside "Viewable on all devices"),
  watermark `watermark.png` on "Entire video". Published.
- Basic info: description from `about.md`. Handle @PowerAndCitizen: already set.
- Settings, Channel: country India, 10 keywords (179 of 500 characters). Saved.
- Channel id `UC8w3De7erLltACMlOeQzJaA`, recorded in `channel.yaml`.
- Not done: contact email (owner enters it; never in the repo), links, trailer, featured video.

## Verification
- Signed-out fetch of `https://www.youtube.com/@PowerAndCitizen`: name, description and keywords match `about.md`;
  the served picture and banner are the uploaded files.
- Country is not on the public page; it was read back as India in Studio before "Settings saved".
