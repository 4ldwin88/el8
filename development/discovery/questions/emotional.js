import { Q, scale } from './core.js';

// Emotional owns stress/emotional-state investigation. Focus questions are owned by
// Intellectual; cross-dimensional effects still identify external stress drivers.
export const EMOTIONAL_QUESTIONS = Object.freeze([
  Q('ST1', 'state-probe', 'How has your stress been?', ['stress'], scale('stress'), 0.16),
  Q('ST2', 'discriminator', 'What seems most connected to the stress?', ['stress'], [
    ['work', 'Work or school', { work_instability: 0.5 }],
    ['money', 'Money', { money_pressure: 0.5 }],
    ['people', 'Relationships', { relationship_strain: 0.45, low_support: 0.15 }],
    ['home', 'Home or surroundings', { home_instability: 0.4 }],
    ['internal', 'The stress is still there even when nothing specific is going wrong', { stress: 0.3 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),
]);
