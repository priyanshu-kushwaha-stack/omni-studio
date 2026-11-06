import pytest


@pytest.fixture(autouse=True)
def _approval_key_in_tmp(tmp_path, monkeypatch):
    """omni approve makes its HMAC key on first use. Tests never touch ~/.config/omni-studio/."""
    monkeypatch.setenv("OMNI_STUDIO_APPROVAL_KEY", str(tmp_path / "approval-key" / "approval.key"))
