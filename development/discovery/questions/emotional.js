import { Q } from './core.js';

// Emotional owns stress/emotional-state investigation. Cross-dimensional answer
// effects identify likely external drivers without combining dimension modules.
export const EMOTIONAL_QUESTIONS = Object.freeze([
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
