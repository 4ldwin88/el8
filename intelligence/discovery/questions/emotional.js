import { Q } from './core.js';

// Emotional owns stress/emotional-state investigation. These questions describe
// recent experience, context, duration, interference and existing supports; they
// do not diagnose a condition or treat a member's explanation as established cause.
const STRESS_FREQUENCY = [
  ['never', 'Never', { stress: -0.65 }],
  ['rarely', 'Rarely', { stress: -0.3 }],
  ['sometimes', 'Sometimes', { stress: 0.25 }],
  ['often', 'Often', { stress: 0.55 }],
  ['almost_always', 'Almost always', { stress: 0.8 }],
  ['unsure', 'Not sure', {}],
];

export const EMOTIONAL_QUESTIONS = Object.freeze([
  Q('ST1', 'state-probe', 'In the past 7 days, how often did you feel stressed or overwhelmed?', ['stress'], STRESS_FREQUENCY, 0.16),
  Q('ST2', 'discriminator', 'In the past 7 days, when you felt stressed or overwhelmed, what was happening around those times? Select any that fit.', ['stress'], [
    ['work', 'Work or school demands', { work_instability: 0.5 }],
    ['money', 'Money or financial pressure', { money_pressure: 0.5 }],
    ['people', 'Conflict or difficulty with other people', { relationship_strain: 0.45 }],
    ['support', 'Feeling alone or unsupported', { low_support: 0.45 }],
    ['home', 'Problems at home or in my surroundings', { home_instability: 0.4 }],
    ['health', 'Health, pain, sleep, or low energy', { physical_condition: 0.2, poor_sleep: 0.15, low_energy: 0.15 }],
    ['no_clear_event', 'No specific situation consistently stood out', {}],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.2, 'multi'),
  Q('ST3', 'deepening', 'About how long have stress or difficult emotions been noticeably affecting your daily life?', ['stress'], [
    ['days', 'Less than 2 weeks', { stress: 0.15 }],
    ['weeks', '2–4 weeks', { stress: 0.3 }],
    ['months', '1–3 months', { stress: 0.45 }],
    ['longer', 'More than 3 months', { stress: 0.6 }],
    ['not_affecting', 'They are not noticeably affecting daily life', { stress: -0.3 }],
    ['unsure', 'Not sure', {}],
  ], 0.12),
  Q('ST4', 'impact-probe', 'In the past 7 days, how much did stress or difficult emotions interfere with your usual daily activities?', ['stress'], [
    ['none', 'Not at all', { stress: -0.45 }],
    ['little', 'A little', { stress: 0.15 }],
    ['some', 'Somewhat', { stress: 0.35 }],
    ['quite', 'Quite a bit', { stress: 0.6 }],
    ['very', 'Very much', { stress: 0.8 }],
    ['unsure', 'Not sure', {}],
  ], 0.14),
  Q('ST5', 'support-probe', 'In the past 7 days, what, if anything, seemed to make stressful periods easier to handle? Select any that fit.', ['stress'], [
    ['rest', 'Rest or recovery time', {}],
    ['movement', 'Movement or time outside', {}],
    ['person', 'Talking with someone I trust', { low_support: -0.25 }],
    ['structure', 'More structure or fewer demands', { schedule_disruption: -0.2 }],
    ['reflection', 'Quiet time, reflection, or a calming practice', {}],
    ['other', 'Something else', {}],
    ['nothing', 'Nothing clearly helped', {}],
    ['unsure', 'Not sure', {}],
  ], 0.12, 'multi'),
]);
