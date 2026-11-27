// The toolkit demo's shots, each given local time lt (seconds into the shot) and l (0..1 through it).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SetPlate, hAtFor} from '../film/Set';
import {Crowd} from '../film/Crowd';
import {SCARF_H, personH} from '../rig/scale';
import {camAt} from '../toolkit/camera';
import {Atmosphere} from '../toolkit/Atmosphere';
import {Foreground} from '../toolkit/Foreground';
import {DataCard} from '../toolkit/Data';
import {Person} from '../rig/Person';
import {Actor, CAST, KINDS, STATION, Shot, scaleAt, scarfScale} from './stage';

export type Beat = {lt: number; l: number};
const {wide, high, close} = STATION;
const scarf = CAST.scarf;
const BIG = {big: true};

const WideCrowd: React.FC<{t: number}> = ({t}) => {
  const hAt = hAtFor(wide, SCARF_H);
  return <Crowd t={t} n={12} seed={200} y0={470} y1={596} hAt={hAt} speed={150} kinds={KINDS} clear={[500, 780, 560, 700]} />;
};

// 1. Establishing push on Scarf, rim-lit from the set's key light, dust in the air.
export const PushRim: React.FC<Beat> = ({lt, l}) => (
  <>
    <Shot cam={camAt({move: 'push', z: [1.05, 1.4], focus: [640, 500]}, l, lt)} bg={<SetPlate angle={wide} />}>
      <WideCrowd t={lt} />
      <Actor parts={scarf} x={640} y={600} s={scarfScale(wide)} t={lt} base={BIG} seed={1} rim={wide.key} farShade={0.15}
        acts={[{act: 'idle'}, {act: 'react', mood: 'smile', at: 1.5}, {act: 'look', dir: -1, at: 2.6}]} />
    </Shot>
    <Atmosphere kind="dust" t={lt} seed={3} />
  </>
);

// 2. Two-shot: the salaryman walks up, sees it and is shocked; Scarf smirks. A blurred commuter passes in front.
export const TwoShot: React.FC<Beat> = ({lt, l}) => {
  const sy = 600, s = scaleAt(wide, CAST.salary, sy);
  return (
    <>
      <Shot cam={camAt({move: 'drift', z: [1.55, 1.55], focus: [650, 500], amount: 10}, l, lt)} bg={<SetPlate angle={wide} blur={2} />}>
        <WideCrowd t={lt + 4} />
        <Actor parts={scarf} x={590} y={600} s={scarfScale(wide)} t={lt} base={BIG} seed={1} rim={wide.key}
          acts={[{act: 'talk', at: 0.2, to: 1.6}, {act: 'react', mood: 'smirk', at: 2.1}, {act: 'look', dir: 1, at: 1.8}]} />
        <Actor parts={CAST.salary} x={720} y={sy} s={s} t={lt} seed={5} rim={wide.key} farShade={0.15}
          acts={[{act: 'walkIn', at: 0, to: 1.3, dir: -1}, {act: 'react', mood: 'shocked', at: 1.5}, {act: 'cower', at: 1.6}]} />
      </Shot>
      <Foreground x={-420 + lt * 140} y={140} s={0.9} blur={14}>
        <Person parts={CAST.gent} x={0} y={1300} s={1} p={{phase: lt * 5, walk: 1, dir: 1}} />
      </Foreground>
      <Atmosphere kind="dust" t={lt + 4} seed={3} strength={0.6} />
    </>
  );
};

// 3. Giant face close-up: the plate blurred and darker behind, Scarf's face filling the frame, in awe, then shocked.
export const FaceClose: React.FC<Beat> = ({lt, l}) => {
  const s = 0.95;
  const y = 330 + (personH(scarf) - scarf.head.h * 0.5) * s; // head centred near the frame's middle
  return (
    <>
      <Shot cam={camAt({move: 'push', z: [1.04, 1.12], focus: [640, 340]}, l, lt)} bg={<AbsoluteFill style={{filter: 'brightness(0.6)'}}><SetPlate angle={close} blur={10} /></AbsoluteFill>}>
        <Actor parts={scarf} x={640} y={y} s={s} t={lt} base={BIG} seed={2} rim={close.key} shadow={false}
          acts={[{act: 'react', mood: 'awe', at: 0.4}, {act: 'react', mood: 'shocked', at: 1.9}]} />
      </Shot>
      <Atmosphere kind="streak" t={lt} seed={5} />
    </>
  );
};

// 4. A spoken number on screen: the high angle pans across the crowd while "3,500,000 people / day" counts up.
export const DataBeat: React.FC<Beat> = ({lt, l}) => (
  <>
    <Shot cam={camAt({move: 'pan', z: [1.2, 1.2], focus: [520, 380], to: [760, 380]}, l, lt)} bg={<SetPlate angle={high} />}>
      <Crowd t={lt} n={26} seed={400} y0={205} y1={466} hAt={hAtFor(high, SCARF_H)} speed={120} kinds={KINDS} />
      <Actor parts={scarf} x={640} y={470} s={scarfScale(high)} t={lt} base={BIG} seed={1} acts={[{act: 'look', dir: 1, at: 0.5}]} />
    </Shot>
    <Atmosphere kind="dust" t={lt} seed={8} strength={0.7} />
    <DataCard t={lt} at={0.4} to={2.9} title="people / day" value={3500000} />
  </>
);
