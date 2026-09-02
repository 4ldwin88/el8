// Canonical Member State -> Planning fit policy. These signals constrain burden/fit;
// they never choose Focus or create eligibility by themselves.
const LOW=new Set(['low','very_low','limited']);
export function deriveMemberStatePlanningPolicy(input={},options={}){const fit=input.planningContext?.global?.memberStateFit??{},signals=fit.engagementSignals??{};const capacity=fit.capacity??'unknown',manageability=fit.manageability??'unknown',burdenTolerance=signals.burdenTolerance?.status==='current'?signals.burdenTolerance.value:null;let burdenBudget=options.burdenBudget??null,actionCeiling=options.actionCeiling??3;const reasons=[];
 if(burdenBudget==null&&(LOW.has(String(capacity).toLowerCase())||LOW.has(String(manageability).toLowerCase())||LOW.has(String(burdenTolerance).toLowerCase()))){burdenBudget=1;actionCeiling=Math.min(actionCeiling,1);reasons.push('member_state_low_capacity_or_burden_tolerance')}
 return Object.freeze({burdenBudget,actionCeiling,diagnostics:Object.freeze({capacity,manageability,burdenTolerance,reasons:Object.freeze(reasons)})});}
