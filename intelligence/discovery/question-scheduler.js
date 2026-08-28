function targetSet(q){return new Set([q.concernId,...(q.concernIds??[])].filter(Boolean))}
function safetyQuestion(q){return q.path==='safety'}
function positiveQuestion(q){return q.path==='positive'||q.role==='goal-probe'||q.role==='growth-probe'||q.role==='strength-probe'}
function stateForQuestion(q,stateById){for(const id of targetSet(q)){const state=stateById.get(id);if(state)return state}return null}
function requiredForHandoff(q){return q.requiredForHandoff===true||q.decisionCritical===true}
function unresolvedQuestion(q,state){return state?.resolutionState==='unresolved'&&(requiredForHandoff(q)||q.addressesUnresolvedUncertainty===true||state?.driverKnown===false)}
function memberImportance(q,stateById){return stateForQuestion(q,stateById)?.memberImportanceRank??0}
function optionalBurden(q){return q.burden??0}
function compareRequired(a,b,stateById){const importanceDelta=memberImportance(b,stateById)-memberImportance(a,stateById);if(importanceDelta)return importanceDelta;const burdenDelta=optionalBurden(a)-optionalBurden(b);if(burdenDelta)return burdenDelta;return a.id.localeCompare(b.id)}
function compareOptional(a,b,stateById){const importanceDelta=memberImportance(b,stateById)-memberImportance(a,stateById);if(importanceDelta)return importanceDelta;const burdenDelta=optionalBurden(a)-optionalBurden(b);if(burdenDelta)return burdenDelta;return a.id.localeCompare(b.id)}
function available(candidates,recentQuestions){return candidates.filter(q=>q.eligible!==false&&!q.depthBudgetExhausted&&!recentQuestions.some(prev=>prev.id===q.id))}
export function selectNextQuestion({candidates,states,recentQuestions=[]}){
 const stateById=new Map(states.map(s=>[s.concernId,s]));
 const eligible=available(candidates,recentQuestions);
 const safety=eligible.filter(safetyQuestion);
 if(safety.length){safety.sort((a,b)=>(b.safetyPriority??0)-(a.safetyPriority??0)||a.id.localeCompare(b.id));return{type:'question',question:safety[0],reason:'safety-clarification-path'}}
 const required=eligible.filter(q=>requiredForHandoff(q)&&unresolvedQuestion(q,stateForQuestion(q,stateById)));
 if(required.length){required.sort((a,b)=>compareRequired(a,b,stateById));return{type:'question',question:required[0],reason:'required-handoff-evidence',allocation:{memberImportance:memberImportance(required[0],stateById)}}}
 const unresolved=eligible.filter(q=>unresolvedQuestion(q,stateForQuestion(q,stateById)));
 if(unresolved.length){unresolved.sort((a,b)=>compareOptional(a,b,stateById));return{type:'question',question:unresolved[0],reason:'unresolved-clarification',allocation:{memberImportance:memberImportance(unresolved[0],stateById)}}}
 const positive=eligible.filter(positiveQuestion);
 if(positive.length&&states.length>0&&states.every(s=>s.resolutionState==='dismissed')){positive.sort((a,b)=>optionalBurden(a)-optionalBurden(b)||a.id.localeCompare(b.id));return{type:'question',question:positive[0],reason:'positive-goal-path'}}
 return{type:'none',question:null,reason:eligible.length?'decision-relevance-sufficient':'no-eligible-question'};
}
