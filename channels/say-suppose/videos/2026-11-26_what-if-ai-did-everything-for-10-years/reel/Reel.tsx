// The G2 story reel's picture: one 3D still per shot with its camera move, cut on the narration (data.ts slots), a
// 6-frame cross-dissolve between slots, split pairs side by side, research cards, drawn pictures and stamped tags over
// the last still dimmed, and cast tags at a character's first close-up. Render with
// --props=<video>/assets/narration/props.json --public-dir=<video>/assets.
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FONT } from "@whatif/kit/fonts";
import { INK, PAPER } from "@whatif/kit/theme";
import { buildSlots, DISSOLVE, easeSine, mix, ramp, slotAt, type ReelProps, type Slot } from "./data";
import { BODY, Card } from "./parts/Card";
import { Drawn } from "./parts/Drawn";
import { Split, Still } from "./parts/Still";
import { tagLife, TagStamp } from "./parts/Tag";

const DIM = { card: 0.6, drawn: 0.5, tag: 0.4 } as const;
const CAST_TAG_FRAMES = 75;

/** A picture slot at its own frame f; its move runs over the slot plus the dissolve out, so it never stops mid-fade. */
const Picture: React.FC<{ slot: Slot; f: number }> = ({ slot, f }) => {
  const p = Math.min(1, f / Math.max(1, slot.end - slot.start + DISSOLVE));
  return slot.kind === "split" ? <Split shots={slot.shots} p={p} /> : <Still shot={slot.shots[0]} p={p} />;
};

const SlotView: React.FC<{ slots: Slot[]; i: number; frame: number }> = ({ slots, i, frame }) => {
  const slot = slots[i];
  const f = frame - slot.start;
  if (slot.kind === "3d" || slot.kind === "split") return <Picture slot={slot} f={f} />;
  const bg = slots[slot.bg];
  const shot = slot.shots[0]!;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {bg && <Picture slot={bg} f={bg.end - bg.start + DISSOLVE} />}
      <AbsoluteFill style={{ background: `rgba(10,11,14,${DIM[slot.kind]})` }} />
      {slot.kind === "card" && <Card studies={shot.card ?? [{ title: shot.text ?? shot.id, authors: "", year: "", evidence: "" }]} f={f} />}
      {slot.kind === "drawn" && <Drawn picture={shot.picture ?? "?"} f={f} dur={slot.end - slot.start} />}
    </AbsoluteFill>
  );
};

/** A cast tag at a character's first close-up: role in caps, one thing they do; lower left, off the faces. */
const CastTag: React.FC<{ text: string; f: number }> = ({ text, f }) => {
  const k = Math.min(easeSine(ramp(f, 4, 14)), 1 - ramp(f, CAST_TAG_FRAMES - 10, CAST_TAG_FRAMES));
  const cut = text.indexOf(":");
  const role = cut > 0 ? text.slice(0, cut).trim() : text;
  const what = cut > 0 ? text.slice(cut + 1).trim() : "";
  return (
    <div style={{
      position: "absolute", left: 64, bottom: 72, opacity: k, transform: `translateY(${mix(22, 0, k)}px) rotate(-1deg)`,
      background: PAPER, color: INK, border: `5px solid ${INK}`, borderRadius: 16, padding: "10px 26px 10px",
      boxShadow: "0 10px 18px rgba(0,0,0,.4)", maxWidth: 780,
    }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 42, letterSpacing: 1.5 }}>{role}</div>
      {what && <div style={{ fontFamily: BODY, fontWeight: 500, fontSize: 30, marginTop: 2 }}>{what}</div>}
    </div>
  );
};

export const ReelPicture: React.FC<ReelProps> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const slots = useMemo(() => buildSlots(timeline.clips, timeline.totalFrames), [timeline]);
  if (!slots.length) return <AbsoluteFill style={{ background: "#000" }} />;
  const i = slotAt(slots, frame);
  const fade = i > 0 ? easeSine(ramp(frame - slots[i].start, 0, DISSOLVE)) : 1;
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {fade < 1 && <SlotView slots={slots} i={i - 1} frame={frame} />}
      <AbsoluteFill style={{ opacity: fade }}>
        <SlotView slots={slots} i={i} frame={frame} />
      </AbsoluteFill>
      {slots.map((s, k) => {
        const tag = s.kind === "tag" ? s.shots[0] : null;
        if (!tag?.text || frame < s.start || frame >= s.start + tagLife(s.end - s.start)) return null;
        return <TagStamp key={`t${k}`} text={tag.text} f={frame - s.start} slotDur={s.end - s.start} />;
      })}
      {slots.flatMap((s, k) => s.shots.map((sh, h) => {
        if (!sh?.cast_tag || frame < s.start || frame >= s.start + CAST_TAG_FRAMES) return null;
        return <CastTag key={`c${k}${h}`} text={sh.cast_tag} f={frame - s.start} />;
      }))}
    </AbsoluteFill>
  );
};
