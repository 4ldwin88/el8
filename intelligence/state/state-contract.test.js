import assert from 'node:assert/strict';
import { DIMENSIONS, TOPICS, CONCERNS, validateTaxonomy } from './taxonomy.js';
import {
  createMemberState,
  createConcernState,
  createFact,
  createHypothesis,
  createIndicator,
  validateMemberStateShape,
} from './member-state-contract.js';

assert.equal(DIMENSIONS.length, 8);
assert.equal(validateTaxonomy().length, 0);
assert.ok(TOPICS.length > DIMENSIONS.length);
assert.ok(CONCERNS.some(item => item.id === 'money_pressure'));

const state = createMemberState({ memberId: 'test-member', now: '2026-01-01T00:00:00.000Z' });
assert.equal(validateMemberStateShape(state).length, 0);
assert.equal(state.dimensions.financial.conditionState, 'unknown');
assert.equal(state.dimensions.financial.coverageState, 'unknown');
assert.equal('score' in state.dimensions.financial, false);

const concern = createConcernState({ concernId: 'money_pressure', status: 'supported', now: '2026-01-01T00:00:00.000Z' });
assert.equal(concern.dimensionId, 'financial');
assert.ok(concern.topicIds.includes('financial.debt_burden'));
assert.equal('score' in concern, false);
state.concerns[concern.concernId] = concern;
state.dimensions.financial.concernIds.push(concern.concernId);
state.dimensions.financial.topicIds.push(...concern.topicIds);

const fact = createFact({ factId: 'fact-1', semanticKey: 'financial.debt_burden.present', value: true, sourceType: 'baseline', sourceRef: 'baseline:q7', affectedConcernId: concern.concernId, affectedDimensionId: 'financial', observedAt: '2026-01-01T00:00:00.000Z', memberConfirmed: true });
state.facts[fact.factId] = fact;
concern.factIds.push(fact.factId);

const hypothesis = createHypothesis({ hypothesisId: 'hyp-1', proposition: 'Employment instability may contribute to money pressure', linkedConcernIds: [concern.concernId], linkedDimensionIds: ['occupational','financial'], status: 'corroborating', confirmationStatus: 'pending', now: '2026-01-01T00:00:00.000Z' });
state.hypotheses[hypothesis.hypothesisId] = hypothesis;
concern.hypothesisIds.push(hypothesis.hypothesisId);

const indicator = createIndicator({ indicatorId: 'ind-1', definition: 'Member-reported debt pressure', concernId: concern.concernId, dimensionId: 'financial', unitOrScale: 'ordinal', directionality: 'lower_is_better' });
state.indicators[indicator.indicatorId] = indicator;
concern.indicatorIds.push(indicator.indicatorId);

assert.equal(validateMemberStateShape(state).length, 0);
assert.equal(state.facts['fact-1'].sourceRef, 'baseline:q7');
assert.equal(state.hypotheses['hyp-1'].status, 'corroborating');
assert.equal(state.indicators['ind-1'].trajectory, 'unknown');

const falseStable = structuredClone(state);
falseStable.dimensions.physical.conditionState = 'stable';
assert.ok(validateMemberStateShape(falseStable).some(error => error.includes('cannot default stable')));

const unconfirmedPriority = structuredClone(state);
unconfirmedPriority.activePriorities.push('money_pressure');
assert.ok(validateMemberStateShape(unconfirmedPriority).some(error => error.includes('member confirmed')));

const confirmedPriority = structuredClone(state);
confirmedPriority.concerns.money_pressure.memberConfirmed = true;
confirmedPriority.activePriorities.push('money_pressure');
assert.equal(validateMemberStateShape(confirmedPriority).length, 0);

const badHypothesis = structuredClone(state);
badHypothesis.hypotheses['hyp-1'].status = 'member_confirmed';
assert.ok(validateMemberStateShape(badHypothesis).some(error => error.includes('requires member confirmation')));

console.log('canonical belief state contract tests passed');
