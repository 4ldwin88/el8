export const SCHEDULER_CONFIG=Object.freeze({OVERRIDE_MARGIN:0.45,RECENT_RELATED_WINDOW:2,RECENT_RELATED_PENALTY:0.18,LOW_IMPORTANCE_MAX_QUESTIONS:2,LOW_IMPORTANCE_MAX_RANK:1});
function informationValue(q){return (q.expectedUncertaintyReduction??0)+(q.coverageDeficit??0)*0.5-(q.redundancyPenalty??0)}
function unresolvedUncertainty(q,state){return Boolean(q.addressesUnresolvedUncertainty||state?.uncertain||state?.resolutionState==='narrowing'||state?.driverKnown===false)}
function targetSet(q){return new Set([q.constructId,...(q.constructIds??[])].filter(Boolean))}
function related(a,b){const aa=targetSet(a),bb=targetSet(b);for(const id of aa)if(bb.has(id))return true;return false}
function recentRelatedPenalty(q,recentQuestions,config){if(!recentQuestions?.length)return 0;const recent=recentQuestions.slice(-config.RECENT_RELATED_WINDOW);return recent.some(prev=>related(q,prev))?config.RECENT_RELATED_PENALTY:0}
function questionsForConstruct(constructId,recentQuestions=[]){return recentQuestions.filter(q=>targetSet(q).has(constructId)).length}
function allocationEligible(q,state,recentQuestions,config){if(!state)return true;if((state.memberImportanceRank??0)>config.LOW_IMPORTANCE_MAX_RANK)return true;if(state.memberPrioritySelected)return true;return questionsForConstruct(state.constructId,recentQuestions)<config.LOW_IMPORTANCE_MAX_QUESTIONS}
export function selectNextQuestion({candidates,states,recentQuestions=[],config=SCHEDULER_CONFIG}){
 const stateById=new Map(states.map(s=>[s.constructId,s]));
 const safetyStates=states.filter(s=>(s.safetyEscalationLevel??0)>0&&!['escalated','nonIssue'].includes(s.resolutionState));
 if(safetyStates.length){const ids=new Set(safetyStates.map(s=>s.constructId));const eligibleSafety=candidates.filter(q=>ids.has(q.constructId)&&q.eligible!==false&&!q.depthBudgetExhausted);if(!eligibleSafety.length)return{type:'escalate-safety',question:null,reason:'unresolved-safety-no-eligible-question'};eligibleSafety.sort((a,b)=>(b.safetyPriority??0)-(a.safetyPriority??0)||a.id.localeCompare(b.id));return{type:'question',question:eligibleSafety[0],reason:'safety-hard-gate'}}
 const eligible=candidates.filter(q=>q.eligible!==false&&!q.depthBudgetExhausted&&allocationEligible(q,stateById.get(q.constructId),recentQuestions,config));if(!eligible.length)return{type:'none',question:null,reason:'no-eligible-question'};
 const value=q=>informationValue(q)-recentRelatedPenalty(q,recentQuestions,config);const tier=q=>stateById.get(q.constructId)?.memberImportanceRank??0;const topTier=Math.max(...eligible.map(tier));const inTier=eligible.filter(q=>tier(q)===topTier).map(q=>({q,value:value(q)})).sort((a,b)=>b.value-a.value||a.q.id.localeCompare(b.q.id));const best=inTier[0];
 const challengers=eligible.filter(q=>tier(q)<topTier).map(q=>({q,value:value(q),state:stateById.get(q.constructId)})).filter(x=>unresolvedUncertainty(x.q,x.state)).sort((a,b)=>b.value-a.value||a.q.id.localeCompare(b.q.id));const challenger=challengers[0];
 if(challenger&&challenger.value>best.value+config.OVERRIDE_MARGIN)return{type:'question',question:challenger.q,score:challenger.value,reason:'cross-tier-unresolved-uncertainty-override',allocation:{topTier,overrideMargin:config.OVERRIDE_MARGIN,inTierQuestion:best.q.id,inTierValue:best.value}};
 return{type:'question',question:best.q,score:best.value,reason:'importance-tier-gate',allocation:{topTier,overrideMargin:config.OVERRIDE_MARGIN,recentRelatedPenalty:recentRelatedPenalty(best.q,recentQuestions,config)}};
}
