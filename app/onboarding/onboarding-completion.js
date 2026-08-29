import { supabase } from '../../el8-client.js';

// Completion is a lifecycle transition only. Canonical Discovery, Member State
// and plan persistence/activation must succeed before this is called; database
// policy remains responsible for validating the authenticated profile update.
export async function completeCanonicalOnboarding(){
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError) throw userError;
  if(!user?.id) throw new Error('Not authenticated');

  const {error}=await supabase
    .from('el8_profiles')
    .update({onboarding_status:'completed'})
    .eq('user_id',user.id);
  if(error) throw error;
}
