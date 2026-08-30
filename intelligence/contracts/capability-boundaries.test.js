import assert from 'node:assert/strict';
import {
  discoveryToPrioritization,
  prioritizationToFocusConfirmation,
  focusConfirmationToPlanning,
  executionToReview,
  reviewToNextDecision,
} from './capability-boundaries.js';

const d=discoveryToPrioritization({memberStateRevision:3,candidates:[{constructId:'SLEEP_QUALITY',status:'supported',evidenceRefs:['q1']}],evidenceRefs:['q1']});
assert.equal(d.candidates[0].constructId,'SLEEP_QUALITY');
assert.throws(()=>discoveryToPrioritization({memberStateRevision:3,candidates:[{constructId:'poor_sleep',status:'supported'}]}),/canonical EL8 construct ID/);
assert.throws(()=>discoveryToPrioritization({memberStateRevision:3,candidates:[{constructId:'SLEEP_QUALITY',status:'hypothesis'}]}),/established or supported/);

const p=prioritizationToFocusConfirmation({memberStateRevision:3,recommended:[{constructId:'SLEEP_QUALITY',factors:{importance:null,urgency:.7}}]});
assert.equal(p.recommended[0].factors.importance,'unknown');
assert.notEqual(p.recommended[0].factors.importance,.5);

const accepted={constructId:'SLEEP_QUALITY',decision:'accepted',decidedAt:'2026-08-30T14:00:00Z'};
const planInput=focusConfirmationToPlanning({memberStateRevision:3,focuses:[accepted],evidenceRefs:['q1']});
assert.equal(planInput.focuses.length,1);
assert.throws(()=>focusConfirmationToPlanning({memberStateRevision:3,focuses:[{...accepted,decision:'rejected'}]}),/member-accepted Focus/);

const reviewInput=executionToReview({memberStateRevision:4,planId:'p1',actionEvidenceRefs:['a1:checkin'],outcomeRefs:['o1']});
assert.equal(reviewInput.planId,'p1');
const next=reviewToNextDecision({memberStateRevision:4,planId:'p1',reviewCycleId:'r1',disposition:'reassess',evidenceRefs:['o1'],focusRefs:['SLEEP_QUALITY']});
assert.equal(next.disposition,'reassess');
assert.throws(()=>reviewToNextDecision({memberStateRevision:4,planId:'p1',reviewCycleId:'r1',disposition:'invented',focusRefs:[]}),/invalid Review disposition/);

console.log('Canonical capability boundaries preserve authority, canonical constructs, explicit unknowns and member Focus');
