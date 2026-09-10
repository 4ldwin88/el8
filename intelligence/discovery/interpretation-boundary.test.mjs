import test from 'node:test';
import assert from 'node:assert/strict';
import Discovery from './discovery-engine.js';
import {deriveConstructState} from './construct-projection.js';
import BANK,{observationsForAnswer} from './observationNormalizer.js';
const q=id=>BANK.find(q=>q.id===id);
const observed=(id,answer,timestamp=1)=>observationsForAnswer(q(id),answer,{timestamp});

test('direct state values survive the derived construct view without additive confidence',()=>{
 const well=deriveConstructState(observed('Q000020','A000126'),'SLEEP_QUALITY');
 const poor=deriveConstructState(observed('Q000020','A000129'),'SLEEP_QUALITY');
 assert.equal(well.stateEvidence[0].effect.Value,'very_well');
 assert.equal(poor.stateEvidence[0].effect.Value,'really_struggling');
 for(const s of [well,poor])for(const key of ['rawEvidenceScore','experimentalQuantitativeConfidence','evidenceConfidence'])assert.equal(Object.hasOwn(s,key),false,key);
});

test('context and contributor reports cannot establish a condition or causal edge',()=>{
 const context=deriveConstructState(observed('Q000021','A000135'),'SLEEP_QUALITY');
 assert.equal(context.status,'unknown');
 const relationship=deriveConstructState(observed('Q000021','A000132'),'SLEEP_QUALITY');
 assert.equal(relationship.status,'unknown');
 assert.equal(relationship.relationships[0].kind,'member_reported_hypothesis');
 assert.equal(relationship.relationships[0].confidence,'unknown');
 assert.equal(relationship.relationships[0].direction,'unknown');
 assert.equal(relationship.relationships[0].effect.Value,'stress_thoughts');
 assert.ok(relationship.relationships[0].evidenceRefs.length);
});

test('conflicting direct reports remain unresolved rather than averaged or voted away',()=>{
 const s=Discovery.session({constructIds:['SLEEP_QUALITY']});
 Discovery.answer(s,q('Q000020'),'A000126');
 Discovery.answer(s,q('Q000020'),'A000129');
 const state=Discovery.trace(s).states[0];
 assert.notEqual(state.resolutionState,'sufficient');
 assert.ok(state.unresolvedReasons.length);
 assert.equal(state.stateEvidence.length,2);
 assert.equal(Discovery.handoff(s).usable,false);
});

test('retired generic support cannot be reinterpreted as current governed evidence',()=>{
 const old={id:'old:1',questionId:'Q000020',constructId:'SLEEP_QUALITY',effects:[{type:'evidence',polarity:'supports',target:'SLEEP_QUALITY',strength:1,certainty:'definitive',sourceType:'direct'}]};
 assert.throws(()=>deriveConstructState([old],'SLEEP_QUALITY'),/obsolete|reacquisition|migration/i);
});

import {discoveryOutputToMemberState,memberStateToPrioritizationInput} from '../state/discovery-member-state-adapter.js';
import {toPersistedMemberState,fromPersistedMemberState} from '../state/supabase-persistence.js';
import {projectDriverGraph} from './driver-graph.js';
const persist=state=>fromPersistedMemberState(JSON.parse(JSON.stringify(toPersistedMemberState(state))));
test('categorical values, uncertainty and contributor provenance survive the actual Member State mapper and storage',()=>{
 const observations=[...observed('Q000020','A000129'),...observed('Q000021','A000132',2),...observed('Q000020','A000130',3)];
 const derived=deriveConstructState(observations,'SLEEP_QUALITY');
 assert.equal(derived.sufficiencyBlocked,true);
 const state=discoveryOutputToMemberState({observations,states:[{...derived,resolutionState:'triaged'}]},{memberId:'member:interpretation',at:'2026-09-10T00:00:00.000Z'});
 const stored=persist(state),construct=stored.constructs.SLEEP_QUALITY;
 assert.deepEqual(stored,state);
 assert.deepEqual(construct.stateEvidence,derived.stateEvidence);
 assert.deepEqual(construct.relationships,derived.relationships);
 assert.deepEqual(construct.uncertaintyEvidence,derived.uncertaintyEvidence);
 for(const ref of construct.provenanceRefs)assert.ok(stored.facts[ref]);
 assert.equal(memberStateToPrioritizationInput(stored).candidates.length,0);
});
test('repeated categorical reports cannot accumulate confidence or vote away conflicts',()=>{
 const one=deriveConstructState(observed('Q000020','A000129'),'SLEEP_QUALITY');
 const repetitions=Array.from({length:20},(_,i)=>observed('Q000020','A000129',i)).flat();
 const repeated=deriveConstructState(repetitions,'SLEEP_QUALITY');
 assert.equal(repeated.qualitativeConfidence,one.qualitativeConfidence);
 assert.equal(repeated.sufficiencyBlocked,false);
 const conflict=deriveConstructState([...repetitions,...observed('Q000020','A000126',30)],'SLEEP_QUALITY');
 assert.equal(conflict.sufficiencyBlocked,true);
 assert.equal(conflict.stateEvidence.length,21);
});
test('context references never become supported graph nodes',()=>{
 const context=deriveConstructState(observed('Q000021','A000135'),'SLEEP_QUALITY');
 const graph=projectDriverGraph({constructStates:[context]});
 assert.equal(graph.nodes[0].status,'plausible');
 assert.deepEqual(graph.nodes[0].evidenceRefs,[]);
 assert.ok(graph.nodes[0].provenanceRefs.length);
});
test('projection uses the immutable captured source and does not mutate or reinterpret its labels',()=>{
 const observations=observed('Q000020','A000129');
 observations[0].registryEvidence.effects[0].Value='captured-historical-category';
 const before=structuredClone(observations);
 const state=deriveConstructState(observations,'SLEEP_QUALITY');
 assert.equal(state.stateEvidence[0].effect.Value,'captured-historical-category');
 state.stateEvidence[0].effect.Value='view mutation';
 assert.deepEqual(observations,before);
});
