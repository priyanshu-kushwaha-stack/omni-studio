"""cast_claims: every claim the cast pass found has a row in the claims ledger (match by claim text)."""

import yaml

from studio import cast_claims

LEDGER = """| id | claim as spoken | source | quote | status | note |
|---|---|---|---|---|---|
| c01 | The Tokyo rush hour moves three million people a day. | https://x.org/a | q | sourced | |
| c02 | Trains in Japan run on average under a minute late | https://x.org/b | q | sourced | |
| c03 | Old fact, cut from the film | https://x.org/c | q | dropped | |
"""


def video(tmp_path, claims, ledger=LEDGER):
    if claims is not None:
        (tmp_path / "cast-pass.yaml").write_text(yaml.safe_dump({"lines": [], "claims": claims}))
    if ledger is not None:
        (tmp_path / "claims.md").write_text(ledger)
    return tmp_path


def test_complete_ledger_passes_with_loose_matching(tmp_path):
    folder = video(
        tmp_path,
        [
            {"n": 3, "claim": "Tokyo rush hour moves three million people a day"},
            {"n": 9, "claim": "trains in japan run on average under a minute late."},
        ],
    )
    assert cast_claims.check(folder) == {"check": "cast_claims", "ok": True, "problems": []}


def test_missing_ledger_row_fails_naming_the_sentence(tmp_path):
    folder = video(tmp_path, [{"n": 4, "claim": "The sun is 150 million km away"}])
    out = cast_claims.check(folder)
    assert not out["ok"] and "sentence 4" in out["problems"][0] and "150 million" in out["problems"][0]


def test_dropped_row_does_not_cover_a_claim(tmp_path):
    out = cast_claims.check(video(tmp_path, [{"n": 2, "claim": "Old fact, cut from the film"}]))
    assert not out["ok"]


def test_no_cast_pass_fails_clearly(tmp_path):
    out = cast_claims.check(video(tmp_path, None))
    assert not out["ok"] and "cast-pass.yaml is missing" in out["problems"][0]


def test_no_ledger_fails_clearly(tmp_path):
    out = cast_claims.check(video(tmp_path, [{"n": 1, "claim": "x"}], ledger=None))
    assert not out["ok"] and "claims.md is missing" in out["problems"][0]


def test_empty_claims_list_fails(tmp_path):
    out = cast_claims.check(video(tmp_path, []))
    assert not out["ok"] and "no claims" in out["problems"][0]


def test_covers_needs_whole_words_and_most_of_the_claim():
    from studio.cast_claims import covers

    assert not covers("speed", "the speed of light is fast")
    assert not covers("light is fast", "ten")
    assert covers(
        "light travels three hundred thousand km a second", "light travels three hundred thousand km a second in vacuum"
    )
    assert not covers("light travels three hundred thousand km a second", "sound travels three hundred metres a second")
    assert covers("ten", "ten")
