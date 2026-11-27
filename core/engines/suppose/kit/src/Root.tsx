import React from 'react';
import {Composition, Still} from 'remotion';
import {FPS, W, H} from './film/Cam';
import {Toolkit, TOOLKIT_FRAMES} from './demo/Toolkit';
import {Thumb} from './toolkit/Thumb';

// Kit compositions. Paths given to staticFile are library-relative (channels/say-suppose/library is the public dir).
export const Root: React.FC = () => (
  <>
    <Composition id="Toolkit" component={Toolkit} durationInFrames={TOOLKIT_FRAMES} fps={FPS} width={W} height={H} />
    <Still id="Thumb" component={Thumb} width={W} height={H} defaultProps={{art: 'sets/station/wide.png', caption: 'Only 100 people', number: '100'}} />
  </>
);
