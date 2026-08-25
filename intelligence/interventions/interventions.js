// Thin canonical Intervention layer for the vertical slice.
// It turns eligible plan candidates into intervention candidates while preserving provenance.
// It does not select clinical treatment or encode a full intervention library.

export const INTERVENTION_SCHEMA_VERSION = '0.1.0';

export function createInterventionCandidates(plan, { now = new Date().toISOString() } = {}) {
  if (!plan || !Array.isArray(plan.planItems)) throw new Error('plan.planItems is required');

  if (plan.blockedBySafety) {
    return {
      schemaVersion: INTERVENTION_SCHEMA_VERSION,
      createdAt: now,
      blockedBySafety: true,
      interventionCandidates: [],
      unresolvedConcernIds: [...(plan.unresolvedConcernIds ?? [])],
      rationaleCodes: ['safety_override'],
    };
  }

  const interventionCandidates = plan.planItems
    .filter(item => item.state === 'candidate')
    .map(item => ({
      interventionId: `intervention:${item.concernId}`,
      planItemId: item.planItemId,
      concernId: item.concernId,
      state: 'candidate',
      evidenceRefs: [...(item.evidenceRefs ?? [])],
      observationRefs: [...(item.observationRefs ?? [])],
      rationaleCodes: ['eligible_plan_candidate'],
    }));

  return {
    schemaVersion: INTERVENTION_SCHEMA_VERSION,
    createdAt: now,
    blockedBySafety: false,
    interventionCandidates,
    unresolvedConcernIds: [...(plan.unresolvedConcernIds ?? [])],
    rationaleCodes: ['thin_vertical_slice_policy'],
  };
}
