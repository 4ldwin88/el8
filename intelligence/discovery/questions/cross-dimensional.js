import { Q } from './core.js';

// Questions belong here only when their purpose is explicitly to distinguish or
// connect multiple dimensions. They are not owned by either individual dimension.
export const CROSS_DIMENSIONAL_QUESTIONS = Object.freeze([
  Q('B1', 'bridge', 'Which best describes what is happening with work right now?', ['work_instability', 'money_pressure'], [
    ['no_work', 'I currently do not have work', { work_instability: 0.75 }],
    ['money', 'Money or income pressure is affecting my work choices', { money_pressure: 0.25, work_instability: 0.15 }],
    ['stability', 'My work, hours, or income feel unstable', { work_instability: 0.4 }],
    ['fit', 'My work is stable enough, but it is not a good fit', { work_instability: -0.15, lack_direction: 0.45 }],
    ['separate', 'Work is not a major problem for me right now', { work_instability: -0.55 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.22),
  Q('B2', 'bridge', 'Which seems to come first most often?', ['stress', 'poor_sleep'], [
    ['stress', 'Stress, then poor sleep', { stress: 0.3, poor_sleep: 0.15 }],
    ['sleep', 'Poor sleep, then stress', { poor_sleep: 0.3, stress: 0.1 }],
    ['both', 'They feed each other', { stress: 0.2, poor_sleep: 0.2 }],
    ['unsure', 'Not sure', {}],
  ], 0.22),
  Q('B3', 'bridge', 'Do relationship problems make you feel unsupported, or is support low even without conflict?', ['relationship_strain', 'low_support'], [
    ['conflict', 'Mostly because of relationship problems', { relationship_strain: 0.35, low_support: 0.15 }],
    ['support', 'Support feels low even without conflict', { low_support: 0.4 }],
    ['both', 'Both', { relationship_strain: 0.2, low_support: 0.25 }],
    ['neither', 'Neither', { relationship_strain: -0.2, low_support: -0.2 }],
  ], 0.22),
  Object.assign(
    Q('B4', 'bridge', 'If you had more energy, would the focus problem mostly go away?', ['low_energy', 'low_focus'], [
      ['yes', 'Probably', { low_energy: 0.25, low_focus: 0.1 }],
      ['some', 'Partly', { low_energy: 0.1 }],
      ['no', 'Probably not', { low_energy: -0.2, lack_direction: 0.15 }],
      ['unsure', 'Not sure', {}],
    ], 0.2),
    {
      prerequisite: (_state, log) => log.some(observation =>
        (observation.effects ?? []).some(effect =>
          effect.type === 'evidence' &&
          effect.target === 'focus' &&
          effect.polarity === 'supports' &&
          effect.strength >= 0.25
        )
      ),
    },
  ),
]);
