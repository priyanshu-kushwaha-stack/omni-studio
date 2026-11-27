// The 60 s pilot, cut-out method (owner, 2026-11-27: "Yes, build 60 s"). Script A, voice B narration, shots timed to
// whisper word times. One painted set pair, one cast style, all motion animated here.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS, W, H} from './timing';
import {keys, LIN, OUT, BACK, IO, drift, blinkAt} from './rig';
import {Shadow} from './Puppet';
import {Grade, FactPill} from './Overlays';
import {Scarf2, Man2} from './Cast2';
import {scarfAt, manAt} from './CutoutC';
import {Person} from './Person';
import {KENJI, WOMAN, GREY} from './castData';
import {camStyle, SetImg, scarfRest, Crowd, Readout, Phone, RuleCard, Title, BoardDots, FONT, GREEN} from './FilmParts';

export const PILOT_SECONDS = 59.5;

type Shot = {from: number; to: number; C: React.FC<{t: number; l: number}>};

const push = (l: number, d: number, s1 = 1.06) => keys(l, [[0, 1], [d, s1, LIN]]);

// Wide concourse with the crowd split around you so depth reads right.
const Wide: React.FC<{t: number; l: number; d: number; speed: number; dense: number; you?: React.ReactNode; s1?: number; clear?: [number, number]}> = ({t, l, d, speed, dense, you, s1 = 1.08, clear = [470, 720]}) => {
  const s = push(l, d, s1);
  const cx = drift(t, 3), cy = drift(t, 2, 1) - (s - 1) * 120;
  return (
    <>
      <div style={camStyle(s, cx, cy, 0.6)}><SetImg which="wide" /></div>
      <div style={camStyle(s, cx, cy, 1)}>
        <Crowd t={t} n={Math.round(14 * dense)} seed={0} y0={470} y1={592} s0={0.09} s1={0.19} speed={speed} />
        <Shadow x={640} y={600} w={120} />
        {you}
        <Crowd t={t} n={Math.round(8 * dense)} seed={100} y0={612} y1={712} s0={0.2} s1={0.28} speed={speed} clear={clear} />
      </div>
    </>
  );
};

const scarfWide = (t: number, o = {}) => <Scarf2 x={640} y={600} s={0.19} p={scarfRest(t, o)} />;

const S1: Shot['C'] = ({t, l}) => (
  <Wide t={t} l={l} d={3.8} speed={120} dense={1} you={scarfWide(t, {pupil: [Math.sin(t * 1.4) * 0.6, 0], lid: blinkAt(t, [1.6])})} />
);

const S2: Shot['C'] = ({t, l}) => {
  const up = keys(l, [[0, 0], [0.12, 1, BACK]]);
  const p = scarfRest(t, {open: 1.3, browLift: 30, armL: {a: 6 + 140 * up, f: 15 * up}, armR: {a: 6 + 140 * up, f: 15 * up}, lean: -2 * up});
  const s = keys(l, [[0, 1.02], [1.2, 1.08, OUT]]);
  return (
    <>
      <div style={camStyle(s, 0, 0, 0.5)}><SetImg which="close" blur={2} /></div>
      <div style={camStyle(s, 0, 0, 1)}>
        <Crowd t={t} n={6} seed={300} y0={640} y1={650} s0={0.25} s1={0.26} speed={160} clear={[420, 860]} />
        <Shadow x={640} y={660} w={230} />
        <Scarf2 x={640} y={660} s={0.33} p={p} />
        <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
          {[0, 0.22, 0.44].map((dd) => {
            const k = (l - 0.08 - dd) / 0.7;
            return k > 0 && k < 1 ? <circle key={dd} cx={640} cy={345} r={60 + k * 260} fill="none" stroke="#fff" strokeWidth={6 * (1 - k)} opacity={0.8 * (1 - k)} /> : null;
          })}
        </svg>
        {l > 0.75 && <Crowd t={t - 4.6} n={1} seed={402} y0={770} y1={770} s0={0.5} s1={0.5} speed={900} front />}
      </div>
    </>
  );
};

const S3: Shot['C'] = ({t, l}) => {
  const worried = keys(t, [[6.8, 0], [7.3, 1]]);
  const p = {pupil: [Math.sin(t * 1.6) * 0.9, 0] as [number, number], browLift: 10 * worried, browSad: 10 * worried, sweat: keys(t, [[8.9, 0], [9.3, 1]]), lid: blinkAt(t, [6.2, 9.0])};
  return <Wide t={t} l={l} d={5.6} speed={190} dense={1.6} s1={1.03} you={scarfWide(t, p)} />;
};

// The rice-ball moment and the walk-off share the close set.
const Close: React.FC<{t: number; l: number; children: React.ReactNode; d?: number}> = ({t, l, children, d = 6}) => {
  const s = push(l, d);
  const cx = keys(l, [[0, -18], [d, 22, LIN]]) + drift(t, 2.2), cy = drift(t, 1.6, 3);
  return (
    <>
      <div style={camStyle(s, cx, cy, 0.5)}><SetImg which="close" blur={1.5} /></div>
      <div style={camStyle(s, cx, cy, 1)}>{children}</div>
    </>
  );
};

const S4: Shot['C'] = ({t, l}) => {
  const man = manAt(l, 160);
  const sp = scarfAt(l);
  return (
    <Close t={t} l={l} d={6.25}>
      <Shadow x={440} y={652} w={200} />
      <Shadow x={man.x} y={652} w={200} />
      <Scarf2 x={440} y={652} s={0.28} p={{...sp, browLift: sp.browLift * 0.8, browSad: sp.browSad * 0.8}} />
      <Man2 x={man.x} y={652} s={0.27} p={man.p} />
    </Close>
  );
};

const S5: Shot['C'] = ({t, l}) => {
  const mx = keys(l, [[0.2, 770], [2.8, 1500, LIN]]);
  const walk = keys(l, [[0, 0], [0.35, 1]]);
  const phase = ((mx - 770) / 160) * Math.PI * 2;
  const end = manAt(6.2, 160).p;
  const slump = keys(l, [[0.5, 0], [1.4, 1]]);
  const p = scarfRest(t, {browSad: 22 * slump, browLift: 4, pupil: [keys(l, [[0, 0.9], [1.6, 0.2]]), 0.4 * slump], open: 0.95, lean: -2 * slump, headTilt: -5 * slump, armL: {a: 2, f: 0}, armR: {a: 2, f: 0}, lid: 0.25 * slump + blinkAt(l, [1.9])});
  return (
    <Close t={t} l={l} d={3}>
      <Crowd t={t} n={5} seed={500} y0={600} y1={615} s0={0.2} s1={0.21} speed={130} clear={[330, 560]} />
      <Shadow x={440} y={652} w={200} />
      <Shadow x={mx} y={652} w={200} />
      <Scarf2 x={440} y={652} s={0.28} p={p} />
      <Man2 x={mx} y={652} s={0.27} p={{...end, phase, walk: walk * keys(l, [[2.6, 1], [2.8, 1]]), headDip: 0, pupil: [0.6, -0.2], rice: {a: 4 + Math.sin(phase) * 8 * walk, f: -138 + 140 * walk}}} />
    </Close>
  );
};

const S6: Shot['C'] = ({t, l}) => {
  const look = keys(t, [[20.3, 0], [20.6, 1]]);
  const proud = keys(t, [[22.6, 0], [23.0, 1, BACK]]);
  const pulse = 1 + 0.08 * Math.max(0, Math.sin((t - 21.98) * 8)) * (t > 21.98 && t < 22.4 ? 1 : 0);
  const p = scarfRest(t, {pupil: [0, -0.8 * look * (1 - proud)], browLift: 14 * look, lid: 0.45 * proud + blinkAt(t, [21.1]), lean: -2 * proud, bob: Math.sin(t * 2.1) * 4 - 10 * proud});
  const s = push(l, 4.5, 1.1);
  return (
    <>
      <div style={camStyle(s, 0, -10, 0.5)}><SetImg which="close" blur={3} /></div>
      <div style={camStyle(s, 0, -10, 1)}>
        <Shadow x={640} y={690} w={250} />
        <Scarf2 x={640} y={690} s={0.36} p={p} />
        <div style={{position: 'absolute', inset: 0, transform: `scale(${pulse})`, transformOrigin: '640px 150px'}}>
          <Readout x={640} y={150} t={t} t0={20.15} />
        </div>
      </div>
    </>
  );
};

// Your mitten holding the phone, from below.
const PhoneShot: React.FC<{t: number; scroll: number; hi?: number; extra?: React.ReactNode; phone?: Partial<React.ComponentProps<typeof Phone>>}> = ({t, scroll, hi, extra, phone}) => (
  <>
    <div style={{position: 'absolute', inset: 0}}><SetImg which="close" blur={10} /></div>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(20,14,30,.35)'}} />
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${Math.sin(t * 1.3) * 3}px)`}}>
      <Phone t={t} scroll={scroll} hi={hi} {...phone} />
    </div>
    {extra}
  </>
);

const S7: Shot['C'] = ({t}) => {
  const scroll = keys(t, [[24.1, 0], [28.72, 0], [29.1, 42, IO], [30.44, 42], [30.85, 91, IO]]);
  const hi = t > 30.9 ? 99 : t > 28.98 ? 46 : t > 27.94 ? 2 : t > 25.58 ? 0 : undefined;
  return <PhoneShot t={t} scroll={scroll} hi={hi} />;
};

const kenjiWave = (t: number, k: number) => ({a: 40 + 110 * k, f: 40 * k + Math.sin(t * 12) * 18 * k});

const S8: Shot['C'] = ({t, l}) => {
  const k = keys(t, [[32.1, 0], [32.3, 1, BACK]]);
  const see = keys(t, [[32.3, 0], [32.6, 1]]);
  const you = (
    <>
      {scarfWide(t, {pupil: [0.9 * see, -0.3 * see], browLift: 18 * see, open: 1 + 0.15 * see})}
      <Person parts={KENJI} x={930} y={592} s={0.19} p={{armR: kenjiWave(t, k), pupil: [-0.8, 0.2]}} />
    </>
  );
  return <Wide t={t} l={l} d={1.2} speed={120} dense={0.8} s1={1.04} you={you} clear={[470, 1060]} />;
};

const S9: Shot['C'] = ({t, l}) => {
  const wave = keys(t, [[33.2, 0], [33.45, 1, BACK], [34.2, 1], [34.5, 0]]);
  const kx = keys(t, [[33.2, 1350], [34.6, 820, OUT]]);
  const kw = keys(t, [[33.2, 1], [34.4, 1], [34.6, 0]]);
  const up = keys(t, [[34.6, 0], [35.0, 1]]);
  const dim = keys(t, [[36.6, 0], [37.2, 1]]);
  const p = scarfRest(t, {armR: {a: 6 + 120 * wave, f: 30 * wave + Math.sin(t * 12) * 16 * wave}, pupil: [0.8 * (1 - up), -0.85 * up], browLift: 10 * up, browSad: 14 * dim, lid: blinkAt(t, [35.6, 38.4])});
  return (
    <Close t={t} l={l} d={6}>
      <BoardDots t={t} t0={34.4} tOff={36.6} />
      <Shadow x={440} y={652} w={200} />
      <Shadow x={kx} y={652} w={180} />
      <Scarf2 x={440} y={652} s={0.28} p={p} />
      <Person parts={KENJI} x={kx} y={652} s={0.3} p={{phase: ((1350 - kx) / 150) * Math.PI * 2, walk: kw, pupil: [kw ? -0.8 : -0.3 - 0.5 * (1 - up), -0.9 * up], armR: kenjiWave(t, keys(t, [[33.2, 0.7], [34.4, 0.7], [34.7, 0]]))}} />
    </Close>
  );
};

const TITLE: [string, number][] = [['SO', 39.42], ['WHAT', 39.7], ['IF', 39.92], ['ONLY', 40.06], ['100', 40.46], ['PEOPLE', 40.78], ['COULD', 41.12], ['EVER', 41.32], ['SEE', 41.5], ['YOU?', 41.82]];
const S10: Shot['C'] = ({t, l}) => (
  <>
    <Wide t={t} l={l} d={3.6} speed={150} dense={1.2} s1={1.05} you={scarfWide(t, {pupil: [0, -0.6]})} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,20,.55), transparent 55%)'}} />
    <Title t={t} words={TITLE} />
  </>
);

// Rule one: the woman takes a selfie; you wave right behind her; her photo shows nobody.
const S11: Shot['C'] = ({t, l}) => {
  const phoneUp = keys(t, [[44.3, 0], [44.9, 1, BACK]]);
  const wave = keys(t, [[46.2, 0], [46.5, 1, BACK], [48.2, 1], [48.5, 0]]);
  const inset = keys(t, [[49.5, 0], [49.85, 1, BACK]]);
  const phoneNode = (
    <div style={{width: 260, height: 460, borderRadius: 40, background: '#121219', transform: 'translate(-130px,-430px)', boxShadow: '0 0 0 10px #2b2d38'}} />
  );
  const p = scarfRest(t, {armR: {a: 6 + 120 * wave, f: 30 * wave + Math.sin(t * 12) * 18 * wave}, pupil: [0.8, -0.2], browLift: 12 * wave, browSad: keys(t, [[48.6, 0], [49.0, 16]]), lid: blinkAt(t, [44.0, 47.4])});
  return (
    <>
      <Close t={t} l={l} d={8}>
        <Shadow x={470} y={652} w={200} />
        <Shadow x={760} y={652} w={190} />
        <Scarf2 x={470} y={652} s={0.28} p={p} />
        <Person parts={WOMAN} x={760} y={652} s={0.31} p={{armR: {a: 20 + 40 * phoneUp, f: -150 * phoneUp}, holdR: phoneNode, pupil: [0.3, -0.5 * phoneUp], lid: blinkAt(t, [45.5, 48.0])}} />
      </Close>
      <RuleCard t={t} t0={45.1} n="ONE" text="Not on your list? You don't exist to them." />
      {inset > 0 && (
        <div style={{position: 'absolute', right: 70, top: 120, width: 250, height: 440, borderRadius: 30, overflow: 'hidden', boxShadow: `0 0 0 8px #17171f, 0 20px 50px rgba(0,0,0,.5)`, transform: `scale(${inset})`, transformOrigin: 'top right'}}>
          <div style={{position: 'absolute', left: -560, top: -60, width: W, height: H}}><SetImg which="close" /></div>
          <Person parts={WOMAN} x={125} y={880} s={0.62} p={{pupil: [0, 0], lid: 0.35}} />
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: FONT, fontWeight: 800, color: '#fff', fontSize: 18, textShadow: '0 2px 6px #000'}}>her photo</div>
        </div>
      )}
    </>
  );
};

const S12: Shot['C'] = ({t}) => {
  const k = keys(t, [[52.0, 0], [52.5, 1, IO]]);
  return (
    <>
      <PhoneShot t={t} scroll={42} hi={46} phone={{swap: {row: 46, k, to: 'Someone new?'}, swaps: t > 52.3 ? '0 swaps left today' : '1 swap left today'}} />
      <RuleCard t={t} t0={51.15} n="TWO" text="One swap a day." />
    </>
  );
};

// Rule three: a stranger on your list sees you; you cut him; his face goes blank and he walks on.
const S13: Shot['C'] = ({t, l}) => {
  const blank = keys(t, [[55.26, 1], [55.9, 0, IO]]);
  const gx = keys(t, [[56.2, 790], [57.4, 1400, LIN]]);
  const gw = keys(t, [[56.1, 0], [56.3, 1]]);
  const fade = keys(t, [[54.9, 1], [55.4, 0.15]]);
  const hurt = keys(t, [[55.6, 0], [56.0, 1]]);
  const p = scarfRest(t, {pupil: [0.8, 0], browSad: 22 * hurt, browLift: 6, lid: blinkAt(t, [54.4])});
  return (
    <>
      <Close t={t} l={l} d={3.5}>
        <Shadow x={440} y={652} w={200} />
        <Shadow x={gx} y={652} w={190} />
        <Scarf2 x={440} y={652} s={0.28} p={p} />
        <Person parts={GREY} x={gx} y={652} s={0.3} p={{eyes: blank, pupil: [-0.8, 0], phase: ((gx - 790) / 150) * Math.PI * 2, walk: gw, dir: 1, armL: blank > 0.5 ? {a: 25, f: 60 + Math.sin(t * 10) * 15} : undefined}} />
      </Close>
      <div style={{position: 'absolute', right: 60, top: 60, width: 300, padding: '12px 16px', borderRadius: 18, background: 'rgba(15,16,22,.9)', fontFamily: FONT, color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', gap: 12, alignItems: 'center', opacity: keys(t, [[54.0, 0], [54.3, 1]])}}>
        <span style={{color: '#8d8aa3', fontSize: 20}}>63</span>
        <span style={{opacity: fade, textDecoration: t > 54.9 ? 'line-through' : 'none'}}>Mr. Okada</span>
      </div>
      <RuleCard t={t} t0={53.9} n="THREE" text="Cut someone, and they forget you ever existed." />
    </>
  );
};

const S14: Shot['C'] = ({t}) => {
  const tx = keys(t, [[56.95, 470], [58.2, 280, IO]]) + Math.sin(t * 23) * 1.5;
  const ty = keys(t, [[56.95, 760], [58.2, 120, IO], [59.0, 112]]);
  const black = keys(t, [[59.05, 0], [59.12, 1]]);
  return (
    <>
      <PhoneShot t={t} scroll={0} hi={0} phone={{thumb: [tx - (W / 2 - 190), ty - 40]}} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: black}} />
    </>
  );
};

const SHOTS: Shot[] = [
  {from: 0, to: 3.77, C: S1}, {from: 3.77, to: 4.95, C: S2}, {from: 4.95, to: 10.5, C: S3}, {from: 10.5, to: 16.75, C: S4},
  {from: 16.75, to: 19.6, C: S5}, {from: 19.6, to: 24.1, C: S6}, {from: 24.1, to: 32.05, C: S7}, {from: 32.05, to: 33.2, C: S8},
  {from: 33.2, to: 39.3, C: S9}, {from: 39.3, to: 42.9, C: S10}, {from: 42.9, to: 50.9, C: S11}, {from: 50.9, to: 53.8, C: S12},
  {from: 53.8, to: 56.95, C: S13}, {from: 56.95, to: PILOT_SECONDS + 1, C: S14},
];

export const Pilot60: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const C = shot.C;
  return (
    <AbsoluteFill style={{background: '#2a2438', overflow: 'hidden'}}>
      <C t={t} l={t - shot.from} />
      {shot.C === S3 && <FactPill t={t} />}
      {t < 59.05 && <Grade frame={frame} />}
      <Audio src={staticFile('pilot_mix.wav')} />
    </AbsoluteFill>
  );
};
