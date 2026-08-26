import assert from 'node:assert/strict';
import * as discovery from './round3-engine.js';
import { deriveConcernState } from './concern-projection.js';
import { makeObservation } from './contracts.js';
import { ROUND3_BANK, observationsForAnswer } from './question-bank-adapter.js';
import {
  createDiscoverySession,
  nextDiscoveryStep,
  discoveryOutput,
  discoveryPriorityCandidates,
  actionsForConfirmedPriorities,
} from '../../app/onboarding/discovery-runtime.js';

const runtime = discovery.session({ concernIds: [] });
assert.ok(runtime, 'canonical Discovery runtime should create a session');
assert.equal(typeof discovery.next(runtime), 'object', 'canonical Discovery runtime should produce a next step');
assert.equal(typeof discovery.trace(runtime), 'object', 'canonical Discovery runtime should expose a trace');

const portSession = createDiscoverySession({ concernIds: [] });
assert.ok(portSession, 'onboarding Discovery boundary should create a canonical session');
assert.equal(typeof nextDiscoveryStep(portSession), 'object', 'onboarding Discovery boundary should reach canonical next-step behavior');
const proposal = discoveryOutput(portSession);
assert.ok(proposal && typeof proposal === 'object', 'onboarding Discovery boundary should produce a proposal envelope');
assert.ok('plan' in proposal, 'proposal should include the member plan');
assert.ok('trace' in proposal, 'proposal should include the Discovery trace');

const once = createDiscoverySession({ concernIds: ['money_pressure','physical_condition','poor_sleep','low_focus'] });
let step = nextDiscoveryStep(once);
assert.equal(step.type, 'triage', 'new concern set should receive one importance pass');
discovery.triage(once, { money_pressure: 3, physical_condition: 3, poor_sleep: 1, low_focus: 1 });
step = nextDiscoveryStep(once);
assert.notEqual(step.type, 'triage', 'importance must not be requested twice');
assert.notEqual(step.type, 'priority-resolution', 'mid-Discovery priority ranking is forbidden');

const emphasizedOutput = {trace:{states:[
 {concernId:'money_pressure',resolutionState:'triaged',memberImportance:3,evidenceConfidence:0},
 {concernId:'physical_condition',resolutionState:'triaged',memberImportance:3,evidenceConfidence:0},
 {concernId:'poor_sleep',resolutionState:'triaged',memberImportance:1,evidenceConfidence:0},
 {concernId:'low_focus',resolutionState:'triaged',memberImportance:1,evidenceConfidence:0},
 {concernId:'low_energy',resolutionState:'triaged',memberImportance:null,evidenceConfidence:0},
]},plan:{focus:[]}};
const emphasized=discoveryPriorityCandidates(emphasizedOutput);
assert.deepEqual(emphasized.map(x=>x.concernId),['money_pressure','physical_condition','low_focus','poor_sleep'],'explicitly important concerns must remain available');
assert.equal(emphasized.some(x=>x.concernId==='low_energy'),false,'unmentioned zero-evidence concern must not appear');

const inferred=discoveryPriorityCandidates({trace:{states:[{concernId:'low_energy',resolutionState:'triaged',memberImportance:null,evidenceConfidence:.45,evidenceRefs:['D2:inside']}]},plan:{focus:[]}});
assert.equal(inferred.length,1,'positive evidence may surface an inferred concern');
assert.equal(inferred[0].inferred,true,'evidence-only concern should be marked inferred');
assert.deepEqual(inferred[0].evidenceRefs,['D2:inside'],'inferred concern should preserve its evidence trail');

const multiDomainOutput={trace:{states:[
 {concernId:'money_pressure',label:'Money',resolutionState:'triaged',memberImportance:3,evidenceConfidence:.7,evidence:{severity:2,frequency:2,impact:2}},
 {concernId:'physical_condition',label:'Health',resolutionState:'triaged',memberImportance:3,evidenceConfidence:.7,evidence:{severity:2,frequency:2,impact:2}},
]},plan:{focus:[]}};
const multi=actionsForConfirmedPriorities(multiDomainOutput,['money_pressure','physical_condition'],{});
assert.ok(multi.some(a=>a.concernId==='money_pressure'),'Money confirmation should generate a financial action');
assert.ok(multi.some(a=>a.concernId==='physical_condition'),'Health confirmation should generate a physical action');

const fitObservation=makeObservation({id:'fit:1',questionId:'FIT1',concernId:'low_activity',effects:[
 {type:'feasibility',target:'low_activity',feasibility:{capacity:'low',scheduleFlexibility:'low'}},
 {type:'constraint',target:'low_activity',value:'limited_transport'},
 {type:'support',target:'low_activity',value:'partner_support'},
]});
const fitState=deriveConcernState([fitObservation],'low_activity');
assert.equal(fitState.feasibility.values.capacity,'low','Discovery state should preserve feasibility capacity');
assert.equal(fitState.feasibility.values.scheduleFlexibility,'low','Discovery state should preserve schedule feasibility');
assert.deepEqual(fitState.feasibility.constraints,['limited_transport'],'Discovery state should preserve constraints');
assert.deepEqual(fitState.feasibility.supports,['partner_support'],'Discovery state should preserve supports');

const activityFitQuestion=ROUND3_BANK.find(q=>q.id==='PH1B');
const activityFitObservations=observationsForAnswer(activityFitQuestion,['time','cost','mobility']);
const activityFitState=deriveConcernState(activityFitObservations,'energy');
assert.equal(activityFitState.feasibility.values.scheduleFlexibility,'low','PH1B time answer should become schedule feasibility');
assert.equal(activityFitState.feasibility.values.costSensitivity,'high','PH1B cost answer should become cost feasibility');
assert.equal(activityFitState.feasibility.values.accessibilityNeeds,true,'PH1B mobility answer should become accessibility feasibility');
assert.ok(activityFitState.feasibility.constraints.includes('limited_time'),'PH1B should preserve time as a planning constraint');
assert.ok(activityFitState.feasibility.constraints.includes('limited_budget'),'PH1B should preserve cost as a planning constraint');
assert.ok(activityFitState.feasibility.constraints.includes('mobility_accessibility'),'PH1B should preserve mobility as a planning constraint');

const v02Output={trace:{states:[{...activityFitState,concernId:'low_energy',label:'Energy',resolutionState:'triaged',memberImportance:3,evidenceConfidence:.8}]},plan:{focus:[]}};
const v02Actions=actionsForConfirmedPriorities(v02Output,['low_energy'],{signals:{feasibility:{time:'>30 min'},constraints:[]}});
assert.ok(v02Actions.length>0,'v0.2 feasibility scenario should still produce eligible actions');
assert.deepEqual(v02Actions[0].feasibilityUsed,activityFitState.feasibility,'ranked action should preserve the Discovery feasibility used');
assert.ok(v02Actions.every(a=>a.fitScore&&Number.isFinite(a.fitScore.total)),'Discovery feasibility must reach action fit scoring');
assert.ok(v02Actions.every(a=>a.fitScore.time<=4),'Discovery limited-time constraint must override the looser baseline time context');

console.log('canonical Discovery runtime + onboarding contract + v0.2 feasibility regression tests passed');
