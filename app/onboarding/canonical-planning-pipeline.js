// Canonical onboarding continuation: Discovery opening snapshot -> adaptive Discovery evidence.
// Discovery does not rank priorities or select interventions. Its output crosses the canonical
// Member State boundary; Prioritization and Planning remain the sole downstream authorities.
import {createDiscoverySession,activateConcerns,mergeFacts} from '../../intelligence/discovery/discovery-controller.js';

export function createDiscoveryFromSnapshot(handoff={},options={}){
  const concernIds=[...(handoff?.candidateConcerns||[])];
  if(!handoff?.uncertainty?.requiresDiscoveryConfirmation||!concernIds.length) return null;
  const signals=handoff.signals||{},legacy=signals.legacy||{},feasibility=signals.feasibility||{};
  const memberPriorityConcern=(signals.priorityConcerns||[]).find(id=>concernIds.includes(id))||(legacy.priority&&concernIds.length===1?concernIds[0]:null);
  const snapshotDimension=(handoff.candidateDimensions||[])[0]||null;
  const snapshotFeasibility={...feasibility,capacity:feasibility.capacity??null};
  const session=createDiscoverySession({concernIds,questionBank:options.questionBank||[],labels:options.labels||{},outerGuardrail:options.outerGuardrail||14,facts:{discoverySnapshotHandoff:handoff,snapshotCapacity:snapshotFeasibility.capacity,...(options.facts||{})}});
  activateConcerns(session,concernIds);
  mergeFacts(session,{memberPriorityConcern,snapshotDimension,snapshotFeasibility});
  return session;
}
