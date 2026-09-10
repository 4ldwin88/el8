import test from 'node:test';
import assert from 'node:assert/strict';
import * as Runtime from '../../app/onboarding/discovery-runtime.js';
import Discovery from './discovery-engine.js';
import {captureDiscoveryRun,restoreDiscoveryRun} from './run-record.js';
import {discoveryOutputToMemberState,memberStateToPrioritizationInput} from '../state/discovery-member-state-adapter.js';
import {toPersistedMemberState,fromPersistedMemberState} from '../state/supabase-persistence.js';
const question=Discovery.BANK.find(q=>q.id==='Q000020');
const current=s=>Runtime.discoveryOutput(s).trace.states.find(x=>x.constructId==='SLEEP_QUALITY');
const defer=s=>Runtime.submitDiscoveryTriage(s,{SLEEP_QUALITY:0});

test('actual runtime scheduling and candidate display cannot re-offer a deferred construct',()=>{
 const s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY']});
 Runtime.answerDiscoveryQuestion(s,question,'A000129');defer(s);s.phase='graph';
 const step=Runtime.nextDiscoveryStep(s),output=Runtime.discoveryOutput(s);
 assert.equal(step.type,'finish','deferral cannot cause another driver/severity/deepening question');
 assert.equal(step.stop.incomplete,true,'deferral is not fabricated completion');
 const node=output.handoff.driverGraph.nodes.find(x=>x.constructId==='SLEEP_QUALITY');
 assert.equal(node.disposition,'deferred');assert.equal(node.status,'supported','member decision is not negative evidence');
 assert.equal(node.evidenceRefs.length,1);assert.deepEqual(output.handoff.rankedHypotheses,[]);
 assert.deepEqual(Runtime.discoveryPriorityCandidates(output),[]);
 // A separate active seed must not reintroduce Sleep through relationship expansion.
 Runtime.answerDiscoveryQuestion(s,Discovery.BANK.find(q=>q.id==='Q000029'),'A000185');
 Runtime.nextDiscoveryStep(s);
 assert.ok(s.orchestration.driverGraph.nodes.some(x=>x.constructId==='PRESSURE_PATTERN'));
 assert.ok(!s.orchestration.driverLandscape.candidates.some(x=>x.constructId==='SLEEP_QUALITY'));
 assert.ok(!s.orchestration.rankedHypotheses.some(x=>x.constructId==='SLEEP_QUALITY'));
 assert.ok(!Runtime.discoveryPriorityCandidates(Runtime.discoveryOutput(s)).some(x=>x.constructId==='SLEEP_QUALITY'));
});

test('focused STATE and UNCERTAINTY answers cannot resume a member-deferred concern',()=>{
 for(const answerId of ['A000129','A000130']){
  const s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY']});defer(s);
  const before=structuredClone(s.observationLog);
  Runtime.answerDiscoveryQuestion(s,question,answerId);
  assert.equal(s.resolutionStates.SLEEP_QUALITY,'deferred');assert.equal(current(s).resolutionState,'deferred');
  assert.deepEqual(s.observationLog.slice(0,before.length),before);assert.equal(s.observationLog.at(-1).answerValue,answerId);
  assert.equal(current(s).negativeEvidence.length,0);assert.equal(current(s).qualitativeConfidence,'UNKNOWN');
  assert.deepEqual(Runtime.discoveryOutput(s).handoff.candidateIds,[]);
 }
});

test('conflicting evidence stays unresolved without erasing deferral through run and Member State reload',()=>{
 const gap={requirementId:'required-context',reason:'Required context unknown'};
 const s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY'],unresolvedRequirements:[gap]});
 Runtime.answerDiscoveryQuestion(s,question,'A000129');Runtime.answerDiscoveryQuestion(s,question,'A000126');defer(s);
 const original=structuredClone(s.observationLog),state=current(s);
 assert.equal(state.resolutionState,'deferred');assert.equal(state.sufficiencyBlocked,true);assert.equal(state.stateEvidence.length,2);
 assert.equal(state.unresolvedReasons[0].code,'conflicting_direct_state');
 const resumed=restoreDiscoveryRun(captureDiscoveryRun(s));assert.deepEqual(current(resumed),state);
 const member=discoveryOutputToMemberState(Runtime.discoveryOutput(resumed),{memberId:'member:deferral'});
 const stored=fromPersistedMemberState(toPersistedMemberState(member));
 assert.equal(stored.constructs.SLEEP_QUALITY.discoveryHandoff.resolutionState,'deferred');
 assert.deepEqual(stored.constructs.SLEEP_QUALITY.unresolvedReasons,state.unresolvedReasons);
 for(const observation of original)assert.deepEqual(stored.facts[`discovery:${observation.id}`].value,observation);
 const input=memberStateToPrioritizationInput(stored);assert.deepEqual(input.candidates,[]);assert.deepEqual(input.blockingRequirements,[gap]);
});

test('explicit member resumption reopens consideration but cannot discharge conflict or Safety',t=>{
 t.mock.method(Date,'now',()=>1789077600000); // Two distinct decisions may share a clock tick.
 const s=Runtime.createDiscoverySession({constructIds:['SLEEP_QUALITY']});
 Runtime.answerDiscoveryQuestion(s,question,'A000129');Runtime.answerDiscoveryQuestion(s,question,'A000126');defer(s);
 assert.equal(current(s).resolutionState,'deferred');
 Discovery.setSafetyContext(s,{explicitSafetyConcern:true},{immediateDanger:false,intent:true,canStaySafe:true});
 Runtime.submitDiscoveryTriage(s,{SLEEP_QUALITY:2});
 assert.equal(current(s).resolutionState,'triaged');assert.equal(current(s).sufficiencyBlocked,true);
 assert.equal(Runtime.discoveryOutput(s).handoff.usable,false);
 assert.equal(Runtime.nextDiscoveryStep(s).type,'safety');
 assert.equal(s.safety.pauseOrdinaryFlow,true);assert.equal(s.observationLog.length,4);
});
