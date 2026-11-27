// Screen-space layers over a shot: labels by kind (W5), the readout, atmosphere and scope bars. All times are film time.
import React from 'react';
import {FactPill, Readout} from '../film/Readout';
import {Atmosphere} from '../toolkit/Atmosphere';
import {DataCard, Dimension, Callout} from '../toolkit/Data';
import {Letterbox} from '../toolkit/Letterbox';
import type {LabelIn, ShotData} from './types';

const LABEL_S = 3; // a label with no `to` stays this long (sheetcheck assumes the same)

// "≈ 3,500,000 people" -> prefix "≈ ", 3500000, rest "people". Only whole numbers count up; anything else is null.
export const splitNumber = (text: string) => {
  const m = /^(\D*?)(\d[\d,]*)(?![\d.])(.*)$/.exec(text);
  return m ? {prefix: m[1], value: Number(m[2].replace(/,/g, '')), rest: m[3].trim()} : null;
};

export const Label: React.FC<{lb: LabelIn; t: number}> = ({lb, t}) => {
  const at = lb.at, to = lb.to ?? lb.at + LABEL_S;
  const pill = <FactPill t={t} t0={at} t1={to} text={lb.text} unit={lb.unit} accent={lb.accent} source={lb.source} />;
  switch (lb.kind) {
    case 'data': {
      const n = splitNumber(lb.text);
      if (!n) return pill; // a decimal or a word: show it as said rather than count it up wrong
      const title = [n.rest, lb.title].filter(Boolean).join(' ');
      return <DataCard t={t} at={at} to={to} value={n.value} prefix={n.prefix} title={title} x={lb.x} y={lb.y} />;
    }
    case 'dim':
      return <Dimension t={t} at={at} to={to} x1={lb.x ?? 440} y1={lb.y ?? 640} x2={lb.x2 ?? 840} y2={lb.y2 ?? 640} label={lb.text} />;
    case 'callout':
      return <Callout t={t} at={at} to={to} x={lb.x ?? 640} y={lb.y ?? 420} lx={lb.lx ?? 900} ly={lb.ly ?? 250} text={lb.text} />;
    default:
      return pill;
  }
};

export const Labels: React.FC<{shot: ShotData; t: number}> = ({shot, t}) => (
  <>
    {(shot.labels ?? []).map((lb, i) => <Label key={i} lb={lb} t={t} />)}
    {shot.readout && <Readout x={shot.readout.x ?? 640} y={shot.readout.y ?? 110} t={t} t0={shot.readout.at} text={shot.readout.text} />}
  </>
);

export const Air: React.FC<{shot: ShotData; t: number}> = ({shot, t}) => {
  const a = shot.atmosphere;
  if (!a) return null;
  const spec = typeof a === 'string' ? {kind: a} : a;
  return <Atmosphere kind={spec.kind} t={t} seed={spec.seed} strength={spec.strength} />;
};

export const Scope: React.FC<{shot: ShotData; t: number}> = ({shot, t}) => <Letterbox ratio={shot.letterbox === 'scope' ? 2.39 : null} t={t} t0={shot.from} />;
