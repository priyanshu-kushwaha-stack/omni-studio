// Seven Years a Week's lottery loophole (v7, night three), in the inside town: the newsagent's stand where every paper
// is the same yellowed sheet (you lift one, then the next, then the next: the same); a close on that one sheet (ink
// bars and a small drawing, no words, a coffee ring); and the town square, a crowd in waistcoats shouting over it while
// the counter-sun blurs above, one trader on a crate holding it up like scripture.
import { STAND, type Pose } from "@whatif/kit/rig/pose";
import type { Camera } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { Sheet } from "../parts";
import { noise, PASTELS } from "../shared";
import { aimArm, handAt, Person, type Body } from "./TellMeTomorrow.Kit";
import { TownStage } from "./Piano.Town";

const STREET = 910;
const YELLOWED = "#e8d9a0";

/** The one newspaper, drawn small at (x, y) (its top-left), `w` wide: a masthead bar, columns of ink bars, a picture box. */
export const OldPaper: React.FC<{ x: number; y: number; w: number; tilt?: number }> = ({ x, y, w, tilt = 0 }) => {
  const h = w * 1.3;
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <rect width={w} height={h} rx={w * 0.02} fill={YELLOWED} stroke={INK} strokeWidth={Math.max(2, w * 0.02)} />
      <rect x={w * 0.08} y={h * 0.05} width={w * 0.84} height={h * 0.08} fill={INK} />
      <rect x={w * 0.08} y={h * 0.18} width={w * 0.4} height={h * 0.25} fill="#c9b47a" stroke={INK} strokeWidth={Math.max(1.5, w * 0.012)} />
      <path d={`M${w * 0.12} ${h * 0.4} l${w * 0.1} ${-h * 0.1} l${w * 0.08} ${h * 0.06} l${w * 0.1} ${-h * 0.12}`} fill="none" stroke={INK} strokeWidth={Math.max(1.5, w * 0.012)} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={i < 4 ? w * 0.54 : (i % 2 ? w * 0.52 : w * 0.08)} y={i < 4 ? h * (0.19 + i * 0.06) : h * (0.48 + Math.floor((i - 4) / 2) * 0.11)}
          width={i < 4 ? w * 0.38 : w * 0.4} height={h * 0.025} rx={1} fill={INK} opacity={0.6} />
      ))}
    </g>
  );
};

/** The newsagent's stand: a striped awning, a rack of papers, all the same yellowed sheet. You lift one, look, put it
 *  back, lift the next (`flip` frames per paper); after three your deadpan look at the camera. */
export const NewsagentCut: React.FC<{ frame: number; cam: Camera; from: number }> = ({ frame, cam, from }) => {
  const n = Math.floor((frame - from) / 26);
  const lifted = n < 3;
  const slot = Math.min(2, n);
  const p = ((frame - from) % 26) / 26;
  const you: Body = { x: 1260, y: STREET, scale: 1.15, facing: -1, pose: STAND };
  const paper = { x: 900 + slot * 90, y: lifted ? 620 - Math.sin(p * Math.PI) * 120 : 600 };
  const pose: Pose = { ...STAND, lean: 8, armF: lifted ? aimArm(you, { x: paper.x + 60, y: paper.y + 40 }) : [20, 30], armB: [10, 20] };
  return (
    <TownStage frame={frame} cam={cam} mood="day" actors={
      <>
        {/* the kiosk */}
        <rect x={720} y={430} width={420} height={STREET - 430} fill="#5a6a86" stroke={INK} strokeWidth={6} />
        {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${700 + i * 66} 430 l66 0 l-6 60 l-54 0 Z`} fill={i % 2 ? PAPER : "#d8344f"} stroke={INK} strokeWidth={4} />)}
        <rect x={760} y={560} width={340} height={STREET - 560} fill="#3b3e47" stroke={INK} strokeWidth={5} />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === 0 && c === slot && lifted ? null :
          <OldPaper key={`${r}-${c}`} x={790 + c * 100} y={590 + r * 100} w={80} tilt={(noise(r * 3 + c) - 0.5) * 6} />)))}
        <Person who="you" b={{ ...you, pose }} face={lifted
          ? { brows: n === 0 ? "raised" : "flat", lids: n * 0.25, mouth: "flat", look: { x: 0.9, y: 0.5 } }
          : { brows: "flat", lids: 0.55, mouth: "flat", look: { x: -1, y: 0 } }} frame={frame} />
        {lifted && <OldPaper x={paper.x} y={paper.y} w={120} tilt={-8} />}
      </>
    } />
  );
};

/** The one sheet, close, on paper in screen pixels: yellowed, a coffee ring, the same layout every paper has. */
export const SheetClose: React.FC<{ frame: number; at: number; until: number }> = ({ frame, at, until }) => {
  const s = 1 + 0.08 * Math.min(1, Math.max(0, (frame - at) / Math.max(1, until - at)));
  return (
    <g transform={`translate(960 540) scale(${s}) translate(-960 -540)`}>
      <Sheet frame={frame} at={at} until={until} x={960} y={540} w={760} h={900} tilt={2}>
        <OldPaper x={40} y={40} w={680} />
        <circle cx={560} cy={700} r={80} fill="none" stroke="#a8784a" strokeWidth={10} opacity={0.5} />
      </Sheet>
    </g>
  );
};

/** The town square: a crowd in waistcoats shouting, arms waving, all at the one sheet a trader holds up on a crate. */
export const SquareCut: React.FC<{ frame: number; cam: Camera }> = ({ frame, cam }) => {
  const trader: Body = { x: 960, y: STREET - 90, scale: 1.2, facing: 1, pose: { ...STAND, lean: -6, tilt: -8, armF: [175, 10], armB: [165, 20] } };
  const hand = handAt(trader, "front");
  const crowd = Array.from({ length: 10 }, (_, i) => {
    const left = i < 5;
    const x = left ? 300 + i * 110 : 1180 + (i - 5) * 110;
    const wave = Math.sin(frame / 4 + i * 1.7);
    return { x, facing: (left ? 1 : -1) as 1 | -1, i, wave, back: i % 2 === 1 };
  }).sort((a, b) => Number(b.back) - Number(a.back));
  return (
    <TownStage frame={frame} cam={cam} mood="day" actors={
      <>
        {crowd.map((c) => (
          <Person key={c.i} who={{ head: PASTELS[c.i % PASTELS.length], coat: ["#5a3b2e", "#3d4a5a", "#4a3a5a", "#6a5a3c"][c.i % 4] }}
            b={{ x: c.x, y: c.back ? STREET - 24 : STREET, scale: c.back ? 0.9 : 1.02, facing: c.facing,
              pose: { ...STAND, lean: -4, tilt: c.wave * 6, armF: [120 + c.wave * 30, 40], armB: [c.i % 3 === 0 ? 150 : 30, 30] } }}
            face={{ brows: c.i % 3 === 0 ? "angry" : "raised", lids: 0, mouth: (Math.floor(frame / 5) + c.i) % 3 ? "open" : "o", eyes: 1.1, look: { x: 0.9, y: -0.4 } }}
            frame={frame} seed={c.i + 30} />
        ))}
        <rect x={880} y={STREET - 90} width={160} height={90} fill="#a8774f" stroke={INK} strokeWidth={5} />
        <Person who={{ head: "#d9c26a", coat: "#2f3d2e" }} b={trader} face={{ brows: "raised", lids: 0.3, mouth: "open", look: { x: 0.2, y: -0.9 } }} frame={frame} seed={40} />
        <OldPaper x={hand.x - 60} y={hand.y - 160} w={130} tilt={Math.sin(frame / 10) * 3} />
        {[0, 1, 2].map((k) => <line key={k} x1={hand.x - 90 + k * 90} y1={hand.y - 190} x2={hand.x - 110 + k * 110} y2={hand.y - 230} stroke="#fff6dc" strokeWidth={6} strokeLinecap="round" />)}
      </>
    } />
  );
};

/** Four languages at a working level: you and a townsperson face to face, both talking, hands going, their language's
 *  flag popping between your heads. `i` picks the flag, the person and the stretch of street. */
export const ChatCut: React.FC<{ frame: number; cam: Camera; i: number; from: number }> = ({ frame, cam, i, from }) => {
  const x0 = 700 + i * 120;
  const talkYou = Math.floor((frame - from) / 12) % 2 === 0;
  const you: Body = { x: x0, y: STREET, scale: 1.15, facing: 1, pose: { ...STAND, lean: 4, armF: talkYou ? [70 + Math.sin(frame / 3) * 18, 60] : [20, 30], armB: [10, 20] } };
  const them: Body = { x: x0 + 300, y: STREET, scale: 1.12, facing: -1, pose: { ...STAND, lean: 4, armF: !talkYou ? [80 + Math.sin(frame / 3) * 18, 50] : [20, 30], armB: [10, 20] } };
  const pop = Math.min(1, Math.max(0, (frame - from - 4) / 6));
  return (
    <TownStage frame={frame} cam={cam} mood="day" actors={
      <>
        <Person who="you" b={you} face={{ brows: "raised", lids: 0, mouth: talkYou && frame % 6 < 3 ? "open" : "smile", look: { x: 0.9, y: 0 } }} frame={frame} />
        <Person who={{ head: PASTELS[(i * 3 + 1) % PASTELS.length], coat: ["#4a4f5c", "#6a5a4c", "#3f5a6a", "#5a4a6a"][i] }} b={them}
          face={{ brows: "raised", lids: 0, mouth: !talkYou && frame % 6 < 3 ? "open" : "smile", eyes: 1.1, look: { x: 0.9, y: 0 } }} frame={frame} seed={50 + i} />
        <g transform={`translate(${x0 + 150} 470) scale(${pop})`}>
          <Flag i={i} />
        </g>
      </>
    } />
  );
};

/** A made-up flag centred on (0, 0): the four from the FlagsSheet. */
const Flag: React.FC<{ i: number }> = ({ i }) => {
  const [a, b] = [["#1D9A8F", "#F2B632"], ["#D8344F", PAPER], ["#7fa0c4", INK], ["#5aa04a", "#c9a0d6"]][i % 4];
  return (
    <g>
      <rect x={-70} y={-44} width={140} height={88} rx={6} fill={a} stroke={INK} strokeWidth={5} />
      {i % 2 ? <circle r={26} fill={b} /> : <rect x={-70} y={-14} width={140} height={28} fill={b} />}
    </g>
  );
};
