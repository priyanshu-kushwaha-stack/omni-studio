// A Thousand Cards, line 66 (script v7; outside review of v6, sheet 25: make the failed news scan physical, a laugh,
// four seconds shorter in feel). Three shots, one per clause:
//   "Why not go on the news and scan the whole country?": you at the news desk, live, the letter up, saying it to the
//       studio camera; then you wait for the snap, eyes on the air over the lens: a dashed empty outline, nothing.
//   "Because a screen isn't a face.": a wall of nine home screens, a face in each and an empty dashed card space over
//       every face; they slide together into one glass screen. Nothing opens.
//   "Your sister's video call settled that.": back in the studio, the camera operator yawns and swivels the camera
//       away; you keep presenting to it, leaning after it, then sag.
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, STAND, type Pose } from "@whatif/kit/rig/pose";
import { setLook, tvStudio } from "@whatif/kit/sets";
import { LookContext } from "@whatif/kit/stage/Look";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift, insert } from "@whatif/kit/stage/shots";
import { Stage } from "@whatif/kit/stage/Stage";
import { INK, PAPER } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { blinking, camAt, current, HERO, mix, PASTELS, ramp } from "../shared";
import { FlatShot, HeadIcon } from "./WhosCrimson.Common";

const CAM = { x: 1520, y: 640 } as const;
const OPERATOR = { x: 1720, y: 980, scale: 1.05, head: PASTELS[0], coat: "#2a2d36" } as const;

/** The studio camera on its tripod; `away` 0..1 swivels the lens from you (left) to the window (right). */
const StudioCamera: React.FC<{ away: number }> = ({ away }) => (
  <g>
    <path d={`M${CAM.x} ${CAM.y + 60} L${CAM.x - 90} 990 M${CAM.x} ${CAM.y + 60} L${CAM.x} 990 M${CAM.x} ${CAM.y + 60} L${CAM.x + 90} 990`} stroke="#3b3e47" strokeWidth={14} />
    <g transform={`translate(${CAM.x} ${CAM.y}) scale(${mix(1, -1, away)} 1)`}>
      <rect x={-90} y={-60} width={200} height={120} rx={14} fill="#2a2d36" stroke={INK} strokeWidth={6} />
      <rect x={-150} y={-36} width={64} height={72} rx={10} fill="#3b3e47" stroke={INK} strokeWidth={5} />
      <circle cx={-150} cy={0} r={22} fill="#7fb2ff" stroke={INK} strokeWidth={4} />
      <circle cx={80} cy={-40} r={9} fill="#d8344f" />
    </g>
  </g>
);

type TvView = "desk" | "screens" | "gag";

export const TvShot: React.FC<{ frame: number; from: number; screens: number; gag: number; to: number; mood: MoodName }> = ({ frame, from, screens, gag, to, mood }) => {
  const view = current<TvView>(frame, [[0, "desk"], [screens, "screens"], [gag, "gag"]]);
  if (view === "screens") return <Screens frame={frame} from={screens} to={gag} mood={mood} />;
  const a = tvStudio.spots.anchor;
  const say = from + 8, wait = Math.round(mix(from, screens, 0.55));
  const up = ramp(frame, say - 6, say + 4);
  const away = view === "gag" ? ramp(frame, gag + 10, gag + 22) : 0;
  const follow = view === "gag" ? ramp(frame, gag + 18, gag + 30) : 0;
  const sag = view === "gag" ? ramp(frame, to - 22, to - 10) : 0;
  const pose: Pose = { ...SEATED, lean: 10 * follow - 8 * sag, tilt: 8 * sag, armF: [mix(30, 112, up) - 20 * sag, mix(50, 20, up)] };
  const talking = (view === "desk" && frame >= say && frame < wait) || (view === "gag" && frame < to - 22);
  const face = sag > 0.3
    ? { brows: "sad" as const, lids: 0.5, mouth: "frown" as const, eyes: 1, look: { x: 0.8, y: 0.4 } }
    : view === "desk" && frame >= wait
      ? { brows: "raised" as const, lids: 0, mouth: "flat" as const, eyes: 1.1, look: { x: 1, y: -0.7 } }
      : { brows: "raised" as const, lids: 0, mouth: talking ? (Math.floor(frame / 5) % 2 ? "open" as const : "smile" as const) : "smile" as const, eyes: 1, look: { x: 1, y: 0 } };
  const ghost = view === "desk" && frame >= wait + 6 && frame < wait + 30 ? (Math.floor((frame - wait) / 4) % 2 ? 0.25 : 0.7) * (1 - (frame - wait - 6) / 24) : 0;
  const yawn = view === "gag" && frame >= gag && frame < gag + 16;
  const cam = drift(view === "gag"
    ? camAt(frame, [[gag, { x: 1180, y: 640, zoom: 1.05 }], [to, { x: 1200, y: 640, zoom: 1.12 }]])
    : camAt(frame, [[from, { x: 1150, y: 620, zoom: 1.2 }], [wait, { x: 1220, y: 600, zoom: 1.35 }], [screens, { x: 1240, y: 600, zoom: 1.4 }]]), frame, "tv", 3);
  const o = { ...tvStudio.defaults, screen: "face" as const, guest: HERO.head, live: true };
  const p = { cam, mood, frame, options: o };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <LookContext.Provider value={setLook(tvStudio.lights(o), mood, cam)}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={tvStudio.Back(p)} actors={
          <>
            <Figure {...HERO} x={a.x} y={a.y} scale={a.scale} facing={1} pose={pose} {...face} blink={blinking(frame, 1)} time={frame}
              held={<Letter x={4} y={8} scale={0.6} tilt={-4} />} />
            {tvStudio.Mid?.(p)}
            <StudioCamera away={away} />
            <Figure head={OPERATOR.head} coat={OPERATOR.coat} x={OPERATOR.x} y={OPERATOR.y} scale={OPERATOR.scale} facing={-1}
              pose={{ ...STAND, armF: yawn ? [170, 10] : [70, 40], armB: [60, 30] }} brows={yawn ? "flat" : "none"} lids={yawn ? 0.8 : 0.4}
              mouth={yawn ? "o" : "flat"} eyes={1} look={{ x: 1, y: 0.1 }} blink={blinking(frame, 5)} time={frame} />
            {ghost > 0 && (
              <rect x={CAM.x - 240} y={CAM.y - 170} width={180} height={76} rx={12} fill="none" stroke={PAPER} strokeWidth={6} strokeDasharray="16 12" opacity={ghost} />
            )}
          </>
        } />
      </LookContext.Provider>
    </AbsoluteFill>
  );
};

/** "Because a screen isn't a face.": nine home screens, a face and an empty dashed card space in each; they slide into
 *  one glass screen. */
const Screens: React.FC<{ frame: number; from: number; to: number; mood: MoodName }> = ({ frame, from, to, mood }) => {
  const merge = ramp(frame, mix(from, to, 0.5), mix(from, to, 0.8));
  const cam = drift(camAt(frame, [[from, insert(960, 540, 1.0)], [to, insert(960, 540, 1.06)]]), frame, "screens", 2);
  return (
    <FlatShot cam={cam} mood={mood} back={<rect x={-400} y={-400} width={2800} height={1900} fill="#141833" />} actors={
      <g>
        {Array.from({ length: 9 }, (_, i) => {
          const gx = 960 + ((i % 3) - 1) * 520, gy = 560 + (Math.floor(i / 3) - 1) * 290;
          const x = mix(gx, 960, merge), y = mix(gy, 560, merge);
          const s = mix(1, 2.4, merge);
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={i === 4 ? 1 : 1 - merge}>
              <rect x={-230} y={-125} width={460} height={250} rx={12} fill="#3d4a7a" stroke={INK} strokeWidth={8} />
              <HeadIcon x={0} y={30} r={58} color={i === 4 ? HERO.head : PASTELS[(i * 3) % PASTELS.length]} tuft={i === 4} mouth="smile" />
              <rect x={-70} y={-110} width={140} height={46} rx={8} fill="none" stroke={PAPER} strokeWidth={4} strokeDasharray="12 9" opacity={0.75} />
              {/* the glass: a glare stripe */}
              <path d="M-200 125 L-90 -125 H-40 L-150 125Z" fill="#fff" opacity={0.08 + 0.12 * merge} />
            </g>
          );
        })}
      </g>
    } />
  );
};
