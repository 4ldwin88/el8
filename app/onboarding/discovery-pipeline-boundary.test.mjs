import test from 'node:test';
import assert from 'node:assert/strict';
import Discovery from '../../intelligence/discovery/discovery-engine.js';
import BANK from '../../intelligence/discovery/observationNormalizer.js';
import {createDiscoveryFromSnapshot,discoveryPrioritizationInput} from './planning-pipeline.js';
import {fromPersistedMemberState,toPersistedMemberState} from '../../intelligence/state/supabase-persistence.js';
const question=BANK.find(q=>q.id==='Q000020');
const options={memberId:'member:pipeline',now:'2026-09-10T00:00:00.000Z'};
function answered(){const s=Discovery.session({constructIds:['SLEEP_QUALITY']});Discovery.answer(s,question,'A000129');return s;}
test('actual onboarding handoff persists every captured observation with referentially intact evidence',()=>{
 const s=answered(),out=discoveryPrioritizationInput(s,options);
 const restored=fromPersistedMemberState(JSON.parse(JSON.stringify(toPersistedMemberState(out.memberState))));
 assert.equal(Object.keys(restored.facts).length,s.observationLog.length);
 for(const observation of s.observationLog)assert.deepEqual(restored.facts[`discovery:${observation.id}`].value,observation);
 for(const c of out.prioritizationInput.candidates)for(const ref of c.evidenceRefs)assert.ok(restored.facts[ref]);
});
test('the production pipeline cannot bypass required gaps, conflicting reports or Safety',()=>{
 const required=answered();required.unresolvedRequirements=[{requirementId:'required:1',reason:'Required distinction remains unresolved'}];
 const conflict=answered();Discovery.answer(conflict,question,'A000126');
 const safety=answered();safety.safety={pauseOrdinaryFlow:true};
 for(const s of [required,conflict,safety]){
  const before=structuredClone(s.observationLog);
  assert.throws(()=>discoveryPrioritizationInput(s,options),/Discovery.*incomplete|Safety/i);
  assert.deepEqual(s.observationLog,before);
 }
});
test('snapshot adaptation cannot invent a production question maximum',()=>{
 const snapshot={candidateConstructIds:['SLEEP_QUALITY'],uncertainty:{requiresDiscoveryConfirmation:true}};
 assert.equal(createDiscoveryFromSnapshot(snapshot).outerGuardrail,null);
 assert.equal(createDiscoveryFromSnapshot(snapshot,{outerGuardrail:4}).outerGuardrail,4);
});
