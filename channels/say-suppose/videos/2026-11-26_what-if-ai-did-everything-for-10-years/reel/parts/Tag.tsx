// The script's `> TAG:` (YEAR 1, TEN YEARS EARLIER): the channel's stamped tag, mustard Rubik 800 on an ink plate with
// a paper edge (brand/thumbs/tenyears/Thumb.tsx). It thumps in large at the centre over the dimmed still for its own
// slot; a short slot hands it on to the next shot as a small stamp, top left, off the faces, for about 3 s in all.
import { FONT } from "@whatif/kit/fonts";
import { INK, MUSTARD, PAPER } from "@whatif/kit/theme";
import { easeInOut, mix, ramp } from "../data";

/** Frames a tag stays on screen in all when its own slot is shorter. */
export const TAG_HOLD = 90;
const MOVE = 12;
const FADE = 8;

/** How long the tag overlay lives, from its slot's start. */
export const tagLife = (slotDur: number) => (slotDur >= 60 ? slotDur + 6 : Math.max(TAG_HOLD, slotDur + MOVE + 30));

export const TagStamp: React.FC<{ text: string; f: number; slotDur: number }> = ({ text, f, slotDur }) => {
  const life = tagLife(slotDur);
  const thump = ramp(f, 0, 8);
  const toCorner = slotDur >= 60 ? 0 : easeInOut(ramp(f, slotDur, slotDur + MOVE));
  const out = slotDur >= 60 ? ramp(f, slotDur, slotDur + 6) : ramp(f, life - FADE, life);
  const x = mix(960, 64, toCorner);
  const y = mix(540, 58, toCorner);
  const anchor = mix(50, 0, toCorner);
  const s = mix(mix(1.3, 1, thump), 0.5, toCorner);
  return (
    <div style={{
      position: "absolute", left: 0, top: 0, transformOrigin: "0 0",
      transform: `translate(${x}px, ${y}px) scale(${s}) translate(${-anchor}%, ${-anchor}%)`,
      opacity: Math.min(ramp(f, 0, 6), 1 - out),
    }}>
      <div style={{
        transform: "rotate(-3deg)", background: INK, color: MUSTARD, border: `9px solid ${PAPER}`, borderRadius: 28,
        fontFamily: FONT, fontWeight: 800, fontSize: 124, lineHeight: 1.02, letterSpacing: 4, padding: "20px 48px 12px",
        whiteSpace: "nowrap", boxShadow: "0 18px 34px rgba(0,0,0,.5)",
      }}>{text}</div>
    </div>
  );
};
