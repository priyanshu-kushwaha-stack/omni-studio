// The film's colours and type (W5): gold for key numbers, coral for alarming ones, cream for labels, blueprint blue
// for diagrams, navy for the blueprint ground; green is the pilot's readout colour.
import {loadFont as loadFredoka} from '@remotion/google-fonts/Fredoka';
import {loadFont as loadNunito} from '@remotion/google-fonts/Nunito';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';

export const GOLD = '#ffc24a';
export const CORAL = '#ff6b5a';
export const CREAM = '#f4efe6';
export const BLUEPRINT = '#7fb6ff';
export const NAVY = '#0f1d3a';
export const GREEN = '#2fbf71';

// Fonts load once per bundle. Outside a browser (vitest, node) FontFace is missing and the loader only returns names.
const fredoka = loadFredoka('normal', {weights: ['700'], subsets: ['latin']}).fontFamily;
const nunito = loadNunito('normal', {weights: ['900'], subsets: ['latin']}).fontFamily;
const playfair = loadPlayfair('italic', {weights: ['900'], subsets: ['latin']}).fontFamily;

export const TITLE_FONT = `${fredoka}, 'Avenir Next', Arial, sans-serif`; // Fredoka 700
export const LABEL_FONT = `${nunito}, 'Avenir Next', Arial, sans-serif`; // Nunito 900
export const END_FONT = `${playfair}, Georgia, serif`; // Playfair Display 900 italic
// The pilot's face, kept as is so RuleCard, Title and Readout stay pixel-equal to pilot v8. New parts use LABEL_FONT.
export const FONT = "'Avenir Next', 'Helvetica Neue', Arial, sans-serif";
