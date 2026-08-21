import { selectQuestions } from './question-selector.js';

// Snapshot derived from T0006 after the 2026-08-21 daily check-in.
// This is a deterministic QA fixture, not live member-state code.
export const memberZeroContext = {
  candidateDimensions: ['Emotional', 'Physical'],
  activeTriggers: [
    'emotional_priority',
    'emotional_uncertainty',
    'conflicting_emotional_signals'
  ],
  availableEvidence: [
    'baseline_condition',
    'baseline_priority',
    'baseline_functional_impact',
    'daily_emotional_state',
    'daily_physical_state'
  ],
  uncertainSignals: ['pressure_pattern', 'functional_interference'],
  uncertaintyBySignal: {
    pressure_pattern: 1,
    functional_interference: 0.85,
    income_stability: 0.15,
    cashflow_after_essentials: 0.15,
    liquid_runway: 0.2,
    member_perceived_leverage: 0.35,
    member_perceived_feasibility: 0.25,
    member_perceived_upstream_leverage: 0.4
  },
  evidenceAgeDays: {},
  recentQuestionIds: [],
  recentSignals: ['daily_emotional_state', 'daily_physical_state'],
  friction: 0,
  capacity: 0.75,
  maxQuestions: 2,
  maxBurden: 2,
  includeInactive: true
};

export function simulateMemberZero(candidates) {
  return selectQuestions(candidates, memberZeroContext, { maxQuestions: 2, maxBurden: 2 });
}

export function summarizeSimulation(result) {
  return result.selected.map(({ question, score, components }, rank) => ({
    rank: rank + 1,
    id: question.id ?? question.question_key,
    prompt: question.prompt ?? question.prompt_template,
    score: Number(score.toFixed(4)),
    components
  }));
}
