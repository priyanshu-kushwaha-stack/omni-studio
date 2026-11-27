// Building blocks for the 60 s pilot: painted sets, the walking crowd, the 99/100 readout, the phone list, rule cards,
// the title and the 600 -> 100 board. Times are film seconds; word times come from whisper on narr_a.wav.
import React from 'react';
import {Img, staticFile} from 'remotion';
import {W, H} from './timing';
import {keys, BACK, OUT, IO, LIN} from './rig';
import {Person, strideAt} from './Person';
import {WOMAN, GREY, RICEMAN, type Parts} from './castData';
import {rnd} from './People2D';
import type {ScarfCutPose} from './Cast2';

export const FONT = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
export const GREEN = '#2fbf71';
export const AMBER = '#ffb347';

// Camera: slow push and drift on a layer. k = parallax depth (background < 1).
export const camStyle = (s: number, cx: number, cy: number, k: number, origin = '50% 60%'): React.CSSProperties => ({
  position: 'absolute', inset: 0, transformOrigin: origin,
  transform: `scale(${1 + (s - 1) * k}) translate(${-cx * k}px, ${-cy * k}px)`,
});

export const SetImg: React.FC<{which: 'wide' | 'close'; blur?: number}> = ({which, blur = 0}) => (
  <Img src={staticFile(`cut/set_${which}.png`)} style={{position: 'absolute', left: -60, top: -40, width: W + 120, height: H + 70, filter: blur ? `blur(${blur}px)` : undefined}} />
);

// Scarf at rest, with overrides.
export const scarfRest = (t: number, o: Partial<ScarfCutPose> = {}): ScarfCutPose => ({
  lean: 0, headTilt: 0, open: 1, lid: 0, pupil: [0, 0], browLift: 0, browSad: 0,
  armL: {a: 6, f: 0}, armR: {a: 6, f: 0}, tail: Math.sin(t * 1.7) * 4, sweat: 0, bob: Math.sin(t * 2.1) * 4, ...o,
});

const KINDS: Parts[] = [WOMAN, GREY, RICEMAN];
const TINTS = ['none', 'brightness(0.9)', 'saturate(0.8)', 'brightness(1.06) saturate(0.9)', 'sepia(0.2)'];

// Commuters walking across the floor of a set. Depth from y: farther = smaller and softer. Feet never slide.
export const Crowd: React.FC<{t: number; n: number; seed: number; y0: number; y1: number; s0: number; s1: number; speed: number; clear?: [number, number]; front?: boolean}> = ({
  t, n, seed, y0, y1, s0, s1, speed, clear, front,
}) => {
  const span = W + 500;
  const people = Array.from({length: n}).map((_, k) => {
    const i = k + seed;
    const y = y0 + rnd(i, 3) * (y1 - y0);
    const s = s0 + ((y - y0) / Math.max(1, y1 - y0)) * (s1 - s0);
    const parts = KINDS[Math.floor(rnd(i, 4) * KINDS.length)];
    const dir: 1 | -1 = rnd(i, 7) > 0.5 ? 1 : -1;
    const v = speed * (0.75 + rnd(i, 8) * 0.5) * (s / s1);
    const x = ((((rnd(i, 9) * span + dir * v * t) % span) + span) % span) - 250;
    const phase = ((v * t) / strideAt(parts, s)) * Math.PI * 2 + i;
    return {i, x, y, s, parts, dir, phase};
  });
  people.sort((a, b) => a.y - b.y);
  return (
    <>
      {people.map((q) => {
        if (clear && q.x > clear[0] && q.x < clear[1] && !front) return null;
        const far = (q.y - y0) / Math.max(1, y1 - y0);
        const blur = front ? 10 : far < 0.3 ? 1.6 : 0;
        const tint = TINTS[Math.floor(rnd(q.i, 11) * TINTS.length)];
        const filter = [tint === 'none' ? '' : tint, blur ? `blur(${blur}px)` : ''].join(' ').trim() || undefined;
        return <Person key={q.i} parts={q.parts} x={q.x} y={q.y} s={q.s} filter={filter} p={{phase: q.phase, walk: 1, dir: q.dir, pupil: [q.dir * 0.6, 0]}} />;
      })}
    </>
  );
};

// The glowing list readout over your head.
export const Readout: React.FC<{x: number; y: number; t: number; t0: number; text?: string}> = ({x, y, t, t0, text = '99 / 100'}) => {
  const a = keys(t, [[t0, 0], [t0 + 0.5, 1, OUT]]);
  if (a <= 0) return null;
  const sc = keys(t, [[t0, 0.6], [t0 + 0.55, 1, BACK]]);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${sc})`, opacity: a, fontFamily: FONT, fontWeight: 800, fontSize: 46, color: '#eafff4', padding: '6px 22px', borderRadius: 40, border: `3px solid ${GREEN}`, background: 'rgba(10,30,22,.55)', textShadow: `0 0 18px ${GREEN}, 0 0 4px ${GREEN}`, boxShadow: `0 0 32px rgba(47,191,113,.55)`, whiteSpace: 'nowrap', letterSpacing: 1}}>
      {text}
    </div>
  );
};

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

export const RuleCard: React.FC<{t: number; t0: number; n: string; text: string}> = ({t, t0, n, text}) => {
  const k = keys(t, [[t0, 0], [t0 + 0.45, 1, BACK]]);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 60, top: 54, transform: `translateX(${(1 - k) * -60}px) rotate(${(1 - k) * -6 - 1.5}deg)`, opacity: Math.min(1, k * 1.4), fontFamily: FONT, background: '#fbf6ea', color: '#1b1a22', borderRadius: 14, padding: '14px 24px 16px', boxShadow: '0 14px 30px rgba(0,0,0,.35)', maxWidth: 560}}>
      <div style={{fontSize: 18, fontWeight: 800, color: '#1f8f52', letterSpacing: 2}}>RULE {n}</div>
      <div style={{fontSize: 34, fontWeight: 900, lineHeight: 1.1, marginTop: 4}}>{text}</div>
    </div>
  );
};

// Title words land one by one with the narration.
export const Title: React.FC<{t: number; words: [string, number][]}> = ({t, words}) => (
  <div style={{position: 'absolute', left: 80, right: 80, top: 110, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 74, lineHeight: 1.05, color: '#fff', textShadow: '0 6px 0 rgba(0,0,0,.35), 0 0 30px rgba(0,0,0,.45)'}}>
    {words.map(([w, at], i) => {
      const k = keys(t, [[at - 0.05, 0], [at + 0.25, 1, BACK]]);
      const hot = w === '100';
      return (
        <span key={i} style={{display: 'inline-block', margin: '0 12px', opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 30}px) scale(${0.8 + 0.2 * k})`, color: hot ? GREEN : '#fff'}}>
          {w}
        </span>
      );
    })}
  </div>
);

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
