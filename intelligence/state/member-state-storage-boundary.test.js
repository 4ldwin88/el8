import test from 'node:test';
import assert from 'node:assert/strict';
import {createMemberState, createConstructState, createFocusDecision} from './member-state-contract.js';
import {applyMemberStateTransition, MEMBER_STATE_EVENT} from './member-state-transition.js';
import {toPersistedMemberState, fromPersistedMemberState, assertPersistedMemberStateRow, saveMemberState} from './supabase-persistence.js';
import {openMemberStateSession} from '../../app/auth/member-state-session.js';

// Derived from 05.04 preservation/schema-evolution and 02.01.01/02.01.03
// decision ownership. The oracle is the original state, not a second mapper.
const at = '2026-09-10T00:00:00.000Z';
const base = () => createMemberState({memberId:'member:test', now:at});
const wire = value => JSON.parse(JSON.stringify(value));
function roundTrip(state) {
  const before = structuredClone(state);
  const persisted = toPersistedMemberState(state);
  const serialized = wire(persisted);
  const restored = fromPersistedMemberState(serialized);
  assert.deepEqual(restored, before);
  assert.deepEqual(state, before);
  assert.deepEqual(serialized, persisted);
  assert.notEqual(restored, state);
  return restored;
}
function transition(state, type, payload) {
  return applyMemberStateTransition(state, {type, payload, source:'contract-test', at, expectedRevision:state.revision});
}
function readOnlyTransport(row) {
  let writes = 0;
  return {
    from(name) {
      assert.equal(name, 'el8_member_state');
      return {select: () => ({maybeSingle: async () => ({data:wire(row), error:null})})};
    },
    rpc() { writes++; throw new Error('unexpected write'); },
    writes: () => writes,
  };
}

test('current domain transitions retain Focus order through real JSON storage round trips', () => {
  let state = base();
  for (const constructId of ['SLEEP_QUALITY','FINANCIAL_STRAIN']) {
    state = transition(state, MEMBER_STATE_EVENT.CONSTRUCT_UPDATED, {constructId, status:'supported'});
    state = transition(state, MEMBER_STATE_EVENT.FOCUS_DECIDED, {constructId, decision:'accepted'});
  }
  state = transition(state, MEMBER_STATE_EVENT.FOCUS_DECIDED, {constructId:'SLEEP_QUALITY', decision:'deferred'});
  state = transition(state, MEMBER_STATE_EVENT.FOCUS_DECIDED, {constructId:'SLEEP_QUALITY', decision:'accepted'});
  assert.deepEqual(state.activeFocusIds, ['FINANCIAL_STRAIN','SLEEP_QUALITY']);
  roundTrip(state);
});

test('loading cannot synthesize active Focus from decision history', () => {
  const state = base();
  state.constructs.SLEEP_QUALITY = createConstructState({constructId:'SLEEP_QUALITY', now:at});
  state.focusDecisions.SLEEP_QUALITY = createFocusDecision({constructId:'SLEEP_QUALITY', decision:'accepted', decidedAt:at});
  assert.deepEqual(roundTrip(state).activeFocusIds, []);
});

test('evidence, uncertainty, Safety, Plan references and unknown values remain exact', () => {
  let state = base();
  state = transition(state, MEMBER_STATE_EVENT.CONSTRUCT_UPDATED, {
    constructId:'SLEEP_QUALITY', status:'supported', sufficiency:'insufficient',
    unresolvedReasons:['required_driver_unknown'], evidenceConfidence:'LIMITED', evidenceRefs:['e1'],
  });
  state = transition(state, MEMBER_STATE_EVENT.FACT_RECORDED, {
    factId:'e1', semanticKey:'sleep.report', value:null, sourceType:'member', sourceRef:'q1',
    observedAt:at, currentStatus:'current', reliability:'unknown', memberConfirmed:true,
  });
  state = transition(state, MEMBER_STATE_EVENT.SAFETY_DISPOSITION_UPDATED, {active:true, signalRefs:['s1'], dispositionRef:'safety:1'});
  state.activePlanRef = {planId:'p1', reconciliationRequired:true};
  state.memberContext.preferences = {nested:[null, false, 0, 'unknown']};
  roundTrip(state);
});

test('unsupported, missing and historical versions are rejected without interpreting them', () => {
  for (const version of [undefined, null, '', '1.0.0', '2.0.0', '3.1.0', '3.2.0', '99.0.0']) {
    const input = {...base(), schemaVersion:version};
    const before = structuredClone(input);
    assert.throws(() => fromPersistedMemberState(input), /schema/);
    assert.deepEqual(input, before);
  }
});

test('storage cannot overwrite a domain schema marker or repair invalid current decisions', () => {
  assert.throws(() => toPersistedMemberState({...base(), schemaVersion:'99.0.0'}), /schema/);
  const input = {...base(), schemaVersion:'3.0.0', activeFocusIds:['SLEEP_QUALITY']};
  const before = structuredClone(input);
  assert.throws(() => fromPersistedMemberState(input), /accepted member decision/);
  assert.deepEqual(input, before);
});

test('physical revision is an integer contract, not a coercible presentation value', () => {
  const state = toPersistedMemberState(base());
  for (const revision of ['0', null, false, -1, 0.5]) {
    assert.throws(() => assertPersistedMemberStateRow({schema_version:'3.0.0', revision, state}), /revision/);
  }
});

test('ordinary session reads current state exactly and refuses historical or future state without writes', async () => {
  const state = base();
  state.focusDecisions.SLEEP_QUALITY = createFocusDecision({constructId:'SLEEP_QUALITY', decision:'accepted', decidedAt:at});
  const client = readOnlyTransport({schema_version:'3.0.0', revision:0, state:toPersistedMemberState(state)});
  const opened = await openMemberStateSession({supabase:client, session:{user:{id:'member:test'}}, now:at});
  assert.deepEqual(opened.state, state);
  assert.equal(client.writes(), 0);
  for (const version of ['1.0.0','99.0.0']) {
    const legacy = readOnlyTransport({schema_version:version, revision:0, state:{...state, schemaVersion:version}});
    await assert.rejects(() => openMemberStateSession({supabase:legacy, session:{user:{id:'member:test'}}, now:at}), /schema/);
    assert.equal(legacy.writes(), 0);
  }
});

test('JSON-lossy values are rejected before an RPC can acknowledge altered evidence', async () => {
  const cyclic = {}; cyclic.self = cyclic;
  const sparse = []; sparse.length = 1;
  const decorated = []; decorated.evidence = 'would be lost';
  const hidden = Object.defineProperty({}, 'evidence', {value:'would be lost'});
  const symbolKey = {[Symbol('evidence')]:'would be lost'};
  const accessor = Object.defineProperty({}, 'evidence', {enumerable:true, get(){throw new Error('getter executed');}});
  for (const value of [undefined, NaN, Infinity, -Infinity, -0, new Date(at), new Map([['x',1]]), () => 1, 1n, Symbol('x'), cyclic, sparse, decorated, hidden, symbolKey, accessor]) {
    const state = base();
    state.memberContext.preferences.value = value;
    const client = readOnlyTransport(null);
    await assert.rejects(() => saveMemberState(client, state, {expectedRevision:-1}), /JSON/);
    assert.equal(client.writes(), 0);
  }
});
