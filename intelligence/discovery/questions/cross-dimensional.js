import { Q } from './core.js';

// Cross-dimensional questions are deliberately rare. A bridge belongs here only when
// it resolves a distinction that cannot be established more directly from the owned
// domain questions and when the answer can materially change Member State,
// Prioritization or Planning. Member-reported relationships and counterfactuals remain
// hypotheses; Discovery does not convert them into causal evidence.
export const CROSS_DIMENSIONAL_QUESTIONS = Object.freeze([
  Q('B1', 'bridge', 'Which best describes what is happening with work right now?', ['work_instability', 'money_pressure'], [
    ['no_work', 'I currently do not have work', { work_instability: 0.75 }],
    ['money', 'Money or income pressure seems connected to the work choices available to me', { money_pressure: 0.25, work_instability: 0.15 }],
    ['stability', 'My work, hours, or income feel unstable', { work_instability: 0.4 }],
    ['fit', 'My work is stable enough, but it is not a good fit', { work_instability: -0.15, lack_direction: 0.45 }],
    ['separate', 'Work is not a major problem for me right now', { work_instability: -0.55 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.22),
]);
