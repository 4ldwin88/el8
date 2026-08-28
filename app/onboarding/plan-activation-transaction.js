export async function activateCanonicalOnboarding({userId,memberState,plan,persisted,applyPlan,persistState,completeOnboarding}){
  if(!userId||!memberState||!plan) throw new Error('activation inputs are required');
  if(typeof applyPlan!=='function'||typeof persistState!=='function'||typeof completeOnboarding!=='function') throw new Error('activation dependencies are required');
  const next=applyPlan(memberState,plan);
  let current=persisted||null;
  if(!current) current=await persistState({userId,expectedRevision:-1,state:memberState});
  if(current.revision===next.revision){
    const stored=current.state||null;
    if(!stored||stored.revision!==next.revision) throw new Error('Stored Member State revision mismatch');
  }else if(current.revision===memberState.revision){
    current=await persistState({userId,expectedRevision:memberState.revision,state:next});
  }else throw new Error('Member State revision conflict');
  await completeOnboarding();
  return next;
}
