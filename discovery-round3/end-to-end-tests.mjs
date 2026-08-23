import assert from 'node:assert/strict';
import {session,triage} from './round3-engine.js';
import {makeObservation} from './contracts.js';
import {deriveConcernState} from './concern-projection.js';
import {selectNextQuestion} from './question-scheduler.js';
import {selectPlanConcerns} from './plan-priority.js';
import {stoppingDecision} from './sufficiency.js';
import {selectIntervention,HOME_INTERVENTIONS} from './intervention-selector.js';

const obs=(id,concern,effects,specificityLevel=1)=>makeObservation({id,questionId:id,concernId:concern,answerValue:id,specificityLevel,effects});
const ev=(target,polarity,strength,certainty='graded')=>({type:'evidence',target,polarity,strength,certainty,sourceType:'direct',temporality:'current'});
const imp=(target,value)=>({type:'importance',target,value,sourceType:'direct',temporality:'current'});
const imm=(target,value)=>({type:'immediacy',target,value,sourceType:'direct',temporality:'current'});
const safe=(target,level)=>({type:'safety',target,level,sourceType:'direct',temporality:'current'});

// A: many concerns -> dynamic triage, exact concerns preserved.
const a=session({concernIds:['money','sleep','energy','home','support','direction']});
const aStep=(await import('./round3-controller.js')).nextRound3Step(a);
assert.equal(aStep.type,'triage');
assert.deepEqual(aStep.question.concerns.map(x=>x.id),['money','sleep','energy','home','support','direction']);
triage(a,{money:'moderate',sleep:'high',energy:'low',home:'very-high',support:'moderate',direction:'high'});
assert.equal(deriveConcernState(a.observationLog,'home').memberImportance,'very-high');

// B: latest explicit importance wins after re-triage.
const b=[obs('b1','direction',[imp('direction','low')]),obs('b2','direction',[imp('direction','very-high')])];
assert.equal(deriveConcernState(b,'direction').memberImportance,'very-high');

// C: contradiction is represented, not silently overwritten.
const c=[obs('c1','sleep',[ev('sleep','supports',.8)]),obs('c2','sleep',[ev('sleep','contradicts',.6)])];
const cs=deriveConcernState(c,'sleep');
assert.ok(cs.rawEvidenceScore>0 && cs.rawEvidenceScore<.8);

// D: definitive contradiction excludes a concern.
const d=[obs('d1','money',[ev('money','supports',.7)]),obs('d2','money',[ev('money','contradicts',1,'definitive')])];
assert.equal(deriveConcernState(d,'money').excluded,true);
assert.equal(deriveConcernState(d,'money').evidenceConfidence,0);

// E: safety cannot be outscored by ordinary utility.
const safetyPick=selectNextQuestion({states:[{concernId:'home',safetyEscalationLevel:2,resolutionState:'narrowing'},{concernId:'direction',safetyEscalationLevel:0,memberImportanceRank:4}],candidates:[{id:'home-safety',concernId:'home',eligible:true,safetyPriority:1},{id:'career',concernId:'direction',eligible:true,expectedUncertaintyReduction:1e9}]});
assert.equal(safetyPick.question.id,'home-safety');

// F: stated importance outranks stronger evidence when safety is equal.
const fp=selectPlanConcerns([{concernId:'money',resolutionState:'sufficient',memberImportance:'moderate',evidenceConfidence:1,safetyEscalationLevel:0},{concernId:'direction',resolutionState:'sufficient',memberImportance:'very-high',evidenceConfidence:.4,safetyEscalationLevel:0}],2);
assert.equal(fp.selected[0].concernId,'direction');

// G: time-sensitive housing gets specific housing action, not generic environment advice.
const gs={concernId:'home_instability',resolutionState:'sufficient',immediacyClass:'time-sensitive',safetyEscalationLevel:0};
assert.equal(selectIntervention(gs,HOME_INTERVENTIONS).intervention.id,'home_time_sensitive_step');

// H: eight is benchmark only; outer guardrail terminates incomplete work.
const unresolved=[{concernId:'sleep',resolutionState:'narrowing',safetyEscalationLevel:0}];
assert.equal(stoppingDecision({states:unresolved,questionsAsked:8}).stop,false);
assert.equal(stoppingDecision({states:unresolved,questionsAsked:14}).incomplete,true);

// I: unresolved safety overrides outer guardrail.
const unsafe=[{concernId:'home',resolutionState:'narrowing',safetyEscalationLevel:2}];
assert.equal(stoppingDecision({states:unsafe,questionsAsked:14}).stop,false);

// J: semantic fields remain independent: evidence, importance, immediacy, safety.
const j=[obs('j1','home',[ev('home','supports',.7),imp('home','high'),imm('home','acute'),safe('home',0)])];
const js=deriveConcernState(j,'home');
assert.equal(js.memberImportance,'high'); assert.equal(js.immediacyClass,'acute'); assert.equal(js.safetyEscalationLevel,0); assert.equal(js.evidenceConfidence,.7);

console.log('Round 3 adversarial end-to-end scenarios passed');
