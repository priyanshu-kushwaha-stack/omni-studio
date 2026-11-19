// The Rule, line 20 (round 17, the video-call loophole): "You do. You even switch on video, so you can see her grin. And
// nothing opens over a screen." Your phone close in your hand: the call flips to video and her face fills the screen,
// grinning, the warehouse racking behind her, your own face small in the corner. No card opens over her or the screen.
//
// v7 (outside review of v6: the phone was too small to prove that her visible face opens no card): the self view moves
// to the screen's lower left, and `emptyCard` draws a dashed card outline over her head that stays empty, for the
// split screen in Rule.Call.tsx.
import { Figure } from "@whatif/kit/rig/Figure";
import { STAND } from "@whatif/kit/rig/pose";
import { LookContext } from "@whatif/kit/stage/Look";
import { Stage, type Camera } from "@whatif/kit/stage/Stage";
import { INK, MUSTARD, TEAL } from "@whatif/kit/theme";
import { headAt, Ponytail, Vest } from "../parts";
import { blinking, JIYOON, ramp } from "../shared";
import { StoreBack, storeLook } from "../sets/Store";
import type { Mood } from "./Rule.Store";

/** The phone, world units: centre and size. */
export const VPHONE = { x: 960, y: 560, w: 440, h: 820 };
const SCREEN = { x: VPHONE.x - VPHONE.w / 2 + 18, y: VPHONE.y - VPHONE.h / 2 + 18, w: VPHONE.w - 36, h: VPHONE.h - 36 };
const HER_SCALE = 3.8;

/** Her on the screen: head and shoulders, grinning (laughing on and off), vest and ponytail, the racking behind. */
const HerOnScreen: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  const h0 = headAt(0, 0, HER_SCALE, STAND, 1);
  const x = SCREEN.x + SCREEN.w / 2;
  const y = SCREEN.y + SCREEN.h * 0.4 - h0.y;
  const laugh = Math.floor((frame - from) / 7) % 4 === 1;
  return (
    <g>
      {/* the warehouse behind her: dark aisle, blue uprights, orange beams, boxes, a lamp */}
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#141826" />
      {[0, 1].map((u) => <rect key={u} x={SCREEN.x + 20 + u * 300} y={SCREEN.y} width={22} height={SCREEN.h} fill="#2c4f8a" />)}
      {[0.22, 0.5, 0.78].map((p) => (
        <g key={p}>
          <rect x={SCREEN.x} y={SCREEN.y + SCREEN.h * p} width={SCREEN.w} height={16} fill="#e8792f" />
          {[0, 1, 2, 3].map((b) => (
            <rect key={b} x={SCREEN.x + 50 + b * 80} y={SCREEN.y + SCREEN.h * p - 62} width={62} height={62} fill={["#c99a62", "#b8874f", "#d6aa72"][b % 3]} stroke={INK} strokeWidth={3} />
          ))}
        </g>
      ))}
      <circle cx={SCREEN.x + SCREEN.w * 0.75} cy={SCREEN.y + 40} r={60} fill="#ffd38a" opacity={0.25} />
      <Ponytail x={x} y={y} scale={HER_SCALE} pose={STAND} facing={1} />
      <Figure x={x} y={y} scale={HER_SCALE} facing={1} pose={STAND} head={JIYOON.head} coat={JIYOON.coat}
        brows="raised" lids={laugh ? 0.55 : 0.2} mouth={laugh ? "open" : "smile"} eyes={1.05} look={{ x: 0, y: 0 }}
        blink={blinking(frame, 5)} time={frame} />
      <Vest x={x} y={y} scale={HER_SCALE} pose={STAND} facing={1} />
    </g>
  );
};

/** Your phone in your hand, in a video call with her. `flip` 0..1 wipes the call screen (her avatar) to the video. */
const VideoHandset: React.FC<{ frame: number; from: number; flip: number; emptyCard?: boolean }> = ({ frame, from, flip, emptyCard }) => {
  const { x, y, w, h } = VPHONE;
  const wipe = SCREEN.h * flip;
  return (
    <g>
      <defs>
        <clipPath id="vphone-screen"><rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} rx={30} /></clipPath>
        <clipPath id="vphone-wipe"><rect x={SCREEN.x} y={SCREEN.y + SCREEN.h - wipe} width={SCREEN.w} height={wipe} /></clipPath>
      </defs>
      {/* your hand and sleeve, from the lower right */}
      <rect x={x + 60} y={y + 260} width={700} height={170} rx={80} fill="#3b3e47" stroke={INK} strokeWidth={8} transform={`rotate(-28 ${x + 60} ${y + 260})`} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={48} fill="#1d2029" stroke={INK} strokeWidth={8} />
      <g clipPath="url(#vphone-screen)">
        {/* the call screen before the flip: her avatar on dark blue */}
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.w} height={SCREEN.h} fill="#2f3550" />
        <circle cx={x} cy={y - 120} r={90} fill={JIYOON.head} stroke={INK} strokeWidth={6} />
        <g clipPath="url(#vphone-wipe)"><HerOnScreen frame={frame} from={from} /></g>
        {/* your face, small, in the corner (the self view) */}
        {flip > 0.6 && (
          <g transform={`translate(${-(SCREEN.w - 144)} ${SCREEN.h - 300})`}>
            <rect x={SCREEN.x + SCREEN.w - 120} y={SCREEN.y + 24} width={96} height={130} rx={14} fill="#eef1ec" stroke={INK} strokeWidth={4} />
            <path d={`M${SCREEN.x + SCREEN.w - 104} ${SCREEN.y + 154} q24 -34 64 0`} fill={TEAL} stroke={INK} strokeWidth={3} />
            <circle cx={SCREEN.x + SCREEN.w - 72} cy={SCREEN.y + 84} r={32} fill={MUSTARD} stroke={INK} strokeWidth={4} />
            <path d={`M${SCREEN.x + SCREEN.w - 84} ${SCREEN.y + 94} q12 12 24 0`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </g>
        )}
        {/* where a card would open over her: an empty dashed outline, blinking faintly */}
        {emptyCard && flip > 0.9 && (
          <rect x={x - 130} y={SCREEN.y + 40} width={260} height={100} rx={14} fill="none" stroke="#f2e6c8" strokeWidth={6}
            strokeDasharray="22 14" opacity={0.55 + 0.35 * Math.abs(Math.sin(frame / 8))} />
        )}
        {/* the hang-up button */}
        <circle cx={x} cy={SCREEN.y + SCREEN.h - 70} r={36} fill="#d8344f" stroke={INK} strokeWidth={4} opacity={0.9} />
      </g>
      {/* your thumb on the phone's edge */}
      <ellipse cx={x + w / 2 - 6} cy={y + 150} rx={46} ry={70} fill={MUSTARD} stroke={INK} strokeWidth={7} />
    </g>
  );
};

/** The phone close over the darkened store: the video call. `switchAt` is when the screen flips to video. */
export const VideoPhoneShot: React.FC<{ frame: number; cam: Camera; mood: Mood; switchAt: number; emptyCard?: boolean }> = ({ frame, cam, mood, switchAt, emptyCard }) => {
  const flip = ramp(frame, switchAt + 6, switchAt + 16);
  return (
    <LookContext.Provider value={storeLook(mood, cam)}>
      <Stage cam={cam} radius={0} origin={{ x: 960, y: 540 }}
        back={<><StoreBack cam={cam} mood={mood} frame={frame} /><rect x={-1400} y={-900} width={4800} height={2600} fill="#0d0f18" opacity={0.5} /></>}
        actors={<VideoHandset frame={frame} from={switchAt} flip={flip} emptyCard={emptyCard} />} />
    </LookContext.Provider>
  );
};
