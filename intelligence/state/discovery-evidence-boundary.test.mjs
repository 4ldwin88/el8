import test from 'node:test';
import assert from 'node:assert/strict';
import Discovery from '../discovery/discovery-engine.js';
import BANK,{observationsForAnswer} from '../discovery/observationNormalizer.js';
import {ALL_QUESTIONS,getAnswer,getEffectsForAnswer,isExecutableEffect} from '../registries/registry.js';
import {discoveryOutputToMemberState} from './discovery-member-state-adapter.js';
import {createMemberState} from './member-state-contract.js';
import {fromPersistedMemberState,toPersistedMemberState} from './supabase-persistence.js';

const at='2026-09-10T00:00:00.000Z', memberId='member:evidence';
const question=id=>BANK.find(q=>q.id===id);
function output(answerId){const s=Discovery.session({constructIds:['SLEEP_QUALITY']});Discovery.answer(s,question('Q000020'),answerId);return Discovery.trace(s);}
const project=o=>discoveryOutputToMemberState(o,{memberId,at});

test('opposite actual Sleep answers remain distinguishable through Member State storage',()=>{
 const well=project(output('A000126')),poor=project(output('A000129'));
 assert.notDeepEqual(well,poor);
 for(const [state,answerId] of [[well,'A000126'],[poor,'A000129']]){
  const reloaded=fromPersistedMemberState(JSON.parse(JSON.stringify(toPersistedMemberState(state))));
  const facts=Object.values(reloaded.facts);
  assert.equal(facts.length,1);
  assert.equal(facts[0].value.answerValue,answerId);
  assert.equal(facts[0].value.registryEvidence.effects[0].Value,answerId==='A000126'?'very_well':'really_struggling');
  assert.equal(facts[0].reliability,'unknown');
 }
});

test('all current answer mappings retain exact selected registry evidence without lookup on read',()=>{
 for(const q of BANK)for(const option of q.options){
  const observation=observationsForAnswer(q,option.id,{timestamp:1})[0];
  assert.ok(observation,option.id);
  assert.deepEqual(observation.registryEvidence,{question:ALL_QUESTIONS.find(r=>r['Question ID']===q.id),answer:getAnswer(option.id),effects:getEffectsForAnswer(option.id).filter(isExecutableEffect)},option.id);
 }
});

test('relationship, uncertainty and non-construct targets survive as reported evidence without creating causal facts',()=>{
 const observations=[['Q000021','A000132'],['Q000020','A000130'],['Q000019','A000119']].flatMap(([id,answer])=>observationsForAnswer(question(id),answer,{timestamp:1}));
 const state=project({states:[],observations});
 assert.deepEqual(state.constructs,{});
 assert.deepEqual(state.hypotheses,{});
 assert.equal(Object.keys(state.facts).length,3);
 const values=Object.values(state.facts).map(f=>f.value.registryEvidence.effects[0]);
 assert.deepEqual(values.map(v=>v['Effect Type']),['RELATIONSHIP','UNCERTAINTY','CONSTRAINT']);
 assert.equal(values[0].Value,'stress_thoughts');
 assert.equal(values[2]['Target ID / Construct'],'PHYSICAL_PLAN');
});

test('multi-observation projection is one revision and retains event order and immutable evidence',()=>{
 const initial=createMemberState({memberId,now:at});
 const observations=['A000126','A000129'].flatMap(a=>observationsForAnswer(question('Q000020'),a,{timestamp:1}));
 const state=discoveryOutputToMemberState({states:[],observations},{existingState:initial,memberId,at});
 assert.equal(state.revision,1);
 assert.equal(initial.revision,0);
 assert.deepEqual(initial.facts,{});
 assert.equal(state.historyRefs.length,2);
 assert.ok(state.historyRefs.every(ref=>ref.startsWith('1:')));
 assert.deepEqual(Object.values(state.facts).map(f=>f.value.answerValue),['A000126','A000129']);
 const reordered=JSON.parse(JSON.stringify(state), (key,value)=>value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).reverse()):value);
 assert.doesNotThrow(()=>discoveryOutputToMemberState({states:[],observations},{existingState:reordered,memberId,at}));
 const altered=structuredClone(observations);altered[1].answerValue='A000128';
 assert.throws(()=>discoveryOutputToMemberState({states:[],observations:altered},{existingState:state,memberId,at}),/immutable/);
 assert.deepEqual(Object.values(state.facts).map(f=>f.value.answerValue),['A000126','A000129']);
});

test('invalid later projection event leaves predecessor untouched',()=>{
 const initial=createMemberState({memberId,now:at}),before=structuredClone(initial);
 const observations=observationsForAnswer(question('Q000020'),'A000126',{timestamp:1});
 assert.throws(()=>discoveryOutputToMemberState({observations,states:[{constructId:'NOT_A_CONSTRUCT',status:'supported',resolutionState:'sufficient'}]},{existingState:initial,memberId,at}),/Unknown constructId/);
 assert.deepEqual(initial,before);
});
