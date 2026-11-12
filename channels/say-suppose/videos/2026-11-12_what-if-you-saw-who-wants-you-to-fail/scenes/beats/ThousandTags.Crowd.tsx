// The crowd for A Thousand Tags: the people pouring out of the academies at ten, in rows on the far pavement, the
// pavement and the road (AcademyStreet's ACADEMY.crowd), each walking out of the nearest tower door when the doors
// open, then standing, turned toward you on the steps. When you say it, a card snaps open over every head in a ripple
// out from the steps: nearly all grey zeros, a scatter of teal. Your class (with your best friend) is drawn by the beat.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { worldOf } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { headAt, Meter } from "../parts";
import { linear, mix, noise, PASTELS } from "../shared";
import { ACADEMY, crowdScale, TOWER_DEPTH, towerDoors } from "../sets/AcademyStreet";

export interface Member { x: number; y: number; scale: number; head: string; coat: string; value: number; seed: number; door: number }

/** Keep-out boxes: the academy front and snack shop behind the far rows, the steps under you, your class. */
const blocked = (x: number, y: number) =>
  (y < 1080 && x > -260 && x < 1310) || (y < 1250 && x > 40 && x < 700) || (y < 1225 && x > 690 && x < 1290);

/** Everyone in the crowd, front rows last (so they draw over the rows behind). */
export function crowd(): Member[] {
  const rows = [...ACADEMY.crowd.far, 990, 1030, ...ACADEMY.crowd.near].sort((a, b) => a - b);
  const doors = towerDoors();
  const out: Member[] = [];
  rows.forEach((y, r) => {
    const s = crowdScale(y);
    const gap = 150 * s;
    for (let x = ACADEMY.crowd.x[0] + noise(r) * gap; x < ACADEMY.crowd.x[1]; x += gap * (0.75 + noise(x + r) * 0.6)) {
      const jx = x + (noise(x * 3 + r) - 0.5) * gap * 0.4;
      const jy = y + (noise(x * 7 + r) - 0.5) * 16;
      if (blocked(jx, jy)) continue;
      const seed = out.length;
      const roll = noise(seed * 13 + 5);
      const value = roll < 0.075 ? Math.round(4 + noise(seed + 77) * 30) : 0;
      let door = 0;
      doors.forEach((d, i) => { if (Math.abs(d.x - jx) < Math.abs(doors[door].x - jx)) door = i; });
      out.push({
        x: jx, y: jy, scale: s, value, seed, door,
        head: PASTELS[Math.floor(noise(seed + 3) * PASTELS.length)],
        coat: ["#2a2d36", "#3b4a6b", "#4a3f63", "#2f4a4a", "#5a4a3a"][Math.floor(noise(seed + 9) * 5)],
      });
    }
  });
  return out;
}

const MEMBERS = crowd();

/** Frames a crowd member takes to walk from the door to their place. */
const WALK = 46;

/** The crowd at this frame. `doors` is the frame the doors open (nobody before it), `say` the frame you say it (the
 *  cards), `until` when the cards fold (the cut away). Draws only the people the camera can see. */
export const Crowd: React.FC<{ frame: number; cam: Camera; doors: number; say: number; until: number; you: { x: number; y: number } }> = ({
  frame, cam, doors, say, until, you,
}) => {
  if (frame < doors) return null;
  const halfW = 960 / cam.zoom + 120, halfH = 540 / cam.zoom + 200;
  const td = towerDoors();
  return (
    <g>
      {MEMBERS.map((m) => {
        if (Math.abs(m.x - cam.x) > halfW || m.y - cam.y > halfH || cam.y - m.y > halfH + 300) return null;
        const start = doors + 6 + Math.floor(noise(m.seed + 31) * 70);
        if (frame < start) return null;
        const d = td[m.door];
        const spawn = worldOf(cam, d.x, d.bottom, TOWER_DEPTH);
        const p = linear(frame, start, start + WALK);
        const x = mix(spawn.x, m.x, p), y = mix(spawn.y, m.y, p);
        const s = mix(crowdScale(940), m.scale, p);
        const walking = p < 1;
        const facing: 1 | -1 = walking ? (m.x > spawn.x ? 1 : -1) : m.x < you.x ? 1 : -1;
        const pose = walking ? walkPose(frame * 0.25 + m.seed) : STAND;
        const h = headAt(x, y, s, pose, facing);
        const at = say + Math.min(26, Math.hypot(m.x - you.x, (m.y - you.y) * 2) / 110) + Math.floor(noise(m.seed + 51) * 5);
        return (
          <g key={m.seed}>
            <Figure x={x} y={y} scale={s} facing={facing} pose={pose} head={m.head} coat={m.coat} mouth="flat"
              look={{ x: 0.6, y: walking ? 0 : -0.3 }} time={frame} />
            {!walking && <Meter frame={frame} at={at} x={h.x} headY={h.y} r={h.r} value={m.value} until={until} tilt={-3 + (noise(m.seed) - 0.5) * 8} />}
          </g>
        );
      })}
    </g>
  );
};
