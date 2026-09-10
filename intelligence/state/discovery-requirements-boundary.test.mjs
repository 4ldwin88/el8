import test from 'node:test';
import assert from 'node:assert/strict';
import Discovery from '../discovery/discovery-engine.js';
import {discoveryOutputToMemberState,memberStateToPrioritizationInput} from './discovery-member-state-adapter.js';
import {toPersistedMemberState,fromPersistedMemberState} from './supabase-persistence.js';
import {applyMemberStateTransition,MEMBER_STATE_EVENT} from './member-state-transition.js';
const at='2026-09-10T22:00:00.000Z';
const required={requirementId:'current-context',reason:'Required context remains unknown',required:true,evidenceRefs:['e:2','e:1'],provenance:{source:'member',confidence:'unknown'}};
const optional={requirementId:'optional-contributor',reason:'Contributor is not needed for handoff',blocking:false,uncertainty:{direction:'unknown'},evidenceRefs:['u:2','u:1']};
function fixture(requirements){const s=Discovery.session({constructIds:['SLEEP_QUALITY'],unresolvedRequirements:requirements});Discovery.answer(s,Discovery.BANK.find(q=>q.id==='Q000020'),'A000129');return s;}
const project=(trace,existingState)=>discoveryOutputToMemberState(trace,{memberId:'requirements-member',existingState,at});
const reload=state=>fromPersistedMemberState(toPersistedMemberState(state));

test('required gaps survive Member State round trip and prevent a sufficient-construct shortcut',()=>{
 const s=fixture([required,optional]),trace=Discovery.trace(s),state=project(trace),restored=reload(state);
 assert.deepEqual(restored.discoveryRequirements,{runId:s.runId,contractFingerprint:trace.contractFingerprint,unresolvedRequirements:[required,optional]});
 const input=memberStateToPrioritizationInput(restored);assert.deepEqual(input.candidates,[]);assert.equal(input.sufficiency,'insufficient');
 assert.deepEqual(input.unresolvedRequirements,[required,optional]);assert.deepEqual(input.blockingRequirements,[required]);
 assert.equal(restored.constructs.SLEEP_QUALITY.sufficiency,'sufficient','global gap is not fabricated negative construct evidence');
 assert.equal(restored.revision,1,'facts, constructs and requirements form one transition');
});
test('optional uncertainty retains exact order, context and run provenance without blocking',()=>{
 const s=fixture([optional]),trace=Discovery.trace(s),state=project(trace),input=memberStateToPrioritizationInput(reload(state));
 assert.equal(input.candidates.length,1);assert.equal(input.sufficiency,'sufficient');
 assert.deepEqual(input.unresolvedRequirements,[optional]);assert.deepEqual(input.blockingRequirements,[]);
 assert.deepEqual(input.sourceDiscoveryRun,{runId:s.runId,contractFingerprint:trace.contractFingerprint});
 trace.unresolvedRequirements[0].evidenceRefs.reverse();input.unresolvedRequirements[0].reason='caller edit';
 assert.deepEqual(state.discoveryRequirements.unresolvedRequirements,[optional]);
});
test('absent requirements remain unknown; malformed or unclassified gaps cannot masquerade as optional',()=>{
 const trace=Discovery.trace(fixture([]));delete trace.unresolvedRequirements;
 const state=project(trace),stored=reload(state);assert.equal(Object.hasOwn(stored,'discoveryRequirements'),false);
 const unknown=memberStateToPrioritizationInput(stored);assert.deepEqual(unknown.candidates,[]);assert.equal(unknown.sufficiency,'unknown');assert.equal(unknown.unresolvedRequirements,null);
 for(const gap of ['unclassified',null,{blocking:false},{...optional,required:true},{...optional,reason:''}]){
  const input=memberStateToPrioritizationInput(project({...trace,unresolvedRequirements:[gap]}));
  assert.deepEqual(input.candidates,[]);assert.deepEqual(input.unresolvedRequirements,[gap]);assert.deepEqual(input.blockingRequirements,[gap]);
 }
});
test('omission preserves requirements; explicit same-run clearance updates them without rewriting prior state',()=>{
 const s=fixture([required]),trace=Discovery.trace(s),initial=project(trace);
 const partial={states:trace.states};const unchanged=project(partial,initial);
 assert.deepEqual(unchanged.discoveryRequirements,initial.discoveryRequirements);assert.deepEqual(memberStateToPrioritizationInput(unchanged).candidates,[]);
 const next=project({...trace,unresolvedRequirements:[]},unchanged);
 assert.equal(memberStateToPrioritizationInput(next).candidates.length,1);
 assert.deepEqual(initial.discoveryRequirements.unresolvedRequirements,[required]);assert.deepEqual(next.facts,initial.facts);
});
test('malformed or unrelated snapshots cannot replace current requirements at the reducer or mapper',()=>{
 const trace=Discovery.trace(fixture([required])),initial=project(trace),before=structuredClone(initial);
 for(const patch of [{runId:null},{runId:'other'},{runId:'22222222-2222-4222-8222-222222222222'},{contractFingerprint:null},{contractFingerprint:'0'.repeat(64)},{unresolvedRequirements:null},{unresolvedRequirements:{}}]){
  assert.throws(()=>project({...trace,...patch},initial));assert.deepEqual(initial,before);
  assert.throws(()=>applyMemberStateTransition(initial,{type:MEMBER_STATE_EVENT.DISCOVERY_REQUIREMENTS_UPDATED,payload:{...initial.discoveryRequirements,...patch},source:'discovery',at,expectedRevision:initial.revision}));
 }
 for(const patch of [{runId:'22222222-2222-4222-8222-222222222222'},{contractFingerprint:'0'.repeat(64)}]){
  const partial={...trace,...patch};delete partial.unresolvedRequirements;
  assert.throws(()=>project(partial,initial),'omitting requirements cannot bypass an explicit foreign source');
  assert.deepEqual(initial,before);
 }
 const malformed=structuredClone(initial);malformed.discoveryRequirements.unresolvedRequirements=null;
 assert.throws(()=>reload(malformed));assert.throws(()=>memberStateToPrioritizationInput(malformed));
});
