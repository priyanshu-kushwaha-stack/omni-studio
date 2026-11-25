// The EverybodyTexts beat's later scenes in look C. The canteen (plate `canteen`: the long table at the left, the
// counter at the right): your team seated behind the table, heads down, texting each other across one bowl of chips,
// you at its end with your mug. Five o'clock in the lift lobby (plate `lift-lobby`: the double doors at the back are
// the lift; code doors slide shut over them on her zero). And the clip on your phone: the man in the white coat, a
// thermal camera on his shoulder, no counter on a screen.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { CRIMSON, INK, MUSTARD } from "@whatif/kit/theme";
import { HERO, mix, PASTELS, ramp } from "../shared";
import { Bubble, HeroMug, onScreen } from "./FrameKit";
import { PlateScene } from "./Plate";
import { Body, Handset, headOf, talk } from "./SayItAgain.Kit";
import { counterLight, Cut, FgShoulder, HeldPhone, onHead, pw, scaleAt, shotAt, type Shot as Cam } from "./SayItAgain.LookC";
import type { TextCues } from "../beats/EverybodyTexts";

// ------------------------------------------------------------------------------------------------ the canteen

/** The table's far edge in plate pixels at plate x `u` (it runs up to the right). */
const farEdge = (u: number) => 500 - 0.1 * u;
/** Your team behind the table: plate x, scale, facing. You sit at its right end. */
const TEAM: [number, number, 1 | -1][] = [[150, 1.75, 1], [255, 1.62, -1], [355, 1.5, 1], [450, 1.4, -1], [540, 1.3, 1]];
const YOU_END: [number, number, 1 | -1] = [650, 1.6, -1];

/** A seated figure placed by its head: head centre `rise` scale-units above the table's far edge at plate x `u`. */
function behindTable([u, s, facing]: [number, number, 1 | -1], rise = 66) {
  const edge = pw(u, farEdge(u));
  const off = headOf(0, 0, s, SEATED, facing);
  const headY = edge.y - rise * s;
  return { x: edge.x - off.x, y: headY - off.y, scale: s, facing, cut: edge.y + 6 };
}

function canteenShots(k: TextCues): Cam[] {
  const a = behindTable(TEAM[1]);
  const b = behindTable(TEAM[2]);
  const pair = headOf((a.x + b.x) / 2, (a.y + b.y) / 2, (a.scale + b.scale) / 2, SEATED);
  const you = behindTable(YOU_END);
  const yh = headOf(you.x, you.y, you.scale, SEATED, -1);
  return [
    { at: k.lunch - 2, cam: { x: 560, y: 560, zoom: 1.3 }, to: { x: 600, y: 560, zoom: 1.38 } },
    { at: k.lunch + 46, cam: onHead(pair, 0.11, 0, 40), to: onHead(pair, 0.12, 0, 40), name: "pair" },
    { at: k.table + 18, cam: onHead(yh, 0.16, 160), to: onHead(yh, 0.17, 160), name: "you" },
  ];
}

export const Canteen: React.FC<{ frame: number; k: TextCues }> = ({ frame, k }) => {
  const s = shotAt(frame, canteenShots(k), k.colleague - 6);
  const you = behindTable(YOU_END);
  const bowl = pw(330, 470);
  return (
    <PlateScene plate="canteen" cam={drift(s.cam, frame, "canteen", 2)} mood="day" rimFrom="left"
      actors={
        <>
          {TEAM.map((t, i) => {
            const p = behindTable(t);
            return (
              <Cut key={i} y={p.cut} id={`team${i}`}>
                <Body x={p.x} y={p.y} scale={p.scale} facing={p.facing} pose={{ ...SEATED, armF: [35 + Math.sin(frame / 2.2 + i * 1.7) * 5, 95], tilt: 14 }}
                  head={PASTELS[(i * 2 + 1) % 8]} coat={["#3d5a6c", "#6b4b3a", "#5d6470", "#2f3242", "#7a5a8c"][i]} frame={frame} id={`team${i}`}
                  count={{ base: 0 }} size={30 * p.scale} look={{ x: 0.5, y: 0.85 }} mouth="flat" seed={i + 3} held={<Handset scale={1.1} rotate={-60} />} />
              </Cut>
            );
          })}
          <g transform={`translate(${bowl.x} ${bowl.y})`}>
            <path d="M-60 -8 Q0 40 60 -8Z" fill="#d9a63a" stroke={INK} strokeWidth={4} />
            {[-34, -12, 10, 30].map((x) => <ellipse key={x} cx={x} cy={-12} rx={14} ry={7} fill={MUSTARD} stroke={INK} strokeWidth={2} />)}
          </g>
          <Cut y={you.cut} id="you-canteen">
            <Body x={you.x} y={you.y} scale={you.scale} facing={-1} pose={{ ...SEATED, armF: [70, 50] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame}
              id="you-canteen" look={{ x: 1, y: 0.15 }} brows="flat" lids={0.35} mouth="flat" held={<HeroMug x={0} y={0} scale={1} tilt={6} steam={false} />} />
          </Cut>
        </>
      } />
  );
};

// ------------------------------------------------------------------------------------------------ five o'clock, the lift

const LH = 375;
/** The lift: the plate's double doors at the back, world units. */
const LIFT = { left: 784, right: 1196, top: 240, floor: 728 };
const COLLEAGUE = { head: "#9fc0e0", coat: "#6b4b3a" } as const;
const COL_AT = { x: 990, y: 722, scale: 1.12 };
const YOU_LOBBY = { x: 1430, y: 1000, scale: scaleAt(1000, LH) };

function liftShots(k: TextCues): Cam[] {
  const c = headOf(COL_AT.x, COL_AT.y, COL_AT.scale);
  const y = headOf(YOU_LOBBY.x, YOU_LOBBY.y, YOU_LOBBY.scale, STAND, -1);
  return [
    { at: k.colleague - 6, cam: onHead(c, 0.13, -120), to: onHead(c, 0.14, -120), name: "ots" },
    { at: k.colE + 2, cam: onHead(y, 0.17, 170), to: onHead(y, 0.18, 170), name: "you" },
    { at: k.close[0], cam: { x: 990, y: 520, zoom: 1.7 }, to: { x: 990, y: 520, zoom: 1.8 }, name: "doors" },
    { at: k.fine2 - 2, cam: onHead(y, 0.17, 170), to: onHead(y, 0.18, 170), name: "you" },
    { at: k.lift, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 980, y: 560, zoom: 1.08 }, name: "wide" },
    { at: k.lift + 75, cam: onHead(y, 0.16, 120, 60), to: onHead(y, 0.18, 120, 60), name: "you" },
    { at: k.lift + 145, cam: onHead(y, 0.17, 80, 230), to: onHead(y, 0.19, 80, 230), name: "air" },
  ];
}

const Doors: React.FC<{ shut: number }> = ({ shut }) => {
  const half = (LIFT.right - LIFT.left) / 2;
  const h = LIFT.floor - LIFT.top;
  return (
    <g>
      <rect x={LIFT.left} y={LIFT.top} width={half * shut} height={h} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
      <rect x={LIFT.right - half * shut} y={LIFT.top} width={half * shut} height={h} fill="#9aa1ab" stroke={INK} strokeWidth={3} />
    </g>
  );
};

export const Lift: React.FC<{ frame: number; k: TextCues }> = ({ frame, k }) => {
  const shut = ramp(frame, k.close[0], k.close[1]);
  const up = ramp(frame, k.up, k.up + 12);
  const s = shotAt(frame, liftShots(k), k.tv);
  const cam = drift(s.cam, frame, "lift", 2);
  const youPose: Pose = { ...STAND, tilt: mix(0, 8, up), armF: [20, 20] };
  const yh = headOf(YOU_LOBBY.x, YOU_LOBBY.y, YOU_LOBBY.scale, youPose, -1);
  const b = onScreen(cam, { x: yh.x - yh.r * 0.5, y: yh.y - yh.r * 1.1 });
  return (
    <AbsoluteFill>
      <PlateScene plate="lift-lobby" cam={cam} mood="day" rimFrom="right" lights={[counterLight(headOf(COL_AT.x, COL_AT.y, COL_AT.scale), "day", 0.3)]}
        actors={
          <>
            {/* the lit car behind the open doors */}
            <rect x={LIFT.left} y={LIFT.top} width={LIFT.right - LIFT.left} height={LIFT.floor - LIFT.top} fill="#fdf3d8" />
            <rect x={LIFT.left} y={LIFT.floor - 40} width={LIFT.right - LIFT.left} height={40} fill="#d9cbb0" />
            {shut < 1 && (
              <Body {...COL_AT} facing={1} head={COLLEAGUE.head} coat={COLLEAGUE.coat} frame={frame} id="colleague" count={{ base: 0 }} size={34 * COL_AT.scale}
                mouth={talk(frame, k.colleague, k.colE, "flat")} brows="worry" look={{ x: 1, y: 0.1 }} seed={4} />
            )}
            <Doors shut={shut} />
            {s.name !== "ots" && (
              <Figure x={YOU_LOBBY.x} y={YOU_LOBBY.y} scale={YOU_LOBBY.scale} facing={-1} pose={youPose} {...HERO} time={frame}
                look={up > 0.5 ? { x: 0.2, y: -1 } : { x: 1, y: 0 }} brows={up > 0.5 ? "worry" : "flat"} lids={up > 0.5 ? 0 : 0.2} mouth="flat"
                blink={(frame + 20) % 97 < 4} />
            )}
          </>
        } />
      {s.name === "ots" && <FgShoulder x={1660} head={HERO.head} scarf={HERO.scarf} tuft />}
      <Bubble frame={frame} at={k.fine1} until={k.close[0]} x={b.x} y={b.y} text="Fine." side="left" />
      <Bubble frame={frame} at={k.fine2} until={k.up + 6} x={b.x} y={b.y} text="Fine." side="left" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------ the man in the white coat

const RIVAL = { head: "#9cb89a", coat: "#f4f4ef" } as const;

/** The clip on your phone, held up against the blurred lobby: on a screen there is no counter (the film's rule:
 *  counters only show in the room); his 62 shows in the next beat, in person. */
export const RivalPhone: React.FC<{ frame: number; k: TextCues }> = ({ frame, k }) => {
  const buzz = (frame - k.tv) % 24 < 8 ? Math.sin(frame * 2.4) * 7 : 0;
  const zoom = mix(1.0, 1.12, ramp(frame, k.tv, k.end));
  return (
    <PlateScene plate="lift-lobby" cam={{ x: 960, y: 560, zoom }} mood="dusk" blur={24} rimFrom="right"
      actors={
        <HeldPhone x={960 + buzz} y={600} s={0.95} skin={HERO.head} id="et-phone">
          <rect width={336} height={560} fill="#1b2240" />
          <rect width={336} height={70} fill="#22314a" />
          <Figure x={140} y={930} scale={2.3} facing={1} pose={{ ...STAND, armF: [110, 60] }} head={RIVAL.head} coat={RIVAL.coat} time={frame}
            mouth={Math.floor(frame / 5) % 3 === 2 ? "flat" : "open"} brows="raised" look={{ x: 0.6, y: 0 }} />
          <g transform="translate(190 330)">
            <rect x={0} y={-34} width={110} height={66} rx={10} fill="#2a2d36" stroke={INK} strokeWidth={4} />
            <circle cx={118} cy={0} r={22} fill="#3b3e47" stroke={INK} strokeWidth={4} />
            <circle cx={118} cy={0} r={10} fill="#ff7a3c" />
          </g>
          <rect y={510} width={336} height={50} fill={CRIMSON} />
        </HeldPhone>
      } />
  );
};
