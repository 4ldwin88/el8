import { Q, scale } from './core.js';

// Spiritual owns meaning, purpose and direction. The member-facing wording remains
// broad enough to support religious and non-religious interpretations of meaning.
export const SPIRITUAL_QUESTIONS = Object.freeze([
  Q('P1', 'driver-probe', 'Do you feel clear about what you are working toward right now?', ['lack_direction'], [
    ['yes', 'Yes', { lack_direction: -0.65 }],
    ['partly', 'Partly', { lack_direction: 0.25 }],
    ['no', 'Not really', { lack_direction: 0.7 }],
  ], 0.18),
  Q('P2', 'driver-probe', 'Does daily life feel meaningful enough to you right now?', ['lack_direction'], scale('lack_direction'), 0.18),
]);
