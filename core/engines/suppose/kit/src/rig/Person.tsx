// A generic cut-out person from a Parts set (castData.ts, cast4.ts). Joints are proportional to each piece, so any
// parts sheet drawn in the cast's layout rigs the same way; v4 sets (cast4.ts) also carry measured hips, shoulders and
// face. Feet at (x, y); `s` scales the whole puppet.
import React from 'react';
import {Part, Face, out} from './Puppet';
import type {Parts} from './types';

export type PersonPose = {
  phase?: number; // walk cycle, radians
  walk?: number; // 0..1 stride
  dir?: 1 | -1; // walking direction on screen
  lean?: number;
  headTilt?: number;
  headDip?: number;
  pupil?: [number, number];
  lid?: number;
  eyes?: number; // 0 = blank face (rule three), 1 = normal
  open?: number; // eye size, 1 normal, 1.3 wide (surprise)
  browLift?: number; // 0..30
  browSad?: number; // 0..25, inner ends up
  mouth?: number; // 0 small smile .. 1 open "o"
  big?: boolean; // emoji-style face: large eyes with whites, thick brows, a mouth that smiles or frowns (Scarf)
  smile?: number; // -1 frown .. 1 smile, with big
  bob?: number; // extra vertical bob, torso pixels
  armL?: {a: number; f: number};
  armR?: {a: number; f: number};
  holdL?: React.ReactNode; // drawn at the left hand, in forearm pixels
  holdR?: React.ReactNode;
  armRFront?: boolean; // draw the right arm over the body (holding something up)
  turn?: number; // -1 (faces screen left) .. 1 (faces right): a three-quarter turn faked by squash and a face shift
};

const P = (n: number, m: number) => [n, m] as [number, number];

type Joints = {pivotY: number; hipY: number; legX: [number, number]; shL: [number, number]; shR: [number, number]; neckY: number; armK: number; armKw: number; elbow: number};
const joints = (parts: Parts): Joints => {
  const {torso, uarmL, uarmR, thighL} = parts;
  if (parts.hip === undefined || !parts.sh) {
    return {pivotY: torso.h * 0.97, hipY: torso.h * 0.95, legX: [torso.w * 0.32, torso.w * 0.68], shL: P(torso.w * 0.13, torso.h * 0.17), shR: P(torso.w * 0.87, torso.h * 0.17), neckY: torso.h * 0.07, armK: 1, armKw: 1, elbow: 0.92};
  }
  const hy = torso.h * parts.hip;
  const off = thighL.w * 0.5;
  // Arms are sized from the body: a hanging hand reaches the waist (owner, 2026-11-27). The elbow stays a real joint
  // near the end of the upper arm, so the arm bends in two parts; pieces are shortened more than they are thinned.
  const reach = (hy - thighL.h * 0.06 + thighL.h * 0.12 - torso.h * 0.16) * 1.44; // owner: 20% longer than the waist cut, then 20% more (v8)
  const farmL = parts.farmL;
  const elbow = 0.86;
  const armK = Math.min(1.25, reach / (uarmL.h * elbow + farmL.h * 0.93));
  const armKw = Math.min(1, Math.max(armK, 0.8));
  return {
    armK,
    armKw,
    elbow,
    pivotY: hy,
    hipY: hy - thighL.h * 0.06,
    legX: [torso.w / 2 - off, torso.w / 2 + off],
    shL: P(torso.w * parts.sh[0] + uarmL.w * armKw * 0.32, torso.h * 0.16),
    shR: P(torso.w * parts.sh[1] - uarmR.w * armKw * 0.32, torso.h * 0.16),
    neckY: torso.h * 0.05,
  };
};

const BigFace: React.FC<{parts: Parts; p: PersonPose; turn: number}> = ({parts, p, turn}) => {
  const {head} = parts;
  const [fcx, fcy, fw] = parts.face ?? [0.5, 0.6, 0.5];
  const cx = head.w * fcx + turn * head.w * fw * 0.12, ey = head.h * fcy - head.h * 0.02;
  const er = head.h * 0.075 * (p.open ?? 1);
  const ex = head.w * fw * 0.22;
  const pu = p.pupil ?? [0, 0];
  const lid = p.lid ?? 0;
  const sm = p.smile ?? 0.3;
  const happyShut = lid > 0.35 && sm > 0.5; // proud: eyes close into ^ ^
  const lift = ((p.browLift ?? 0) / 30) * er * 0.9, sad = ((p.browSad ?? 0) / 25) * er * 0.9;
  const ink = '#241a1c';
  const mo = p.mouth ?? 0;
  const my = ey + er * 2.3, mw = er * (0.85 + 0.25 * Math.abs(sm));
  return (
    <g opacity={p.eyes ?? 1}>
      {sm > 0.45 && [-1, 1].map((k) => <ellipse key={`b${k}`} cx={cx + k * ex * 1.65} cy={ey + er * 1.35} rx={er * 0.55} ry={er * 0.3} fill="#f08a8a" opacity={0.35 * (sm - 0.45) * 2} />)}
      {[-1, 1].map((k) => {
        const x = cx + k * ex;
        if (happyShut) return <path key={k} d={`M${x - er * 0.75} ${ey + er * 0.2} q${er * 0.75} ${-er * 1.1} ${er * 1.5} 0`} stroke={ink} strokeWidth={er * 0.28} fill="none" strokeLinecap="round" />;
        const ry = er * Math.max(0.12, 1 - lid);
        return (
          <g key={k}>
            <ellipse cx={x} cy={ey + (er - ry) * 0.6} rx={er * 0.82} ry={ry} fill="#fbf8f2" stroke={ink} strokeWidth={er * 0.12} />
            {ry > er * 0.3 && <circle cx={x + pu[0] * er * 0.32} cy={ey + pu[1] * er * 0.32 + (er - ry) * 0.6} r={Math.min(er * 0.5, ry * 0.75)} fill={ink} />}
            {ry > er * 0.3 && <circle cx={x + pu[0] * er * 0.32 + er * 0.16} cy={ey + pu[1] * er * 0.32 - er * 0.18} r={er * 0.13} fill="#fff" />}
          </g>
        );
      })}
      <g stroke={ink} strokeWidth={er * 0.3} strokeLinecap="round" fill="none">
        <line x1={cx - ex - er * 0.8} y1={ey - er * 1.45 - lift + sad * 0.2} x2={cx - ex + er * 0.7} y2={ey - er * 1.5 - lift - sad} />
        <line x1={cx + ex - er * 0.7} y1={ey - er * 1.5 - lift - sad} x2={cx + ex + er * 0.8} y2={ey - er * 1.45 - lift + sad * 0.2} />
        {mo > 0.25 ? (
          <ellipse cx={cx} cy={my + er * 0.2} rx={er * (0.45 + 0.2 * mo)} ry={er * 0.75 * mo} fill="#5a2a2a" strokeWidth={er * 0.18} />
        ) : (
          <path d={`M${cx - mw} ${my} Q${cx} ${my + sm * er * 1.1} ${cx + mw} ${my}`} strokeWidth={er * 0.24} />
        )}
      </g>
    </g>
  );
};

const FaceMarks: React.FC<{parts: Parts; p: PersonPose; turn: number}> = ({parts, p, turn}) => {
  const {head} = parts;
  const [fcx, fcy, fw] = parts.face ?? [0.5, 0.6, 0.5];
  const v4 = parts.face !== undefined;
  const ex = v4 ? head.w * fw * 0.2 : head.w * 0.11;
  const ey = head.h * fcy, cx = head.w * fcx;
  const er = head.h * (v4 ? 0.04 : 0.034) * (p.open ?? 1);
  const fx = turn * ex * 0.9; // the face slides toward the turn
  const pu = p.pupil ?? [0, 0];
  const lid = p.lid ?? 0;
  const lift = ((p.browLift ?? 0) / 30) * er * 1.4, sad = ((p.browSad ?? 0) / 25) * er * 1.2;
  const by = ey - er * (v4 ? 2.1 : 2.3) - lift;
  const mo = p.mouth ?? 0;
  return (
    <g opacity={p.eyes ?? 1}>
      {[-1, 1].map((k) => (
        <ellipse key={k} cx={cx + k * ex * (1 - 0.25 * Math.abs(turn)) + fx + pu[0] * er * 0.6} cy={ey + pu[1] * er * 0.6} rx={er * 0.8} ry={er * (1 - lid) + 1.5} fill="#1b1414" />
      ))}
      <g stroke="#2a1d18" strokeWidth={er * 0.55} strokeLinecap="round" fill="none">
        <line x1={cx - ex * 1.55 + fx} y1={by} x2={cx - ex * 0.5 + fx} y2={by - sad + er * 0.1} />
        <line x1={cx + ex * 0.5 + fx} y1={by - sad + er * 0.1} x2={cx + ex * 1.55 + fx} y2={by} />
        {v4 && (mo > 0.3 ? <ellipse cx={cx + fx} cy={ey + er * 3.3} rx={er * 0.6} ry={er * 0.8 * mo} fill="#5a2a24" stroke="none" /> : <path d={`M${cx + fx - er * 0.9} ${ey + er * 3} q${er * 0.9} ${er * 0.7} ${er * 1.8} 0`} strokeWidth={er * 0.4} />)}
      </g>
    </g>
  );
};

export const Person: React.FC<{parts: Parts; x: number; y: number; s: number; p: PersonPose; filter?: string; rim?: {side: 'left' | 'right' | 'top'; color: string}; farShade?: number}> = ({parts, x, y, s, p, filter}) => {
  const {head, torso, uarmL, uarmR, farmL, farmR, thighL, thighR, shinL, shinR} = parts;
  const j = joints(parts);
  const w = p.walk ?? 0, ph = p.phase ?? 0, dir = p.dir ?? -1;
  const thigh = (o: number) => -dir * Math.sin(ph + o) * 14 * w;
  const shin = (o: number) => dir * Math.max(0, Math.sin(ph + o + 1.3)) * 30 * w;
  const bob = -Math.abs(Math.cos(ph)) * 0.03 * torso.h * w + (p.bob ?? 0);
  const legLen = thighL.h * 0.86 + shinL.h * 0.95;
  const swing = Math.sin(ph) * 18 * w;
  // Rest: arms hang along the sides with a slight elbow bend. Walking: the forearm bends and lags the swing (two parts).
  const bend = (o: number) => -5 - 18 * w * (0.5 + 0.5 * Math.sin(ph + o - 0.8));
  const aL = p.armL ?? {a: 8 + swing, f: bend(0)};
  const aR = p.armR ?? {a: 8 - swing, f: bend(Math.PI)};
  const turn = p.turn ?? dir * w; // walkers turn toward where they go
  const ak = j.armK;
  const front = parts.hip !== undefined ? 2 : -1; // v4 bodies: arms lie over the torso, as in a front-view cut-out
  const [ua, fa, ub, fb] = [uarmL, farmL, uarmR, farmR].map((q) => ({src: q.src, w: q.w * j.armKw, h: q.h * ak}));
  const squash = 1 - 0.16 * Math.abs(turn);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', filter}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `rotate(${(p.lean ?? 0) + turn * 3 * w}deg) translateY(${bob}px) scaleX(${squash})`}}>
        <Part src={torso.src} w={torso.w} h={torso.h} pivot={P(torso.w / 2, j.pivotY)} at={P(0, -legLen)}>
          <Part src={thighR.src} w={thighR.w} h={thighR.h} pivot={P(thighR.w / 2, thighR.h * 0.08)} at={P(j.legX[1], j.hipY)} rot={thigh(Math.PI)} z={-2}>
            <Part src={shinR.src} w={shinR.w} h={shinR.h} pivot={P(shinR.w * 0.45, shinR.h * 0.05)} at={P(thighR.w / 2, thighR.h * 0.93)} rot={shin(Math.PI)} z={-1} />
          </Part>
          <Part src={thighL.src} w={thighL.w} h={thighL.h} pivot={P(thighL.w / 2, thighL.h * 0.08)} at={P(j.legX[0], j.hipY)} rot={thigh(0)} z={-1}>
            <Part src={shinL.src} w={shinL.w} h={shinL.h} pivot={P(shinL.w * 0.55, shinL.h * 0.05)} at={P(thighL.w / 2, thighL.h * 0.93)} rot={shin(0)} z={-1} />
          </Part>
          <Part src={ua.src} w={ua.w} h={ua.h} pivot={P(ua.w / 2, ua.h * 0.12)} at={j.shL} rot={out(aL.a, -1)} z={front} clipTop={front > 0 ? 0.09 : 0}>
            <Part src={fa.src} w={fa.w} h={fa.h} pivot={P(fa.w / 2, fa.h * 0.07)} at={P(ua.w / 2, ua.h * j.elbow)} rot={out(aL.f, -1)} z={-1}>
              {p.holdL && <div style={{position: 'absolute', left: fa.w / 2, top: fa.h * 0.86, zIndex: 3}}>{p.holdL}</div>}
            </Part>
          </Part>
          <Part src={ub.src} w={ub.w} h={ub.h} pivot={P(ub.w / 2, ub.h * 0.12)} at={j.shR} rot={out(aR.a, 1)} z={p.armRFront ? 3 : front} clipTop={front > 0 ? 0.09 : 0}>
            <Part src={fb.src} w={fb.w} h={fb.h} pivot={P(fb.w / 2, fb.h * 0.07)} at={P(ub.w / 2, ub.h * j.elbow)} rot={out(aR.f, 1)} z={p.armRFront ? 1 : -1}>
              {p.holdR && <div style={{position: 'absolute', left: fb.w / 2, top: fb.h * 0.86, zIndex: 3}}>{p.holdR}</div>}
            </Part>
          </Part>
          <Part src={head.src} w={head.w} h={head.h} pivot={P(head.w / 2, head.h * 0.95)} at={P(torso.w / 2 + turn * torso.w * 0.07, j.neckY + (p.headDip ?? 0))} rot={p.headTilt ?? 0} z={1}>
            <Face w={head.w} h={head.h}>
              {p.big ? <BigFace parts={parts} p={p} turn={turn} /> : <FaceMarks parts={parts} p={p} turn={turn} />}
            </Face>
          </Part>
        </Part>
      </div>
    </div>
  );
};

// Screen px a person of scale s covers per full walk cycle, so feet don't slide (matched to the 14-degree stride).
export const strideAt = (parts: Parts, s: number) => (parts.thighL.h * 0.86 + parts.shinL.h * 0.95) * s * 0.97;
