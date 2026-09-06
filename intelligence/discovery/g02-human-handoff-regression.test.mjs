import assert from 'node:assert/strict';
import {handoffAudit} from './sufficiency.js';
import {selectNextQuestion} from './question-scheduler.js';
import {createDiscoverySession,appendObservation,nextDiscoveryStep,setResolution} from './discovery-controller.js';
import {makeObservation} from './contracts.js';

const supported={constructId:'FINANCIAL_STRAIN',resolutionState:'triaged',qualitativeConfidence:'MODERATE',evidenceRefs:['obs:1'],safetyEscalationLevel:0,memberImportanceRank:3,driverKnown:false,specificityFrontier:3};
const strong={...supported,constructId:'SLEEP_QUALITY',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['obs:2'],memberImportanceRank:3};
let audit=handoffAudit([supported,strong]);
assert.equal(audit.usable,true);
assert.deepEqual(audit.blocking,[]);
assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN','SLEEP_QUALITY']);

// A surface concern does not become normally Planning-ready just because it is
// well supported. Driver/context depth remains the ordinary boundary.
audit=handoffAudit([{...supported,qualitativeConfidence:'WELL_SUPPORTED',specificityFrontier:2,driverKnown:false}]);
assert.equal(audit.usable,false);
assert.deepEqual(audit.blocking.map(x=>x.constructId),['FINANCIAL_STRAIN']);
audit=handoffAudit([{...supported,qualitativeConfidence:'WELL_SUPPORTED',specificityFrontier:2,driverKnown:true}]);
assert.equal(audit.usable,true);

// Human QA .11 regression: once the governed bank is genuinely exhausted, strong
// specificity-2 evidence may cross as bounded uncertainty instead of manufacturing
// an artificial question solely to reach specificity 3.
audit=handoffAudit([{...supported,qualitativeConfidence:'WELL_SUPPORTED',specificityFrontier:2,driverKnown:false}],{allowBoundedUncertainty:true});
assert.equal(audit.usable,true);
assert.equal(audit.boundedUncertainty,true);
assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN']);

// Weak evidence and unresolved Safety never qualify for bounded handoff.
audit=handoffAudit([{...supported,qualitativeConfidence:'LIMITED',specificityFrontier:2}],{allowBoundedUncertainty:true});
assert.equal(audit.usable,false);
audit=handoffAudit([{...supported,evidenceRefs:[],specificityFrontier:2}],{allowBoundedUncertainty:true});
assert.equal(audit.usable,false);
audit=handoffAudit([{...supported,safetyEscalationLevel:1,specificityFrontier:2}],{allowBoundedUncertainty:true});
assert.equal(audit.usable,false);

// Controller must terminate cleanly rather than emit a blank/dead-end state when no
// governed question remains and the supported concern is useful with uncertainty.
const exhausted=createDiscoverySession({constructIds:['FINANCIAL_STRAIN'],questionBank:[]});
exhausted.phase='deepen';
exhausted.triaged=true;
setResolution(exhausted,'FINANCIAL_STRAIN','triaged',{driverKnown:false});
appendObservation(exhausted,makeObservation({id:'obs:bounded',questionId:'Q:bounded',constructId:'FINANCIAL_STRAIN',answerValue:'difficult',specificityLevel:2,timestamp:1,effects:[{type:'evidence',target:'FINANCIAL_STRAIN',polarity:'supports',strength:1,certainty:'definitive',sourceType:'direct',temporality:'current'}]}));
const exhaustedStep=nextDiscoveryStep(exhausted);
assert.equal(exhaustedStep.type,'finish');
assert.equal(exhaustedStep.stop.reason,'decision-useful-handoff');
assert.equal(exhaustedStep.stop.incomplete,false);
assert.equal(exhaustedStep.stop.boundedUncertainty,true);
assert.deepEqual(exhaustedStep.stop.candidateIds,['FINANCIAL_STRAIN']);

const state={...supported,constructId:'FINANCIAL_STRAIN'};
const repeated={id:'Q-repeat',role:'impact-probe',constructId:'FINANCIAL_STRAIN',text:'Over the past 7 days, how much did this affect you?',burden:1,eligible:true};
const alternative={id:'Q-alt',role:'impact-probe',constructId:'FINANCIAL_STRAIN',text:'How much is this getting in the way right now?',burden:1,eligible:true};
const recent=[{id:'Q-prev',role:'impact-probe',constructId:'FINANCIAL_STRAIN',text:'In the past 7 days, how often was this a problem?'}];
const decision=selectNextQuestion({candidates:[repeated,alternative],states:[state],recentQuestions:recent});
assert.equal(decision.type,'question');
assert.equal(decision.question.id,'Q-alt');

console.log('G-02 human handoff regression: ordinary handoff requires driver/context depth; exhausted useful evidence can preserve bounded uncertainty; weak/safety states block; dead-end recovery and repetitive recall are covered.');
