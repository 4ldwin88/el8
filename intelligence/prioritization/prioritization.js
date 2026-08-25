// Thin canonical Prioritization stub for the vertical slice.
// This is deliberately not a final ranking engine. It proves the boundary and preserves explainability.

import { isConcernId } from '../state/taxonomy.js';

export const PRIORITIZATION_SCHEMA_VERSION = '0.1.0';

const STATUS_ORDER = Object.freeze({ active: 0, candidate: 1, unknown: 2 });

export function prioritizeMemberState(memberState, { safetyDisposition = null, now = new Date().toISOString() } = {}) {
  if (!memberState?.concerns) throw new Error('memberState.concerns is required');

  const blocked = ['pause_ordinary_flow', 'escalate'].includes(safetyDisposition?.disposition);
  if (blocked) {
    return {
      schemaVersion: PRIORITIZATION_SCHEMA_VERSION,
      createdAt: now,
      blockedBySafety: true,
      priorityItems: [],
      unresolvedConcernIds: [],
      rationaleCodes: ['safety_override'],
    };
  }

  const eligible = Object.values(memberState.concerns)
    .filter(concern => isConcernId(concern.concernId))
    .filter(concern => !['excluded', 'resolved'].includes(concern.status));

  const priorityItems = eligible
    .filter(concern => ['active', 'candidate'].includes(concern.status))
    .sort((a, b) => {
      const statusDifference = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (statusDifference !== 0) return statusDifference;
      return a.concernId.localeCompare(b.concernId);
    })
    .map((concern, index) => ({
      priorityId: `priority:${concern.concernId}`,
      rank: index + 1,
      concernId: concern.concernId,
      status: concern.status,
      sufficiency: concern.sufficiency,
      evidenceRefs: [...concern.evidenceRefs],
      observationRefs: [...concern.observationRefs],
      rationaleCodes: [concern.status === 'active' ? 'supported_concern' : 'candidate_concern'],
    }));

  return {
    schemaVersion: PRIORITIZATION_SCHEMA_VERSION,
    createdAt: now,
    blockedBySafety: false,
    priorityItems,
    unresolvedConcernIds: eligible.filter(concern => concern.sufficiency === 'insufficient').map(concern => concern.concernId),
    rationaleCodes: ['thin_vertical_slice_policy'],
  };
}
