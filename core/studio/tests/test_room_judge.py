"""The judge: new draft against the best, both orders, labels hidden; a win must hold both ways."""

from __future__ import annotations

import json
import subprocess

import pytest

from studio.room import judge as J
from studio.room.call import CallContext
from studio.room.ledger import Ledger

REG = {"gpt-5.6-sol-high": {"family": "openai", "cli": "cursor"}}


@pytest.mark.parametrize("a,b,winner", [("A", "B", "new"), ("A", "A", "best"), ("B", "B", "best"),
                                         ("tie", "B", "best"), ("B", "A", "best")])
def test_pairwise(a, b, winner):
    assert J.pairwise(a, b) == winner


def test_parse_judge():
    assert J.parse_judge('{"winner": "B", "why": "x"}') == "B"
    with pytest.raises(J.BadVerdict):
        J.parse_judge('{"winner": "C"}')


def test_run_judge_asks_twice_with_the_order_swapped(tmp_path):
    seen = []

    def runner(cmd, **kw):
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        prompt = cmd[-1]
        seen.append(prompt.index("NEW DRAFT") < prompt.index("OLD DRAFT"))
        pick = "A" if len(seen) == 1 else "B"
        return subprocess.CompletedProcess(cmd, 0, stdout=json.dumps({"result": json.dumps({"winner": pick})}), stderr="")

    db = Ledger(tmp_path / "l.sqlite")
    ctx = CallContext("pou", "v", "g2", 2, 50, 50)
    res = J.run_judge("NEW DRAFT", "OLD DRAFT", model="gpt-5.6-sol-high", brief="Pick.", ledger=db, ctx=ctx,
                      out=tmp_path / "judge.json", runner=runner, registry=REG)
    assert seen == [True, False]
    assert res["winner"] == "new" and res["family"] == "openai" and len(res["call_ids"]) == 2
    assert json.loads((tmp_path / "judge.json").read_text())["winner"] == "new"


def test_a_failed_judge_call_is_a_tie(tmp_path):
    def runner(cmd, **kw):
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        return subprocess.CompletedProcess(cmd, 1, stdout="", stderr="boom")

    res = J.run_judge("N", "O", model="gpt-5.6-sol-high", brief="Pick.", ledger=Ledger(tmp_path / "l.sqlite"),
                      ctx=CallContext("pou", "v", "g2", 2, 50, 50), out=tmp_path / "j.json", runner=runner, registry=REG)
    assert res["picks"] == ["tie", "tie"] and res["winner"] == "best"


def test_an_exception_from_the_judge_call_fails_closed(tmp_path):
    def runner(cmd, **kw):
        if cmd[-1] == "--version":
            return subprocess.CompletedProcess(cmd, 0, stdout="1\n", stderr="")
        raise FileNotFoundError("sandbox-exec")

    db = Ledger(tmp_path / "l.sqlite")
    res = J.run_judge("N", "O", model="gpt-5.6-sol-high", brief="Pick.", ledger=db,
                      ctx=CallContext("pou", "v", "g2", 2, 50, 50), out=tmp_path / "j.json", runner=runner, registry=REG)
    assert res["picks"] == ["tie", "tie"] and res["winner"] == "best"
    assert [db.get(cid).status for cid in res["call_ids"]] == ["failed", "failed"]
