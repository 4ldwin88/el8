'use strict';

const ALLOWED_FRICTIONS = new Set([
  'time',
  'energy',
  'emotional_bandwidth',
  'money',
  'access',
  'confidence',
  'readiness',
  'other'
]);

function normalizeIds(values = []) {
  return [...new Set(values.map(String))];
}

function capturePriorityOverride({ recommendedPriorities = [], confirmedPriorities = [], frictions = [] } = {}) {
  const recommended = normalizeIds(recommendedPriorities);
  const confirmed = normalizeIds(confirmedPriorities);
  const changed = recommended.length > 0 && (
    recommended.length !== confirmed.length ||
    recommended.some(id => !confirmed.includes(id))
  );

  if (!changed) {
    return { overridden: false, recommended, confirmed, frictions: [], constraints: [], capacitySignal: null };
  }

  const normalized = frictions
    .map(value => typeof value === 'string' ? { type: value } : { ...value })
    .filter(value => ALLOWED_FRICTIONS.has(value.type))
    .map(value => ({ type: value.type, concernId: value.concernId || null, note: value.note || null }));

  const constraints = normalized.map(value => value.type);
  const lowCapacity = normalized.some(value => ['energy', 'emotional_bandwidth', 'readiness'].includes(value.type));

  return {
    overridden: true,
    recommended,
    confirmed,
    frictions: normalized,
    constraints,
    capacitySignal: lowCapacity ? 'low' : null
  };
}

module.exports = { ALLOWED_FRICTIONS, capturePriorityOverride };
