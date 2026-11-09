"""Idea room mechanics: parse model outputs, shuffle lists, aggregate scores. No judgment lives here."""
import json, random, re, statistics, sys
from pathlib import Path

R = Path(__file__).parent
RESEARCHERS = {
    "claude-fable-5-1": "Claude Fable 5.1",
    "gpt-5.6-sol-high": "GPT-5.6 Sol",
    "gemini-4-argon-high": "Gemini 4 Argon",
    "grok-4.7-high": "Grok 4.7",
    "kimi-k3-high": "Kimi K3",
}


def json_block(text):
    m = re.findall(r"```json\s*(.*?)```", text, re.S)
    raw = m[-1] if m else text[text.find("["): text.rfind("]") + 1]
    return json.loads(raw)


def collect():
    out = []
    for key, name in RESEARCHERS.items():
        items = json_block((R / "r0" / f"{key}.md").read_text())
        for i, it in enumerate(items, 1):
            it = {"id": f"{key.split('-')[0][:3].upper()}{i:02d}", "proposer": name, "rank_by_proposer": i, **it}
            out.append(it)
    (R / "r0" / "candidates.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
    print(len(out), "candidates")


def shuffled(model, path="r1/merged.json"):
    items = json.loads((R / path).read_text())
    rnd = random.Random(f"{model}-say-suppose-2026-11-09")
    rnd.shuffle(items)
    return items


def aggregate(round_dir):
    merged = {t["id"]: t for t in json.loads((R / "r1" / "merged.json").read_text())}
    scores = {tid: {} for tid in merged}
    reasons = {tid: [] for tid in merged}
    for key in list(RESEARCHERS) + ["moderator"]:
        f = R / round_dir / f"{key}.md"
        if not f.exists():
            continue
        for s in json_block(f.read_text()):
            if s.get("id") in scores:
                scores[s["id"]][key] = float(s["overall"])
                reasons[s["id"]].append((float(s["overall"]), s.get("reason", "")))
    rows = []
    for tid, by in scores.items():
        vals = [v for k, v in by.items() if k != "moderator"]
        if not vals:
            continue
        rs = sorted(reasons[tid])
        rows.append({
            "id": tid, "title": merged[tid]["title"], "proposers": merged[tid].get("proposers", []),
            "median": statistics.median(vals), "mean": round(statistics.mean(vals), 2),
            "min": min(vals), "max": max(vals), "scores": by,
            "con": rs[0][1] if rs else "", "pro": rs[-1][1] if rs else "",
        })
    rows.sort(key=lambda r: (-r["median"], -r["mean"]))
    (R / round_dir / "aggregate.json").write_text(json.dumps(rows, indent=1, ensure_ascii=False))
    return rows


if __name__ == "__main__":
    {"collect": collect, "aggregate": lambda: print(json.dumps(aggregate(sys.argv[2])[:15], indent=1, ensure_ascii=False))}[sys.argv[1]]()
