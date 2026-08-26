import { Q, scale } from './core.js';

// Spiritual owns meaning, purpose and direction. The member-facing wording remains
// broad enough to support religious and non-religious interpretations of meaning.
export const SPIRITUAL_QUESTIONS = Object.freeze([
  Q('P1', 'driver-probe', 'Do you feel clear about what you are working toward right now?', ['lack_direction'], [
    ['yes', 'Yes', { lack_direction: -0.65 }], ['partly', 'Partly', { lack_direction: 0.25 }], ['no', 'Not really', { lack_direction: 0.7 }],
  ], 0.18),
  Q('P2', 'driver-probe', 'Does daily life feel meaningful enough to you right now?', ['lack_direction'], scale('lack_direction'), 0.18),
  Q('P3', 'discriminator', 'What feels most unclear or missing right now?', ['lack_direction'], [
    ['priority', 'Knowing what matters most right now', { lack_direction: 0.35 }], ['future', 'A longer-term direction or goal', { lack_direction: 0.4 }], ['meaning', 'A sense that daily life matters', { lack_direction: 0.45 }], ['values', 'Knowing what I want my choices to reflect', { lack_direction: 0.35 }], ['action', 'I know the direction but not the next step', { lack_direction: 0.2, low_activation: 0.15 }], ['unsure', 'Not sure', {}],
  ], 0.16),
  Q('P4', 'feasibility-probe', 'What could make it difficult to act on a clearer direction right now? Select any that fit.', ['lack_direction'], [
    ['time', 'Time or competing demands', { schedule_disruption: 0.1 }], ['money', 'Money or financial constraints', { money_pressure: 0.1 }], ['energy', 'Low energy', { low_energy: 0.1 }], ['support', 'Lack of support from people around me', { low_support: 0.1 }], ['starting', 'Difficulty getting started', { low_activation: 0.15 }], ['none', 'Nothing obvious', {}],
  ], 0.1, 'multi'),
]);
