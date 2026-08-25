import assert from 'node:assert/strict';
import { makeObservation } from './contracts.js';
import { canonicalizeDiscoveryObservation, canonicalizeDiscoveryObservations } from './canonical-evidence.js';

const direct = makeObservation({
  id: 'obs-direct', questionId: 'Q1', concernId: 'stress', answerValue: 'yes', timestamp: 1000,
  effects: [{ type: 'evidence', target: 'stress', polarity: 'supports', strength: .8, certainty: 'graded', sourceType: 'direct', temporality: 'current' }],
});
const directCanonical = canonicalizeDiscoveryObservation(direct, { memberId: 'member-1' });
assert.equal(directCanonical.envelope.observationId, 'obs-direct');
assert.equal(directCanonical.envelope.sourceId, 'Q1');
assert.equal(directCanonical.evidenceRefs[0].observationId, 'obs-direct');
assert.equal(directCanonical.evidenceRefs[0].targetId, 'stress');
assert.equal(directCanonical.evidenceRefs[0].polarity, 'supports');

const cross = makeObservation({
  id: 'obs-cross', questionId: 'Q2', timestamp: 2000,
  effects: [
    { type: 'evidence', target: 'money_pressure', polarity: 'supports', strength: .7, certainty: 'graded', sourceType: 'direct', temporality: 'current' },
    { type: 'evidence', target: 'stress', polarity: 'supports', strength: .5, certainty: 'graded', sourceType: 'inferred', temporality: 'current' },
  ],
});
const crossCanonical = canonicalizeDiscoveryObservation(cross);
assert.deepEqual(crossCanonical.evidenceRefs.map(e => e.targetId), ['money_pressure', 'stress']);
assert.equal(new Set(crossCanonical.evidenceRefs.map(e => e.observationId)).size, 1);

const contradiction = makeObservation({
  id: 'obs-counter', questionId: 'Q3', timestamp: 3000,
  effects: [{ type: 'evidence', target: 'poor_sleep', polarity: 'contradicts', strength: 1, certainty: 'definitive', sourceType: 'direct', temporality: 'current' }],
});
assert.equal(canonicalizeDiscoveryObservation(contradiction).evidenceRefs[0].polarity, 'contradicts');

const neutral = makeObservation({
  id: 'obs-neutral', questionId: 'Q4', timestamp: 4000,
  effects: [{ type: 'evidence', target: 'stress', polarity: 'neutral', strength: 0, certainty: 'graded', sourceType: 'direct', temporality: 'unknown' }],
});
assert.equal(canonicalizeDiscoveryObservation(neutral).evidenceRefs[0].polarity, 'neutral');

const nonEvidence = makeObservation({
  id: 'obs-safety', questionId: 'Q5', timestamp: 5000,
  effects: [{ type: 'safety', target: 'safety', value: 'review', sourceType: 'direct', temporality: 'current' }],
});
assert.equal(canonicalizeDiscoveryObservation(nonEvidence).evidenceRefs.length, 0, 'non-evidence effects must not masquerade as evidence refs');

const batch = canonicalizeDiscoveryObservations([direct, cross, contradiction, neutral, nonEvidence], { memberId: 'member-1' });
assert.equal(batch.observations.length, 5);
assert.equal(batch.evidenceRefs.length, 5);
assert.equal(new Set(batch.evidenceRefs.map(e => e.evidenceId)).size, batch.evidenceRefs.length);

console.log('canonical Discovery evidence bridge tests passed');
