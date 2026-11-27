import React from 'react';
import {Composition} from 'remotion';
import {FPS, W, H, TEST_SECONDS} from './timing';
import {LookA} from './LookA';
import {LookB} from './LookB';
import {MotionC, MOTION_SECONDS} from './MotionC';
import {CutoutC} from './CutoutC';
import {CutoutC2} from './CutoutC2';
import {Pilot60, PILOT_SECONDS} from './Pilot60';
import {CastTest4} from './CastTest4';

export const Root: React.FC = () => (
  <>
    <Composition id="LookA" component={LookA} durationInFrames={TEST_SECONDS * FPS} fps={FPS} width={W} height={H} />
    <Composition id="LookB" component={LookB} durationInFrames={TEST_SECONDS * FPS} fps={FPS} width={W} height={H} />
    <Composition id="LookC" component={LookA} defaultProps={{plate: true}} durationInFrames={TEST_SECONDS * FPS} fps={FPS} width={W} height={H} />
    <Composition id="MotionC" component={MotionC} durationInFrames={Math.round(MOTION_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CutoutC" component={CutoutC} durationInFrames={Math.round(MOTION_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CutoutC2" component={CutoutC2} durationInFrames={Math.round(MOTION_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CastTest4" component={CastTest4} durationInFrames={30} fps={FPS} width={W} height={H} />
    <Composition id="Pilot60" component={Pilot60} durationInFrames={Math.round(PILOT_SECONDS * FPS)} fps={FPS} width={W} height={H} />
  </>
);
