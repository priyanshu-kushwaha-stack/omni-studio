"""omni-studio: proof that a gate was passed by `omni approve`, checked by lib/checkpoint.py.

Studio channel projects (videos/<id>/ inside a folder holding channel.yaml, or a project marker naming a
channel) may only record human_approved=True on a gated stage when metadata.approval.proof is an HMAC that
`omni approve` (studio.channels.approve_stage) made with the key in ~/.config/omni-studio/approval.key.
The proof covers the project, stage, pipeline, artifacts and approval.media (file, sha256, upload metadata
digest), so a hand-edited checkpoint, a direct
write_checkpoint(human_approved=True) call, or an artifact changed after approval reads as unapproved.

This stops accidental and direct approvals. It is not a security boundary against a process that reads the
key file; the owner rule (never read ~/.config/omni-studio/) covers that. Projects outside a channel, such as
upstream's own tests, are unaffected.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import stat
from pathlib import Path
from typing import Any, Optional

KEY_ENV = "OMNI_STUDIO_APPROVAL_KEY"
DEFAULT_KEY = Path("~/.config/omni-studio/approval.key")
VIA = "omni approve"


class ApprovalRefused(ValueError):
    """A gated stage claims approval without a valid `omni approve` proof."""


def key_path() -> Path:
    return Path(os.environ.get(KEY_ENV) or DEFAULT_KEY).expanduser()


def _check_key_file(path: Path) -> None:
    """The key must be a regular file, not a symlink, readable by its owner only (mode 600)."""
    if path.is_symlink():
        raise ApprovalRefused(f"approval key {path} is a symlink; replace it with a regular file (mode 600)")
    mode = stat.S_IMODE(path.stat().st_mode)
    if mode & 0o077:
        raise ApprovalRefused(f"approval key {path} has mode {mode:o}; it must be 600 (chmod 600 {path})")


def _key(create: bool) -> Optional[bytes]:
    path = key_path()
    if path.is_symlink() or path.is_file():
        _check_key_file(path)
        return path.read_bytes().strip() or None
    if not create:
        return None
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    with os.fdopen(fd, "wb") as handle:
        handle.write(secrets.token_hex(32).encode())
    return path.read_bytes().strip()


def is_studio_project(pipeline_dir: Path, project_id: str) -> bool:
    if (Path(pipeline_dir).parent / "channel.yaml").is_file():
        return True
    marker = Path(pipeline_dir) / project_id / "project.json"
    try:
        return bool(json.loads(marker.read_text(encoding="utf-8")).get("channel"))
    except (OSError, ValueError, AttributeError):
        return False


MEDIA_FIELDS = ("media", "sha256", "at", "metadata_sha256")


def _media_binding(record: Any) -> Any:
    """What the stage proof covers of approval.media: the file, its sha256, when, and the upload metadata digest.
    None (no media) leaves the message as it was before media existed; anything else is folded in, so editing,
    adding or removing approval.media after approval breaks the stage proof."""
    if record is None:
        return None
    if not isinstance(record, dict):
        return {"invalid": repr(record)}
    return {k: str(record[k]) for k in MEDIA_FIELDS if record.get(k) is not None}


def _message(project_id: str, stage: str, pipeline_type: Optional[str], artifacts: dict[str, Any],
             at: str, media: Any = None) -> bytes:
    body = json.dumps(artifacts, sort_keys=True, separators=(",", ":"), default=str)
    fields = {"project_id": project_id, "stage": stage, "pipeline_type": pipeline_type or "unknown",
              "artifacts_sha256": hashlib.sha256(body.encode()).hexdigest(), "at": at, "via": VIA}
    binding = _media_binding(media)
    if binding is not None:
        fields["media"] = binding
    return json.dumps(fields, sort_keys=True).encode()


def sign(project_id: str, stage: str, pipeline_type: Optional[str], artifacts: dict[str, Any], at: str,
         media: Optional[dict[str, Any]] = None) -> str:
    """Called only by studio.channels.approve_stage. Creates the key on first use. `media` is the approval.media
    record (studio.checks.media_proof) the checkpoint will carry, folded into the proof."""
    key = _key(create=True)
    return hmac.new(key, _message(project_id, stage, pipeline_type, artifacts, at, media),
                    hashlib.sha256).hexdigest()


def verify(project_id: str, stage: str, pipeline_type: Optional[str], artifacts: dict[str, Any],
           metadata: Optional[dict[str, Any]]) -> None:
    approval = (metadata or {}).get("approval") if isinstance(metadata, dict) else None
    if not isinstance(approval, dict) or approval.get("via") != VIA or not approval.get("proof"):
        raise ApprovalRefused(
            f"stage {stage!r} of {project_id!r} is a studio gate: only `omni approve` can mark it approved"
        )
    key = _key(create=False)
    if key is None:
        raise ApprovalRefused(f"no approval key at {key_path()}, so no approval of {stage!r} can be checked")
    expected = hmac.new(key, _message(project_id, stage, pipeline_type, artifacts, str(approval.get("at")),
                                      approval.get("media")), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, str(approval["proof"])):
        raise ApprovalRefused(
            f"approval of stage {stage!r} of {project_id!r} does not match: it was not made by `omni approve`, "
            f"or the checkpoint (its artifacts or approval.media) changed after approval"
        )


# --- media approvals: bind an approval to the exact file the checks ran on ---


def _media_message(project_id: str, stage: str, media: str, sha256: str, at: str,
                   metadata_sha256: Optional[str] = None) -> bytes:
    fields = {"project_id": project_id, "stage": stage, "media": media, "media_sha256": sha256, "at": at,
              "via": VIA}
    if metadata_sha256 is not None:
        fields["metadata_sha256"] = metadata_sha256
    return json.dumps(fields, sort_keys=True).encode()


def sign_media(project_id: str, stage: str, media: str, sha256: str, at: str,
               metadata_sha256: Optional[str] = None) -> str:
    """Called only by `omni approve` and `omni approve-upload`, after the stage's checks passed on `media`.
    `metadata_sha256` (publish approvals) is the digest of the upload metadata the owner approved."""
    key = _key(create=True)
    return hmac.new(key, _media_message(project_id, stage, media, sha256, at, metadata_sha256),
                    hashlib.sha256).hexdigest()


def verify_media(project_id: str, stage: str, record: Any) -> dict[str, str]:
    """Return {media, sha256, at} when `record` is a media proof `sign_media` made, else raise."""
    if not isinstance(record, dict) or not all(record.get(k) for k in ("media", "sha256", "at", "proof")):
        raise ApprovalRefused(f"stage {stage!r} of {project_id!r} has no media approval")
    key = _key(create=False)
    if key is None:
        raise ApprovalRefused(f"no approval key at {key_path()}, so the media approval cannot be checked")
    meta = record.get("metadata_sha256")
    expected = hmac.new(key, _media_message(project_id, stage, str(record["media"]), str(record["sha256"]),
                                            str(record["at"]), None if meta is None else str(meta)),
                        hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, str(record["proof"])):
        raise ApprovalRefused(f"media approval of {stage!r} of {project_id!r} was not made by `omni approve`")
    out = {"media": str(record["media"]), "sha256": str(record["sha256"]), "at": str(record["at"])}
    if meta is not None:
        out["metadata_sha256"] = str(meta)
    return out
