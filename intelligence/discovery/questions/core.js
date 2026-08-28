// Canonical Discovery candidate question-bank source.
// Keep cross-cutting questions here; dimension-owned questions live in their own modules.
// EL8-authored question wording is hypothesis evidence until human comprehension/pilot validation supports promotion.

const Q = (id, role, text, targets = [], options = [], burden = 0.2, mode = 'single') => ({
  id,
  role,
  text,
  targets,
  burden,
  mode,
  evidenceStatus: 'hypothesis',
  validationRequirements: Object.freeze(['construct-review','cognitive-interview','adversarial-qa','human-pilot']),
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
  Q('O1', 'orientation', 'Which best describes your usual day right now?', [], [
    ['structured', 'Pretty structured and predictable', { schedule_disruption: -0.25, low_activation: -0.1 }],
    ['busy', 'Busy, with a lot to juggle', { schedule_disruption: 0.3, stress: 0.2 }],
    ['variable', 'It changes a lot from day to day', { schedule_disruption: 0.45 }],
    ['unstructured', 'Mostly unstructured', { schedule_disruption: 0.35, low_activation: 0.25 }],
  ], 0.12),
  Q('O2', 'orientation', 'How active are you in a typical week?', [], [
    ['very', 'Active most days', { low_activity: -0.6, low_energy: -0.15 }],
    ['some', 'Active a few times a week', { low_activity: -0.25 }],
    ['little', 'A little, but not consistently', { low_activity: 0.4 }],
    ['rare', 'Rarely active right now', { low_activity: 0.7, low_energy: 0.15 }],
  ], 0.1),
  Q('O3', 'orientation', 'What tends to pull you forward when life is going well?', [], [
    ['people', 'People I care about', { low_support: -0.2, lack_direction: -0.1 }],
    ['progress', 'Making progress toward something', { lack_direction: -0.2, low_activation: -0.1 }],
    ['enjoyment', 'Fun, hobbies or things I enjoy', { stress: -0.1, low_activation: -0.1 }],
    ['responsibility', 'Responsibilities or people depending on me', { work_instability: -0.05, lack_direction: -0.1 }],
    ['meaning', 'Purpose, values or something bigger than me', { lack_direction: -0.3 }],
    ['unsure', 'I’m not sure right now', { lack_direction: 0.2 }],
  ], 0.12),
  Q('O4', 'orientation', 'When things get harder, what usually throws you off first?', [], [
    ['time', 'Too much to do or not enough time', { schedule_disruption: 0.4, stress: 0.2 }],
    ['energy', 'Low energy or poor sleep', { low_energy: 0.35, poor_sleep: 0.3 }],
    ['stress', 'Stress or emotions', { stress: 0.45 }],
    ['money', 'Money pressure', { money_pressure: 0.45 }],
    ['people', 'Relationship or people problems', { relationship_strain: 0.4, low_support: 0.15 }],
    ['motivation', 'Motivation or getting started', { low_activation: 0.4, low_focus: 0.2 }],
    ['nothing', 'Nothing consistently stands out', {}],
  ], 0.14),
  Q('O5', 'orientation', 'What would make EL8 most useful to you right now?', [], [
    ['feel_better', 'Feel better day to day', { stress: 0.2, low_energy: 0.15 }],
    ['health', 'Improve my health or energy', { physical_condition: 0.25, low_energy: 0.2 }],
    ['stability', 'Get life more stable and manageable', { schedule_disruption: 0.2, money_pressure: 0.15, work_instability: 0.15 }],
    ['progress', 'Make progress on something important', { lack_direction: 0.25, low_activation: 0.15 }],
    ['balance', 'Get several parts of life into better balance', {}],
    ['understand', 'Understand what I should focus on first', {}],
  ], 0.12),

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
  Q('D3', 'discriminator', 'When the problem shows up, what gets affected first?', [], [
    ['sleep', 'Sleep', { poor_sleep: 0.45 }],
    ['energy', 'Energy', { low_energy: 0.4 }],
    ['mood', 'Mood or stress', { stress: 0.4 }],
    ['focus', 'Focus', { low_focus: 0.4 }],
    ['motivation', 'Motivation or getting started', { low_activation: 0.4 }],
    ['money', 'Money decisions', { money_pressure: 0.4 }],
    ['people', 'Relationships', { relationship_strain: 0.35, low_support: 0.2 }],
    ['routine', 'Daily routine', { schedule_disruption: 0.3, home_instability: 0.2, low_activity: 0.15 }],
    ['unsure', 'Not sure', {}],
  ], 0.25),
  Q('D4', 'discriminator', 'Is this mostly one problem or several things piling up?', [], [
    ['one', 'Mostly one thing', {}],
    ['several', 'Several things', {}],
    ['connected', 'Several things that seem connected', {}],
    ['unsure', 'Not sure', {}],
  ], 0.15),
  Q('D5', 'discriminator', 'What takes up the most mental space lately?', [], [
    ['money', 'Money', { money_pressure: 0.5 }],
    ['work', 'Work or school', { work_instability: 0.5 }],
    ['people', 'Relationships or people', { relationship_strain: 0.4, low_support: 0.2 }],
    ['health', 'Health, sleep, energy, or physical condition', { poor_sleep: 0.2, low_energy: 0.2, physical_condition: 0.2 }],
    ['home', 'Home or surroundings', { home_instability: 0.4 }],
    ['future', 'The future or direction', { lack_direction: 0.45 }],
    ['nothing', 'Nothing in particular', {}],
  ], 0.25),

  Q('C1', 'contradiction', 'That does not fully match the earlier picture. Which answer feels more accurate now?', [], [
    ['earlier', 'My earlier answer', {}],
    ['new', 'The newer answer', {}],
    ['both', 'Both can be true', {}],
    ['unsure', 'I’m not sure', {}],
  ], 0.18),
  Q('C2', 'correction', 'Did EL8 get the wrong idea about what is bothering you?', [], [
    ['no', 'No', {}],
    ['work', 'Yes — it is not mainly work', { work_instability: -0.8 }],
    ['money', 'Yes — it is not mainly money', { money_pressure: -0.8 }],
    ['relationships', 'Yes — it is not mainly relationships', { relationship_strain: -0.8 }],
    ['support', 'Yes — it is not mainly support', { low_support: -0.8 }],
    ['home', 'Yes — it is not mainly home', { home_instability: -0.8 }],
    ['direction', 'Yes — it is not mainly direction', { lack_direction: -0.8 }],
  ], 0.18),

  Q('HV1', 'healthy-verification', 'Overall, is anything meaningfully getting in the way of daily life right now?', [], [
    ['no', 'No', { work_instability: -0.2, money_pressure: -0.2, relationship_strain: -0.2, low_support: -0.2, home_instability: -0.2, lack_direction: -0.2 }],
    ['minor', 'Only minor things', {}],
    ['yes', 'Yes', {}],
  ], 0.14),
  Q('HV2', 'healthy-verification', 'Are the things you selected mostly temporary and manageable?', [], [
    ['yes', 'Yes', { stress: -0.2, poor_sleep: -0.15, low_energy: -0.15 }],
    ['mixed', 'Some are, some are not', {}],
    ['no', 'No', {}],
  ], 0.14),
  Q('X1', 'opt-out', 'Do you want to keep digging into this right now?', [], [
    ['yes', 'Yes', {}],
    ['later', 'Not right now', { __opt_out: 1 }],
  ], 0.08),
]);

export { Q, scale };
