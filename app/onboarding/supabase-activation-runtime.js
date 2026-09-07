import {supabase} from '../../el8-client.js';
import {loadMemberState,saveMemberState} from '../../intelligence/state/supabase-persistence.js';
import {saveCanonicalPlan,activateCanonicalPlan} from '../../intelligence/planning/supabase-plan-persistence.js';
import {runtimeState,RUNTIME_STATE,runtimeStateFromError} from '../resilience/runtime-state.js';
import {applyCanonicalBrowserPlan} from './browser-member-state-plan.js';
import {activateCanonicalOnboarding} from './plan-activation-transaction.js';
import {completeCanonicalOnboarding} from './onboarding-completion.js';

async function requireAuthenticatedUser(){
  const {data:{user},error}=await supabase.auth.getUser();
  if(error) throw error;
  if(!user?.id) throw new Error('Not authenticated');
  return user;
}

async function loadState(userId){
  const state=await loadMemberState(supabase);
  if(!state) return null;
  if(state.memberId!==userId) throw new Error('Authenticated member does not match Member State');
  return {revision:state.revision,state};
}

async function persistState({userId,expectedRevision,state}){
  if(state.memberId!==userId) throw new Error('Authenticated member does not match Member State');
  const persisted=await saveMemberState(supabase,state,{expectedRevision});
  return {revision:persisted.revision,state:persisted};
}

async function persistPlan({userId,plan}){
  return saveCanonicalPlan(supabase,{memberId:userId,plan});
}

async function activatePlan({planId}){
  return activateCanonicalPlan(supabase,{planId});
}

export async function activateCanonicalOnboardingWithSupabase({memberState,plan}){
  const user=await requireAuthenticatedUser();
  if(memberState?.memberId!==user.id) throw new Error('Authenticated member does not match Member State');
  return activateCanonicalOnboarding({
    userId:user.id,
    memberState,
    plan,
    applyPlan:applyCanonicalBrowserPlan,
    loadState,
    persistState,
    persistPlan,
    activatePlan,
    completeOnboarding:completeCanonicalOnboarding
  });
}

// Browser-facing boundary: persistence/auth failures become governed recoverable states.
// The underlying activation transaction still throws, so callers that need strict failure
// semantics may continue using activateCanonicalOnboardingWithSupabase directly.
export async function activateCanonicalOnboardingRuntime(input,{online=typeof navigator==='undefined'?true:navigator.onLine!==false}={}){
  try{
    const value=await activateCanonicalOnboardingWithSupabase(input);
    return Object.freeze({value,error:null,state:runtimeState(RUNTIME_STATE.READY)});
  }catch(error){
    return Object.freeze({value:null,error,state:runtimeStateFromError(error,{online})});
  }
}
