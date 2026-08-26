import assert from 'node:assert/strict';
import * as discovery from './round3-engine.js';
import {
  createDiscoverySession,
  nextDiscoveryStep,
  discoveryOutput,
} from '../../app/onboarding/discovery-runtime.js';

const runtime = discovery.session({ concernIds: [] });
assert.ok(runtime, 'canonical Discovery runtime should create a session');
assert.equal(typeof discovery.next(runtime), 'object', 'canonical Discovery runtime should produce a next step');
assert.equal(typeof discovery.trace(runtime), 'object', 'canonical Discovery runtime should expose a trace');

const portSession = createDiscoverySession({ concernIds: [] });
assert.ok(portSession, 'onboarding Discovery boundary should create a canonical session');
assert.equal(typeof nextDiscoveryStep(portSession), 'object', 'onboarding Discovery boundary should reach canonical next-step behavior');
const proposal = discoveryOutput(portSession);
assert.ok(proposal && typeof proposal === 'object', 'onboarding Discovery boundary should produce a proposal envelope');
assert.ok('plan' in proposal, 'proposal should include the member plan');
assert.ok('trace' in proposal, 'proposal should include the Discovery trace');

console.log('canonical Discovery runtime + onboarding boundary smoke test passed');
