// Beat "The Window" (script v5, ## The Window; lines 97-109): the peak and its answer.
//
//   97   your phone: top grade, top grade, top grade (stamps), the scholarship seal; your face (Window.Home).
//   98   "what you had backwards": your room from above, four desks teal; the pull-back to the whole country, a sea of
//        desks, the top four per cent scattered across it; the room's four go grey (Window.Map).
//   99   your sister asleep on the sofa, vest open, mouth open; you kneel and nudge her shoulder; one eye opens.
//   100  the phone up to that eye, "I made it."; +100; close on her: one eye open, the other still shut (Window.Home).
//   101  the academy at night, from the front: a hundred faces at their desks, phones lit, the windows black behind
//        them (Window.Room); the rival stands up before you can (Window.Close).   102  "Backs. Go on, weatherman."
//   103  the chairs come round in a ripple: a hundred backs; a glint runs along the glass ("every window is a mirror")
//        and the room comes up in it, a hundred faces looking your way; close on your eyes, down then up.
//   104  "the right way round": your smile; you say it: "I made it."
//   hold (9 s, the peak) the glass: a hundred cards snap open over a hundred reflected heads, mirrored digits, a slow
//        ghost on the flaps; the camera drifts in until the frame is reversed cards and reversed faces.
//   105  the glass close; "the one card you can't see": your own reflection at the back of the room, no card.
//   106  the cards in the glass, panning: nearly all teal, a few reds left (Min-jun among them).
//   107  his reflection's card; then him, turned round in his seat: -84, a grin and a thumbs up; then the look that
//        wants to beat you at everything.   108  the rival's reflection; him: -6, arms folded; you, beaming.
//   109  "Weather?" "Clear."
import { AbsoluteFill } from "remotion";
import { drift, insert } from "@whatif/kit/stage/shots";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { MeterSound, YourShoulder } from "../parts";
import { camAt, current, lineEnd, linear, ramp, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { FriendStill, RivalSix, RivalStands, Weather, YouSayIt, YourEyes, type CloseTimes } from "./Window.Close";
import { HomeShot, type HomeTimes } from "./Window.Home";
import { MapShot, type MapTimes } from "./Window.Map";
import { MJ_REFL, RoomShot, TH_REFL, YOUR_REFL, type RoomState, type Student } from "./Window.Room";

function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const home: HomeTimes = {
    rows: [at(97, 0.14), at(97, 0.34), at(97, 0.54)], seal: at(97, 0.74), face: at(97, 0.9),
    sofa: from(99), crouch: [from(99) + 6, at(99, 0.32)], nudge: [at(99, 0.52), at(99, 0.74)], eye: at(99, 0.82),
    say: lineEnd(clips, 99) + 2, snap: lineEnd(clips, 99) + 12, close: at(100, 0.3), smile: at(100, 0.75), end: from(101),
  };
  const map: MapTimes = {
    from: from(98), four: at(98, 0.14), pull: [at(98, 0.3), at(98, 0.6)], specks: [at(98, 0.4), at(98, 0.62)], war: at(98, 0.62),
    never: at(98, 0.82), end: from(99),
  };
  const peak = lineEnd(clips, 104);
  const close: CloseTimes = {
    stand: [at(101, 0.72), at(101, 0.88)], says: [from(102), lineEnd(clips, 102)], point: at(102, 0.4), backsEnd: lineEnd(clips, 102),
    eyes: [at(103, 0.92), lineEnd(clips, 103) + 6], dawn: at(104, 0.45), bubble: peak + 3,
    mj: at(107, 0.22), mjSnap: at(107, 0.25), mjCompete: at(107, 0.56), th: from(108) + 0, thSnap: at(108, 0.16), beam: at(108, 0.5),
    weather: [from(109), lineEnd(clips, 109)], clear: lineEnd(clips, 109) + 1, end,
  };
  return {
    start, end, home, map, close, peak,
    room: from(101),
    rival: at(101, 0.62), // "The rival stands up before you can"
    turn: lineEnd(clips, 102) + 2, // the chairs scrape round
    mirror: [at(103, 0.4), at(103, 0.56)] as const, // "every window is a mirror"
    glint: [at(103, 0.42), at(103, 0.64)] as const,
    faces: at(103, 0.66), // "A hundred faces in the glass"
    eyes: at(103, 0.88), // close on your eyes
    say: peak, // "I made it."
    hold: peak + 46, // the window: the hundred snaps
    snaps: peak + 56,
    holdEnd: from(105),
    yours: at(105, 0.58), // "The one card you can't see was always yours"
    teal: from(106),
    mjGlass: from(107),
    thGlass: from(108),
    weather: from(109),
  };
}
type T = ReturnType<typeof times>;

/** The room's state at a frame: who has turned, whose card is open in the glass, the rival standing, the light. */
function roomState(frame: number, k: T): RoomState {
  const turnAt = (s: Student) => k.turn + Math.round(s.turn * 20);
  return {
    frame,
    turnOf: (s) => linear(frame, turnAt(s), turnAt(s) + 8),
    snapOf: (s) => (frame < k.snaps ? null : k.snaps + Math.round(s.snap * 110)),
    stand: ramp(frame, k.close.stand[0], k.close.stand[1]) * (1 - ramp(frame, k.turn, k.turn + 8)),
    lit: ramp(frame, k.room + 6, k.room + 26),
    glint: frame >= k.glint[0] && frame < k.glint[1] ? (frame - k.glint[0]) / (k.glint[1] - k.glint[0]) : null,
    mirror: 0.3 + 0.7 * ramp(frame, k.mirror[0], k.mirror[1]),
  };
}

const glassOn = (s: Student, zoom: number): Camera => insert(s.rx, s.ry - s.rr * 1.6, zoom);

/** The room's camera for each room shot. */
function roomCam(frame: number, k: T, shot: string): Camera {
  switch (shot) {
    case "room":
      return camAt(frame, [[k.room, { x: 960, y: 600, zoom: 0.95 }], [k.rival, { x: 960, y: 585, zoom: 1.0 }]]);
    case "backs":
      return camAt(frame, [[k.turn - 2, { x: 960, y: 600, zoom: 0.98 }], [k.mirror[0], { x: 960, y: 520, zoom: 1.12 }],
        [k.faces, { x: 960, y: 420, zoom: 1.35 }], [k.eyes, { x: 960, y: 380, zoom: 1.6 }]]);
    case "hold":
      return camAt(frame, [[k.hold, { x: 960, y: 430, zoom: 1.0 }], [k.snaps + 30, { x: 960, y: 380, zoom: 1.3 }],
        [k.holdEnd - 10, { x: 960, y: 300, zoom: 3.0 }], [k.yours - 4, { x: 960, y: 290, zoom: 3.3 }], [k.yours + 14, { x: YOUR_REFL.x, y: YOUR_REFL.y, zoom: 6 }],
        [k.teal, { x: YOUR_REFL.x, y: YOUR_REFL.y - 4, zoom: 6.4 }]]);
    case "teal":
      return camAt(frame, [[k.teal, { x: 560, y: 330, zoom: 2.6 }], [k.mjGlass, { x: 1360, y: 320, zoom: 2.7 }]]);
    case "mjGlass":
      return camAt(frame, [[k.mjGlass, glassOn(MJ_REFL, 5.2)], [k.close.mj, glassOn(MJ_REFL, 5.8)]]);
    default:
      return camAt(frame, [[k.thGlass, glassOn(TH_REFL, 5.2)], [Math.max(k.close.th, k.thGlass + 12), glassOn(TH_REFL, 5.8)]]);
  }
}

const Window: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot.clips, shot.from, shot.to);
  const mood: MoodName = moodAt(shot);
  const c = k.close;
  const name = current(frame, [[k.start, "home"], [k.map.from, "map"], [k.home.sofa, "home"], [k.room, "room"], [k.rival, "rival"], [k.turn - 2, "backs"],
    [k.eyes, "eyes"], [k.say, "say"], [k.hold, "hold"], [k.teal, "teal"], [k.mjGlass, "mjGlass"], [c.mj, "mj"], [k.thGlass, "thGlass"],
    [c.thSnap - 6, "th"], [k.weather, "weather"]]);
  let picture: React.ReactNode;
  if (name === "home") picture = <HomeShot frame={frame} k={k.home} mood={mood} />;
  else if (name === "map") picture = <MapShot frame={frame} k={k.map} mood={mood} />;
  else if (name === "rival") picture = <RivalStands frame={frame} k={c} mood={mood} from={k.rival} to={k.turn} />;
  else if (name === "eyes") picture = <YourEyes frame={frame} k={c} mood={mood} from={k.eyes} to={k.say} />;
  else if (name === "say") picture = <YouSayIt frame={frame} k={c} mood={mood} from={k.say} to={k.hold} />;
  else if (name === "mj") picture = <FriendStill frame={frame} k={c} mood={mood} from={c.mj} to={k.thGlass} />;
  else if (name === "th") picture = <RivalSix frame={frame} k={c} mood={mood} from={c.thSnap - 6} to={k.weather} />;
  else if (name === "weather") picture = <Weather frame={frame} k={c} mood={mood} from={k.weather} to={k.end} />;
  else {
    const cam = roomCam(frame, k, name);
    const shoulder = (name === "backs") || (name === "hold" && cam.zoom < 1.5);
    picture = (
      <AbsoluteFill>
        <RoomShot cam={drift(cam, frame, "w-room", name === "room" || name === "backs" ? 3 : 1.2)} st={roomState(frame, k)} mood={mood} />
        {shoulder && <YourShoulder side="left" />}
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <MeterSound at={k.home.snap} soft />
      {/* the hundred snaps in the glass: a few, staggered, each quieter (sound.ts lays the floor and the held note) */}
      {[0, 14, 29, 47, 68, 92, 116].map((d, i) => <MeterSound key={i} at={k.snaps + d} volume={0.85 - i * 0.09} />)}
      <MeterSound at={c.mjSnap} volume={0.8} />
      <MeterSound at={c.thSnap} volume={0.7} />
    </AbsoluteFill>
  );
};

export const windowBeat: Beat = { id: "Window", firstLine: 97, Component: Window };
