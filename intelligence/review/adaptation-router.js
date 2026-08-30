// Review -> next canonical Intelligence capability. Routing only; downstream engines retain authority.
const freeze=x=>Object.freeze(x);
const activeActions=plan=>plan.activeActions||plan.actions||plan.active||[];
const actionId=action=>action.actionId||action.id||null;
export function routeReview({review={},plan={}}={}){
 if(!review.valid)throw new Error('Valid Review decision required');
 const actionIds=activeActions(plan).map(actionId).filter(Boolean);
 switch(review.decision){
  case'keep':return freeze({route:'continue',actionIds:freeze(actionIds),instruction:'Continue current Plan until next Review.',preservePlan:true});
  case'deepen':return freeze({route:'review-deepening',actionIds:freeze(actionIds),instruction:'Collect only the missing Review evidence before changing the Plan.',preservePlan:true});
  case'simplify':return freeze({route:'planning',actionIds:freeze(actionIds),rejectedActionIds:freeze([]),adaptationConstraint:'reduce_burden',instruction:'Return to Planning with the identified execution barrier and prefer a lower-burden Action.',preservePlan:false});
  case'replace':return freeze({route:'planning',actionIds:freeze(actionIds),rejectedActionIds:freeze(actionIds),adaptationConstraint:'different_action',instruction:'Return to Planning; do not reselect the ineffective Action without new evidence.',preservePlan:false});
  case'reassess':return freeze({route:'discovery',actionIds:freeze(actionIds),instruction:'Return upstream because member context or Safety conditions changed.',preservePlan:false});
  case'disengaged':return freeze({route:'pause-reengage',actionIds:freeze(actionIds),instruction:'Pause ordinary Plan progression and offer the member a low-friction choice to resume, change Focus, or pause.',preservePlan:true,pausePlan:true,memberPrompt:'pause_or_reengage'});
  default:throw new Error('Unsupported Review decision');
 }
}
