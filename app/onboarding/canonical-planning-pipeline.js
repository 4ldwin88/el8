// Canonical onboarding continuation: Baseline seed -> Discovery session -> canonical Planning evidence.
// This module does not select interventions; buildPlan in intelligence/planning remains the sole action-selection authority.
import {createDiscoverySession,activateConcerns,mergeFacts,buildPlan as buildDiscoveryPriority} from '../../intelligence/discovery/discovery-controller.js';

const DRIVER_MAP=Object.freeze({money:'money_pressure',physical_condition:'low_activity',work_pressure:'work_instability',low_direction:'lack_direction'});
function planningState(state={}){const id=DRIVER_MAP[state.concernId]||state.concernId;return{id,concernId:id,sourceConcernId:state.concernId,confidence:state.evidenceConfidence??state.confidence??null,memberImportance:state.memberImportanceRank??state.memberImportance??null,readiness:state.readiness??state.feasibility?.values?.readiness??null,feasibility:state.feasibility??null,evidenceRefs:[...(state.evidenceRefs||[])],observationRefs:[...(state.observationRefs||[])]}}

export function createDiscoveryFromBaseline(initialBridge={},options={}){
  if(!initialBridge?.requiresDiscoveryHandoff||!initialBridge.discoverySeed) return null;
  const seed=initialBridge.discoverySeed;
  const session=createDiscoverySession({concernIds:[seed.concernId],questionBank:options.questionBank||[],labels:options.labels||{},outerGuardrail:options.outerGuardrail||14,facts:{baselineSeed:seed,baselineCapacity:initialBridge.capacity,...(options.facts||{})}});
  activateConcerns(session,[seed.concernId]);
  mergeFacts(session,{memberPriorityConcern:seed.memberPrioritySelected?seed.concernId:null,baselineDimension:seed.dimension,baselineFeasibility:seed.feasibility});
  return session;
}

export function planningHandoffFromDiscovery(session,maxPlanSize=3){
  if(!session) throw new Error('Discovery session required');
  const priority=buildDiscoveryPriority(session,maxPlanSize);
  return{ranked:(priority.selected||[]).map(planningState),backlog:(priority.backlog||[]).map(planningState)};
}
