import test from 'node:test';
import assert from 'node:assert/strict';
import * as discovery from '../discovery/discovery-engine.js';
import { buildPlan } from '../planning/planningEngine.js';

const planningInput = {
  memberStateRevision: 5,
  focuses: [{ constructId: 'SLEEP_QUALITY', decision: 'accepted' }],
  evidenceRefs: ['e1'],
  constraintRefs: [],
  safetyDisposition: 'ordinary_flow'
};

test('Discovery pauses ordinary questions when contextual Safety needs clarification', () => {
  const s = discovery.session({
    constructIds: ['SLEEP_QUALITY'],
    safetyContextualSignals: { functionalDeterioration: .8, severeSleepChange: .8 }
  });
  const step = discovery.next(s);
  assert.equal(step.type, 'safety');
  assert.equal(step.safety.status, 'confirmation_required');
});

test('Discovery retains contextual uncertainty after negative direct confirmation', () => {
  const s = discovery.session({
    constructIds: ['SLEEP_QUALITY'],
    safetyContextualSignals: { functionalDeterioration: .8, severeSleepChange: .8 },
    safetyConfirmation: { immediateDanger: false, intent: false, canStaySafe: true }
  });
  assert.equal(s.safety.status, 'continue_with_constraints');
  assert.equal(s.safety.unresolvedContext, true);
  assert.notEqual(discovery.next(s).type, 'safety');
});

test('Planning cannot compose an Action while Safety requires ordinary flow to pause', () => {
  const p = buildPlan({ ...planningInput, safetyDisposition: 'pause_ordinary_flow' });
  assert.equal(p.status, 'blocked');
  assert.equal(p.reason, 'safety_override');
  assert.deepEqual(p.proposedActions, []);
});

test('Planning cannot compose an Action after positive direct Safety escalation', () => {
  const p = buildPlan({ ...planningInput, safetyDisposition: 'escalate' });
  assert.equal(p.status, 'blocked');
  assert.equal(p.reason, 'safety_override');
  assert.deepEqual(p.proposedActions, []);
});

console.log('Safety lifecycle integration QA passed');
