// The toolkit demo's last three shots: a freeze-frame, a blueprint card and the end screen.
import React from 'react';
import {SetPlate} from '../film/Set';
import {camAt} from '../toolkit/camera';
import {FreezeFrame} from '../toolkit/FreezeFrame';
import {Afterimage} from '../toolkit/Afterimage';
import {Blueprint, BpLine} from '../toolkit/Blueprint';
import {Badge, Callout, Dimension} from '../toolkit/Data';
import {EndScreen} from '../toolkit/EndScreen';
import {Cam} from '../film/Cam';
import {Actor, CAST, STATION, Shot, scaleAt} from './stage';
import type {Beat} from './scenes';

const {wide} = STATION;
const scarf = CAST.scarf;
const BIG = {big: true};
const FREEZE = 1.0; // seconds into the shot

// 5. Scarf strides across with an afterimage; on the impact the picture jolts, flashes and freezes with a badge.
export const Freeze: React.FC<Beat> = ({lt}) => {
  const tf = Math.min(lt, FREEZE); // the action stops at the freeze
  const cam = camAt({move: 'shake', z: [1.3, 1.3], focus: [640, 500], at: FREEZE, amount: 14}, 0, lt);
  const scarfAt = (t: number) => (
    <Actor parts={scarf} x={560} y={600} s={wide.scarf.s} t={t} base={BIG} seed={1} rim={wide.key}
      acts={[{act: 'walk', at: 0, to: 3, from: [-160, 600], dir: 1}, {act: 'react', mood: 'determined', at: 0}]} />
  );
  return (
    <FreezeFrame t={lt} t0={FREEZE} t1={3} badge="100x">
      <Shot cam={cam} bg={<SetPlate angle={wide} />}>
        <Afterimage trail={0.06} render={(dt) => scarfAt(Math.max(0, tf + dt))} />
      </Shot>
    </FreezeFrame>
  );
};

// 6. The blueprint card: a figure and a doorway in line art, a gold highlight, a dimension and a callout.
export const BlueprintCard: React.FC<Beat> = ({lt, l}) => {
  const c = camAt({move: 'push', z: [1, 1.06], focus: [640, 360]}, l, lt);
  return (
    <Cam z={c.z} fx={c.fx} fy={c.fy}>
      <Blueprint t={lt}>
        <BpLine t={lt} at={0.2} d="M520 300 a40 40 0 1 0 0.1 0 M520 380 L520 520 M520 420 L470 480 M520 420 L570 480 M520 520 L480 620 M520 520 L560 620" />
        <BpLine t={lt} at={0.6} d="M700 620 L700 240 L860 240 L860 620" />
        <BpLine t={lt} at={1.2} gold width={5} d="M440 640 L940 640" />
      </Blueprint>
      <Dimension t={lt} at={1.4} to={3.4} x1={420} y1={620} x2={420} y2={260} label="1.7 m" />
      <Callout t={lt} at={1.8} to={3.4} x={520} y={300} lx={330} ly={190} text="you" />
      <Badge t={lt} at={2.2} to={3.4} x={780} y={200} text="2.1 m" />
    </Cam>
  );
};

// 7. The end screen: the question, the comment bubble, subscribe, and the cast lined up, Scarf waving.
export const End: React.FC<Beat> = ({lt}) => {
  const line = [['salary', 330], ['office', 500], ['gran', 800], ['student', 960]] as const;
  const cast = (
    <>
      {line.map(([k, x], i) => (
        <Actor key={k} parts={CAST[k]} x={x} y={700} s={scaleAt(wide, CAST[k], 600) * 1.6} t={lt} seed={10 + i} acts={[{act: 'react', mood: 'happy', at: 0.6 + i * 0.15}]} />
      ))}
      <Actor parts={scarf} x={650} y={705} s={wide.scarf.s * 1.6} t={lt} base={BIG} seed={1} acts={[{act: 'react', mood: 'joy', at: 1}, {act: 'wave', at: 1.2, to: 3}]} />
    </>
  );
  return <EndScreen t={lt} question="Would you still want to be one of the 100?" cast={cast} />;
};
