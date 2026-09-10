import test from 'node:test';
import assert from 'node:assert/strict';
import * as Runtime from '../../app/onboarding/discovery-runtime.js';
import Discovery from './discovery-engine.js';
import {captureDiscoveryRun,restoreDiscoveryRun} from './run-record.js';
import {discoveryOutputToMemberState,memberStateToPrioritizationInput} from '../state/discovery-member-state-adapter.js';
const q=Discovery.BANK.find(q=>q.id==='Q000020');
const ID='11111111-1111-4111-8111-111111111111', ID2='22222222-2222-4222-8222-222222222222';
function fixture(){const s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY']});Runtime.answerDiscoveryQuestion(s,q,'A000129');return s;}
function command(s,answerId='A000126',correctionId=ID){return {observationId:s.observationLog.at(-1).id,answerId,correctionId,timestamp:Date.now()+1000};}
const current=s=>Runtime.discoveryOutput(s).trace.states.find(x=>x.constructId==='SLEEP_QUALITY');

test('explicit correction replaces current evidence but preserves old facts and independent contradictions',()=>{
 const s=fixture(),old=structuredClone(s.observationLog),initial=discoveryOutputToMemberState(Runtime.discoveryOutput(s),{memberId:'correction-member'});
 Runtime.correctDiscoveryAnswer(s,command(s));
 assert.deepEqual(s.observationLog.slice(0,1),old);
 assert.equal(s.observationLog[1].supersedesObservationId,old[0].id);
 assert.equal(current(s).stateEvidence.length,1);assert.equal(current(s).sufficiencyBlocked,false);
 assert.deepEqual(current(s).evidenceRefs,[`discovery:${ID}`]);
 assert.ok(current(s).provenanceRefs.includes(`discovery:${old[0].id}`));
 const updated=discoveryOutputToMemberState(Runtime.discoveryOutput(s),{existingState:initial});
 assert.deepEqual(updated.facts[`discovery:${old[0].id}`],initial.facts[`discovery:${old[0].id}`]);
 assert.equal(updated.facts[`discovery:${ID}`].value.supersedesObservationId,old[0].id);
 assert.deepEqual(memberStateToPrioritizationInput(updated).candidates[0].evidenceRefs,[`discovery:${ID}`]);
 Runtime.answerDiscoveryQuestion(s,q,'A000128');
 assert.equal(current(s).sufficiencyBlocked,true,'a later independent answer is not an implicit correction');
});

test('unknown correction reopens sufficiency, clears cached decisions, preserves Safety and resumes losslessly',()=>{
 const s=fixture();s.phase='ready_for_prioritization';s.orchestration={stale:'decision'};
 Discovery.setSafetyContext(s,{explicitSafetyConcern:true},{immediateDanger:false,intent:true,canStaySafe:true});
 const safety=structuredClone(s.safety),c=command(s,'A000130');
 Runtime.correctDiscoveryAnswer(s,c);
 assert.equal(current(s).status,'unknown');assert.equal(current(s).resolutionState,'triaged');
 assert.equal(current(s).uncertaintyEvidence.length,1);assert.equal(current(s).qualitativeConfidence,'UNKNOWN');
 assert.equal(s.orchestration,undefined);assert.equal(s.phase,'graph');assert.equal(s.incomplete,true);
 assert.deepEqual(s.safety,safety);
 assert.equal(Runtime.nextDiscoveryStep(s).type,'safety','ordinary correction must not clear a Safety interruption');
 const resumed=restoreDiscoveryRun(captureDiscoveryRun(s));assert.deepEqual(current(resumed),current(s));
 assert.deepEqual(resumed.observationLog,s.observationLog);
 Runtime.correctDiscoveryAnswer(resumed,command(resumed,'A000127',ID2));
 assert.equal(current(resumed).stateEvidence.length,1);assert.equal(current(resumed).uncertaintyEvidence.length,0);
 assert.equal(current(resumed).provenanceRefs.length,3);
});

test('correction is idempotent and cannot erase an independent member deferral',()=>{
 const s=fixture(),c=command(s);Discovery.triage(s,{SLEEP_QUALITY:0});
 const decision=structuredClone(s.observationLog.at(-1));
 Runtime.correctDiscoveryAnswer(s,c);const accepted=captureDiscoveryRun(s);
 Runtime.correctDiscoveryAnswer(s,c);assert.deepEqual(captureDiscoveryRun(s),accepted);
 assert.equal(current(s).resolutionState,'deferred');
 assert.deepEqual(s.observationLog.find(o=>o.id===decision.id),decision);
 Runtime.correctDiscoveryAnswer(s,command(s,'A000128',ID2));const later=captureDiscoveryRun(s);
 Runtime.correctDiscoveryAnswer(s,c);assert.deepEqual(captureDiscoveryRun(s),later,'old exact retry cannot undo a later correction');
});

test('invalid correction commands fail before changing any session field',()=>{
 const s=fixture(),c=command(s);Runtime.correctDiscoveryAnswer(s,c);
 for(const bad of [{...c,answerId:'A000128'}, {...c,correctionId:ID2},
  {...command(s),observationId:'foreign'}, {...command(s),answerId:'A000375'},
  {...command(s),answerId:['A000126','A000127']}, {...command(s),correctionId:'bad'},
  {...command(s),timestamp:NaN}, {...command(s),timestamp:1e30}, {...command(s),timestamp:0}]){
  const before=captureDiscoveryRun(s);assert.throws(()=>Runtime.correctDiscoveryAnswer(s,bad));assert.deepEqual(captureDiscoveryRun(s),before);
 }
 for(const questionId of ['Q000001','Q000034']){
  const unsupported=Runtime.createDiscoverySession(),question=Discovery.BANK.find(q=>q.id===questionId);
  Runtime.answerDiscoveryQuestion(unsupported,question,question.options[0].id);
  const before=captureDiscoveryRun(unsupported);assert.throws(()=>Runtime.correctDiscoveryAnswer(unsupported,command(unsupported,question.options[1].id)),/focused/);assert.deepEqual(captureDiscoveryRun(unsupported),before);
 }
 Discovery.complete(s);const before=captureDiscoveryRun(s);assert.throws(()=>Runtime.correctDiscoveryAnswer(s,command(s,'A000127',ID2)),/completed/i);assert.deepEqual(captureDiscoveryRun(s),before);
});

test('explicit resume and projection reject broken correction links rather than guessing history',()=>{
 const s=fixture();Runtime.correctDiscoveryAnswer(s,command(s));const record=captureDiscoveryRun(s);
 for(const change of [
  r=>r.session.observationLog[1].supersedesObservationId='foreign',
  r=>r.session.observationLog[1].supersedesObservationId=ID,
  r=>r.session.observationLog[1].questionId='Q000056',
  r=>r.session.observationLog[1].registryEvidence.effects[0]['Target ID / Construct']='FINANCIAL_STRAIN',
  r=>r.session.observationLog[1].registryEvidence.answer['Parent Question ID']='Q000056',
  r=>r.session.observationLog.push({...r.session.observationLog[1],id:ID2}),
  r=>r.session.observationLog[1].id=r.session.observationLog[0].id
 ]){
  const bad=structuredClone(record);change(bad);
  assert.throws(()=>restoreDiscoveryRun(bad),/observation|correction/i);
  assert.throws(()=>Discovery.trace({...bad.session,questionBank:Discovery.BANK}),/observation|correction/i);
 }
});
