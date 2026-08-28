function informationValue(q){return (q.expectedUncertaintyReduction??0)+(q.coverageDeficit??0)*0.5-(q.redundancyPenalty??0)}
function unresolvedUncertainty(q,state){return Boolean(q.addressesUnresolvedUncertainty||state?.uncertain||state?.resolutionState==='narrowing'||state?.driverKnown===false)}
function targetSet(q){return new Set([q.concernId,...(q.concernIds??[])].filter(Boolean))}
function safetyQuestion(q){return q.path==='safety'}
function positiveQuestion(q){return q.path==='positive'||q.role==='goal-probe'||q.role==='growth-probe'||q.role==='strength-probe'}
// Positive Discovery requires an affirmative resolved non-issue state. Unknown or merely
// unestablished concern evidence is not evidence that the member is doing well.
function noMaterialConcern(states){return states.length>0&&states.every(s=>s.resolutionState==='nonIssue')}
function stateForQuestion(q,stateById){for(const id of targetSet(q)){const state=stateById.get(id);if(state)return state}return null}
function decisionRelevant(q,state){return q.decisionCritical===true||safetyQuestion(q)||positiveQuestion(q)||unresolvedUncertainty(q,state)}
function priorityTier(q,stateById){return stateForQuestion(q,stateById)?.memberImportanceRank??0}
function compareCandidates(a,b,stateById){const tierDelta=priorityTier(b,stateById)-priorityTier(a,stateById);if(tierDelta)return tierDelta;const unresolvedDelta=Number(unresolvedUncertainty(b,stateForQuestion(b,stateById)))-Number(unresolvedUncertainty(a,stateForQuestion(a,stateById)));if(unresolvedDelta)return unresolvedDelta;const valueDelta=informationValue(b)-informationValue(a);if(valueDelta)return valueDelta;return a.id.localeCompare(b.id)}
export function selectNextQuestion({candidates,states,recentQuestions=[]}){
 const stateById=new Map(states.map(s=>[s.concernId,s]));
 const safetyConcerns=states.filter(s=>(s.safetyEscalationLevel??0)>0&&!['escalated','nonIssue'].includes(s.resolutionState));
 if(safetyConcerns.length){const eligibleSafety=candidates.filter(q=>safetyQuestion(q)&&q.eligible!==false&&!q.depthBudgetExhausted);if(!eligibleSafety.length)return{type:'escalate-safety',question:null,reason:'unresolved-safety-no-eligible-question'};eligibleSafety.sort((a,b)=>(b.safetyPriority??0)-(a.safetyPriority??0)||a.id.localeCompare(b.id));return{type:'question',question:eligibleSafety[0],reason:'safety-clarification-path'}}
 if(noMaterialConcern(states)){const positive=candidates.filter(q=>positiveQuestion(q)&&q.eligible!==false&&!q.depthBudgetExhausted&&!recentQuestions.some(prev=>prev.id===q.id));if(positive.length){positive.sort((a,b)=>informationValue(b)-informationValue(a)||a.id.localeCompare(b.id));return{type:'question',question:positive[0],score:informationValue(positive[0]),reason:'positive-goal-path'}}return{type:'none',question:null,reason:'positive-path-sufficient'}}
 const eligible=candidates.filter(q=>q.eligible!==false&&!q.depthBudgetExhausted&&!recentQuestions.some(prev=>prev.id===q.id));if(!eligible.length)return{type:'none',question:null,reason:'no-eligible-question'};
 const relevant=eligible.filter(q=>decisionRelevant(q,stateForQuestion(q,stateById)));if(!relevant.length)return{type:'none',question:null,reason:'decision-relevance-sufficient'};
 relevant.sort((a,b)=>compareCandidates(a,b,stateById));const best=relevant[0],state=stateForQuestion(best,stateById);
 return{type:'question',question:best,score:informationValue(best),reason:best.decisionCritical===true?'decision-critical':unresolvedUncertainty(best,state)?'unresolved-uncertainty':'importance-tier',allocation:{priorityTier:priorityTier(best,stateById)}};
}
