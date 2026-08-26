import assert from 'node:assert/strict';
import { summarizeDailyEvidence } from './daily-evidence.js';

const signals = [
  { source: 'track', signal_type: 'water', payload: { value: 750, unit: 'ml' } },
  { source: 'track', signal_type: 'mood', payload: { value: 7 } },
  { source: 'daily_checkin', signal_type: 'context', payload: { movement: '30 min walk', employment_action: 'Applied to a role' } }
];

const summary = summarizeDailyEvidence({ signals, planDimensions: ['Physical', 'Emotional', 'Financial'], hydrationTargetMl: 3000 });
assert.equal(summary.confidence, 'Strong');
assert.equal(summary.hydration.loggedMl, 750);
assert.equal(summary.hydration.remainingMl, 2250);
assert.equal(summary.coverage.find(item => item.dimension === 'Physical').evidenceCount, 2);
assert.equal(summary.coverage.find(item => item.dimension === 'Emotional').evidenceCount, 1);
assert.equal(summary.coverage.find(item => item.dimension === 'Financial').evidenceCount, 1);
assert.equal(summary.hasDailyCheckin, true);

const sparse = summarizeDailyEvidence({ signals: [], planDimensions: ['Social'] });
assert.equal(sparse.confidence, 'Limited');
assert.equal(sparse.coverage[0].supportedMapping, false);
assert.match(sparse.evidenceLimits[0], /does not yet have dedicated day-level evidence mapping/);
assert.equal(sparse.principle, 'Missing data is not evidence that an event did not occur.');

console.log('Daily evidence interpretation — PASS');
