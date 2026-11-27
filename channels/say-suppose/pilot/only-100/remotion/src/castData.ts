// Piece sizes for the generic cut-out people (generated from public/cut3 and public/cut2; see cutout/slice.py).
export type Piece = {src: string; w: number; h: number};
export type Parts = Record<'head' | 'torso' | 'uarmL' | 'uarmR' | 'farmL' | 'farmR' | 'thighL' | 'thighR' | 'shinL' | 'shinR', Piece>;

export const KENJI: Parts = {
  head: {src: 'cut3/k_head.png', w: 423, h: 449},
  torso: {src: 'cut3/k_torso.png', w: 416, h: 470},
  uarmL: {src: 'cut3/k_uarmL.png', w: 133, h: 341},
  uarmR: {src: 'cut3/k_uarmR.png', w: 125, h: 341},
  farmL: {src: 'cut3/k_farmL.png', w: 136, h: 414},
  farmR: {src: 'cut3/k_farmR.png', w: 131, h: 414},
  thighL: {src: 'cut3/k_thighL.png', w: 129, h: 219},
  thighR: {src: 'cut3/k_thighR.png', w: 121, h: 219},
  shinL: {src: 'cut3/k_shinL.png', w: 145, h: 282},
  shinR: {src: 'cut3/k_shinR.png', w: 153, h: 282},
};
export const WOMAN: Parts = {
  head: {src: 'cut3/w_head.png', w: 440, h: 403},
  torso: {src: 'cut3/w_torso.png', w: 406, h: 496},
  uarmL: {src: 'cut3/w_uarmL.png', w: 141, h: 335},
  uarmR: {src: 'cut3/w_uarmR.png', w: 133, h: 336},
  farmL: {src: 'cut3/w_farmL.png', w: 132, h: 404},
  farmR: {src: 'cut3/w_farmR.png', w: 129, h: 403},
  thighL: {src: 'cut3/w_thighL.png', w: 125, h: 205},
  thighR: {src: 'cut3/w_thighR.png', w: 121, h: 206},
  shinL: {src: 'cut3/w_shinL.png', w: 141, h: 277},
  shinR: {src: 'cut3/w_shinR.png', w: 140, h: 274},
};
export const GREY: Parts = {
  head: {src: 'cut3/g_head.png', w: 381, h: 435},
  torso: {src: 'cut3/g_torso.png', w: 410, h: 489},
  uarmL: {src: 'cut3/g_uarmL.png', w: 142, h: 341},
  uarmR: {src: 'cut3/g_uarmR.png', w: 137, h: 342},
  farmL: {src: 'cut3/g_farmL.png', w: 133, h: 397},
  farmR: {src: 'cut3/g_farmR.png', w: 132, h: 397},
  thighL: {src: 'cut3/g_thighL.png', w: 135, h: 212},
  thighR: {src: 'cut3/g_thighR.png', w: 133, h: 212},
  shinL: {src: 'cut3/g_shinL.png', w: 158, h: 274},
  shinR: {src: 'cut3/g_shinR.png', w: 158, h: 273},
};
export const RICEMAN: Parts = {
  head: {src: 'cut2/m_head.png', w: 481, h: 538},
  torso: {src: 'cut2/m_torso.png', w: 460, h: 646},
  uarmL: {src: 'cut2/m_uarmL.png', w: 150, h: 416},
  uarmR: {src: 'cut2/m_uarmR.png', w: 147, h: 418},
  farmL: {src: 'cut2/m_farmL.png', w: 146, h: 509},
  farmR: {src: 'cut2/m_farmR.png', w: 145, h: 510},
  thighL: {src: 'cut2/m_thighL.png', w: 127, h: 285},
  thighR: {src: 'cut2/m_thighR.png', w: 127, h: 285},
  shinL: {src: 'cut2/m_shinL.png', w: 165, h: 375},
  shinR: {src: 'cut2/m_shinR.png', w: 174, h: 375},
};
