import { reviewPlan } from '../../intelligence/review/review-engine.js';
import { selectAdjustment, ADJUST_DISPOSITION } from '../../intelligence/review/adaptation-router.js';

const freeze = value => Object.freeze(value);
const actionIdOf = action => action?.actionId || action?.id || null;
const activeActions = plan => plan?.activeActions || plan?.actions || plan?.active || [];

function canonicalAction(plan, requestedActionId) {
  return activeActions(plan).find(action => actionIdOf(action) === requestedActionId) || null;
}

function attemptFromAdherence(adherence) {
  if (!Number.isFinite(adherence)) return null;
  return adherence >= 0.5 ? 'adequate' : 'inadequate';
}

function burdenFromBarriers(barrierCodes = []) {
  return barrierCodes.includes('burden') ? 'high' : 'acceptable';
}

function decisionCopy(adjustment, review) {
  if (review.status === 'SAFETY_INTERRUPTED') return freeze({
    code: 'safety_interrupt',
    title: 'Pause and address the safety concern',
    detail: 'EL8 will not continue ordinary plan adjustment until the safety concern is reconciled.'
  });
  if (adjustment.route === 'review-deepening') return freeze({
    code: 'more_evidence',
    title: 'A little more evidence is needed',
    detail: 'Your plan stays unchanged while EL8 requests only the missing information needed for a useful review.'
  });
  if (adjustment.disposition === ADJUST_DISPOSITION.MAINTAIN) return freeze({
    code: 'maintain',
    title: 'Keep this action for now',
    detail: 'The current evidence supports continuing it without silently changing your plan.'
  });
  if (adjustment.disposition === ADJUST_DISPOSITION.SIMPLIFY) return freeze({
    code: 'simplify',
    title: 'Consider making this easier',
    detail: 'A barrier was identified. EL8 can use it as a constraint when proposing a simpler replacement in Planning.'
  });
  if (adjustment.disposition === ADJUST_DISPOSITION.REPLACE) return freeze({
    code: 'replace',
    title: 'Consider a different action',
    detail: 'The action was adequately attempted without the expected benefit. Any replacement must be proposed through Planning.'
  });
  if (adjustment.disposition === ADJUST_DISPOSITION.PAUSE_REASSESS) return freeze({
    code: 'reassess',
    title: 'Reassess before changing the plan',
    detail: 'The evidence points back to reassessment or re-engagement rather than an automatic plan change.'
  });
  if (adjustment.disposition === ADJUST_DISPOSITION.REFER_ESCALATE) return freeze({
    code: 'refer_escalate',
    title: 'Pause ordinary plan changes',
    detail: 'This review requires the governed safety or escalation route.'
  });
  return freeze({
    code: 'review_recorded',
    title: 'Review recorded',
    detail: 'Your plan stays unchanged until there is enough governed evidence for a next decision.'
  });
}

export function reviewAction({
  plan,
  actionId,
  status,
  adherence,
  benefitDirection = 'unknown',
  barrierCodes = [],
  contextChanged = false,
  safetyChanged = false,
  measurementSufficient = null,
  recordedAt = new Date().toISOString()
} = {}) {
  const action = canonicalAction(plan, actionId);
  if (!action) throw new Error('Active canonical Action required for review.');
  const focusIds = [...new Set([...(plan?.focusIds || []), ...(action.focusIds || [])])].filter(Boolean);
  const constructIds = [...new Set(action.constructIds || focusIds)].filter(Boolean);
  const outcome = freeze({
    actionId,
    focusIds: freeze(focusIds),
    constructIds: freeze(constructIds),
    status,
    adherence,
    benefitDirection,
    barrierCodes: freeze([...barrierCodes]),
    burden: burdenFromBarriers(barrierCodes),
    contextChanged: Boolean(contextChanged),
    safetyChanged: Boolean(safetyChanged),
    measurementSufficient,
    recordedAt
  });
  const evidence = {
    adherence: attemptFromAdherence(adherence),
    outcome: benefitDirection,
    burden: outcome.burden,
    usefulness: barrierCodes.includes('irrelevance') ? 'low' : 'unknown',
    circumstancesChanged: Boolean(contextChanged),
    safetyChanged: Boolean(safetyChanged),
    barrierKnown: barrierCodes.length > 0
  };
  // A member explicitly saying evidence is insufficient must not be converted into a decisive Review.
  const measurementContract = measurementSufficient === false
    ? { requiredReviewSignals: ['adherence', 'outcome', 'measurement'] }
    : null;
  const review = reviewPlan({
    plan: { ...plan, activeActions: [action] },
    evidence,
    measurementContract,
    safetyContextualSignals: safetyChanged ? { memberReportedSafetyChange: true } : {}
  });
  const adjustment = selectAdjustment({ review, plan: { ...plan, activeActions: [action] } });
  return freeze({
    actionId,
    focusIds: freeze(focusIds),
    constructIds: freeze(constructIds),
    outcome,
    review,
    adjustment,
    decision: decisionCopy(adjustment, review)
  });
}

export function memberReviewCopy(decision) {
  return decision || decisionCopy({}, { status: 'CLASSIFIED' });
}
