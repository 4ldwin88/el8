import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const supabase=createClient('https://jprdsidxwjkgiqqakwpr.supabase.co','sb_publishable_CkcqWpD6nkzRzBfuJV08TQ_t38C9j34',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
export async function complete(payload){try{const{error}=await supabase.rpc('el8_intelligence_test_complete',{p_result:payload});if(error)throw error;return true}catch(e){console.warn('Intelligence Test completion failed',e);return false}}
