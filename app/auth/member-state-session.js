import {createMemberState,validateMemberStateShape} from '../../intelligence/state/member-state-contract.js';
import {loadMemberState,saveMemberState} from '../../intelligence/state/supabase-persistence.js';
export function authenticatedMemberId(session){const id=session?.user?.id;if(!id)throw new Error('authenticated session required');return id}
function assertSessionState(state,memberId){const errors=validateMemberStateShape(state);if(errors.length)throw new Error(`invalid canonical Member State: ${errors.join('; ')}`);if(state.memberId!==memberId)throw new Error('session/member state identity mismatch');return state}
export async function openMemberStateSession({supabase,session,now=new Date().toISOString()}){const memberId=authenticatedMemberId(session),state=await loadMemberState(supabase);if(!state)return{memberId,state:createMemberState({memberId,now}),persisted:false};assertSessionState(state,memberId);return{memberId,state,persisted:true}}
export async function persistMemberStateSession({supabase,session,previousState,nextState,persisted=true}) {
  const memberId=authenticatedMemberId(session);
  assertSessionState(previousState,memberId);
  assertSessionState(nextState,memberId);
  if(nextState.revision!==previousState.revision+1) throw new Error('session save requires exactly one canonical revision advancement');
  if(!Array.isArray(nextState.historyRefs)||!previousState.historyRefs.every((ref,index)=>nextState.historyRefs[index]===ref)) throw new Error('session save cannot remove or rewrite canonical history references');
  if(!persisted) {
    if(previousState.revision!==0) throw new Error('new session must persist revision 0 before advancement');
    // This is an explicit save, not a read-time migration. If creation succeeds
    // and update fails, reload exposes revision 0 for a guarded retry. If either
    // acknowledgement is ambiguous, reload first; never guess or skip revisions.
    await saveMemberState(supabase,previousState,{expectedRevision:-1});
  }
  return saveMemberState(supabase,nextState,{expectedRevision:previousState.revision});
}
