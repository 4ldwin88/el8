import assert from 'node:assert/strict';
import test from 'node:test';
import {selectNextQuestion} from './question-scheduler.js';
import {stoppingDecision} from './sufficiency.js';

const q=(id,extra={})=>({id,concernId:'c1',eligible:true,...extra});

test('dismissed concern is offered positive path instead of manufactured concern',()=>{
 const states=[{concernId:'c1',resolutionState:'dismissed',memberImportanceRank:0}];
 const decision=selectNextQuestion({candidates:[q('ordinary'),q('growth',{path:'positive',role:'goal-probe'})],states});
 assert.equal(decision.question.id,'growth');
 assert.equal(decision.reason,'positive-goal-path');
});

test('dismissed concern stops when no additional positive question remains',()=>{
 const states=[{concernId:'c1',resolutionState:'dismissed',memberImportanceRank:0}];
 const decision=selectNextQuestion({candidates:[q('ordinary')],states});
 assert.equal(decision.type,'none');
 assert.equal(decision.reason,'decision-relevance-sufficient');
});

test('unresolved evidence does not qualify a member for the positive path',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:2}];
 const decision=selectNextQuestion({candidates:[q('ordinary',{decisionCritical:true}),q('growth',{path:'positive',role:'goal-probe'})],states});
 assert.equal(decision.type,'question');
 assert.equal(decision.question.id,'ordinary');
 assert.equal(decision.reason,'required-handoff-evidence');
});

test('Safety clarification preempts ordinary and positive questions',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved'}];
 const decision=selectNextQuestion({candidates:[q('ordinary',{decisionCritical:true}),q('growth',{path:'positive'}),q('safe',{path:'safety',safetyPriority:100,decisionCritical:true})],states});
 assert.equal(decision.question.id,'safe');
 assert.equal(decision.reason,'safety-clarification-path');
});

test('ordinary question cannot masquerade as Safety clarification',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved'}];
 const decision=selectNextQuestion({candidates:[q('ordinary',{safetyPriority:100,decisionCritical:true})],states});
 assert.equal(decision.question.id,'ordinary');
 assert.equal(decision.reason,'required-handoff-evidence');
});

test('legacy numeric information fields alone cannot justify an ordinary question',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:2}];
 const decision=selectNextQuestion({candidates:[q('legacy-score',{expectedUncertaintyReduction:.99,coverageDeficit:1,redundancyPenalty:0})],states});
 assert.equal(decision.type,'none');
 assert.equal(decision.reason,'decision-relevance-sufficient');
});

test('explicit unresolved clarification remains decision relevant without a numeric score',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:2}];
 const decision=selectNextQuestion({candidates:[q('clarify',{addressesUnresolvedUncertainty:true})],states});
 assert.equal(decision.type,'question');
 assert.equal(decision.question.id,'clarify');
 assert.equal(decision.reason,'unresolved-clarification');
});

test('required handoff evidence outranks optional clarification',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:2}];
 const decision=selectNextQuestion({candidates:[q('optional',{addressesUnresolvedUncertainty:true}),q('required',{requiredForHandoff:true})],states});
 assert.equal(decision.question.id,'required');
 assert.equal(decision.reason,'required-handoff-evidence');
});

test('member importance orders equally necessary questions without hidden scoring',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:3},{concernId:'c2',resolutionState:'unresolved',memberImportanceRank:1}];
 const decision=selectNextQuestion({candidates:[q('member-important',{concernId:'c1',addressesUnresolvedUncertainty:true}),q('lower-importance',{concernId:'c2',addressesUnresolvedUncertainty:true})],states});
 assert.equal(decision.question.id,'member-important');
 assert.equal(decision.allocation.memberImportance,3);
});

test('lower burden breaks ties between equally necessary questions',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:2}];
 const decision=selectNextQuestion({candidates:[q('higher-burden',{addressesUnresolvedUncertainty:true,burden:3}),q('lower-burden',{addressesUnresolvedUncertainty:true,burden:1})],states});
 assert.equal(decision.question.id,'lower-burden');
});

test('already asked candidate is not selected again',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',memberImportanceRank:2}];
 const asked=q('asked',{addressesUnresolvedUncertainty:true});
 const fresh=q('fresh',{addressesUnresolvedUncertainty:true});
 const decision=selectNextQuestion({candidates:[asked,fresh],states,recentQuestions:[asked]});
 assert.equal(decision.question.id,'fresh');
});

test('outer guardrail bounds unresolved ordinary Discovery',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',safetyEscalationLevel:0}];
 const stop=stoppingDecision({states,questionsAsked:14,outerGuardrail:14});
 assert.equal(stop.stop,true);
 assert.equal(stop.reason,'outer-guardrail');
 assert.equal(stop.incomplete,true);
});

test('outer guardrail never suppresses unresolved Safety',()=>{
 const states=[{concernId:'c1',resolutionState:'unresolved',safetyEscalationLevel:1}];
 const stop=stoppingDecision({states,questionsAsked:99,outerGuardrail:14});
 assert.equal(stop.stop,false);
 assert.equal(stop.reason,'unresolved-safety');
});
