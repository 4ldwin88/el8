import assert from 'node:assert/strict';
import {buildDimensionHistory,buildHistoricalDimensionHistory,summarizeDimensionHistory} from './dimension-history.js';

const memberState={createdAt:'2026-08-01',updatedAt:'2026-08-22',baseline:{status:'ESTABLISHED',establishedAt:'2026-08-01',dimensionSnapshots:{physical:{condition:'Stable'}}},dimensions:{physical:{condition:'Thriving'}}};
const history=buildDimensionHistory('Physical',{memberState});
assert.deepEqual(history.map(x=>x.type),['baseline','current']);
assert.equal(history[0].source,'member-state-baseline');
assert.equal(history[1].condition,'Thriving');
assert.deepEqual(summarizeDimensionHistory(history),{baseline:'Stable',current:'Thriving',trajectory:'improving'});

const sessions=[
 {status:'completed',module_type:'universal_baseline',submitted_at:'2026-07-01',responses:{conditions:{Physical:'Stable'}}},
 {status:'completed',module_type:'monthly_reassessment',submitted_at:'2026-07-22',derived_outputs:{dimension_conditions:{Physical:'Healthy'}}}
];
const legacy=buildHistoricalDimensionHistory('Physical',sessions);
assert.deepEqual(legacy.map(x=>x.type),['historical-baseline','historical-reassessment']);
assert.ok(legacy.every(x=>x.source.startsWith('legacy-')));
assert.deepEqual(summarizeDimensionHistory(legacy),{baseline:'Stable',current:'Healthy',trajectory:'improving'});

const canonicalWins=buildDimensionHistory('Physical',{memberState,historicalSessions:sessions});
assert.deepEqual(canonicalWins.map(x=>x.source),['member-state-baseline','member-state-current']);

const fallback=buildDimensionHistory('Physical',{memberState:null,historicalSessions:sessions});
assert.deepEqual(fallback.map(x=>x.type),['historical-baseline','historical-reassessment']);

const unknown=buildDimensionHistory('Physical',{memberState:{baseline:{status:'ESTABLISHED',dimensionSnapshots:{physical:{condition:null}}},dimensions:{physical:{condition:null}}},historicalSessions:[]});
assert.deepEqual(unknown,[]);
assert.deepEqual(summarizeDimensionHistory(unknown),{baseline:null,current:null,trajectory:'unclear'});

console.log('Dimension history canonical/legacy boundary — PASS');
