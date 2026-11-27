// Shared timing for the data graphics (W5): on screen from `at` to `to`, a bouncy scale in over 0.25 s and a fade over
// the 0.3 s before `to`.
import {keys, BACK} from '../rig/keys';

export type Timed = {t: number; at: number; to: number};

// Scale and opacity for a graphic on screen from at to to, or null when it is off.
export const popIn = ({t, at, to}: Timed) => {
  if (t < at || t >= to) return null;
  return {k: keys(t, [[at, 0], [at + 0.25, 1, BACK]]), a: keys(t, [[to - 0.3, 1], [to, 0]])};
};
