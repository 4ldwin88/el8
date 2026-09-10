import test from 'node:test';
import assert from 'node:assert/strict';
import {handoffAudit} from './sufficiency.js';
import {createDiscoveryOrchestration,nextDiscoveryDecision} from './discovery-orchestrator.js';
import Discovery from './discovery-engine.js';
import {discoveryOutput} from '../../app/onboarding/discovery-runtime.js';
const state={constructId:'SLEEP_QUALITY',status:'supported',resolutionState:'sufficient',qualitativeConfidence:'MODERATE',evidenceRefs:['observation:sleep'],materiality:.5};
const missing={requirementId:'sleep:current-state',constructId:'SLEEP_QUALITY',reason:'current state is unresolved'};
const landscape={ENERGY_FUNCTION:'reject',PRESSURE_PATTERN:'reject',ACTIVITY_LEVEL:'reject',EMOTIONAL_STATE:'reject'};

test('required evidence cannot be resolved by question exhaustion or candidate visibility',()=>{
 const o=createDiscoveryOrchestration({constructStates:[state],questionBank:[],driverSelections:landscape,unresolvedRequirements:[missing]});
 assert.equal(o.readyForPrioritization,false);
 assert.notEqual(nextDiscoveryDecision(o).type,'handoff');
 assert.deepEqual(o.handoff.unresolvedRequirements,[missing]);
 assert.ok(o.handoff.candidateIds.includes('SLEEP_QUALITY'));
});

test('only explicit optional uncertainty may cross with its reason and provenance',()=>{
 const optional={requirementId:'sleep:contributor',constructId:'SLEEP_QUALITY',blocking:false,reason:'Contributor is optional for this direct Sleep handoff',evidenceRefs:['observation:sleep']};
 const audit=handoffAudit([state],{unresolvedRequirements:[optional]});
 assert.equal(audit.usable,true);
 assert.deepEqual(audit.unresolvedRequirements,[optional]);
 assert.equal(audit.boundedUncertainty,true);
 for(const unresolved of [missing,'unclassified gap',{blocking:false}])assert.equal(handoffAudit([state],{unresolvedRequirements:[unresolved]}).usable,false);
});

test('confidence, driver knowledge and specificity cannot satisfy an unresolved concern',()=>{
 const unresolved={...state,resolutionState:'triaged',qualitativeConfidence:'WELL_SUPPORTED',driverKnown:true,specificityFrontier:99};
 for(const options of [{},{allowBoundedUncertainty:true}]){
  const audit=handoffAudit([unresolved],options);
  assert.equal(audit.usable,false);
  assert.deepEqual(audit.candidateIds,['SLEEP_QUALITY']);
  assert.deepEqual(audit.blocking,[unresolved]);
 }
});

test('runtime cannot override unresolved evidence with a stale ready graph flag',()=>{
 const s=Discovery.session({unresolvedRequirements:[missing]});
 s.phase='ready_for_prioritization';
 s.orchestration={readyForPrioritization:true,driverGraph:{nodes:[{constructId:'SLEEP_QUALITY',status:'supported'}]},rankedHypotheses:[]};
 const output=discoveryOutput(s);
 assert.equal(output.handoff.usable,false);
 assert.deepEqual(output.handoff.unresolvedRequirements,[missing]);
});

test('a QA limit stays partial and Safety independently interrupts completion',()=>{
 const s=Discovery.session({outerGuardrail:0});
 const step=Discovery.next(s);
 assert.equal(step.stop.incomplete,true);
 assert.notEqual(s.phase,'ready_for_prioritization');
 assert.equal(discoveryOutput(s).handoff.usable,false);
 const unsafe=Discovery.session({outerGuardrail:0,safetyContextualSignals:{explicitSafetyConcern:true}});
 assert.equal(Discovery.next(unsafe).type,'safety');
 assert.equal(discoveryOutput(unsafe).handoff.usable,false);
});

test('actual direct Sleep evidence does not manufacture a known contributor',()=>{
 const s=Discovery.session({constructIds:['SLEEP_QUALITY']});
 const question=Discovery.BANK.find(q=>q.id==='Q000020');
 Discovery.answer(s,question,'A000129');
 assert.equal(Discovery.trace(s).states[0].resolutionState,'sufficient');
 assert.equal(Discovery.trace(s).states[0].driverKnown,false);
 const uncertain=Discovery.session({constructIds:['SLEEP_QUALITY']});
 Discovery.answer(uncertain,question,'A000130');
 assert.notEqual(Discovery.trace(uncertain).states[0].resolutionState,'sufficient');
});

test('partial completion is re-evaluated after missing evidence is supplied',()=>{
 const s=Discovery.session({constructIds:['SLEEP_QUALITY'],unresolvedRequirements:[missing]});
 const q=Discovery.BANK.find(q=>q.id==='Q000020');
 Discovery.answer(s,q,'A000129');
 s.phase='incomplete';s.incomplete=true;
 assert.equal(discoveryOutput(s).handoff.usable,false);
 s.unresolvedRequirements=[];
 assert.equal(discoveryOutput(s).handoff.usable,true);
});

test('orientation finish cannot bypass a required gap and Safety reaches presentation',async()=>{
 const {discoveryRuntimeState,RUNTIME_STATE}=await import('../../app/resilience/runtime-state.js');
 const baseline=Object.fromEntries(['PHYSICAL','EMOTIONAL','SOCIAL','SPIRITUAL','INTELLECTUAL','OCCUPATIONAL','FINANCIAL','ENVIRONMENTAL'].map(id=>[id,{state:'going_well'}]));
 const s=Discovery.session({baselineCoverage:baseline,unresolvedRequirements:[missing],questionBank:[]});
 assert.equal(Discovery.next(s).stop.incomplete,true);
 assert.equal(discoveryOutput(s).handoff.usable,false);
 const unsafe=Discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});
 assert.equal(discoveryRuntimeState(discoveryOutput(unsafe)).kind,RUNTIME_STATE.SAFETY_INTERRUPT);
});

test('unknown replacement answer cannot leave prior direct state sufficient',()=>{
 const s=Discovery.session({constructIds:['SLEEP_QUALITY']}),q=Discovery.BANK.find(q=>q.id==='Q000020');
 Discovery.answer(s,q,'A000129');
 Discovery.answer(s,q,'A000130');
 assert.equal(discoveryOutput(s).handoff.usable,false);
 assert.equal(Discovery.trace(s).observations.length,2,'both source observations remain');
});

test('orientation coverage requires distinct governed dimensions and valid state values',async()=>{
 const {orientationCoverageComplete}=await import('./sufficiency.js');
 const ids=['physical','emotional','social','spiritual','intellectual','occupational','financial','environmental'];
 const valid=ids.map(dimensionId=>({dimensionId,state:'unknown'}));
 assert.equal(orientationCoverageComplete(valid),true);
 assert.equal(orientationCoverageComplete(valid.slice(1)),false);
 assert.equal(orientationCoverageComplete([...valid,valid[0]]),false);
 assert.equal(orientationCoverageComplete(valid.map(x=>({...x,state:'invented healthy'}))),false);
});

test('graph adapters cannot default missing member confidence or sufficiency',async()=>{
 const {discoveryPriorityCandidates}=await import('../../app/onboarding/discovery-runtime.js');
 const graph={handoff:{driverGraph:{nodes:[{constructId:'SLEEP_QUALITY',status:'supported'}]}}};
 const c=discoveryPriorityCandidates(graph)[0];
 assert.equal(c.qualitativeConfidence,'UNKNOWN');
 assert.notEqual(c.resolutionState,'sufficient');
 assert.notEqual(c.evidenceSupport,'sufficient');
});
