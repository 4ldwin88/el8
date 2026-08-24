import { focusEligibility } from './evidence-engine.js';
import { DECISION_POLICY } from './decision-policy.js';

export const PRIORITY_POLICY=Object.freeze({
 maxInitialFocuses:DECISION_POLICY.maxInitialFocuses,
 maxInitialActionsPerFocus:DECISION_POLICY.maxInitialActionsPerFocus,
 maxInitialBurdenUnits:3,
 // Lexicographic ordering deliberately avoids an opaque blended score.
 order:Object.freeze(['safetyConstraint','functionalImpact','evidenceConfidence','memberPreference','actionability','stableId'])
});

const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const boolRank=v=>v?1:0;
export function eligiblePriorityCandidates(candidates=[]){
 return candidates.filter(c=>focusEligibility(c.effects??[]).eligible).map(c=>Object.freeze({...c,
  functionalImpact:Math.max(0,Math.min(3,num(c.functionalImpact))),
  evidenceConfidence:Math.max(0,Math.min(1,num(c.evidenceConfidence,focusEligibility(c.effects??[]).confidence))),
  memberPreference:Math.max(0,Math.min(3,num(c.memberPreference))),
  actionability:Math.max(0,Math.min(3,num(c.actionability))),
  safetyConstraint:Boolean(c.safetyConstraint)
 }));
}

export function orderPriorityCandidates(candidates=[]){
 return eligiblePriorityCandidates(candidates).sort((a,b)=>
  boolRank(b.safetyConstraint)-boolRank(a.safetyConstraint)||
  b.functionalImpact-a.functionalImpact||
  b.evidenceConfidence-a.evidenceConfidence||
  b.memberPreference-a.memberPreference||
  b.actionability-a.actionability||
  String(a.id).localeCompare(String(b.id))
 );
}

export function selectInitialFocuses(candidates=[]){
 return Object.freeze(orderPriorityCandidates(candidates).slice(0,PRIORITY_POLICY.maxInitialFocuses));
}

// Actions arrive pre-validated by actionEligibility. Composition does not invent eligibility.
// Burden is a small deterministic unit scale (1=low, 2=medium, 3=high); initial total <= 3.
export function composeInitialPlan({orderedFocuses=[],actionsByFocus={}}={}){
 const selected=[],rejected=[];let burden=0;
 for(const focus of orderedFocuses.slice(0,PRIORITY_POLICY.maxInitialFocuses)){
  const actions=(actionsByFocus[focus.id]??[]).filter(a=>a.eligible===true);
  if(!actions.length){rejected.push({focusId:focus.id,reason:'no-eligible-action'});continue;}
  const ranked=[...actions].sort((a,b)=>num(a.burdenUnits,1)-num(b.burdenUnits,1)||String(a.id).localeCompare(String(b.id)));
  const action=ranked[0]; const units=Math.max(1,Math.min(3,num(action.burdenUnits,1)));
  if(burden+units>PRIORITY_POLICY.maxInitialBurdenUnits){rejected.push({focusId:focus.id,actionId:action.id,reason:'initial-burden-cap'});continue;}
  selected.push(Object.freeze({focusId:focus.id,actionId:action.id,burdenUnits:units})); burden+=units;
 }
 return Object.freeze({selected:Object.freeze(selected),rejected:Object.freeze(rejected),totalBurdenUnits:burden,withinBurdenCap:burden<=PRIORITY_POLICY.maxInitialBurdenUnits});
}
