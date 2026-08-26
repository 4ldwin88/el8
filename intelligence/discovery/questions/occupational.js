import { Q, scale } from './core.js';

// Occupational owns work/school stability, fit, load and schedule. Explicit bridges
// between dimensions live in cross-dimensional.js. Feasibility probes capture the
// constraints Planning must respect without deciding the intervention here.
export const OCCUPATIONAL_QUESTIONS = Object.freeze([
  Q('W1', 'driver-probe', 'How stable does work or school feel right now?', ['work_instability'], scale('work_instability'), 0.18),
  Q('W2', 'driver-probe', 'Are you worried that your work, hours, role, or income could change soon?', ['work_instability'], [
    ['no', 'No', { work_instability: -0.65 }], ['little', 'A little', { work_instability: 0.25 }], ['yes', 'Yes', { work_instability: 0.7 }], ['na', 'Not applicable', { work_instability: -0.4 }],
  ], 0.2),
  Q('W3', 'discriminator', 'What part of work or school is hardest right now?', ['work_instability', 'schedule_disruption'], [
    ['stability', 'Not knowing what will happen', { work_instability: 0.6 }], ['schedule', 'Hours or schedule', { schedule_disruption: 0.6 }], ['load', 'Too much to do', { stress: 0.25, low_energy: 0.2 }], ['fit', 'It does not feel like a good fit', { lack_direction: 0.3 }], ['none', 'Nothing major', { work_instability: -0.45, schedule_disruption: -0.35 }],
  ], 0.22),
  Q('W4', 'confirmation', 'If work became stable tomorrow, would a lot of the current pressure ease?', ['work_instability'], [
    ['yes', 'Yes', { work_instability: 0.55 }], ['some', 'Some of it', { work_instability: 0.25 }], ['no', 'Not much', { work_instability: -0.35 }], ['unsure', 'Not sure', {}],
  ], 0.2),
  Q('W5', 'feasibility-probe', 'What could limit your ability to improve the work or school situation right now? Select any that fit.', ['work_instability'], [
    ['time', 'Time or schedule', { schedule_disruption: 0.15 }], ['money', 'I cannot afford a gap or reduction in income', { money_pressure: 0.2 }], ['transport', 'Transportation or location', {}], ['care', 'Caregiving or family responsibilities', { schedule_disruption: 0.12 }], ['credentials', 'Skills, credentials, or experience requirements', {}], ['health', 'Health, energy, or accessibility', { physical_condition: 0.1, low_energy: 0.1 }], ['opportunity', 'Limited suitable opportunities', { work_instability: 0.15 }], ['none', 'Nothing obvious', {}],
  ], 0.12, 'multi'),
  Q('SC1', 'driver-probe', 'How much control do you have over your daily schedule?', ['schedule_disruption'], [
    ['good', 'A lot', { schedule_disruption: -0.55 }], ['some', 'Some', { schedule_disruption: 0.15 }], ['little', 'A little', { schedule_disruption: 0.4 }], ['very_little', 'Very little', { schedule_disruption: 0.6 }],
  ], 0.18),
  Q('SC2', 'confirmation', 'Does your schedule regularly push sleep, meals, or routines off track?', ['schedule_disruption'], [
    ['no', 'No', { schedule_disruption: -0.6 }], ['sometimes', 'Sometimes', { schedule_disruption: 0.3 }], ['often', 'Often', { schedule_disruption: 0.7 }],
  ], 0.18),
]);
