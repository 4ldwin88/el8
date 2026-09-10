import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import Discovery from '../../intelligence/discovery/discovery-engine.js';
import {captureDiscoveryRun} from '../../intelligence/discovery/run-record.js';
const migration=new URL('../../supabase/migrations/20260910190000_discovery_run_history.sql',import.meta.url);
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
const RUN='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const R0='00000000-0000-4000-8000-000000000000',R1='00000000-0000-4000-8000-000000000001',R2='00000000-0000-4000-8000-000000000002';
async function database(){
 const db=new PGlite();assert.match((await db.query('show server_version')).rows[0].server_version,/^17\./);
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;
 create schema auth;create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated,service_role;
 insert into auth.users values ('${A}'),('${B}');`);
 let sql;try{sql=await readFile(migration,'utf8')}catch(e){if(e.code!=='ENOENT')throw e;}
 if(sql)await db.exec(sql);return db;
}
async function as(db,user,operation,role='authenticated'){
 await db.query("select set_config('request.jwt.claim.sub',$1,false)",[user??'']);await db.exec(`set role ${role}`);
 try{return await operation();}finally{await db.exec('reset role');}
}
const save=(db,user,record,expected,request)=>as(db,user,async()=>(await db.query('select public.save_el8_discovery_run($1::uuid,$2::integer,$3::uuid,$4::jsonb) as result',[record.runId,expected,request,JSON.stringify(record)])).rows[0].result);
function session(){const s=Discovery.session({runId:RUN,constructIds:['SLEEP_QUALITY'],unresolvedRequirements:[{requirementId:'required:1',reason:'Evidence still required'}]});Discovery.answer(s,Discovery.BANK.find(q=>q.id==='Q000020'),'A000129');return s;}
const record=()=>captureDiscoveryRun(session());
test('owned run revisions preserve partial evidence, stable retries and real reload',async()=>{
 const db=await database();try{
  const initial=record(),created=await save(db,A,initial,-1,R0);assert.equal(created.revision,0);assert.deepEqual(created.record,initial);
  assert.deepEqual(await save(db,A,initial,-1,R0),created);
  const next=structuredClone(initial);next.session.unresolvedRequirements=[];
  const accepted=await save(db,A,next,0,R1);assert.equal(accepted.revision,1);
  await assert.rejects(()=>save(db,A,next,0,R2),/revision conflict/i);
  await assert.rejects(()=>save(db,A,next,-1,R0),/request.*conflict/i);
  assert.deepEqual(await save(db,A,initial,-1,R0),created,'old identical retry acknowledges its original immutable revision');
  const rows=await as(db,A,async()=>(await db.query('select revision,record from public.el8_discovery_run_revisions order by revision')).rows);
  assert.deepEqual(rows.map(r=>r.revision),[0,1]);assert.deepEqual(rows[0].record,initial);assert.deepEqual(rows[1].record,next);
 }finally{await db.close();}
});
test('two-member isolation, unauthenticated access and direct writes are enforced by SQL',async()=>{
 const db=await database();try{
  await save(db,A,record(),-1,R0);
  assert.equal((await as(db,B,async()=>(await db.query('select * from public.el8_discovery_run_revisions')).rows)).length,0);
  await assert.rejects(()=>save(db,B,record(),0,R1),/ownership|authorized/i);
  await assert.rejects(()=>save(db,null,record(),0,R1),/authentication|authorized/i);
  for(const table of ['el8_discovery_runs','el8_discovery_run_revisions'])for(const sql of [`delete from public.${table}`,`update public.${table} set user_id='${B}'`,`truncate public.${table}`])await assert.rejects(()=>as(db,A,()=>db.exec(sql)),/permission denied/i);
  assert.equal((await as(db,A,async()=>(await db.query('select * from public.el8_discovery_run_revisions')).rows)).length,1);
 }finally{await db.close();}
});
test('malformed records and accepted observation rewrites fail without altering history',async()=>{
 const db=await database();try{
  const initial=record();await save(db,A,initial,-1,R0);
  for(const mutate of [r=>{r.format='historical';},r=>{r.session.runId=B;},r=>{r.session.observationLog=[];},r=>{r.session.observationLog[0].answerValue='changed';},r=>{r.contractFingerprint=null;}]){
   const invalid=structuredClone(initial);mutate(invalid);await assert.rejects(()=>save(db,A,invalid,0,R1),/record|observation|contract|identity/i);
  }
  assert.equal((await db.query('select count(*)::int as n from public.el8_discovery_run_revisions')).rows[0].n,1);
  assert.equal((await db.query('select revision from public.el8_discovery_runs')).rows[0].revision,0);
 }finally{await db.close();}
});

test('failure after each persistence boundary rolls back head and history together',async()=>{
 const db=await database();try{
  const initial=record();
  await db.exec(`create function public.inject_run_failure() returns trigger language plpgsql as $$begin raise exception 'injected persistence failure';end$$;`);
  for(const [table,event] of [['el8_discovery_runs','insert'],['el8_discovery_run_revisions','insert'],['el8_discovery_runs','update']]){
   await db.exec(`create trigger injected_failure after ${event} on public.${table} for each row execute function public.inject_run_failure()`);
   await assert.rejects(()=>save(db,A,initial,-1,R0),/injected persistence failure/);
   for(const name of ['el8_discovery_runs','el8_discovery_run_revisions'])assert.equal((await db.query(`select count(*)::int as n from public.${name}`)).rows[0].n,0,`${event} failure must not leave ${name}`);
   await db.exec(`drop trigger injected_failure on public.${table}`);
  }
  const created=await save(db,A,initial,-1,R0);
  for(const [table,event] of [['el8_discovery_run_revisions','insert'],['el8_discovery_runs','update']]){
   await db.exec(`create trigger injected_failure after ${event} on public.${table} for each row execute function public.inject_run_failure()`);
   await assert.rejects(()=>save(db,A,initial,0,R1),/injected persistence failure/);
   assert.equal((await db.query('select revision from public.el8_discovery_runs')).rows[0].revision,0);
   assert.deepEqual((await db.query('select to_jsonb(v) as receipt from public.el8_discovery_run_revisions v')).rows[0].receipt,created);
   await db.exec(`drop trigger injected_failure on public.${table}`);
  }
  assert.equal((await save(db,A,initial,0,R1)).revision,1,'same command succeeds after the failure is removed');
 }finally{await db.close();}
});

test('migration rejects unexpected objects and inherited write grants transactionally',async()=>{
 const sql=await readFile(migration,'utf8');
 for(const baseline of [
  'create view public.el8_discovery_runs as select 1 as unexpected',
  'create function public.save_el8_discovery_run(text) returns text language sql as $$select $1$$',
  'create role unexpected_writer;grant unexpected_writer to authenticated;alter default privileges for role postgres in schema public grant insert on tables to unexpected_writer',
 ]){
  const db=new PGlite();try{
   await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select null::uuid$$;${baseline};`);
   await assert.rejects(()=>db.exec(sql),/unexpected Discovery run baseline|unexpected inherited Discovery/);
   await db.exec('rollback');
   assert.equal((await db.query("select count(*)::int as n from pg_class where relnamespace='public'::regnamespace and relname='el8_discovery_run_revisions'")).rows[0].n,0,'failed DDL leaves no partial history table');
  }finally{await db.close();}
 }
});

test('direct insert/upsert and anonymous RPC cannot bypass the single writer',async()=>{
 const db=await database();try{
  await save(db,A,record(),-1,R0);
  for(const suffix of ['', ' on conflict(run_id) do update set revision=99'])await assert.rejects(()=>as(db,A,()=>db.exec(`insert into public.el8_discovery_runs(run_id,user_id,revision) values('${RUN}','${A}',99)${suffix}`)),/permission denied/);
  await assert.rejects(()=>as(db,A,()=>db.query('insert into public.el8_discovery_run_revisions(run_id,user_id,revision,request_id,record) values($1,$2,99,$3,$4)',[RUN,A,R1,JSON.stringify(record())])),/permission denied/);
  await assert.rejects(()=>as(db,null,()=>db.query('select public.save_el8_discovery_run($1,-1,$2,$3)',[RUN,R0,JSON.stringify(record())]),'anon'),/permission denied/);
  for(const table of ['el8_discovery_runs','el8_discovery_run_revisions'])await assert.rejects(()=>as(db,null,()=>db.exec(`select * from public.${table}`),'anon'),/permission denied/);
 }finally{await db.close();}
});
