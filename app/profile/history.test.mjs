import assert from 'node:assert/strict';
import { normalizeHistoryRecords, filterHistoryRecords, historyRecordPolicy, buildTrackingCorrection } from './history.js';

const records = normalizeHistoryRecords({
  entries: [{ entry_id: '1', created_at: '2026-08-20T12:00:00Z', payload_hash: 'abc', payload: { summary: 'Walk', category: 'Movement', dimension: 'Physical' } }],
  daily: [{ id: '2', submitted_at: '2026-08-21T12:00:00Z' }],
  weekly: [{ id: '3', submitted_at: '2026-08-22T12:00:00Z' }],
  assessments: [{ id: '4', module_type: 'universal_baseline', status: 'completed', submitted_at: '2026-08-23T12:00:00Z' }]
});
assert.equal(records.length, 4);
assert.equal(records[0].kind, 'assessment');
assert.equal(filterHistoryRecords(records, { type: 'tracking' }).length, 1);
assert.equal(filterHistoryRecords(records, { year: 2026, month: 8, timeZone: 'America/Toronto' }).length, 4);
assert.equal(historyRecordPolicy(records.find(record => record.kind === 'tracking')).editable, true);
assert.equal(historyRecordPolicy(records.find(record => record.kind === 'assessment')).editable, false);

const tracking = records.find(record => record.kind === 'tracking');
const correction = buildTrackingCorrection(tracking, { summary: '30 min walk', dimension: 'Physical', category: 'Movement', reason: 'Added duration', correctedAt: '2026-08-24T00:00:00Z' });
assert.equal(correction.expectedPayloadHash, 'abc');
assert.equal(correction.payload.summary, '30 min walk');
assert.equal(correction.changeReason, 'Added duration');
assert.throws(() => buildTrackingCorrection(tracking, { reason: '' }), /reason is required/);
assert.throws(() => buildTrackingCorrection(records.find(record => record.kind === 'assessment'), { reason: 'x' }), /Only tracking/);

console.log('Member history semantics — PASS');
