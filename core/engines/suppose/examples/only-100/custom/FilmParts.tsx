// Pilot-only pieces for the only-100 rebuild, ported from channels/say-suppose/pilot/only-100/remotion/src (v8):
// FilmParts.tsx (Phone, LIST, BoardDots, scarfRest, fadeIn), CutoutC.tsx (scarfAt, manAt), Cast2.tsx (the pose types)
// and Cast4.tsx (Scarf4, Man4, RiceBall, the face helpers). Bodies are the pilot's; what changed is where the data
// comes from: the kit for shared parts, and film.json (cast, crowd, props, set plates) instead of castV4.ts and
// public/cut*, handed to every shot through PilotCtx by `onOld`.
import React, {createContext, useContext} from 'react';
import {keys, BACK, OUT, IO, LIN, blinkAt, Person, Part, Crowd as KitCrowd, FONT, GREEN, rnd, personH, SCARF_H, MAN_H} from '@suppose/kit';
import type {FilmData, Parts, Piece, Shot} from '@suppose/kit';
import {W, H} from '@suppose/kit';
import {Img, staticFile} from 'remotion';

export const AMBER = '#ffb347';

// ---- time: the pilot's shots are written on the voice B timeline and play on Luc's (pilot timewarp.ts) ----
// Knots are each line's start and end in both cue sheets (pilot audio/cues_a.json -> audio/cues_luc.json); film.json
// for this example is warped with the same cue sheets by scripts/timewarp.py, so shot boundaries agree.
const OLD = [0.0, 0.4, 3.52, 3.77, 4.65, 4.95, 10.15, 10.5, 16.66, 17.06, 19.3, 19.55, 23.71, 24.11, 31.87, 32.12, 32.84, 33.14, 38.5, 39.2, 42.4, 42.95, 50.55, 50.85, 53.57, 53.87, 56.75, 59.5];
const NEW = [0.0, 0.4, 4.062, 4.312, 5.192, 5.492, 11.839, 12.189, 19.944, 20.344, 23.078, 23.328, 28.349, 28.749, 38.875, 39.125, 39.845, 40.145, 46.605, 47.305, 50.796, 51.346, 59.594, 59.894, 62.614, 62.914, 67.089, 69.839];
export const toOld = (t: number): number => {
  if (t <= 0) return t;
  for (let i = 1; i < NEW.length; i++) {
    if (t <= NEW[i]) return OLD[i - 1] + ((t - NEW[i - 1]) / (NEW[i] - NEW[i - 1])) * (OLD[i] - OLD[i - 1]);
  }
  return OLD[OLD.length - 1] + (t - NEW[NEW.length - 1]);
};

// ---- the cast and plates, from film.json ----
type Plates = Record<'wide' | 'close' | 'high', string>;
export type Pilot = {SCARF: Parts; SALARY: Parts; KENJI: Parts; WOMAN: Parts; GREY: Parts; PROPS: {rice: Piece; phone: Piece}; KINDS: Parts[]; plates: Plates};

// Weighted so the loud yellow backpacker and the green-overall worker (green is Scarf's colour) stay rare.
const KIND_IDS = ['salary', 'office', 'student', 'gent', 'gran', 'salary', 'office', 'student', 'gran', 'gent', 'salary', 'packer', 'gran', 'worker'];

// castV4 names -> library ids: SCARFC = scarf, SALARY = salary, STUDENT (Kenji) = student, OFFICE (the woman) =
// office, GENT (Mr. Okada) = gent. Supporting cast with the crowd role are in film.crowd, Scarf in film.cast.
export const castOf = (film: FilmData): Pilot => {
  const all = {...film.crowd, ...film.cast};
  const need = (id: string): Parts => {
    if (!all[id]) throw new Error(`only-100: film.json has no cast member "${id}"`);
    return all[id];
  };
  const angles = film.sets.station?.angles ?? {};
  const plate = (a: string) => angles[a]?.plate ?? `sets/station/${a}.png`;
  return {
    SCARF: need('scarf'), SALARY: need('salary'), KENJI: need('student'), WOMAN: need('office'), GREY: need('gent'),
    PROPS: film.props as Pilot['PROPS'], KINDS: KIND_IDS.map(need),
    plates: {wide: plate('wide'), close: plate('close'), high: plate('high')},
  };
};

const PilotCtx = createContext<Pilot | null>(null);
export const usePilot = (): Pilot => {
  const p = useContext(PilotCtx);
  if (!p) throw new Error('only-100: a pilot part rendered outside onOld');
  return p;
};

// A pilot shot body takes old-timeline seconds (t, and l into the shot). onOld makes it a kit Shot: film time ->
// old time through the warp, and the shot's start mapped back the same way, so l is the pilot's l.
export type OldShot = React.FC<{t: number; l: number}>;
export const onOld = (C: OldShot): Shot => {
  const S: Shot = ({t, l, film}) => {
    const T = toOld(t);
    return (
      <PilotCtx.Provider value={castOf(film)}>
        <C t={T} l={T - toOld(t - l)} />
      </PilotCtx.Provider>
    );
  };
  return S;
};

// ---- pilot FilmParts.tsx ----
export const SetImg: React.FC<{which: 'wide' | 'close' | 'high'; blur?: number}> = ({which, blur = 0}) => (
  <Img src={staticFile(usePilot().plates[which])} style={{position: 'absolute', left: -60, top: -40, width: W + 120, height: H + 70, filter: blur ? `blur(${blur}px)` : undefined}} />
);

// Scarf at rest, with overrides.
export const scarfRest = (t: number, o: Partial<ScarfCutPose> = {}): ScarfCutPose => ({
  lean: 0, headTilt: 0, open: 1, lid: 0, pupil: [0, 0], browLift: 0, browSad: 0,
  armL: {a: 6, f: -6}, armR: {a: 6, f: -6}, tail: Math.sin(t * 1.7) * 4, sweat: 0, bob: Math.sin(t * 2.1) * 4, ...o,
});

// The pilot's Crowd is the kit's with the pilot's weighted kinds.
type CrowdProps = Omit<React.ComponentProps<typeof KitCrowd>, 'kinds'>;
export const Crowd: React.FC<CrowdProps> = (props) => <KitCrowd {...props} kinds={usePilot().KINDS} />;

export const LIST = [
  'Grandma', 'Mum', 'Kenji', 'Dad', 'Aiko', 'Mr. Tanaka', 'Coach Ito', 'Yuki', 'Ren', 'Hana',
  ...Array.from({length: 36}, (_, k) => ['Sora', 'Mei', 'Daichi', 'Emi', 'Kaito', 'Rin', 'Taro', 'Saki', 'Jun'][k % 9] + (k > 8 ? ` ${String.fromCharCode(65 + (k % 26))}.` : '')),
  'Ramen Guy',
  ...Array.from({length: 51}, (_, k) => ['Nao', 'Kei', 'Riko', 'Shin', 'Aya', 'Goro', 'Miho'][k % 7] + ` ${String.fromCharCode(65 + (k % 26))}.`),
  'Dentist',
];

// The list on your phone. scroll = index of the top row (fractional); hi = highlighted row index.
export const Phone: React.FC<{t: number; scroll: number; hi?: number; empty?: boolean; fade?: {row: number; a: number}; swap?: {row: number; k: number; to: string}; thumb?: [number, number]; swaps?: string}> = ({
  t, scroll, hi, fade, swap, thumb, swaps,
}) => {
  const rowH = 58;
  const rows = [...LIST.slice(0, 99), ''];
  const first = Math.max(0, Math.floor(scroll) - 1);
  return (
    <div style={{position: 'absolute', left: W / 2 - 190, top: 40, width: 380, height: 760, borderRadius: 46, background: '#0f1016', boxShadow: '0 30px 80px rgba(0,0,0,.55), inset 0 0 0 3px #2b2d38', transform: 'rotate(-3deg)', overflow: 'hidden', fontFamily: FONT}}>
      <div style={{position: 'absolute', left: 20, right: 20, top: 20, height: 62, color: '#fff', fontSize: 24, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span>My 100</span>
        <span style={{color: GREEN, fontSize: 20}}>{swaps ?? '99 / 100'}</span>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 90, bottom: 0, overflow: 'hidden'}}>
        {rows.slice(first, first + 14).map((name, j) => {
          const idx = first + j;
          const y = (idx - scroll) * rowH;
          const isHi = hi === idx;
          let label: React.ReactNode = name;
          let op = 1;
          if (fade && fade.row === idx) op = fade.a;
          if (swap && swap.row === idx) label = swap.k < 0.5 ? name : swap.to;
          const flip = swap && swap.row === idx ? Math.abs(Math.cos(swap.k * Math.PI)) : 1;
          return (
            <div key={idx} style={{position: 'absolute', left: 14, right: 14, top: y, height: rowH - 8, borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14, padding: '0 14px', background: isHi ? 'rgba(47,191,113,.22)' : 'rgba(255,255,255,.05)', border: isHi ? `2px solid ${GREEN}` : '2px solid transparent', color: '#f2f0f7', fontSize: 24, fontWeight: 600, opacity: op, transform: `scaleY(${flip})`}}>
              <span style={{width: 44, color: isHi ? GREEN : '#8d8aa3', fontVariantNumeric: 'tabular-nums', fontSize: 20}}>{idx + 1}</span>
              <span>{label}</span>
              {idx === 99 && <span style={{width: 3, height: 28, background: GREEN, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0}} />}
            </div>
          );
        })}
      </div>
      {thumb && (
        <div style={{position: 'absolute', left: thumb[0], top: thumb[1], width: 74, height: 74, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #3a3a46, #101016 70%)', boxShadow: '0 8px 18px rgba(0,0,0,.5)'}} />
      )}
    </div>
  );
};

// The departures board becomes 600 lights; 500 go dark. Drawn in background-plate pixels (inside the plate camera).
export const BoardDots: React.FC<{t: number; t0: number; tOff: number}> = ({t, t0, tOff}) => {
  const a = keys(t, [[t0, 0], [t0 + 0.4, 1]]);
  if (a <= 0) return null;
  const cols = 40, rows = 12;
  const off = keys(t, [[tOff, 0], [tOff + 1.4, 1, IO]]);
  return (
    <div style={{position: 'absolute', left: 258, top: 92, width: 980, height: 250, borderRadius: 10, background: 'rgba(16,10,6,.92)', opacity: a, boxShadow: '0 0 40px rgba(255,170,70,.35)'}}>
      <svg width={980} height={250}>
        {Array.from({length: cols * rows}).map((_, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const keep = i % 6 === 0; // 100 of 600
          const order = rnd(i, 21);
          const lit = keep ? 1 : order > off ? 1 : 0.08;
          return <circle key={i} cx={22 + c * 24} cy={64 + r * 14} r={5} fill={keep && off > 0.5 ? '#7df9c6' : AMBER} opacity={lit} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: 6, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 34, color: '#fff', textShadow: '0 3px 0 rgba(0,0,0,.4)'}}>
        {off < 0.5 ? <>≈ 600 <span style={{fontSize: 24, fontWeight: 700}}>people you know by name</span></> : <><span style={{color: '#7df9c6'}}>100</span> <span style={{fontSize: 24, fontWeight: 700}}>for life</span></>}
      </div>
    </div>
  );
};

export const fadeIn = (t: number, a: number, d = 0.25) => keys(t, [[a, 0], [a + d, 1, LIN]]);

// ---- pilot Cast2.tsx: the pose types ----
export type Arm = {a: number; f: number}; // upper outward angle, forearm angle relative to the upper arm

export type ScarfCutPose = {
  lean: number; headTilt: number; open: number; lid: number; pupil: [number, number];
  browLift: number; browSad: number; armL: Arm; armR: Arm; tail: number; sweat: number; bob: number;
};

export type ManCutPose = {
  phase: number; walk: number; lean: number; headTilt: number; headDip: number;
  pupil: [number, number]; lid: number; rice: Arm; free: number; turn?: number;
};

// ---- pilot CutoutC.tsx: Scarf's and the rice-ball man's moves in the two-shot ----
type Key = [number, number, ((x: number) => number)?];
const SCARF_LEAN: Key[] = [[0.85, 0], [1.02, -4, OUT], [1.5, -1.5], [4.0, -1.5], [4.15, -3], [4.55, 6, BACK], [5.25, 6], [5.7, 0]];

export const scarfAt = (l: number): ScarfCutPose => {
  const lean = keys(l, SCARF_LEAN);
  const wave = l > 4.45 && l < 5.25 ? Math.sin((l - 4.45) * 14) * 22 * Math.sin(((l - 4.45) / 0.8) * Math.PI) : 0;
  return {
    lean,
    bob: Math.sin(l * 2.1) * 4,
    headTilt: keys(l, [[4.15, 0], [4.55, 6, BACK], [5.25, 6], [5.7, -4]]),
    open: keys(l, [[0.85, 1], [1.02, 1.25, BACK], [2.6, 1.18], [3.0, 1.0], [4.4, 1.0], [4.55, 1.12, BACK], [5.3, 1.08], [5.7, 0.92]]),
    lid: blinkAt(l, [0.4, 2.35, 3.95, 5.85]),
    pupil: [
      keys(l, [[0, -0.3], [0.5, 0.2], [1.0, 0.9], [2.95, 0.9], [3.2, 0.7], [3.6, 0.7], [3.85, 0.9], [5.3, 0.9], [5.7, 0.2]]),
      keys(l, [[2.95, 0], [3.2, -0.7], [3.6, -0.7], [3.85, 0], [5.3, 0], [5.7, 0.5]]),
    ],
    browLift: keys(l, [[0.85, 0], [1.02, 40, BACK], [2.6, 32], [3.0, 14], [4.4, 14], [4.55, 36], [5.3, 32], [5.7, 6]]),
    browSad: keys(l, [[2.7, 0], [3.1, 16], [5.3, 16], [5.7, 26]]),
    armL: {a: keys(l, [[0.9, 6], [1.05, 22, BACK], [1.6, 6], [5.3, 6], [5.7, 2]]), f: keys(l, [[0.9, 0], [1.05, 25, BACK], [1.6, 0]])},
    armR: {
      a: keys(l, [[0.9, 6], [1.05, 24, BACK], [1.6, 6], [4.0, 6], [4.15, 2], [4.55, 100, BACK], [5.25, 100], [5.6, 2]]),
      f: keys(l, [[0.9, 0], [1.05, 30, BACK], [1.6, 0], [4.0, 0], [4.15, -4], [4.55, 30, BACK], [5.25, 30], [5.6, 0]]) + wave,
    },
    tail: (lean - keys(l - 0.15, SCARF_LEAN)) * 3 + Math.sin(l * 1.7) * 4,
    sweat: keys(l, [[3.0, 0], [3.3, 1]]),
  };
};

const STRIDE = 150; // screen px the man covers per full walk cycle at his scale
export const manAt = (l: number, stride = STRIDE) => {
  const x = keys(l, [[0, 1120], [0.8, 860, LIN], [1.2, 770, OUT]]);
  const walk = keys(l, [[0, 1], [0.85, 1], [1.2, 0, OUT]]);
  const chew = l > 2.0 ? Math.abs(Math.sin(l * 10)) * 6 : 0;
  const phase = ((1120 - x) / stride) * Math.PI * 2;
  return {
    x,
    p: {
      phase,
      walk,
      lean: keys(l, [[0.95, 0], [1.12, -3, OUT], [1.45, 0.6], [1.7, 0]]),
      headTilt: keys(l, [[2.9, 0], [3.3, 5]]),
      headDip: keys(l, [[1.9, 0], [2.0, 14], [2.15, 0], [2.5, 0], [2.6, 14], [2.75, 0]]) + chew,
      pupil: [keys(l, [[0, -0.7], [1.1, -0.4], [2.9, -0.4], [3.25, 0.8]]), keys(l, [[2.9, 0.1], [3.25, -0.9]])] as [number, number],
      lid: blinkAt(l, [2.2, 4.9]),
      free: 4 - Math.sin(phase) * 8 * walk,
      rice: {
        a: keys(l, [[0, 4 + Math.sin(phase) * 8 * walk], [1.1, 4], [1.28, 8], [1.75, -22, BACK]]),
        f: keys(l, [[0, 2], [1.1, 2], [1.28, 6], [1.75, -138, BACK], [1.95, -146], [2.1, -138], [2.55, -146], [2.7, -138]]),
      },
    } as ManCutPose,
  };
};

// ---- pilot Cast4.tsx: Scarf4 and Man4 take the legacy `s` (drawn height SCARF_H * s, MAN_H * s) ----
const kOf = (parts: Parts, legacyH: number, s: number) => (s * legacyH) / personH(parts);

// Face centre on screen for a puppet with feet at `feet` drawn at legacy scale s.
export const faceY = (parts: Parts, legacyH: number, feet: number, s: number) => {
  const k = kOf(parts, legacyH, s);
  return feet - personH(parts) * k + parts.head.h * (parts.face?.[1] ?? 0.6) * k;
};
export const scarfFaceY = (c: Pilot, feet: number, s: number) => faceY(c.SCARF, SCARF_H, feet, s);
export const manFaceY = (c: Pilot, feet: number, s: number) => faceY(c.SALARY, MAN_H, feet, s);
export const manK = (c: Pilot, s: number) => kOf(c.SALARY, MAN_H, s);

export const Scarf4: React.FC<{x: number; y: number; s: number; p: ScarfCutPose}> = ({x, y, s, p}) => {
  const {SCARF} = usePilot();
  return (
    <Person
      parts={SCARF}
      x={x}
      y={y}
      s={kOf(SCARF, SCARF_H, s)}
      p={{
        lean: p.lean, headTilt: p.headTilt, pupil: p.pupil, lid: p.lid, open: 0.8 + 0.2 * p.open, big: true,
        smile: Math.max(-1, Math.min(1, 0.35 + p.lid * 1.4 - (p.browSad / 25) * 1.4 + (p.browLift / 30) * 0.15)),
        browLift: p.browLift, browSad: p.browSad, mouth: Math.max(0, (p.open - 1.05) * 3), bob: p.bob * 2,
        armL: p.armL, armR: p.armR, turn: 0,
      }}
    />
  );
};

// Held in the fingers, below the hand, so it sits at his mouth rather than over his face.
export const RiceBall: React.FC<{rot?: number; k?: number}> = ({rot = 0, k = 0.62}) => {
  const {PROPS} = usePilot();
  return (
    <div style={{position: 'absolute', transform: `rotate(${rot}deg) scale(${k}) translate(${-PROPS.rice.w / 2}px, ${PROPS.rice.h * 0.05}px)`, transformOrigin: '0 0'}}>
      <Part src={PROPS.rice.src} w={PROPS.rice.w} h={PROPS.rice.h} pivot={[0, 0]} at={[0, 0]} />
    </div>
  );
};

export const Man4: React.FC<{x: number; y: number; s: number; p: ManCutPose}> = ({x, y, s, p}) => {
  const c = usePilot();
  const {SALARY} = c;
  const turn = p.turn ?? 0;
  return (
    <Person
      parts={SALARY}
      x={x}
      y={y}
      s={manK(c, s)}
      p={{
        phase: p.phase, walk: p.walk, dir: turn > 0.05 ? 1 : -1, lean: p.lean, headTilt: p.headTilt,
        headDip: p.headDip * (SALARY.head.h / 538), pupil: p.pupil, lid: p.lid, turn,
        armL: p.rice, holdL: <RiceBall rot={-(p.rice.a + p.rice.f)} />, armR: {a: p.free + 2, f: -5 - 14 * p.walk},
      }}
    />
  );
};
