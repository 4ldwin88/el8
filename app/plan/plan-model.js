export function planFocus(plan){
  if(!plan)return[];
  if(Array.isArray(plan.focusIds))return plan.focusIds.filter(Boolean).map(constructId=>({constructId,source:'canonical'}));
  if(Array.isArray(plan.focuses))return plan.focuses.filter(Boolean).map(f=>typeof f==='string'?{constructId:f,source:'canonical'}:{...f,source:f.source||'canonical'});
  return[];
}
export function planActions(plan){
  if(!plan)return[];
  const actions=plan.activeActions||plan.proposedActions||plan.actions||[];
  return Array.isArray(actions)?actions.filter(x=>x&&x.actionId):[];
}
export function planConstructIds(plan){return planFocus(plan).map(x=>x.constructId).filter(Boolean);}
export function isProductionPlan(plan){return !!plan&&!plan.is_test&&plan.status==='active';}
