// Canonical onboarding continuation: Baseline seed -> Discovery session -> Discovery priority -> Planning handoff.
// This module deliberately does not select interventions; buildPlan in intelligence/planning remains the sole authority.
import {createDiscoverySession,activateConcerns,mergeFacts,buildPlan as buildDiscoveryPriority} from '../../intelligence/discovery/discovery-controller.js';
import {buildPlanningHandoff} from '../../intelligence/planning/discovery-handoff.js';

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
  return buildPlanningHandoff(buildDiscoveryPriority(session,maxPlanSize));
}
