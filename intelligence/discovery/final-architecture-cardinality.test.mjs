import assert from 'node:assert/strict';
import {canonicalDriverGraph,assertNoSilentLoss} from '../contracts/driver-graph.js';
import {deriveAreaPriority,investigationBudget} from './area-priority.js';
import {buildDriverLandscape} from './driver-landscape.js';
import {deriveSeverityMateriality} from './severity-triage.js';
import {rankLeverageHypotheses} from './leverage-ranking.js';
import {selectDecisionCriticalDeepening} from './deepening-policy.js';
import {createDiscoveryOrchestration,nextDiscoveryDecision,DISCOVERY_STAGE} from './discovery-orchestrator.js';

const areas=['physical','emotional','social','intellectual','occupational','financial','environmental','spiritual'];
const area=id=>({dimensionId:id,state:'difficult',memberImportance:.8,functionalImpact:.7,uncertainty:.5});
const node=(constructId,dimensionIds=['physical'],overrides={})=>({constructId,dimensionIds,evidenceRefs:[`obs:${constructId}`],sourceAreaIds:dimensionIds,memberImportance:.8,severity:.7,materiality:.7,...overrides});

for(const count of [1,2,4,8]){
 const priority=deriveAreaPriority(areas.slice(0,count).map(area));
 assert.equal(priority.length,count,`${count}-area orientation must preserve cardinality`);
 assert.ok(investigationBudget(priority)>=1);
 assert.ok(investigationBudget(priority)<=8);
 assert.deepEqual(new Set(priority.map(x=>x.dimensionId)),new Set(areas.slice(0,count)));
}

const deduped=canonicalDriverGraph({nodes:[
 node('ACTIVITY_LEVEL',['physical'],{evidenceRefs:['obs:physical'],sourceAreaIds:['physical']}),
 node('ACTIVITY_LEVEL',['occupational'],{evidenceRefs:['obs:work'],sourceAreaIds:['occupational']}),
 node('SLEEP_QUALITY',['physical'])
]});
assert.equal(deduped.nodes.filter(x=>x.constructId==='ACTIVITY_LEVEL').length,1,'same canonical driver must merge to one node');
const activity=deduped.nodes.find(x=>x.constructId==='ACTIVITY_LEVEL');
assert.deepEqual(new Set(activity.evidenceRefs),new Set(['obs:physical','obs:work']),'dedupe must preserve all evidence paths');
assert.deepEqual(new Set(activity.sourceAreaIds),new Set(['physical','occupational']),'dedupe must preserve all source areas');

const noLossGraph=canonicalDriverGraph({nodes:[node('ACTIVITY_LEVEL'),node('SLEEP_QUALITY')]});
assert.equal(assertNoSilentLoss({beforeNodeIds:['ACTIVITY_LEVEL','SLEEP_QUALITY'],graph:noLossGraph}),true);
assert.throws(()=>assertNoSilentLoss({beforeNodeIds:['ACTIVITY_LEVEL','FINANCIAL_STRAIN'],graph:noLossGraph}),/silent loss/);
assert.equal(assertNoSilentLoss({beforeNodeIds:['ACTIVITY_LEVEL','FINANCIAL_STRAIN'],graph:noLossGraph,dispositions:{FINANCIAL_STRAIN:'deferred'}}),true,'explicit disposition may account for a driver that leaves the active graph');

const landscape=buildDriverLandscape({seedConstructIds:['ACTIVITY_LEVEL'],knownConstructIds:['ACTIVITY_LEVEL'],memberSelections:{}});
assert.ok(Array.isArray(landscape.candidates));
assert.equal(new Set(landscape.candidates.map(x=>x.constructId)).size,landscape.candidates.length,'driver landscape must be semantically canonical by construct id');
for(const candidate of landscape.candidates){
 assert.ok(candidate.sourcePaths.length>=1,'expanded driver must retain provenance path');
 assert.equal(new Set(candidate.sourcePaths).size,candidate.sourcePaths.length,'duplicate evidence paths must collapse without losing provenance');
}
const relatedCandidate=landscape.candidates[0];
assert.ok(relatedCandidate,'activity seed must expose at least one governed relationship candidate');
const acceptedOrchestration=createDiscoveryOrchestration({areas:[area('physical')],constructStates:[node('ACTIVITY_LEVEL')],questionBank:[],driverSelections:{[relatedCandidate.constructId]:'accept'},severityResponses:{ACTIVITY_LEVEL:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}});
const acceptedNode=acceptedOrchestration.driverGraph.nodes.find(x=>x.constructId===relatedCandidate.constructId);
assert.ok(acceptedNode,'accepted relationship-derived candidate must materialize as one canonical graph node');
assert.ok(acceptedNode.provenanceRefs.some(ref=>ref.startsWith('relationship:')),'accepted candidate must retain relationship provenance');
assert.ok(acceptedNode.provenanceRefs.some(ref=>ref.startsWith('relationship_path:')),'accepted candidate must retain relationship path provenance');
const rejectedOrchestration=createDiscoveryOrchestration({areas:[area('physical')],constructStates:[node('ACTIVITY_LEVEL')],questionBank:[],driverSelections:{[relatedCandidate.constructId]:'reject'},severityResponses:{ACTIVITY_LEVEL:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}});
assert.equal(rejectedOrchestration.driverDispositions[relatedCandidate.constructId],'rejected','rejected landscape candidate must retain explicit no-silent-loss disposition');
assert.ok(!rejectedOrchestration.driverGraph.nodes.some(x=>x.constructId===relatedCandidate.constructId),'rejected candidate must not become an active graph node');

const triaged=deriveSeverityMateriality([node('ACTIVITY_LEVEL')],{ACTIVITY_LEVEL:{severity:.9,frequency:.8,functionalImpact:.7,memberImportance:.9}});
assert.equal(triaged[0].triageDisposition,'major');
assert.ok(triaged[0].materiality>=.67);

const hypothesisGraph=canonicalDriverGraph({nodes:[node('ACTIVITY_LEVEL'),node('SLEEP_QUALITY')],edges:[{edgeId:'edge:test',fromConstructId:'ACTIVITY_LEVEL',toConstructId:'SLEEP_QUALITY',confidence:'moderate',status:'hypothesis',memberSpecific:true}]});
const ranked=rankLeverageHypotheses(hypothesisGraph);
assert.equal(ranked.length,2);
assert.equal(ranked[0].constructId,'ACTIVITY_LEVEL','cross-node reach should remain a leverage signal, not causal proof');
assert.ok(ranked[0].uncertainty>0,'hypothesis ranking must preserve uncertainty');
const deepen=selectDecisionCriticalDeepening({rankedHypotheses:ranked,questionBank:[{id:'Q:test',constructId:'ACTIVITY_LEVEL',role:'deepen',specificityLevel:3}]});
assert.equal(deepen.questions[0]?.id,'Q:test');
assert.equal(deepen.reason,'decision-critical-discriminator');

const lowConcern=createDiscoveryOrchestration({areas:[{dimensionId:'physical',state:'good',memberImportance:.2,functionalImpact:.1,uncertainty:.1}],constructStates:[],questionBank:[]});
assert.equal(lowConcern.stage,DISCOVERY_STAGE.READY,'low-concern path must not manufacture a driver or deepening requirement');
assert.equal(lowConcern.readyForPrioritization,true);
assert.equal(nextDiscoveryDecision(lowConcern).type,'handoff');

const oneArea=createDiscoveryOrchestration({areas:[area('physical')],constructStates:[node('ACTIVITY_LEVEL')],questionBank:[],severityResponses:{ACTIVITY_LEVEL:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8}}});
assert.ok([DISCOVERY_STAGE.DRIVER_TRIAGE,DISCOVERY_STAGE.READY].includes(oneArea.stage),'one-area case may expand/triage or collapse when evidence is sufficient');
assert.ok(oneArea.driverGraph.nodes.some(x=>x.constructId==='ACTIVITY_LEVEL'));

const allAreas=createDiscoveryOrchestration({areas:areas.map(area),constructStates:[node('ACTIVITY_LEVEL',['physical']),node('SLEEP_QUALITY',['physical']),node('FINANCIAL_STRAIN',['financial'])],questionBank:[],severityResponses:{ACTIVITY_LEVEL:{severity:.8,frequency:.8,functionalImpact:.8,memberImportance:.8},SLEEP_QUALITY:{severity:.7,frequency:.7,functionalImpact:.7,memberImportance:.7},FINANCIAL_STRAIN:{severity:.9,frequency:.9,functionalImpact:.9,memberImportance:.9}}});
assert.equal(allAreas.areaPriority.length,8,'all-eight orientation must survive into orchestration');
assert.deepEqual(new Set(allAreas.driverGraph.nodes.map(x=>x.constructId)),new Set(['ACTIVITY_LEVEL','SLEEP_QUALITY','FINANCIAL_STRAIN']),'broad cases must not silently drop supported canonical drivers');
assert.ok(allAreas.investigationBudget<8,'broad cases should compress investigation burden instead of forcing one deepening stream per area');

console.log('Final Discovery architecture cardinality invariants: 1/2/4/8-area preservation, canonical driver dedupe with provenance, accepted relationship-candidate materialization, explicit rejection dispositions, no-silent-loss, bounded landscape expansion, severity/materiality, uncertain leverage hypotheses, selective deepening, low-concern collapse, and broad-case compression are covered.');