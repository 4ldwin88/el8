import { Q } from './core.js';

// This module owns meaning, purpose and direction. Member-facing wording is deliberately
// inclusive of religious, spiritual and non-religious sources of meaning. These are
// EL8-authored hypothesis items informed by meaning-and-purpose research; they are not
// PROMIS Meaning & Purpose items and must not inherit PROMIS scoring or validation.
// Meaning/purpose is treated as a relatively broad life evaluation, so EL8 does not force
// a short recall period onto these items. Practical barriers remain separate from the
// member's reported sense of meaning or direction.
export const SPIRITUAL_QUESTIONS = Object.freeze([
  Q('P1', 'state-probe', 'Thinking about your life as a whole, how clear is your sense of direction?', ['lack_direction'], [
    ['very', 'Very clear', { lack_direction: -0.7 }],
    ['mostly', 'Mostly clear', { lack_direction: -0.3 }],
    ['somewhat', 'Somewhat clear', { lack_direction: 0.2 }],
    ['little', 'Not very clear', { lack_direction: 0.55 }],
    ['none', 'Not clear at all', { lack_direction: 0.8 }],
    ['unsure', 'Not sure', {}],
  ], 0.18),
  Q('P2', 'state-probe', 'Thinking about your life as a whole, how much does what you do feel meaningful or worthwhile to you?', ['lack_direction'], [
    ['very', 'Very much', { lack_direction: -0.7 }],
    ['quite', 'Quite a bit', { lack_direction: -0.35 }],
    ['somewhat', 'Somewhat', { lack_direction: 0.15 }],
    ['little', 'A little', { lack_direction: 0.5 }],
    ['none', 'Not at all', { lack_direction: 0.8 }],
    ['unsure', 'Not sure', {}],
  ], 0.18),
  Q('P3', 'discriminator', 'If something feels unclear or missing, which description fits best right now?', ['lack_direction'], [
    ['priority', 'I am unsure what deserves my attention now', { lack_direction: 0.35 }],
    ['future', 'I am unsure what I want to work toward longer term', { lack_direction: 0.4 }],
    ['meaning', 'My daily life does not feel very meaningful or worthwhile', { lack_direction: 0.45 }],
    ['values', 'I am unsure what matters most to me when making choices', { lack_direction: 0.35 }],
    ['action', 'I know what matters, but I am unsure what next step to take', { low_activation: 0.15 }],
    ['nothing', 'Nothing feels notably unclear or missing', { lack_direction: -0.45 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.16),
  Q('P4', 'feasibility-probe', 'If you wanted to act on something important to you, what could make that difficult right now? Select any that fit.', ['lack_direction'], [
    ['time', 'Time or competing demands', { schedule_disruption: 0.1 }],
    ['money', 'Money or financial constraints', { money_pressure: 0.1 }],
    ['energy', 'Low energy', { low_energy: 0.1 }],
    ['support', 'Not enough support from people around me', { low_support: 0.1 }],
    ['starting', 'Difficulty getting started', { low_activation: 0.15 }],
    ['uncertainty', 'I am not sure what action would fit', {}],
    ['other', 'Something else', {}],
    ['none', 'Nothing obvious', {}],
    ['unsure', 'Not sure', {}],
  ], 0.1, 'multi'),
]);
