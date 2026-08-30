import test from 'node:test';
import assert from 'node:assert/strict';
import {assertCanonicalActionId,createActionDefinition} from './action-contract.js';

function action(actionId){return {
  actionId,name:'Test action',actionScope:'construct',constructIds:['ACTIVITY_LEVEL'],dimensionIds:['PHYSICAL'],intent:'build',
  instruction:'Do the test action.',intendedOutcome:'Test outcome',rationale:'Test rationale',
  eligibility:{minimumEvidenceRefs:[]},exclusions:{contraindications:[]},burden:{level:'low'},
  measurement:{decisionUse:'test'},review:{trigger:'test',allowedDispositions:['continue']}
}}

test('Drive-canonical Action IDs are accepted',()=>{
  for(const id of ['PHY-A01','EMT-A01','SPT-A03','XDM-A06']) assert.equal(assertCanonicalActionId(id),id);
});

test('legacy Action IDs are rejected rather than normalized',()=>{
  for(const id of ['PHY-001','EMO-001','SPI-003']) assert.throws(()=>assertCanonicalActionId(id),/non-canonical Action ID/);
  assert.throws(()=>createActionDefinition(action('EMO-001')),/non-canonical Action ID/);
});
