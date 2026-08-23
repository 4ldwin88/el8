import assert from 'node:assert/strict';
import {makeObservation} from './contracts.js';
import {deriveConcernState} from './concern-projection.js';
import {selectNextQuestion} from './question-scheduler.js';
import {needsTriage, buildTriageQuestion} from './triage.js';
import {selectPlanConcerns} from './plan-priority.js';
import {stoppingDecision} from './sufficiency.js';
import {isQuestionEligible} from './question-eligibility.js';
import {selectIntervention, HOME_INTERVENTIONS} from './intervention-selector.js';

const effect=(type,target,extra={})=>({type,target,sourceType:'direct',temporality:'current',...extra});

// Confidence contract + semantic folding
const log=[makeObservation({id:'1',questionId:'Q',concernId:'money_pressure',specificityLevel:1,effects:[effect('evidence','money_pressure',{polarity:'supports',strength:1.34})]})];
assert.equal(deriveConcernState(log,'money_pressure').evidenceConfidence,1);
assert.equal(deriveConcernState(log,'money_pressure').rawEvidenceScore,1.34);

// Dynamic triage boundary
assert.equal(needsTriage(['a','b','c']),false);
assert.equal(needsTriage(['a','b','c','d']),true);
assert.deepEqual(buildTriageQuestion(['money','sleep']).concerns.map(x=>x.id),['money','sleep']);

// Safety is a hard scheduler gate
const scheduled=selectNextQuestion({states:[{concernId:'safety',safetyEscalationLevel:2,resolutionState:'narrowing'},{concernId:'money',memberImportanceRank:4,safetyEscalationLevel:0}],candidates:[{id:'SAFE',concernId:'safety',eligible:true,safetyPriority:1},{id:'MONEY',concernId:'money',eligible:true,expectedUncertaintyReduction:999}]});
assert.equal(scheduled.question.id,'SAFE');

// Specificity monotonicity
assert.equal(isQuestionEligible({id:'broad',specificityLevel:1},{concernId:'sleep',specificityFrontier:2},[]),false);

// Career direction outranks money when importance is higher and urgency equal
const plan=selectPlanConcerns([{concernId:'money',resolutionState:'sufficient',memberImportance:'moderate',evidenceConfidence:1,safetyEscalationLevel:0},{concernId:'direction',resolutionState:'sufficient',memberImportance:'high',evidenceConfidence:.7,safetyEscalationLevel:0}],3);
assert.equal(plan.ordered[0].concernId,'direction');

// Starvation guarantee
const guaranteed=selectPlanConcerns([{concernId:'a',resolutionState:'sufficient',memberImportance:'very-high',evidenceConfidence:1,safetyEscalationLevel:0},{concernId:'b',resolutionState:'sufficient',memberImportance:'high',evidenceConfidence:.8,safetyEscalationLevel:0}],3);
assert.deepEqual(guaranteed.selected.map(x=>x.concernId),['a','b']);

// Housing without money evidence cannot open an explicitly gated money question
const moneyQ={id:'M3',specificityLevel:2,prerequisite:(_s,l)=>l.some(o=>o.effects?.some(e=>e.type==='evidence'&&e.target==='money_pressure'&&e.polarity==='supports'))};
assert.equal(isQuestionEligible(moneyQ,{concernId:'home_instability',specificityFrontier:1},[]),false);

// Housing intervention granularity
assert.equal(selectIntervention({concernId:'home_instability',resolutionState:'sufficient',immediacyClass:'acute',safetyEscalationLevel:0},HOME_INTERVENTIONS).intervention.id,'home_acute_step');
assert.equal(selectIntervention({concernId:'home_instability',resolutionState:'sufficient',immediacyClass:'routine',safetyEscalationLevel:0},HOME_INTERVENTIONS).intervention.id,'home_environment_step');

// Eight is not a ceiling; 14 is incomplete guardrail
assert.equal(stoppingDecision({states:[{concernId:'x',resolutionState:'narrowing',safetyEscalationLevel:0}],questionsAsked:8}).stop,false);
const guard=stoppingDecision({states:[{concernId:'x',resolutionState:'narrowing',safetyEscalationLevel:0}],questionsAsked:14});
assert.equal(guard.stop,true); assert.equal(guard.incomplete,true);

console.log('Round 3 architecture regressions passed');
