import test from 'node:test';
import assert from 'node:assert/strict';
import BANK,{observationsForAnswer} from '../discovery/observationNormalizer.js';
import {ALL_EFFECTS,isExecutableEffect} from '../registries/registry.js';
import {discoveryOutputToMemberState} from './discovery-member-state-adapter.js';
import {toPersistedMemberState,fromPersistedMemberState} from './supabase-persistence.js';
const question=BANK.find(q=>q.id==='Q000056');
const options={memberId:'member:recall',at:'2026-09-10T00:00:00.000Z'};
const roundTrip=state=>fromPersistedMemberState(JSON.parse(JSON.stringify(toPersistedMemberState(state))));
test('new Financial state carries the approved 30-day period through actual acquisition and storage',()=>{
 assert.match(question.text,/past 30 days/);
 for(const [answerId,value] of [['A000375','never'],['A000376','rarely'],['A000377','sometimes'],['A000378','often'],['A000379','almost_always']]){
  const observations=observationsForAnswer(question,answerId,{timestamp:1});
  const state=roundTrip(discoveryOutputToMemberState({states:[],observations},options));
  const source=Object.values(state.facts)[0].value.registryEvidence;
  assert.match(source.question.Question,/past 30 days/);
  assert.equal(source.effects[0].Key,'money_pressure_frequency_30d');
  assert.equal(source.effects[0].Value,value);
 }
 assert.equal(ALL_EFFECTS.filter(isExecutableEffect).some(e=>e.Key==='money_pressure_frequency_7d'),false);
});
test('Financial unknown stays uncertainty, and historical keys are never rewritten on read',()=>{
 const unknown=observationsForAnswer(question,'A000380',{timestamp:1});
 assert.equal(unknown[0].registryEvidence.effects.some(e=>e['Effect Type']==='STATE'),false);
 const historical=structuredClone(observationsForAnswer(question,'A000375',{timestamp:1}));
 historical[0].registryEvidence.effects[0].Key='money_pressure_frequency_7d';
 const accepted=discoveryOutputToMemberState({states:[],observations:historical},options);
 assert.deepEqual(roundTrip(accepted),accepted);
 assert.equal(Object.values(roundTrip(accepted).facts)[0].value.registryEvidence.effects[0].Key,'money_pressure_frequency_7d');
});
