import test from 'node:test';
import assert from 'node:assert/strict';
import { seedCanonicalQaPlan, applyQaReviewToBrowserState } from '../../intelligence/state/browser-qa-adapter.mjs';
import { applyMemberStateTransition, MEMBER_STATE_EVENT } from '../../intelligence/state/member-state-transition.js';

const AT='2026-09-01T12:00:00.000Z';
const seed=()=>seedCanonicalQaPlan({memberId:'TQA-E03',constructId:'ACTIVITY_LEVEL',actionId:'ACT000002',at:AT});

function normalized(state){
  return JSON.parse(JSON.stringify(state));
}

test('E02 QA simulation remains explicitly provenance-marked and cannot masquerade as member evidence',()=>{
  const initial=seed();
  const review={decision:'keep',reason:'qa deterministic fixture'};
  const route={route:'continue',preservePlan:true};
  const result=applyQaReviewToBrowserState(initial,{scenario:{id:'e02-isolation'},review,route,at:AT});
  const qaFacts=result.facts.filter(f=>String(f.sourceType)==='qa_simulation');
  assert.equal(qaFacts.length,1);
  assert.equal(qaFacts[0].memberConfirmed,false);
  assert.match(qaFacts[0].sourceRef,/^e02-/);
  assert.ok(result.historyRefs.some(ref=>String(ref).includes('qa.review')));
});

test('E02 ordinary Member State transitions reject stale QA revision writes',()=>{
  const initial=seed();
  assert.throws(()=>applyMemberStateTransition(initial,{type:MEMBER_STATE_EVENT.FACT_RECORDED,payload:{factId:'qa:stale',semanticKey:'qa.stale',value:true,sourceType:'qa_simulation',sourceRef:'e02',observedAt:AT,memberConfirmed:false,currentStatus:'current'},source:'qa.test',at:AT,expectedRevision:initial.revision-1}));
});

test('E03 reset returns the exact canonical fixture without retaining prior-run mutation',()=>{
  const pristine=seed();
  const mutated=applyQaReviewToBrowserState(pristine,{scenario:{id:'e03-mutate'},review:{decision:'keep',reason:'mutation'},route:{route:'continue'},at:AT});
  assert.notDeepEqual(normalized(mutated),normalized(seed()));
  const reset=seed();
  assert.deepEqual(normalized(reset),normalized(seed()));
  assert.equal(reset.facts.some(f=>f.semanticKey==='qa.review.e03-mutate'),false);
  assert.equal(reset.reviewCycles.length,0);
});

test('E03 deterministic replay produces byte-equivalent canonical state for the same fixture and inputs',()=>{
  const run=()=>applyQaReviewToBrowserState(seed(),{scenario:{id:'e03-replay'},review:{decision:'keep',reason:'deterministic'},route:{route:'continue',preservePlan:true},at:AT});
  assert.deepEqual(normalized(run()),normalized(run()));
});

test('E03 duplicate replay from the same stale snapshot cannot silently overwrite the advanced state',()=>{
  const initial=seed();
  const first=applyMemberStateTransition(initial,{type:MEMBER_STATE_EVENT.FACT_RECORDED,payload:{factId:'qa:dup',semanticKey:'qa.duplicate',value:1,sourceType:'qa_simulation',sourceRef:'e03',observedAt:AT,memberConfirmed:false,currentStatus:'current'},source:'qa.test',at:AT,expectedRevision:initial.revision});
  assert.equal(first.revision,initial.revision+1);
  assert.throws(()=>applyMemberStateTransition(first,{type:MEMBER_STATE_EVENT.FACT_RECORDED,payload:{factId:'qa:dup2',semanticKey:'qa.duplicate',value:2,sourceType:'qa_simulation',sourceRef:'e03',observedAt:AT,memberConfirmed:false,currentStatus:'current'},source:'qa.test',at:AT,expectedRevision:initial.revision}));
});
