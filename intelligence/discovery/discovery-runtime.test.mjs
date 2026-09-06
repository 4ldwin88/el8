import assert from 'node:assert/strict';
import * as discovery from './discovery-engine.js';
import {deriveConstructState} from './construct-projection.js';
import {makeObservation} from './contracts.js';
import {DISCOVERY_BANK,observationsForAnswer,constructsForAnswer,safetyContextForAnswer} from './observationNormalizer.js';
import {createDiscoverySession,nextDiscoveryStep,answerDiscoveryInteraction,discoveryOutput,discoveryPriorityCandidates} from '../../app/onboarding/discovery-runtime.js';

assert.equal(typeof discovery.version,'undefined');
assert.ok(DISCOVERY_BANK.some(q=>q.role==='baseline-discriminator'));
assert.equal(typeof discovery.relate,'undefined');
assert.equal(typeof discovery.skipRelationships,'undefined');

const opening=DISCOVERY_BANK.find(q=>q.id==='Q000001');
assert.ok(opening);
assert.deepEqual(constructsForAnswer(opening,'A000001'),[]);
assert.equal(observationsForAnswer(opening,'A000001',{timestamp:1})[0]?.effects.length,0);

const positive=createDiscoverySession({constructIds:[]});
let matrix=nextDiscoveryStep(positive);
assert.equal(matrix.type,'matrix');
assert.equal(matrix.questions.length,8);
assert.equal(positive.questionsAsked,1);
let answers={};
for(const q of matrix.questions)answers[q.id]=q.options.find(o=>o.text==='Going well')?.id;
answerDiscoveryInteraction(positive,matrix,answers);
assert.equal(Object.keys(positive.baselineCoverage).length,8);
let step=nextDiscoveryStep(positive);
assert.equal(step.type,'finish');
assert.equal(step.stop.reason,'baseline-complete-no-active-concern');
const positiveOutput=discoveryOutput(positive);
assert.equal('version' in positiveOutput.trace,false);
assert.equal('plan' in positiveOutput.trace,false);
assert.equal('memberPlan' in positiveOutput.trace,false);
assert.equal('selectedActions' in positiveOutput.trace,false);
assert.equal('priorityChoices' in positiveOutput.trace,false);

const narrowed=createDiscoverySession({constructIds:[]});
matrix=nextDiscoveryStep(narrowed);
answers={};
for(const q of matrix.questions)answers[q.id]=q.options.find(o=>o.text==='Going well')?.id;
const financial=matrix.questions.find(q=>String(q.dimension).toUpperCase()==='FINANCIAL');
answers[financial.id]=financial.options.find(o=>o.text==='Difficult')?.id;
answerDiscoveryInteraction(narrowed,matrix,answers);
step=nextDiscoveryStep(narrowed);
assert.equal(step.type,'driver-triage');
assert.equal(step.interaction,'compact-driver-relationship-screen');
assert.equal(narrowed.questionsAsked,2);
assert.equal(step.presentation.compactWrappingButtons,true);
assert.ok(step.questions.some(q=>String(q.dimension).toUpperCase()==='FINANCIAL'));
assert.equal(narrowed.asked.includes('Q000001'),false);
const financialDriver=step.questions.find(q=>String(q.dimension).toUpperCase()==='FINANCIAL');
assert.ok(financialDriver.options.length>=6&&financialDriver.options.length<=12);
assert.ok(financialDriver.options.every(o=>o.text.length<=24));
for(const label of ['Not sure','None','Something else'])assert.ok(financialDriver.options.some(o=>o.text===label),`Financial Q2 must include ${label}`);
for(const label of ['Not sure','None','Something else']){
 const option=financialDriver.options.find(o=>o.text===label);
 assert.deepEqual(constructsForAnswer(financialDriver,option.id),[],`${label} must not fabricate a construct`);
 assert.equal(observationsForAnswer(financialDriver,option.id,{timestamp:2})[0]?.effects.length,0,`${label} must not fabricate evidence`);
}
const income=financialDriver.options.find(o=>o.text==='Income / work');
assert.ok(income);
assert.deepEqual(constructsForAnswer(financialDriver,income.id),['JOB_SECURITY']);
assert.equal(observationsForAnswer(financialDriver,income.id,{timestamp:2})[0]?.effects.length,0,'Q2 relationship selection must remain a routing hypothesis, not evidence');
answerDiscoveryInteraction(narrowed,step,{[financialDriver.id]:[income.id]});
assert.ok(narrowed.constructIds.includes('JOB_SECURITY'));
assert.equal(narrowed.driverKnown.JOB_SECURITY??false,false,'Q2 hypothesis must not establish a known driver');
step=nextDiscoveryStep(narrowed);
assert.notEqual(step.type,'relationship-screen');
assert.ok(['driver_triage','driver-triage','question'].includes(step.type),'After Q2, Discovery must continue through the staged driver landscape or selective Deepen');
if(step.type==='question'){
 const deepenTargets=step.question.constructIds?.length?step.question.constructIds:[step.question.constructId].filter(Boolean);
 assert.ok(deepenTargets.includes('JOB_SECURITY'),'Selective Deepen must investigate the selected Q2 hypothesis when it is the next decision-critical target');
}else{
 const triageQuestions=step.questions??[];
 assert.ok(triageQuestions.length>0,'Expanded driver landscape must expose materiality/severity triage rather than a blank transition');
 assert.ok(narrowed.constructIds.includes('JOB_SECURITY'),'Expanded driver landscape must preserve the selected cross-area hypothesis');
 assert.equal(narrowed.driverKnown.JOB_SECURITY??false,false,'Landscape expansion must not convert a routing hypothesis into causal evidence');
}

const physicalUnresolved=createDiscoverySession({constructIds:[]});
matrix=nextDiscoveryStep(physicalUnresolved);
answers={};
for(const q of matrix.questions)answers[q.id]=q.options.find(o=>o.text==='Going well')?.id;
const physical=matrix.questions.find(q=>String(q.dimension).toUpperCase()==='PHYSICAL');
answers[physical.id]=physical.options.find(o=>o.text==='Difficult')?.id;
answerDiscoveryInteraction(physicalUnresolved,matrix,answers);
let physicalQ2=nextDiscoveryStep(physicalUnresolved);
assert.equal(physicalQ2.type,'driver-triage');
const physicalDriver=physicalQ2.questions.find(q=>String(q.dimension).toUpperCase()==='PHYSICAL');
const notSure=physicalDriver.options.find(o=>o.text==='Not sure');
assert.ok(notSure);
answerDiscoveryInteraction(physicalUnresolved,physicalQ2,{[physicalDriver.id]:[notSure.id]});
let unresolvedFinish=nextDiscoveryStep(physicalUnresolved);
assert.equal(unresolvedFinish.type,'finish','Unresolved Physical Q2 must produce an explicit finish/handoff state, never a blank page');
assert.equal(unresolvedFinish.stop.reason,'baseline-driver-unresolved');
assert.equal(unresolvedFinish.stop.incomplete,true);
assert.equal(physicalUnresolved.asked.includes('Q000018'),false,'Q000018 must not be asked without an explicit body/weight route');

const physicalBody=createDiscoverySession({constructIds:[]});
matrix=nextDiscoveryStep(physicalBody);
answers={};
for(const q of matrix.questions)answers[q.id]=q.options.find(o=>o.text==='Going well')?.id;
const physical2=matrix.questions.find(q=>String(q.dimension).toUpperCase()==='PHYSICAL');
answers[physical2.id]=physical2.options.find(o=>o.text==='Difficult')?.id;
answerDiscoveryInteraction(physicalBody,matrix,answers);
physicalQ2=nextDiscoveryStep(physicalBody);
const physicalDriver2=physicalQ2.questions.find(q=>String(q.dimension).toUpperCase()==='PHYSICAL');
const weightBody=physicalDriver2.options.find(o=>o.text==='Weight / body');
assert.ok(weightBody);
answerDiscoveryInteraction(physicalBody,physicalQ2,{[physicalDriver2.id]:[weightBody.id]});
const physicalDeepen=nextDiscoveryStep(physicalBody);
assert.equal(physicalDeepen.type,'question');
assert.equal(physicalDeepen.question.id,'Q000018','Body/weight state probe is appropriate only after explicit member routing');

const safetyQuestion=DISCOVERY_BANK.find(q=>q.id==='Q000001');
const unsafe=safetyContextForAnswer(safetyQuestion,'A000002');
if(unsafe.requiresImmediacyClarification){
 assert.equal(unsafe.contextualSignals.explicitSafetyConcern,true);
 const safetySession=createDiscoverySession({constructIds:[]});
 discovery.answer(safetySession,safetyQuestion,'A000002');
 assert.equal(safetySession.safetyRequiresImmediacyClarification,true);
 assert.equal(discovery.next(safetySession).type,'safety');
}

const observation=makeObservation({id:'obs:activity',questionId:'Q:test',constructId:'ACTIVITY_LEVEL',answerValue:'test',specificityLevel:3,timestamp:1,effects:[
 {type:'evidence',target:'ACTIVITY_LEVEL',polarity:'supports',strength:1,certainty:'definitive',sourceType:'direct',temporality:'current'},
 {type:'constraint',target:'ACTIVITY_LEVEL',key:'access',value:'limited_transport',sourceType:'direct',temporality:'current'},
 {type:'support',target:'ACTIVITY_LEVEL',key:'support',value:'partner_support',sourceType:'direct',temporality:'current'},
 {type:'feasibility',target:'ACTIVITY_LEVEL',feasibility:{capacity:'low',schedule:'low'},sourceType:'direct',temporality:'current'}
]});
const activity=deriveConstructState([observation],'ACTIVITY_LEVEL');
assert.equal(activity.qualitativeConfidence,'WELL_SUPPORTED');
assert.equal(activity.specificityFrontier,3);
assert.ok(activity.feasibility.constraints.includes('limited_transport'));
assert.ok(activity.feasibility.supports.includes('partner_support'));
assert.equal(activity.feasibility.values.capacity,'low');
assert.equal(activity.feasibility.values.schedule,'low');

const candidateOutput={trace:{states:[
 {constructId:'FINANCIAL_STRAIN',label:'Financial strain',qualitativeConfidence:'WELL_SUPPORTED',memberImportance:3,resolutionState:'triaged',evidenceRefs:['Q1'],relationships:[],feasibility:{}},
 {constructId:'PHYSICAL_CONDITION',label:'Physical condition',qualitativeConfidence:'MODERATE',memberImportance:1,resolutionState:'triaged',evidenceRefs:['Q2'],relationships:[],feasibility:{}},
 {constructId:'ENERGY_FUNCTION',label:'Energy',qualitativeConfidence:'LIMITED',memberImportance:3,resolutionState:'triaged',evidenceRefs:['Q3']},
 {constructId:'FOCUS_FUNCTION',label:'Focus',qualitativeConfidence:'UNKNOWN',memberImportance:3,resolutionState:'triaged',evidenceRefs:[]}
]}};
const candidates=discoveryPriorityCandidates(candidateOutput);
assert.deepEqual(candidates.map(x=>x.constructId),['FINANCIAL_STRAIN','PHYSICAL_CONDITION']);
assert.equal(candidates[0].memberEmphasized,true);
assert.equal('evidenceConfidence' in candidates[0],false);

console.log('Discovery runtime regression: eight-area orientation, compact Q2 hypothesis/uncertainty routing, staged driver-landscape continuation before selective Deepen when unresolved candidates remain, Physical Q2 burden/dead-end protection, safety, feasibility projection, and evidence-backed priority handoff are covered without obsolete relationship APIs.');