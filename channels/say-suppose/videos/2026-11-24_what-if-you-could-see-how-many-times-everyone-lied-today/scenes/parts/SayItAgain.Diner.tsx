// The SayItAgain beat's restaurant at dusk in look C (plate `restaurant-dusk`): you and your date at the left table,
// the next table's couple at the right. Over your shoulder at him; close on "Six one" and his click to 1; close on you
// looking from the photo to him to the 1; he sits up; the next table's "I never do this" / "Me neither", two clicks and
// the clink; close on him watching you watch them; close on you, "Dinner's fine." And the insert of your phone, his
// profile photo a head taller than the man in the chair, on the blurred tablecloth.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, seatedY, STAND, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { HERO, mix, ramp } from "../shared";
import { PlateScene } from "./Plate";
import { Body, headOf, talk } from "./SayItAgain.Kit";
import { counterLight, Cut, FgShoulder, onHead, shotAt, type Shot as Cam } from "./SayItAgain.LookC";
import { DINER as D, TablePhone, WineGlass } from "../sets/SayItAgain";
import type { SayCues } from "../beats/SayItAgain";

const DATE = { head: "#b9a6e0", coat: "#3d4a66" } as const;
const WOMAN = { head: "#e6c27a", coat: "#c96f2d" } as const;
const MAN = { head: "#7fc29b", coat: "#2f3242" } as const;

const sat = (p: { x: number; seat: number; scale: number }) => ({ x: p.x, y: seatedY(p.seat, p.scale), scale: p.scale });
const head = (p: { x: number; seat: number; scale: number }, facing: 1 | -1) => headOf(p.x, seatedY(p.seat, p.scale), p.scale, SEATED, facing);

function dinerShots(k: SayCues): Cam[] {
  const date = head(D.date, -1);
  const you = head(D.you, 1);
  const woman = head(D.woman, 1);
  const man = head(D.man, -1);
  const pair = { x: (woman.x + man.x) / 2, y: (woman.y + man.y) / 2 + 40, zoom: 1.55 };
  return [
    { at: k.dusk - 4, cam: { x: 560, y: 600, zoom: 1.3 }, to: { x: 600, y: 600, zoom: 1.36 } },
    { at: k.chair, cam: onHead(date, 0.15, 130), to: onHead(date, 0.16, 130), name: "ots" },
    { at: k.six - 2, cam: onHead(date, 0.17, 60, 150), to: onHead(date, 0.18, 60, 150), name: "date" },
    { at: k.click1 + 4, cam: onHead(you, 0.17, -150), to: onHead(you, 0.18, -150), name: "you" },
    { at: k.straight - 2, cam: onHead(date, 0.16, 0, 150), to: onHead(date, 0.17, 0, 150), name: "up" },
    { at: k.woman - 3, cam: onHead(woman, 0.15, 150), to: onHead(woman, 0.16, 150), name: "woman" },
    { at: k.man - 4, cam: pair, to: { ...pair, zoom: 1.65 }, name: "pair" },
    { at: k.watch, cam: onHead(date, 0.16, 110), to: onHead(date, 0.17, 110), name: "watch" },
    { at: k.fine, cam: onHead(you, 0.16, -160), to: onHead(you, 0.19, -160), name: "fine" },
  ];
}

export const Restaurant: React.FC<{ frame: number; k: SayCues }> = ({ frame, k }) => {
  const s = shotAt(frame, dinerShots(k), k.end);
  const up = ramp(frame, k.straight, k.straight + 12);
  const datePose: Pose = { ...SEATED, drop: -10 * up, lean: -3 * up, armF: [60, 40] };
  const youLook = frame >= k.watch ? { x: 1, y: 0 }
    : frame >= k.lookOne && frame < k.woman ? { x: 0.8, y: -0.9 }
    : frame >= k.lookHim && frame < k.woman ? { x: 1, y: 0 }
    : frame >= k.lookPhoto && frame < k.woman ? { x: 0.6, y: 0.9 }
    : { x: 1, y: 0.1 };
  const clink = ramp(frame, k.clink - 8, k.clink) * (1 - ramp(frame, k.clink + 14, k.clink + 26));
  const raise = (c: number): Pose => ({ ...SEATED, armF: [mix(110, 80, c), mix(40, 10, c)] });
  const watching = frame >= k.watch;
  const lights = [counterLight(head(D.date, -1), "dusk", 0.3), counterLight(head(D.woman, 1), "dusk", 0.25), counterLight(head(D.man, -1), "dusk", 0.25)];
  return (
    <AbsoluteFill>
      <PlateScene plate="restaurant-dusk" cam={drift(s.cam, frame, "diner", 3)} mood="dusk" rimFrom="left" lights={lights}
        actors={
          <>
            <Cut y={D.date.cut.y} x={D.date.cut.x} id="date">
              <Body {...sat(D.date)} facing={-1} pose={datePose} head={DATE.head} coat={DATE.coat} frame={frame} id="date" count={{ base: 0, ticks: [k.click1] }}
                size={34 * D.date.scale} mouth={talk(frame, k.six, k.sixE, "smile")} look={{ x: 1, y: watching ? 0.05 : 0 }} brows={watching ? "flat" : "none"} seed={3} />
            </Cut>
            <TablePhone />
            <Cut y={D.woman.cut.y} x={D.woman.cut.x} id="woman">
              <Body {...sat(D.woman)} facing={1} pose={raise(clink)} head={WOMAN.head} coat={WOMAN.coat} frame={frame} id="woman" count={{ base: 0, ticks: [k.clickW] }}
                size={34 * D.woman.scale} mouth={talk(frame, k.woman, k.womanE, "smile")} held={<WineGlass />} look={{ x: 1, y: 0 }} seed={5} />
            </Cut>
            <Cut y={D.man.seat - 2} id="man">
              <Body {...sat(D.man)} facing={-1} pose={raise(clink)} head={MAN.head} coat={MAN.coat} frame={frame} id="man" count={{ base: 0, ticks: [k.clickM] }}
                size={34 * D.man.scale} mouth={talk(frame, k.man, k.manE, "smile")} held={<WineGlass />} look={{ x: 1, y: 0 }} seed={7} />
            </Cut>
            {s.name !== "ots" && (
              <Cut y={D.you.seat - 2} id="you">
                <Body {...sat(D.you)} facing={1} pose={{ ...SEATED, armF: [70, 50] }} head={HERO.head} scarf={HERO.scarf} tuft frame={frame} id="you-diner"
                  look={youLook} brows={frame >= k.lookOne && frame < k.woman ? "raised" : "none"} mouth={frame >= k.fine ? "smile" : "flat"} lids={watching ? 0.2 : 0} />
              </Cut>
            )}
          </>
        } />
      {s.name === "ots" && <FgShoulder x={250} head={HERO.head} scarf={HERO.scarf} tuft />}
    </AbsoluteFill>
  );
};

/** INSERT: your phone on the tablecloth, his profile photo: a man a head taller than the one in the chair. */
export const PhoneInsert: React.FC<{ frame: number; k: SayCues }> = ({ frame, k }) => {
  const zoom = mix(1.3, 1.38, ramp(frame, k.photo, k.chair));
  const at = { x: 760, y: 640 };
  return (
    <PlateScene plate="restaurant-dusk" cam={{ ...at, zoom }} mood="dusk" blur={24} rimFrom="left"
      actors={
        <g transform={`translate(${at.x} ${at.y}) rotate(-6) scale(0.62)`}>
          <rect x={-200} y={-380} width={400} height={760} rx={48} fill="#1b1d24" stroke={INK} strokeWidth={6} />
          <rect x={-178} y={-340} width={356} height={680} rx={18} fill="#f5d7c4" />
          <clipPath id="say-photo"><rect x={-178} y={-340} width={356} height={600} rx={18} /></clipPath>
          <g clipPath="url(#say-photo)">
            <rect x={-178} y={-340} width={356} height={600} fill="#8fd0e4" />
            <rect x={-178} y={120} width={356} height={140} fill="#7fc29b" />
            <Figure x={0} y={240} scale={1.62} facing={1} pose={{ ...STAND, armF: [30, 60], tilt: 6 }} head={DATE.head} coat={DATE.coat}
              mouth="smile" look={{ x: 0, y: 0 }} brows="raised" />
          </g>
          <rect x={-150} y={278} width={180} height={18} rx={9} fill={INK} opacity={0.6} />
          <circle cx={130} cy={300} r={26} fill="#d8344f" />
          <path d="M118 300 l9 9 l14 -16" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        </g>
      } />
  );
};
