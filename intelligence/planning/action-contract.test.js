import test from 'node:test';
import assert from 'node:assert/strict';
import {assertGovernedActionId,createActionDefinition} from './action-contract.js';

function action(actionId){return {
  actionId,name:'Test action',actionScope:'construct',constructIds:['ACTIVITY_LEVEL'],dimensionIds:['physical'],intent:'build',
  instruction:'Do the test action.',intendedOutcome:'Test outcome',rationale:'Test rationale',
  eligibility:{minimumEvidenceRefs:[]},exclusions:{contraindications:[]},burden:{level:'low'},
  measurement:{decisionUse:'test'},review:{trigger:'test',allowedDispositions:['continue']}
}}

test('governed permanent Action IDs are accepted',()=>{
  for(const id of ['ACT000001','ACT000008','ACT000031','ACT000041']) assert.equal(assertGovernedActionId(id),id);
});

test('legacy Action aliases are rejected rather than normalized',()=>{
  for(const id of ['PHY-A01','EMT-A01','SPT-A03','XDM-A06','PHY-001','EMO-001','SPI-003']) assert.throws(()=>assertGovernedActionId(id),/non-governed Action ID/);
  assert.throws(()=>createActionDefinition(action('EMO-001')),/non-governed Action ID/);
});
