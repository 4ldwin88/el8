import {createMemberState,validateMemberStateShape} from './member-state-contract.js';

// Storage representation identifier. This is deliberately not a Member State domain version.
export const MEMBER_STATE_PERSISTENCE_VERSION = '3.0.0';
function requireClient(client){if(!client||typeof client.from!=='function'||typeof client.rpc!=='function')throw new Error('Supabase client required')}
// Storage must not silently drop/coerce evidence through JSON serialization.
// This checks representation only; the domain validator still owns semantics.
function assertJsonValue(value, path='state', ancestors=new Set()) {
  if (value===null || typeof value==='string' || typeof value==='boolean') return;
  if (typeof value==='number' && Number.isFinite(value) && !Object.is(value,-0)) return;
  if (typeof value!=='object' || value===null) throw new Error(`non-JSON value at ${path}`);
  const array=Array.isArray(value);
  if (Object.getPrototypeOf(value)!==(array?Array.prototype:Object.prototype)) throw new Error(`non-JSON object at ${path}`);
  if (ancestors.has(value)) throw new Error(`cyclic JSON value at ${path}`);
  ancestors.add(value);
  const descriptors=Object.getOwnPropertyDescriptors(value);
  const keys=Reflect.ownKeys(descriptors).filter(key=>!(array&&key==='length'));
  if (array && (keys.length!==value.length || keys.some((key,index)=>key!==String(index)))) throw new Error(`non-JSON array at ${path}`);
  for (const key of keys) {
    const descriptor=descriptors[key];
    if (typeof key!=='string' || !descriptor.enumerable || !Object.hasOwn(descriptor,'value')) throw new Error(`non-JSON property at ${path}`);
    assertJsonValue(descriptor.value, `${path}.${key}`, ancestors);
  }
  ancestors.delete(value);
}
export function assertCanonicalMemberState(state){assertJsonValue(state);if(state&&Object.hasOwn(state,'schemaVersion'))throw new Error('domain Member State must not contain a storage schemaVersion');const errors=validateMemberStateShape(state);if(errors.length)throw new Error(`invalid canonical Member State: ${errors.join('; ')}`);return state}
export function toPersistedMemberState(state){assertCanonicalMemberState(state);return {...structuredClone(state),schemaVersion:MEMBER_STATE_PERSISTENCE_VERSION}}
export function fromPersistedMemberState(state){assertJsonValue(state);if(!state||state.schemaVersion!==MEMBER_STATE_PERSISTENCE_VERSION)throw new Error('unsupported persisted Member State schema; explicit migration required');const current=structuredClone(state);delete current.schemaVersion;return assertCanonicalMemberState(current)}
export function assertPersistedMemberStateRow(row){if(!row||typeof row!=='object')throw new Error('persisted Member State row required');if(row.schema_version!==MEMBER_STATE_PERSISTENCE_VERSION||row.state?.schemaVersion!==row.schema_version)throw new Error('persisted schema mismatch; explicit migration required');if(!Number.isInteger(row.revision)||row.revision<0||row.revision!==row.state?.revision)throw new Error('persisted revision mismatch');return fromPersistedMemberState(row.state)}
async function loadRow(client){requireClient(client);const{data,error}=await client.from('el8_member_state').select('schema_version,revision,state').maybeSingle();if(error)throw error;return data||null}
export async function loadMemberState(client){const row=await loadRow(client);return row?assertPersistedMemberStateRow(row):null}
export async function saveMemberState(client,state,{expectedRevision=state.revision-1}={}){requireClient(client);const nextState=toPersistedMemberState(state);const{data,error}=await client.rpc('save_el8_member_state',{expected_revision:expectedRevision,next_state:nextState});if(error)throw error;return assertPersistedMemberStateRow(data)}
export async function loadOrCreateMemberState(client,{memberId,now=new Date().toISOString()}={}){if(!memberId)throw new Error('memberId required');const existing=await loadMemberState(client);if(existing){if(existing.memberId!==memberId)throw new Error('authenticated member does not match persisted Member State');return existing}return saveMemberState(client,createMemberState({memberId,now}),{expectedRevision:-1})}
