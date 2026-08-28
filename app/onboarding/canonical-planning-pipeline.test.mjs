import test from 'node:test';
import assert from 'node:assert/strict';
import {buildDiscoverySnapshotHandoff} from './discovery-snapshot-handoff.js';
import {createDiscoveryFromSnapshot} from './canonical-planning-pipeline.js';
import {appendObservation,setResolution,deriveStates} from '../../intelligence/discovery/discovery-controller.js';
import {finishDiscovery} from './discovery-runtime.js';

const snapshot=()=>buildDiscoverySnapshotHandoff({condition_baseline:{Financial:'Struggling'},member_priority:'Financial',functional_impact:['Financial'],worsening:['Financial'],feasibility:{time:'<5 min',overall_load:'Difficult'}});
const establishMoney=s=>{appendObservation(s,{concernId:'money',questionId:'discovery-money',effects:[{type:'evidence',target:'money',polarity:'supports',strength:.9},{type:'importance',target:'money',value:'high'},{type:'member-priority',target:'money',value:true},{type:'immediacy',target:'money',value:'time-sensitive'},{type:'readiness',target:'money',value:3}]});setResolution(s,'money','established',{driverKnown:true});return s};

// This helper creates a controller-level session rather than the higher-level Discovery engine
// session, so supply the trace clock fields explicitly before crossing the runtime boundary.
function completeBoundarySession(s){s.assessmentStart=Date.now();s.questionTimings=[];return finishDiscovery(s)}

test('opening Discovery snapshot alone cannot activate an intervention',()=>{const b=snapshot();assert.ok(b.candidateConcerns.includes('money'));assert.equal(b.selectedActionIds,undefined);assert.equal(b.candidateActions,undefined)});
test('Discovery snapshot seed creates canonical Discovery session with member and feasibility context',()=>{const s=createDiscoveryFromSnapshot(snapshot());assert.ok(s);assert.deepEqual(s.concernIds,['money']);assert.equal(s.facts.memberPriorityConcern,'money');assert.equal(s.facts.snapshotDimension,'Financial');assert.equal(s.facts.snapshotFeasibility.capacity,'low')});
test('unclear Discovery snapshot does not fabricate a Discovery session',()=>{const b=buildDiscoverySnapshotHandoff({condition_baseline:{Physical:'Okay'},member_priority:'No preference'});assert.equal(createDiscoveryFromSnapshot(b),null)});
test('explicit Discovery resolution remains evidence/state rather than a Discovery-owned priority ranking',()=>{const s=createDiscoveryFromSnapshot(snapshot());setResolution(s,'money','established',{driverKnown:true});const states=deriveStates(s);assert.equal(states.length,1);assert.equal(states[0].concernId,'money');assert.equal(states[0].resolutionState,'established');const output=completeBoundarySession(s);assert.equal('plan' in output,false);assert.equal('ranked' in output,false);assert.equal('backlog' in output,false)});
test('established Discovery evidence crosses the boundary with provenance but no intervention choice',()=>{const s=establishMoney(createDiscoveryFromSnapshot(snapshot()));const output=completeBoundarySession(s),state=output.trace.states.find(x=>x.concernId==='money');assert.ok(state);assert.equal(state.resolutionState,'established');assert.ok((state.evidenceRefs||[]).length>0);for(const forbidden of ['plan','memberPlan','candidateActions','selectedActionIds','recommendedPriorities','confirmedPriorities','interventions','ranked','backlog'])assert.equal(forbidden in output,false)});
