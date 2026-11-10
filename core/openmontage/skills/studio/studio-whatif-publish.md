# studio-whatif: publish_prep (G7)

Write `publish.md` while the G6 render runs: title, description with the sources from `claims.md`, audience (not
made for kids), altered content answer, and the pinned comment: the film's dilemma, asked as a question, so the
comments answer it. Write `upload.yaml` (`file`, `title`, `description`, `tags`,
`made_for_kids`, `contains_synthetic_media`, optional `thumbnail`: a JPG or PNG of at most 2 MB in the video
folder, optional `captions`: `{en: subtitles/en.srt, hi: subtitles/hi.srt}`; no privacy or schedule field) and run
`.venv/bin/omni upload <slug> <video>`: the dry run prints the exact private upload. Agents never upload and
never make a video public: a real upload (`--run`) only when the owner asks for it, always private; the public
flip is the owner's, by hand in YouTube Studio. `status: awaiting_human`, then stop.

## What the API does, and what only Studio does

Learned on the first Say Suppose video (pause-time, 2026-11-08).

| Step | How |
|---|---|
| Upload, title, description, tags, kids, AI answer | `omni upload --run` (youtubeuploader), after the owner's G7 approval signs the file and metadata |
| Thumbnail | `thumbnail:` in upload.yaml; on an uploaded video `--thumbnail-only --run --confirm <slug>/<video>` (50 quota units) |
| Subtitles | `captions:` in upload.yaml, added after a good read-back; or `--captions-only` (400 units a track) |
| Dub audio track | Studio only: Languages, Add language, the language, Audio, Add. Audio-only, the video's length |
| End screen | Studio only: Details, End screen. Keep to the right third the end card leaves empty |
| Thumbnail A/B test | Studio only: the A/B Testing button by the **title** opens Test and compare; pick "Thumbnail only", up to 3 |
| Pinned comment | after the video is public: YouTube allows no comments on private videos, and the API cannot pin |
| Public flip or schedule | the owner, by hand in Studio |

Build the files the steps need:
- subtitles: `core/engines/whatif/pipeline/subtitles.py <video> en`, and per dub `... <lang> dub/<lang>/script.md`;
- a dub track: `channels/say-suppose/videos/2026-11-06_pause-time-for-10-seconds-a-day/dub/README.md`;
- thumbnail word tags: `channels/say-suppose/brand/thumb_tag.py` (at most 3 words, never the title's words, off faces,
  never the bottom-right corner, where YouTube draws the duration).

## Gotchas

- **OAuth.** The Google Cloud project's YouTube client is a Web application with the redirect
  `http://localhost:8080/oauth2callback`. In Testing mode only listed test users sign in: at `omni youtube-auth <slug>`
  (owner only, once per channel), choose the owner's personal Google account, then the brand channel. Choosing the brand identity itself fails with
  403 access_denied.
- **Unverified API project.** Its uploads can be locked private until Google's YouTube API audit. Studio showed no
  notice on the pause-time video, and it could be scheduled.
- **AI use.** Studio calls the altered-content answer "AI use", under Show advanced settings. The read-back returns
  no value for `false`; check it in Studio.
- **Chrome uploads.** The browser's file upload takes at most 10 MB: send a dub as a 192 kbps MP3, not 320 kbps.
- **Auto-dubbing** appears in Settings only on eligible channels (in practice the Partner Program). A new channel has none.
