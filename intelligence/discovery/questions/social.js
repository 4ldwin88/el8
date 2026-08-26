import { Q, scale } from './core.js';

// Social owns relationship quality, support and belonging questions. Relationship
// strain and low support remain distinct evidence targets even though they interact.
export const SOCIAL_QUESTIONS = Object.freeze([
  Q('R1', 'driver-probe', 'How are your closest relationships going?', ['relationship_strain'], scale('relationship_strain'), 0.18),
  Q('R2', 'driver-probe', 'Is conflict or tension with someone taking up a lot of your attention?', ['relationship_strain'], [
    ['no', 'No', { relationship_strain: -0.6 }], ['some', 'Some', { relationship_strain: 0.3 }], ['yes', 'Yes', { relationship_strain: 0.7 }],
  ], 0.18),
  Q('R3', 'discriminator', 'What feels hardest about relationships right now?', ['relationship_strain', 'low_support'], [
    ['conflict', 'Conflict or tension', { relationship_strain: 0.6 }], ['distance', 'Feeling distant', { low_support: 0.35, relationship_strain: 0.25 }], ['support', 'Not feeling supported', { low_support: 0.6 }], ['trust', 'Trust or uncertainty', { relationship_strain: 0.5 }], ['none', 'Nothing major', { relationship_strain: -0.45, low_support: -0.25 }],
  ], 0.22),
  Q('R4', 'feasibility-probe', 'If EL8 suggested a relationship-related action, what should it account for? Select any that fit.', ['relationship_strain'], [
    ['other_person', 'The other person may not be willing to participate', { relationship_strain: 0.1 }], ['safety', 'Direct contact or confrontation would not feel safe or appropriate', { relationship_strain: 0.2 }], ['distance', 'Distance or limited contact', {}], ['time', 'Limited time or conflicting schedules', { schedule_disruption: 0.08 }], ['boundaries', 'I need to maintain distance or boundaries', {}], ['none', 'No obvious limitation', {}],
  ], 0.11, 'multi'),
  Q('S1', 'driver-probe', 'Do you have someone you can reliably turn to when you need support?', ['low_support'], [
    ['yes', 'Yes', { low_support: -0.65 }], ['sometimes', 'Sometimes', { low_support: 0.25 }], ['no', 'Not really', { low_support: 0.7 }],
  ], 0.16),
  Q('S2', 'driver-probe', 'Have you been feeling alone even when other people are around?', ['low_support', 'lonely'], [
    ['no', 'No', { low_support: -0.4, lonely: -0.5 }], ['sometimes', 'Sometimes', { low_support: 0.25, lonely: 0.35 }], ['often', 'Often', { low_support: 0.6, lonely: 0.7 }],
  ], 0.18),
  Q('S3', 'discriminator', 'What kind of connection feels most missing?', ['low_support'], [
    ['talk', 'Someone to really talk to', { low_support: 0.5 }], ['practical', 'Practical help', { low_support: 0.4 }], ['belonging', 'Feeling included or understood', { low_support: 0.55, lonely: 0.3 }], ['none', 'I do not feel something is missing', { low_support: -0.55 }],
  ], 0.2),
  Q('S4', 'feasibility-probe', 'What makes getting more support or connection difficult right now? Select any that fit.', ['low_support'], [
    ['people', 'I do not have the right people available', { low_support: 0.2 }], ['trust', 'Trust or opening up is difficult', { low_support: 0.12 }], ['time', 'Time or schedule', { schedule_disruption: 0.08 }], ['access', 'Distance, transportation, or access', {}], ['energy', 'I do not have much energy for social effort', { low_energy: 0.1 }], ['none', 'Nothing obvious', {}],
  ], 0.11, 'multi'),
]);
