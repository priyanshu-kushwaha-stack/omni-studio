// A generic cut-out person from a Parts set (castData.ts). Joints are proportional to each piece, so any parts sheet
// drawn in the cast's layout rigs the same way. Feet at (x, y); `s` scales the whole puppet.
import React from 'react';
import {Part, Face, out} from './Puppet';
import type {Parts} from './castData';

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
  armL?: {a: number; f: number};
  armR?: {a: number; f: number};
  holdR?: React.ReactNode; // drawn at the right hand, in forearm pixels
  armRFront?: boolean; // draw the right arm over the body (holding something up)
  turn?: number; // -1 (faces screen left) .. 1 (faces right): a three-quarter turn faked by squash and a face shift
};

const P = (n: number, m: number) => [n, m] as [number, number];

export const Person: React.FC<{parts: Parts; x: number; y: number; s: number; p: PersonPose; filter?: string}> = ({parts, x, y, s, p, filter}) => {
  const {head, torso, uarmL, uarmR, farmL, farmR, thighL, thighR, shinL, shinR} = parts;
  const w = p.walk ?? 0, ph = p.phase ?? 0, dir = p.dir ?? -1;
  const thigh = (o: number) => -dir * Math.sin(ph + o) * 14 * w;
  const shin = (o: number) => dir * Math.max(0, Math.sin(ph + o + 1.3)) * 30 * w;
  const bob = -Math.abs(Math.cos(ph)) * 0.03 * torso.h * w;
  const legLen = thighL.h * 0.86 + shinL.h * 0.95;
  const swing = Math.sin(ph) * 18 * w;
  const aL = p.armL ?? {a: 4 + swing, f: 4};
  const aR = p.armR ?? {a: 4 - swing, f: 4};
  const eyes = p.eyes ?? 1;
  const pu = p.pupil ?? [0, 0];
  const lid = p.lid ?? 0;
  const ex = head.w * 0.11, ey = head.h * 0.6, er = head.h * 0.034;
  const turn = p.turn ?? dir * w; // walkers turn toward where they go
  const fx = turn * ex * 0.9; // the face slides toward the turn
  const squash = 1 - 0.16 * Math.abs(turn);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, transformOrigin: '0 0', filter}}>
      <div style={{position: 'absolute', transformOrigin: '0 0', transform: `rotate(${(p.lean ?? 0) + turn * 3 * w}deg) translateY(${bob}px) scaleX(${squash})`}}>
        <Part src={torso.src} w={torso.w} h={torso.h} pivot={P(torso.w / 2, torso.h * 0.97)} at={P(0, -legLen)}>
          <Part src={thighR.src} w={thighR.w} h={thighR.h} pivot={P(thighR.w / 2, thighR.h * 0.08)} at={P(torso.w * 0.68, torso.h * 0.95)} rot={thigh(Math.PI)} z={-2}>
            <Part src={shinR.src} w={shinR.w} h={shinR.h} pivot={P(shinR.w * 0.45, shinR.h * 0.05)} at={P(thighR.w / 2, thighR.h * 0.93)} rot={shin(Math.PI)} z={-1} />
          </Part>
          <Part src={thighL.src} w={thighL.w} h={thighL.h} pivot={P(thighL.w / 2, thighL.h * 0.08)} at={P(torso.w * 0.32, torso.h * 0.95)} rot={thigh(0)} z={-1}>
            <Part src={shinL.src} w={shinL.w} h={shinL.h} pivot={P(shinL.w * 0.55, shinL.h * 0.05)} at={P(thighL.w / 2, thighL.h * 0.93)} rot={shin(0)} z={-1} />
          </Part>
          <Part src={uarmL.src} w={uarmL.w} h={uarmL.h} pivot={P(uarmL.w / 2, uarmL.h * 0.08)} at={P(torso.w * 0.13, torso.h * 0.17)} rot={out(aL.a, -1)} z={-1}>
            <Part src={farmL.src} w={farmL.w} h={farmL.h} pivot={P(farmL.w / 2, farmL.h * 0.07)} at={P(uarmL.w / 2, uarmL.h * 0.92)} rot={out(aL.f, -1)} z={-1} />
          </Part>
          <Part src={uarmR.src} w={uarmR.w} h={uarmR.h} pivot={P(uarmR.w / 2, uarmR.h * 0.08)} at={P(torso.w * 0.87, torso.h * 0.17)} rot={out(aR.a, 1)} z={p.armRFront ? 3 : -1}>
            <Part src={farmR.src} w={farmR.w} h={farmR.h} pivot={P(farmR.w / 2, farmR.h * 0.07)} at={P(uarmR.w / 2, uarmR.h * 0.92)} rot={out(aR.f, 1)} z={p.armRFront ? 1 : -1}>
              {p.holdR && <div style={{position: 'absolute', left: farmR.w / 2, top: farmR.h * 0.86, zIndex: 3}}>{p.holdR}</div>}
            </Part>
          </Part>
          <Part src={head.src} w={head.w} h={head.h} pivot={P(head.w / 2, head.h * 0.95)} at={P(torso.w / 2 + turn * torso.w * 0.07, torso.h * 0.07 + (p.headDip ?? 0))} rot={p.headTilt ?? 0} z={1}>
            <Face w={head.w} h={head.h}>
              <g opacity={eyes}>
                {[-1, 1].map((k) => (
                  <ellipse key={k} cx={head.w / 2 + k * ex * (1 - 0.25 * Math.abs(turn)) + fx + pu[0] * er * 0.6} cy={ey + pu[1] * er * 0.6} rx={er * 0.8} ry={er * (1 - lid) + 1.5} fill="#1b1414" />
                ))}
                <g stroke="#2a1d18" strokeWidth={er * 0.55} strokeLinecap="round">
                  <line x1={head.w / 2 - ex * 1.55 + fx} y1={ey - er * 2.3} x2={head.w / 2 - ex * 0.5 + fx} y2={ey - er * 2.2} />
                  <line x1={head.w / 2 + ex * 0.5 + fx} y1={ey - er * 2.2} x2={head.w / 2 + ex * 1.55 + fx} y2={ey - er * 2.3} />
                </g>
              </g>
            </Face>
          </Part>
        </Part>
      </div>
    </div>
  );
};

// Screen px a person of scale s covers per full walk cycle, so feet don't slide (matched to the 14-degree stride).
export const strideAt = (parts: Parts, s: number) => (parts.thighL.h * 0.86 + parts.shinL.h * 0.95) * s * 0.97;
