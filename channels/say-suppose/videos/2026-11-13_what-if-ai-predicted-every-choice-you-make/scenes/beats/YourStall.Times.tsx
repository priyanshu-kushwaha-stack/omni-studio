// Your Stall: named moments (frames) from narration line indices 26-32, and every tag's and board's keys, shared by
// the pictures and their sounds.
import type { Clip } from "@whatif/kit/timeline";
import type { BoardKey, TagKey } from "../device";
import { lineAt } from "../kit";
import { lineEnd } from "../shared";

export type T = ReturnType<typeof times>;

/** Frames a plate takes to slide across the steel. */
export const SLIDE = 16;

export function times(clips: Clip[], to: number) {
  const at = lineAt(clips);
  const from = (i: number) => clips[i].from;
  const end = (i: number) => lineEnd(clips, i);
  // the 5 s performed hold after line 26: plates two and three, the third man's stare; the coffee seller after it
  const hold = end(26);
  const coffee = Math.max(hold + 70, from(27) - 40);
  const g = coffee - hold;
  const p3 = hold + Math.round(g * 0.3);
  const tear = Math.max(from(30) + 6, at(30, 0.4));
  return {
    start: from(26), // "Lunch.": the queue, three cards dropping one after another
    eyesUp: at(26, 0.22), // "You read the queue": your eyes on the cards, not the faces
    p1: at(26, 0.62), // "before it orders.": the first plate slides before his mouth opens
    p2: hold + Math.round(g * 0.02),
    p3, // the third man: rice and noodles both
    stare: p3 + SLIDE + 6, // he stares at them; up at you; down again
    coffee, // the coffee seller watching, mouth open
    show: from(27), // "Show-off." (her own voice)
    up: end(27), // she slowly looks up at the cards over her own queue
    busy: from(28), // "Nobody waits. Nobody orders. The queue doubles by the weekend"
    nextDoor: at(28, 0.62), // "and the court next door is reading tags too."
    landlord: from(29), // "The landlord's letter.": he holds out the envelope
    take: at(29, 0.6),
    keep: from(30), // "Keep it up." (his own voice)
    tear, // your friend tears it open and reads
    hiCard: Math.max(tear + 14, from(31) - 30), // HIGH-FIVES 98%, a second before his hand comes up
    handUp: from(31) - 4, // "Half!" (his own voice)
    slap: from(31) + 6, // you slap it; tick
    thought: from(32), // "Half rent. And a thought you can't put down."
    anyone: at(32, 0.55), // "If you can read their tags, you can read anyone's.": your eyes out over the court
    end: to,
  };
}

/** The three orders, in queue order: the card, its number, what lands on the plate. */
export const ORDERS = [
  { text: "ORDERS NOODLES", pct: 92, food: "noodles" },
  { text: "ORDERS RICE", pct: 88, food: "rice" },
  { text: "CHANGES MIND", pct: 81, food: "both" },
] as const;

const k = (at: number, text: string, pct: number | null, state: TagKey["state"]): TagKey => ({ at, text, pct, state });

/** The frame each plate arrives (and its card ticks). */
export const arrivals = (t: T) => [t.p1, t.p2, t.p3].map((p) => p + SLIDE);

export function tags(t: T) {
  const arr = arrivals(t);
  return {
    queue: ORDERS.map((o, i) => [k(t.start + 4 + i * 7, o.text, o.pct, "new"), k(arr[i] + 3, o.text, o.pct, "tick")]),
    friend: [k(t.hiCard, "HIGH-FIVES", 98, "new"), k(t.slap, "HIGH-FIVES", 98, "tick")],
  };
}

export function boards(t: T) {
  const arr = arrivals(t);
  const b = (at: number, value: string): BoardKey => ({ at, value });
  return { yours: [b(t.start - 60, "100"), b(arr[1] + 10, "94"), b(arr[2] + 10, "90")] };
}
