// Beat "The Window" (script v7, ## The Window; lines 97-109): the peak and its answer. Rebuilt on the outside review
// of cut v6 (#2, the window peak): the backs are plain backs in the foreground, the faces are unmistakably IN the
// glass (tint, double image, sheen, mullions, a phone screen we only see backwards), the cards in it are mirrored, the
// camera never jumps between panes (one continuous path from "I made it." to Min-jun), a teal wave turns the old reds
// as it pans, and the two exceptions click crisp on their spoken numbers.
//
//   97   your phone: TOP GRADE x1, x2, x3 stamping on the words, the scholarship seal; your face (Window.Home).
//   98   your room from above, four desks teal ("four places in a room"); the pull back to the whole country, ALL OF
//        SOUTH KOREA, the top four per cent scattered; then straight back down to the room ("Four seats, a hundred
//        backs, six weeks of war"): the walls flush red, the four go grey ("never in the room") (Window.Map).
//   99   your sister asleep, breathing, a glove slipping off her hand; the nudge; one eye.   100  +100, crisp on "100".
//   101  the academy, the class at their desks facing you; "Everyone has a result": the front rows' phones come up with
//        their badges; the rival stands (Window.Close).   102  "Backs!": the room comes round in a one-second ripple,
//        the rival last, still on his feet: "Go on, weatherman. Say it again."
//   103  he turns too; a hundred backs; a girl at the back holds her phone up to the glass; the glint ("every window is
//        a mirror"); the faces come up in the glass; close on you: eyes down, up, it lands, the smile, the phone (104).
//   hold (the peak, wordless) the glass: "I made it." over your shoulder; within half a second the first card snaps,
//        then the cascade, mirrored; the camera dollies in through the backs into the glass, the last rows clicking.
//   105  up the rows to your own reflection at the back: no card. You look up for it. Nothing.
//   106  the pan along the glass, and the teal wave a step ahead of it: the reds flip through zero to teal.
//   107  the pan arrives on Min-jun's reflection: his flaps riffle and click back to -84 on the word; then him, out of
//        his seat: the hug, his phone against yours, the finger, nose to nose, the clap (Window.Close).
//   108  the rival in the glass: his card snaps, -6 on "six"; on "practically a handshake" one grudging nod in the glass,
//        and your shoulder nods back.   109  "Weather?" "Clear."
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { drift } from "@whatif/kit/stage/shots";
import type { MoodName } from "@whatif/kit/stage/moods";
import type { Camera } from "@whatif/kit/stage/Stage";
import type { Clip } from "@whatif/kit/timeline";
import { Bubble, FLAP_FRAMES, MeterSound, YourShoulder } from "../parts";
import { camAt, current, lineEnd, linear, mix, ramp, type Beat, type Shot } from "../shared";
import { moodAt } from "./WhosCrimson.Common";
import { FriendHug, RivalStands, Weather, YourEyes, type CloseTimes } from "./Window.Close";
import { flap, opened, snapFor, type Reading } from "./Window.Glass";
import { HomeShot, type HomeTimes } from "./Window.Home";
import { MapShot, type MapTimes } from "./Window.Map";
import { MJ_REFL, RoomShot, STUDENTS, TH_REFL, YOUR_REFL, type RoomState, type Student } from "./Window.Room";

function times(clips: Clip[], start: number, end: number) {
  const from = (i: number) => clips[i].from;
  const at = (i: number, p: number) => Math.round(clips[i].from + clips[i].frames * p);
  const home: HomeTimes = {
    rows: [at(97, 0.18), at(97, 0.38), at(97, 0.57)], seal: at(97, 0.76), face: at(97, 0.9),
    sofa: from(99), glove: [at(99, 0.3), at(99, 0.55)], crouch: [from(99) + 6, at(99, 0.32)], nudge: [at(99, 0.57), at(99, 0.74)], eye: at(99, 0.78),
    say: lineEnd(clips, 99) + 1, snap: snapFor(at(100, 0.13)), close: at(100, 0.39), smile: at(100, 0.75), end: from(101),
  };
  const map: MapTimes = {
    from: from(98), four: at(98, 0.21), pull: [at(98, 0.32), at(98, 0.58)], specks: [at(98, 0.4), at(98, 0.6)], label: at(98, 0.5),
    dive: [at(98, 0.63), at(98, 0.84)], war: at(98, 0.79), never: at(98, 0.86), end: from(99),
  };
  const peak = lineEnd(clips, 104);
  const hugFrom = at(107, 0.36);
  const close: CloseTimes = {
    stand: [at(101, 0.64), at(101, 0.76)], says: [from(102), lineEnd(clips, 102)], point: at(102, 0.46),
    eyes: { down: at(103, 0.86), up: from(104), know: at(104, 0.33), smile: at(104, 0.66), phone: at(104, 0.84) },
    hug: { from: hugFrom, apart: at(107, 0.47), point: at(107, 0.6), glare: at(107, 0.73), clap: at(107, 0.87), card: hugFrom - 40 },
    weather: [from(109), lineEnd(clips, 109)], clear: lineEnd(clips, 109) + 1, end,
  };
  return {
    start, end, home, map, close, peak,
    room: from(101),
    phones: at(101, 0.29), // "Everyone has a result."
    rival: at(101, 0.56), // "The rival stands up before you can"
    scrape: from(102), // "Backs!": the room comes round
    rival2: at(102, 0.36), // "Go on, weatherman. Say it again."
    backs: from(103), // "A hundred backs": he turns last
    phoneUp: [at(103, 0.08), at(103, 0.22)] as const,
    mirror: [at(103, 0.46), at(103, 0.62)] as const, // "every window is a mirror"
    glint: [at(103, 0.47), at(103, 0.66)] as const,
    faces: at(103, 0.66), // "A hundred faces in the glass"
    eyes: at(103, 0.86), // close on your eyes
    bubble: peak + 2, // "I made it."
    snaps: peak + 12, // the first card in the glass, within half a second
    b105: from(105),
    up: at(105, 0.4),
    yours: at(105, 0.66), // "The one card you can't see was always yours"
    yoursEnd: lineEnd(clips, 105),
    pan: [at(106, 0.16), at(106, 0.95)] as const,
    wave: [at(106, 0.2), at(106, 0.9)] as const, // "nearly all teal ... the race is over"
    mjGlass: from(107),
    mjLand: at(107, 0.18) + 3, // "Minus eighty-four."
    thGlass: from(108),
    thLand: at(108, 0.28) + 2, // "minus six."
    nod: [at(108, 0.71), at(108, 0.86)] as const, // "practically a handshake"
    weather: from(109),
  };
}
type T = ReturnType<typeof times>;

/** When each card opens in the glass: a cascade out from the middle of the room, the far rows last, a few stragglers
 *  still clicking into line 105. The rival's waits for line 108. */
function snapAt(s: Student, k: T): number | null {
  if (s.who === "taeho") return snapFor(k.thLand);
  const d = Math.min(1, Math.abs(s.rx - 960) / 760) * 0.78 + ((5 - s.k) / 5) * 0.22;
  const late = s.snap > 0.93 ? 70 + Math.round((s.snap - 0.93) * 1800) : 0;
  return k.snaps + Math.round(d * 150 + s.snap * 8) + late;
}

/** Where the teal wave is at a frame (world x). */
const waveX = (frame: number, k: T) => mix(250, 1760, linear(frame, k.wave[0], k.wave[1]));
const waveAt = (s: Student, k: T) => Math.round(mix(k.wave[0], k.wave[1], (s.rx - 250) / 1510));

function readingOf(frame: number, s: Student, at: number, k: T): Reading {
  if (s.who === "minjun" && frame >= k.mjGlass) return flap(frame, k.mjGlass, -84, -84, k.mjLand - k.mjGlass);
  const base = opened(frame, at, s.value);
  if (s.after === null) return base;
  return frame < waveAt(s, k) ? base : flap(frame, waveAt(s, k), s.value, s.after, 16);
}

/** The room's state at a frame. */
function roomState(frame: number, k: T): RoomState {
  const turnAt = (s: Student) => (s.who === "taeho" ? k.backs + 3 : k.scrape + 3 + Math.round((s.i / 16) * 16 + s.k * 1.5 + s.turn * 4));
  return {
    frame,
    turnOf: (s) => linear(frame, turnAt(s), turnAt(s) + 7),
    cardOf: (s) => {
      if (frame < k.peak) return null;
      const at = snapAt(s, k);
      return at === null || frame < at ? null : { at, read: readingOf(frame, s, at, k) };
    },
    stand: ramp(frame, k.close.stand[0], k.close.stand[1]) * (1 - ramp(frame, k.backs + 2, k.backs + 10)),
    lit: ramp(frame, k.room + 6, k.room + 26),
    raise: ramp(frame, k.phones, k.phones + 10),
    phoneUp: ramp(frame, k.phoneUp[0], k.phoneUp[1]),
    glint: frame >= k.glint[0] && frame < k.glint[1] ? (frame - k.glint[0]) / (k.glint[1] - k.glint[0]) : null,
    mirror: 0.3 + 0.7 * ramp(frame, k.mirror[0], k.mirror[1]),
    youUp: ramp(frame, k.yours + 8, k.yours + 18) * (1 - ramp(frame, k.yoursEnd, k.yoursEnd + 8)),
    thNod: linear(frame, k.nod[0], k.nod[1]),
  };
}

const glassOn = (s: { rx: number; ry: number; rr: number }, zoom: number): Camera => ({ x: s.rx, y: s.ry - s.rr * 1.3, zoom });

/** The room's camera: the wide room (101), the phones (101), the scrape (102), the backs and the glass (103), and the
 *  one continuous path through the peak to Min-jun's reflection (104-107); the rival in the glass (108). */
function roomCam(frame: number, k: T, shot: string): Camera {
  switch (shot) {
    case "room":
      return camAt(frame, [[k.room, { x: 960, y: 600, zoom: 0.95 }], [k.phones, { x: 960, y: 585, zoom: 1.0 }]]);
    case "phones":
      return camAt(frame, [[k.phones, { x: 760, y: 820, zoom: 2.0 }], [k.rival, { x: 820, y: 805, zoom: 2.2 }]]);
    case "scrape":
      return camAt(frame, [[k.scrape, { x: 960, y: 590, zoom: 0.98 }], [k.rival2, { x: 960, y: 575, zoom: 1.04 }]]);
    case "backs":
      return camAt(frame, [[k.backs, { x: 960, y: 560, zoom: 0.98 }], [k.mirror[0], { x: 960, y: 500, zoom: 1.08 }],
        [k.faces, { x: 960, y: 440, zoom: 1.3 }], [k.eyes, { x: 960, y: 410, zoom: 1.45 }]]);
    case "peak":
      return camAt(frame, [[k.peak, { x: 960, y: 470, zoom: 1.0 }], [k.peak + 100, { x: 965, y: 410, zoom: 1.45 }], [k.b105, { x: 990, y: 350, zoom: 1.85 }],
        [k.up, { x: 1040, y: 270, zoom: 2.2 }], [k.yours, { x: YOUR_REFL.x, y: 150, zoom: 2.9 }], [k.yoursEnd, { x: YOUR_REFL.x, y: 140, zoom: 3.0 }],
        [k.pan[0], { x: 690, y: 420, zoom: 2.2 }], [k.pan[1], { x: 1200, y: 410, zoom: 2.3 }], [k.mjGlass + 8, glassOn(MJ_REFL, 2.5)],
        [k.mjLand, glassOn(MJ_REFL, 2.65)], [k.close.hug.from, glassOn(MJ_REFL, 2.75)]]);
    default:
      return camAt(frame, [[k.thGlass, glassOn(TH_REFL, 2.45)], [k.thLand, glassOn(TH_REFL, 2.6)], [k.weather, glassOn(TH_REFL, 2.7)]]);
  }
}

const Window: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { frame } = shot;
  const k = times(shot.clips, shot.from, shot.to);
  const mood: MoodName = moodAt(shot);
  const c = k.close;
  const name = current(frame, [[k.start, "home"], [k.map.from, "map"], [k.home.sofa, "home"], [k.room, "room"], [k.phones, "phones"], [k.rival, "rival"],
    [k.scrape, "scrape"], [k.rival2, "rival"], [k.backs, "backs"], [k.eyes, "eyes"], [k.peak, "peak"], [c.hug.from, "hug"], [k.thGlass, "th"],
    [k.weather, "weather"]]);
  let picture: React.ReactNode;
  if (name === "home") picture = <HomeShot frame={frame} k={k.home} mood={mood} />;
  else if (name === "map") picture = <MapShot frame={frame} k={k.map} mood={mood} />;
  else if (name === "rival") picture = <RivalStands frame={frame} k={c} mood={mood} from={frame < k.scrape ? k.rival : k.rival2} to={frame < k.scrape ? k.scrape : k.backs} />;
  else if (name === "eyes") picture = <YourEyes frame={frame} k={c} mood={mood} from={k.eyes} to={k.peak} />;
  else if (name === "hug") picture = <FriendHug frame={frame} k={c} mood={mood} from={c.hug.from} to={k.thGlass} />;
  else if (name === "weather") picture = <Weather frame={frame} k={c} mood={mood} from={k.weather} to={k.end} />;
  else {
    const cam = roomCam(frame, k, name);
    const shoulder = name === "backs" || name === "scrape" || name === "th" || (name === "peak" && cam.zoom < 1.7);
    const nod = Math.sin(Math.PI * ramp(frame, k.nod[1] - 2, k.nod[1] + 12)) * 26;
    picture = (
      <AbsoluteFill>
        <RoomShot cam={drift(cam, frame, "w-room", name === "peak" ? 1 : 2.5)} st={roomState(frame, k)} mood={mood} />
        {shoulder && <AbsoluteFill style={{ transform: `translateY(${name === "th" ? nod : 0}px)` }}><YourShoulder side="left" /></AbsoluteFill>}
        {name === "peak" && frame < k.snaps + 50 && (
          <AbsoluteFill><svg width={1920} height={1080}><Bubble frame={frame} at={k.bubble} x={150} y={600} text="I made it." size={54} /></svg></AbsoluteFill>
        )}
      </AbsoluteFill>
    );
  }
  const cascade = STUDENTS.map((s) => snapAt(s, k)).filter((f): f is number => f !== null && f < k.thGlass).sort((a, b) => a - b);
  // one snap sound per eight cards in the cascade, quieter as it goes (sound.ts lays the floor and the held note)
  const snapSounds = cascade.filter((_, i) => i % 8 === 0);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {picture}
      <MeterSound at={k.home.snap} soft />
      {snapSounds.map((f, i) => <MeterSound key={i} at={f} volume={Math.max(0.3, 0.9 - i * 0.05)} />)}
      {/* the teal wave: the flaps running down the room */}
      {[0, 0.25, 0.5, 0.75].map((p) => (
        <Sequence key={p} from={Math.round(mix(k.wave[0], k.wave[1], p))} durationInFrames={FLAP_FRAMES + 6}>
          <Audio src={staticFile("sfx/flutter.wav")} volume={0.45} />
        </Sequence>
      ))}
      {/* Min-jun's riffle back to -84: flutter, then the click on the word */}
      <Sequence from={k.mjGlass} durationInFrames={k.mjLand - k.mjGlass}><Audio src={staticFile("sfx/flutter.wav")} volume={0.6} /></Sequence>
      <Sequence from={k.mjLand} durationInFrames={10}><Audio src={staticFile("sfx/click.wav")} volume={0.9} /></Sequence>
      <MeterSound at={snapFor(k.thLand)} volume={0.8} />
    </AbsoluteFill>
  );
};

export const windowBeat: Beat = { id: "Window", firstLine: 97, Component: Window };
