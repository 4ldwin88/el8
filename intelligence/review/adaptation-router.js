// Review -> next canonical intelligence stage. Routing only; downstream engines retain authority.
const freeze=x=>Object.freeze(x);
export function routeReview({review={},plan={}}={}){
 if(!review.valid)throw new Error('Valid review decision required');
 const actionIds=(plan.active||[]).map(x=>x.id);
 switch(review.decision){
  case'keep':return freeze({route:'continue',actionIds:freeze(actionIds),instruction:'Continue current plan until next review.',preservePlan:true});
  case'deepen':return freeze({route:'review-deepening',actionIds:freeze(actionIds),instruction:'Collect only the missing review evidence before changing the plan.',preservePlan:true});
  case'simplify':return freeze({route:'planning',actionIds:freeze(actionIds),rejectedActionIds:freeze([]),adaptationConstraint:'reduce_burden',instruction:'Return to Planning with the identified execution barrier and prefer a lower-burden intervention.',preservePlan:false});
  case'replace':return freeze({route:'planning',actionIds:freeze(actionIds),rejectedActionIds:freeze(actionIds),adaptationConstraint:'different_mechanism',instruction:'Return to Planning; do not reselect the ineffective intervention without new evidence.',preservePlan:false});
  case'reassess':return freeze({route:'discovery',actionIds:freeze(actionIds),instruction:'Return upstream because member context or safety conditions changed.',preservePlan:false});
  case'disengaged':return freeze({route:'pause-reengage',actionIds:freeze(actionIds),instruction:'Pause ordinary plan progression and offer the member a low-friction choice to resume, change focus, or pause.',preservePlan:true,pausePlan:true,memberPrompt:'pause_or_reengage'});
  default:throw new Error('Unsupported review decision');
 }
}
