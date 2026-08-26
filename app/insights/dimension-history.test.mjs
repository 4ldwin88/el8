import assert from 'node:assert/strict';
import { buildDimensionHistory, summarizeDimensionHistory } from './dimension-history.js';

const sessions = [
  { status: 'completed', module_type: 'universal_baseline', submitted_at: '2026-08-01', responses: { conditions: { Physical: 'Stable' } } },
  { status: 'completed', module_type: 'reassessment', submitted_at: '2026-08-08', responses: { conditions: { Physical: 'Healthy' } } },
  { status: 'completed', module_type: 'monthly_reassessment', submitted_at: '2026-08-22', derived_outputs: { dimension_conditions: { Physical: 'Thriving' } } },
  { status: 'draft', module_type: 'reassessment', submitted_at: '2026-08-24', responses: { conditions: { Physical: 'Attention' } } }
];

const history = buildDimensionHistory('Physical', sessions);
assert.equal(history.length, 3);
assert.equal(history[0].type, 'baseline');
assert.equal(history[0].condition, 'Stable');
assert.equal(history[2].condition, 'Thriving');

const summary = summarizeDimensionHistory(history);
assert.deepEqual(summary, { baseline: 'Stable', current: 'Thriving', trajectory: 'improving' });

const unchanged = summarizeDimensionHistory([
  { type: 'baseline', condition: 'Healthy' },
  { type: 'reassessment', condition: 'Healthy' }
]);
assert.equal(unchanged.trajectory, 'steady');

const declining = summarizeDimensionHistory([
  { type: 'baseline', condition: 'Healthy' },
  { type: 'reassessment', condition: 'Stable' }
]);
assert.equal(declining.trajectory, 'declining');

console.log('Dimension history semantics — PASS');
