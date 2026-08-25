import { Q } from './core.js';

export const PHYSICAL_EMOTIONAL_QUESTIONS = Object.freeze([
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

  Q('ST2', 'discriminator', 'What seems most connected to the stress?', ['stress'], [
    ['work', 'Work or school', { work_instability: 0.5 }],
    ['money', 'Money', { money_pressure: 0.5 }],
    ['people', 'Relationships', { relationship_strain: 0.45, low_support: 0.15 }],
    ['home', 'Home or surroundings', { home_instability: 0.4 }],
    ['internal', 'The stress is still there even when nothing specific is going wrong', { stress: 0.3 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),

  Q('F2', 'discriminator', 'What seems to get in the way of focus most?', ['low_focus'], [
    ['tired', 'Feeling tired', { low_energy: 0.35, poor_sleep: 0.25 }],
    ['stress', 'Stress or worry', { stress: 0.35 }],
    ['direction', 'Not knowing what to work toward', { lack_direction: 0.45 }],
    ['motivation', 'Difficulty getting started', { low_activation: 0.35 }],
    ['interruptions', 'Too many demands or interruptions', { schedule_disruption: 0.25 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),
]);
