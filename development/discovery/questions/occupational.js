import { Q, scale } from './core.js';

// Occupational owns work/school stability and schedule questions. Cross-dimensional
// effects remain explicit in the evidence emitted by individual answers.
export const OCCUPATIONAL_QUESTIONS = Object.freeze([
  Q('W1', 'driver-probe', 'How stable does work or school feel right now?', ['work_instability'], scale('work_instability'), 0.18),
  Q('W2', 'driver-probe', 'Are you worried that your work, hours, role, or income could change soon?', ['work_instability'], [
    ['no', 'No', { work_instability: -0.65 }],
    ['little', 'A little', { work_instability: 0.25 }],
    ['yes', 'Yes', { work_instability: 0.7 }],
    ['na', 'Not applicable', { work_instability: -0.4 }],
  ], 0.2),
  Q('B1', 'bridge', 'Which best describes what is happening with work right now?', ['work_instability', 'money_pressure'], [
    ['no_work', 'I currently do not have work', { work_instability: 0.75 }],
    ['money', 'Money or income pressure is affecting my work choices', { money_pressure: 0.25, work_instability: 0.15 }],
    ['stability', 'My work, hours, or income feel unstable', { work_instability: 0.4 }],
    ['fit', 'My work is stable enough, but it is not a good fit', { work_instability: -0.15, lack_direction: 0.45 }],
    ['separate', 'Work is not a major problem for me right now', { work_instability: -0.55 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.22),
  Q('SC1', 'driver-probe', 'How much control do you have over your daily schedule?', ['schedule_disruption'], [
    ['good', 'A lot', { schedule_disruption: -0.55 }],
    ['some', 'Some', { schedule_disruption: 0.15 }],
    ['little', 'A little', { schedule_disruption: 0.4 }],
    ['very_little', 'Very little', { schedule_disruption: 0.6 }],
  ], 0.18),
]);
