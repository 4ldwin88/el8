function planActions(plan={}) {
  return plan.proposedActions || plan.actions || plan.active || [];
}

export function canonicalActionsForActivation(plan={}) {
  return planActions(plan).map((action,index)=>({
    actionId:action.actionId || action.id,
    order:index+1,
    name:action.name || action.title || action.label || action.actionId || action.id,
    actionScope:action.actionScope || 'construct',
    focusIds:Array.isArray(action.focusIds) ? [...action.focusIds] : [],
    intent:action.intent || action.purpose || null,
    instruction:action.instruction || null,
    rationale:action.rationale || null,
    measurement:action.measurement || null,
    review:action.review || action.reviewRule || null,
    burden:action.burden || null,
    trackingRequirement:action.trackingRequirement || null,
    additionalAssessmentRequirement:action.additionalAssessmentRequirement || null,
    iconKey:action.iconKey || null,
    evidenceSourceIds:Array.isArray(action.evidenceSourceIds) ? [...action.evidenceSourceIds] : [],
    source:'canonical-planning',
    deepeningRequirements:(plan.deepening?.requirements || []).filter(r=>r.actionId === (action.actionId || action.id))
  }));
}

export function assertPlanReadyForActivation(plan={}) {
  if (plan.status === 'blocked' || plan.status === 'escalate' || plan.reason === 'safety_override') {
    throw new Error('Safety clarification or escalation must be resolved before Plan activation.');
  }
  if (!['proposed','active'].includes(plan.status)) throw new Error('A proposed canonical Plan is required.');
  const actions=canonicalActionsForActivation(plan);
  if (!actions.length || actions.some(action=>!action.actionId)) throw new Error('At least one identified canonical Action is required.');
  if (plan.selectionDeepening?.required || plan.reason === 'selection_evidence_required') {
    throw new Error('Complete Action-selection evidence before activating this Plan.');
  }
  if ((plan.deepening?.blocking || []).length || plan.activationStatus === 'needs_plan_specific_assessment') {
    throw new Error('Complete the Action-specific assessment before activating this Plan.');
  }
  if (plan.activationStatus && !['ready','active'].includes(plan.activationStatus)) {
    throw new Error('This Plan is not ready for activation.');
  }
  return actions;
}
