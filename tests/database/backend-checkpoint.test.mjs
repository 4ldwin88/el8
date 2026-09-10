import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {pgcrypto} from '@electric-sql/pglite/contrib/pgcrypto';
import {canonicalCatalog as canonical,catalogHashes} from '../../scripts/backend-catalog.mjs';

const root=new URL('../../',import.meta.url);
const file=path=>readFile(new URL(path,root),'utf8');
const hash=value=>createHash('sha256').update(value).digest('hex');
const baselinePath='supabase/baselines/observed-public-20260910.sql';
const catalogPath='supabase/baselines/inspect-public.sql';
const manifestPath='supabase/baselines/observed-public-20260910.json';
async function platformFixture(){
 const db=new PGlite({extensions:{pgcrypto}});
 // Platform-only fixture. This is SQL/schema acceptance, not JWT or Auth evidence.
 await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
 create schema extensions; create extension pgcrypto with schema extensions;
 create schema auth; create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb,raw_app_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function auth.role() returns text language sql stable as $$select nullif(current_setting('request.jwt.claim.role',true),'')$$;
 grant usage on schema auth,public to anon,authenticated,service_role;`);
 return db;
}
test('observed checkpoint replays with source-attributed catalog and existing forward writer',async()=>{
 const [sql,query,manifestText]=await Promise.all([file(baselinePath),file(catalogPath),file(manifestPath)]);
 const manifest=JSON.parse(manifestText);
 assert.equal(hash(sql),manifest.sqlSha256);
 assert.equal(hash(query),manifest.inspectionSha256);
 const db=await platformFixture();
 try{
  assert.match((await db.query('show server_version')).rows[0].server_version,/^17\./);
  await assert.rejects(()=>db.exec(sql),/disposable bootstrap authorization/);
  await db.exec('rollback');
  await db.exec("set el8.bootstrap_disposable='yes'");
  await db.exec(sql);
  const observed=(await db.query(query)).rows[0].catalog;
  for(const [section,expected] of Object.entries(manifest.catalogHashes))
   assert.equal(hash(JSON.stringify(canonical(observed[section]))),expected,`captured catalog drift: ${section}`);
  // Mutate the actual catalog, not a mock: each protected surface must change
  // its independently captured fingerprint. Roll back before writer rehearsal.
  for(const [section,mutation] of [
   ['policies',`create policy unexpected_read on public.el8_member_state for select to authenticated using (true)`],
   ['tables',`revoke select on public.el8_member_state from authenticated`],
   ['functions',`alter function public.save_el8_member_state(integer,jsonb) security definer`],
   ['constraints',`alter table public.el8_member_state drop constraint el8_member_state_pkey cascade`],
   ['triggers',`alter table public.el8_member_state disable trigger user`],
  ]){
   await db.exec('begin');await db.exec(mutation);
   const changed=(await db.query(query)).rows[0].catalog;
   assert.notEqual(hash(JSON.stringify(canonical(changed[section]))),manifest.catalogHashes[section],`undetected ${section} drift`);
   await db.exec('rollback');
  }
  await assert.rejects(()=>db.exec(sql),/requires an empty public schema/);
  await db.exec('rollback');
  const staging=JSON.parse(await file('supabase/environments/staging-replay.json'));
  for(const input of staging.inputs)assert.equal(hash(await file(input.path)),input.sha256,'staging replay input changed: '+input.path);
  assert.equal(staging.inputs[0].path,baselinePath);
  for(const input of staging.inputs.slice(1))await db.exec(await file(input.path));
  assert.deepEqual(catalogHashes((await db.query(query)).rows[0].catalog),staging.catalogHashes,'repository replay must match the actual independently captured staging catalog');
  assert.equal((await db.query("select count(*)::int as n from pg_proc where pronamespace='public'::regnamespace and proname='save_el8_member_state'")).rows[0].n,1);
  for(const role of ['anon','authenticated'])assert.equal((await db.query("select has_table_privilege($1,'public.el8_member_state','INSERT,UPDATE,DELETE') as allowed",[role])).rows[0].allowed,false);
 }finally{await db.close();}
});

test('every repository migration retains its explicitly recorded provenance',async()=>{
 const provenance=JSON.parse(await file('supabase/baselines/migration-provenance.json'));
 const names=(await readdir(new URL('supabase/migrations/',root))).filter(n=>n.endsWith('.sql')).sort();
 assert.deepEqual(names,provenance.repositoryFiles.map(f=>f.path),'new migrations must declare candidate/applied provenance');
 const replay=JSON.parse(await file('supabase/environments/staging-replay.json'));
 assert.deepEqual(replay.inputs.slice(1).map(x=>x.path),provenance.repositoryFiles.filter(x=>x.status==='unapplied-candidate').map(x=>'supabase/migrations/'+x.path),'every supported forward migration must participate in replay');
 assert.equal(new Set(provenance.records.map(r=>r.version)).size,provenance.records.length);
 for(const entry of provenance.repositoryFiles){
  assert.equal(hash(await file('supabase/migrations/'+entry.path)),entry.sha256,`migration changed without provenance review: ${entry.path}`);
  assert.ok(['historical-repository-artifact','unapplied-candidate'].includes(entry.status));
 }
});
