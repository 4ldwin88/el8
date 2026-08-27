import { supabase } from '../../el8-client.js';

// Completion is a lifecycle transition only. Canonical plan/state persistence
// must succeed before this is called; this transport does not author a plan.
export async function completeCanonicalOnboarding(){
  const {error}=await supabase.rpc('el8_complete_onboarding');
  if(error) throw error;
}
