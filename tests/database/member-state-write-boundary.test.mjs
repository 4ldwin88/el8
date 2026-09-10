import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import test from 'node:test';
import {PGlite} from '@electric-sql/pglite';
import {createMemberState} from '../../intelligence/state/member-state-contract.js';
import {loadMemberState, saveMemberState} from '../../intelligence/state/supabase-persistence.js';

const migration = readFileSync(new URL('../../supabase/migrations/20260910110208_member_state_write_boundary.sql', import.meta.url), 'utf8');
const A = '00000000-0000-4000-8000-000000000001';
const B = '00000000-0000-4000-8000-000000000002';
const quoted = value => '"' + value.replaceAll('"', '""') + '"';
const envelope = (memberId = A, revision = 0) => ({schemaVersion: '3.0.0', memberId, revision});

// All baseline application DDL comes from the pinned public repository. The
// auth stub supplies identity only; actual PostgreSQL enforces RLS and grants.
// This is a scoped boundary harness, not certification of full migration replay.
async function restorePreBoundary(db) {
  await db.exec(`
    create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('${A}'), ('${B}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
  `);
  const dir = new URL('../../supabase/migrations/', import.meta.url);
  for (const name of readdirSync(dir).filter(name => /member_state_v[13].*\.sql$/.test(name)).sort()) {
    await db.exec(readFileSync(new URL(name, dir), 'utf8'));
  }
  // The repository's v1 CHECK is never retired by its v3 migration subset.
  // Explicit EMPTY test setup only: establish the v3 precondition without
  // claiming to repair production migration history or interpreting old data.
  assert.equal((await db.query('select count(*)::int n from public.el8_member_state')).rows[0].n, 0);
  await db.exec(`
    alter table public.el8_member_state drop constraint el8_member_state_schema_v1;
    grant select, insert, update on public.el8_member_state to authenticated;
    grant all on public.el8_member_state to service_role;
  `);
}

async function asMember(db, memberId, fn, role = 'authenticated') {
  return db.transaction(async tx => {
    await tx.exec(`set local role ${quoted(role)};`);
    // Authentication is supplied by the test; JWT verification is not simulated.
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [memberId ?? '']);
    return fn(tx);
  });
}
const save = (tx, expected, state) => tx.query(
  'select * from public.save_el8_member_state($1::integer, $2::jsonb)', [expected, JSON.stringify(state)]
);
const directInsert = (tx, state = envelope()) => tx.query(
  'insert into public.el8_member_state(user_id, revision, schema_version, state) values ($1,0,\'3.0.0\',$2)', [A, state]
);
const code = expected => error => { assert.equal(error.code, expected, error.message); return true; };

test('Member State storage boundary executes in PostgreSQL', async t => {
  const db = new PGlite();
  try {
    t.diagnostic((await db.query('select version()')).rows[0].version);
    await restorePreBoundary(db);

    await t.test('pre-change evidence: direct writes bypass the RPC and strings are coerced', async () => {
      await asMember(db, A, tx => directInsert(tx));
      await asMember(db, A, tx => tx.exec("update public.el8_member_state set revision=revision+1, state=jsonb_set(state,'{revision}',to_jsonb(revision+1));"));
      const r = await asMember(db, A, tx => save(tx, 1, {...envelope(A, 2), revision: '2'}));
      assert.equal(r.rows[0].revision, 2);
      await db.exec('delete from public.el8_member_state;');
      // A PostgreSQL CHECK returning NULL accepts this malformed privileged row.
      await directInsert(db, {});
      assert.equal((await db.query('select count(*)::int n from public.el8_member_state')).rows[0].n, 1);
      await db.exec('delete from public.el8_member_state;');
    });

    await t.test('invalid historical envelope blocks migration and rolls back every change', async () => {
      await directInsert(db, {});
      await assert.rejects(db.exec(migration), code('23514'));
      await db.exec('rollback;');
      assert.equal((await db.query("select to_regnamespace('el8_member_state_private') is null missing")).rows[0].missing, true);
      assert.equal((await db.query("select has_table_privilege('authenticated','public.el8_member_state','UPDATE') allowed")).rows[0].allowed, true);
      assert.deepEqual((await db.query('select state from public.el8_member_state')).rows[0].state, {});
      await db.exec('delete from public.el8_member_state;');
    });

    await t.test('migration preserves valid data and removes old overload and column-write grants', async () => {
      await directInsert(db, {...envelope(), provenance: {source: 'synthetic fixture'}});
      const before = (await db.query('select * from public.el8_member_state')).rows;
      await db.exec(`
        grant update(state), insert(state) on public.el8_member_state to authenticated;
      `);
      await db.exec(migration);
      assert.deepEqual((await db.query('select * from public.el8_member_state')).rows, before);
      assert.equal((await db.query("select to_regprocedure('public.save_el8_member_state(bigint,jsonb)') is null retired")).rows[0].retired, true);
      assert.equal((await db.query("select has_column_privilege('authenticated','public.el8_member_state','state','UPDATE') allowed")).rows[0].allowed, false);
      await db.exec('delete from public.el8_member_state;');
    });

    await t.test('valid create/update preserves the complete payload; stale and duplicate writes fail', async () => {
      const original = {...envelope(), evidence: {unknown: null, source: 'fixture'}, untouched: [1, 'x']};
      const first = await asMember(db, A, tx => save(tx, -1, original));
      assert.deepEqual(first.rows[0].state, original);
      await assert.rejects(asMember(db, A, tx => save(tx, -1, original)), code('40001'));
      const next = {...original, revision: 1, newEvidence: {confidence: 'unknown'}};
      await asMember(db, A, tx => save(tx, 0, next));
      await assert.rejects(asMember(db, A, tx => save(tx, 0, {...next, overwritten: true})), code('40001'));
      assert.deepEqual((await db.query('select state from public.el8_member_state where user_id=$1', [A])).rows[0].state, next);
    });

    await t.test('two-member CRUD isolation and anonymous denial hold at the database', async () => {
      await asMember(db, B, tx => save(tx, -1, envelope(B)));
      await asMember(db, B, tx => save(tx, 0, envelope(B, 1)));
      // Both rows now have the same revision: an omitted owner predicate must
      // fail this test even when the caller submits a valid own-member payload.
      await asMember(db, A, tx => save(tx, 1, envelope(A, 2)));
      assert.deepEqual((await asMember(db, A, tx => tx.query('select user_id from public.el8_member_state'))).rows, [{user_id: A}]);
      await assert.rejects(asMember(db, A, tx => save(tx, 0, envelope(B, 1))), code('42501'));
      for (const sql of [
        `insert into public.el8_member_state(user_id,state) values ('${B}','{}')`,
        `update public.el8_member_state set state='{}' where user_id='${B}'`,
        `delete from public.el8_member_state where user_id='${B}'`,
      ]) await assert.rejects(asMember(db, A, tx => tx.exec(sql)), code('42501'));
      await assert.rejects(asMember(db, null, tx => tx.query('select * from public.el8_member_state'), 'anon'), code('42501'));
      await assert.rejects(asMember(db, A, tx => save(tx, 1, envelope(A, 2)), 'anon'), code('42501'));
      await assert.rejects(asMember(db, null, tx => save(tx, 1, envelope(A, 2))), code('42501'));
      assert.deepEqual((await db.query('select state from public.el8_member_state where user_id=$1', [B])).rows[0].state, envelope(B, 1));
    });

    await t.test('ordinary own-row DML/upsert cannot bypass compare-and-swap', async () => {
      for (const sql of [
        `insert into public.el8_member_state(user_id,revision,schema_version,state) values ('${A}',0,'3.0.0','${JSON.stringify(envelope())}') on conflict(user_id) do update set state=excluded.state`,
        'update public.el8_member_state set revision=revision+1, state=jsonb_set(state,\'{revision}\',to_jsonb(revision+1))',
        'delete from public.el8_member_state',
        'truncate public.el8_member_state',
      ]) await assert.rejects(asMember(db, A, tx => tx.exec(sql)), code('42501'));
      // Restoring a table grant alone must not restore the retired write policies.
      await db.exec('grant insert, update on public.el8_member_state to authenticated;');
      try {
        await assert.rejects(asMember(db, A, tx => directInsert(tx)), code('42501'));
        const denied = await asMember(db, A, tx => tx.query('update public.el8_member_state set revision=revision+1 returning user_id'));
        assert.equal(denied.rows.length, 0);
      } finally { await db.exec('revoke insert, update on public.el8_member_state from authenticated;'); }
    });

    await t.test('missing/null/wrong-type envelope fields and expected revisions fail closed', async () => {
      const valid = envelope(A, 2);
      const malformed = [null, [], {}, 'text', 42];
      for (const key of ['schemaVersion', 'memberId', 'revision']) {
        const missing = {...valid}; delete missing[key]; malformed.push(missing);
        malformed.push({...valid, [key]: null});
      }
      malformed.push({...valid, schemaVersion: '1.0.0'}, {...valid, revision: '2'}, {...valid, revision: 2.1}, {...valid, revision: -1}, {...valid, revision: 2147483648});
      const before = (await db.query('select * from public.el8_member_state order by user_id')).rows;
      for (const value of malformed) {
        await assert.rejects(asMember(db, A, tx => save(tx, 1, value)), error => ['22023','42501'].includes(error.code));
      }
      for (const expected of [null, -2, 2147483647]) {
        await assert.rejects(asMember(db, A, tx => save(tx, expected, valid)), code('22023'));
      }
      await assert.rejects(asMember(db, A, tx => tx.query('select public.save_el8_member_state(1, NULL)')), code('22023'));
      // Create validation is equally strict and cannot smuggle a nonzero revision.
      await assert.rejects(asMember(db, A, tx => save(tx, -1, envelope(A, 1))), code('22023'));
      assert.deepEqual((await db.query('select * from public.el8_member_state order by user_id')).rows, before);
    });

    await t.test('the table rejects malformed envelopes even under privileged access', async () => {
      for (const bad of [{}, null, [], {...envelope(), revision:'0'}, {...envelope(), memberId:B}]) {
        await db.exec('delete from public.el8_member_state where user_id=\'' + A + '\';');
        await assert.rejects(directInsert(db, bad), error => ['23514','23502'].includes(error.code));
      }
    });

    await t.test('the unchanged production adapter round-trips through real SQL', async () => {
      // This transport adapter binds Supabase-shaped operations to PostgreSQL.
      // It does not emulate persistence, RLS, conflicts, constraints or RPC logic.
      const client = {
        from(name) {
          assert.equal(name, 'el8_member_state');
          return {select(columns) {
            assert.equal(columns, 'schema_version,revision,state');
            return {async maybeSingle() {
              const data = await asMember(db, A, tx => tx.query('select schema_version,revision,state from public.el8_member_state'));
              return {data:data.rows[0] ?? null, error:null};
            }};
          }};
        },
        async rpc(name, args) {
          assert.equal(name, 'save_el8_member_state');
          try {
            const result = await asMember(db, A, tx => save(tx, args.expected_revision, args.next_state));
            return {data:result.rows[0], error:null};
          } catch (error) { return {data:null, error}; }
        },
      };
      const state = createMemberState({memberId:A, now:'2026-09-10T00:00:00.000Z'});
      assert.deepEqual(await saveMemberState(client, state, {expectedRevision:-1}), state);
      assert.deepEqual(await loadMemberState(client), state);
      const next = {...state, revision:1};
      assert.deepEqual(await saveMemberState(client, next, {expectedRevision:0}), next);
      await assert.rejects(saveMemberState(client, next, {expectedRevision:0}), code('40001'));
    });

    await t.test('only one write implementation remains and its namespace is locked', async () => {
      const funcs = (await db.query(`select n.nspname, p.proname, p.prosecdef, p.proconfig
        from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where p.proname in ('save_el8_member_state','save_member_state') order by n.nspname`)).rows;
      assert.equal(funcs.length, 2);
      assert.equal(funcs[0].prosecdef, true);
      assert.equal(funcs[1].prosecdef, false);
      assert.ok(funcs.every(f => f.proconfig.some(v => v.startsWith('search_path='))));
      const writers = (await db.query(`select n.nspname, p.proname
        from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname not in ('pg_catalog','information_schema')
          and p.prosrc ~* '(insert\\s+into|update|delete\\s+from)\\s+public\\.el8_member_state'`)).rows;
      assert.deepEqual(writers, [{nspname:'el8_member_state_private', proname:'save_member_state'}]);
      await assert.rejects(asMember(db, A, tx => tx.exec('create table el8_member_state_private.attack(id int)')), code('42501'));
      await assert.rejects(asMember(db, A, tx => tx.query('select el8_member_state_private.save_member_state($1,$2)', [1,envelope(B,2)])), code('42501'));
    });
  } finally { await db.close(); }
});

test('migration applies to an empty v3 precondition without fabricating state', async () => {
  const db = new PGlite();
  try {
    await restorePreBoundary(db);
    await db.exec(migration);
    assert.equal((await db.query('select count(*)::int n from public.el8_member_state')).rows[0].n, 0);
    assert.equal((await asMember(db, A, tx => save(tx, -1, envelope()))).rows[0].revision, 0);
  } finally { await db.close(); }
});
