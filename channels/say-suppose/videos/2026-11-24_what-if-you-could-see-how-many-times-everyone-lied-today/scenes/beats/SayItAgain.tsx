// Beat "Say It Again" (script.md ## [02:05]). Look C (owner, 2026-11-25): painted plates, our cast, close-ups.
// Lunch hour, two garages (plate `garage`, the second flipped so it reads as another place: mechanic one at 0 over your
// shoulder, close on his zero; mechanic two at 4, click to 5 on "gearbox", close on you and your "Say it again?", close
// on his silent fish mouth, you walk out with your money), then the restaurant at dusk (parts/SayItAgain.Diner.tsx).
// Every motion hangs off the spoken lines (shot.at / shot.end).
import { AbsoluteFill } from "remotion";
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose, type Pose } from "@whatif/kit/rig/pose";
import { drift } from "@whatif/kit/stage/shots";
import { current, HERO, mix, ramp, type Beat, type Shot } from "../shared";
import { Bubble, onScreen } from "../parts/FrameKit";
import { PlateScene } from "../parts/Plate";
import { Body, headOf, talk } from "../parts/SayItAgain.Kit";
import { counterLight, FgShoulder, onHead, shotAt, type Shot as Cam } from "../parts/SayItAgain.LookC";
import { PhoneInsert, Restaurant } from "../parts/SayItAgain.Diner";
import { GARAGE, Rag, Wallet } from "../sets/SayItAgain";

const MECH = { head: "#f0b48e", coat: "#3d6fb0" } as const;

function cues(shot: Shot) {
  const { at, end } = shot;
  const gearE = end("Mechanic two:");
  const dusk = at("Dusk. A first date");
  const hold = (p: number) => Math.round(gearE + (dusk - gearE) * p);
  const sixE = end("Date: Six one");
  const manE = end("Man diner:");
  return {
    from: shot.from, end: shot.to,
    lunch: at("Lunch."), brakes: at("Mechanic one:"), brakesE: end("Mechanic one:"), zero: at("Zero."),
    second: at("Second opinion"), gear: at("Mechanic two:"), gearE,
    // the script's clicks (clickData.ts): 0.2 s after "gearbox", after "Six one"; 0.2 and 0.65 s after "Me neither"
    click5: gearE + 6, tilt: hold(0.12), fish: hold(0.42), leave: hold(0.66),
    dusk, photo: at("Dusk. A first date", 0.42), chair: at("Dusk. A first date", 0.78),
    six: at("Date: Six one"), sixE, click1: sixE + 6, lookPhoto: sixE + 10, lookHim: sixE + 20, straight: sixE + 34, lookOne: sixE + 44,
    woman: at("Woman diner:"), womanE: end("Woman diner:"), man: at("Man diner:"), manE,
    clickW: manE + 6, clickM: manE + 20, clink: manE + 28, watch: manE + 40, fine: at("Dinner's fine"),
  };
}
export type SayCues = ReturnType<typeof cues>;

// ------------------------------------------------------------------------------------------------ the garages

/** Garage two is the same plate flipped: every x mirrors. */
const side = (x: number, second: boolean) => (second ? 1920 - x : x);

function garageShots(k: SayCues, second: boolean): Cam[] {
  const m = GARAGE.mech;
  const mh = headOf(side(m.x, second), m.y, m.scale);
  const yh = headOf(side(GARAGE.you.x, second), GARAGE.you.y, GARAGE.you.scale);
  const d = second ? -1 : 1;
  if (!second) {
    return [
      { at: k.from, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 940, y: 560, zoom: 1.08 } },
      { at: k.brakes - 8, cam: onHead(mh, 0.15, 170), to: onHead(mh, 0.16, 170), name: "ots" },
      { at: k.zero - 4, cam: onHead(mh, 0.17, 40, 150), to: onHead(mh, 0.18, 40, 150), name: "zero" },
    ];
  }
  return [
    { at: k.second - 2, cam: { x: 960, y: 560, zoom: 1.02 }, to: { x: 980, y: 560, zoom: 1.08 } },
    { at: k.gear - 4, cam: onHead(mh, 0.15, 170 * d), to: onHead(mh, 0.16, 170 * d), name: "ots" },
    { at: k.click5 - 6, cam: onHead(mh, 0.17, 0, 160), to: onHead(mh, 0.18, 0, 160), name: "tick" },
    { at: k.tilt, cam: onHead(yh, 0.17, 170), to: onHead(yh, 0.18, 170), name: "you" },
    { at: k.fish, cam: onHead(mh, 0.17, -140, 120), to: onHead(mh, 0.18, -140, 120), name: "fish" },
    { at: k.leave, cam: { x: 1000, y: 560, zoom: 1.12 }, to: { x: 1040, y: 560, zoom: 1.06 } },
  ];
}

const Garage: React.FC<{ frame: number; k: SayCues; second: boolean }> = ({ frame, k, second }) => {
  const m = GARAGE.mech;
  const y = GARAGE.you;
  const startAt = second ? k.second : k.lunch - 8;
  const inT = ramp(frame, startAt, startAt + 50);
  const outT = second ? ramp(frame, k.leave, k.dusk - 4) : 0;
  const walking = (frame >= startAt && frame < startAt + 50) || (second && frame >= k.leave && frame < k.dusk - 4);
  const leaving = second && frame >= k.leave;
  const yx = leaving ? mix(y.x, -300, outT) : mix(-240, y.x, inT);
  const wipe = Math.sin(frame / 5) * 14;
  const mechPose: Pose = { ...STAND, armF: [55 + wipe, 70], armB: [40 - wipe, 80] };
  const talking = second ? [k.gear, k.gearE] : [k.brakes, k.brakesE];
  const fish = second && frame >= k.fish && frame < k.leave + 20;
  const mechMouth = fish ? (Math.floor((frame - k.fish) / 7) % 2 ? "o" : "flat") : talk(frame, talking[0], talking[1], "smile");
  const tilt = second && frame >= k.tilt ? mix(0, -16, ramp(frame, k.tilt, k.tilt + 10)) : 0;
  const youPose: Pose = walking ? walkPose(frame / 4) : { ...STAND, tilt, armF: second && frame >= k.fish ? [40, 30] : [9, 10] };
  const looksUp = second && frame >= k.click5 && frame < k.leave;
  const s = shotAt(frame, garageShots(k, second), second ? k.dusk : k.second);
  const fx = side(m.x, second);
  const yxs = side(yx, second);
  const mf = (second ? 1 : -1) as 1 | -1;
  const youFacing = ((leaving ? -1 : 1) * (second ? -1 : 1)) as 1 | -1;
  const yh = headOf(yxs, y.y, y.scale, youPose, youFacing);
  const bubble = onScreen(s.cam, { x: yh.x - yh.r * 0.5, y: yh.y - yh.r * 1.1 });
  return (
    <AbsoluteFill>
      <PlateScene plate="garage" flip={second} cam={drift(s.cam, frame, second ? "g2" : "g1", 3)} mood="day" rimFrom={second ? "left" : "right"}
        lights={[counterLight(headOf(fx, m.y, m.scale), "day", 0.3)]}
        actors={
          <>
            <Body x={fx} y={m.y} scale={m.scale} facing={mf} pose={mechPose} head={MECH.head} coat={MECH.coat} frame={frame}
              id={second ? "mech2" : "mech1"} count={second ? { base: 4, ticks: [k.click5] } : { base: 0 }} size={34 * m.scale}
              held={<Rag />} mouth={mechMouth} brows={fish ? "worry" : "none"} look={{ x: 0.9, y: 0.05 }} seed={2} />
            {!["ots", "zero", "tick", "fish"].includes(s.name) && (
              <Figure x={yxs} y={y.y} scale={y.scale} facing={youFacing} pose={youPose} {...HERO} time={frame}
                mouth={second && frame >= k.fish ? "flat" : "none"} brows={looksUp ? "raised" : second && frame >= k.fish ? "flat" : "none"}
                lids={second && frame >= k.fish && frame < k.leave ? 0.4 : 0} look={looksUp ? { x: 0.7, y: -0.9 } : { x: 0.9, y: 0 }}
                held={second && frame >= k.fish ? <Wallet /> : undefined} />
            )}
          </>
        } />
      {s.name === "ots" && <FgShoulder x={second ? 1640 : 280} head={HERO.head} scarf={HERO.scarf} tuft />}
      {second && <Bubble frame={frame} at={k.tilt + 4} until={k.fish} x={bubble.x} y={bubble.y} text="Say it again?" side="left" />}
    </AbsoluteFill>
  );
};

const Component: React.FC<{ shot: Shot }> = ({ shot }) => {
  const k = cues(shot);
  const f = shot.frame;
  const on = current(f, [
    [shot.from, "g1"], [k.second - 2, "g2"], [k.dusk - 4, "diner"], [k.photo, "photo"], [k.chair, "diner"],
  ] as [number, "g1" | "g2" | "diner" | "photo"][]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {on === "g1" && <Garage frame={f} k={k} second={false} />}
      {on === "g2" && <Garage frame={f} k={k} second />}
      {on === "diner" && <Restaurant frame={f} k={k} />}
      {on === "photo" && <PhoneInsert frame={f} k={k} />}
    </AbsoluteFill>
  );
};

export const sayItAgain: Beat = { id: "SayItAgain", first: "Lunch. Your car's", lead: 0.3, Component };
