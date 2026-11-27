import React from 'react';
import {vi} from 'vitest';

vi.mock('remotion', async (orig) => {
  const real = await orig<typeof import('remotion')>();
  return {...real, Img: (p: React.ImgHTMLAttributes<HTMLImageElement>) => React.createElement('img', p), staticFile: (s: string) => `/public/${s}`};
});
