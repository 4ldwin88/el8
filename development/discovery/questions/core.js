// Canonical Discovery candidate question-bank source.
// Built as small modules to keep files reviewable and avoid oversized generated blobs.

const Q = (id, role, text, targets = [], options = [], burden = 0.2, mode = 'single') => ({
  id,
  role,
  text,
  targets,
  burden,
  mode,
  options: options.map(([optionId, label, effects = {}]) => ({ id: optionId, label, effects })),
});

const SCALE = [
  ['well', 'Very well', -0.75],
  ['okay', 'Okay', -0.25],
  ['strain', 'Not great', 0.4],
  ['hard', 'Really struggling', 0.8],
  ['unsure', 'Not sure', 0],
];

const scale = target => SCALE.map(([id, label, value]) => [id, label, { [target]: value }]);

export const CORE_QUESTIONS = Object.freeze([
  Q('G1', 'gateway', 'What’s been bothering you lately? Select any that fit.', [], [
    ['money', 'Money', { money_pressure: 0.65 }],
    ['work', 'Work or school', { work_instability: 0.55, schedule_disruption: 0.2 }],
    ['health', 'Health or physical condition', { physical_condition: 0.65 }],
    ['energy', 'Low energy or tiredness', { low_energy: 0.65 }],
    ['sleep', 'Sleep', { poor_sleep: 0.65 }],
    ['stress', 'Stress or emotions', { stress: 0.6 }],
    ['relationships', 'Relationships', { relationship_strain: 0.6 }],
    ['support', 'Feeling lonely or unsupported', { low_support: 0.6, lonely: 0.4 }],
    ['home', 'Home or surroundings', { home_instability: 0.6 }],
    ['focus', 'Focus or motivation', { low_focus: 0.35, low_activation: 0.25 }],
    ['direction', 'Direction or purpose', { lack_direction: 0.6 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.35, 'multi'),

  Q('D1', 'discriminator', 'If one thing improved this week, what would help most?', [], [
    ['money', 'Money feeling easier', { money_pressure: 0.5 }],
    ['work', 'Work or school feeling steadier', { work_instability: 0.5 }],
    ['sleep', 'Sleeping better', { poor_sleep: 0.5 }],
    ['energy', 'Having more energy', { low_energy: 0.45 }],
    ['people', 'Relationships or support', { relationship_strain: 0.35, low_support: 0.35 }],
    ['stress', 'Feeling less stressed', { stress: 0.45 }],
    ['home', 'Things at home feeling easier', { home_instability: 0.45 }],
    ['direction', 'Feeling clearer about what to do next', { lack_direction: 0.45 }],
    ['unsure', 'Not sure', {}],
  ], 0.3),

  Q('D2', 'discriminator', 'Does the main problem feel more outside you or inside you?', [], [
    ['outside', 'Mostly something happening in my life', { work_instability: 0.25, money_pressure: 0.25, relationship_strain: 0.2, home_instability: 0.2 }],
    ['inside', 'Mostly how I’ve been feeling', { stress: 0.25, low_energy: 0.2, low_focus: 0.2, low_activation: 0.15 }],
    ['both', 'Both', {}],
    ['unsure', 'Not sure', {}],
  ], 0.2),

  Q('HV1', 'healthy-verification', 'Overall, is anything meaningfully getting in the way of daily life right now?', [], [
    ['no', 'No', { work_instability: -0.2, money_pressure: -0.2, relationship_strain: -0.2, low_support: -0.2, home_instability: -0.2, lack_direction: -0.2 }],
    ['minor', 'Only minor things', {}],
    ['yes', 'Yes', {}],
  ], 0.14),

  Q('SL1', 'state-probe', 'How has your sleep been lately?', ['poor_sleep'], scale('poor_sleep'), 0.16),
  Q('E1', 'state-probe', 'How has your energy been?', ['low_energy'], scale('low_energy'), 0.16),
  Q('ST1', 'state-probe', 'How has your stress been?', ['stress'], scale('stress'), 0.16),
  Q('F1', 'state-probe', 'How easy has it been to focus on what you need to do?', ['low_focus'], scale('low_focus'), 0.16),
]);

export { Q, scale };
