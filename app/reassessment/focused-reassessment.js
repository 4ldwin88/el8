const freeze = value => Object.freeze(value);

export const REASSESSMENT_SCOPE = Object.freeze({
  EVIDENCE: 'evidence', ACTION: 'action', CONCERN: 'concern', DIMENSION: 'dimension', PRIORITY_SET: 'priority_set', WHOLE_PERSON: 'whole_person'
});
export const REASSESSMENT_RETURN = Object.freeze({
  PLANNING: 'planning', PRIORITIZATION: 'prioritization', DISCOVERY: 'targeted_discovery', SAFETY: 'safety'
});
const ORDER = [REASSESSMENT_SCOPE.EVIDENCE, REASSESSMENT_SCOPE.ACTION, REASSESSMENT_SCOPE.CONCERN, REASSESSMENT_SCOPE.DIMENSION, REASSESSMENT_SCOPE.PRIORITY_SET, REASSESSMENT_SCOPE.WHOLE_PERSON];

function unique(values = []) { return [...new Set(values.filter(Boolean))]; }
function requireText(value, name) { if (typeof value !== 'string' || !value.trim()) throw new Error(`${name} required`); }

export function createFocusedReassessment({
  reason,
  decisionAtStake,
  affectedEvidenceRefs = [],
  affectedActionIds = [],
  affectedConstructIds = [],
  affectedDimensionIds = [],
  focusMayChange = false,
  actionFitOnly = false,
  evidenceInsufficient = false,
  safetyRequired = false,
  broadMaterialChange = false,
  knownEvidence = [],
  requestedEvidence = [],
  canDefer = true,
  createdAt = new Date().toISOString()
} = {}) {
  requireText(reason, 'reassessment reason');
  requireText(decisionAtStake, 'decision at stake');
  let scope = REASSESSMENT_SCOPE.EVIDENCE;
  if (affectedActionIds.length) scope = REASSESSMENT_SCOPE.ACTION;
  if (affectedConstructIds.length) scope = REASSESSMENT_SCOPE.CONCERN;
  if (affectedDimensionIds.length) scope = REASSESSMENT_SCOPE.DIMENSION;
  if (focusMayChange) scope = REASSESSMENT_SCOPE.PRIORITY_SET;
  if (broadMaterialChange) scope = REASSESSMENT_SCOPE.WHOLE_PERSON;
  let returnTo = REASSESSMENT_RETURN.DISCOVERY;
  if (actionFitOnly && !focusMayChange) returnTo = REASSESSMENT_RETURN.PLANNING;
  if (focusMayChange) returnTo = REASSESSMENT_RETURN.PRIORITIZATION;
  if (evidenceInsufficient) returnTo = REASSESSMENT_RETURN.DISCOVERY;
  if (safetyRequired) returnTo = REASSESSMENT_RETURN.SAFETY;
  return freeze({
    kind: 'focused_reassessment', scope, scopeRank: ORDER.indexOf(scope), reason, decisionAtStake,
    affectedEvidenceRefs: freeze(unique(affectedEvidenceRefs)), affectedActionIds: freeze(unique(affectedActionIds)),
    affectedConstructIds: freeze(unique(affectedConstructIds)), affectedDimensionIds: freeze(unique(affectedDimensionIds)),
    knownEvidence: freeze([...knownEvidence]), requestedEvidence: freeze([...requestedEvidence]),
    canDefer: Boolean(canDefer) && !safetyRequired, returnTo, createdAt
  });
}

export function reassessmentFromReview({ reviewResult, decisionAtStake = 'what should change in the current plan', knownEvidence = [], requestedEvidence = [] } = {}) {
  if (!reviewResult?.adjustment) throw new Error('governed Review adjustment required');
  const adjustment = reviewResult.adjustment;
  if (adjustment.disposition !== 'PAUSE_REASSESS' && adjustment.route !== 'review-deepening') throw new Error('Review does not require reassessment');
  const actionId = reviewResult.actionId || reviewResult.outcome?.actionId;
  return createFocusedReassessment({
    reason: adjustment.route === 'review-deepening' ? 'Review evidence is insufficient for the next governed decision.' : 'Review indicates reassessment before changing the plan.',
    decisionAtStake,
    affectedActionIds: actionId ? [actionId] : [],
    affectedConstructIds: reviewResult.constructIds || [],
    knownEvidence,
    requestedEvidence,
    actionFitOnly: adjustment.disposition === 'PAUSE_REASSESS' && !(reviewResult.focusMayChange),
    focusMayChange: Boolean(reviewResult.focusMayChange),
    evidenceInsufficient: adjustment.route === 'review-deepening',
    safetyRequired: reviewResult.review?.status === 'SAFETY_INTERRUPTED'
  });
}

export function correctionToReassessment({ correctionType, targetRef, materialEffects = [], clarificationNeeded = false, safetyRequired = false, createdAt } = {}) {
  if (!['fact', 'interpretation', 'preference_constraint'].includes(correctionType)) throw new Error('supported correction type required');
  requireText(targetRef, 'correction targetRef');
  const effects = unique(materialEffects);
  const focusMayChange = effects.includes('priority') || effects.includes('focus');
  return createFocusedReassessment({
    reason: `Member ${correctionType.replace('_', '/')} correction requires downstream revalidation.`,
    decisionAtStake: effects.length ? `revalidate ${effects.join(', ')}` : 'confirm the corrected current understanding',
    affectedEvidenceRefs: [targetRef], focusMayChange,
    actionFitOnly: !focusMayChange && (effects.includes('eligibility') || effects.includes('plan')),
    evidenceInsufficient: clarificationNeeded,
    safetyRequired,
    requestedEvidence: clarificationNeeded ? ['minimum clarification needed to resolve the corrected evidence'] : [],
    createdAt
  });
}
