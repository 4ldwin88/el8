// Governed tracking and additional-assessment requirements for Actions.
// Tracking is evidence collection for the next decision, not a parallel scoring
// system. Requirements remain Action-specific and should impose the least burden
// needed for Review.

export const TRACKING_REQUIREMENTS_VERSION = '2026-08-31.1';

export function getTrackingRequirements(action) {
  if (!action || typeof action !== 'object') throw new Error('Action required');
  return Object.freeze({
    actionId: action.actionId,
    trackingRequirement: action.trackingRequirement ?? null,
    additionalAssessmentRequirement: action.additionalAssessmentRequirement ?? null,
    adherenceSignal: action.measurement?.adherence ?? null,
    outcomeSignal: action.measurement?.outcome ?? null,
    burdenSignal: action.measurement?.burden ?? null,
    decisionUse: action.measurement?.decisionUse ?? null,
    reviewTrigger: action.review?.trigger ?? null,
    stopReconsider: Object.freeze([...(action.stopReconsider ?? [])]),
    iconKey: action.iconKey ?? null,
  });
}

export function buildTrackingRequirementIndex(actions = []) {
  return Object.freeze(Object.fromEntries(
    actions.map(action => [action.actionId, getTrackingRequirements(action)]),
  ));
}
