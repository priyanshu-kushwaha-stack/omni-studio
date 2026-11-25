// Beat "Zeros" (script.md ## [01:00] Zeros), look C.
//   - your street (plate street-day, parts/ZerosStreet.tsx): a short wide, you large at the left, a postman, a jogger,
//     a woman with a pram and far walkers, each with a dim 0, the jogger's 1; over your shoulder at the postman; close
//     on you: your face falls, then your eyebrows go up;
//   - the bus (plate bus-interior, parts/ZerosBus.tsx): heads over the seat backs, nearly all 0; a push down the aisle
//     to the mint man at the back on the phone, 9; close on him: "Nearly there, love." click, 10; close on you; his
//     feet come up, a red light through the far window;
//   - "Who's doing the lying?" office doors with lit glass; they swing open on the meeting room (plate meeting-lamp),
//     the 47 glowing over the boss under the lamp; medium, close, over your shoulder, close; he lifts his hand.
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { drift } from "@whatif/kit/stage/shots";
import type { Camera } from "@whatif/kit/stage/Stage";
import { camAt, current, GLOW, ramp, type Beat, type Shot } from "../shared";
import { Clicks, headWorld as hw } from "../parts/FrameKit";
import { aimAt, inPlate, NearYou } from "../parts/FrameLook";
import { StreetScene, streetPeople, YOU_ST, type YouFace } from "../parts/ZerosStreet";
import { BusScene, MAN_HEAD, YOU_BUS, YOU_BUS_R } from "../parts/ZerosBus";
import { BOSS_AT, MeetingPlate } from "../parts/FrameMeeting";
import { BOSS_POSE } from "../sets/MeetingRoom";

function times(shot: Shot) {
  const L = (p: string, s = 0) => shot.at(p, s);
  const busMan = [L("Bus man: Nearly there"), shot.end("Bus man: Nearly there")] as const;
  return {
    start: shot.from, over: L("A 2011 talk", 0.4), falls: L("A 2011 talk", 0.72), brows: L("A 2011 talk", 0.9),
    bus: L("The bus. Forty heads"), push: L("The bus. Forty heads", 0.6), busMan, tick: busMan[1] + 8, feet: busMan[1] + 40,
    who: L("Who's doing the lying"), doors: L("In one US survey"),
    mid: L("In one US survey", 0.33), close: L("In one US survey", 0.66), city: L("The city isn't lying"), office: L("The city isn't lying", 0.55),
    meeting: L("And he's about to run"), end: shot.to,
  };
}
type T = ReturnType<typeof times>;

// ---- the street ----

function streetShot(frame: number, k: T): { cam: Camera; r: number; view: "wide" | "over" | "you" } {
  const t = frame - k.start;
  const post = hw(streetPeople(frame, t).post);
  const you = hw(YOU_ST);
  if (frame < k.over) return { cam: camAt(frame, [[k.start, { x: 900, y: 600, zoom: 1.05 }], [k.over, { x: 880, y: 610, zoom: 1.15 }]]), r: 0, view: "wide" };
  if (frame < k.falls) return { cam: aimAt(post, { x: 1180, y: 520 }, 2.6 + 0.15 * ramp(frame, k.over, k.falls)), r: post.r, view: "over" };
  return { cam: camAt(frame, [[k.falls, aimAt(you, { x: 880, y: 600 }, 1.55)], [k.bus, aimAt(you, { x: 880, y: 620 }, 1.7)]]), r: you.r, view: "you" };
}

const Street: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const { cam, r, view } = streetShot(frame, k);
  const face: YouFace = frame < k.falls ? { brows: "raised", mouth: "smile", eyes: 1.1 }
    : frame < k.brows ? { brows: "sad", mouth: "frown", lids: 0.3 } : { brows: "raised", mouth: "o", eyes: 1.2 };
  return (
    <AbsoluteFill>
      <StreetScene frame={frame} t={frame - k.start} cam={inPlate(drift(cam, frame, "zst", 2))} r={r} you={face} showYou={view !== "over"} />
      {view === "over" && <NearYou x={260} y={780} r={240} />}
    </AbsoluteFill>
  );
};

// ---- the bus ----

type BusView = "wide" | "push" | "man" | "you" | "feet";

function busShot(frame: number, k: T): { view: BusView; cam: Camera; r: number } {
  const view = current<BusView>(frame, [[k.bus, "wide"], [k.push, "push"], [k.busMan[0], "man"], [k.tick + 6, "you"], [k.feet - 10, "feet"]]);
  const mr = 46 * 0.85;
  switch (view) {
    case "wide": return { view, cam: camAt(frame, [[k.bus, { x: 960, y: 560, zoom: 1.0 }], [k.push, { x: 990, y: 540, zoom: 1.2 }]]), r: 0 };
    case "push": return { view, cam: camAt(frame, [[k.push, aimAt(MAN_HEAD, { x: 1060, y: 560 }, 2.2)], [k.busMan[0], aimAt(MAN_HEAD, { x: 1000, y: 560 }, 3.0)]]), r: mr };
    case "man": return { view, cam: camAt(frame, [[k.busMan[0], aimAt(MAN_HEAD, { x: 960, y: 600 }, 4.4)], [k.tick + 6, aimAt(MAN_HEAD, { x: 960, y: 600 }, 4.7)]]), r: mr };
    case "you": return { view, cam: camAt(frame, [[k.tick + 6, aimAt(YOU_BUS, { x: 1000, y: 560 }, 1.9)], [k.feet - 10, aimAt(YOU_BUS, { x: 1000, y: 560 }, 2.0)]]), r: YOU_BUS_R };
    default: return { view, cam: camAt(frame, [[k.feet - 10, aimAt(MAN_HEAD, { x: 1180, y: 520 }, 3.2)], [k.who, aimAt(MAN_HEAD, { x: 1180, y: 520 }, 3.0)]]), r: mr };
  }
}

const Bus: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const { view, cam, r } = busShot(frame, k);
  return (
    <BusScene frame={frame} cam={inPlate(drift(cam, frame, "zbus", 2))} r={r} count={{ base: 9, ticks: [k.tick] }}
      man={{ talk: [k.busMan[0], k.busMan[1]], feet: ramp(frame, k.feet, k.feet + 12) }} stopped={frame >= k.busMan[0]}
      you={view === "you" ? { brows: "raised", mouth: frame < k.tick + 20 ? "o" : "flat" } : undefined} />
  );
};

// ---- the doors and the meeting room ----

const Doors: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const open = ramp(frame, k.doors, k.doors + 14);
  if (open >= 1) return null;
  const leaf = (side: -1 | 1) => (
    <div style={{ position: "absolute", top: 0, height: 1080, width: 960, left: side < 0 ? 0 : 960,
      background: "linear-gradient(90deg, #3a2a1f 0%, #5a4030 50%, #3a2a1f 100%)",
      transformOrigin: side < 0 ? "left center" : "right center", transform: `perspective(1800px) rotateY(${side * -80 * open}deg)`,
      boxShadow: "inset 0 0 120px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", left: 150, right: 150, top: 140, height: 520, borderRadius: 6, border: "10px solid #2a1d15",
        background: `radial-gradient(circle at ${side < 0 ? "100%" : "0%"} 30%, ${GLOW}cc 0%, #8a6a40aa 35%, #2a2230 90%)`, filter: "blur(1px)" }} />
      <div style={{ position: "absolute", top: 620, [side < 0 ? "right" : "left"]: 70, width: 26, height: 150, borderRadius: 12, background: "#c9a65a",
        boxShadow: "0 4px 10px rgba(0,0,0,.5)" }} />
    </div>
  );
  return <AbsoluteFill style={{ background: open > 0 ? "transparent" : "#120c08" }}>{leaf(-1)}{leaf(1)}</AbsoluteFill>;
};

const BOSS_HEAD = hw({ x: BOSS_AT.x, y: BOSS_AT.y, scale: BOSS_AT.scale, facing: -1, pose: BOSS_POSE });
type MeetView = "wide" | "mid" | "close" | "over" | "grin" | "lift";

function meetShot(frame: number, k: T): { view: MeetView; cam: Camera } {
  const view = current<MeetView>(frame, [[k.who, "wide"], [k.mid, "mid"], [k.close, "close"], [k.city, "over"], [k.office, "grin"], [k.meeting, "lift"]]);
  const a = (sx: number, sy: number, z: number) => aimAt(BOSS_HEAD, { x: sx, y: sy }, z);
  switch (view) {
    case "wide": return { view, cam: camAt(frame, [[k.doors, { x: 975, y: 570, zoom: 1.3 }], [k.mid, { x: 975, y: 560, zoom: 1.55 }]]) };
    case "mid": return { view, cam: camAt(frame, [[k.mid, a(960, 610, 2.3)], [k.close, a(960, 600, 2.6)]]) };
    case "close": return { view, cam: camAt(frame, [[k.close, a(1000, 540, 3.3)], [k.city, a(1000, 540, 3.55)]]) };
    case "over": return { view, cam: camAt(frame, [[k.city, a(1150, 480, 3.0)], [k.office, a(1140, 480, 3.15)]]) };
    case "grin": return { view, cam: camAt(frame, [[k.office, a(960, 540, 3.4)], [k.meeting, a(960, 540, 3.8)]]) };
    default: return { view, cam: camAt(frame, [[k.meeting, a(960, 600, 2.4)], [k.end, a(960, 600, 2.3)]]) };
  }
}

const Meeting: React.FC<{ frame: number; k: T }> = ({ frame, k }) => {
  const { view, cam } = meetShot(frame, k);
  const raise = ramp(frame, k.meeting, k.meeting + 14);
  const pose = { ...BOSS_POSE, armF: [28 + 60 * raise, -128 + 60 * raise] as [number, number] };
  return (
    <AbsoluteFill>
      <MeetingPlate cam={drift(cam, frame, "zmt", 1.5)} frame={frame}
        boss={{ pose, mouth: view === "grin" ? "smirk" : "smile", count: { base: 47 }, blink: (frame + 3) % 89 < 4 }} />
      {view === "over" && <NearYou x={300} y={800} />}
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot);
  const part = current(frame, [[k.start, "street"], [k.bus, "bus"], [k.who, "doors"]] as [number, string][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {part === "street" && <Street frame={frame} k={k} />}
      {part === "bus" && <Bus frame={frame} k={k} />}
      {part === "doors" && <Meeting frame={frame} k={k} />}
      {part === "doors" && <Doors frame={frame} k={k} />}
      <Clicks at={[k.tick]} volume={0.5} />
      <Sequence from={k.doors} durationInFrames={30}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.35} /></Sequence>
      <Sequence from={k.bus} durationInFrames={60}><Audio src={staticFile("sfx/bus.wav")} volume={0.25} /></Sequence>
    </AbsoluteFill>
  );
};

export const zeros: Beat = { id: "Zeros", first: "A 2011 talk", lead: 0.3, Component: Scene };
