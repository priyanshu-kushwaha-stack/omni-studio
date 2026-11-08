import { AbsoluteFill, interpolate } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { Layer, Stage, toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Tag } from "@whatif/kit/ui/Tag";
import { blinking, camAt, linear, mix, noise, ramp, type Shot } from "../shared";
import { LookContext } from "@whatif/kit/stage/Look";
import { moodLook } from "@whatif/kit/stage/moods";
import { SKY, StreetBack } from "../sets/Street";
import { beatTimes, blendArm, Lit, You } from "./LongRun.parts";

const FLOOR = 900;
const MIRROR = { x: 1100, y: 610, rx: 135, ry: 185 };
const WINDOW = { x: 1560, y: 230, w: 380, h: 500 };
const TABLE_LAMP = { x: 600, y: 640 };

/** The street below the window, seen from upstairs: strangers walking under street lamps. */
const StreetBelow: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} fill="#34305c" />
    <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={160} fill="#e48a62" opacity={0.65} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={WINDOW.x - 40 + i * 120} y={WINDOW.y + 90 - noise(i) * 60} width={100} height={260} fill="#262248" />
        {[0, 1, 2, 3].map((w) => <rect key={w} x={WINDOW.x - 26 + i * 120 + (w % 2) * 40} y={WINDOW.y + 120 - noise(i) * 60 + Math.floor(w / 2) * 60} width={22} height={28} fill={noise(i * 7 + w) > 0.45 ? "#ffd27a" : "#3a3566"} />)}
      </g>
    ))}
    <rect x={WINDOW.x} y={WINDOW.y + 340} width={WINDOW.w} height={160} fill="#8a84a0" />
    <rect x={WINDOW.x} y={WINDOW.y + 330} width={WINDOW.w} height={14} fill="#7c7890" />
    {[WINDOW.x + 70, WINDOW.x + 300].map((x) => (
      <g key={x}>
        <rect x={x - 3} y={WINDOW.y + 250} width={6} height={95} fill="#1b1830" />
        <circle cx={x} cy={WINDOW.y + 250} r={9} fill="#fff1b8" />
        <ellipse cx={x} cy={WINDOW.y + 345} rx={60} ry={12} fill="#fff1b8" opacity={0.35} />
      </g>
    ))}
    {Array.from({ length: 14 }, (_, i) => {
      const dirn = i % 2 ? -1 : 1;
      const speed = 0.7 + noise(i) * 0.6;
      const x = WINDOW.x - 60 + (((noise(i + 3) * 500 + dirn * t * speed) % 500) + 500) % 500;
      const y = WINDOW.y + 380 + (i % 4) * 26;
      return (
        <Figure key={i} x={x} y={y} scale={0.3} facing={dirn as 1 | -1} head={["#7fa0c4", "#e6a0a0", "#7fc29b", "#b58fc7", "#d9c26a", "#c96f2d"][i % 6]}
          pose={walkPose(t * 0.25 + i)} look={{ x: 0.6, y: 0 }} mouth="none" />
      );
    })}
  </g>
);

/** Lines 58-59 (v7): you squint at the mirror (2 DAYS beside it), then the camera pulls back to the window and on
 *  into the street of strangers below, which the Ending opens on. */
const MirrorRoom: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, cues, clips } = shot;
  const b = beatTimes(cues, clips);
  const notice = clips[58].from + 91; // "You'd barely notice."
  const pull = b.pullBack;
  const end = shot.to;

  const walkK = linear(frame, pull + 30, pull + 120);
  const youX = mix(860, 1500, ramp(frame, pull + 30, pull + 120));
  const walking = walkK > 0 && walkK < 1;
  const lean = ramp(frame, cues.mirror - 4, cues.mirror + 12) * (1 - ramp(frame, notice + 30, notice + 44));
  let body: Pose = walking ? walkPose((frame - pull) * 0.28) : { ...STAND, lean: lean * 8 };
  const youP = { x: youX, y: FLOOR + 10, scale: 1.1, facing: 1 as const, pose: body };
  const shrug = ramp(frame, notice - 4, notice + 6) * (1 - ramp(frame, notice + 28, notice + 38));
  body = { ...body, armF: blendArm(body.armF, [30, 95], shrug), armB: blendArm(body.armB, [-20, 105], shrug), tilt: walking ? 0 : frame >= pull + 120 ? 12 : 0 };
  const atWindow = frame >= pull + 120;

  const cam: Camera = drift(camAt(frame, [
    [b.mirror, { x: 980, y: 640, zoom: 1.45 }],
    [pull, { x: 1000, y: 630, zoom: 1.65 }],
    [pull + 120, { x: 1420, y: 560, zoom: 1.15 }],
    [cues.strangers - 36, { x: 1600, y: 560, zoom: 1.4 }],
    [cues.strangers, { x: WINDOW.x + WINDOW.w / 2, y: WINDOW.y + 390, zoom: 3.8 }],
    [end, { x: WINDOW.x + WINDOW.w / 2, y: WINDOW.y + 390, zoom: 4 }],
  ]), frame, "mirror", 4);

  const reflect = { x: MIRROR.x + 40, y: FLOOR - 4, scale: 1.0, facing: -1 as const };
  const back = (
    <Layer cam={cam} depth={1}>
      <rect x={-600} y={-300} width={3200} height={1600} fill="#c99470" />
      {Array.from({ length: 26 }, (_, i) => <rect key={i} x={-560 + i * 120} y={-300} width={5} height={1200} fill="#9f6f53" opacity={0.6} />)}
      <rect x={-600} y={700} width={3200} height={200} fill="#8a5a40" />
      <rect x={-600} y={692} width={3200} height={12} fill="#6e452f" />
      <rect x={-600} y={FLOOR} width={3200} height={500} fill="#5f3b28" />
      {/* the window and the street below */}
      <defs><clipPath id="lr-window"><rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} /></clipPath></defs>
      <g clipPath="url(#lr-window)"><StreetBelow t={t} /></g>
      <rect x={WINDOW.x} y={WINDOW.y} width={WINDOW.w} height={WINDOW.h} fill="none" stroke="#e9d9bd" strokeWidth={22} />
      <line x1={WINDOW.x + WINDOW.w / 2} y1={WINDOW.y} x2={WINDOW.x + WINDOW.w / 2} y2={WINDOW.y + WINDOW.h} stroke="#e9d9bd" strokeWidth={12} />
      <line x1={WINDOW.x} y1={WINDOW.y + 210} x2={WINDOW.x + WINDOW.w} y2={WINDOW.y + 210} stroke="#e9d9bd" strokeWidth={12} />
      <rect x={WINDOW.x - 34} y={WINDOW.y + WINDOW.h} width={WINDOW.w + 68} height={22} fill="#e9d9bd" />
      <path d={`M${WINDOW.x - 80} ${WINDOW.y - 40} H${WINDOW.x + 10} Q${WINDOW.x - 10} ${WINDOW.y + 280} ${WINDOW.x + 20} ${WINDOW.y + WINDOW.h + 120} H${WINDOW.x - 80}Z`} fill="#7a3b4a" />
      <path d={`M${WINDOW.x + WINDOW.w + 80} ${WINDOW.y - 40} H${WINDOW.x + WINDOW.w - 10} Q${WINDOW.x + WINDOW.w + 10} ${WINDOW.y + 280} ${WINDOW.x + WINDOW.w - 20} ${WINDOW.y + WINDOW.h + 120} H${WINDOW.x + WINDOW.w + 80}Z`} fill="#7a3b4a" />
      {/* side table and lamp */}
      <rect x={TABLE_LAMP.x - 90} y={TABLE_LAMP.y + 100} width={180} height={20} fill="#6f4a2f" />
      <rect x={TABLE_LAMP.x - 80} y={TABLE_LAMP.y + 120} width={14} height={140} fill="#6f4a2f" /><rect x={TABLE_LAMP.x + 66} y={TABLE_LAMP.y + 120} width={14} height={140} fill="#6f4a2f" />
      <rect x={TABLE_LAMP.x - 8} y={TABLE_LAMP.y + 20} width={16} height={80} fill={INK} />
      <path d={`M${TABLE_LAMP.x - 60} ${TABLE_LAMP.y + 30} L${TABLE_LAMP.x - 36} ${TABLE_LAMP.y - 40} H${TABLE_LAMP.x + 36} L${TABLE_LAMP.x + 60} ${TABLE_LAMP.y + 30}Z`} fill="#ffd27a" stroke={INK} strokeWidth={5} />
      {/* the mirror frame (the glass is drawn with the actors, so it can show your reflection) */}
      <ellipse cx={MIRROR.x} cy={MIRROR.y} rx={MIRROR.rx + 22} ry={MIRROR.ry + 22} fill="#c98f5e" stroke={INK} strokeWidth={7} />
    </Layer>
  );
  const face = {
    mouth: frame >= notice && frame < notice + 40 ? ("smirk" as const) : ("flat" as const),
    brows: lean > 0.5 ? ("flat" as const) : ("none" as const),
    lids: lean > 0.5 ? 0.5 : atWindow ? 0.3 : 0.15,
    blink: blinking(frame, 2),
  };
  const actors = (
    <>
      <defs><clipPath id="lr-mirror"><ellipse cx={MIRROR.x} cy={MIRROR.y} rx={MIRROR.rx} ry={MIRROR.ry} /></clipPath></defs>
      <ellipse cx={MIRROR.x} cy={MIRROR.y} rx={MIRROR.rx} ry={MIRROR.ry} fill="#9fb7c4" />
      <g clipPath="url(#lr-mirror)">
        <rect x={MIRROR.x - 200} y={MIRROR.y - 220} width={400} height={440} fill="#a98a78" opacity={0.6} />
        {youX < 1000 && (
          <g opacity={0.9}>
            <You {...reflect} x={reflect.x - (youX - 860) * 0.6} pose={body} age={1} look={{ x: 0.7, y: 0 }} {...face} time={frame} />
          </g>
        )}
        <path d={`M${MIRROR.x - 120} ${MIRROR.y - 60} L${MIRROR.x - 20} ${MIRROR.y - 200} L${MIRROR.x + 20} ${MIRROR.y - 200} L${MIRROR.x - 100} ${MIRROR.y}Z`} fill="#fff" opacity={0.22} />
      </g>
      <You {...youP} pose={body} age={1} look={atWindow ? { x: 0.8, y: 0.7 } : { x: 0.8, y: 0 }} {...face} time={frame} />
    </>
  );
  const mirrorEdge = toScreen(cam, MIRROR.x + MIRROR.rx + 40, MIRROR.y - 120);
  const tagAlpha = 1 - ramp(frame, pull - 6, pull + 6);
  const lamp = toScreen(cam, TABLE_LAMP.x, TABLE_LAMP.y);
  const you = toScreen(cam, youX + 60, 560);
  const win = toScreen(cam, WINDOW.x + WINDOW.w / 2, WINDOW.y + WINDOW.h / 2);
  return (
    <AbsoluteFill>
      <Lit glows={[
        { x: lamp.x, y: lamp.y, r: 520 * cam.zoom, color: "rgba(255,196,120,0.5)" },
        { x: win.x, y: win.y, r: 380 * cam.zoom, color: "rgba(150,170,255,0.3)" },
        { x: you.x, y: you.y, r: 520 * cam.zoom, color: "rgba(255,190,120,0.38)" },
      ]}>
        <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} back={back} actors={actors} />
      </Lit>
      {tagAlpha > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: tagAlpha }}>
          <Tag at={cues.mirror} text="2 DAYS" x={Math.min(mirrorEdge.x, 1500)} y={interpolate(mirrorEdge.y, [0, 1080], [80, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} size={76} />
        </div>
      )}
    </AbsoluteFill>
  );
};

const STRANGERS = Array.from({ length: 15 }, (_, i) => {
  const near = i >= 10;
  return {
    near,
    dir: (i % 2 ? -1 : 1) as 1 | -1,
    speed: 1.1 + noise(i + 40) * 1.2,
    x0: near ? (i - 10) * 600 + noise(i) * 120 : i * 300 + noise(i + 20) * 90,
    y: near ? 1008 + (i % 2) * 14 : 712 + (i % 3) * 7,
    scale: near ? 1.15 + noise(i) * 0.1 : 0.6 + noise(i) * 0.1,
    head: ["#7fa0c4", "#e6a0a0", "#7fc29b", "#b58fc7", "#d9c26a", "#c96f2d", "#e0a070"][i % 7],
    coat: i % 4 === 1 ? ["#5d6f8a", "#7a5a48", "#4f6b5a"][i % 3] : undefined,
  };
});

/** The street below at dusk, full of strangers walking: the beat ends here and the Ending opens on it. */
const StreetOfStrangers: React.FC<{ frame: number; t: number; from: number; to: number }> = ({ frame, t, from, to }) => {
  const cam: Camera = drift(camAt(frame, [[from, { x: 1050, y: 560, zoom: 1.32 }], [to, { x: 1020, y: 650, zoom: 1.12 }]]), frame, "strangers", 5);
  const actors = (
    <>
      {[...STRANGERS].sort((a, b) => a.y - b.y).map((p, i) => {
        const x = ((((p.x0 + p.dir * p.speed * t) % 3000) + 3000) % 3000) - 300;
        return (
          <Figure key={i} x={x} y={p.y} scale={p.scale} facing={p.dir} head={p.head} coat={p.coat} pose={walkPose(t * 0.28 + i * 1.7)}
            look={{ x: 0.6, y: 0 }} mouth={i % 3 === 0 ? "smile" : "flat"} blink={blinking(frame, i)} time={t} />
        );
      })}
    </>
  );
  return (
    <LookContext.Provider value={moodLook("dusk")}>
      <Stage cam={cam} radius={0} origin={{ x: 0, y: 0 }} sky={SKY} back={<StreetBack cam={cam} frame={frame} t={t} />} actors={actors} />
    </LookContext.Provider>
  );
};

export const MirrorScene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame, t, cues } = shot;
  const fadeFrom = cues.strangers - 18;
  const k = ramp(frame, fadeFrom, cues.strangers + 2);
  return (
    <AbsoluteFill>
      {k < 1 && <MirrorRoom shot={shot} />}
      {k > 0 && (
        <AbsoluteFill style={{ opacity: k }}>
          <StreetOfStrangers frame={frame} t={t} from={fadeFrom} to={shot.to} />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
