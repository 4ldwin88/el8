'use strict';
const {assertMemberState,createMemberState}=require('./member-state');

function requireClient(client){if(!client||typeof client.from!=='function'||typeof client.rpc!=='function')throw new Error('Supabase client required')}
function assertPersistedRow(row){if(!row||typeof row!=='object')throw new Error('persisted Member State row required');assertMemberState(row.state);if(row.schema_version!==row.state.schemaVersion)throw new Error('persisted schema mismatch');if(Number(row.revision)!==row.state.revision)throw new Error('persisted revision mismatch');return row.state}

async function loadMemberState(client){requireClient(client);const{data,error}=await client.from('el8_member_state').select('schema_version,revision,state').maybeSingle();if(error)throw error;return data?assertPersistedRow(data):null}

async function saveMemberState(client,state,{expectedRevision=state.revision-1}={}){requireClient(client);assertMemberState(state);const{data,error}=await client.rpc('save_el8_member_state',{expected_revision:expectedRevision,next_state:state});if(error)throw error;return assertPersistedRow(data)}

async function loadOrCreateMemberState(client,{memberId,now=new Date().toISOString()}={}){if(!memberId)throw new Error('memberId required');const existing=await loadMemberState(client);if(existing){if(existing.memberId!==memberId)throw new Error('authenticated member does not match persisted Member State');return existing}const initial=createMemberState({memberId,now});return saveMemberState(client,initial,{expectedRevision:-1})}

module.exports={loadMemberState,saveMemberState,loadOrCreateMemberState,assertPersistedRow};
