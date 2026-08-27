import test from 'node:test';
import assert from 'node:assert/strict';
import * as discovery from '../discovery/discovery-engine.js';
import { buildCanonicalPlan } from '../planning/canonical-plan-engine.js';

const planningInput = {
  memberStateRevision: 5,
  confirmedPriorityIds: ['priority:poor_sleep'],
  memberChoice: { mode: 'EXPLICIT_ACCEPTANCE' },
  problems: [{
    priorityId: 'priority:poor_sleep',
    problemId: 'problem:poor_sleep',
    evidenceRefs: ['e1'],
    priorLearning: []
  }],
  constraints: {
    profile: [],
    capacity: 'medium',
    manageability: 'manageable',
    throttle: { active: false },
    safety: { disposition: 'ORDINARY_FLOW' }
  }
};

const selectionEvidence = {
  'baseline.sleep_pattern': 'Timing changes a lot'
};

test('Discovery pauses ordinary questions when contextual Safety needs clarification', () => {
  const s = discovery.session({
    concernIds: ['poor_sleep'],
    safetyContextualSignals: { functionalDeterioration: .8, severeSleepChange: .8 }
  });
  const step = discovery.next(s);
  assert.equal(step.type, 'safety');
  assert.equal(step.safety.status, 'confirmation_required');
});

test('Discovery retains contextual uncertainty after negative direct confirmation', () => {
  const s = discovery.session({
    concernIds: ['poor_sleep'],
    safetyContextualSignals: { functionalDeterioration: .8, severeSleepChange: .8 },
    safetyConfirmation: { immediateDanger: false, intent: false, canStaySafe: true }
  });
  assert.equal(s.safety.status, 'continue_with_constraints');
  assert.equal(s.safety.unresolvedContext, true);
  assert.notEqual(discovery.next(s).type, 'safety');
});

test('Planning cannot compose an intervention while Safety requires ordinary flow to pause', () => {
  const p = buildCanonicalPlan({
    ...planningInput,
    constraints: {
      ...planningInput.constraints,
      safety: { disposition: 'PAUSE_ORDINARY_FLOW' }
    }
  }, { selectionEvidence });
  assert.equal(p.status, 'escalate');
  assert.equal(p.reason, 'safety_override');
  assert.deepEqual(p.active, []);
});

test('Planning cannot compose an intervention after positive direct Safety confirmation', () => {
  const p = buildCanonicalPlan({
    ...planningInput,
    constraints: {
      ...planningInput.constraints,
      safety: { disposition: 'PAUSE_ORDINARY_FLOW', status: 'escalate' }
    }
  }, { selectionEvidence });
  assert.equal(p.status, 'escalate');
  assert.equal(p.reason, 'safety_override');
  assert.deepEqual(p.active, []);
});

console.log('Safety lifecycle integration QA passed');
