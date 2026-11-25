// Beat "The Frame" (script.md ## [00:00] The Frame). The first frame is the thumbnail (brand/thumbs/lies): the meeting
// room in the dark, the boss grinning with a hand on his heart under a glowing 47, you large at the left with your mug.
//   - a soft click inside 0.5 s: the 47 pops;
//   - "Boss: I fought for every one of these bonuses." he talks, his raised hand works; your mug rises;
//   - the hold: click, the 47 flashes and settles as 48; your mug stops in the air; bubble "Forty-eight?";
//   - "What if you saw how many lies everyone told?" a slow pull back; then a paper flip and a tape rewind: the 48 ticks
//     down, the blinds go up, the room runs backwards into morning light. (THAT MORNING is stamped as the Click opens.)
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { lerpPose, STAND } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { FONT } from "@whatif/kit/fonts";
import { PAPER } from "@whatif/kit/theme";
import { BOSS, camAt, GLOW, HERO, linear, ramp, type Beat, type Shot } from "../shared";
import { Counter } from "../parts/Counter";
import { Bubble, Clicks, handWorld, headWorld, HeroMug, Lanyard, onScreen, talk, type Placed } from "../parts/FrameKit";
import { BOSS_POSE, meetingRoom, MeetingScene, MUG_POSE } from "../sets/MeetingRoom";

const S = meetingRoom.spots;
const THUMB = meetingRoom.cameras.thumb;

function times(shot: Shot) {
  const line = shot.at("Boss: I fought");
  const lineEnd = shot.end("Boss: I fought");
  const click = lineEnd + 12;
  const what = shot.at("What if you saw");
  const flip = shot.at("What if you saw", 0.1);
  return { line, lineEnd, click, what, flip, rewind: flip + 12, end: shot.to };
}

/** The room at a frame: the thumbnail's composition, played. `rw` 0..1 is how far the rewind has run. */
export const FramePicture: React.FC<{ frame: number; shot: Shot }> = ({ frame, shot }) => {
  const k = times(shot);
  const rw = linear(frame, k.rewind, k.end);
  // the boss: the thumbnail pose, his raised hand working while he talks; in the rewind he backs off and drops it
  const gesture = frame >= k.line && frame < k.lineEnd ? Math.sin((frame - k.line) * 0.22) * 10 : 0;
  const bossPose = lerpPose({ ...BOSS_POSE, armB: [BOSS_POSE.armB[0] + gesture, BOSS_POSE.armB[1] - gesture * 0.5] }, STAND, rw);
  const boss: Placed = { x: S.boss.x + rw * 160, y: S.boss.y, scale: S.boss.scale, facing: -1, pose: bossPose };
  const bh = headWorld(boss);
  // the 47 pops at once, 48 on the click; the rewind runs it down to 0
  const counterY = bh.y - 137.5;
  const value = rw > 0 ? Math.round(48 * (1 - rw)) : null;
  // you: the mug rises through his line and stops in the air on the click
  const rise = ramp(frame, k.line, k.click);
  const mugPose = lerpPose({ ...MUG_POSE, armF: [28, 96] }, MUG_POSE, frame < 12 ? 1 : rise);
  const youPose = lerpPose(mugPose, { ...MUG_POSE, armF: [20, 60] }, rw);
  const you: Placed = { x: S.you.x, y: S.you.y, scale: S.you.scale, facing: 1, pose: youPose };
  const hand = handWorld(you);
  const stunned = frame < 14 || frame >= k.click;
  const face = stunned
    ? { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.3 }
    : { brows: "flat" as const, lids: 0.35, mouth: "flat" as const, eyes: 1.05 };
  const yh = headWorld(you);
  const lights = [{ x: bh.x, y: counterY, r: 200, color: GLOW, strength: 0.55 * (1 - rw), moods: ["lamp" as const] }];
  const cam = frameCam(frame, k);
  const room = (mood: "lamp" | "morning", blinds: number) => (
    <MeetingScene cam={cam} mood={mood} frame={frame} options={{ blinds, pool: 1 - rw }} lights={mood === "lamp" ? lights : []}
      actors={
        <>
          <Figure x={boss.x} y={boss.y} scale={boss.scale} facing={-1} pose={boss.pose} head={BOSS.head} coat={BOSS.coat} tie={BOSS.tie}
            brows="none" lids={0} mouth={talk(frame, k.line, k.lineEnd, "open")} eyes={1.05} look={{ x: 1, y: 0.1 }} time={frame} />
          <Counter x={bh.x} y={counterY} base={value ?? 46} ticks={value === null ? [0, k.click] : []} frame={frame} size={96} id="frame-47" />
          <defs>
            <radialGradient id="frame-shade" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.4" stopColor="#05060a" stopOpacity={0.9 * (mood === "lamp" ? 1 : 0.3)} />
              <stop offset="1" stopColor="#05060a" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx={yh.x} cy={yh.y} r={yh.r * 1.9} fill="url(#frame-shade)" />
          <Figure x={you.x} y={you.y} scale={you.scale} pose={you.pose} head={HERO.head} scarf={HERO.scarf} tuft flow={0.15} time={3 + frame * 0.3}
            look={{ x: 0.85, y: -0.35 }} blink={!stunned && (frame + 11) % 97 < 4} {...face} />
          <Lanyard f={you} />
          <HeroMug x={hand.x + 20 / 2.4} y={hand.y + 10 / 2.4} scale={you.scale} />
        </>
      } />
  );
  return (
    <AbsoluteFill>
      {room("lamp", 0)}
      {rw > 0 && <AbsoluteFill style={{ opacity: rw }}>{room("morning", rw)}</AbsoluteFill>}
    </AbsoluteFill>
  );
};

function frameCam(frame: number, k: ReturnType<typeof times>): Camera {
  const push = { x: THUMB.x + 30, y: THUMB.y - 6, zoom: 2.56 };
  const c = camAt(frame, [
    [0, THUMB], [k.lineEnd, push], [k.click, { x: push.x + 10, y: push.y - 4, zoom: 2.62 }],
    [k.what, { x: push.x + 10, y: push.y - 4, zoom: 2.62 }], [k.flip, { x: THUMB.x - 20, y: THUMB.y + 10, zoom: 2.3 }],
    [k.end, { x: 1000, y: 520, zoom: 1.5 }],
  ]);
  return frame < 20 ? c : drift(c, frame, "frame", 1.2);
}

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
  const you = { x: meetingRoom.spots.you.x, y: meetingRoom.spots.you.y, scale: meetingRoom.spots.you.scale, facing: 1 as const, pose: MUG_POSE };
  const head = onScreen(frameCam(frame, k), headWorld(you));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `perspective(2400px) rotateY(${turn}deg)`, background: PAPER }}>
        <FramePicture frame={frame} shot={shot} />
        <Rewind frame={frame} from={k.rewind} to={k.end} />
      </AbsoluteFill>
      <Bubble frame={frame} at={k.click + 14} until={k.flip} x={head.x + 120} y={head.y - 200} text="Forty-eight?" size={56} />
      <Clicks at={[2, k.click]} volume={0.55} />
      <Sequence from={k.flip} durationInFrames={24}><Audio src={staticFile("sfx/flip.wav")} volume={0.5} /></Sequence>
      <Sequence from={k.rewind} durationInFrames={Math.max(1, k.end - k.rewind + 20)}><Audio src={staticFile("sfx/rewind.wav")} volume={0.45} /></Sequence>
    </AbsoluteFill>
  );
};

export const frame: Beat = { id: "Frame", first: "Boss: I fought", lead: 0, Component: Scene };
