import assert from 'node:assert/strict';
import {handoffAudit} from './sufficiency.js';
import {selectDecisionCriticalDeepening} from './deepening-policy.js';
import {createDiscoveryOrchestration,nextDiscoveryDecision,DISCOVERY_STAGE} from './discovery-orchestrator.js';
import Discovery from './discovery-engine.js';

const supported={constructId:'FINANCIAL_STRAIN',status:'supported',resolutionState:'sufficient',qualitativeConfidence:'MODERATE',evidenceRefs:['obs:1'],safetyEscalationLevel:0};
const strong={...supported,constructId:'SLEEP_QUALITY',qualitativeConfidence:'WELL_SUPPORTED',evidenceRefs:['obs:2']};
let audit=handoffAudit([supported,strong]);
assert.equal(audit.usable,true);
assert.deepEqual(audit.blocking,[]);
assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN','SLEEP_QUALITY']);
// The old fixtures promoted triaged evidence using specificity/driver proxies.
// Current authority requires an explicit resolution and preserves candidate visibility.
for(const override of [{specificityFrontier:99},{driverKnown:true},{qualitativeConfidence:'WELL_SUPPORTED'}]){
 const unresolved={...supported,...override,resolutionState:'triaged'};
 audit=handoffAudit([unresolved],{allowBoundedUncertainty:true});
 assert.equal(audit.usable,false);
 assert.deepEqual(audit.blocking,[unresolved]);
 assert.deepEqual(audit.candidateIds,['FINANCIAL_STRAIN']);
}
for(const blocked of [{...supported,evidenceRefs:[]},{...supported,safetyEscalationLevel:1}])assert.equal(handoffAudit([blocked]).usable,false);
// Qualitative confidence stays independent from explicit sufficiency.
assert.equal(handoffAudit([{...supported,qualitativeConfidence:'LIMITED'}]).usable,true);

// Selective Deepening is ranked-hypothesis driven, not scheduler driven.
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

// FINANCIAL_STRAIN has two governed population-prior neighbours. A ready fixture
// must explicitly dispose both rather than relying on scheduler exhaustion or
// silently dropping an unanswered landscape candidate.
const resolvedFinancialLandscape={PRESSURE_PATTERN:'reject',EMOTIONAL_STATE:'reject'};
const graphReady=createDiscoveryOrchestration({
 areas:[{dimensionId:'financial',state:'difficult',memberImportance:.8,functionalImpact:.8,uncertainty:.4}],
 constructStates:[{...supported,constructId:'FINANCIAL_STRAIN',evidenceRefs:['obs:financial'],memberImportance:.8,severity:.8,materiality:.8}],
 questionBank:[],
 driverSelections:resolvedFinancialLandscape,
 severityResponses:{FINANCIAL_STRAIN:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}
});
assert.equal(graphReady.stage,DISCOVERY_STAGE.READY);
assert.deepEqual(graphReady.driverDispositions,{EMOTIONAL_STATE:'rejected',PRESSURE_PATTERN:'rejected'});
const readyDecision=nextDiscoveryDecision(graphReady);
assert.equal(readyDecision.type,'handoff');
assert.equal(readyDecision.reason,'decision-requirements-satisfied');
assert.ok(readyDecision.driverGraph.nodes.some(x=>x.constructId==='FINANCIAL_STRAIN'));

// Actual direct-state acquisition supplies the focused resolution; an arbitrary
// mocked evidence effect cannot claim this current Question/Answer contract.
const runtime=Discovery.session({constructIds:['FINANCIAL_STRAIN'],questionBank:[],baselineCoverage:{FINANCIAL:{state:'difficult'}},driverSelections:resolvedFinancialLandscape,severityResponses:{FINANCIAL_STRAIN:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}});
runtime.phase='graph';
const financial=Discovery.BANK.find(q=>q.maySatisfyFocusedEvidence&&q.constructIds.includes('FINANCIAL_STRAIN'));
assert.ok(financial,'governed direct Financial state probe exists');
Discovery.answer(runtime,financial,financial.options.find(o=>o.text!=='Not sure').id);
const runtimeStep=Discovery.next(runtime);
assert.equal(runtimeStep.type,'finish');
assert.equal(runtimeStep.stop.reason,'decision-requirements-satisfied');
assert.equal(runtimeStep.stop.incomplete,false);
assert.ok(runtimeStep.stop.candidateIds.includes('FINANCIAL_STRAIN'));
console.log('G-02 handoff regression: explicit resolution, preserved candidates, independent confidence, actual direct-state acquisition and unresolved-evidence blocking.');
