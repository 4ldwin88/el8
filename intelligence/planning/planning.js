// Thin canonical Planning stub for the vertical slice.
// Converts proven priority items into explainable plan candidates without pretending to be the final planner.

export const PLANNING_SCHEMA_VERSION = '0.1.0';

export function createPlanFromPriorities(prioritization, { now = new Date().toISOString() } = {}) {
  if (!prioritization || !Array.isArray(prioritization.priorityItems)) {
    throw new Error('prioritization.priorityItems is required');
  }

  if (prioritization.blockedBySafety) {
    return {
      schemaVersion: PLANNING_SCHEMA_VERSION,
      createdAt: now,
      blockedBySafety: true,
      planItems: [],
      unresolvedConcernIds: [...(prioritization.unresolvedConcernIds ?? [])],
      rationaleCodes: ['safety_override'],
    };
  }

  const planItems = prioritization.priorityItems
    .filter(item => item.status === 'active' && item.sufficiency === 'sufficient')
    .map(item => ({
      planItemId: `plan:${item.concernId}`,
      concernId: item.concernId,
      priorityId: item.priorityId,
      priorityRank: item.rank,
      state: 'candidate',
      evidenceRefs: [...(item.evidenceRefs ?? [])],
      observationRefs: [...(item.observationRefs ?? [])],
      rationaleCodes: ['supported_priority'],
    }));

  return {
    schemaVersion: PLANNING_SCHEMA_VERSION,
    createdAt: now,
    blockedBySafety: false,
    planItems,
    unresolvedConcernIds: [...(prioritization.unresolvedConcernIds ?? [])],
    rationaleCodes: ['thin_vertical_slice_policy'],
  };
}
