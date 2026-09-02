// Canonical Discovery -> Member State v3 projection used by production-like QA and runtime boundaries.
// Discovery owns evidence acquisition/sufficiency; this adapter only persists supported construct state.
import {createMemberState} from './member-state-contract.js';
import {applyMemberStateTransition,MEMBER_STATE_EVENT} from './member-state-transition.js';

const SUPPORTED_DISCOVERY_STATUS=new Set(['established','supported']);
const tx=(state,type,payload,source,at)=>applyMemberStateTransition(state,{type,payload,source,at,expectedRevision:state.revision});

export function discoveryOutputToMemberState(output,{memberId=null,existingState=null,at=new Date().toISOString()}={}){
 const trace=output?.trace??output;
 const states=Array.isArray(trace?.states)?trace.states:[];
 let state=existingState??createMemberState({memberId,now:at});
 for(const item of states){
  if(!item?.constructId||item.excluded||['deferred','nonIssue','escalated'].includes(item.resolutionState))continue;
  if(!SUPPORTED_DISCOVERY_STATUS.has(item.status))continue;
  state=tx(state,MEMBER_STATE_EVENT.CONSTRUCT_UPDATED,{constructId:item.constructId,status:'supported',evidenceConfidence:item.evidenceConfidence??'unknown',sufficiency:item.resolutionState==='sufficient'?'sufficient':'insufficient',unresolvedReasons:[...(item.unresolvedReasons??[])],evidenceRefs:[...(item.evidenceRefs??[])],lastObservedAt:item.lastObservedAt??null},'discovery',at);
 }
 return state;
}

export function memberStateToPrioritizationInput(state){
 const candidates=Object.values(state?.constructs??{}).filter(item=>item.status==='supported'&&item.sufficiency==='sufficient').map(item=>Object.freeze({constructId:item.constructId,status:'supported',evidenceRefs:[...(item.evidenceRefs??[])]}));
 return Object.freeze({memberStateRevision:state.revision,candidates,evidenceRefs:[...new Set(candidates.flatMap(item=>item.evidenceRefs))],sufficiency:'sufficient',uncertaintyRefs:[]});
}
