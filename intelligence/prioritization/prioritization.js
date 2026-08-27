// Canonical EL8 Prioritization.
// Answers one question only: among established concerns, what matters most now?
// It ranks concerns; Discovery owns evidence sufficiency and Planning owns action feasibility.

import { isConcernId } from '../state/taxonomy.js';

export const PRIORITIZATION_SCHEMA_VERSION = '0.3.0';

const STATUS_ORDER = Object.freeze({ active: 0, candidate: 1 });
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
  };
}

function compareProfiles(a, b) {
  const statusDifference = STATUS_ORDER[a.concern.status] - STATUS_ORDER[b.concern.status];
  if (statusDifference !== 0) return statusDifference;

  for (const key of ['urgency', 'materiality', 'memberImportance', 'leverage']) {
    const difference = b.profile[key] - a.profile[key];
    if (difference !== 0) return difference;
  }
  return a.concern.concernId.localeCompare(b.concern.concernId);
}

function rationaleCodes(concern, profile) {
  const codes = [concern.status === 'active' ? 'supported_concern' : 'candidate_concern'];
  if (profile.memberImportance >= 0.7) codes.push('member_importance');
  if (profile.urgency >= 0.7) codes.push('high_urgency');
  if (profile.materiality >= 0.7) codes.push('high_materiality');
  if (profile.leverage >= 0.7) codes.push('shared_driver_leverage');
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
      rationaleCodes: ['safety_override'],
    };
  }

  const ranked = Object.values(memberState.concerns)
    .filter(concern => isConcernId(concern.concernId))
    .filter(concern => ['active', 'candidate'].includes(concern.status))
    .map(concern => ({ concern, profile: decisionProfile(concern, decisionFactors) }))
    .sort(compareProfiles);

  const priorityItems = ranked.map(({ concern, profile }, index) => ({
    priorityId: `priority:${concern.concernId}`,
    rank: index + 1,
    concernId: concern.concernId,
    status: concern.status,
    evidenceRefs: [...(concern.evidenceRefs ?? [])],
    observationRefs: [...(concern.observationRefs ?? [])],
    rationaleCodes: rationaleCodes(concern, profile),
    decisionFactors: profile,
  }));

  return {
    schemaVersion: PRIORITIZATION_SCHEMA_VERSION,
    createdAt: now,
    blockedBySafety: false,
    priorityItems,
    rationaleCodes: ['priority_policy'],
  };
}
