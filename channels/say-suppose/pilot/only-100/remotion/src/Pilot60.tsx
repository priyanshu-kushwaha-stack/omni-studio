// The pilot, cut-out method. v3 (owner, 2026-11-27): everyone sized to Scarf, and shots framed to land each beat:
// a high angle for "busiest station on Earth", a close-up on the shout, the rice ball at your nose, his eyes drifting
// to the board, a low angle for 99/100, a close-up as a stranger's face goes blank. Shots are written on the voice B
// timeline and warped onto Luc's narration (timewarp.ts).
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {FPS, W, H} from './timing';
import {keys, LIN, OUT, BACK, IO, drift, blinkAt} from './rig';
import {Shadow, Part} from './Puppet';
import {Grade, FactPill} from './Overlays';
import {Scarf4, Man4, scarfFaceY, manFaceY, manK} from './Cast4';
import {scarfAt, manAt} from './CutoutC';
import {Person} from './Person';
import type {Parts} from './castData';
import {STUDENT as KENJI, OFFICE as WOMAN, GENT as GREY, SALARY, PROPS} from './castV4';
import {toOld, FILM_SECONDS} from './timewarp';
import {Cam, SetImg, scarfRest, Crowd, Readout, Phone, RuleCard, Title, BoardDots, FONT, SCARF_H, MAN_H, PEER, personH} from './FilmParts';

export const PILOT_SECONDS = Math.ceil(FILM_SECONDS * 10) / 10;

type Shot = {from: number; to: number; C: React.FC<{t: number; l: number}>};

// ---- sizes: Scarf sets the scale on every set; other adults are PEER x his height at the same depth ----
const FEET = 652; // close set floor line
const SC_S = 0.28;
const PEER_PX = SCARF_H * SC_S * PEER;
const MAN_S = PEER_PX / MAN_H;
const pS = (p: Parts) => PEER_PX / personH(p);
const headY = (p: Parts) => FEET - PEER_PX + p.head.h * (p.face?.[1] ?? 0.5) * pS(p);
const SC_HEAD = scarfFaceY(FEET, SC_S); // Scarf's face centre on the close set
const MAN_HEAD = manFaceY(FEET, MAN_S);

const WIDE_SC_S = 0.2; // ground-level wide: Scarf at (640, 600)
const wideH = (y: number) => PEER * SCARF_H * WIDE_SC_S * ((y - 430) / (600 - 430));
const HIGH_SC_S = 0.133; // high angle: Scarf at (640, 470)
const highH = (y: number) => PEER * SCARF_H * HIGH_SC_S * ((y + 150) / (470 + 150));
const closeH = () => PEER_PX * 0.92;

const lerpT = (t: number, a: number, b: number, v0: number, v1: number, e = IO) => keys(t, [[a, v0], [b, v1, e]]);
// Keep the focus far enough from the frame edge that a push never shows past the plate.
const clampF = (z: number, f: number, half: number) => Math.min(Math.max(f, half / z), 2 * half - half / z);
const View: React.FC<{z: number; fx: number; fy: number; bg: React.ReactNode; k?: number; children: React.ReactNode}> = ({z, fx, fy, bg, k = 0.6, children}) => {
  const x = clampF(z, fx, W / 2), y = clampF(z, fy, H / 2);
  return (
    <>
      <Cam z={z} fx={x} fy={y} k={k}>{bg}</Cam>
      <Cam z={z} fx={x} fy={y}>{children}</Cam>
    </>
  );
};

// ---- sets ----
const High: React.FC<{t: number; z: number; fy?: number; speed: number; dense: number; scarf: React.ReactNode}> = ({t, z, fy = 420, speed, dense, scarf}) => {
  const empty: [number, number, number, number] = [500, 780, 395, 545]; // the empty circle around you
  return (
    <View z={z} fx={640 + drift(t, 4)} fy={fy} k={1} bg={<SetImg which="high" />}>
      <Crowd t={t} n={Math.round(22 * dense)} seed={0} y0={205} y1={466} hAt={highH} speed={speed} clear={empty} />
      <div style={{position: 'absolute', left: 640 - 170, top: 470 - 70, width: 340, height: 140, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,236,190,.42), rgba(255,236,190,0))'}} />
      <Shadow x={640} y={470} w={80} />
      {scarf}
      <Crowd t={t} n={Math.round(16 * dense)} seed={100} y0={474} y1={670} hAt={highH} speed={speed * 1.2} clear={empty} />
    </View>
  );
};
const scarfHigh = (t: number, o = {}) => <Scarf4 x={640} y={470} s={HIGH_SC_S} p={scarfRest(t, o)} />;

const Wide: React.FC<{t: number; z: number; fx?: number; fy?: number; speed: number; dense: number; you?: React.ReactNode; clear?: [number, number, number?, number?]}> = ({t, z, fx = 640, fy = 470, speed, dense, you, clear = [500, 780, 560, 700]}) => (
  <View z={z} fx={fx + drift(t, 3)} fy={fy} bg={<SetImg which="wide" />}>
    <Crowd t={t} n={Math.round(14 * dense)} seed={200} y0={470} y1={596} hAt={wideH} speed={speed} clear={clear} />
    <Shadow x={640} y={600} w={130} />
    {you}
    <Crowd t={t} n={Math.round(8 * dense)} seed={300} y0={606} y1={650} hAt={wideH} speed={speed} clear={clear} />
  </View>
);
const scarfWide = (t: number, o = {}) => <Scarf4 x={640} y={600} s={WIDE_SC_S} p={scarfRest(t, o)} />;

const Close: React.FC<{t: number; z: number; fx: number; fy: number; blur?: number; children: React.ReactNode}> = ({t, z, fx, fy, blur = 1.5, children}) => (
  <View z={z} fx={fx + drift(t, 2)} fy={fy + drift(t, 1.4, 3)} k={0.5} bg={<SetImg which="close" blur={blur} />}>{children}</View>
);

// ---- shots (old-timeline seconds) ----
const S1: Shot['C'] = ({t}) => (
  <High t={t} z={lerpT(t, 0, 3.77, 1.0, 1.3, LIN)} speed={95} dense={1} scarf={scarfHigh(t, {pupil: [Math.sin(t * 1.4) * 0.7, -0.2], lid: blinkAt(t, [1.6])})} />
);

const S2: Shot['C'] = ({t, l}) => {
  const up = keys(l, [[0, 0], [0.12, 1, BACK]]);
  const p = scarfRest(t, {open: 1.3, browLift: 30, armL: {a: 6 + 140 * up, f: 15 * up}, armR: {a: 6 + 140 * up, f: 15 * up}, lean: -2 * up});
  return (
    <Close t={t} z={lerpT(l, 0, 1.2, 1.75, 1.95, OUT)} fx={640} fy={SC_HEAD + 40} blur={3}>
      <Crowd t={t} n={6} seed={400} y0={612} y1={622} hAt={closeH} speed={150} clear={[500, 780]} />
      <Shadow x={640} y={FEET} w={200} />
      <Scarf4 x={640} y={FEET} s={SC_S} p={p} />
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
        {[0, 0.22, 0.44].map((dd) => {
          const k = (l - 0.08 - dd) / 0.7;
          return k > 0 && k < 1 ? <circle key={dd} cx={640} cy={SC_HEAD} r={40 + k * 170} fill="none" stroke="#fff" strokeWidth={4 * (1 - k)} opacity={0.8 * (1 - k)} /> : null;
        })}
      </svg>
    </Close>
  );
};

const S3a: Shot['C'] = ({t}) => (
  <High t={t} z={lerpT(t, 4.95, 7.0, 1.32, 1.12)} speed={150} dense={1.5} scarf={scarfHigh(t, {pupil: [Math.sin(t * 1.6) * 0.9, -0.2]})} />
);

const S3b: Shot['C'] = ({t}) => {
  const worried = keys(t, [[7.0, 0.5], [7.4, 1]]);
  const p = {pupil: [Math.sin(t * 1.6) * 0.9, 0] as [number, number], browLift: 10 * worried, browSad: 10 * worried, sweat: keys(t, [[8.9, 0], [9.3, 1]]), lid: blinkAt(t, [9.0])};
  return <Wide t={t} z={lerpT(t, 7.0, 10.5, 1.05, 1.22, LIN)} fy={500} speed={170} dense={1.5} you={scarfWide(t, p)} />;
};

// The man stops 70 px closer than the old blocking so the two-shots read as one space.
const MAN_DX = -70;
const twoShot = (l: number) => {
  const man = manAt(l, 160);
  const sp = scarfAt(l);
  return (
    <>
      <Shadow x={440} y={FEET} w={190} />
      <Shadow x={man.x + MAN_DX} y={FEET} w={180} />
      <Scarf4 x={440} y={FEET} s={SC_S} p={{...sp, browLift: sp.browLift * 0.8, browSad: sp.browSad * 0.8}} />
      <Man4 x={man.x + MAN_DX} y={FEET} s={MAN_S} p={{...man.p, turn: -man.p.walk}} />
    </>
  );
};

const S4a: Shot['C'] = ({t, l}) => (
  <Close t={t} z={lerpT(l, 0, 1.5, 1.12, 1.2)} fx={590} fy={430}>{twoShot(l)}</Close>
);

// Close-up: the rice ball slides in from the right and brushes your nose.
const RiceIn: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `scale(${manK(MAN_S)})`, transformOrigin: '0 0'}}>
    <Part src={SALARY.farmL.src} w={SALARY.farmL.w} h={SALARY.farmL.h} pivot={[SALARY.farmL.w / 2, SALARY.farmL.h * 0.88]} at={[0, 0]} rot={90} />
    <Part src={PROPS.rice.src} w={PROPS.rice.w} h={PROPS.rice.h} pivot={[PROPS.rice.w * 0.6, PROPS.rice.h * 0.5]} at={[0, 0]} z={2} />
  </div>
);
const S4b: Shot['C'] = ({t, l}) => {
  const sp = scarfAt(l + 1.5);
  const hx = keys(t, [[12.0, 760], [12.4, 548, OUT], [12.62, 538], [12.8, 552], [13.3, 556]]);
  const p = {
    ...sp,
    pupil: [0.95, 0.15] as [number, number],
    open: keys(t, [[12.3, 1.05], [12.6, 1.3, BACK]]),
    browLift: keys(t, [[12.3, 8], [12.6, 30, BACK]]) * 0.8,
    browSad: 0,
    lean: keys(t, [[12.55, 0], [12.7, -4, OUT], [13.2, -3]]),
  };
  return (
    <Close t={t} z={lerpT(l, 0, 1.3, 2.45, 2.6, LIN)} fx={495} fy={SC_HEAD + 8} blur={4}>
      <Scarf4 x={440} y={FEET} s={SC_S} p={p} />
      <RiceIn x={hx} y={SC_HEAD + 12} />
    </Close>
  );
};

// Close-up: chewing, his eyes drift up to the board.
const S4c: Shot['C'] = ({t, l}) => {
  const man = manAt(l + 2.8, 160);
  return (
    <Close t={t} z={lerpT(l, 0, 1.5, 2.3, 2.45, LIN)} fx={man.x + MAN_DX} fy={MAN_HEAD + 30} blur={4}>
      <Man4 x={man.x + MAN_DX} y={FEET} s={MAN_S} p={man.p} />
    </Close>
  );
};

const S4d: Shot['C'] = ({t, l}) => (
  <Close t={t} z={lerpT(l, 0, 1.95, 1.22, 1.3, LIN)} fx={580} fy={420}>{twoShot(l + 4.3)}</Close>
);

const S5: Shot['C'] = ({t, l}) => {
  const mx = keys(l, [[0.2, 770 + MAN_DX], [2.8, 1500, LIN]]);
  const walk = keys(l, [[0, 0], [0.35, 1]]);
  const phase = ((mx - 700) / 160) * Math.PI * 2;
  const end = manAt(6.2, 160).p;
  const slump = keys(l, [[0.5, 0], [1.4, 1]]);
  const p = scarfRest(t, {browSad: 22 * slump, browLift: 4, pupil: [keys(l, [[0, 0.9], [1.6, 0.2]]), 0.4 * slump], open: 0.95, lean: -2 * slump, headTilt: -5 * slump, armL: {a: 2, f: 0}, armR: {a: 2, f: 0}, lid: 0.25 * slump + blinkAt(l, [1.9])});
  return (
    <Close t={t} z={lerpT(l, 0.6, 2.7, 1.15, 1.85)} fx={keys(l, [[0.6, 560], [2.7, 450]])} fy={keys(l, [[0.6, 430], [2.7, SC_HEAD + 40]])}>
      <Crowd t={t} n={5} seed={500} y0={600} y1={615} hAt={closeH} speed={130} clear={[330, 560]} />
      <Shadow x={440} y={FEET} w={190} />
      <Shadow x={mx} y={FEET} w={180} />
      <Scarf4 x={440} y={FEET} s={SC_S} p={p} />
      <Man4 x={mx} y={FEET} s={MAN_S} p={{...end, phase, walk, headDip: 0, pupil: [0.6, -0.2], turn: walk, rice: {a: 4 + Math.sin(phase) * 8 * walk, f: -138 + 140 * walk}}} />
    </Close>
  );
};

// Low angle: you, big against the ceiling lights, as 99/100 lights up.
const S6: Shot['C'] = ({t, l}) => {
  const look = keys(t, [[20.3, 0], [20.6, 1]]);
  const proud = keys(t, [[22.6, 0], [23.0, 1, BACK]]);
  const pulse = 1 + 0.08 * (t > 21.98 && t < 22.4 ? Math.max(0, Math.sin((t - 21.98) * 8)) : 0);
  const p = scarfRest(t, {pupil: [0, -0.8 * look * (1 - proud)], browLift: 14 * look, lid: 0.45 * proud + blinkAt(t, [21.1]), lean: -2 * proud, bob: Math.sin(t * 2.1) * 4 - 10 * proud});
  const z = lerpT(l, 0, 4.5, 1.0, 1.08, LIN);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 0%', transform: `scale(${1.35 * (1 + (z - 1) * 0.5)})`}}><SetImg which="close" blur={3.5} /></div>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 100%', transform: `scale(${z})`}}>
        <Scarf4 x={640} y={900} s={0.44} p={p} />
        <div style={{position: 'absolute', inset: 0, transform: `scale(${pulse})`, transformOrigin: '640px 120px'}}>
          <Readout x={640} y={120} t={t} t0={20.15} />
        </div>
      </div>
    </>
  );
};

// Your mitten holding the phone, from below.
const PhoneShot: React.FC<{t: number; scroll: number; hi?: number; z?: number; extra?: React.ReactNode; phone?: Partial<React.ComponentProps<typeof Phone>>}> = ({t, scroll, hi, z = 1, extra, phone}) => (
  <>
    <div style={{position: 'absolute', inset: 0}}><SetImg which="close" blur={10} /></div>
    <div style={{position: 'absolute', inset: 0, background: 'rgba(20,14,30,.35)'}} />
    <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 45%', transform: `translateY(${Math.sin(t * 1.3) * 3}px) scale(${z})`}}>
      <Phone t={t} scroll={scroll} hi={hi} {...phone} />
    </div>
    {extra}
  </>
);

const S7: Shot['C'] = ({t}) => {
  const scroll = keys(t, [[24.1, 0], [28.72, 0], [29.1, 42, IO], [30.44, 42], [30.85, 91, IO]]);
  const hi = t > 30.9 ? 99 : t > 28.98 ? 46 : t > 27.94 ? 2 : t > 25.58 ? 0 : undefined;
  const z = keys(t, [[24.1, 1.0], [25.6, 1.06], [30.9, 1.06], [31.6, 1.16, OUT]]);
  return <PhoneShot t={t} scroll={scroll} hi={hi} z={z} />;
};

const kenjiWave = (t: number, k: number) => ({a: 40 + 110 * k, f: 40 * k + Math.sin(t * 12) * 18 * k});

// Kenji across the hall, the only face turned toward you.
const S8: Shot['C'] = ({t, l}) => {
  const k = keys(t, [[32.1, 0], [32.3, 1, BACK]]);
  const see = keys(t, [[32.3, 0], [32.6, 1]]);
  const ky = 545;
  const you = (
    <>
      {scarfWide(t, {pupil: [0.9 * see, -0.3 * see], browLift: 18 * see, open: 1 + 0.15 * see})}
      <Person parts={KENJI} x={930} y={ky} s={wideH(ky) / personH(KENJI)} p={{armR: kenjiWave(t, k), pupil: [-0.8, 0.2]}} />
    </>
  );
  return <Wide t={t} z={lerpT(l, 0, 1.15, 1.25, 1.32, LIN)} fx={790} fy={500} speed={120} dense={0.9} you={you} clear={[500, 1040, 500, 720]} />;
};

const S9: Shot['C'] = ({t}) => {
  const wave = keys(t, [[33.2, 0], [33.45, 1, BACK], [34.2, 1], [34.5, 0]]);
  const kx = keys(t, [[33.2, 1350], [34.6, 790, OUT]]);
  const kw = keys(t, [[33.2, 1], [34.4, 1], [34.6, 0]]);
  const up = keys(t, [[34.6, 0], [35.0, 1]]);
  const dim = keys(t, [[36.6, 0], [37.2, 1]]);
  const p = scarfRest(t, {armR: {a: 6 + 120 * wave, f: 30 * wave + Math.sin(t * 12) * 16 * wave}, pupil: [0.8 * (1 - up), -0.85 * up], browLift: 10 * up, browSad: 14 * dim, lid: blinkAt(t, [35.6, 38.4])});
  return (
    <Close t={t} z={keys(t, [[33.2, 1.05], [36.4, 1.08], [37.4, 1.16, OUT]])} fx={620} fy={360}>
      <BoardDots t={t} t0={34.4} tOff={36.6} />
      <Shadow x={440} y={FEET} w={190} />
      <Shadow x={kx} y={FEET} w={170} />
      <Scarf4 x={440} y={FEET} s={SC_S} p={p} />
      <Person parts={KENJI} x={kx} y={FEET} s={pS(KENJI)} p={{phase: ((1350 - kx) / 150) * Math.PI * 2, walk: kw, pupil: [kw ? -0.8 : -0.3 - 0.5 * (1 - up), -0.9 * up], armR: kenjiWave(t, keys(t, [[33.2, 0.7], [34.4, 0.7], [34.7, 0]]))}} />
    </Close>
  );
};

const TITLE: [string, number][] = [['SO', 39.42], ['WHAT', 39.7], ['IF', 39.92], ['ONLY', 40.06], ['100', 40.46], ['PEOPLE', 40.78], ['COULD', 41.12], ['EVER', 41.32], ['SEE', 41.5], ['YOU?', 41.82]];
const S10: Shot['C'] = ({t, l}) => (
  <>
    <High t={t} z={lerpT(l, 0, 3.6, 1.18, 1.05, LIN)} fy={470} speed={120} dense={1.2} scarf={scarfHigh(t, {pupil: [0, -0.6]})} />
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,8,20,.6), transparent 55%)'}} />
    <Title t={t} words={TITLE} />
  </>
);

// Rule one: the woman takes a selfie; you wave right behind her; her photo shows nobody.
const S11: Shot['C'] = ({t}) => {
  const phoneUp = keys(t, [[44.3, 0], [44.9, 1, BACK]]);
  const wave = keys(t, [[46.2, 0], [46.5, 1, BACK], [48.2, 1], [48.5, 0]]);
  const inset = keys(t, [[49.5, 0], [49.85, 1, BACK]]);
  const sa = 20 + 30 * phoneUp, sf = -228 * phoneUp; // right arm: upper out, forearm folded up
  const phoneNode = (
    <div style={{position: 'absolute', transform: `rotate(${sa + sf}deg) translate(-70px, -225px)`, transformOrigin: '0 0'}}>
      <div style={{width: 150, height: 270, borderRadius: 26, background: 'linear-gradient(160deg, #3a3d4c, #16171f)', boxShadow: '0 0 0 6px #2b2d38, 0 10px 24px rgba(0,0,0,.4)'}}>
        <div style={{position: 'absolute', left: 18, top: 18, width: 34, height: 34, borderRadius: '50%', background: '#0b0b10', boxShadow: '0 0 0 4px #4a4d5c'}} />
      </div>
    </div>
  );
  const p = scarfRest(t, {armR: {a: 6 + 120 * wave, f: 30 * wave + Math.sin(t * 12) * 18 * wave}, pupil: [0.8, -0.2], browLift: 12 * wave, browSad: keys(t, [[48.6, 0], [49.0, 16]]), lid: blinkAt(t, [44.0, 47.4])});
  return (
    <>
      <Close t={t} z={keys(t, [[42.9, 1.12], [49.4, 1.2], [49.9, 1.32, OUT]])} fx={keys(t, [[49.4, 610], [49.9, 650]])} fy={420}>
        <Shadow x={480} y={FEET} w={190} />
        <Shadow x={740} y={FEET} w={180} />
        <Scarf4 x={480} y={FEET} s={SC_S} p={p} />
        <Person parts={WOMAN} x={740} y={FEET} s={pS(WOMAN)} p={{armR: {a: sa, f: sf}, holdR: phoneNode, armRFront: phoneUp > 0.05, pupil: [0.25, -0.35 * phoneUp], lid: blinkAt(t, [45.5, 48.0])}} />
      </Close>
      <RuleCard t={t} t0={45.1} n="ONE" text="Not on your list? You don't exist to them." />
      {inset > 0 && (
        <div style={{position: 'absolute', right: 70, top: 120, width: 250, height: 440, borderRadius: 30, overflow: 'hidden', boxShadow: `0 0 0 8px #17171f, 0 20px 50px rgba(0,0,0,.5)`, transform: `scale(${inset})`, transformOrigin: 'top right'}}>
          <div style={{position: 'absolute', left: -560, top: -60, width: W, height: H}}><SetImg which="close" /></div>
          <Person parts={WOMAN} x={125} y={880} s={0.62 * 1340 / personH(WOMAN)} p={{pupil: [0, 0], lid: 0.35}} />
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
      <PhoneShot t={t} scroll={42} hi={46} z={keys(t, [[50.9, 1.04], [52.0, 1.12, OUT]])} phone={{swap: {row: 46, k, to: 'Someone new?'}, swaps: t > 52.3 ? '0 swaps left today' : '1 swap left today'}} />
      <RuleCard t={t} t0={51.15} n="TWO" text="One swap a day." />
    </>
  );
};

// Rule three: two-shot, a close-up as his face goes blank, then he walks on.
const S13: Shot['C'] = ({t}) => {
  const blank = keys(t, [[55.26, 1], [55.9, 0, IO]]);
  const gx = keys(t, [[56.2, 760], [57.4, 1400, LIN]]);
  const gw = keys(t, [[56.1, 0], [56.3, 1]]);
  const fade = keys(t, [[54.9, 1], [55.4, 0.15]]);
  const hurt = keys(t, [[55.6, 0], [56.0, 1]]);
  const p = scarfRest(t, {pupil: [0.8, 0], browSad: 22 * hurt, browLift: 6, lid: blinkAt(t, [54.4])});
  const cu = t >= 54.9 && t < 56.2;
  const z = cu ? lerpT(t, 54.9, 56.2, 2.3, 2.45, LIN) : t < 54.9 ? lerpT(t, 53.8, 54.9, 1.12, 1.18, LIN) : 1.12;
  return (
    <>
      <Close t={t} z={z} fx={cu ? 760 : 600} fy={cu ? headY(GREY) + 20 : 420} blur={cu ? 4 : 1.5}>
        <Shadow x={440} y={FEET} w={190} />
        <Shadow x={gx} y={FEET} w={180} />
        <Scarf4 x={440} y={FEET} s={SC_S} p={p} />
        <Person parts={GREY} x={gx} y={FEET} s={pS(GREY)} p={{eyes: blank, pupil: [-0.8, 0], phase: ((gx - 760) / 150) * Math.PI * 2, walk: gw, dir: 1, armL: blank > 0.5 ? {a: 25, f: 60 + Math.sin(t * 10) * 15} : undefined}} />
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
      <PhoneShot t={t} scroll={0} hi={0} z={keys(t, [[56.95, 1.06], [59.0, 1.2, IO]])} phone={{thumb: [tx - (W / 2 - 190), ty - 40]}} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: black}} />
    </>
  );
};

const SHOTS: Shot[] = [
  {from: 0, to: 3.77, C: S1}, {from: 3.77, to: 4.95, C: S2}, {from: 4.95, to: 7.0, C: S3a}, {from: 7.0, to: 10.5, C: S3b},
  {from: 10.5, to: 12.0, C: S4a}, {from: 12.0, to: 13.3, C: S4b}, {from: 13.3, to: 14.8, C: S4c}, {from: 14.8, to: 16.75, C: S4d},
  {from: 16.75, to: 19.6, C: S5}, {from: 19.6, to: 24.1, C: S6}, {from: 24.1, to: 32.05, C: S7}, {from: 32.05, to: 33.2, C: S8},
  {from: 33.2, to: 39.3, C: S9}, {from: 39.3, to: 42.9, C: S10}, {from: 42.9, to: 50.9, C: S11}, {from: 50.9, to: 53.8, C: S12},
  {from: 53.8, to: 56.95, C: S13}, {from: 56.95, to: 999, C: S14},
];

export const Pilot60: React.FC = () => {
  const frame = useCurrentFrame();
  const t = toOld(frame / FPS); // shots are timed on the voice B timeline; see timewarp.ts
  const shot = SHOTS.find((s) => t >= s.from && t < s.to) ?? SHOTS[SHOTS.length - 1];
  const C = shot.C;
  return (
    <AbsoluteFill style={{background: '#2a2438', overflow: 'hidden'}}>
      <C t={t} l={t - shot.from} />
      {(shot.C === S3a || shot.C === S3b) && <FactPill t={t} />}
      {t < 59.05 && <Grade frame={frame} />}
      <Audio src={staticFile('pilot_mix_luc.wav')} />
    </AbsoluteFill>
  );
};
