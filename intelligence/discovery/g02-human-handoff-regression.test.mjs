import assert from 'node:assert/strict';
import {handoffAudit} from './sufficiency.js';
import {selectNextQuestion} from './question-scheduler.js';

const supported={constructId:'FINANCIAL_STRAIN',resolutionState:'triaged',qualitativeConfidence:'MODERATE',evidenceRefs:['obs:1'],safetyEscalationLevel:0,memberImportanceRank:3,driverKnown:false};
const strong={...supported,constructId:'SLEEP_QUALITY',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['obs:2'],memberImportanceRank:3};
let audit=handoffAudit([supported,strong]);
assert.equal(audit.usable,true);
assert.deepEqual(audit.blocking,[]);
assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN','SLEEP_QUALITY']);

audit=handoffAudit([{...supported,qualitativeConfidence:'LIMITED'}]);
assert.equal(audit.usable,false);
assert.deepEqual(audit.blocking.map(x=>x.constructId),['FINANCIAL_STRAIN']);

audit=handoffAudit([{...supported,evidenceRefs:[]}]);
assert.equal(audit.usable,false);

audit=handoffAudit([{...supported,safetyEscalationLevel:1}]);
assert.equal(audit.usable,false);

const state={...supported,constructId:'FINANCIAL_STRAIN'};
const repeated={id:'Q-repeat',role:'impact-probe',constructId:'FINANCIAL_STRAIN',text:'Over the past 7 days, how much did this affect you?',burden:1,eligible:true};
const alternative={id:'Q-alt',role:'impact-probe',constructId:'FINANCIAL_STRAIN',text:'How much is this getting in the way right now?',burden:1,eligible:true};
const recent=[{id:'Q-prev',role:'impact-probe',constructId:'FINANCIAL_STRAIN',text:'In the past 7 days, how often was this a problem?'}];
const decision=selectNextQuestion({candidates:[repeated,alternative],states:[state],recentQuestions:recent});
assert.equal(decision.type,'question');
assert.equal(decision.question.id,'Q-alt');

console.log('G-02 human handoff regression: evidence-backed exhaustion is bounded; weak/safety states block; repetitive recall loses to equivalent lower-burden sequencing.');
