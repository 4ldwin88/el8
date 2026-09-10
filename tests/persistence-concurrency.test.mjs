import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@supabase/supabase-js';
import {requireStagingTestEnvironment} from '../scripts/staging-test-environment.mjs';
import {createMemberState} from '../intelligence/state/member-state-contract.js';
import {loadMemberState,saveMemberState,toPersistedMemberState} from '../intelligence/state/supabase-persistence.js';
import {openMemberStateSession,persistMemberStateSession} from '../app/auth/member-state-session.js';
import {sourceIdentity} from '../scripts/candidate-identity.mjs';
import Discovery from '../intelligence/discovery/discovery-engine.js';
import {discoveryOutputToMemberState} from '../intelligence/state/discovery-member-state-adapter.js';
import {mkdirSync,writeFileSync} from 'node:fs';

// Deliberately outside the offline gate. No original-backend fallback,
// service key, Edge harness or simulated JWT transport is accepted.
const config=requireStagingTestEnvironment();
const before=sourceIdentity();
const client=options=>createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false},...options});
const advance=(state,ref)=>({...structuredClone(state),revision:state.revision+1,historyRefs:[...state.historyRefs,ref]});
const conflict=error=>error.code==='PT409';
const checked=[];
test('authenticated Member State boundary on the approved disposable backend',async t=>{
 const members=[];
 for(const account of config.accounts){
  const supabase=client();
  const {data,error}=await supabase.auth.signInWithPassword(account);
  assert.equal(error,null,'real Auth must issue the session');
  assert.ok(data.session.access_token);
  members.push({supabase,session:data.session,id:data.user.id});
 }
 const [a,b]=members;
 assert.notEqual(a.id,b.id);
 const check=async(name,fn)=>{
  await t.test(name,async()=>{try{await fn();checked.push(name);}catch(error){console.error(name+': '+error.message);throw error;}});
  assert.ok(checked.includes(name),'stop after failed acceptance: '+name);
 };
 await check('fresh authenticated reads do not create Member State',async()=>{
  for(const member of members){
   assert.equal(await loadMemberState(member.supabase),null,'use freshly provisioned synthetic identities for each acceptance run');
   const opened=await openMemberStateSession(member);
   assert.equal(opened.persisted,false);assert.equal(opened.state.revision,0);
   assert.equal(await loadMemberState(member.supabase),null);
  }
 });
 await check('concurrent creation accepts exactly one revision-zero document',async()=>{
  const initial=createMemberState({memberId:a.id,now:'2026-09-10T00:00:00.000Z'});
  const results=await Promise.allSettled(Array.from({length:6},()=>saveMemberState(a.supabase,initial,{expectedRevision:-1})));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  for(const r of results.filter(r=>r.status==='rejected'))assert.equal(r.reason.code,'PT409');
  assert.deepEqual(await loadMemberState(a.supabase),initial);
 });
 await check('actual session first save establishes zero then advances exactly once',async()=>{
  const opened=await openMemberStateSession(b),next=advance(opened.state,'fixture:first-decision');
  assert.deepEqual(await persistMemberStateSession({...b,previousState:opened.state,nextState:next,persisted:false}),next);
  assert.deepEqual((await openMemberStateSession(b)).state,next);
 });
 await check('business conflicts are HTTP 409 rather than server errors',async()=>{
  const saved=await loadMemberState(a.supabase);
  const result=await a.supabase.rpc('save_el8_member_state',{expected_revision:-1,next_state:toPersistedMemberState(saved)});
  assert.equal(result.status,409);assert.equal(result.error?.code,'PT409');
  assert.deepEqual(await loadMemberState(a.supabase),saved);
 });
 await check('two-member SELECT isolation and cross-member RPC rejection',async()=>{
  for(const [owner,other] of [[a,b],[b,a]]){
   const own=await owner.supabase.from('el8_member_state').select('user_id');
   assert.equal(own.error,null);assert.deepEqual(own.data,[{user_id:owner.id}]);
   const cross=await owner.supabase.from('el8_member_state').select('user_id').eq('user_id',other.id);
   assert.equal(cross.error,null);assert.deepEqual(cross.data,[]);
   // Hold the caller's expected revision valid so this isolates ownership,
   // rather than accidentally exercising the earlier stale-revision rejection.
   const foreign={...advance(await loadMemberState(owner.supabase),'fixture:forged'),memberId:other.id};
   await assert.rejects(()=>saveMemberState(owner.supabase,foreign),e=>e.code==='23514');
  }
 });
 await check('direct INSERT UPDATE DELETE UPSERT and anonymous RPC are denied',async()=>{
  const saved=await loadMemberState(a.supabase);
  const row={user_id:a.id,schema_version:'3.0.0',revision:saved.revision,state:toPersistedMemberState(saved)};
  const table=()=>a.supabase.from('el8_member_state');
  for(const op of [()=>table().insert(row),()=>table().update({state:row.state}).eq('user_id',a.id),()=>table().delete().eq('user_id',a.id),()=>table().upsert(row)])assert.equal((await op()).error?.code,'42501');
  const anon=client();
  assert.equal((await anon.rpc('save_el8_member_state',{expected_revision:saved.revision,next_state:toPersistedMemberState(advance(saved,'fixture:anon'))})).error?.code,'42501');
  assert.deepEqual(await loadMemberState(a.supabase),saved);
 });
 await check('malformed and historical envelopes fail without changing accepted state',async()=>{
  const saved=await loadMemberState(a.supabase),good=toPersistedMemberState(advance(saved,'fixture:malformed'));
  const cases=[null,[],{},...['schemaVersion','memberId','revision'].flatMap(key=>{const missing={...good};delete missing[key];return [missing,{...good,[key]:null}];}),{...good,schemaVersion:'1.0.0'},{...good,revision:String(good.revision)},{...good,revision:good.revision+1}];
  const rejected=await Promise.all(cases.map(next_state=>a.supabase.rpc('save_el8_member_state',{expected_revision:saved.revision,next_state})));
  for(const r of rejected)assert.ok(['23514','23502'].includes(r.error?.code),r.error?.message??'unexpected acceptance');
  assert.deepEqual(await loadMemberState(a.supabase),saved);
 });
 await check('competing updates have one winner; stale and duplicate retries never overwrite it',async()=>{
  for(let round=0;round<3;round++){
   const saved=await loadMemberState(a.supabase);
   const candidates=Array.from({length:5},(_,i)=>advance(saved,'fixture:round-'+round+'-candidate-'+i));
   const results=await Promise.allSettled(candidates.map(state=>saveMemberState(a.supabase,state)));
   const winner=results.findIndex(r=>r.status==='fulfilled');
   assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
   for(const r of results.filter(r=>r.status==='rejected'))assert.equal(r.reason.code,'PT409');
   assert.deepEqual(await loadMemberState(a.supabase),candidates[winner]);
   await Promise.all(candidates.map(candidate=>assert.rejects(()=>saveMemberState(a.supabase,candidate),conflict)));
   assert.deepEqual(await loadMemberState(a.supabase),candidates[winner]);
  }
 });
 await check('a lost acknowledgement after real commit is recovered by reload before retry',async()=>{
  const saved=await loadMemberState(a.supabase),next=advance(saved,'fixture:lost-ack');
  let dropped=0;
  const ambiguous=client({global:{headers:{Authorization:'Bearer '+a.session.access_token},fetch:async(...args)=>{
   const response=await fetch(...args);
   if(String(args[0]).includes('/rpc/save_el8_member_state')&&response.ok){await response.arrayBuffer();dropped++;throw new Error('injected lost acknowledgement after server response');}
   return response;
  }}});
  await assert.rejects(()=>saveMemberState(ambiguous,next));assert.equal(dropped,1);
  assert.deepEqual(await loadMemberState(a.supabase),next);
  await assert.rejects(()=>saveMemberState(a.supabase,next),conflict);
  assert.deepEqual(await loadMemberState(a.supabase),next);
 });
 await check('transport failure before dispatch preserves state and reload permits a guarded retry',async()=>{
  const saved=await loadMemberState(a.supabase),next=advance(saved,'fixture:pre-dispatch');
  const disconnected=client({global:{fetch:async()=>{throw new Error('injected pre-dispatch failure');}}});
  await assert.rejects(()=>saveMemberState(disconnected,next));
  assert.deepEqual(await loadMemberState(a.supabase),saved);
  assert.deepEqual(await saveMemberState(a.supabase,next),next);
 });
 await check('actual Discovery source evidence survives +1 persistence and cannot be overwritten through RPC',async()=>{
  const prior=await loadMemberState(a.supabase),discovery=Discovery.session({constructIds:['SLEEP_QUALITY']});
  Discovery.answer(discovery,Discovery.BANK.find(q=>q.id==='Q000020'),'A000129');
  Discovery.answer(discovery,Discovery.BANK.find(q=>q.id==='Q000021'),'A000132');
  const projected=discoveryOutputToMemberState(Discovery.trace(discovery),{memberId:a.id,existingState:prior});
  assert.equal(projected.revision,prior.revision+1);
  assert.equal(Object.keys(projected.facts).length,2);
  assert.deepEqual(await saveMemberState(a.supabase,projected),projected);
  assert.deepEqual(await loadMemberState(a.supabase),projected);
  for(const mutate of [s=>s.facts={},s=>s.facts=null,s=>{Object.values(s.facts)[0].value.answerValue='A000126';}]){
   const tampered=advance(projected,'fixture:rewrite-observation');mutate(tampered);
   const result=await a.supabase.rpc('save_el8_member_state',{expected_revision:projected.revision,next_state:{...tampered,schemaVersion:'3.0.0'}});
   assert.ok(result.error&&['PT409','23514'].includes(result.error.code));
   assert.deepEqual(await loadMemberState(a.supabase),projected);
  }
  const replay=discoveryOutputToMemberState(Discovery.trace(discovery),{memberId:a.id,existingState:await loadMemberState(a.supabase)});
  assert.deepEqual(await saveMemberState(a.supabase,replay),replay);
 });
 await check('new Auth sessions reload both members losslessly',async()=>{
  for(let i=0;i<2;i++){
   const expected=await loadMemberState(members[i].supabase),fresh=client();
   const {data,error}=await fresh.auth.signInWithPassword(config.accounts[i]);assert.equal(error,null);
   const resumed=await openMemberStateSession({supabase:fresh,session:data.session});
   assert.equal(resumed.persisted,true);assert.deepEqual(resumed.state,expected);
  }
 });
 assert.equal(checked.length,12,'no partial acceptance receipt');
 assert.deepEqual(sourceIdentity(),before,'source changed during integration acceptance');
 mkdirSync('.candidate',{recursive:true});
 writeFileSync('.candidate/staging-member-state.json',JSON.stringify({status:'pass',...before,environment:config.url,checked,node:process.version,limits:['synthetic pre-provisioned Auth users; signup/email delivery not tested','transport failure injection; no proxy or server crash injection','not a browser journey or full release receipt']},null,2)+'\n');
});
