import assert from 'node:assert/strict';
import * as discovery from './discovery-engine.js';
import {deriveConstructState} from './construct-projection.js';
import {makeObservation} from './contracts.js';
import {DISCOVERY_BANK,observationsForAnswer,constructsForAnswer,safetyContextForAnswer} from './observationNormalizer.js';
import {createDiscoverySession,nextDiscoveryStep,discoveryOutput,discoveryPriorityCandidates} from '../../app/onboarding/discovery-runtime.js';

assert.equal(discovery.DISCOVERY_VERSION,'v5');
const runtime=discovery.session({constructIds:[]});
assert.ok(runtime);
assert.equal(typeof discovery.next(runtime),'object');
const trace=discovery.trace(runtime);
for(const forbidden of ['plan','memberPlan','selectedActions','priorityChoices'])assert.equal(forbidden in trace,false);
assert.equal(typeof discovery.memberPlan,'undefined');
assert.equal(typeof discovery.chooseActions,'undefined');
assert.equal(typeof discovery.prioritize,'undefined');

const portSession=createDiscoverySession({constructIds:[]});
assert.ok(portSession);
assert.equal(typeof nextDiscoveryStep(portSession),'object');
assert.ok('trace' in discoveryOutput(portSession));

const opening=DISCOVERY_BANK.find(q=>q.id==='GEN001');
assert.ok(opening);
assert.deepEqual(constructsForAnswer(opening,'GEN001.01'),['FINANCIAL_STRAIN']);
const openingObservations=observationsForAnswer(opening,'GEN001.01');
assert.equal(openingObservations.length,1);
assert.equal(openingObservations[0].effects.length,0);
const routed=discovery.session({constructIds:[]});
discovery.answer(routed,opening,'GEN001.01');
assert.ok(routed.constructIds.includes('FINANCIAL_STRAIN'));

// Governed Environmental Safety semantics interrupt ordinary Discovery without becoming construct severity evidence.
const homeSafety=DISCOVERY_BANK.find(q=>q.id==='ENV003');
assert.ok(homeSafety);
const unsafeContext=safetyContextForAnswer(homeSafety,'ENV003.03');
assert.equal(unsafeContext.contextualSignals.explicitSafetyConcern,true);
assert.equal(unsafeContext.requiresImmediacyClarification,true);
const unsafeSession=discovery.session({constructIds:['ENVIRONMENTAL_INTERFERENCE']});
discovery.answer(unsafeSession,homeSafety,'ENV003.03');
assert.equal(unsafeSession.safety.status,'confirmation_required');
assert.equal(unsafeSession.safety.pauseOrdinaryFlow,true);
assert.equal(unsafeSession.safetyRequiresImmediacyClarification,true);
assert.equal(discovery.next(unsafeSession).type,'safety');
assert.equal(discovery.trace(unsafeSession).safetySignals.length,1);
assert.equal(observationsForAnswer(homeSafety,'ENV003.03')[0].effects.length,0);

const uncertainSession=discovery.session({constructIds:['ENVIRONMENTAL_INTERFERENCE']});
discovery.answer(uncertainSession,homeSafety,'ENV003.04');
assert.equal(uncertainSession.safety.status,'confirmation_required');
assert.equal(discovery.next(uncertainSession).type,'safety');

const safeSession=discovery.session({constructIds:['ENVIRONMENTAL_INTERFERENCE']});
discovery.answer(safeSession,homeSafety,'ENV003.01');
assert.equal(safeSession.safety.status,'clear_for_ordinary_flow');
assert.equal(safeSession.safety.pauseOrdinaryFlow,false);

const triageSession=createDiscoverySession({constructIds:['FINANCIAL_STRAIN','PHYSICAL_CONDITION','SLEEP_QUALITY','FOCUS_FUNCTION']});
triageSession.phase='deepen';
let step=nextDiscoveryStep(triageSession);
assert.equal(step.type,'triage');
discovery.triage(triageSession,{FINANCIAL_STRAIN:3,PHYSICAL_CONDITION:3,SLEEP_QUALITY:1,FOCUS_FUNCTION:1});
step=nextDiscoveryStep(triageSession);
assert.notEqual(step.type,'triage');

const fitObservation=makeObservation({id:'fit:1',questionId:'FIT1',constructId:'ACTIVITY_LEVEL',effects:[{type:'feasibility',target:'ACTIVITY_LEVEL',sourceType:'direct',temporality:'current',feasibility:{capacity:'low',scheduleFlexibility:'low'}},{type:'constraint',target:'ACTIVITY_LEVEL',sourceType:'direct',temporality:'current',value:'limited_transport'},{type:'support',target:'ACTIVITY_LEVEL',sourceType:'direct',temporality:'current',value:'partner_support'}]});
const fitState=deriveConstructState([fitObservation],'ACTIVITY_LEVEL');
assert.equal(fitState.feasibility.values.capacity,'low');
assert.deepEqual(fitState.feasibility.constraints,['limited_transport']);

const emphasizedOutput={trace:{states:[{constructId:'FINANCIAL_STRAIN',resolutionState:'triaged',memberImportance:3,evidenceConfidence:.8},{constructId:'PHYSICAL_CONDITION',resolutionState:'triaged',memberImportance:1,evidenceConfidence:.6},{constructId:'ENERGY_FUNCTION',resolutionState:'triaged',memberImportance:null,evidenceConfidence:0}]}};
const emphasized=discoveryPriorityCandidates(emphasizedOutput);
assert.equal(emphasized.some(x=>x.constructId==='ENERGY_FUNCTION'),false);
assert.equal(emphasized[0].constructId,'FINANCIAL_STRAIN');

const output=discoveryOutput(createDiscoverySession({constructIds:['ENERGY_FUNCTION']}));
assert.equal('candidateActions' in output,false);
assert.equal('selectedActionIds' in output,false);
console.log('Discovery v5 uses governed questions, canonical constructs, deterministic Safety interruption and evidence-only downstream output');
