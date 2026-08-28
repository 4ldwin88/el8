// Canonical Discovery candidate question-bank source.
// Keep cross-cutting questions here; dimension-owned questions live in their own modules.
// EL8-authored question wording is hypothesis evidence until human comprehension/pilot validation supports promotion.

const Q = (id, role, text, targets = [], options = [], burden = 0.2, mode = 'single') => ({
  id, role, text, targets, burden, mode,
  evidenceStatus: 'hypothesis',
  validationRequirements: Object.freeze(['construct-review','cognitive-interview','adversarial-qa','human-pilot']),
  options: options.map(([optionId, label, effects = {}]) => ({ id: optionId, label, effects })),
});
const positive = question => Object.assign(question, { path: 'positive', decisionCritical: true });
const orientation = (question, openingPriority = 0) => Object.assign(question, { openingPriority });

export const CORE_QUESTIONS = Object.freeze([
  // Orientation questions are candidates, not a fixed questionnaire or fixed first screen.
  // openingPriority is a provisional EL8 sequencing hypothesis to be tested in cognitive interviews/pilots.
  // A broad indicator matrix may be tested as an alternative locator, but is not canonical unless evidence
  // shows it improves comprehension/coverage/branching enough to justify its burden.
  orientation(Q('O5', 'orientation', 'What would you most like EL8 to help you with right now?', [], [
    ['feel_better', 'Feel better day to day', { stress: 0.2, low_energy: 0.15 }],
    ['health', 'Improve my health or energy', { physical_condition: 0.25, low_energy: 0.2 }],
    ['stability', 'Make daily life more stable and manageable', { schedule_disruption: 0.2, money_pressure: 0.15, work_instability: 0.15 }],
    ['progress', 'Make progress on something important', { lack_direction: 0.25, low_activation: 0.15 }],
    ['maintain', 'Keep things going well', {}],
    ['balance', 'Improve several parts of life', {}],
    ['understand', 'Figure out what to focus on first', {}],
    ['nothing', 'Nothing in particular right now', {}],
    ['unsure', 'Not sure yet', {}],
  ], 0.12), 100),
  orientation(Q('O4', 'orientation', 'Thinking about recent difficult days, what has most often made the day harder?', [], [
    ['time', 'Too much to do or not enough time', { schedule_disruption: 0.4, stress: 0.2 }],
    ['energy', 'Low energy or poor sleep', { low_energy: 0.35, poor_sleep: 0.3 }],
    ['stress', 'Stress or difficult emotions', { stress: 0.45 }],
    ['money', 'Money pressure', { money_pressure: 0.45 }],
    ['people', 'Relationship or people problems', { relationship_strain: 0.4, low_support: 0.15 }],
    ['motivation', 'Difficulty getting started', { low_activation: 0.4 }],
    ['nothing', 'Nothing consistently stands out', {}],
    ['unsure', 'Not sure', {}],
  ], 0.14), 80),
  orientation(Q('O1', 'orientation', 'Thinking about the past 7 days, which best describes your day-to-day routine?', [], [
    ['structured', 'Mostly structured and predictable', { schedule_disruption: -0.25, low_activation: -0.1 }],
    ['busy', 'Busy, with a lot to juggle', { schedule_disruption: 0.3, stress: 0.2 }],
    ['variable', 'It changed a lot from day to day', { schedule_disruption: 0.45 }],
    ['unstructured', 'Mostly unstructured', { schedule_disruption: 0.35, low_activation: 0.25 }],
    ['unsure', 'Not sure', {}],
  ], 0.12), 40),
  orientation(Q('O3', 'orientation', 'When life has been going well, what has most helped you keep going?', [], [
    ['people', 'People I care about', { low_support: -0.2, lack_direction: -0.1 }],
    ['progress', 'Making progress toward something', { lack_direction: -0.2, low_activation: -0.1 }],
    ['enjoyment', 'Fun, hobbies or things I enjoy', { stress: -0.1, low_activation: -0.1 }],
    ['responsibility', 'Responsibilities or people depending on me', { work_instability: -0.05, lack_direction: -0.1 }],
    ['meaning', 'Purpose, values or something bigger than me', { lack_direction: -0.3 }],
    ['unsure', 'I’m not sure right now', {}],
  ], 0.12), 30),
  // Retained in the candidate bank, but no longer treated as a required opening item. Its 20-minute
  // threshold and incremental decision value require explicit validation before production use.
  orientation(Q('O2', 'orientation', 'Thinking about the past 7 days, on how many days were you physically active for at least 20 minutes?', [], [
    ['most', '5–7 days', { low_activity: -0.6 }], ['some', '2–4 days', { low_activity: -0.25 }],
    ['one', '1 day', { low_activity: 0.35 }], ['none', '0 days', { low_activity: 0.7 }], ['unsure', 'Not sure', {}],
  ], 0.1), 5),

  Q('G1', 'gateway', 'Thinking about the past 7 days, which of these have made daily life harder? Select any that fit.', [], [
    ['money', 'Money', { money_pressure: 0.65 }], ['work', 'Work or school', { work_instability: 0.55, schedule_disruption: 0.2 }],
    ['health', 'Health or physical condition', { physical_condition: 0.65 }], ['energy', 'Low energy or tiredness', { low_energy: 0.65 }],
    ['sleep', 'Sleep', { poor_sleep: 0.65 }], ['stress', 'Stress or difficult emotions', { stress: 0.6 }],
    ['relationships', 'Relationships', { relationship_strain: 0.6 }], ['support', 'Feeling lonely or unsupported', { low_support: 0.6, lonely: 0.4 }],
    ['home', 'Home or surroundings', { home_instability: 0.6 }], ['focus', 'Focus or getting started', { low_focus: 0.35, low_activation: 0.25 }],
    ['direction', 'Direction or purpose', { lack_direction: 0.6 }], ['other', 'Something else', {}], ['none', 'None of these', {}], ['unsure', 'Not sure', {}],
  ], 0.35, 'multi'),

  positive(Q('PTH1', 'goal-probe', 'It sounds like things are generally going okay. What would make EL8 most useful to you right now?', [], [
    ['maintain', 'Help me keep what is working', { __positive_goal: 1 }], ['improve', 'Help me improve something that is already okay', { __positive_goal: 1 }],
    ['goal', 'Help me make progress toward a goal', { __positive_goal: 1 }], ['understand', 'Help me understand my patterns over time', { __positive_goal: 1 }],
    ['explore', 'Help me explore what I might want to work on', { __positive_goal: 1 }], ['nothing', 'I do not need EL8 to work on anything right now', { __positive_goal: 1 }], ['unsure', 'Not sure yet', {}],
  ], 0.1)),
  positive(Q('PTH2', 'strength-probe', 'What is working well that you would most want to protect or build on?', [], [
    ['health', 'My health, energy, or routines', { __positive_strength: 1 }], ['people', 'Relationships or support', { __positive_strength: 1 }],
    ['work', 'Work, school, or responsibilities', { __positive_strength: 1 }], ['money', 'Money or financial stability', { __positive_strength: 1 }],
    ['home', 'Home or daily environment', { __positive_strength: 1 }], ['growth', 'Learning, growth, direction, or purpose', { __positive_strength: 1 }],
    ['other', 'Something else', { __positive_strength: 1 }], ['unsure', 'Not sure', {}],
  ], 0.1)),

  Q('D1', 'discriminator', 'If one thing improved over the next 7 days, which change would help your daily life most?', [], [
    ['money', 'Less money pressure', { money_pressure: 0.5 }], ['work', 'Work or school feeling steadier', { work_instability: 0.5 }], ['sleep', 'Sleeping better', { poor_sleep: 0.5 }], ['energy', 'Having more energy', { low_energy: 0.45 }], ['people', 'Relationships or support improving', { relationship_strain: 0.35, low_support: 0.35 }], ['stress', 'Feeling less stressed', { stress: 0.45 }], ['home', 'Home or surroundings feeling easier', { home_instability: 0.45 }], ['direction', 'Feeling clearer about what to do next', { lack_direction: 0.45 }], ['unsure', 'Not sure', {}],
  ], 0.3),
  Q('D2', 'discriminator', 'Which best describes what is making daily life harder right now?', [], [['outside', 'Mostly circumstances or events in my life', { work_instability: 0.25, money_pressure: 0.25, relationship_strain: 0.2, home_instability: 0.2 }], ['inside', 'Mostly how I have been feeling or functioning', { stress: 0.25, low_energy: 0.2, low_focus: 0.2, low_activation: 0.15 }], ['both', 'A mix of both', {}], ['unsure', 'Not sure', {}]], 0.2),
  Q('D3', 'discriminator', 'When this issue affects you, which area do you usually notice changing first?', [], [['sleep', 'Sleep', { poor_sleep: 0.45 }], ['energy', 'Energy', { low_energy: 0.4 }], ['mood', 'Mood or stress', { stress: 0.4 }], ['focus', 'Focus', { low_focus: 0.4 }], ['motivation', 'Getting started', { low_activation: 0.4 }], ['money', 'Money decisions', { money_pressure: 0.4 }], ['people', 'Relationships', { relationship_strain: 0.35, low_support: 0.2 }], ['routine', 'Daily routine', { schedule_disruption: 0.3, home_instability: 0.2, low_activity: 0.15 }], ['unsure', 'Not sure', {}]], 0.25),
  Q('D4', 'discriminator', 'Which best describes what you are dealing with right now?', [], [['one', 'Mostly one issue', {}], ['several', 'Several separate issues', {}], ['connected', 'Several issues that seem connected', {}], ['unsure', 'Not sure', {}]], 0.15),
  Q('D5', 'discriminator', 'Thinking about the past 7 days, which area have you spent the most time worrying about or trying to deal with?', [], [['money', 'Money', { money_pressure: 0.5 }], ['work', 'Work or school', { work_instability: 0.5 }], ['people', 'Relationships or support', { relationship_strain: 0.4, low_support: 0.2 }], ['health', 'Health, sleep, or energy', { poor_sleep: 0.2, low_energy: 0.2, physical_condition: 0.2 }], ['home', 'Home or surroundings', { home_instability: 0.4 }], ['future', 'Future plans or direction', { lack_direction: 0.45 }], ['nothing', 'Nothing in particular', {}], ['unsure', 'Not sure', {}]], 0.25),

  Q('C1', 'contradiction', 'Your answers point in different directions. Which option best describes what you mean?', [], [['earlier', 'My earlier answer is closer', {}], ['new', 'My newer answer is closer', {}], ['both', 'Both are accurate in different situations', {}], ['unsure', 'I’m not sure', {}]], 0.18),
  Q('C2', 'correction', 'Did EL8 misunderstand which area is making daily life harder?', [], [['no', 'No', {}], ['work', 'Yes — it is not mainly work', { work_instability: -0.8 }], ['money', 'Yes — it is not mainly money', { money_pressure: -0.8 }], ['relationships', 'Yes — it is not mainly relationships', { relationship_strain: -0.8 }], ['support', 'Yes — it is not mainly support', { low_support: -0.8 }], ['home', 'Yes — it is not mainly home', { home_instability: -0.8 }], ['direction', 'Yes — it is not mainly direction', { lack_direction: -0.8 }], ['unsure', 'Not sure', {}]], 0.18),
  Q('HV1', 'healthy-verification', 'Thinking about the past 7 days, has anything made it meaningfully harder to do your usual daily activities?', [], [['no', 'No', { work_instability: -0.2, money_pressure: -0.2, relationship_strain: -0.2, low_support: -0.2, home_instability: -0.2, lack_direction: -0.2 }], ['minor', 'Yes, but only a little', {}], ['yes', 'Yes, clearly', {}], ['unsure', 'Not sure', {}]], 0.14),
  Q('HV2', 'healthy-verification', 'Do the issues you selected feel manageable without additional help right now?', [], [['yes', 'Yes', { stress: -0.2, poor_sleep: -0.15, low_energy: -0.15 }], ['mixed', 'Some do and some do not', {}], ['no', 'No', {}], ['unsure', 'Not sure', {}]], 0.14),
  Q('X1', 'opt-out', 'Do you want to answer more questions about this right now?', [], [['yes', 'Yes', {}], ['later', 'Not right now', { __opt_out: 1 }]], 0.08),
]);

export { Q };
