import test from 'node:test';
import assert from 'node:assert/strict';
import Discovery from './discovery-engine.js';
import BANK,{observationsForAnswer} from './observationNormalizer.js';
import {deriveConstructState} from './construct-projection.js';
import {discoveryPrioritizationInput} from '../../app/onboarding/planning-pipeline.js';
const q=id=>BANK.find(q=>q.id===id);
const observe=(id,answer,timestamp)=>observationsForAnswer(q(id),answer,{timestamp});
test('state reports and repeated or contextual evidence cannot manufacture calibrated confidence',()=>{
 const direct=observe('Q000020','A000129',1);
 for(const observations of [direct,[...direct,...observe('Q000020','A000129',2)],[...direct,...observe('Q000021','A000132',3)]]){
  const state=deriveConstructState(observations,'SLEEP_QUALITY');
  assert.equal(state.qualitativeConfidence,'UNKNOWN');
  assert.equal(state.status,'established');
  assert.equal(state.stateEvidence[0].effect.Value,'really_struggling');
 }
});
test('unassessed confidence does not invalidate independently satisfied focused evidence',()=>{
 const s=Discovery.session({constructIds:['SLEEP_QUALITY']});Discovery.answer(s,q('Q000020'),'A000129');
 assert.equal(Discovery.handoff(s).usable,true);
 const out=discoveryPrioritizationInput(s,{memberId:'member:confidence',now:'2026-09-10T00:00:00.000Z'});
 assert.equal(out.prioritizationInput.candidates[0].evidenceConfidence,'UNKNOWN');
 Discovery.answer(s,q('Q000020'),'A000126');
 assert.equal(Discovery.handoff(s).usable,false);
});
