import { supabase } from '../../el8-client.js';

// Completion is a lifecycle transition only. Canonical plan/state persistence
// must succeed before this is called; the database guard validates that the
// authenticated member owns the profile, has an active account, and completed
// the Universal Baseline before allowing onboarding_status='completed'.
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
