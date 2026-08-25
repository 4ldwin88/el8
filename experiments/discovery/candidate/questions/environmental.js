import { Q, scale } from './core.js';

// Environmental owns the member's home and immediate surroundings.
export const ENVIRONMENTAL_QUESTIONS = Object.freeze([
  Q('H1', 'driver-probe', 'How supportive does your home environment feel?', ['home_instability'], scale('home_instability'), 0.18),
  Q('H2', 'driver-probe', 'Does your home or immediate environment make daily life harder?', ['home_instability'], [
    ['no', 'No', { home_instability: -0.6 }],
    ['sometimes', 'Sometimes', { home_instability: 0.3 }],
    ['yes', 'Yes', { home_instability: 0.7 }],
  ], 0.18),
]);
