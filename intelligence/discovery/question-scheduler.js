import {unresolvedRequiredEvidence} from './sufficiency.js';
function targetSet(q){return new Set([q.concernId,...(q.concernIds??[])].filter(Boolean))}
function safetyQuestion(q){return q.path==='safety'}
function positiveQuestion(q){return q.path==='positive'||q.role==='goal-probe'||q.role==='growth-probe'||q.role==='strength-probe'}
function stateForQuestion(q,stateById){for(const id of targetSet(q)){const state=stateById.get(id);if(state)return state}return null}
function directStateQuestion(q){return ['state-probe','concern-scope','confirmation'].includes(q.role)}
function targetedClarificationQuestion(q){return ['discriminator','driver-discriminator'].includes(q.role)&&targetSet(q).size>0}
function requiredForHandoff(q){return q.requiredForHandoff===true||q.decisionCritical===true}
function unresolvedRequirementIds(state){return new Set(unresolvedRequiredEvidence(state).map(x=>x.id))}
function addressesRequiredEvidence(q,state){const id=q?.sufficiencyRequirement?.id;return Boolean(id&&unresolvedRequirementIds(state).has(id))}
function unresolvedQuestion(q,state){return state?.resolutionState==='unresolved'&&(directStateQuestion(q)||targetedClarificationQuestion(q)||requiredForHandoff(q)||q.addressesUnresolvedUncertainty===true||addressesRequiredEvidence(q,state))}
function recallQuestion(q){return /\b(past|last)\s+(7\s+days|4\s+weeks|week|month)\b/i.test(q?.text||'')}
function recallStreak(recent=[]){let n=0;for(let i=recent.length-1;i>=0&&recallQuestion(recent[i]);i--)n++;return n}
function effectiveBurden(q,recent=[]){return(q.burden??0)+(recallQuestion(q)&&recallStreak(recent)>=2?.3:0)}
function compareEvidenceNeed(a,b,stateById,recent=[]){const priority=(b.schedulingPriority??0)-(a.schedulingPriority??0);if(priority)return priority;const aState=stateForQuestion(a,stateById),bState=stateForQuestion(b,stateById);const aDirect=directStateQuestion(a)?1:0,bDirect=directStateQuestion(b)?1:0;if(aDirect!==bDirect)return bDirect-aDirect;const aRequired=addressesRequiredEvidence(a,aState)?1:0,bRequired=addressesRequiredEvidence(b,bState)?1:0;if(aRequired!==bRequired)return bRequired-aRequired;const burdenDelta=effectiveBurden(a,recent)-effectiveBurden(b,recent);if(burdenDelta)return burdenDelta;return a.id.localeCompare(b.id)}
function available(candidates,recentQuestions){return candidates.filter(q=>q.eligible!==false&&!q.depthBudgetExhausted&&!recentQuestions.some(prev=>prev.id===q.id))}
export function selectNextQuestion({candidates,states,recentQuestions=[]}){
 const stateById=new Map(states.map(s=>[s.concernId,s]));
 const eligible=available(candidates,recentQuestions);
 const safety=eligible.filter(safetyQuestion);
 if(safety.length){safety.sort((a,b)=>(b.safetyPriority??0)-(a.safetyPriority??0)||a.id.localeCompare(b.id));return{type:'question',question:safety[0],reason:'safety-clarification-path'}}
 const evidenceRequired=eligible.filter(q=>addressesRequiredEvidence(q,stateForQuestion(q,stateById)));
 if(evidenceRequired.length){evidenceRequired.sort((a,b)=>compareEvidenceNeed(a,b,stateById,recentQuestions));return{type:'question',question:evidenceRequired[0],reason:'required-evidence-contract'}}
 const required=eligible.filter(q=>requiredForHandoff(q)&&unresolvedQuestion(q,stateForQuestion(q,stateById)));
 if(required.length){required.sort((a,b)=>compareEvidenceNeed(a,b,stateById,recentQuestions));return{type:'question',question:required[0],reason:'required-handoff-evidence'}}
 const unresolved=eligible.filter(q=>unresolvedQuestion(q,stateForQuestion(q,stateById)));
 if(unresolved.length){unresolved.sort((a,b)=>compareEvidenceNeed(a,b,stateById,recentQuestions));return{type:'question',question:unresolved[0],reason:'unresolved-clarification'}}
 const positive=eligible.filter(positiveQuestion);
 if(positive.length&&states.length>0&&states.every(s=>s.resolutionState==='dismissed')){positive.sort((a,b)=>effectiveBurden(a,recentQuestions)-effectiveBurden(b,recentQuestions)||a.id.localeCompare(b.id));return{type:'question',question:positive[0],reason:'positive-goal-path'}}
 return{type:'none',question:null,reason:eligible.length?'decision-relevance-sufficient':'no-eligible-question'};
}
