export const SCHEDULER_CONFIG=Object.freeze({OVERRIDE_MARGIN:0.45,RECENT_RELATED_WINDOW:2,RECENT_RELATED_PENALTY:0.18,LOW_IMPORTANCE_MAX_QUESTIONS:2,LOW_IMPORTANCE_MAX_RANK:1,MIN_DECISION_VALUE:0.12});
function informationValue(q){return (q.expectedUncertaintyReduction??0)+(q.coverageDeficit??0)*0.5-(q.redundancyPenalty??0)}
function unresolvedUncertainty(q,state){return Boolean(q.addressesUnresolvedUncertainty||state?.uncertain||state?.resolutionState==='narrowing'||state?.driverKnown===false)}
function targetSet(q){return new Set([q.concernId,...(q.concernIds??[])].filter(Boolean))}
function related(a,b){const aa=targetSet(a),bb=targetSet(b);for(const id of aa)if(bb.has(id))return true;return false}
function recentRelatedPenalty(q,recentQuestions,config){if(!recentQuestions?.length)return 0;const recent=recentQuestions.slice(-config.RECENT_RELATED_WINDOW);return recent.some(prev=>related(q,prev))?config.RECENT_RELATED_PENALTY:0}
function questionsForConcern(concernId,recentQuestions=[]){return recentQuestions.filter(q=>targetSet(q).has(concernId)).length}
function allocationEligible(q,state,recentQuestions,config){if(!state)return true;if((state.memberImportanceRank??0)>config.LOW_IMPORTANCE_MAX_RANK)return true;if(state.memberPrioritySelected)return true;return questionsForConcern(state.concernId,recentQuestions)<config.LOW_IMPORTANCE_MAX_QUESTIONS}
// Safety clarification is an explicit path. Sharing a concern id with a safety concern
// must never let an ordinary question masquerade as a Safety question.
function safetyQuestion(q){return q.path==='safety'}
function positiveQuestion(q){return q.path==='positive'||q.role==='goal-probe'||q.role==='growth-probe'||q.role==='strength-probe'}
// Positive Discovery requires an affirmative resolved non-issue state. Unknown or merely
// unestablished concern evidence is not evidence that the member is doing well.
function noMaterialConcern(states){return states.length>0&&states.every(s=>s.resolutionState==='nonIssue')}
function decisionRelevant(q,value,config){return q.decisionCritical===true||q.path==='safety'||q.path==='positive'||value>=config.MIN_DECISION_VALUE}
export function selectNextQuestion({candidates,states,recentQuestions=[],config=SCHEDULER_CONFIG}){
 const stateById=new Map(states.map(s=>[s.concernId,s]));
 const safetyConcerns=states.filter(s=>(s.safetyEscalationLevel??0)>0&&!['escalated','nonIssue'].includes(s.resolutionState));
 if(safetyConcerns.length){const eligibleSafety=candidates.filter(q=>safetyQuestion(q)&&q.eligible!==false&&!q.depthBudgetExhausted);if(!eligibleSafety.length)return{type:'escalate-safety',question:null,reason:'unresolved-safety-no-eligible-question'};eligibleSafety.sort((a,b)=>(b.safetyPriority??0)-(a.safetyPriority??0)||a.id.localeCompare(b.id));return{type:'question',question:eligibleSafety[0],reason:'safety-clarification-path'}}
 if(noMaterialConcern(states)){const positive=candidates.filter(q=>positiveQuestion(q)&&q.eligible!==false&&!q.depthBudgetExhausted&&!recentQuestions.some(prev=>prev.id===q.id));if(positive.length){positive.sort((a,b)=>informationValue(b)-informationValue(a)||a.id.localeCompare(b.id));return{type:'question',question:positive[0],score:informationValue(positive[0]),reason:'positive-goal-path'}}return{type:'none',question:null,reason:'positive-path-sufficient'}}
 const eligible=candidates.filter(q=>q.eligible!==false&&!q.depthBudgetExhausted&&allocationEligible(q,stateById.get(q.concernId),recentQuestions,config));if(!eligible.length)return{type:'none',question:null,reason:'no-eligible-question'};
 const value=q=>informationValue(q)-recentRelatedPenalty(q,recentQuestions,config);const tier=q=>stateById.get(q.concernId)?.memberImportanceRank??0;const topTier=Math.max(...eligible.map(tier));const inTier=eligible.filter(q=>tier(q)===topTier).map(q=>({q,value:value(q)})).filter(x=>decisionRelevant(x.q,x.value,config)).sort((a,b)=>b.value-a.value||a.q.id.localeCompare(b.q.id));
 const challengers=eligible.filter(q=>tier(q)<topTier).map(q=>({q,value:value(q),state:stateById.get(q.concernId)})).filter(x=>unresolvedUncertainty(x.q,x.state)&&decisionRelevant(x.q,x.value,config)).sort((a,b)=>b.value-a.value||a.q.id.localeCompare(b.q.id));const challenger=challengers[0];const best=inTier[0];
 if(!best&&!challenger)return{type:'none',question:null,reason:'decision-value-sufficient'};
 if(!best&&challenger)return{type:'question',question:challenger.q,score:challenger.value,reason:'unresolved-uncertainty-only'};
 if(challenger&&challenger.value>best.value+config.OVERRIDE_MARGIN)return{type:'question',question:challenger.q,score:challenger.value,reason:'cross-tier-unresolved-uncertainty-override',allocation:{topTier,overrideMargin:config.OVERRIDE_MARGIN,inTierQuestion:best.q.id,inTierValue:best.value}};
 return{type:'question',question:best.q,score:best.value,reason:'importance-tier-gate',allocation:{topTier,overrideMargin:config.OVERRIDE_MARGIN,recentRelatedPenalty:recentRelatedPenalty(best.q,recentQuestions,config)}};
}
