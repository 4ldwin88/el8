import assert from 'node:assert/strict';
import * as discovery from './discovery-engine.js';
import {deriveConcernState} from './concern-projection.js';
import {makeObservation} from './contracts.js';
import {DISCOVERY_BANK,observationsForAnswer} from './question-bank-adapter.js';
import {createDiscoverySession,nextDiscoveryStep,discoveryOutput} from '../../app/onboarding/discovery-runtime.js';

assert.equal(discovery.DISCOVERY_VERSION,'v4');
const runtime=discovery.session({concernIds:[]});
assert.ok(runtime);
assert.equal(runtime.version,'v4');
assert.equal(typeof discovery.next(runtime),'object');
assert.equal(typeof discovery.trace(runtime),'object');
const portSession=createDiscoverySession({concernIds:[]});
assert.ok(portSession);
assert.equal(typeof nextDiscoveryStep(portSession),'object');
const proposal=discoveryOutput(portSession);
assert.ok(proposal&&typeof proposal==='object');
assert.ok('trace'in proposal);
assert.equal('plan'in proposal,false,'Discovery browser output must not expose a Discovery-owned plan');

// Stage contract: orient -> narrow -> deepen/fit -> sufficient/handoff. Each stage requires at least one interaction by default.
const staged=discovery.session({concernIds:[]});
let step=discovery.next(staged);
assert.equal(step.question.id,'G1','fresh Discovery must open with the broad current-state gateway');
assert.equal(step.phase,'orient');
assert.equal(step.question.responseMode,'multi');
discovery.answer(staged,step.question,['money','health']);
assert.deepEqual(new Set(staged.concernIds),new Set(['money','health']),'only directly selected gateway concerns become active');
assert.equal(staged.stageCounts.orient,1);
step=discovery.next(staged);
assert.equal(step.type,'question','selected concerns must receive narrowing before handoff');
assert.equal(step.phase,'narrow');
discovery.answer(staged,step.question,step.question.options?.find(o=>!['unsure','other','nothing'].includes(o.id))?.id??step.question.options?.[0]?.id);
assert.ok(staged.stageCounts.narrow>=1,'narrow must record at least one interaction');
step=discovery.next(staged);
assert.equal(step.type,'question','Discovery must deepen or establish fit after narrowing');
assert.equal(step.phase,'deepen-fit');
assert.ok(step.question.role!=='orientation'&&step.question.role!=='gateway');

// Positive path is allowed to be short, but it still traverses every Discovery stage rather than deficit hunting.
const positive=discovery.session({concernIds:[]});
let positiveStep=discovery.next(positive);
assert.equal(positiveStep.question.id,'G1');
discovery.answer(positive,positiveStep.question,'well');
assert.equal(positive.facts.discoveryIntent,'maintain');
assert.equal(positive.concernIds.length,0,'doing well must not manufacture deficit concerns');
positiveStep=discovery.next(positive);
assert.equal(positiveStep.phase,'narrow');
assert.equal(positiveStep.question.path,'positive');
discovery.answer(positive,positiveStep.question,'improve');
assert.equal(positive.facts.positiveGoal,'improve');
positiveStep=discovery.next(positive);
assert.equal(positiveStep.phase,'deepen-fit');
assert.equal(positiveStep.question.path,'positive');
discovery.answer(positive,positiveStep.question,'health');
assert.equal(positive.facts.positiveStrength,'health');
positiveStep=discovery.next(positive);
assert.equal(positiveStep.phase,'handoff');
assert.equal(positiveStep.type,'question','handoff itself requires an interaction');
discovery.answer(positive,positiveStep.question,'yes');
positiveStep=discovery.next(positive);
assert.equal(positiveStep.type,'finish');
assert.equal(positiveStep.stop.incomplete,false);
assert.equal(positiveStep.stop.reason,'discovery-sufficient-for-handoff');
assert.deepEqual(positive.stageCounts,{orient:1,narrow:1,'deepen-fit':1,handoff:1});

// There is no product maximum. A higher QA stage minimum forces additional useful interactions when the bank can support them.
const extended=discovery.session({concernIds:[],stageMinimum:2});
let extendedStep=discovery.next(extended);
discovery.answer(extended,extendedStep.question,'unsure');
extendedStep=discovery.next(extended);
assert.equal(extendedStep.phase,'orient');
assert.equal(extendedStep.question.role,'orientation');
discovery.answer(extended,extendedStep.question,'unsure');
assert.equal(extended.stageCounts.orient,2);
assert.equal(extended.outerGuardrail,null,'normal Discovery must not encode a product maximum');

const safe1=DISCOVERY_BANK.find(q=>q.id==='SAFE1'),safe2=DISCOVERY_BANK.find(q=>q.id==='SAFE2'),safe3=DISCOVERY_BANK.find(q=>q.id==='SAFE3');
assert.equal(safe1.safetyConfirmationField,'immediateDanger');
assert.equal(safe2.safetyConfirmationField,'intent');
assert.equal(safe3.safetyConfirmationField,'canStaySafe');
const immediate=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});assert.equal(immediate.safety.status,'confirmation_required');discovery.answer(immediate,safe1,'yes');assert.equal(immediate.safetyConfirmation.immediateDanger,true);assert.equal(immediate.safety.status,'escalate');assert.equal(immediate.safety.pauseOrdinaryFlow,true);
const intent=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});discovery.answer(intent,safe2,'yes');assert.equal(intent.safetyConfirmation.intent,true);assert.equal(intent.safety.status,'escalate');
const partialImmediateNegative=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});discovery.answer(partialImmediateNegative,safe1,'no');assert.equal(partialImmediateNegative.safetyConfirmation.immediateDanger,false);assert.equal(partialImmediateNegative.safety.status,'confirmation_required');
const thoughtsNoIntent=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});discovery.answer(thoughtsNoIntent,safe2,'thoughts_no_intent');assert.equal(thoughtsNoIntent.safetyConfirmation.intent,false);assert.equal(thoughtsNoIntent.safety.status,'confirmation_required');
const cannotStaySafe=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});discovery.answer(cannotStaySafe,safe3,'no');assert.equal(cannotStaySafe.safetyConfirmation.canStaySafe,false);assert.equal(cannotStaySafe.safety.status,'escalate');
const fullySafe=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});discovery.answer(fullySafe,safe1,'no');discovery.answer(fullySafe,safe2,'no');discovery.answer(fullySafe,safe3,'yes');assert.deepEqual(fullySafe.safetyConfirmation,{immediateDanger:false,intent:false,canStaySafe:true});assert.equal(fullySafe.safety.status,'continue_with_constraints');assert.equal(fullySafe.safety.pauseOrdinaryFlow,false);
const uncertainSafety=discovery.session({safetyContextualSignals:{explicitSafetyConcern:true}});discovery.answer(uncertainSafety,safe1,'no');discovery.answer(uncertainSafety,safe2,'unsure');assert.equal(uncertainSafety.safetyConfirmation.immediateDanger,false);assert.equal(uncertainSafety.safetyConfirmation.intent,undefined);assert.equal(uncertainSafety.safety.status,'confirmation_required');assert.equal(uncertainSafety.safety.pauseOrdinaryFlow,true);

const fitObservation=makeObservation({id:'fit:1',questionId:'FIT1',concernId:'low_activity',effects:[{type:'feasibility',target:'low_activity',feasibility:{capacity:'low',scheduleFlexibility:'low'}},{type:'constraint',target:'low_activity',value:'limited_transport'},{type:'support',target:'low_activity',value:'partner_support'}]}),fitState=deriveConcernState([fitObservation],'low_activity');
assert.equal(fitState.feasibility.values.capacity,'low');assert.equal(fitState.feasibility.values.scheduleFlexibility,'low');assert.deepEqual(fitState.feasibility.constraints,['limited_transport']);assert.deepEqual(fitState.feasibility.supports,['partner_support']);
const activityFitQuestion=DISCOVERY_BANK.find(q=>q.id==='PH1B'),activityFitObservations=observationsForAnswer(activityFitQuestion,['time','cost','mobility']),activityFitState=deriveConcernState(activityFitObservations,'energy');
assert.equal(activityFitState.feasibility.values.scheduleFlexibility,'low');assert.equal(activityFitState.feasibility.values.costSensitivity,'high');assert.equal(activityFitState.feasibility.values.accessibilityNeeds,true);assert.ok(activityFitState.feasibility.constraints.includes('limited_time'));assert.ok(activityFitState.feasibility.constraints.includes('limited_budget'));assert.ok(activityFitState.feasibility.constraints.includes('mobility_accessibility'));
const output=discoveryOutput(createDiscoverySession({concernIds:['low_energy']}));
for(const forbidden of ['plan','memberPlan','candidateActions','selectedActionIds','recommendedPriorities','confirmedPriorities','interventions'])assert.equal(forbidden in output,false,`Discovery output must not own ${forbidden}`);
console.log('canonical Discovery v4 staged orient/narrow/deepen-fit/handoff + positive path + Safety + feasibility regression tests passed');
