import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {createMemberState} from '../../intelligence/state/member-state-contract.js';
import {saveMemberState, loadMemberState} from '../../intelligence/state/supabase-persistence.js';

const migrations = new URL('../../supabase/migrations/', import.meta.url);
const forwardName = '20260910102819_member_state_single_writer.sql';
const forward = await readFile(new URL(forwardName, migrations), 'utf8');
const migrationNames = (await readdir(migrations)).filter(name => name.endsWith('.sql')).sort();
const prior = migrationNames.filter(name => name.includes('member_state') && name < forwardName);
// Apply later migrations that mention this boundary, regardless of filename.
// Missing dependencies must fail CI and require deliberate fixture expansion;
// never silently skip a future change to the protected database surface.
const later = [];
for (const name of migrationNames.filter(name => name > forwardName)) {
  const sql = await readFile(new URL(name, migrations), 'utf8');
  if (/\b(?:el8_member_state|save_el8_member_state|el8_guard_member_state_revision)\b/i.test(sql))
    later.push(sql);
}
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const envelope = (id, revision, extra = {}) =>
  ({schemaVersion: '3.0.0', memberId: id, revision, ...extra});

async function checkpoint(kind = 'live') {
  const db = new PGlite();
  // Only the auth transport is simulated. PostgreSQL executes all grants, RLS,
  // constraints, triggers and the actual repository RPC/migration bodies.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth, public to anon, authenticated, service_role;
    grant execute on function auth.uid() to anon, authenticated, service_role;
    insert into auth.users values ('${A}'), ('${B}');
  `);
  if (kind === 'live') {
    await db.exec(await readFile(new URL('./member-state-live-shape.sql', import.meta.url), 'utf8'));
  }
  for (const name of prior) {
    if (kind === 'live' && name === '20260827193000_add_member_state_v1.sql') continue;
    await db.exec(await readFile(new URL(name, migrations), 'utf8'));
  }
  if (kind === 'replay') {
    // Supabase default table ACLs are platform setup, not in the old migrations.
    await db.exec('grant all on public.el8_member_state to anon, authenticated, service_role');
  }
  return db;
}

async function asRole(db, role, id, operation) {
  assert.ok(['anon', 'authenticated', 'service_role'].includes(role));
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? '']);
  await db.exec(`set role ${role}`);
  try { return await operation(); }
  finally { await db.exec('reset role'); }
}
async function rpc(db, expected, state) {
  const result = await db.query(
    'select * from public.save_el8_member_state($1::integer, $2::jsonb)',
    [expected, state === null ? null : JSON.stringify(state)]);
  return result.rows[0];
}
const memberSave = (db, id, expected, state) =>
  asRole(db, 'authenticated', id, () => rpc(db, expected, state));
const rows = async db => (await db.query('select * from public.el8_member_state order by user_id')).rows;
async function rejectedWithoutMutation(db, operation, codes) {
  const before = await rows(db);
  await assert.rejects(operation, error => codes.includes(error.code));
  assert.deepEqual(await rows(db), before);
}

test('old live-shaped boundary reproduces bypass and missing-envelope acceptance', async () => {
  const db = await checkpoint();
  try {
    await memberSave(db, A, -1, envelope(A, 0));
    // A stale document can advance by reading only the current counter: the
    // direct table writer never supplies the revision the document was based on.
    await asRole(db, 'authenticated', A, () => db.query(`
      update public.el8_member_state set revision = revision + 1,
        state = jsonb_set($1::jsonb, '{revision}', to_jsonb(revision + 1))
      where user_id = $2 returning revision`,
    [JSON.stringify(envelope(A, 0, {staleDocument: true})), A]));
    assert.equal((await rows(db))[0].state.staleDocument, true);
    // RLS WITH CHECK rejects NULL for ordinary users, but CHECK constraints
    // accept NULL for privileged writers. These are distinct observed defects.
    await asRole(db, 'service_role', A, () => db.query(`
      update public.el8_member_state set revision = revision + 1,
        state = state - 'schemaVersion' || jsonb_build_object('revision', revision + 1)
      where user_id = $1`, [A]));
    assert.equal((await rows(db))[0].state.schemaVersion, undefined);
  } finally { await db.close(); }
});

for (const kind of ['live', 'replay']) {
  test(`single writer acceptance on ${kind} checkpoint`, async t => {
    const db = await checkpoint(kind);
    try {
      // Independent column grants must not survive table-level revocation.
      await db.exec('grant update(state,revision) on public.el8_member_state to authenticated');
      await db.exec(forward);
      for (const sql of later) await db.exec(sql);
      await t.test('one RPC signature, no client DML policies or privileges', async () => {
        const functions = (await db.query(`select oid::regprocedure::text as signature
          from pg_proc where pronamespace = 'public'::regnamespace
          and proname = 'save_el8_member_state'`)).rows;
        assert.equal(functions.length, 1);
        assert.match(functions[0].signature, /\(integer,jsonb\)$/);
        assert.equal((await db.query(`select count(*)::int as n from pg_policy
          where polrelid='public.el8_member_state'::regclass and polcmd <> 'r'`)).rows[0].n, 0);
        for (const role of ['anon', 'authenticated']) {
          const privileges = (await db.query(`select
            has_table_privilege($1,'public.el8_member_state','INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER') as table_write,
            has_any_column_privilege($1,'public.el8_member_state','INSERT,UPDATE') as column_write`, [role])).rows[0];
          assert.deepEqual(privileges, {table_write: false, column_write: false});
        }
      });
      await t.test('create, exact increment, stale request and duplicate retry', async () => {
        const initial = await memberSave(db, A, -1, envelope(A, 0, {evidence: ['a']}));
        const next = await memberSave(db, A, 0, envelope(A, 1, {evidence: ['a', 'b']}));
        assert.equal(next.revision, 1);
        assert.deepEqual(next.state.evidence, ['a', 'b']);
        assert.deepEqual(next.created_at, initial.created_at);
        for (const [expected, state] of [
          [-1, envelope(A, 0)], [0, envelope(A, 1)], [0, envelope(A, 1, {stale: true})],
          [8, envelope(A, 9)]
        ]) await rejectedWithoutMutation(db, () => memberSave(db, A, expected, state), ['40001']);
      });
      await t.test('initial create requires a complete revision-zero envelope', async () => {
        const good = envelope(B, 0);
        const cases = [null, [], {}, {...good, memberId: A}, {...good, revision: 1},
          {...good, revision: '0'}, {...good, schemaVersion: '1.0.0'}];
        for (const key of ['schemaVersion', 'memberId', 'revision']) {
          const missing = {...good}; delete missing[key];
          cases.push(missing, {...good, [key]: null});
        }
        for (const state of cases)
          await rejectedWithoutMutation(db, () => memberSave(db, B, -1, state), ['23514', '23502']);
      });
      await t.test('direct INSERT UPDATE DELETE UPSERT TRUNCATE are denied', async () => {
        const attempts = [
          ['insert into public.el8_member_state(user_id,schema_version,revision,state) values ($1,$2,0,$3)',
            [B, '3.0.0', JSON.stringify(envelope(B, 0))]],
          ["update public.el8_member_state set revision=revision+1, state=jsonb_set(state,'{revision}',to_jsonb(revision+1))", []],
          ['delete from public.el8_member_state', []],
          ['truncate public.el8_member_state', []],
          ['insert into public.el8_member_state(user_id,schema_version,revision,state) values ($1,$2,0,$3) on conflict(user_id) do update set state=excluded.state',
            [A, '3.0.0', JSON.stringify(envelope(A, 0))]]
        ];
        for (const [sql, params] of attempts)
          await rejectedWithoutMutation(db, () => asRole(db, 'authenticated', A,
            () => db.query(sql, params)), ['42501']);
      });
      await t.test('own-member reads and cross-member/unauthenticated denial', async () => {
        await memberSave(db, B, -1, envelope(B, 0));
        const visible = await asRole(db, 'authenticated', A,
          async () => (await db.query('select user_id from public.el8_member_state')).rows);
        assert.deepEqual(visible, [{user_id: A}]);
        await rejectedWithoutMutation(db, () => memberSave(db, A, 1, envelope(B, 2)), ['23514']);
        await rejectedWithoutMutation(db, () => memberSave(db, null, 1, envelope(A, 2)), ['28000']);
        for (const op of [() => rpc(db, 1, envelope(A, 2)),
          () => db.query('select * from public.el8_member_state'),
          () => db.query('delete from public.el8_member_state')])
          await rejectedWithoutMutation(db, () => asRole(db, 'anon', A, op), ['42501']);
      });
      await t.test('malformed updates fail closed without normalizing historical truth', async () => {
        const good = envelope(A, 2);
        const malformed = [null, [], 'state', {},
          ...['schemaVersion', 'memberId', 'revision'].flatMap(key => {
            const missing = {...good}; delete missing[key];
            return [missing, {...good, [key]: null}];
          }),
          {...good, schemaVersion: '1.0.0'}, {...good, memberId: B},
          ...['2', 2.5, -1, 0, 3, 2147483648, {}].map(revision => ({...good, revision}))];
        for (const state of malformed)
          await rejectedWithoutMutation(db, () => memberSave(db, A, 1, state), ['23514', '23502']);
        for (const expected of [null, -2, 2147483647])
          await rejectedWithoutMutation(db, () => memberSave(db, A, expected, good), ['22023']);
      });
      await t.test('table constraint also rejects malformed privileged writes', async () => {
        await rejectedWithoutMutation(db, () => asRole(db, 'service_role', A,
          () => db.query("update public.el8_member_state set revision=revision+1, state='{}' where user_id=$1", [A])), ['23514']);
      });
      await t.test('caller search path and temporary shadow table cannot redirect RPC', async () => {
        await db.exec('create temp table el8_member_state (stolen jsonb); set search_path = pg_temp,public');
        await memberSave(db, A, 1, envelope(A, 2));
        assert.equal((await db.query('select count(*)::int as n from pg_temp.el8_member_state')).rows[0].n, 0);
        assert.equal((await rows(db)).find(x => x.user_id === A).revision, 2);
        await db.exec('reset search_path');
      });
      await t.test('existing JavaScript persistence owner round-trips against SQL', async () => {
        await db.exec('truncate public.el8_member_state');
        const client = {
          rpc: async (name, args) => {
            assert.equal(name, 'save_el8_member_state');
            return {data: await memberSave(db, A, args.expected_revision, args.next_state), error: null};
          },
          from: name => {
            assert.equal(name, 'el8_member_state');
            return {select: () => ({maybeSingle: async () => ({
              data: await asRole(db, 'authenticated', A,
                async () => (await db.query('select * from public.el8_member_state')).rows[0] ?? null), error: null
            })})};
          }
        };
        const state = createMemberState({memberId: A, now: '2026-09-10T00:00:00.000Z'});
        assert.deepEqual(await saveMemberState(client, state, {expectedRevision: -1}), state);
        assert.deepEqual(await loadMemberState(client), state);
        await rejectedWithoutMutation(db, () => saveMemberState(client, state, {expectedRevision: -1}), ['40001']);
      });
    } finally { await db.close(); }
  });
}

test('migration preserves valid rows and timestamps exactly', async () => {
  const db = await checkpoint();
  try {
    await memberSave(db, A, -1, envelope(A, 0, {unknownFutureField: {evidence: ['original']}}));
    const before = await rows(db);
    await db.exec(forward);
    assert.deepEqual(await rows(db), before);
  } finally { await db.close(); }
});

test('malformed existing history blocks migration and rolls back DDL without data repair', async () => {
  const db = await checkpoint();
  try {
    const malformed = {memberId: A, revision: 0};
    await asRole(db, 'service_role', A, () => db.query(
      'insert into public.el8_member_state(user_id,schema_version,revision,state) values ($1,$2,0,$3)',
      [A, '3.0.0', JSON.stringify(malformed)]));
    const before = await rows(db);
    await assert.rejects(() => db.exec(forward), error => error.code === '23514');
    await db.exec('rollback');
    assert.deepEqual(await rows(db), before);
    assert.equal((await db.query(`select prosecdef from pg_proc
      where oid='public.save_el8_member_state(integer,jsonb)'::regprocedure`)).rows[0].prosecdef, false);
    assert.equal((await db.query(`select has_table_privilege('authenticated',
      'public.el8_member_state','UPDATE') as allowed`)).rows[0].allowed, true);
  } finally { await db.close(); }
});

test('uninspected overload blocks migration instead of silently keeping a second RPC', async () => {
  const db = await checkpoint();
  try {
    await db.exec(`create function public.save_el8_member_state(text,jsonb)
      returns void language sql as $$ select $$`);
    await assert.rejects(() => db.exec(forward), /unexpected Member State RPC overload/);
    await db.exec('rollback');
    assert.equal((await db.query(`select prosecdef from pg_proc
      where oid='public.save_el8_member_state(integer,jsonb)'::regprocedure`)).rows[0].prosecdef, false);
  } finally { await db.close(); }
});

test('inherited client write privilege blocks migration rather than claiming isolation', async () => {
  const db = await checkpoint();
  try {
    await db.exec(`create role other_writer nologin;
      grant update on public.el8_member_state to other_writer;
      grant other_writer to authenticated`);
    await assert.rejects(() => db.exec(forward), /unexpected inherited Member State write privilege/);
    await db.exec('rollback');
    assert.equal((await db.query(`select prosecdef from pg_proc
      where oid='public.save_el8_member_state(integer,jsonb)'::regprocedure`)).rows[0].prosecdef, false);
  } finally { await db.close(); }
});
