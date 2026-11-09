"""Build the batch G1 review page: each video's title and thumbnail pairs at feed size, the room's verdict, one pick per video.

    python review_page.py <notes.json> <out.html> review_page.html

notes.json, per video key (a fragment of the folder name): status ("ready" or "held"), round, verdict, room (list), cold.
The page embeds the renders as data URIs, so the built page stays out of git; publish it as an Artifact."""
import base64, io, json, re, sys, html
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[4]
VID = ROOT / "channels/say-suppose/videos"
ORDER = ["knew-the-last", "real-odds", "got-paid", "sell-one", "never-forget"]
notes = json.loads(Path(sys.argv[1]).read_text())   # per key: {"room": [...], "cold": "...", "verdict": "..."}
out = Path(sys.argv[2])

def uri(png, w):
    im = Image.open(png).convert("RGB")
    im = im.resize((w, round(w * 9 / 16)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, "JPEG", quality=86)
    return "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()

esc = html.escape
videos = []
for n, key in enumerate(ORDER, 1):
    v = next(p for p in VID.glob("2026-11-09_*") if key in p.name)
    md = (v / "packaging.md").read_text()
    titles = re.findall(r"^\| ([ABC]) \| (What If[^|]+?) \| (\d+) \|", md, re.M)
    premise = md.split("## Premise", 1)[1].split("##", 1)[0].strip().split("\n\n")[0].replace("\n", " ")
    five = re.findall(r"^\| (Situation|Desire|Conflict|Change|Result) \| (.+?) \|$", md, re.M)
    variable = re.search(r"One variable \(K15\): (.+?)\.?\*\*", md).group(1)
    rec = re.search(r"Recommendation: \*\*(.+?)\*\*", md).group(1)
    checks = json.loads((v / "thumb-checks.json").read_text())["candidates"]
    thumbs = []
    for c in checks:
        png = v / "renders/packaging" / f"thumb-{c['id']}.png"
        thumbs.append({"id": c["id"], "value": c["value"], "home": uri(png, 360), "side": uri(png, 168),
                       "k": {k: c[k] for k in ("K3", "K4", "K5", "K9")}})
    videos.append({"n": n, "key": key, "folder": v.name, "titles": titles, "premise": premise, "five": five,
                   "variable": variable, "rec": rec, "thumbs": thumbs, **notes.get(key, {})})

def card(t, title, theme):
    return (f'<figure class="yt yt-{theme}"><img src="{t["home"]}" width="360" height="203" alt="Thumbnail {t["id"]}: {esc(t["value"])}">'
            f'<figcaption><span class="av"></span><span><b>{esc(title)}</b><small>Say Suppose · 0 views · just now</small></span></figcaption></figure>')

def side(t, title, theme):
    return (f'<div class="side side-{theme}"><img src="{t["side"]}" width="168" height="94" alt="">'
            f'<span><b>{esc(title)}</b><small>Say Suppose</small></span></div>')

sections = []
for v in videos:
    a_title = v["titles"][0][1].strip()
    rows = []
    for t in v["thumbs"]:
        k = t["k"]
        rows.append(f'''<div class="cand" id="v{v["n"]}{t["id"]}">
  <div class="cand-head"><span class="cid">{t["id"]}</span><span class="cval">{esc(t["value"])}</span>
    <span class="meas">head {k["K3"]["head_height_pct"]}% · grey sep. {k["K4"]["ratio"]}:1 · colour {k["K9"]["colourfulness"]}</span></div>
  <div class="feeds">{card(t, a_title, "light")}{card(t, a_title, "dark")}</div>
  <div class="feeds small">{side(t, a_title, "light")}{side(t, a_title, "dark")}</div>
</div>''')
    tl = "".join(f'<li><span class="tl">{lab}</span>{esc(t.strip())} <span class="score">{sc}</span></li>' for lab, t, sc in v["titles"])
    five = "".join(f"<dt>{a}</dt><dd>{esc(b)}</dd>" for a, b in v["five"])
    room = "".join(f"<li>{esc(x)}</li>" for x in v.get("room", []))
    pick_t = "".join(f'<label><input type="radio" name="t{v["n"]}" id="t{v["n"]}{lab}" value="{lab}"{" checked" if lab=="A" else ""}> {lab}</label>' for lab, _, _ in v["titles"])
    pick_k = "".join(f'<label><input type="radio" name="k{v["n"]}" id="k{v["n"]}{t["id"]}" value="{t["id"]}"{" checked" if t["id"]=="a" else ""}> {t["id"]} <span class="pv">{esc(t["value"])}</span></label>' for t in v["thumbs"])
    sections.append(f'''<section class="video" id="video-{v["n"]}" data-n="{v["n"]}">
  <header class="vh"><span class="vn">{v["n"]}</span><div><span class="badge badge-{v.get("status","ready")}">{"Ready for G1" if v.get("status")=="ready" else "Held: room round 3 after the cap resets"}</span><h2>{esc(a_title)}</h2><p class="prem">{esc(v["premise"])}</p></div></header>
  <div class="grid">
    <div class="cands"><p class="var">Thumbnails differ only in <b>{esc(v["variable"])}</b>. Each is shown with title A at home-feed size (360 px) and at sidebar size (168 px), on YouTube's light and dark pages.</p>{"".join(rows)}</div>
    <aside class="info">
      <div class="block"><h3>Titles</h3><ol class="titles">{tl}</ol><p class="hint">yt-package score out of 100; all lose points for having no digit.</p></div>
      <div class="block"><h3>The story in five lines</h3><dl class="five">{five}</dl></div>
      <div class="block"><h3>Room: {esc(str(v.get("round", "")))}</h3><p class="verdict">{esc(v.get("verdict", ""))}</p><ul class="room">{room}</ul></div>
      <div class="block"><h3>Cold read at 168 px</h3><p class="cold">{esc(v.get("cold", ""))}</p></div>
      <div class="block pick"><h3>{"Your pick" if v.get("status")=="ready" else "Your pick (notes now; G1 after round 3)"}</h3><p class="rec">Recommended: {esc(v["rec"])}</p>
        <div class="row"><span class="lab">Title</span>{pick_t}</div>
        <div class="row"><span class="lab">Thumbnail</span>{pick_k}</div>
        <label class="notes" for="n{v["n"]}">Notes</label><textarea id="n{v["n"]}" rows="2" placeholder="Optional: what to change"></textarea>
      </div>
    </aside>
  </div>
</section>''')

page = (Path(sys.argv[3]).read_text()
        .replace("%%SECTIONS%%", "\n".join(sections))
        .replace("%%NAV%%", "".join(f'<a href="#video-{v["n"]}"><span>{v["n"]}</span>{esc(v["titles"][0][1].strip().replace("What If ", "").rstrip("?"))}</a>' for v in videos))
        .replace("%%FOLDERS%%", json.dumps({str(v["n"]): v["folder"] for v in videos}))
        .replace("%%HELD%%", json.dumps([str(v["n"]) for v in videos if v.get("status") == "held"])))
out.write_text(page)
print(out, round(len(page) / 1024), "KB")
