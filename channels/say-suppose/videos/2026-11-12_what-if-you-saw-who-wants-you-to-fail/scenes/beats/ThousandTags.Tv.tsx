// A Thousand Cards, line 66 (script v5): "Why not go on the news and scan the whole country? Because a camera isn't a
// face." You at a TV news desk (the kit's tvStudio), live, the letter up to the studio camera, your own face on the big
// screen. You say it: nothing opens. A dashed empty outline where a card would be flickers over the camera and is gone;
// you lean in and tap the lens; still nothing. You sag.
import { Figure } from "@whatif/kit/rig/Figure";
import { SEATED, type Pose } from "@whatif/kit/rig/pose";
import { tvStudio } from "@whatif/kit/sets";
import type { MoodName } from "@whatif/kit/stage/moods";
import { drift } from "@whatif/kit/stage/shots";
import { INK } from "@whatif/kit/theme";
import { Letter } from "../parts";
import { blinking, camAt, HERO, mix, ramp } from "../shared";
import { SetShot } from "./WhosCrimson.Common";

export const TvShot: React.FC<{ frame: number; from: number; say: number; none: number; tap: number; to: number; mood: MoodName }> = ({ frame, from, say, none, tap, to, mood }) => {
  const a = tvStudio.spots.anchor;
  const up = ramp(frame, say - 8, say + 4);
  const tapT = ramp(frame, tap, tap + 10) * (1 - ramp(frame, tap + 22, tap + 32));
  const sag = ramp(frame, tap + 32, tap + 46);
  const pose: Pose = { ...SEATED, lean: mix(0, 10, tapT) - 6 * sag, tilt: 8 * sag, armF: [mix(mix(30, 110, up), 95, tapT), mix(mix(50, 20, up), 0, tapT)] };
  const ghost = frame >= none && frame < none + 24 ? (Math.floor((frame - none) / 4) % 2 ? 0.25 : 0.7) * (1 - (frame - none) / 24) : 0;
  const cam = drift(camAt(frame, [[from, { x: 1150, y: 600, zoom: 1.25 }], [none, { x: 1250, y: 590, zoom: 1.4 }], [to, { x: 1230, y: 600, zoom: 1.45 }]]), frame, "tv", 3);
  const talking = frame >= say && frame < none;
  const face = sag > 0.3
    ? { brows: "sad" as const, lids: 0.5, mouth: "frown" as const, eyes: 1, look: { x: 0.8, y: 0.4 } }
    : frame >= none
      ? { brows: "raised" as const, lids: 0, mouth: "o" as const, eyes: 1.2, look: { x: 1, y: 0 } }
      : { brows: "raised" as const, lids: 0, mouth: talking ? (Math.floor(frame / 5) % 2 ? "open" as const : "smile" as const) : "smile" as const, eyes: 1, look: { x: 1, y: 0 } };
  return (
    <SetShot set={tvStudio} mood={mood} frame={frame} cam={cam} options={{ screen: "face", guest: HERO.head, live: true }}
      behind={<Figure {...HERO} x={a.x} y={a.y} scale={a.scale} facing={1} pose={pose} {...face} blink={blinking(frame, 1)} time={frame}
        held={tapT > 0.1 ? undefined : <Letter x={4} y={8} scale={0.6} tilt={-4} />} />}
      actors={ghost > 0 ? (
        <g opacity={ghost} transform="translate(1720 440)">
          <rect x={-90} y={-38} width={180} height={76} rx={12} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="16 12" />
        </g>
      ) : null} />
  );
};
