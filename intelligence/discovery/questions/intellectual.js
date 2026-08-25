import { Q, scale } from './core.js';

// Intellectual currently owns focus/cognitive-engagement investigation. The historical
// bank had limited dimension-specific coverage here, so this module preserves only
// supported behavior rather than inventing new questions during reconstruction.
export const INTELLECTUAL_QUESTIONS = Object.freeze([
  Q('F1', 'state-probe', 'How easy has it been to focus on what you need to do?', ['low_focus'], scale('low_focus'), 0.16),
  Q('F2', 'discriminator', 'What seems to get in the way of focus most?', ['low_focus'], [
    ['tired', 'Feeling tired', { low_energy: 0.35, poor_sleep: 0.25 }],
    ['stress', 'Stress or worry', { stress: 0.35 }],
    ['direction', 'Not knowing what to work toward', { lack_direction: 0.45 }],
    ['motivation', 'Difficulty getting started', { low_activation: 0.35 }],
    ['interruptions', 'Too many demands or interruptions', { schedule_disruption: 0.25 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),
]);
