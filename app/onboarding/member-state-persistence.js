import { supabase } from '../../el8-client.js';

export async function loadCanonicalMemberState(userId){
  if(!userId) throw new Error('userId is required');
  const {data,error}=await supabase.from('el8_member_state').select('revision,state').eq('user_id',userId).maybeSingle();
  if(error) throw error;
  return data||null;
}

export async function persistCanonicalMemberState({userId,expectedRevision,state}){
  if(!userId||!state) throw new Error('userId and state are required');
  if(!Number.isInteger(expectedRevision)||state.revision!==expectedRevision+1) throw new Error('invalid Member State revision transition');
  const now=new Date().toISOString();
  if(expectedRevision===-1){
    if(state.revision!==0) throw new Error('initial Member State must begin at revision 0');
    const {data,error}=await supabase.from('el8_member_state').insert({user_id:userId,revision:0,state,updated_at:now}).select('revision,state').single();
    if(error) throw error;
    return data;
  }
  const {data,error}=await supabase.from('el8_member_state').update({revision:state.revision,state,updated_at:now}).eq('user_id',userId).eq('revision',expectedRevision).select('revision,state').maybeSingle();
  if(error) throw error;
  if(!data) throw new Error('Member State revision conflict');
  return data;
}
