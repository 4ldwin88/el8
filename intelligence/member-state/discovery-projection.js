'use strict';

/** Migration projection only. Converts current Discovery trace/session output
 * into canonical durable Discovery results without carrying its legacy
 * prioritization/planning fields across the boundary. */
function iso(value, fallback) {
  if (typeof value === 'string' && value) return value;
  if (Number.isFinite(value)) return new Date(value).toISOString();
  return fallback;
}
function unique(values) { return [...new Set(values.filter(Boolean))]; }

// Canonical status follows Discovery's explicit resolution semantics. Numerical
// evidence confidence remains descriptive metadata; it never decides whether a
// problem is established.
function problemStatus(state) {
  if (state.excluded || state.resolutionState === 'nonIssue') return 'CONTRADICTED';
  if (state.resolutionState === 'sufficient') return 'SUPPORTED';
  if (state.resolutionState === 'deferred') return 'DEFERRED';
  if (state.resolutionState === 'escalated') return 'ESCALATED';
  return 'UNRESOLVED';
}
function projectDiscoveryTrace(trace, { memberStateRevision, at = new Date().toISOString(), revalidationPolicy = 'relationship-v1' } = {}) {
  if (!Number.isInteger(memberStateRevision) || memberStateRevision < 0) throw new Error('memberStateRevision is required');
  if (!trace || typeof trace !== 'object') throw new Error('Discovery trace is required');

  const observations = Array.isArray(trace.observations) ? trace.observations : [];
  const states = Array.isArray(trace.states) ? trace.states : [];
  const evidence = observations.map((o, index) => ({
    id: o.id || `discovery:${o.questionId || 'observation'}:${index}`,
    kind: 'DISCOVERY_OBSERVATION', value: o.answerValue ?? null,
    provenance: 'DISCOVERY_ANSWER', recordedAt: iso(o.timestamp, at),
    questionId: o.questionId || null, concernId: o.concernId || null,
    effects: Array.isArray(o.effects) ? o.effects : [],
  }));
  const evidenceIds = evidence.map((e) => e.id);

  const problemUpdates = states.map((s) => ({
    id: `problem:${s.concernId}`, legacyConcernId: s.concernId,
    status: problemStatus(s), confidence: s.evidenceConfidence ?? null,
    discoveryResolution: s.resolutionState || null,
    temporality: s.temporality || 'unknown',
    evidenceRefs: unique(observations.filter((o) => o.concernId === s.concernId || o.effects?.some((e) => e.target === s.concernId)).map((o, i) => o.id || `discovery:${o.questionId || 'observation'}:${i}`)),
  }));

  const relationshipEffects = observations.flatMap((o, oi) => (o.effects || []).filter((e) => e.type === 'relationship' && e.from && e.to).map((e, ei) => ({ o, oi, e, ei })));
  const hypothesisUpdates = relationshipEffects.map(({ o, oi, e, ei }) => ({
    id: e.id || `hypothesis:${e.from}:${e.to}:${o.id || oi}:${ei}`,
    relationship: [e.from, e.to],
    status: e.memberConfirmed ? 'MEMBER_CONFIRMED' : 'SUSPECTED',
    confidence: Number.isFinite(e.confidence) ? Math.max(0, Math.min(1, e.confidence)) : 0.35,
    provenance: [o.id || `discovery:${o.questionId || 'observation'}:${oi}`],
    lastValidatedAt: e.memberConfirmed ? iso(o.timestamp, at) : null,
    revalidationPolicy,
    revalidateAfter: e.memberConfirmed ? null : e.revalidateAfter || at,
  }));

  return { memberStateRevision, evidenceRefs: evidenceIds, evidence, problemUpdates, hypothesisUpdates, dimensionUpdates: [], deepeningRequests: [] };
}

module.exports = { projectDiscoveryTrace };
