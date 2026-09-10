// Canonical Discovery -> Member State v3 projection used by production-like QA and runtime boundaries.
// Discovery owns evidence acquisition/sufficiency; this adapter persists supported construct state
// without discarding a bounded decision-useful handoff simply because the bank did not mark every
// construct resolutionState as sufficient.
import {createMemberState,createFact} from './member-state-contract.js';
import {applyMemberStateTransitions,MEMBER_STATE_EVENT} from './member-state-transition.js';

const SUPPORTED_DISCOVERY_STATUS=new Set(['established','supported']);
const QUALITATIVE_CONFIDENCE=new Set(['LIMITED','MODERATE','WELL_SUPPORTED']);
function canonicalConfidence(item={}){
 const raw=item.qualitativeConfidence??'UNKNOWN';
 const normalized=String(raw).trim().toUpperCase().replace(/[ -]+/g,'_');
 return QUALITATIVE_CONFIDENCE.has(normalized)?normalized:'UNKNOWN';
}
function decisionUsefulIds(source={}){
 // Canonical runtime output carries the governed handoff beside trace: {trace,handoff}.
 // Historical trace shapes may carry it under trace.handoff or stopping metadata.
 const handoff=source?.handoff??source?.trace?.handoff??null;
 const stop=source?.stop??source?.stoppingDecision??source?.trace?.stop??source?.trace?.stoppingDecision??null;
 const ids=handoff?.candidateIds??stop?.candidateIds??[];
 return new Set(Array.isArray(ids)?ids:[]);
}

export function discoveryOutputToMemberState(output,{memberId=null,existingState=null,at=new Date().toISOString()}={}){
 const trace=output?.trace??output;
 const states=Array.isArray(trace?.states)?trace.states:[];
 const handoffIds=decisionUsefulIds(output);
 const state=existingState??createMemberState({memberId,now:at}),events=[];
 if(memberId!==null&&state.memberId!==memberId)throw new Error('Discovery/member state identity mismatch');
 const observations=trace?.observations??[];
 if(!Array.isArray(observations))throw new Error('Discovery observations must be an array');
 for(const observation of observations){
  if(!observation?.id||!observation.questionId||!Number.isFinite(observation.timestamp))throw new Error('Discovery observation requires identity, question provenance and time');
  const fact=createFact({factId:`discovery:${observation.id}`,semanticKey:'discovery.observation',value:structuredClone(observation),sourceType:'discovery_observation',sourceRef:observation.id,observedAt:new Date(observation.timestamp).toISOString()});
  events.push({type:MEMBER_STATE_EVENT.FACT_RECORDED,payload:fact});
 }
 for(const item of states){
  if(!item?.constructId||item.excluded||['deferred','nonIssue','escalated'].includes(item.resolutionState))continue;
  if(!SUPPORTED_DISCOVERY_STATUS.has(item.status))continue;
  const decisionUseful=handoffIds.has(item.constructId);
  const sufficient=item.resolutionState==='sufficient'||decisionUseful;
  events.push({type:MEMBER_STATE_EVENT.CONSTRUCT_UPDATED,payload:{constructId:item.constructId,status:'supported',evidenceConfidence:canonicalConfidence(item),sufficiency:sufficient?'sufficient':'insufficient',unresolvedReasons:sufficient?[]:[...(item.unresolvedReasons??[])],evidenceRefs:[...(item.evidenceRefs??[])],lastObservedAt:item.lastObservedAt??null}});
 }
 return events.length?applyMemberStateTransitions(state,{events,source:'discovery',at,expectedRevision:state.revision}):state;
}

export function memberStateToPrioritizationInput(state){
 const candidates=Object.values(state?.constructs??{}).filter(item=>item.status==='supported'&&item.sufficiency==='sufficient').map(item=>Object.freeze({constructId:item.constructId,status:'supported',evidenceRefs:[...(item.evidenceRefs??[])]}));
 return Object.freeze({memberStateRevision:state.revision,candidates,evidenceRefs:[...new Set(candidates.flatMap(item=>item.evidenceRefs))],sufficiency:'sufficient',uncertaintyRefs:[]});
}
