import assert from 'node:assert/strict';
import * as discovery from './round3-engine.js';
import {
  createDiscoverySession,
  nextDiscoveryStep,
  discoveryOutput,
  discoveryPriorityCandidates,
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

// Live-test regression: importance is a single pass. Once triaged, Discovery must not
// emit another triage/priority-ranking step simply because later evidence changes.
const once = createDiscoverySession({ concernIds: ['money_pressure','physical_condition','poor_sleep','low_focus'] });
let step = nextDiscoveryStep(once);
assert.equal(step.type, 'triage', 'new concern set should receive one importance pass');
discovery.triage(once, { money_pressure: 3, physical_condition: 3, poor_sleep: 1, low_focus: 1 });
step = nextDiscoveryStep(once);
assert.notEqual(step.type, 'triage', 'importance must not be requested twice');
assert.notEqual(step.type, 'priority-resolution', 'mid-Discovery priority ranking is forbidden');

// Live-test regression: member-emphasized concerns survive to Proposed Priorities even
// when derived evidence confidence is zero. This prevents an empty priority gate after
// the member explicitly rated Money/Health high and Sleep/Focus somewhat important.
const emphasizedOutput = {
  trace: { states: [
    { concernId:'money_pressure', resolutionState:'triaged', memberImportance:3, evidenceConfidence:0 },
    { concernId:'physical_condition', resolutionState:'triaged', memberImportance:3, evidenceConfidence:0 },
    { concernId:'poor_sleep', resolutionState:'triaged', memberImportance:1, evidenceConfidence:0 },
    { concernId:'low_focus', resolutionState:'triaged', memberImportance:1, evidenceConfidence:0 },
    { concernId:'low_energy', resolutionState:'triaged', memberImportance:null, evidenceConfidence:0 },
  ]},
  plan: { focus: [] },
};
const emphasized = discoveryPriorityCandidates(emphasizedOutput);
assert.deepEqual(emphasized.map(x=>x.concernId), ['money_pressure','physical_condition','low_focus','poor_sleep'], 'explicitly important concerns must remain available');
assert.equal(emphasized.some(x=>x.concernId==='low_energy'), false, 'unmentioned zero-evidence concern must not appear');

// Inferred concerns are allowed only with positive evidence and are labeled as inferred
// so the UI can explain why EL8 is asking/showing them.
const inferred = discoveryPriorityCandidates({
  trace:{states:[{concernId:'low_energy',resolutionState:'triaged',memberImportance:null,evidenceConfidence:0.45,evidenceRefs:['D2:inside']}]},
  plan:{focus:[]},
});
assert.equal(inferred.length,1,'positive evidence may surface an inferred concern');
assert.equal(inferred[0].inferred,true,'evidence-only concern should be marked inferred');
assert.deepEqual(inferred[0].evidenceRefs,['D2:inside'],'inferred concern should preserve its evidence trail');

console.log('canonical Discovery runtime + onboarding contract regression tests passed');
