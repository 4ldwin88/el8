// Canonical Prioritization for the vertical slice.
// Ranks eligible Member State concerns while preserving provenance and explicit rationale.
// Decision factors are ephemeral mechanics, not Member State or wellness scores.

import { isConcernId } from '../state/taxonomy.js';

export const PRIORITIZATION_SCHEMA_VERSION = '0.2.0';

const STATUS_ORDER = Object.freeze({ active: 0, candidate: 1, unknown: 2 });
const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));

function factorFor(factors, concernId, key, fallback) {
  const value = factors?.[concernId]?.[key] ?? factors?.[key]?.[concernId];
  return value == null ? fallback : clamp01(value);
}

function decisionProfile(concern, factors = {}) {
  const active = concern.status === 'active';
  return {
    memberImportance: factorFor(factors, concern.concernId, 'memberImportance', active ? 0.6 : 0.4),
    urgency: factorFor(factors, concern.concernId, 'urgency', active ? 0.55 : 0.35),
    materiality: factorFor(factors, concern.concernId, 'materiality', active ? 0.6 : 0.4),
    leverage: factorFor(factors, concern.concernId, 'leverage', 0.5),
    readiness: factorFor(factors, concern.concernId, 'readiness', 0.5),
    capacity: factorFor(factors, concern.concernId, 'capacity', 0.6),
    expectedBenefit: factorFor(factors, concern.concernId, 'expectedBenefit', 0.5),
    burden: factorFor(factors, concern.concernId, 'burden', 0.35),
    confidence: factorFor(factors, concern.concernId, 'confidence', concern.sufficiency === 'sufficient' ? 0.7 : 0.35),
  };
}

function compareProfiles(a, b) {
  // Preserve supported active concerns as the primary semantic boundary, then use
  // explicit decision factors as deterministic tie-breakers. No aggregate wellness
  // score is created or stored.
  const statusDifference = STATUS_ORDER[a.concern.status] - STATUS_ORDER[b.concern.status];
  if (statusDifference !== 0) return statusDifference;

  const order = ['urgency', 'materiality', 'memberImportance', 'leverage', 'expectedBenefit', 'readiness', 'capacity', 'confidence'];
  for (const key of order) {
    const difference = b.profile[key] - a.profile[key];
    if (difference !== 0) return difference;
  }
  const burdenDifference = a.profile.burden - b.profile.burden;
  if (burdenDifference !== 0) return burdenDifference;
  return a.concern.concernId.localeCompare(b.concern.concernId);
}

function rationaleCodes(concern, profile) {
  const codes = [concern.status === 'active' ? 'supported_concern' : 'candidate_concern'];
  if (profile.memberImportance >= 0.7) codes.push('member_importance');
  if (profile.urgency >= 0.7) codes.push('high_urgency');
  if (profile.materiality >= 0.7) codes.push('high_materiality');
  if (profile.leverage >= 0.7) codes.push('shared_driver_leverage');
  if (profile.expectedBenefit >= 0.7) codes.push('expected_benefit');
  if (profile.readiness < 0.35 || profile.capacity < 0.35) codes.push('readiness_or_capacity_constraint');
  if (profile.burden >= 0.7) codes.push('high_burden');
  if (profile.confidence < 0.4) codes.push('low_confidence');
  return codes;
}

export function prioritizeMemberState(memberState, { safetyDisposition = null, decisionFactors = {}, now = new Date().toISOString() } = {}) {
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

  const ranked = eligible
    .filter(concern => ['active', 'candidate'].includes(concern.status))
    .map(concern => ({ concern, profile: decisionProfile(concern, decisionFactors) }))
    .sort(compareProfiles);

  const priorityItems = ranked.map(({ concern, profile }, index) => ({
    priorityId: `priority:${concern.concernId}`,
    rank: index + 1,
    concernId: concern.concernId,
    status: concern.status,
    sufficiency: concern.sufficiency,
    evidenceRefs: [...concern.evidenceRefs],
    observationRefs: [...concern.observationRefs],
    rationaleCodes: rationaleCodes(concern, profile),
    decisionFactors: profile,
  }));

  return {
    schemaVersion: PRIORITIZATION_SCHEMA_VERSION,
    createdAt: now,
    blockedBySafety: false,
    priorityItems,
    unresolvedConcernIds: eligible.filter(concern => concern.sufficiency === 'insufficient').map(concern => concern.concernId),
    rationaleCodes: ['multi_factor_priority_policy'],
  };
}
