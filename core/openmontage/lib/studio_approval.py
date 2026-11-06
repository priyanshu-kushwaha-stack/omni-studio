"""omni-studio: proof that a gate was passed by `omni approve`, checked by lib/checkpoint.py.

Studio channel projects (videos/<id>/ inside a folder holding channel.yaml, or a project marker naming a
channel) may only record human_approved=True on a gated stage when metadata.approval.proof is an HMAC that
`omni approve` (studio.channels.approve_stage) made with the key in ~/.config/omni-studio/approval.key.
The proof covers the project, stage, pipeline and artifacts, so a hand-edited checkpoint, a direct
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
from pathlib import Path
from typing import Any, Optional

KEY_ENV = "OMNI_STUDIO_APPROVAL_KEY"
DEFAULT_KEY = Path("~/.config/omni-studio/approval.key")
VIA = "omni approve"


class ApprovalRefused(ValueError):
    """A gated stage claims approval without a valid `omni approve` proof."""


def key_path() -> Path:
    return Path(os.environ.get(KEY_ENV) or DEFAULT_KEY).expanduser()


def _key(create: bool) -> Optional[bytes]:
    path = key_path()
    if path.is_file():
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


def _message(project_id: str, stage: str, pipeline_type: Optional[str], artifacts: dict[str, Any],
             at: str) -> bytes:
    body = json.dumps(artifacts, sort_keys=True, separators=(",", ":"), default=str)
    return json.dumps({"project_id": project_id, "stage": stage, "pipeline_type": pipeline_type or "unknown",
                       "artifacts_sha256": hashlib.sha256(body.encode()).hexdigest(), "at": at, "via": VIA},
                      sort_keys=True).encode()


def sign(project_id: str, stage: str, pipeline_type: Optional[str], artifacts: dict[str, Any], at: str) -> str:
    """Called only by studio.channels.approve_stage. Creates the key on first use."""
    key = _key(create=True)
    return hmac.new(key, _message(project_id, stage, pipeline_type, artifacts, at), hashlib.sha256).hexdigest()


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
    expected = hmac.new(key, _message(project_id, stage, pipeline_type, artifacts, str(approval.get("at"))),
                        hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, str(approval["proof"])):
        raise ApprovalRefused(
            f"approval of stage {stage!r} of {project_id!r} does not match: it was not made by `omni approve`, "
            f"or the checkpoint changed after approval"
        )
