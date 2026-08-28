import test from 'node:test';
import assert from 'node:assert/strict';
import { discoveryPriorityCandidates } from './discovery-runtime.js';

function output(confidences){
  return {
    trace:{states:confidences.map(([concernId,evidenceConfidence],index)=>({concernId,evidenceConfidence,memberImportance:index===0?2:1,resolutionState:'supported'}))},
    plan:{focus:confidences.map(([concernId,evidenceConfidence])=>({concernId,evidenceConfidence,label:concernId}))}
  };
}

test('priority candidates expose qualitative evidence support while retaining internal confidence',()=>{
  const candidates=discoveryPriorityCandidates(output([['strong_case',.8],['sufficient_case',.6],['limited_case',.4]]));
  const byId=Object.fromEntries(candidates.map(candidate=>[candidate.concernId,candidate]));
  assert.equal(byId.strong_case.evidenceSupport,'strong');
  assert.equal(byId.sufficient_case.evidenceSupport,'sufficient');
  assert.equal(byId.limited_case.evidenceSupport,'limited');
  assert.equal(byId.strong_case.evidenceConfidence,.8);
});
