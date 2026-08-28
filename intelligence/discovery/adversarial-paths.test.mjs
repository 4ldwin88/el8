import assert from 'node:assert/strict';
import test from 'node:test';
import {selectNextQuestion} from './question-scheduler.js';
import {stoppingDecision} from './sufficiency.js';

const q=(id,extra={})=>({id,concernId:'c1',expectedUncertaintyReduction:.2,coverageDeficit:0,redundancyPenalty:0,eligible:true,...extra});

test('healthy member is offered positive path instead of manufactured concern',()=>{
 const states=[{concernId:'c1',resolutionState:'nonIssue',memberReportsConcern:false,concernEstablished:false}];
 const decision=selectNextQuestion({candidates:[q('ordinary'),q('growth',{path:'positive',role:'goal-probe'})],states});
 assert.equal(decision.question.id,'growth');
 assert.equal(decision.reason,'positive-goal-path');
});

test('healthy positive path stops when no additional positive question remains',()=>{
 const states=[{concernId:'c1',resolutionState:'nonIssue',memberReportsConcern:false,concernEstablished:false}];
 const decision=selectNextQuestion({candidates:[q('ordinary')],states});
 assert.equal(decision.type,'none');
 assert.equal(decision.reason,'positive-path-sufficient');
});

test('unknown evidence does not qualify a member for the positive path',()=>{
 const states=[{concernId:'c1',resolutionState:'triaged',memberReportsConcern:false,concernEstablished:false}];
 const decision=selectNextQuestion({candidates:[q('ordinary',{decisionCritical:true}),q('growth',{path:'positive',role:'goal-probe'})],states});
 assert.equal(decision.type,'question');
 assert.equal(decision.question.id,'ordinary');
 assert.notEqual(decision.reason,'positive-goal-path');
});

test('safety clarification preempts ordinary and positive questions',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',safetyEscalationLevel:1}];
 const decision=selectNextQuestion({candidates:[q('ordinary'),q('growth',{path:'positive'}),q('safe',{path:'safety',safetyPriority:100,decisionCritical:true})],states});
 assert.equal(decision.question.id,'safe');
 assert.equal(decision.reason,'safety-clarification-path');
});

test('ordinary question sharing a safety concern id cannot masquerade as Safety clarification',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',safetyEscalationLevel:1}];
 const decision=selectNextQuestion({candidates:[q('ordinary',{safetyPriority:100})],states});
 assert.equal(decision.type,'escalate-safety');
 assert.equal(decision.reason,'unresolved-safety-no-eligible-question');
});

test('unresolved safety with no clarification question requests escalation',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',safetyEscalationLevel:1}];
 const decision=selectNextQuestion({candidates:[q('ordinary')],states});
 assert.equal(decision.type,'escalate-safety');
});

test('numeric information score alone cannot justify an ordinary question',()=>{
 const states=[{concernId:'c1',resolutionState:'triaged',memberImportanceRank:2,driverKnown:true,uncertain:false}];
 const decision=selectNextQuestion({candidates:[q('high-score',{expectedUncertaintyReduction:.99})],states});
 assert.equal(decision.type,'none');
 assert.equal(decision.reason,'decision-relevance-sufficient');
});

test('unresolved uncertainty remains decision relevant even with a low numeric score',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',memberImportanceRank:2,driverKnown:false}];
 const decision=selectNextQuestion({candidates:[q('uncertainty',{expectedUncertaintyReduction:.01})],states});
 assert.equal(decision.type,'question');
 assert.equal(decision.question.id,'uncertainty');
 assert.equal(decision.reason,'unresolved-uncertainty');
});

test('decision-critical question remains eligible without a numeric threshold',()=>{
 const states=[{concernId:'c1',resolutionState:'triaged',memberImportanceRank:2,driverKnown:true}];
 const decision=selectNextQuestion({candidates:[q('critical',{expectedUncertaintyReduction:0,decisionCritical:true})],states});
 assert.equal(decision.type,'question');
 assert.equal(decision.question.id,'critical');
 assert.equal(decision.reason,'decision-critical');
});

test('member importance orders equally relevant unresolved questions without an override margin',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',memberImportanceRank:3,driverKnown:false},{concernId:'c2',resolutionState:'narrowing',memberImportanceRank:1,driverKnown:false}];
 const decision=selectNextQuestion({candidates:[q('member-priority',{concernId:'c1',expectedUncertaintyReduction:.01}),q('lower-priority-high-score',{concernId:'c2',expectedUncertaintyReduction:.99})],states});
 assert.equal(decision.question.id,'member-priority');
 assert.equal(decision.allocation.priorityTier,3);
});

test('already asked candidate is not selected again',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',memberImportanceRank:2,driverKnown:false}];
 const asked=q('asked');
 const decision=selectNextQuestion({candidates:[asked,q('fresh')],states,recentQuestions:[asked]});
 assert.equal(decision.question.id,'fresh');
});

test('outer guardrail bounds unresolved ordinary discovery',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',safetyEscalationLevel:0}];
 const stop=stoppingDecision({states,questionsAsked:14,outerGuardrail:14});
 assert.equal(stop.stop,true);
 assert.equal(stop.reason,'outer-guardrail');
 assert.equal(stop.incomplete,true);
});

test('outer guardrail never suppresses unresolved safety',()=>{
 const states=[{concernId:'c1',resolutionState:'narrowing',safetyEscalationLevel:1}];
 const stop=stoppingDecision({states,questionsAsked:99,outerGuardrail:14});
 assert.equal(stop.stop,false);
 assert.equal(stop.reason,'unresolved-safety');
});
