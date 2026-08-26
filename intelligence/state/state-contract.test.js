import assert from 'node:assert/strict';
import {
  DIMENSIONS,
  TOPICS,
  CONCERNS,
  validateTaxonomy,
} from './taxonomy.js';
import {
  createMemberState,
  createConcernState,
  createDriverState,
  createDriverRelationship,
  validateMemberStateShape,
} from './member-state-contract.js';

assert.equal(DIMENSIONS.length, 8);
assert.equal(validateTaxonomy().length, 0);
assert.ok(TOPICS.length > DIMENSIONS.length);
assert.ok(CONCERNS.some(item => item.id === 'money_pressure'));

const state = createMemberState({ memberId: 'test-member', now: '2026-01-01T00:00:00.000Z' });
assert.equal(validateMemberStateShape(state).length, 0);
assert.equal(state.dimensions.financial.concernIds.length, 0);
assert.equal('score' in state.dimensions.financial, false);
assert.equal('pressure' in state.dimensions.financial, false);

const concern = createConcernState({
  concernId: 'money_pressure',
  status: 'candidate',
  now: '2026-01-01T00:00:00.000Z',
});
assert.equal(concern.dimensionId, 'financial');
assert.ok(concern.topicIds.includes('financial.debt_burden'));
assert.equal(concern.evidenceConfidence, null);
assert.equal('score' in concern, false);

const driver = createDriverState({
  driverId: 'employment_instability',
  label: 'Employment instability',
  originDimensionId: 'occupational',
  now: '2026-01-01T00:00:00.000Z',
});
const relationship = createDriverRelationship({
  relationshipId: 'employment_instability->money_pressure',
  driverId: driver.driverId,
  concernId: concern.concernId,
  status: 'supported',
  now: '2026-01-01T00:00:00.000Z',
});

state.concerns[concern.concernId] = concern;
state.drivers[driver.driverId] = driver;
state.driverRelationships[relationship.relationshipId] = relationship;
state.dimensions.financial.concernIds.push(concern.concernId);
state.dimensions.financial.topicIds.push(...concern.topicIds);

assert.equal(validateMemberStateShape(state).length, 0);
assert.equal(relationship.concernId, 'money_pressure');
assert.equal(driver.originDimensionId, 'occupational');
assert.equal(relationship.status, 'supported');

const broken = structuredClone(state);
broken.driverRelationships[relationship.relationshipId].driverId = 'missing_driver';
assert.ok(validateMemberStateShape(broken).some(error => error.includes('unknown driver')));

console.log('canonical state contract tests passed');
