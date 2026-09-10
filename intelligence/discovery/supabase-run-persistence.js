import {captureDiscoveryRun} from './run-record.js';
import {assertJsonValue} from '../state/json-representation.js';

// Capture once. Keep this command unchanged until its acknowledgement is known;
// retrying must not capture later answers under the same request identity.
export function prepareDiscoveryRunSave(session,expectedRevision,requestId=crypto.randomUUID()){
 if(!Number.isInteger(expectedRevision)||expectedRevision < -1||expectedRevision>=2147483647)
  throw new Error('Discovery save requires an explicit expected revision');
 const record=captureDiscoveryRun(session);
 return {run_id:record.runId,expected_revision:expectedRevision,request_id:requestId,run_record:record};
}

// The caller supplies its authenticated client. No environment fallback or
// privileged client exists here. SQL owns authorization and accepted revisions.
export function createDiscoveryRunStore(client){
 return {
  async save(command){
   assertJsonValue(command,'Discovery save command');
   const {data,error}=await client.rpc('save_el8_discovery_run',structuredClone(command));
   if(error)throw error;
   if(!data||data.run_id!==command.run_id||data.request_id!==command.request_id||data.revision!==command.expected_revision+1)
    throw new Error('Invalid Discovery acknowledgement; retain the command for reconciliation');
   return structuredClone(data);
  },
  async load(runId){
   // One MVCC read selects the latest complete immutable revision. Reading a
   // head then its revision in separate requests could observe different commits.
   const {data,error}=await client.from('el8_discovery_run_revisions').select('*')
    .eq('run_id',runId).order('revision',{ascending:false}).limit(1).maybeSingle();
   if(error)throw error;
   // Ordinary storage reads never invoke the runtime resume/migration codec.
   return data===null?null:structuredClone(data);
  }
 };
}
