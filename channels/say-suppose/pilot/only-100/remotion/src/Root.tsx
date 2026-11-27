import React from 'react';
import {Composition} from 'remotion';
import {FPS, W, H, TEST_SECONDS} from './timing';
import {LookA} from './LookA';
import {LookB} from './LookB';

export const Root: React.FC = () => (
  <>
    <Composition id="LookA" component={LookA} durationInFrames={TEST_SECONDS * FPS} fps={FPS} width={W} height={H} />
    <Composition id="LookB" component={LookB} durationInFrames={TEST_SECONDS * FPS} fps={FPS} width={W} height={H} />
    <Composition id="LookC" component={LookA} defaultProps={{plate: true}} durationInFrames={TEST_SECONDS * FPS} fps={FPS} width={W} height={H} />
  </>
);
