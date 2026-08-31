// Governed tracking and additional-assessment requirements for canonical Actions.
// Kept separate from Planning so tracking burden is explicit and reusable.

export function getTrackingRequirements(action) {
  if (!action || typeof action !== 'object') throw new Error('Action required');
  return Object.freeze({
    actionId: action.actionId,
    trackingRequirement: action.trackingRequirement ?? null,
    additionalAssessmentRequirement: action.additionalAssessmentRequirement ?? null,
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
