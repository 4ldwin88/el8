import assert from 'node:assert/strict';
import { RUNTIME_STATE, discoveryRuntimeState, runtimeStateFromError, withRuntimeState } from './runtime-state.js';

assert.equal(discoveryRuntimeState().kind, RUNTIME_STATE.LOADING);
assert.equal(discoveryRuntimeState({ handoff: { usable: false, blockingConstructIds: ['sleep'], unresolvedConstructIds: ['sleep'] } }).kind, RUNTIME_STATE.INSUFFICIENT_EVIDENCE);
assert.equal(discoveryRuntimeState({ handoff: { usable: true, boundedUncertainty: true } }).kind, RUNTIME_STATE.READY);
assert.equal(discoveryRuntimeState({ handoff: { usable: true, boundedUncertainty: true } }).boundedUncertainty, true);

assert.equal(runtimeStateFromError(new Error('Member State revision conflict'), { online: true }).kind, RUNTIME_STATE.REVISION_CONFLICT);
assert.equal(runtimeStateFromError(new Error('network unavailable'), { online: false }).kind, RUNTIME_STATE.OFFLINE);
assert.equal(runtimeStateFromError(new Error('database unavailable'), { online: true }).kind, RUNTIME_STATE.PERSISTENCE_FAILURE);
assert.equal(runtimeStateFromError(new Error('Intelligence decision support degraded'), { online: true }).kind, RUNTIME_STATE.DEGRADED_INTELLIGENCE);

const failed = await withRuntimeState(async () => { throw new Error('save failed'); }, { online: true });
assert.equal(failed.value, null);
assert.equal(failed.state.kind, RUNTIME_STATE.PERSISTENCE_FAILURE);
assert.match(failed.state.message, /last confirmed information is unchanged/i);

const ok = await withRuntimeState(async () => ({ revision: 2 }), { online: true });
assert.deepEqual(ok.value, { revision: 2 });
assert.equal(ok.state.kind, RUNTIME_STATE.READY);

console.log('Runtime resilience contract: PASS');
