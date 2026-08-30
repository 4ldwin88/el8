// EL8 Action-specific Planning deepening contract.
// Discovery establishes sufficient state and member-confirmed Focus. Planning may request
// only decision-useful evidence required to tailor or safely activate a selected Action.

export const DEEPENING_PURPOSES = Object.freeze([
  'eligibility',
  'personalization',
  'safety_scope',
  'baseline_measurement',
  'success_criteria',
  'review_timing',
  'outcome_interpretation'
]);

function requirementSatisfied(requirement={}, evidence={}) {
  if (!requirement.evidenceKey) return false;
  const value=evidence[requirement.evidenceKey];
  return value !== undefined && value !== null && value !== '';
}

function canonicalActionId(action={}) {
  return action.actionId || action.id || null;
}

export function deepeningRequirementsForAction(action={}, evidence={}) {
  const actionId=canonicalActionId(action);
  if (!actionId) throw new Error('Action-specific deepening requires actionId.');
  return (action.deepeningRequirements || [])
    .filter(req => req?.decisionImpact && DEEPENING_PURPOSES.includes(req.purpose))
    .filter(req => !requirementSatisfied(req, evidence))
    .map(req => ({
      actionId,
      requirementId: req.id,
      evidenceKey: req.evidenceKey,
      purpose: req.purpose,
      decisionImpact: req.decisionImpact,
      prompt: req.prompt || null,
      requiredBeforeActivation: req.requiredBeforeActivation !== false
    }));
}

export function buildPlanDeepening(actions=[], evidence={}) {
  const requirements=actions.flatMap(action => deepeningRequirementsForAction(action, evidence));
  return {
    required: requirements.length > 0,
    blocking: requirements.filter(x => x.requiredBeforeActivation),
    optional: requirements.filter(x => !x.requiredBeforeActivation),
    requirements
  };
}

export function applyPlanDeepening(plan={}, evidence={}) {
  if (!['proposed','active'].includes(plan.status)) return plan;
  const actions=plan.proposedActions || plan.active || plan.actions || [];
  const deepening=buildPlanDeepening(actions, evidence);
  if (!deepening.required) return {...plan, deepening, activationStatus:'ready'};
  return {
    ...plan,
    deepening,
    activationStatus: deepening.blocking.length ? 'needs_plan_specific_assessment' : 'ready_with_optional_deepening'
  };
}
