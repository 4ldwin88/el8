import assert from 'node:assert/strict';
import * as discovery from './round3-engine.js';
import discoveryPort from '../../development/app/onboarding/discovery-adapter.js';

const runtime = discovery.session({ concernIds: [] });
assert.ok(runtime, 'canonical Discovery runtime should create a session');
assert.equal(typeof discovery.next(runtime), 'object', 'canonical Discovery runtime should produce a next step');
assert.equal(typeof discovery.trace(runtime), 'object', 'canonical Discovery runtime should expose a trace');

const portSession = discoveryPort.createSession({ concernIds: [] });
assert.ok(portSession, 'development Discovery port should create a canonical session');
assert.equal(typeof discoveryPort.nextStep(portSession), 'object', 'development Discovery port should reach canonical next-step behavior');
const proposal = discoveryPort.proposal(portSession);
assert.ok(proposal && typeof proposal === 'object', 'development Discovery port should produce a proposal envelope');
assert.ok('plan' in proposal, 'proposal should include the member plan');
assert.ok('trace' in proposal, 'proposal should include the Discovery trace');

console.log('canonical Discovery runtime + development onboarding port smoke test passed');
