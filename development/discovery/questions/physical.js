import { Q } from './core.js';

// Physical owns body, sleep and energy investigation. These questions may expose
// drivers in other dimensions without moving ownership of the question itself.
export const PHYSICAL_QUESTIONS = Object.freeze([
  Q('PH0', 'concern-scope', 'Which physical-health areas feel relevant? Select any that fit.', ['physical_condition'], [
    ['body', 'Weight, fitness, or physical condition', { physical_condition: 0.55 }],
    ['activity', 'Physical activity', { physical_condition: 0.25, low_activity: 0.35 }],
    ['symptoms', 'Physical symptoms or discomfort', { physical_condition: 0.5 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.28, 'multi'),
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
  Q('SL2', 'discriminator', 'What seems to interfere with sleep most?', ['poor_sleep'], [
    ['schedule', 'Schedule or timing', { schedule_disruption: 0.55 }],
    ['stress', 'Stress or thoughts', { stress: 0.45 }],
    ['home', 'Home or surroundings', { home_instability: 0.4 }],
    ['body', 'Physical discomfort or health', { poor_sleep: 0.25, physical_condition: 0.15 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),
]);
