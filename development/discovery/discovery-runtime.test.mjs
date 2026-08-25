import assert from 'node:assert/strict';
import * as discovery from './round3-engine.js';
import discoveryPort from '../app/onboarding/discovery-adapter.js';

const runtime = discovery.session({ concernIds: [] });
assert.ok(runtime, 'promoted Discovery runtime should create a session');
assert.equal(typeof discovery.next(runtime), 'object', 'promoted Discovery runtime should produce a next step');
assert.equal(typeof discovery.trace(runtime), 'object', 'promoted Discovery runtime should expose a trace');

const portSession = discoveryPort.createSession({ concernIds: [] });
assert.ok(portSession, 'onboarding Discovery port should create a promoted session');
assert.equal(typeof discoveryPort.nextStep(portSession), 'object', 'onboarding Discovery port should reach promoted next-step behavior');
const proposal = discoveryPort.proposal(portSession);
assert.ok(proposal && typeof proposal === 'object', 'onboarding Discovery port should produce a proposal envelope');
assert.ok('plan' in proposal, 'proposal should include the member plan');
assert.ok('trace' in proposal, 'proposal should include the Discovery trace');

console.log('promoted Discovery runtime + onboarding port smoke test passed');
