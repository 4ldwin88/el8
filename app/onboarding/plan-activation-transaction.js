export async function activateCanonicalOnboarding({userId,memberState,plan,applyPlan,loadState,persistState,completeOnboarding}){
 if(!userId||!memberState||!plan)throw new Error('activation inputs are required');
 if(typeof applyPlan!=='function'||typeof loadState!=='function'||typeof persistState!=='function'||typeof completeOnboarding!=='function')throw new Error('activation dependencies are required');
 let current=await loadState(userId);
 if(current){
  if(current.revision!==current.state?.revision)throw new Error('Stored Member State revision mismatch');
  if(current.state?.activePlanRef?.planId){await completeOnboarding();return current.state}
  if(current.revision!==memberState.revision)throw new Error('Member State revision conflict');
 }else{
  if(memberState.revision!==0)throw new Error('Member State revision conflict');
  current=await persistState({userId,expectedRevision:-1,state:memberState});
  if(current.revision!==memberState.revision||current.state?.revision!==memberState.revision)throw new Error('Stored Member State revision mismatch');
 }
 const baseState=current.state;
 const next=applyPlan(baseState,plan);
 current=await persistState({userId,expectedRevision:baseState.revision,state:next});
 if(current.revision!==next.revision||current.state?.revision!==next.revision)throw new Error('Stored Member State revision mismatch');
 await completeOnboarding();return next;
}
