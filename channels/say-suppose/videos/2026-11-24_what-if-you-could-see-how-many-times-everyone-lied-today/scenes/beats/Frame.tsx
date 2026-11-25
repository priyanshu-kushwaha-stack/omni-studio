// Beat "The Frame" (script.md ## [00:00] The Frame), look C: the painted meeting room (plate meeting-lamp), our cast.
// The first frame is the thumbnail moment: the boss behind the table under the lamp, a hand on his heart, a glowing 47
// over him; you large at the left with your mug. Then the look test's two shots (looks/Looks.tsx, look C):
//   - over your blurred shoulder at the boss: "I fought for every one of these bonuses." click, the 47 pops to 48;
//   - close on you against the soft room, his 48 far behind: your mug stops in the air, eyes wide; bubble "Forty-eight?";
//   - "What if you saw how many lies everyone told?" a paper flip and a tape rewind: the camera pulls back, the 48 runs
//     down, the boss backs out, and the room cross-fades into morning (plate meeting-morning).
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { lerpPose, walkPose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { toScreen, type Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { PAPER } from "@whatif/kit/theme";
import { camAt, current, linear, ramp, type Beat, type Shot } from "../shared";
import { Bubble, Clicks, headWorld, talk, type Placed } from "../parts/FrameKit";
import { aimAt, Bokeh, NearYou } from "../parts/FrameLook";
import { BOSS_AT, MeetingPlate, THUMB_CAM, YOU_HEAD, YOU_SCALE, type BossState, type YouState } from "../parts/FrameMeeting";
import { BOSS_POSE, MUG_POSE } from "../sets/MeetingRoom";

function times(shot: Shot) {
  const line = shot.at("Boss: I fought");
  const lineEnd = shot.end("Boss: I fought");
  const click = lineEnd + 12;
  const what = shot.at("What if you saw");
  const flip = shot.at("What if you saw", 0.1);
  return { line, lineEnd, click, over: 36, close: click + 4, what, flip, wide: flip + 6, rewind: flip + 12, end: shot.to };
}
type T = ReturnType<typeof times>;

const BOSS_HEAD = headWorld({ x: BOSS_AT.x, y: BOSS_AT.y, scale: BOSS_AT.scale, facing: -1, pose: BOSS_POSE });

function bossState(frame: number, k: T): BossState {
  const rw = linear(frame, k.rewind, k.end);
  // his raised hand works while he talks; in the rewind he walks backwards out of the room and the 48 runs down
  const gesture = frame >= k.line && frame < k.lineEnd ? Math.sin((frame - k.line) * 0.22) * 10 : 0;
  const talking = { ...BOSS_POSE, armB: [BOSS_POSE.armB[0] + gesture, BOSS_POSE.armB[1] - gesture * 0.5] as [number, number] };
  const pose = rw > 0 ? lerpPose(talking, walkPose(-frame * 0.35), Math.min(1, rw * 3)) : talking;
  const value = rw > 0 ? Math.round(48 * (1 - rw)) : null;
  return {
    pose, x: BOSS_AT.x + rw * 900, mouth: talk(frame, k.line, k.lineEnd, "smile"), blink: frame > k.lineEnd && (frame + 3) % 89 < 4,
    count: value === null ? { base: 46, ticks: [0, k.click] } : { base: value },
  };
}

function youState(frame: number, k: T): YouState {
  const rw = linear(frame, k.rewind, k.end);
  // the mug rises through his line and stops in the air on the click; the rewind lowers it
  const rise = ramp(frame, k.line, k.click);
  const mugPose = lerpPose({ ...MUG_POSE, armF: [28, 96] }, MUG_POSE, frame < 12 ? 1 : rise);
  const pose = lerpPose(mugPose, { ...MUG_POSE, armF: [20, 60] }, rw);
  const stunned = frame < 14 || frame >= k.click;
  const widen = ramp(frame, k.close + 10, k.close + 18);
  return {
    pose, look: { x: 0.85, y: -0.35 }, blink: !stunned && (frame + 11) % 97 < 4,
    face: stunned ? { brows: "raised", lids: 0, mouth: "o", eyes: 1.25 + widen * 0.15 } : { brows: "flat", lids: 0.35, mouth: "flat", eyes: 1.05 },
  };
}

type View = "thumb" | "over" | "close" | "wide";

function cam(frame: number, k: T, view: View): Camera {
  switch (view) {
    case "thumb": return camAt(frame, [[0, THUMB_CAM], [k.over, { ...THUMB_CAM, x: THUMB_CAM.x + 14, zoom: THUMB_CAM.zoom + 0.06 }]]);
    case "over": {
      const a = aimAt(BOSS_HEAD, { x: 1082, y: 470 }, 3.2);
      return drift(camAt(frame, [[k.over, a], [k.close, { ...a, zoom: 3.38 }]]), frame, "frame-over", 1.2);
    }
    case "close": {
      const a = aimAt(YOU_HEAD, { x: 860, y: 500 }, 2.9);
      return drift(camAt(frame, [[k.close, a], [k.flip, { ...a, zoom: 3.05 }]]), frame, "frame-close", 1);
    }
    default: return camAt(frame, [[k.wide, { x: 860, y: 600, zoom: 1.7 }], [k.end, { x: 940, y: 560, zoom: 1.15 }]]);
  }
}

/** The room at a frame: the thumbnail, the two look-test shots, the rewind into morning. */
export const FramePicture: React.FC<{ frame: number; shot: Shot }> = ({ frame, shot }) => {
  const k = times(shot);
  const view = current<View>(frame, [[0, "thumb"], [k.over, "over"], [k.close, "close"], [k.wide, "wide"]]);
  const c = cam(frame, k, view);
  const boss = bossState(frame, k);
  const you = youState(frame, k);
  if (view === "over") {
    return (
      <AbsoluteFill>
        <MeetingPlate cam={c} frame={frame} boss={boss} />
        <NearYou x={290} y={790} />
      </AbsoluteFill>
    );
  }
  if (view === "close") {
    return (
      <AbsoluteFill>
        <MeetingPlate cam={c} frame={frame} you={you} subject="you" />
        <Bokeh frame={frame} spots={[[1560, 230, 60, 0.5], [1700, 420, 34, 0.3], [240, 180, 46, 0.25], [1420, 120, 28, 0.35]]}
          far={{ x: 1600, y: 300, base: 48, id: "frame-48-far" }} />
      </AbsoluteFill>
    );
  }
  const rw = linear(frame, k.rewind, k.end);
  return (
    <AbsoluteFill>
      <MeetingPlate cam={c} frame={frame} boss={boss} you={you} subject={view === "thumb" ? "boss" : "you"} glow={0.55 * (1 - rw)} />
      {rw > 0 && (
        <AbsoluteFill style={{ opacity: rw }}>
          <MeetingPlate cam={c} frame={frame} plate="meeting-morning" mood="morning" you={you} subject="you" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

/** Tape rewind over the picture: tracking bars rolling down, a rewind glyph. */
const Rewind: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  if (frame < from || frame >= to + 2) return null;
  const t = frame - from;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "rgba(120,160,255,.08)", mixBlendMode: "screen" }} />
      {[0, 1, 2].map((i) => {
        const y = ((t * 46 + i * 380) % 1300) - 110;
        return <div key={i} style={{ position: "absolute", left: 0, width: 1920, top: y, height: 22 + i * 10, background: "rgba(255,255,255,.22)" }} />;
      })}
      <div style={{ position: "absolute", left: 140, top: 150, fontFamily: FONT, fontWeight: 800, fontSize: 70, color: PAPER,
        textShadow: "0 4px 0 rgba(0,0,0,.4)", opacity: Math.floor(t / 6) % 2 ? 0.9 : 0.55 }}>◀◀</div>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  // the paper flip: the frame turns edge-on and back, the rewind on its far side
  const turn = interpolate(frame, [k.flip, k.flip + 6, k.flip + 12], [0, 90, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const you: Placed = { x: 0, y: 0, scale: YOU_SCALE, facing: 1, pose: MUG_POSE };
  const r = headWorld(you).r;
  const head = toScreen(cam(frame, k, "close"), YOU_HEAD.x, YOU_HEAD.y - r);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `perspective(2400px) rotateY(${turn}deg)`, background: PAPER }}>
        <FramePicture frame={frame} shot={shot} />
        <Rewind frame={frame} from={k.rewind} to={k.end} />
      </AbsoluteFill>
      <Bubble frame={frame} at={k.click + 14} until={k.flip} x={head.x - 230} y={head.y + 40} text="Forty-eight?" size={56} side="left" />
      <Clicks at={[2, k.click]} volume={0.55} />
      <Sequence from={k.flip} durationInFrames={24}><Audio src={staticFile("sfx/flip.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.rewind} durationInFrames={Math.max(1, k.end - k.rewind + 20)}><Audio src={staticFile("sfx/rewind.wav")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};

export const frame: Beat = { id: "Frame", first: "Boss: I fought", lead: 0, Component: Scene };
