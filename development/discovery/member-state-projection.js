// Projects reconstructed Discovery concern results into canonical Member State.
// Discovery may use private numeric confidence internally; canonical state stores it only as
// evidence confidence on the concern, never as a wellness/dimension score.

import {
  createConcernState,
  validateMemberStateShape,
} from '../../intelligence/state/member-state-contract.js';
import { isConcernId } from '../../intelligence/state/taxonomy.js';

function unique(values) {
  return [...new Set(values)];
}

function mapConcernStatus(discoveryState) {
  if (discoveryState.excluded || discoveryState.resolutionState === 'nonIssue') return 'excluded';
  if (discoveryState.resolutionState === 'sufficient') return 'active';
  if ((discoveryState.supportingEvidence ?? 0) > 0 || (discoveryState.contradictingEvidence ?? 0) > 0) return 'candidate';
  return 'unknown';
}

function mapSufficiency(discoveryState) {
  return ['sufficient', 'nonIssue'].includes(discoveryState.resolutionState) ? 'sufficient' : 'insufficient';
}

export function projectDiscoveryConcernToMemberState(memberState, discoveryState, { now = new Date().toISOString() } = {}) {
  if (!memberState || typeof memberState !== 'object') throw new Error('memberState is required');
  if (!discoveryState?.concernId) throw new Error('discoveryState.concernId is required');
  if (!isConcernId(discoveryState.concernId)) throw new Error(`Unknown canonical concernId: ${discoveryState.concernId}`);

  const concern = createConcernState({
    concernId: discoveryState.concernId,
    status: mapConcernStatus(discoveryState),
    now,
  });

  concern.sufficiency = mapSufficiency(discoveryState);
  concern.evidenceConfidence = Number.isFinite(discoveryState.evidenceConfidence)
    ? Math.max(0, Math.min(1, discoveryState.evidenceConfidence))
    : null;
  concern.unresolvedReasons = [...(discoveryState.unresolvedReasons ?? [])];
  concern.memberImportance = discoveryState.importance ?? null;
  concern.immediacy = discoveryState.immediacy ?? null;
  concern.readiness = discoveryState.readiness ?? null;
  concern.evidenceRefs = unique([...(discoveryState.evidenceRefs ?? [])]);
  concern.observationRefs = unique([...(discoveryState.observationRefs ?? [])]);
  concern.lastObservedAt = discoveryState.lastObservedAt ?? null;
  concern.lastDerivedAt = now;

  memberState.concerns[concern.concernId] = concern;
  const dimension = memberState.dimensions[concern.dimensionId];
  dimension.concernIds = unique([...dimension.concernIds, concern.concernId]);
  dimension.topicIds = unique([...dimension.topicIds, ...concern.topicIds]);
  dimension.evidenceRefs = unique([...dimension.evidenceRefs, ...concern.evidenceRefs]);
  dimension.lastObservedAt = concern.lastObservedAt ?? dimension.lastObservedAt;
  dimension.lastDerivedAt = now;
  memberState.revision += 1;
  memberState.updatedAt = now;

  const errors = validateMemberStateShape(memberState);
  if (errors.length) throw new Error(`Projected Member State invalid: ${errors.join('; ')}`);
  return memberState;
}
