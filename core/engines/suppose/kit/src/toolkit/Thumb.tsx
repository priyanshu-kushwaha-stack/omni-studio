// The thumbnail's caption and number set in code over the painted art (Decision 10: the art is GPT Image 2.6, the
// words are ours, in the channel face). Readable at phone-feed size: two to four words, a heavy outline.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {GOLD, TITLE_FONT} from './palette';

const outline = (px: number, color: string) => `${px}px ${color}`;

export const Thumb: React.FC<{art: string; caption?: string; number?: string}> = ({art, caption, number}) => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile(art)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
    {number && (
      <div style={{position: 'absolute', right: 48, top: 30, fontFamily: TITLE_FONT, fontWeight: 700, fontSize: 210, lineHeight: 1, color: GOLD, WebkitTextStroke: outline(10, '#141420'), paintOrder: 'stroke', textShadow: '0 10px 0 rgba(0,0,0,.45)'}}>
        {number}
      </div>
    )}
    {caption && (
      <div style={{position: 'absolute', left: 48, bottom: 40, maxWidth: 760, fontFamily: TITLE_FONT, fontWeight: 700, fontSize: 104, lineHeight: 0.95, color: '#fff', textTransform: 'uppercase', WebkitTextStroke: outline(8, '#141420'), paintOrder: 'stroke', textShadow: '0 8px 0 rgba(0,0,0,.45)'}}>
        {caption}
      </div>
    )}
  </AbsoluteFill>
);
