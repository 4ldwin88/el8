import assert from 'node:assert/strict';
import test from 'node:test';
import {createDiscoverySession,nextDiscoveryStep,setResolution} from './discovery-controller.js';

const orientation=(id,priority)=>({id,role:'orientation',openingPriority:priority,options:[]});
const gateway={id:'G1',role:'gateway',gatewayEligible:true,options:[]};
const positive={id:'PTH1',role:'goal-probe',path:'positive',decisionCritical:true,expectedUncertaintyReduction:.2,options:[]};
const ordinary={id:'C1',role:'driver-probe',concernId:'c1',expectedUncertaintyReduction:.25,options:[]};

test('explicit orientation limit is bounded and uses opening priority rather than bank order',()=>{
 const bank=[orientation('low',1),orientation('high',100),orientation('middle',50),gateway];
 const session=createDiscoverySession({questionBank:bank,orientationLimit:2});
 const first=nextDiscoveryStep(session); const second=nextDiscoveryStep(session); const third=nextDiscoveryStep(session);
 assert.equal(first.question.id,'high');
 assert.equal(second.question.id,'middle');
 assert.equal(session.asked.includes('low'),false);
 assert.equal(third.question.id,'G1');
 assert.equal(third.reason,'gateway-candidate');
 assert.equal(session.questionsAsked,3);
});

test('zero orientation limit permits sequence research without locking an opening format',()=>{
 const session=createDiscoverySession({questionBank:[orientation('matrix',100),gateway],orientationLimit:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.question.id,'G1');
 assert.equal(session.asked.includes('matrix'),false);
});

test('gateway is not mandatory unless explicitly eligible',()=>{
 const session=createDiscoverySession({questionBank:[orientation('opening',100),{...gateway,gatewayEligible:false}],orientationLimit:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'finish');
 assert.equal(step.stop.reason,'no-material-concern-established');
 assert.equal(step.stop.incomplete,true);
});

test('resolved non-issue concern reaches positive goal path before sufficiency closes Discovery',()=>{
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[positive],orientationLimit:0});
 setResolution(session,'c1','nonIssue');
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'question');
 assert.equal(step.question.id,'PTH1');
 assert.equal(step.reason,'positive-goal-path');
});

test('unknown concern state is not treated as a positive-path non-issue',()=>{
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[positive,ordinary],orientationLimit:0});
 const step=nextDiscoveryStep(session);
 assert.notEqual(step.reason,'positive-goal-path');
 assert.notEqual(step.question?.id,'PTH1');
});

test('ordinary low-value exhaustion finishes without falsely marking incomplete',()=>{
 const weak={...ordinary,id:'weak',expectedUncertaintyReduction:.01};
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[weak],orientationLimit:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'finish');
 assert.equal(step.stop.reason,'decision-value-sufficient');
 assert.equal(step.stop.incomplete,false);
 assert.equal(session.incomplete,false);
});

test('outer guardrail remains a hard bound for ordinary controller traversal',()=>{
 const session=createDiscoverySession({concernIds:['c1'],questionBank:[ordinary],orientationLimit:0,outerGuardrail:0});
 const step=nextDiscoveryStep(session);
 assert.equal(step.type,'finish');
 assert.equal(step.stop.reason,'outer-guardrail');
 assert.equal(step.stop.incomplete,true);
});
