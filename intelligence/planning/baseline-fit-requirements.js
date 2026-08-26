// EL8 action-specific evidence agenda.
// Onboarding stays broad and short. After prioritization/composition, selected candidate
// actions may request only missing facts that can materially change a downstream decision.

export const ACTION_FIT_SCHEMA_VERSION='0.2.0';

function currentFacts(memberState={}) {
  return new Map(Object.values(memberState.facts||{})
    .filter(f=>f.currentStatus==='current')
    .map(f=>[f.semanticKey,f.value]));
}

function normalizedRequirements(action={}) {
  return (action.deepeningRequirements||[])
    .filter(r=>r?.evidenceKey && r?.decisionImpact)
    .map(r=>({
      actionId:action.id,
      requirementId:r.id,
      evidenceKey:r.evidenceKey,
      purpose:r.purpose,
      decisionImpact:r.decisionImpact,
      prompt:r.prompt||null,
      requiredBeforeActivation:r.requiredBeforeActivation!==false
    }));
}

export function actionFactsNeeded({memberState,action}={}) {
  if(!action?.id) throw new Error('action is required');
  const known=currentFacts(memberState);
  const requirements=normalizedRequirements(action);
  return {
    schemaVersion:ACTION_FIT_SCHEMA_VERSION,
    actionId:action.id,
    knownFacts:[...known.keys()],
    requirements:requirements.filter(r=>!known.has(r.evidenceKey))
  };
}

export function buildActionDeepeningAgenda({memberState,actions=[],blockedBySafety=false,maxItems=6}={}) {
  if(blockedBySafety) return {schemaVersion:ACTION_FIT_SCHEMA_VERSION,blockedBySafety:true,items:[]};
  const items=[];
  for(const action of actions) {
    const result=actionFactsNeeded({memberState,action});
    for(const requirement of result.requirements) {
      if(items.length>=maxItems) break;
      items.push(requirement);
    }
    if(items.length>=maxItems) break;
  }
  return {schemaVersion:ACTION_FIT_SCHEMA_VERSION,blockedBySafety:false,items};
}
