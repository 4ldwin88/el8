// Canonical Intervention layer for the vertical slice.
// Turns eligible plan candidates into intervention candidates while preserving provenance.
// Response-mode routing is conservative and least-burdensome; it is not clinical treatment selection.

export const INTERVENTION_SCHEMA_VERSION = '0.2.0';
const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));

function factorFor(context, concernId, key, fallback) {
  const value = context?.[concernId]?.[key] ?? context?.[key]?.[concernId];
  return value == null ? fallback : clamp01(value);
}

export function selectResponseMode(item, context = {}) {
  const id = item.concernId;
  const uncertainty = factorFor(context, id, 'uncertainty', 0);
  const readiness = factorFor(context, id, 'readiness', 0.5);
  const capacity = factorFor(context, id, 'capacity', 0.6);
  const feasibility = factorFor(context, id, 'feasibility', 0.6);
  const trackability = factorFor(context, id, 'trackability', 0.5);
  const knowledgeGap = factorFor(context, id, 'knowledgeGap', 0);
  const reassessmentDue = context?.[id]?.reassessmentDue === true || context?.reassessmentDue?.[id] === true;

  if (reassessmentDue) return { mode: 'reassessment', reason: 'stale_or_change_check', burden: 'medium' };
  if (uncertainty >= 0.6) return { mode: 'deeper_assessment', reason: 'decision_uncertainty', burden: 'low' };
  if (readiness < 0.35 || capacity < 0.35) {
    return knowledgeGap >= 0.55
      ? { mode: 'education', reason: 'readiness_or_capacity_knowledge_gap', burden: 'low' }
      : { mode: 'tracking', reason: 'readiness_or_capacity_observe_first', burden: 'low' };
  }
  if (feasibility < 0.35) return { mode: 'tracking', reason: 'not_yet_actionable', burden: 'low' };
  if (knowledgeGap >= 0.65) return { mode: 'education', reason: 'knowledge_before_action', burden: 'low' };
  if (trackability >= 0.7 && readiness < 0.6) return { mode: 'tracking', reason: 'measure_before_action', burden: 'low' };
  return { mode: 'action', reason: 'ready_and_actionable', burden: readiness >= 0.75 && capacity >= 0.6 ? 'normal' : 'low' };
}

export function createInterventionCandidates(plan, { responseContext = {}, now = new Date().toISOString() } = {}) {
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
    .map(item => {
      const response = selectResponseMode(item, responseContext);
      return {
        interventionId: `intervention:${item.concernId}`,
        planItemId: item.planItemId,
        concernId: item.concernId,
        state: 'candidate',
        responseMode: response.mode,
        expectedBurden: response.burden,
        evidenceRefs: [...(item.evidenceRefs ?? [])],
        observationRefs: [...(item.observationRefs ?? [])],
        rationaleCodes: ['eligible_plan_candidate', response.reason],
      };
    });

  return {
    schemaVersion: INTERVENTION_SCHEMA_VERSION,
    createdAt: now,
    blockedBySafety: false,
    interventionCandidates,
    unresolvedConcernIds: [...(plan.unresolvedConcernIds ?? [])],
    rationaleCodes: ['least_burdensome_response_policy'],
  };
}
