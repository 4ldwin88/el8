export function canonicalInterventions(plan={}) {
  return (plan.active || plan.actions || []).map((action, index) => ({
    id: action.intervention_id || action.id,
    order: index + 1,
    action: action.title || action.label || action.id,
    priorityId: action.priorityId || null,
    problemId: action.problemId || action.problem_id || null,
    purpose: action.purpose || null,
    rationale: action.rationale || null,
    measurement: action.measurement || null,
    reviewRule: action.reviewRule || null,
    effort: action.effort ?? action.burden?.effort ?? null,
    registry_version: action.registry_version || plan.registry_version || null,
    source: 'canonical-planning',
    deepening_requirements: (plan.deepening?.requirements || []).filter(r => r.actionId === (action.intervention_id || action.id))
  }));
}

export function assertPlanReadyForActivation(plan={}) {
  if (plan.status === 'escalate' || plan.reason === 'safety_override') {
    throw new Error('Safety clarification or escalation must be resolved before plan activation.');
  }
  if (plan.status !== 'active') throw new Error('An active canonical plan is required.');
  const interventions = canonicalInterventions(plan);
  if (!interventions.length) throw new Error('At least one selected intervention is required.');
  if (plan.selectionDeepening?.required || plan.reason === 'selection_evidence_required') {
    throw new Error('Complete intervention-selection evidence before activating this plan.');
  }
  if ((plan.deepening?.blocking || []).length || plan.activationStatus === 'needs_plan_specific_assessment') {
    throw new Error('Complete the plan-specific assessment before activating this plan.');
  }
  if (plan.activationStatus && !['ready','active'].includes(plan.activationStatus)) {
    throw new Error('This plan is not ready for activation.');
  }
  return interventions;
}
