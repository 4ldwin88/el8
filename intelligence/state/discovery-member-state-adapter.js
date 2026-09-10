// Discovery owns sufficiency. Candidate visibility is never evidence that its
// requirements have been met; this mapper preserves that distinction and context.
import {createMemberState,createFact} from './member-state-contract.js';
import {applyMemberStateTransitions,MEMBER_STATE_EVENT} from './member-state-transition.js';
import {isActiveDiscoveryCandidate,hasSufficientDiscoveryEvidence} from '../discovery/sufficiency.js';

const SUPPORTED_DISCOVERY_STATUS=new Set(['established','supported']);
const QUALITATIVE_CONFIDENCE=new Set(['LIMITED','MODERATE','WELL_SUPPORTED']);
function canonicalConfidence(item={}){
 const raw=item.qualitativeConfidence??'UNKNOWN';
 const normalized=String(raw).trim().toUpperCase().replace(/[ -]+/g,'_');
 return QUALITATIVE_CONFIDENCE.has(normalized)?normalized:'UNKNOWN';
}
function semanticContext(item){
 const context={};
 for(const key of ['uncertaintyRefs','provenanceRefs','memberImportance','memberPriority','readiness','temporality','relationships','feasibility','stateEvidence','facetEvidence','contextEvidence','uncertaintyEvidence','negativeEvidence','observationRefs','questionRefs']){
  if(Object.hasOwn(item,key))context[key]=structuredClone(item[key]);
 }
 return context;
}

export function discoveryOutputToMemberState(output,{memberId=null,existingState=null,at=new Date().toISOString()}={}){
 const trace=output?.trace??output;
 const states=Array.isArray(trace?.states)?trace.states:[];
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
  if(!item?.constructId)throw new Error('Explicit Discovery state requires a construct identity');
  const active=isActiveDiscoveryCandidate(item),sufficient=hasSufficientDiscoveryEvidence(item);
  events.push({type:MEMBER_STATE_EVENT.CONSTRUCT_UPDATED,payload:{constructId:item.constructId,status:SUPPORTED_DISCOVERY_STATUS.has(item.status)?'supported':item.status,evidenceConfidence:canonicalConfidence(item),sufficiency:sufficient?'sufficient':active?'insufficient':'unknown',discoveryHandoff:{resolutionState:item.resolutionState??null,excluded:Boolean(item.excluded)},unresolvedReasons:[...(item.unresolvedReasons??[])],evidenceRefs:[...(item.evidenceRefs??[])],lastObservedAt:item.lastObservedAt??null,...semanticContext(item)}});
 }
 return events.length?applyMemberStateTransitions(state,{events,source:'discovery',at,expectedRevision:state.revision}):state;
}

export function memberStateToPrioritizationInput(state){
 const constructs=Object.values(state?.constructs??{});
 const candidates=constructs.filter(item=>item.status==='supported'&&item.sufficiency==='sufficient'&&isActiveDiscoveryCandidate(item.discoveryHandoff??{})).map(item=>Object.freeze(structuredClone(item)));
 return Object.freeze({memberStateRevision:state.revision,candidates,evidenceRefs:[...new Set(candidates.flatMap(item=>item.evidenceRefs))],sufficiency:candidates.length?'sufficient':'unknown',uncertaintyRefs:[...new Set(constructs.flatMap(item=>item.uncertaintyRefs??[]))]});
}
