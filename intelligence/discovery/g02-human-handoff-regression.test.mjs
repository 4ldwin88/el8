import assert from 'node:assert/strict';
import {handoffAudit} from './sufficiency.js';
import {selectDecisionCriticalDeepening} from './deepening-policy.js';
import {createDiscoveryOrchestration,nextDiscoveryDecision,DISCOVERY_STAGE} from './discovery-orchestrator.js';
import Discovery from './discovery-engine.js';
import {makeObservation} from './contracts.js';

const supported={constructId:'FINANCIAL_STRAIN',resolutionState:'triaged',qualitativeConfidence:'MODERATE',evidenceRefs:['obs:1'],safetyEscalationLevel:0,memberImportanceRank:3,driverKnown:false,specificityFrontier:3};
const strong={...supported,constructId:'SLEEP_QUALITY',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['obs:2'],memberImportanceRank:3};
let audit=handoffAudit([supported,strong]);
assert.equal(audit.usable,true);
assert.deepEqual(audit.blocking,[]);
assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN','SLEEP_QUALITY']);

// The historical handoff contract remains valid for persisted evidence: a surface
// concern does not become decision-useful solely because it is well supported.
audit=handoffAudit([{...supported,qualitativeConfidence:'WELL_SUPPORTED',specificityFrontier:2,driverKnown:false}]);
assert.equal(audit.usable,false);
assert.deepEqual(audit.blocking.map(x=>x.constructId),['FINANCIAL_STRAIN']);
audit=handoffAudit([{...supported,qualitativeConfidence:'WELL_SUPPORTED',specificityFrontier:2,driverKnown:true}]);
assert.equal(audit.usable,true);

// Bounded uncertainty remains an explicit compatibility contract for persisted
// handoffs, but it no longer controls production Discovery completion.
audit=handoffAudit([{...supported,qualitativeConfidence:'WELL_SUPPORTED',specificityFrontier:2,driverKnown:false}],{allowBoundedUncertainty:true});
assert.equal(audit.usable,true);
assert.equal(audit.boundedUncertainty,true);
assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN']);
for(const blocked of [
 {...supported,qualitativeConfidence:'LIMITED',specificityFrontier:2},
 {...supported,evidenceRefs:[],specificityFrontier:2},
 {...supported,safetyEscalationLevel:1,specificityFrontier:2}
])assert.equal(handoffAudit([blocked],{allowBoundedUncertainty:true}).usable,false);

// Final architecture regression: selective Deepening is chosen by the ranked
// causal-leverage hypothesis and asked-question history, not a generic scheduler.
const rankedHypotheses=[
 {constructId:'FINANCIAL_STRAIN',score:.8,uncertainty:.6},
 {constructId:'SLEEP_QUALITY',score:.6,uncertainty:.4}
];
const questionBank=[
 {id:'Q-fin-1',constructId:'FINANCIAL_STRAIN',role:'driver-discriminator',specificityLevel:3},
 {id:'Q-sleep-1',constructId:'SLEEP_QUALITY',role:'driver-discriminator',specificityLevel:3}
];
let deepening=selectDecisionCriticalDeepening({rankedHypotheses,questionBank,askedIds:[]});
assert.equal(deepening.reason,'decision-critical-discriminator');
assert.equal(deepening.questions[0].id,'Q-fin-1');
deepening=selectDecisionCriticalDeepening({rankedHypotheses,questionBank,askedIds:['Q-fin-1']});
assert.equal(deepening.questions[0].id,'Q-sleep-1');
deepening=selectDecisionCriticalDeepening({rankedHypotheses,questionBank,askedIds:['Q-fin-1','Q-sleep-1']});
assert.equal(deepening.reason,'no-decision-critical-deepening');
assert.deepEqual(deepening.questions,[]);

// A graph with completed driver/severity decisions and no remaining discriminator
// hands off cleanly instead of relying on scheduler exhaustion.
const graphReady=createDiscoveryOrchestration({
 areas:[{dimensionId:'financial',state:'difficult',memberImportance:.8,functionalImpact:.8,uncertainty:.4}],
 constructStates:[{constructId:'FINANCIAL_STRAIN',evidenceRefs:['obs:financial'],memberImportance:.8,severity:.8,materiality:.8}],
 questionBank:[],
 driverSelections:{PRESSURE_PATTERN:'reject'},
 severityResponses:{FINANCIAL_STRAIN:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}
});
assert.equal(graphReady.stage,DISCOVERY_STAGE.READY);
const readyDecision=nextDiscoveryDecision(graphReady);
assert.equal(readyDecision.type,'handoff');
assert.equal(readyDecision.reason,'decision-requirements-satisfied');
assert.ok(readyDecision.driverGraph.nodes.some(x=>x.constructId==='FINANCIAL_STRAIN'));

// Production runtime must terminate the same way after the member-facing graph
// inputs are resolved. No controller/scheduler exhaustion path is permitted.
const runtime=Discovery.session({constructIds:['FINANCIAL_STRAIN'],questionBank:[],baselineCoverage:{FINANCIAL:{state:'difficult'}},driverSelections:{PRESSURE_PATTERN:'reject'},severityResponses:{FINANCIAL_STRAIN:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}});
runtime.phase='graph';
runtime.observationLog=[makeObservation({id:'obs:financial',questionId:'Q:financial',constructId:'FINANCIAL_STRAIN',answerValue:'difficult',specificityLevel:3,timestamp:1,effects:[{type:'evidence',target:'FINANCIAL_STRAIN',polarity:'supports',strength:1,certainty:'definitive',sourceType:'direct',temporality:'current'}]})];
const runtimeStep=Discovery.next(runtime);
assert.equal(runtimeStep.type,'finish');
assert.equal(runtimeStep.stop.reason,'decision-requirements-satisfied');
assert.equal(runtimeStep.stop.incomplete,false);
assert.ok(runtimeStep.stop.candidateIds.includes('FINANCIAL_STRAIN'));

console.log('G-02 human handoff regression: persisted bounded-handoff semantics remain covered while production completion and selective Deepening use the final graph architecture without scheduler/controller execution.');
