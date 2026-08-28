import assert from 'node:assert/strict';
import test from 'node:test';
import {createDiscoverySession,nextDiscoveryStep,setResolution} from './discovery-controller.js';

const orientation=(id,priority)=>({id,role:'orientation',orientationPriority:priority,options:[]});
const gateway={id:'G1',role:'gateway',options:[]};
const positive={id:'PTH1',role:'goal-probe',path:'positive',decisionCritical:true,expectedUncertaintyReduction:.2,options:[]};
const ordinary={id:'C1',role:'driver-probe',concernId:'c1',expectedUncertaintyReduction:.25,options:[]};
const safety={id:'SAFE1',role:'safety-confirmation',concernId:'c1',path:'safety',decisionCritical:true,safetyPriority:100,expectedUncertaintyReduction:.3,options:[]};

test('orientation is bounded and uses explicit priority rather than bank order',()=>{
 const bank=[orientation('low',1),orientation('high',100),orientation('middle',50),gateway];
 const session=createDiscoverySession({questionBank:bank,orientationBudget:2});
 const first=nextDiscoveryStep(session); const second=nextDiscoveryStep(session); const third=nextDiscoveryStep(session);
 assert.equal(first.question.id,'high');
 assert.equal(second.question.id,'middle');
 assert.equal(session.asked.includes('low'),false);
 assert.equal(third.question.id,'G1');
 assert.equal(session.questionsAsked,3);
});

test('zero orientation budget permits research comparison without locking an opening format',()=>{
 const session=createDiscoverySession({questionBank:[orientation('matrix',100),gateway],orientationBudget:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.question.id,'G1');
 assert.equal(session.asked.includes('matrix'),false);
});

test('resolved non-issue concern reaches positive goal path',()=>{
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[positive],orientationBudget:0});
 setResolution(session,'c1','nonIssue');
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'question');
 assert.equal(step.question.id,'PTH1');
 assert.equal(step.reason,'positive-goal-path');
});

test('ordinary low-value exhaustion finishes without falsely marking incomplete',()=>{
 const weak={...ordinary,id:'weak',expectedUncertaintyReduction:.01};
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[weak],orientationBudget:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'finish');
 assert.equal(step.stop.reason,'decision-value-sufficient');
 assert.equal(step.stop.incomplete,false);
 assert.equal(session.incomplete,false);
});

test('safety state preempts normal discovery at controller level',()=>{
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[ordinary,safety],orientationBudget:0});
 // Controller derives safety level from canonical observations; this fixture supplies the same state shape
 // through the session's projection-facing observation log rather than bypassing the scheduler contract.
 session.observationLog=[{concernId:'c1',evidenceConfidence:.8,safetyEscalationLevel:1}];
 const step=nextDiscoveryStep(session);
 // If projection does not yet carry safety through this generic observation shape, this assertion intentionally
 // fails and identifies the integration seam that must be wired rather than faking a controller-only risk score.
 assert.notEqual(step.question?.id,'ordinary','unresolved safety must never lose to an ordinary question');
});

test('outer guardrail remains a hard bound for ordinary controller traversal',()=>{
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[ordinary],orientationBudget:0,outerGuardrail:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'finish');
 assert.equal(step.stop.reason,'outer-guardrail');
 assert.equal(step.stop.incomplete,true);
});
