// Canonical EL8 Intelligence belief-state contract.
// Facts/evidence are the source of truth. Derived states must remain traceable to them.

import {
  DIMENSIONS,
  isDimensionId,
  isTopicId,
  isConcernId,
  CONCERN_BY_ID,
  TAXONOMY_VERSION,
} from './taxonomy.js';

export const CONDITION_STATUS = Object.freeze(['unknown', 'need_attention', 'stable', 'healthy', 'thriving']);
export const COVERAGE_STATUS = Object.freeze(['unknown', 'insufficient', 'sufficient']);
export const CONCERN_STATUS = Object.freeze(['unknown', 'candidate', 'supported', 'active', 'cleared', 'resolved']);
export const HYPOTHESIS_STATUS = Object.freeze(['generated', 'corroborating', 'contradicted', 'inconclusive', 'eligible_for_confirmation', 'member_confirmed', 'rejected', 'deferred']);
export const CONFIRMATION_STATUS = Object.freeze(['not_required', 'pending', 'confirmed', 'rejected', 'deferred']);
export const FACT_STATUS = Object.freeze(['current', 'superseded', 'retracted']);
export const SUFFICIENCY_STATUS = Object.freeze(['insufficient', 'sufficient']);
export const MEMBER_STATE_SCHEMA_VERSION = '2.0.0';

function isoNow() { return new Date().toISOString(); }

export function createMemberState({ memberId = null, now = isoNow() } = {}) {
  return {
    schemaVersion: MEMBER_STATE_SCHEMA_VERSION,
    taxonomyVersion: TAXONOMY_VERSION,
    memberId,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    dimensions: Object.fromEntries(DIMENSIONS.map(({ id: dimensionId }) => [dimensionId, {
      dimensionId,
      conditionState: 'unknown',
      coverageState: 'unknown',
      coverageEvidenceRefs: [],
      topicIds: [],
      concernIds: [],
      strengthIds: [],
      constraintIds: [],
      evidenceRefs: [],
      lastObservedAt: null,
      lastDerivedAt: null,
    }])),
    concerns: {},
    facts: {},
    hypotheses: {},
    indicators: {},
    goals: {},
    constraints: {},
    activePriorities: [],
    plan: null,
    reviewCycles: [],
    memberContext: { priorityConcernIds: [], preferences: {}, readiness: null, capacity: null },
    safety: { active: false, highestLevel: 0, signalRefs: [], updatedAt: null },
    historyRefs: [],
  };
}

export function createConcernState({ concernId, status = 'unknown', now = isoNow() } = {}) {
  if (!isConcernId(concernId)) throw new Error(`Unknown concernId: ${concernId}`);
  if (!CONCERN_STATUS.includes(status)) throw new Error(`Unknown concern status: ${status}`);
  const definition = CONCERN_BY_ID[concernId];
  return {
    concernId,
    dimensionId: definition.dimensionId,
    topicIds: [...definition.topicIds],
    status,
    memberConfirmed: false,
    evidenceConfidence: null,
    sufficiency: 'insufficient',
    unresolvedReasons: [],
    memberImportance: null,
    memberPriority: false,
    functionalImpact: null,
    immediacy: null,
    readiness: null,
    temporality: 'unknown',
    factIds: [],
    evidenceRefs: [],
    observationRefs: [],
    indicatorIds: [],
    hypothesisIds: [],
    activeActionIds: [],
    firstObservedAt: null,
    lastObservedAt: null,
    lastDerivedAt: now,
  };
}

export function createFact({ factId, semanticKey, value = null, sourceType, sourceRef, affectedConcernId = null, affectedDimensionId = null, observedAt = isoNow(), timeWindow = null, reliability = null, memberConfirmed = false, currentStatus = 'current' } = {}) {
  if (!factId || !semanticKey || !sourceType || !sourceRef) throw new Error('factId, semanticKey, sourceType and sourceRef are required');
  if (affectedConcernId !== null && !isConcernId(affectedConcernId)) throw new Error(`Unknown concernId: ${affectedConcernId}`);
  if (affectedDimensionId !== null && !isDimensionId(affectedDimensionId)) throw new Error(`Unknown dimensionId: ${affectedDimensionId}`);
  if (!FACT_STATUS.includes(currentStatus)) throw new Error(`Unknown fact status: ${currentStatus}`);
  return { factId, semanticKey, value, sourceType, sourceRef, affectedConcernId, affectedDimensionId, observedAt, timeWindow, reliability, memberConfirmed, currentStatus };
}

export function createHypothesis({ hypothesisId, proposition, linkedConcernIds = [], linkedDimensionIds = [], status = 'generated', confirmationStatus = 'not_required', now = isoNow() } = {}) {
  if (!hypothesisId || !proposition) throw new Error('hypothesisId and proposition are required');
  if (!HYPOTHESIS_STATUS.includes(status)) throw new Error(`Unknown hypothesis status: ${status}`);
  if (!CONFIRMATION_STATUS.includes(confirmationStatus)) throw new Error(`Unknown confirmation status: ${confirmationStatus}`);
  for (const id of linkedConcernIds) if (!isConcernId(id)) throw new Error(`Unknown concernId: ${id}`);
  for (const id of linkedDimensionIds) if (!isDimensionId(id)) throw new Error(`Unknown dimensionId: ${id}`);
  return { hypothesisId, proposition, linkedConcernIds: [...linkedConcernIds], linkedDimensionIds: [...linkedDimensionIds], evidenceFor: [], evidenceAgainst: [], status, confirmationStatus, createdAt: now, lastDerivedAt: now };
}

export function createIndicator({ indicatorId, definition, concernId = null, dimensionId = null, unitOrScale = null, directionality = null } = {}) {
  if (!indicatorId || !definition) throw new Error('indicatorId and definition are required');
  if (concernId !== null && !isConcernId(concernId)) throw new Error(`Unknown concernId: ${concernId}`);
  if (dimensionId !== null && !isDimensionId(dimensionId)) throw new Error(`Unknown dimensionId: ${dimensionId}`);
  return { indicatorId, definition, concernId, dimensionId, unitOrScale, directionality, observations: [], trajectory: 'unknown' };
}

// Compatibility aliases while downstream engines migrate from driver terminology.
export const createDriverState = ({ driverId, label = null, originDimensionId = null, now = isoNow() } = {}) => createHypothesis({ hypothesisId: driverId, proposition: label ?? driverId, linkedDimensionIds: originDimensionId ? [originDimensionId] : [], now });
export function createDriverRelationship({ relationshipId, driverId, concernId, status = 'candidate', now = isoNow() } = {}) {
  const mapped = status === 'supported' ? 'corroborating' : status === 'excluded' ? 'rejected' : HYPOTHESIS_STATUS.includes(status) ? status : 'generated';
  return { relationshipId, hypothesisId: driverId, concernId, status: mapped, sufficiency: 'insufficient', evidenceRefs: [], observationRefs: [], temporality: 'unknown', lastDerivedAt: now };
}

export function validateMemberStateShape(state) {
  const errors = [];
  if (!state || typeof state !== 'object') return ['state must be an object'];
  if (state.schemaVersion !== MEMBER_STATE_SCHEMA_VERSION) errors.push('unsupported schemaVersion');
  if (state.taxonomyVersion !== TAXONOMY_VERSION) errors.push('unsupported taxonomyVersion');
  if (!Number.isInteger(state.revision) || state.revision < 0) errors.push('revision must be a non-negative integer');
  for (const key of ['dimensions','concerns','facts','hypotheses','indicators','goals','constraints']) if (!state[key] || typeof state[key] !== 'object') errors.push(`${key} must be an object`);
  if (!Array.isArray(state.activePriorities)) errors.push('activePriorities must be an array');
  if (!Array.isArray(state.reviewCycles)) errors.push('reviewCycles must be an array');

  for (const { id: dimensionId } of DIMENSIONS) {
    const d = state.dimensions?.[dimensionId];
    if (!d) { errors.push(`missing dimension: ${dimensionId}`); continue; }
    if (!CONDITION_STATUS.includes(d.conditionState)) errors.push(`invalid condition state: ${dimensionId}`);
    if (!COVERAGE_STATUS.includes(d.coverageState)) errors.push(`invalid coverage state: ${dimensionId}`);
    if (d.coverageState !== 'sufficient' && d.conditionState === 'stable' && d.evidenceRefs.length === 0) errors.push(`unassessed dimension cannot default stable: ${dimensionId}`);
    for (const topicId of d.topicIds ?? []) if (!isTopicId(topicId)) errors.push(`unknown topic ${topicId}: ${dimensionId}`);
  }

  for (const [concernId, concern] of Object.entries(state.concerns ?? {})) {
    if (concern.concernId !== concernId) errors.push(`concern key/id mismatch: ${concernId}`);
    if (!isConcernId(concernId)) errors.push(`unknown concern: ${concernId}`);
    if (!CONCERN_STATUS.includes(concern.status)) errors.push(`invalid concern status: ${concernId}`);
    if (!SUFFICIENCY_STATUS.includes(concern.sufficiency)) errors.push(`invalid concern sufficiency: ${concernId}`);
  }
  for (const [factId, fact] of Object.entries(state.facts ?? {})) {
    if (fact.factId !== factId) errors.push(`fact key/id mismatch: ${factId}`);
    if (!fact.semanticKey || !fact.sourceType || !fact.sourceRef) errors.push(`fact missing provenance: ${factId}`);
    if (!FACT_STATUS.includes(fact.currentStatus)) errors.push(`invalid fact status: ${factId}`);
  }
  for (const [hypothesisId, h] of Object.entries(state.hypotheses ?? {})) {
    if (h.hypothesisId !== hypothesisId) errors.push(`hypothesis key/id mismatch: ${hypothesisId}`);
    if (!HYPOTHESIS_STATUS.includes(h.status)) errors.push(`invalid hypothesis status: ${hypothesisId}`);
    if (!CONFIRMATION_STATUS.includes(h.confirmationStatus)) errors.push(`invalid hypothesis confirmation: ${hypothesisId}`);
    if (h.status === 'member_confirmed' && h.confirmationStatus !== 'confirmed') errors.push(`confirmed hypothesis requires member confirmation: ${hypothesisId}`);
  }
  for (const concernId of state.activePriorities ?? []) {
    if (!state.concerns?.[concernId]) errors.push(`priority references unknown concern: ${concernId}`);
    else if (!state.concerns[concernId].memberConfirmed) errors.push(`priority concern must be member confirmed: ${concernId}`);
  }
  return errors;
}
