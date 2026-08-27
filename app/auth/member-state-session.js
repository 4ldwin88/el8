'use strict';
const {loadOrCreateMemberState,saveMemberState}=require('../../intelligence/member-state/supabase-persistence');

function authenticatedMemberId(session){const id=session?.user?.id;if(!id)throw new Error('authenticated session required');return id}

async function openMemberStateSession({supabase,session,now=new Date().toISOString()}){const memberId=authenticatedMemberId(session);const state=await loadOrCreateMemberState(supabase,{memberId,now});return{memberId,state}}

async function persistMemberStateSession({supabase,session,previousState,nextState}){const memberId=authenticatedMemberId(session);if(previousState?.memberId!==memberId||nextState?.memberId!==memberId)throw new Error('session/member state identity mismatch');if(nextState.revision<=previousState.revision)throw new Error('session save requires canonical state advancement');const newHistory=nextState.history.filter(h=>h.revision>previousState.revision);if(newHistory.length!==nextState.revision-previousState.revision)throw new Error('session save requires contiguous canonical history');for(let i=0;i<newHistory.length;i++){const expected=previousState.revision+i+1;if(newHistory[i].revision!==expected||newHistory[i].previousRevision!==expected-1)throw new Error('session save requires contiguous canonical history')}return saveMemberState(supabase,nextState,{expectedRevision:previousState.revision})}

module.exports={authenticatedMemberId,openMemberStateSession,persistMemberStateSession};
