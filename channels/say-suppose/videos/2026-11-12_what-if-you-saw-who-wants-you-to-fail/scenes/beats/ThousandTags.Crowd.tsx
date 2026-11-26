// The crowd for A Thousand Cards: the people pouring out of the academies at ten, in rows on the far pavement, the
// pavement and the road (AcademyStreet's ACADEMY.crowd). Outside review of v6, sheet 27: they pour out of doors you can
// see, a stream per door in a quick cascade (our academy's glass doors first, then the snack shop's, then the tower
// doors either side), not out of the frame's edges. When you say it, a card snaps open over every head in a ripple
// out from the steps, ring by ring over a second and a half: nearly all small grey zeros, a scatter of teal, and red on
// the eight nearest the snack shop (your class in the crowd), larger. `annoyed` turns the crowd's faces sour and some
// jerk a thumb: off the steps. Your class (with your best friend) is drawn by the beat.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND, walkPose } from "@whatif/kit/rig/pose";
import { worldOf } from "@whatif/kit/sets/common";
import type { Camera } from "@whatif/kit/stage/Stage";
import { headAt, Meter } from "../parts";
import { linear, mix, noise, PASTELS } from "../shared";
import { ACADEMY, crowdScale, TOWER_DEPTH, towerDoors } from "../sets/AcademyStreet";

export interface Member { x: number; y: number; scale: number; head: string; coat: string; value: number; seed: number; door: number }

/** The doors the crowd comes out of, in cascade order: our academy's glass doors (on the landing), the snack shop's
 *  door, then the tower doors right and left (on the tower layer). */
const SPAWNS = [
  { x: 340, y: 965, tower: false },
  { x: 1170, y: 1080, tower: false },
  ...[4, 1, 5, 0, 6].map((i) => ({ i, tower: true })),
] as const;
const CASCADE = 7;

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
      // the nearest door of SPAWNS
      const sx = (k: number) => { const sp = SPAWNS[k]; return "i" in sp ? doors[sp.i].x : sp.x; };
      let door = 0;
      SPAWNS.forEach((_, k) => { if (Math.abs(sx(k) - jx) < Math.abs(sx(door) - jx)) door = k; });
      out.push({
        x: jx, y: jy, scale: s, value, seed, door,
        head: PASTELS[Math.floor(noise(seed + 3) * PASTELS.length)],
        coat: ["#2a2d36", "#3b4a6b", "#4a3f63", "#2f4a4a", "#5a4a3a"][Math.floor(noise(seed + 9) * 5)],
      });
    }
  });
  // your class among the crowd: the eight people nearest the snack shop's pavement go red (a dozen red with the class)
  const near = out.map((m, i) => ({ i, d: Math.hypot(m.x - 1030, (m.y - 1175) * 1.6) })).sort((a, b) => a.d - b.d).slice(0, 8);
  near.forEach(({ i }, n) => { out[i].value = -Math.round(9 + noise(i + 41) * 38 + n); });
  return out;
}

const MEMBERS = crowd();

/** Frames a crowd member takes to walk from the door to their place. */
const WALK = 46;

/** The crowd at this frame. `doors` is the frame the doors open (nobody before it), `say` the frame you say it (the
 *  cards), `until` when the cards fold (the cut away), `dim` 0..1 fades their cards (none is red) so your class's three red
 *  cards stand out. Draws only the people the camera can see. */
export const Crowd: React.FC<{ frame: number; cam: Camera; doors: number; say: number; until: number; you: { x: number; y: number }; dim?: number; annoyed?: number }> = ({
  frame, cam, doors, say, until, you, dim = 0, annoyed = 0,
}) => {
  if (frame < doors) return null;
  const halfW = 960 / cam.zoom + 120, halfH = 540 / cam.zoom + 200;
  const td = towerDoors();
  return (
    <g>
      {MEMBERS.map((m) => {
        if (Math.abs(m.x - cam.x) > halfW || m.y - cam.y > halfH || cam.y - m.y > halfH + 300) return null;
        const start = doors + 4 + m.door * CASCADE + Math.floor(noise(m.seed + 31) * 50);
        if (frame < start) return null;
        const sp = SPAWNS[m.door];
        const spawn = "i" in sp ? worldOf(cam, td[sp.i].x, td[sp.i].bottom, TOWER_DEPTH) : { x: sp.x, y: sp.y };
        const p = linear(frame, start, start + WALK);
        const x = mix(spawn.x, m.x, p), y = mix(spawn.y, m.y, p);
        const s = mix("i" in sp ? crowdScale(940) : crowdScale(Math.max(960, sp.y)), m.scale, p);
        const walking = p < 1;
        const facing: 1 | -1 = walking ? (m.x > spawn.x ? 1 : -1) : m.x < you.x ? 1 : -1;
        const shoo = annoyed > 0.5 && !walking && noise(m.seed + 81) < 0.3;
        const pose = walking ? walkPose(frame * 0.25 + m.seed) : shoo ? { ...STAND, armF: [100 + Math.sin(frame / 3 + m.seed) * 25, 70] as [number, number] } : STAND;
        const h = headAt(x, y, s, pose, facing);
        const at = say + Math.min(46, Math.hypot(m.x - you.x, (m.y - you.y) * 2) / 60) + Math.floor(noise(m.seed + 51) * 2);
        return (
          <g key={m.seed}>
            <Figure x={x} y={y} scale={s} facing={facing} pose={pose} head={m.head} coat={m.coat}
              {...(annoyed > 0.5 && !walking
                ? { brows: noise(m.seed + 61) < 0.5 ? "angry" as const : "flat" as const, lids: 0.45, mouth: noise(m.seed + 71) < 0.4 ? "frown" as const : "flat" as const }
                : { mouth: "flat" as const })}
              look={{ x: 0.6, y: walking ? 0 : -0.3 }} time={frame} />
            {!walking && (
              <g opacity={m.value < 0 ? 1 : 1 - 0.72 * dim}>
                <Meter frame={frame} at={at} x={h.x} headY={h.y} r={h.r} value={m.value} until={until} tilt={-3 + (noise(m.seed) - 0.5) * 8}
                  scale={m.value < 0 ? 1.15 : m.value === 0 ? 0.82 : 1} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};
