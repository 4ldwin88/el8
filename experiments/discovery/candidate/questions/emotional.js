import { Q, scale } from './core.js';

// Emotional owns stress/emotional-state investigation. Deepening questions stay
// evidence-focused: Planning decides what to do with the resulting state.
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
  Q('ST3', 'deepening', 'How long has this been materially affecting you?', ['stress'], [
    ['days', 'Days', { stress: 0.15 }],
    ['weeks', 'A few weeks', { stress: 0.3 }],
    ['months', '1–3 months', { stress: 0.45 }],
    ['longer', 'More than 3 months', { stress: 0.6 }],
  ], 0.12),
  Q('ST4', 'impact-probe', 'How much is this interfering with ordinary daily functioning?', ['stress'], [
    ['mild', 'Noticeable but manageable', { stress: 0.2 }],
    ['moderate', 'Disrupting some routines', { stress: 0.45 }],
    ['high', 'Disrupting several important routines', { stress: 0.7 }],
  ], 0.14),
  Q('ST5', 'support-probe', 'What tends to help, even a little?', ['stress'], [
    ['rest', 'Rest or recovery time', {}],
    ['movement', 'Movement or being outside', {}],
    ['person', 'Talking with someone I trust', { low_support: -0.25 }],
    ['structure', 'Structure or reducing demands', { schedule_disruption: -0.2 }],
    ['reflection', 'Reflection or a calming practice', {}],
    ['nothing', 'Nothing clearly helps yet', { stress: 0.2 }],
  ], 0.12),
]);
