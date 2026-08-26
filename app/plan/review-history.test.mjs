import test from 'node:test';import assert from'node:assert/strict';import{adaptationFromReviewRows,normalizeReviewRow}from'./review-history-policy.js';
const row=(id,interventionId,adaptation,date)=>({id,submitted_at:date,derived_outputs:{outcome:{interventionId},decision:{adaptation}}});
test('invalid rows are ignored',()=>assert.equal(normalizeReviewRow({}),null));
test('history is scoped to one intervention',()=>{const x=adaptationFromReviewRows([row('1','a','reassess','2026-01-01'),row('2','b','reassess','2026-01-02'),row('3','a','reassess','2026-01-03')],'a');assert.equal(x.reviews.length,2);assert.equal(x.policy.adaptation,'reassess')});
test('one negative review still observes',()=>assert.equal(adaptationFromReviewRows([row('1','a','reassess','2026-01-01')],'a').policy.adaptation,'observe'));
test('chronology, not database return order, governs recent evidence',()=>{const x=adaptationFromReviewRows([row('3','a','maintain','2026-01-03'),row('1','a','reassess','2026-01-01'),row('2','a','reassess','2026-01-02')],'a');assert.equal(x.reviews[2].sessionId,'3');assert.equal(x.policy.adaptation,'reassess')});
