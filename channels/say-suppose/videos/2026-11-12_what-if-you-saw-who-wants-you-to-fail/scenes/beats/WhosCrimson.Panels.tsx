// Who's Red, line 38 (outside review of v6, 3:54): the comparison restated before any explanation. Three panels slide
// up one per clause, each a big portrait with its card: "So a kid gives you everything," the kid in his cap, +77; "your
// enemy gives you nothing," the rival, eyes on his shoe, -6; "and your best friend gives you minus eighty-four." your
// best friend grinning with his half of the chocolate bar, -84 landing on "eighty-four". "Why?" cuts to your face at
// your desk (WhosCrimson.Track.tsx, DesksWhy).
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Chocolate, headAt, Meter } from "../parts";
import { blinking, MINJUN, PASTELS, ramp, TAEHO } from "../shared";
import { FlatShot, Shoe } from "./WhosCrimson.Common";
import { Cap } from "./WhosCrimson.More";
import type { CrimsonTimes } from "./WhosCrimson.Times";

const PANEL = { w: 580, top: 160, h: 760, xs: [340, 960, 1580] } as const;
const HEAD_Y = 610;

/** One panel: a coloured ground, the person as a big bust, their card over their head. */
const Panel: React.FC<{
  frame: number; i: number; at: number; tagAt: number; until: number; value: number; ground: string; scale: number;
  who: (x: number, y: number, h: { x: number; y: number; r: number }) => React.ReactNode;
}> = ({ frame, i, at, tagAt, until, value, ground, scale, who }) => {
  if (frame < at) return null;
  const x = PANEL.xs[i];
  const rise = 1 - ramp(frame, at, at + 8);
  const pose: Pose = STAND;
  const feet = HEAD_Y - headAt(0, 0, scale, pose).y;
  const h = headAt(x, feet, scale, pose);
  return (
    <g transform={`translate(0 ${rise * 900})`}>
      <clipPath id={`panel-${i}`}><rect x={x - PANEL.w / 2} y={PANEL.top} width={PANEL.w} height={PANEL.h} rx={18} /></clipPath>
      <rect x={x - PANEL.w / 2} y={PANEL.top} width={PANEL.w} height={PANEL.h} rx={18} fill={ground} />
      <g clipPath={`url(#panel-${i})`}>
        {who(x, feet, h)}
        <Meter frame={frame} at={tagAt} x={h.x} headY={h.y} r={h.r} value={value} until={until} tilt={i % 2 ? 2 : -2} />
      </g>
      <rect x={x - PANEL.w / 2} y={PANEL.top} width={PANEL.w} height={PANEL.h} rx={18} fill="none" stroke={INK} strokeWidth={8} />
    </g>
  );
};

export const PanelsWhy: React.FC<{ frame: number; k: CrimsonTimes; mood: MoodName }> = ({ frame, k, mood }) => {
  const cam = drift({ x: 960, y: 540, zoom: 1 + 0.04 * ramp(frame, k.desks, k.deskFaces) }, frame, "panels", 2);
  const S = 2.1;
  return (
    <FlatShot cam={cam} mood={mood} back={<rect x={-1400} y={-800} width={4800} height={2600} fill="#2a2d36" />} actors={
      <>
        <Panel frame={frame} i={0} at={k.desks} tagAt={k.desks + 6} until={k.deskFaces} value={77} ground="#cfe3ef" scale={S * 0.8} who={(x, y, h) => (
          <>
            <Figure head={PASTELS[4]} coat="#3d6fb0" x={x} y={y} scale={S * 0.8} pose={STAND} brows="raised" lids={0} mouth="open" eyes={1.25}
              look={{ x: 0.3, y: -0.4 }} blink={blinking(frame, 4)} time={frame} />
            <Cap h={h} facing={1} />
          </>
        )} />
        <Panel frame={frame} i={1} at={k.rivalPanel} tagAt={k.rivalPanel + 6} until={k.deskFaces} value={-6} ground="#dfe8cf" scale={S} who={(x, y) => (
          <Figure {...TAEHO} x={x} y={y} scale={S} facing={-1} pose={{ ...STAND, armF: [70, 60] }} brows="flat" lids={0.5} mouth="flat" eyes={1}
            look={{ x: 0.3, y: 0.9 }} blink={blinking(frame, 3)} time={frame} held={<Shoe x={6} y={4} scale={0.9} tilt={-20} />} />
        )} />
        <Panel frame={frame} i={2} at={k.friendPanel} tagAt={k.friendTag} until={k.deskFaces} value={-84} ground="#e8d9c3" scale={S} who={(x, y) => (
          <Figure {...MINJUN} x={x} y={y} scale={S} facing={-1} pose={{ ...STAND, armF: [100, 60] }} brows="raised" lids={0} mouth="smile" eyes={1.1}
            look={{ x: 0.5, y: 0 }} blink={blinking(frame, 2)} time={frame} held={<Chocolate x={0} y={-4} scale={0.55} half="right" tilt={-30} />} />
        )} />
      </>
    } />
  );
};
