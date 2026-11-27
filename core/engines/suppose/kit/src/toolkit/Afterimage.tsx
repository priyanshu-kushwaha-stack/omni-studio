// Afterimage: four fading copies trail a fast move. render(dt) draws the subject dt seconds from now (dt <= 0);
// copies sit `trail` seconds apart, oldest and faintest first, under the live one.
import React from 'react';

const COPIES = [0.08, 0.16, 0.26, 0.4];

export const Afterimage: React.FC<{trail: number; render: (dt: number) => React.ReactNode}> = ({trail, render}) => (
  <>
    {COPIES.map((op, i) => (
      <div key={i} style={{position: 'absolute', inset: 0, opacity: op}}>
        {render(-(COPIES.length - i) * trail)}
      </div>
    ))}
    {render(0)}
  </>
);
