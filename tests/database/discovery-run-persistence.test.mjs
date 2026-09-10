import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import Discovery from '../../intelligence/discovery/discovery-engine.js';
import {restoreDiscoveryRun} from '../../intelligence/discovery/run-record.js';
import * as Runtime from '../../app/onboarding/discovery-runtime.js';
const modulePath=new URL('../../intelligence/discovery/supabase-run-persistence.js',import.meta.url);
const A='11111111-1111-4111-8111-111111111111';
test('answer correction appends through the existing SQL writer and survives reload and retry',async()=>{
 const {prepareDiscoveryRunSave,createDiscoveryRunStore}=await import(modulePath);
 const f=await fixture();try{
  const store=createDiscoveryRunStore(f.client),s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY']});
  Runtime.answerDiscoveryQuestion(s,Discovery.BANK.find(q=>q.id==='Q000020'),'A000129');
  const original=await store.save(prepareDiscoveryRunSave(s,-1));
  const correction={observationId:s.observationLog[0].id,answerId:'A000130',correctionId:crypto.randomUUID(),timestamp:Date.now()+1000};
  Runtime.correctDiscoveryAnswer(s,correction);
  const command=prepareDiscoveryRunSave(s,original.revision);f.loseNextAck();
  await assert.rejects(()=>store.save(command),/acknowledgement lost/);
  const accepted=await store.save(command),loaded=await store.load(s.runId);
  assert.equal(accepted.revision,1);assert.deepEqual(loaded.record,command.run_record);
  const resumed=restoreDiscoveryRun(loaded.record),state=Runtime.discoveryOutput(resumed).trace.states[0];
  Runtime.correctDiscoveryAnswer(resumed,correction);assert.deepEqual(resumed.observationLog,loaded.record.session.observationLog,'JSONB object-key ordering cannot break command retry');
  assert.equal(state.status,'unknown');assert.equal(state.stateEvidence.length,0);assert.equal(state.uncertaintyEvidence.length,1);
  assert.deepEqual(resumed.observationLog[0],original.record.session.observationLog[0]);
  assert.deepEqual((await f.db.query('select record from public.el8_discovery_run_revisions where revision=0')).rows[0].record,original.record);
 }finally{await f.db.close();}
});
// Transport shim only: all acceptance, revision, isolation and persistence behavior
// runs in the real migration SQL. It cannot invent a successful receipt.
async function fixture(){
 const db=new PGlite();
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${A}');create function auth.uid() returns uuid language sql stable as $$select '${A}'::uuid$$;grant usage on schema public,auth to authenticated;`);
 await db.exec(await readFile(new URL('../../supabase/migrations/20260910190000_discovery_run_history.sql',import.meta.url),'utf8'));
 await db.exec('set role authenticated');
 let loseAck=false;
 const client={
  async rpc(name,args){
   assert.equal(name,'save_el8_discovery_run');
   try{
    const {rows}=await db.query('select public.save_el8_discovery_run($1,$2,$3,$4) as receipt',[args.run_id,args.expected_revision,args.request_id,JSON.stringify(args.run_record)]);
    if(loseAck){loseAck=false;throw new Error('acknowledgement lost after commit');}
    return {data:rows[0].receipt,error:null};
   }catch(error){return {data:null,error};}
  },
  from(table){
   assert.equal(table,'el8_discovery_run_revisions');
   let runId;
   const query={
    select(columns){assert.equal(columns,'*');return query;},
    eq(key,id){assert.equal(key,'run_id');runId=id;return query;},
    order(column,opts){assert.equal(column,'revision');assert.deepEqual(opts,{ascending:false});return query;},
    limit(n){assert.equal(n,1);return query;},
    async maybeSingle(){return {data:(await db.query('select to_jsonb(v) as receipt from public.el8_discovery_run_revisions v where run_id=$1 order by revision desc limit 1',[runId])).rows[0]?.receipt??null,error:null};}
   };
   return query;
  }
 };
 return {db,client,loseNextAck(){loseAck=true;}};
}
test('run adapter retains a retryable command after ambiguous acknowledgement and resumes the exact accepted record',async()=>{
 const {prepareDiscoveryRunSave,createDiscoveryRunStore}=await import(modulePath);
 const f=await fixture();try{
  const store=createDiscoveryRunStore(f.client),session=Discovery.session({constructIds:['SLEEP_QUALITY']});
  Discovery.answer(session,Discovery.BANK.find(q=>q.id==='Q000020'),'A000129');
  const command=prepareDiscoveryRunSave(session,-1);
  assert.equal(await store.load(session.runId),null);
  f.loseNextAck();await assert.rejects(()=>store.save(command),/acknowledgement lost/);
  session.unresolvedRequirements.push({requirementId:'later',reason:'not in the accepted snapshot'});
  const accepted=await store.save(command);assert.equal(accepted.revision,0);
  assert.deepEqual(accepted.record,command.run_record);
  assert.equal((await f.db.query('select count(*)::int as n from public.el8_discovery_run_revisions')).rows[0].n,1);
  const loaded=await store.load(session.runId);assert.deepEqual(loaded,accepted);
  assert.deepEqual(restoreDiscoveryRun(loaded.record).observationLog,session.observationLog);
  assert.equal(restoreDiscoveryRun(loaded.record).unresolvedRequirements.length,0);
  const next=prepareDiscoveryRunSave(session,loaded.revision);assert.notEqual(next.request_id,command.request_id);
  assert.equal((await store.save(next)).revision,1);
  await assert.rejects(()=>store.save(prepareDiscoveryRunSave(session,0)),/revision conflict/);
 }finally{await f.db.close();}
});
test('ordinary run reads preserve historical fingerprints and never perform semantic resume',async()=>{
 const {prepareDiscoveryRunSave,createDiscoveryRunStore}=await import(modulePath);
 const f=await fixture();try{
  const store=createDiscoveryRunStore(f.client),command=prepareDiscoveryRunSave(Discovery.session(),-1);
  command.run_record.contractFingerprint='0'.repeat(64);
  const accepted=await store.save(command),loaded=await store.load(command.run_id);
  assert.deepEqual(loaded,accepted);
  assert.throws(()=>restoreDiscoveryRun(loaded.record),/contract changed/);
  assert.deepEqual(await store.load(command.run_id),accepted,'failed explicit resume cannot rewrite stored history');
 }finally{await f.db.close();}
});

test('standard UUID casing does not turn an accepted run or retry into a failed acknowledgement',async()=>{
 const {prepareDiscoveryRunSave,createDiscoveryRunStore}=await import(modulePath);
 const f=await fixture();try{
  const store=createDiscoveryRunStore(f.client);
  for(const [runId,requestId] of [
   ['AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'],
   ['cccccccc-cccc-4ccc-8ccc-cccccccccccc','DDDDDDDD-DDDD-4DDD-8DDD-DDDDDDDDDDDD'],
   ['EeEeEeEe-EeEe-4eEe-8eEe-EeEeEeEeEeEe','FfFfFfFf-FfFf-4fFf-8fFf-FfFfFfFfFfFf']
  ]){
   const session=Discovery.session({runId});
   const command=prepareDiscoveryRunSave(session,-1,requestId),before=structuredClone(command);
   const accepted=await store.save(command);
   assert.equal(accepted.run_id,runId.toLowerCase());assert.equal(accepted.request_id,requestId.toLowerCase());
   assert.equal(accepted.revision,0);assert.deepEqual(accepted.record,command.run_record);
   assert.deepEqual(await store.save(command),accepted);
   assert.deepEqual(await store.load(runId),accepted);
   assert.deepEqual(command,before,'acknowledgement must not normalize the submitted source or command');
  }
  assert.equal((await f.db.query('select count(*)::int as n from public.el8_discovery_run_revisions')).rows[0].n,3);
 }finally{await f.db.close();}
});

test('UUID case equivalence cannot accept wrong identifiers or loosen revision checks',async()=>{
 const {prepareDiscoveryRunSave,createDiscoveryRunStore}=await import(modulePath);
 const f=await fixture();try{
  const command=prepareDiscoveryRunSave(Discovery.session(),-1);
  const accepted=await createDiscoveryRunStore(f.client).save(command);
  for(const patch of [
   {run_id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'},
   {request_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'},
   ...['run_id','request_id'].flatMap(key=>[null,42,{},[],true,'not-a-uuid'].map(value=>({[key]:value}))),
   {revision:1},{revision:-1},{revision:'0'},{revision:null}
  ]){
   const corrupt={async rpc(name,args){const result=await f.client.rpc(name,args);assert.equal(result.error,null);return {...result,data:{...result.data,...patch}};}};
   await assert.rejects(()=>createDiscoveryRunStore(corrupt).save(command),/Invalid Discovery acknowledgement/);
  }
  assert.deepEqual(await createDiscoveryRunStore(f.client).load(command.run_id),accepted);
  assert.equal((await f.db.query('select count(*)::int as n from public.el8_discovery_run_revisions')).rows[0].n,1);
 }finally{await f.db.close();}
});
