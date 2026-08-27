'use strict';

const {
  assertMemberState,
  PRIORITY_STATUS,
  HYPOTHESIS_STATUS,
  CONSIDERATION_STATUS,
} = require('./member-state');

const UPDATE_TYPES = Object.freeze([
  'PROFILE_UPDATED', 'EVIDENCE_RECORDED', 'DIMENSION_UPDATED', 'PROBLEM_UPDATED',
  'HYPOTHESIS_UPDATED', 'PRIORITY_UPDATED', 'PLAN_UPDATED',
  'ENGAGEMENT_BURDEN_UPDATED', 'CAPACITY_THROTTLE_UPDATED',
  'CONSIDERATION_UPDATED', 'LEARNING_RECORDED', 'SAFETY_UPDATED',
]);

const clone = (value) => JSON.parse(JSON.stringify(value));
const requireString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
};
const requireRefs = (refs, field) => {
  if (!Array.isArray(refs)) throw new Error(`${field} must be an array`);
  refs.forEach((ref) => requireString(ref, field));
};
function upsertById(items, value) {
  requireString(value?.id, 'id');
  const index = items.findIndex((item) => item.id === value.id);
  if (index === -1) return [...items, value];
  const next = [...items]; next[index] = { ...next[index], ...value }; return next;
}
function validatePayload(type, payload, state) {
  switch (type) {
    case 'EVIDENCE_RECORDED':
      requireString(payload.id, 'evidence id'); requireString(payload.provenance, 'evidence provenance');
      requireString(payload.observedAt || payload.recordedAt, 'evidence observedAt/recordedAt'); break;
    case 'HYPOTHESIS_UPDATED':
      requireString(payload.id, 'hypothesis id');
      if (payload.status && !HYPOTHESIS_STATUS.includes(payload.status)) throw new Error('invalid hypothesis status');
      if (payload.confidence != null && (!Number.isFinite(payload.confidence) || payload.confidence < 0 || payload.confidence > 1)) throw new Error('hypothesis confidence must be 0..1');
      requireRefs(payload.provenance || [], 'hypothesis provenance');
      if (payload.status === 'SUSPECTED' || payload.status === 'SUPPORTED') {
        requireString(payload.revalidationPolicy, 'hypothesis revalidationPolicy');
        requireString(payload.revalidateAfter, 'hypothesis revalidateAfter');
      }
      break;
    case 'PRIORITY_UPDATED':
      requireString(payload.id, 'priority id');
      if (!PRIORITY_STATUS.includes(payload.status)) throw new Error('invalid priority status');
      if (['ACCEPTED','REJECTED','POSTPONED','PAUSED'].includes(payload.status)) requireString(payload.memberDecisionAt, 'priority memberDecisionAt');
      break;
    case 'PLAN_UPDATED':
      if (payload.planId != null) requireString(payload.planId, 'planId');
      if (payload.interventions?.length) {
        const accepted = state.priorities.filter((p) => p.status === 'ACCEPTED').map((p) => p.id);
        if (!accepted.length) throw new Error('active interventions require an accepted member priority');
        payload.interventions.forEach((i) => {
          requireString(i.id, 'intervention id'); requireString(i.priorityId, 'intervention priorityId');
          if (!accepted.includes(i.priorityId)) throw new Error('intervention must belong to an accepted member priority');
        });
      }
      break;
    case 'CONSIDERATION_UPDATED':
      requireString(payload.id, 'consideration id');
      if (!CONSIDERATION_STATUS.includes(payload.status)) throw new Error('invalid consideration status'); break;
    case 'LEARNING_RECORDED':
      requireString(payload.id, 'learning id'); requireString(payload.learnedAt, 'learning learnedAt');
      requireRefs(payload.evidenceRefs, 'learning evidenceRefs');
      if (!payload.evidenceRefs.length) throw new Error('learning evidenceRefs must contain at least one evidence reference');
      break;
    default: break;
  }
}

/** Apply one optimistic-concurrency domain update. */
function applyMemberStateUpdate(state, update) {
  assertMemberState(state);
  if (!update || !UPDATE_TYPES.includes(update.type)) throw new Error(`unsupported member state update: ${update && update.type}`);
  if (!Number.isInteger(update.expectedRevision)) throw new Error('update.expectedRevision is required');
  if (update.expectedRevision !== state.revision) throw new Error(`member state revision conflict: expected ${update.expectedRevision}, actual ${state.revision}`);
  requireString(update.at, 'update.at'); requireString(update.source, 'update.source');
  const next = clone(state), payload = clone(update.payload || {});
  validatePayload(update.type, payload, state);

  switch (update.type) {
    case 'PROFILE_UPDATED': next.profile = { ...next.profile, ...payload }; break;
    case 'EVIDENCE_RECORDED': next.evidence = upsertById(next.evidence, payload); break;
    case 'DIMENSION_UPDATED': {
      const { dimension, ...patch } = payload;
      if (!next.dimensions[dimension]) throw new Error(`unknown dimension: ${dimension}`);
      next.dimensions[dimension] = { ...next.dimensions[dimension], ...patch, updatedAt: update.at }; break;
    }
    case 'PROBLEM_UPDATED': next.problems = upsertById(next.problems, payload); break;
    case 'HYPOTHESIS_UPDATED': next.hypotheses = upsertById(next.hypotheses, payload); break;
    case 'PRIORITY_UPDATED': next.priorities = upsertById(next.priorities, payload); break;
    case 'PLAN_UPDATED': next.activePlan = { ...next.activePlan, ...payload, updatedAt: update.at }; break;
    case 'ENGAGEMENT_BURDEN_UPDATED': next.engagementBurden = { ...next.engagementBurden, ...payload, updatedAt: update.at }; break;
    case 'CAPACITY_THROTTLE_UPDATED': next.engagementBurden.throttle = { ...next.engagementBurden.throttle, ...payload }; next.engagementBurden.updatedAt = update.at; break;
    case 'CONSIDERATION_UPDATED': next.considerations = upsertById(next.considerations, payload); break;
    case 'LEARNING_RECORDED': next.learning = upsertById(next.learning, payload); break;
    case 'SAFETY_UPDATED': next.safety = { ...next.safety, ...payload, updatedAt: update.at }; break;
    default: throw new Error(`unhandled member state update: ${update.type}`);
  }
  next.revision += 1; next.updatedAt = update.at;
  next.history.push({ revision: next.revision, previousRevision: state.revision, type: update.type, at: update.at, source: update.source, reason: update.reason || null, refs: Array.isArray(update.refs) ? [...update.refs] : [] });
  return assertMemberState(next);
}

module.exports = { UPDATE_TYPES, applyMemberStateUpdate };
