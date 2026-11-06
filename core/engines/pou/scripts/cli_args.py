#!/usr/bin/env python3
"""The argparse definitions of compose.py, puppet_render.py and tts.py, in one light module (argparse only).

The scripts parse their own argv with these, and the omni-studio tools (core/openmontage/tools/studio/) parse
the same argv with the same parsers before running a script, so a check on the parsed value (the motion file,
the puppet stage, the TTS engine) sees exactly what the script will use. Every parser refuses abbreviated
options (`--eng` for `--engine`), and options that decide a check may be given only once.
"""
from __future__ import annotations

import argparse
from pathlib import Path

TTS_ENGINES = ("chatterbox", "eleven", "qwen3")


class Once(argparse.Action):
    """Store the value; a second occurrence of the option is an error, not a silent override."""

    def __call__(self, parser, namespace, values, option_string=None):
        seen = getattr(namespace, "_once_seen", set())
        if self.dest in seen:
            parser.error(f"{option_string} given more than once")
        seen.add(self.dest)
        namespace._once_seen = seen
        setattr(namespace, self.dest, self.const if values is None else values)


def _parser(description: str | None) -> argparse.ArgumentParser:
    return argparse.ArgumentParser(description=description, allow_abbrev=False,
                                   formatter_class=argparse.RawDescriptionHelpFormatter)


def compose_parser(description: str | None = None) -> argparse.ArgumentParser:
    p = _parser(description)
    p.add_argument("video_dir", type=Path)
    p.add_argument("--narration", type=Path, required=True)
    p.add_argument("--words", type=Path, required=True)
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument("--until", type=float, default=None)
    p.add_argument("--size", default="1920x1080")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--music", type=Path, action="append", default=[], help="music cue(s), played in order and looped")
    p.add_argument("--music-gain-db", type=float, default=-24.0)
    p.add_argument("--quiz-music", type=Path, default=None, help="loop played (timed) under each quiz countdown")
    p.add_argument("--quiz-music-gain-db", type=float, default=-20.0)
    p.add_argument("--no-clips", action="store_true", help="ignore assets/clips (stills only)")
    p.add_argument("--scratch", type=Path, default=None)
    p.add_argument("--video-in", type=Path, default=None, help="dub mode: reuse this render's picture, mix the new narration under it")
    p.add_argument("--mix-out", type=Path, default=None, help="dub mode: also write the mixed audio alone (m4a) for a YouTube audio track")
    p.add_argument("--motion", nargs="?", const="__default__", default=None, action=Once,
                   help="apply procedural motion from motion.json (optionally a path): flicker, sprite, trace "
                        "(boil is banned by the owner and refused by the studio tool)")
    p.add_argument("--burn-captions", action="store_true", help="Shorts: burn caption lines into the lower middle")
    return p


def compose_motion_path(args: argparse.Namespace) -> Path | None:
    """The motion.json compose.py will read, or None when --motion is not given."""
    if args.motion is None:
        return None
    return args.video_dir / "motion.json" if args.motion == "__default__" else Path(args.motion)


def puppet_render_parser(description: str | None = None) -> argparse.ArgumentParser:
    p = _parser(description)
    sub = p.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build", allow_abbrev=False)
    b.add_argument("rigs", type=Path, nargs="+")
    r = sub.add_parser("render", allow_abbrev=False)
    r.add_argument("stage", type=Path)
    r.add_argument("-o", "--out", type=Path, required=True)
    r.add_argument("--audio-from", type=Path, default=None, help="cut the same ranges' audio from this render")
    r.add_argument("--only", nargs="*", default=None, help="scene ids (preview a single scene)")
    r.add_argument("--workers", type=int, default=6)
    r.add_argument("--ranges", default=None, help="override the stage's ranges: 133.68:142.61[,a:b]")
    c = sub.add_parser("check", help="action start frame vs word time", allow_abbrev=False)
    c.add_argument("stage", type=Path)
    cl = sub.add_parser("clips", help="render each scene to <video>/assets/clips/<id>.mp4 (no overlays, no audio)",
                        allow_abbrev=False)
    cl.add_argument("stage", type=Path)
    cl.add_argument("--only", nargs="*", default=None)
    cl.add_argument("--workers", type=int, default=6)
    f = sub.add_parser("frames", help="render single frames to PNG (previews, contact sheets)", allow_abbrev=False)
    f.add_argument("stage", type=Path)
    f.add_argument("times", type=float, nargs="+")
    f.add_argument("--dir", type=Path, required=True)
    return p


def tts_parser(description: str | None = None) -> argparse.ArgumentParser:
    p = _parser(description)
    p.add_argument("text", type=Path, help="plain text file (output of narration_text.py, one part)")
    p.add_argument("--engine", choices=TTS_ENGINES, required=True, action=Once)
    p.add_argument("--voice-ref", type=Path, default=Path("/dev/null"), help="clean wav of the owner's voice (qwen3: 10-30 s; chatterbox uses the first 10 s; eleven ignores it)")
    p.add_argument("--voice-text", type=Path, help="transcript of --voice-ref (qwen3 clones better with it; otherwise it transcribes the clip itself)")
    p.add_argument("-o", "--out", type=Path, required=True)
    p.add_argument("--max-words", type=int, default=None, help="chunk size; default per engine (qwen3 200, chatterbox 50)")
    p.add_argument("--gap", type=float, default=0.35)
    p.add_argument("--check", action="store_true", help="transcribe the result and print the word error rate")
    return p
