// EL8 plan-specific deepening contract.
// Onboarding establishes broad direction; selected actions request only decision-useful detail.

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

export function deepeningRequirementsForAction(action={}, evidence={}) {
  return (action.deepeningRequirements || [])
    .filter(req => req?.decisionImpact && DEEPENING_PURPOSES.includes(req.purpose))
    .filter(req => !requirementSatisfied(req, evidence))
    .map(req => ({
      actionId: action.id,
      requirementId: req.id,
      evidenceKey: req.evidenceKey,
      purpose: req.purpose,
      decisionImpact: req.decisionImpact,
      prompt: req.prompt || null,
      requiredBeforeActivation: req.requiredBeforeActivation !== false
    }));
}

export function buildPlanDeepening(activeActions=[], evidence={}) {
  const requirements=activeActions.flatMap(action => deepeningRequirementsForAction(action, evidence));
  return {
    required: requirements.length > 0,
    blocking: requirements.filter(x => x.requiredBeforeActivation),
    optional: requirements.filter(x => !x.requiredBeforeActivation),
    requirements
  };
}

export function applyPlanDeepening(plan={}, evidence={}) {
  if (plan.status !== 'active') return plan;
  const deepening=buildPlanDeepening(plan.active || [], evidence);
  if (!deepening.required) return {...plan, deepening, activationStatus:'ready'};
  return {
    ...plan,
    deepening,
    activationStatus: deepening.blocking.length ? 'needs_plan_specific_assessment' : 'ready_with_optional_deepening'
  };
}
