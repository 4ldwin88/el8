// Production projection from canonical Discovery/Prioritization/Focus output into Member State v3.
// Upstream reasoning remains upstream; this module records established constructs and member decisions.
import {createMemberState} from '../../intelligence/state/member-state-contract.js';
import {applyMemberStateTransition,MEMBER_STATE_EVENT} from '../../intelligence/state/member-state-transition.js';
export function projectOnboardingMemberState({memberId,constructs=[],focusDecisions=[],memberContext={},safetyDisposition=null,now=new Date().toISOString()}={}){
 if(!memberId)throw new Error('memberId is required');
 let state=createMemberState({memberId,now});
 for(const item of constructs){if(!item?.constructId)throw new Error('constructId is required');state=applyMemberStateTransition(state,{type:MEMBER_STATE_EVENT.CONSTRUCT_UPDATED,payload:{constructId:item.constructId,status:item.status||'supported',evidenceConfidence:item.evidenceConfidence??'unknown',sufficiency:item.sufficiency||'sufficient',evidenceRefs:[...(item.evidenceRefs||[])],observationRefs:[...(item.observationRefs||[])],unresolvedReasons:[...(item.unresolvedReasons||[])]},source:'discovery:onboarding',at:now,expectedRevision:state.revision})}
 for(const decision of focusDecisions){state=applyMemberStateTransition(state,{type:MEMBER_STATE_EVENT.FOCUS_DECIDED,payload:decision,source:'member:onboarding',at:decision.decidedAt||now,expectedRevision:state.revision})}
 if(Object.keys(memberContext).length)state=applyMemberStateTransition(state,{type:MEMBER_STATE_EVENT.MEMBER_CONTEXT_UPDATED,payload:memberContext,source:'onboarding:context',at:now,expectedRevision:state.revision});
 if(safetyDisposition)state=applyMemberStateTransition(state,{type:MEMBER_STATE_EVENT.SAFETY_DISPOSITION_UPDATED,payload:safetyDisposition,source:'safety:onboarding',at:now,expectedRevision:state.revision});
 return state;
}
