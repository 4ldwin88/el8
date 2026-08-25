import { Q, scale } from './core.js';

// Physical owns body, activity, sleep, energy and activation investigation. Questions
// may emit evidence about drivers in other dimensions without changing ownership.
export const PHYSICAL_QUESTIONS = Object.freeze([
  Q('PH0', 'concern-scope', 'Which physical-health areas feel relevant? Select any that fit.', ['physical_condition'], [
    ['body', 'Weight, fitness, or physical condition', { physical_condition: 0.55 }],
    ['activity', 'Physical activity', { physical_condition: 0.25, low_activity: 0.35 }],
    ['symptoms', 'Physical symptoms or discomfort', { physical_condition: 0.5 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.28, 'multi'),
  Q('PH1', 'state-probe', 'How has your physical activity been lately?', ['low_activity'], scale('low_activity'), 0.16),
  Q('PH2', 'state-probe', 'Are weight, fitness, or your physical condition bothering you right now?', ['physical_condition'], [
    ['no', 'No', { physical_condition: -0.65 }],
    ['little', 'A little', { physical_condition: 0.25 }],
    ['yes', 'Yes', { physical_condition: 0.7 }],
    ['unsure', 'Not sure', {}],
  ], 0.17),
  Q('PH3', 'state-probe', 'How hard has it been to get yourself started on things you intend to do?', ['low_activation'], [
    ['easy', 'Usually easy', { low_activation: -0.65 }],
    ['sometimes', 'Sometimes hard', { low_activation: 0.3 }],
    ['hard', 'Often hard', { low_activation: 0.7 }],
    ['unsure', 'Not sure', {}],
  ], 0.17),

  Q('SL1', 'state-probe', 'How has your sleep been lately?', ['poor_sleep'], scale('poor_sleep'), 0.16),
  Q('SL2', 'discriminator', 'What seems to interfere with sleep most?', ['poor_sleep'], [
    ['schedule', 'Schedule or timing', { schedule_disruption: 0.55 }],
    ['stress', 'Stress or thoughts', { stress: 0.45 }],
    ['home', 'Home or surroundings', { home_instability: 0.4 }],
    ['body', 'Physical discomfort or health', { poor_sleep: 0.25, physical_condition: 0.15 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),
  Q('SL3', 'confirmation', 'When you sleep better, does your energy or focus noticeably improve?', ['poor_sleep'], [
    ['yes', 'Yes', { poor_sleep: 0.35, low_energy: 0.15, low_focus: 0.1 }],
    ['some', 'Somewhat', { poor_sleep: 0.15 }],
    ['no', 'Not really', { poor_sleep: -0.2 }],
  ], 0.18),

  Q('E1', 'state-probe', 'How has your energy been?', ['low_energy'], scale('low_energy'), 0.16),
  Q('E2', 'discriminator', 'What seems connected to your low energy? Select all that fit.', ['low_energy'], [
    ['sleep', 'Poor sleep', { poor_sleep: 0.5 }],
    ['schedule', 'Busy or irregular schedule', { schedule_disruption: 0.4 }],
    ['stress', 'Stress', { stress: 0.35 }],
    ['activity', 'Not being active enough', { low_activity: 0.4 }],
    ['body', 'Health or physical condition', { physical_condition: 0.4 }],
    ['motivation', 'Low motivation or difficulty getting started', { low_activation: 0.4, lack_direction: 0.15 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.2, 'multi'),
]);
