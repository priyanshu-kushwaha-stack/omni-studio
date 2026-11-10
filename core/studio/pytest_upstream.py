"""pytest plugin for the upstream suite (Makefile: -p studio.pytest_upstream).

Upstream contract tests enumerate playbooks with styles.playbook_loader.list_playbooks() and then read
styles/<name>.yaml directly, so a channel's playbook link in styles/custom/ (made by omni new-channel or
omni link) breaks them with FileNotFoundError. This hides channel links from that enumeration during the
upstream run only. core/studio/tests/test_channel_playbooks.py runs the same playbook contracts on every
channel playbook through its real path, so nothing goes unchecked.
"""

from __future__ import annotations

from pathlib import Path


def channel_link_names(styles_dir: Path) -> set[str]:
    custom = styles_dir / "custom"
    if not custom.is_dir():
        return set()
    channels = (styles_dir.resolve().parents[2] / "channels").resolve()
    return {p.stem for p in custom.glob("*.yaml") if p.is_symlink() and p.resolve().is_relative_to(channels)}


def pytest_configure(config):
    import styles.playbook_loader as loader

    original = loader.list_playbooks

    def list_playbooks(styles_dir=None):
        hidden = channel_link_names(Path(styles_dir or loader.STYLES_DIR))
        return [name for name in original(styles_dir) if name not in hidden]

    loader.list_playbooks = list_playbooks
    config._studio_hidden_playbooks = sorted(channel_link_names(Path(loader.STYLES_DIR)))


def pytest_report_header(config):
    hidden = getattr(config, "_studio_hidden_playbooks", [])
    return f"studio: channel playbooks hidden from upstream contracts: {', '.join(hidden) or 'none'}"
