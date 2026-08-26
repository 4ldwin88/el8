import { Q, scale } from './core.js';

// Intellectual owns focus/cognitive-engagement investigation. Feasibility evidence is
// limited to constraints that materially change what a realistic focus action can be.
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
  Q('F3', 'feasibility-probe', 'What would a focus-related action need to account for? Select any that fit.', ['low_focus'], [
    ['time', 'I only have short blocks of time', { schedule_disruption: 0.12 }],
    ['interruptions', 'I cannot reliably control interruptions', { schedule_disruption: 0.15 }],
    ['energy', 'My energy varies too much for demanding tasks', { low_energy: 0.15 }],
    ['environment', 'I do not have a reliable place to concentrate', { home_instability: 0.15 }],
    ['starting', 'Getting started is harder than staying focused', { low_activation: 0.2 }],
    ['none', 'No obvious limitation', {}],
  ], 0.11, 'multi'),
]);
