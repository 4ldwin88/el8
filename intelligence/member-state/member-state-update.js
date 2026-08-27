'use strict';

const { assertMemberState } = require('./member-state');

const UPDATE_TYPES = Object.freeze([
  'PROFILE_UPDATED',
  'EVIDENCE_RECORDED',
  'DIMENSION_UPDATED',
  'PROBLEM_UPDATED',
  'HYPOTHESIS_UPDATED',
  'PRIORITY_UPDATED',
  'PLAN_UPDATED',
  'ENGAGEMENT_BURDEN_UPDATED',
  'CAPACITY_THROTTLE_UPDATED',
  'CONSIDERATION_UPDATED',
  'LEARNING_RECORDED',
  'SAFETY_UPDATED',
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function upsertById(items, value, idField = 'id') {
  if (!value || !value[idField]) throw new Error(`${idField} is required`);
  const index = items.findIndex((item) => item[idField] === value[idField]);
  if (index === -1) return [...items, value];
  const next = [...items];
  next[index] = { ...next[index], ...value };
  return next;
}

/**
 * Applies one explicit domain update. This is intentionally deterministic and
 * side-effect free. Persistence, authorization and event transport belong
 * outside the Member State domain.
 */
function applyMemberStateUpdate(state, update) {
  assertMemberState(state);
  if (!update || !UPDATE_TYPES.includes(update.type)) {
    throw new Error(`unsupported member state update: ${update && update.type}`);
  }
  if (!update.at) throw new Error('update.at is required');
  if (!update.source) throw new Error('update.source is required');

  const next = clone(state);
  const payload = clone(update.payload || {});

  switch (update.type) {
    case 'PROFILE_UPDATED':
      next.profile = { ...next.profile, ...payload };
      break;
    case 'EVIDENCE_RECORDED':
      if (!payload.id) throw new Error('evidence id is required');
      next.evidence = upsertById(next.evidence, payload);
      break;
    case 'DIMENSION_UPDATED': {
      const { dimension, ...patch } = payload;
      if (!next.dimensions[dimension]) throw new Error(`unknown dimension: ${dimension}`);
      next.dimensions[dimension] = { ...next.dimensions[dimension], ...patch, updatedAt: update.at };
      break;
    }
    case 'PROBLEM_UPDATED':
      next.problems = upsertById(next.problems, payload);
      break;
    case 'HYPOTHESIS_UPDATED':
      next.hypotheses = upsertById(next.hypotheses, payload);
      break;
    case 'PRIORITY_UPDATED':
      next.priorities = upsertById(next.priorities, payload);
      break;
    case 'PLAN_UPDATED':
      next.activePlan = { ...next.activePlan, ...payload, updatedAt: update.at };
      break;
    case 'ENGAGEMENT_BURDEN_UPDATED':
      next.engagementBurden = { ...next.engagementBurden, ...payload, updatedAt: update.at };
      break;
    case 'CAPACITY_THROTTLE_UPDATED':
      next.engagementBurden.throttle = {
        ...next.engagementBurden.throttle,
        ...payload,
      };
      next.engagementBurden.updatedAt = update.at;
      break;
    case 'CONSIDERATION_UPDATED':
      next.considerations = upsertById(next.considerations, payload);
      break;
    case 'LEARNING_RECORDED':
      if (!payload.id) throw new Error('learning id is required');
      next.learning = upsertById(next.learning, payload);
      break;
    case 'SAFETY_UPDATED':
      next.safety = { ...next.safety, ...payload, updatedAt: update.at };
      break;
    default:
      throw new Error(`unhandled member state update: ${update.type}`);
  }

  next.revision += 1;
  next.updatedAt = update.at;
  next.history.push({
    revision: next.revision,
    type: update.type,
    at: update.at,
    source: update.source,
    reason: update.reason || null,
    refs: Array.isArray(update.refs) ? [...update.refs] : [],
  });

  return assertMemberState(next);
}

module.exports = {
  UPDATE_TYPES,
  applyMemberStateUpdate,
};
