// Governed review-cadence helpers. Action-specific cadence remains authoritative;
// these utilities normalize it for Planning, Tracking and Review without inventing
// a global wellness reassessment interval.

export const REVIEW_CADENCE_VERSION = '2026-08-31.1';

export const REVIEW_CADENCE_POLICY = Object.freeze({
  principle: 'shortest_useful_decision_point',
  burdenRule: 'Collect only evidence needed for the next decision.',
  extensionRule: 'Extend tracking only when Review can explain what additional evidence is needed and how it can change the decision.',
  reassessmentRule: 'Use focused reassessment when required evidence is missing, contradictory, materially changed or action response reopens a relevant hypothesis.',
  safetyRule: 'Safety triggers interrupt ordinary cadence immediately.',
});

export function getReviewCadence(action) {
  if (!action || typeof action !== 'object') throw new Error('Action required');
  return Object.freeze({
    actionId: action.actionId,
    trigger: action.review?.trigger ?? 'At the shortest useful decision point.',
    allowedDispositions: Object.freeze([...(action.review?.allowedDispositions ?? [])]),
    trackingRequirement: action.trackingRequirement ?? null,
    additionalAssessmentRequirement: action.additionalAssessmentRequirement ?? null,
    stopReconsider: Object.freeze([...(action.stopReconsider ?? [])]),
  });
}

export function buildReviewCadenceIndex(actions = []) {
  return Object.freeze(Object.fromEntries(actions.map(action => [action.actionId, getReviewCadence(action)])));
}
