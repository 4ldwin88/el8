// Canonical onboarding continuation: Discovery opening snapshot -> adaptive Discovery -> Planning evidence.
// This module does not select interventions; buildCanonicalPlan in intelligence/planning is the sole Planning action-selection authority.
import {createDiscoverySession,activateConcerns,mergeFacts,buildPlan as buildDiscoveryPriority} from '../../intelligence/discovery/discovery-controller.js';

const DRIVER_MAP=Object.freeze({money:'money_pressure',physical_condition:'low_activity',work_pressure:'work_instability',low_direction:'lack_direction'});
function planningState(state={}){const id=DRIVER_MAP[state.concernId]||state.concernId;return{id,concernId:id,sourceConcernId:state.concernId,confidence:state.evidenceConfidence??state.confidence??null,memberImportance:state.memberImportanceRank??state.memberImportance??null,readiness:state.readiness??state.feasibility?.values?.readiness??null,feasibility:state.feasibility??null,evidenceRefs:[...(state.evidenceRefs||[])],observationRefs:[...(state.observationRefs||[])]}}
function capacityFromFeasibility(feasibility={}){return ['Overwhelming','Difficult'].includes(feasibility.overall_load)||feasibility.time==='<5 min'?'low':'medium'}

export function createDiscoveryFromSnapshot(handoff={},options={}){
  const concernIds=[...(handoff?.candidateConcerns||[])];
  if(!handoff?.uncertainty?.requiresDiscoveryConfirmation||!concernIds.length) return null;
  const signals=handoff.signals||{},legacy=signals.legacy||{},feasibility=signals.feasibility||{};
  const memberPriorityConcern=(signals.priorityConcerns||[]).find(id=>concernIds.includes(id))||(legacy.priority&&concernIds.length===1?concernIds[0]:null);
  const snapshotDimension=(handoff.candidateDimensions||[])[0]||null;
  const snapshotFeasibility={...feasibility,capacity:capacityFromFeasibility(feasibility)};
  const session=createDiscoverySession({concernIds,questionBank:options.questionBank||[],labels:options.labels||{},outerGuardrail:options.outerGuardrail||14,facts:{discoverySnapshotHandoff:handoff,snapshotCapacity:snapshotFeasibility.capacity,...(options.facts||{})}});
  activateConcerns(session,concernIds);
  mergeFacts(session,{memberPriorityConcern,snapshotDimension,snapshotFeasibility});
  return session;
}

export function planningHandoffFromDiscovery(session,maxPlanSize=3){
  if(!session) throw new Error('Discovery session required');
  const priority=buildDiscoveryPriority(session,maxPlanSize);
  return{ranked:(priority.selected||[]).map(planningState),backlog:(priority.backlog||[]).map(planningState)};
}
