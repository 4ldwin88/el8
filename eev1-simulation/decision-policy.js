import { classifyConcern, focusEligibility } from './evidence-engine.js';

export const DECISION_POLICY = Object.freeze({
  maxQuestionBudget: 18,
  maxInitialFocuses: 3,
  maxInitialActionsPerFocus: 1,
  minimumUsefulFocuses: 1,
  unresolvedConflictRequiresDiscrimination: true
});

export function decisionSufficiency({ concernEffects = {}, questionsAsked = 0, safetyEscalationLevel = 0 } = {}) {
  if (safetyEscalationLevel > 0) return Object.freeze({ sufficient: true, stopReason: 'safety-gate', next: 'SAFETY_REVIEW' });

  const entries = Object.entries(concernEffects).map(([concernId, effects]) => ({ concernId, ...focusEligibility(effects) }));
  const eligible = entries.filter(x => x.eligible);
  const unresolved = entries.filter(x => x.state === 'UNRESOLVED');

  if (eligible.length >= DECISION_POLICY.minimumUsefulFocuses && unresolved.length === 0) {
    return Object.freeze({ sufficient: true, stopReason: 'decision-useful-evidence', next: 'AGENCY_GATE', eligible: eligible.map(x => x.concernId) });
  }

  if (questionsAsked >= DECISION_POLICY.maxQuestionBudget) {
    return Object.freeze({ sufficient: true, stopReason: 'question-budget-reached', next: eligible.length ? 'AGENCY_GATE_WITH_UNCERTAINTY' : 'NO_FOCUS_YET', eligible: eligible.map(x => x.concernId), unresolved: unresolved.map(x => x.concernId) });
  }

  return Object.freeze({ sufficient: false, stopReason: null, next: unresolved.length ? 'DISCRIMINATE_CONFLICT' : 'ASK_HIGHEST_VALUE_QUESTION', unresolved: unresolved.map(x => x.concernId) });
}

export function actionEligibility({ concernEffects = [], driverEffects = [], actionIntent = 'learn' } = {}) {
  const concern = focusEligibility(concernEffects);
  const driver = classifyConcern(driverEffects);
  if (!concern.eligible) return Object.freeze({ eligible: false, reason: 'focus-not-supported' });

  const mechanismDependent = ['resolve','build'].includes(actionIntent);
  if (mechanismDependent && driver.state !== 'SUPPORTED') {
    return Object.freeze({ eligible: false, reason: 'driver-unresolved-use-learn-or-stabilize' });
  }
  return Object.freeze({ eligible: true, reason: mechanismDependent ? 'supported-driver' : 'uncertainty-safe-action' });
}

export function adaptPlan({ adherence, outcome, nonAdherenceReason = null, driverWasHypothesis = false, newSafetyLevel = 0 } = {}) {
  if (newSafetyLevel > 0) return Object.freeze({ decision: 'PAUSE_OR_REFER', reopenHypothesis: true, reason: 'new-safety-signal' });
  if (adherence === 'low') {
    const route = ({ burden:'REDUCE_BURDEN', irrelevant:'REPLACE', forgot:'SIMPLIFY_CUE', access:'REMOVE_BARRIER' })[nonAdherenceReason] ?? 'CLARIFY_NON_ADHERENCE';
    return Object.freeze({ decision: route, reopenHypothesis: false, reason: nonAdherenceReason ?? 'reason-required' });
  }
  if (adherence === 'high' && outcome === 'worse') return Object.freeze({ decision: 'REASSESS', reopenHypothesis: true, weakenPriorDriver: true, reason: 'high-adherence-worsening' });
  if (adherence === 'high' && outcome === 'unchanged') return Object.freeze({ decision: 'MODIFY_OR_REASSESS', reopenHypothesis: Boolean(driverWasHypothesis), weakenPriorDriver: Boolean(driverWasHypothesis), reason: 'high-adherence-no-improvement' });
  if (adherence === 'high' && outcome === 'better') return Object.freeze({ decision: 'MAINTAIN', reopenHypothesis: false, reason: 'working-with-adherence' });
  return Object.freeze({ decision: 'REVIEW', reopenHypothesis: false, reason: 'insufficient-review-data' });
}
