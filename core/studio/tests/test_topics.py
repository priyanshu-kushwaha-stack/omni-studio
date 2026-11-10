"""studio.topics: the topic skill's brief check, the weighted score, and the ranked list and page."""

from __future__ import annotations

import copy
import json

import pytest

from studio import topics as T

BRIEF = {
    "id": "t01",
    "title": "You Found an Infinite Money Glitch",
    "premise": "Every morning your bank balance resets to what it was last night, plus whatever you spent.",
    "thumbnail": {"image": "you, wide-eyed, a phone showing a balance that keeps growing", "tag": "IT RESET"},
    "rule": "Money you spend comes back by morning; money you give away does not.",
    "hook": "Your chai costs twenty. By morning, the twenty is back. And so is everything else you bought.",
    "beats": [f"beat {i}" for i in range(1, 10)],
    "feeling_map": ["wonder", "greed", "fear", "guilt", "awe"],
    "restarts": ["the bank notices", "your cousin asks", "prices start rising"],
    "content_mine": [{"fact": f"fact {i}", "source": f"https://example.org/{i}", "beat": "beat 2"} for i in range(12)],
    "twist": "The glitch is the bank's, and it has been draining someone else.",
    "ending": "You'll never see a bank balance as yours again.",
    "closest_video": {
        "title": "What if you had infinite money",
        "url": "https://youtube.com/x",
        "difference": "A rule with a catch",
    },
    "runtime": {"strong_minutes": 15, "cut_to": "drop the crypto detour"},
    "views_case": "Infinite-money what-ifs pull millions; none uses a reset rule.",
    "under_question": "Is money worth anything if it never runs out?",
    "proposers": ["fable"],
}
SCORES = {
    "excitement": {"score": 9, "reason": "a glitch everyone has dreamt of"},
    "content": {"score": 8, "reason": "inflation, banking, behaviour"},
    "views": {"score": 8, "reason": "money what-ifs pull views"},
    "engine": {"score": 7, "reason": "the reset keeps making trouble"},
    "buildable": {"score": 9, "reason": "a phone, a balance, a city"},
}


def _scored(**over):
    t = copy.deepcopy(BRIEF)
    t["scores"] = copy.deepcopy(SCORES)
    t["best_moment"] = "the balance resetting at midnight"
    t.update(over)
    return t


def test_a_full_brief_has_no_problems():
    assert T.brief_problems(BRIEF) == []


def test_missing_fields_and_thin_content_are_named():
    bad = copy.deepcopy(BRIEF)
    del bad["hook"]
    bad["content_mine"] = bad["content_mine"][:5]
    bad["title"] = "x" * 60
    problems = T.brief_problems(bad)
    assert any("hook" in p for p in problems)
    assert any("content_mine" in p and "12" in p for p in problems)
    assert any("title" in p and "50" in p for p in problems)


def test_a_fact_without_a_source_or_a_beat_is_a_problem():
    bad = copy.deepcopy(BRIEF)
    bad["content_mine"][0] = {"fact": "orphan", "source": "", "beat": ""}
    assert any("orphan" in p for p in T.brief_problems(bad))


def test_the_total_is_weighted_out_of_100():
    assert T.total(SCORES) == 9 * 3 + 8 * 3 + 8 * 2 + 7 + 9  # 83
    perfect = {k: {"score": 10, "reason": ""} for k in T.WEIGHTS}
    assert T.total(perfect) == 100


def test_copying_a_trending_twist_costs_ten():
    assert T.total(SCORES, copies_trending=True) == T.total(SCORES) - 10


def test_a_score_outside_one_to_ten_is_refused():
    bad = copy.deepcopy(SCORES)
    bad["views"]["score"] = 11
    with pytest.raises(ValueError, match="views"):
        T.total(bad)


def test_rank_orders_by_total_and_breaks_ties_on_content():
    a = _scored(id="a")
    more_content = {
        **copy.deepcopy(SCORES),
        "excitement": {"score": 8, "reason": ""},
        "content": {"score": 9, "reason": ""},
    }
    b = _scored(id="b", scores=more_content)
    c = _scored(id="c", copies_trending=True)
    ranked = T.rank([c, a, b])
    assert [t["id"] for t in ranked] == ["b", "a", "c"]  # b and a tie on 83; b has more content
    assert ranked[0]["total"] == 83 and ranked[2]["total"] == 73


def test_the_markdown_lists_every_topic_with_its_score(tmp_path):
    md = T.markdown(T.rank([_scored(id="a"), _scored(id="b", title="You Can Redo Ten Seconds")]), date="2026-11-10")
    assert "You Found an Infinite Money Glitch" in md and "You Can Redo Ten Seconds" in md
    assert "83" in md and "excitement 9" in md


def test_the_page_carries_the_data_and_the_pick_store(tmp_path):
    src = tmp_path / "topics.json"
    src.write_text(json.dumps({"date": "2026-11-10", "topics": [_scored(id="a")]}))
    out = tmp_path / "page.html"
    assert T.main(["page", str(src), str(out)]) == 0
    html = out.read_text()
    assert "<title>" in html and "picks/owner" in html and "You Found an Infinite Money Glitch" in html
    assert "</script><" not in json.dumps(json.loads(src.read_text()))  # sanity: data has no script breakout


def test_check_reports_brief_problems_and_exits_one(tmp_path, capsys):
    bad = copy.deepcopy(BRIEF)
    del bad["rule"]
    src = tmp_path / "pitches.json"
    src.write_text(json.dumps({"topics": [bad]}))
    assert T.main(["check", str(src)]) == 1
    assert "rule" in capsys.readouterr().out


def test_pitch_runs_the_model_sandboxed_and_returns_its_topics(monkeypatch):
    seen = {}

    def fake(cmd, **kw):
        seen["cmd"] = cmd
        out = json.dumps({"result": "Here you go:\n```json\n" + json.dumps({"topics": [BRIEF]}) + "\n```"})
        return type("P", (), {"returncode": 0, "stdout": out})()

    got = T.pitch("gemini-4-argon-high", "pitch eight topics", runner=fake)
    assert got["topics"][0]["title"] == BRIEF["title"]
    assert "cursor-agent" in seen["cmd"] and "--mode" in seen["cmd"] and "ask" in seen["cmd"]
    assert "gemini-4-argon-high" in seen["cmd"]


def test_pitch_with_no_json_in_the_answer_raises(monkeypatch):
    def fake(cmd, **kw):
        return type("P", (), {"returncode": 0, "stdout": json.dumps({"result": "sorry, no topics"})})()

    with pytest.raises(ValueError, match="no JSON"):
        T.pitch("gpt-5.6-sol-high", "pitch", runner=fake)
