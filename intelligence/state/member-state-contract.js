// Canonical EL8 Intelligence Member State contract.
// State is a shared, derived substrate. Observations/evidence remain the source of truth.

import {
  DIMENSIONS,
  isDimensionId,
  isTopicId,
  isConcernId,
  CONCERN_BY_ID,
  TAXONOMY_VERSION,
} from './taxonomy.js';

export const CONCERN_STATUS = Object.freeze(['unknown', 'candidate', 'active', 'excluded', 'resolved']);
export const RELATIONSHIP_STATUS = Object.freeze(['candidate', 'supported', 'contradicted', 'excluded', 'resolved']);
export const SUFFICIENCY_STATUS = Object.freeze(['insufficient', 'sufficient']);
export const MEMBER_STATE_SCHEMA_VERSION = '1.1.0';

function isoNow() {
  return new Date().toISOString();
}

export function createMemberState({ memberId = null, now = isoNow() } = {}) {
  return {
    schemaVersion: MEMBER_STATE_SCHEMA_VERSION,
    taxonomyVersion: TAXONOMY_VERSION,
    memberId,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    dimensions: Object.fromEntries(
      DIMENSIONS.map(({ id: dimensionId }) => [dimensionId, {
        dimensionId,
        topicIds: [],
        concernIds: [],
        evidenceRefs: [],
        lastObservedAt: null,
        lastDerivedAt: null,
      }]),
    ),
    concerns: {},
    drivers: {},
    driverRelationships: {},
    memberContext: {
      priorityConcernIds: [],
      preferences: {},
      readiness: null,
      capacity: null,
    },
    safety: {
      active: false,
      highestLevel: 0,
      signalRefs: [],
      updatedAt: null,
    },
    historyRefs: [],
  };
}

export function createConcernState({
  concernId,
  status = 'unknown',
  now = isoNow(),
} = {}) {
  if (!isConcernId(concernId)) throw new Error(`Unknown concernId: ${concernId}`);
  if (!CONCERN_STATUS.includes(status)) throw new Error(`Unknown concern status: ${status}`);

  const definition = CONCERN_BY_ID[concernId];
  return {
    concernId,
    dimensionId: definition.dimensionId,
    topicIds: [...definition.topicIds],
    status,
    evidenceConfidence: null,
    sufficiency: 'insufficient',
    unresolvedReasons: [],
    driverRelationshipIds: [],
    memberImportance: null,
    memberPriority: false,
    immediacy: null,
    readiness: null,
    temporality: 'unknown',
    evidenceRefs: [],
    observationRefs: [],
    firstObservedAt: null,
    lastObservedAt: null,
    lastDerivedAt: now,
  };
}

export function createDriverState({
  driverId,
  label = null,
  originDimensionId = null,
  now = isoNow(),
} = {}) {
  if (!driverId) throw new Error('driverId is required');
  if (originDimensionId !== null && !isDimensionId(originDimensionId)) {
    throw new Error(`Unknown originDimensionId: ${originDimensionId}`);
  }

  return {
    driverId,
    label,
    originDimensionId,
    evidenceRefs: [],
    observationRefs: [],
    relationshipIds: [],
    temporality: 'unknown',
    lastDerivedAt: now,
  };
}

export function createDriverRelationship({
  relationshipId,
  driverId,
  concernId,
  status = 'candidate',
  now = isoNow(),
} = {}) {
  if (!relationshipId) throw new Error('relationshipId is required');
  if (!driverId) throw new Error('driverId is required');
  if (!isConcernId(concernId)) throw new Error(`Unknown concernId: ${concernId}`);
  if (!RELATIONSHIP_STATUS.includes(status)) throw new Error(`Unknown relationship status: ${status}`);

  return {
    relationshipId,
    driverId,
    concernId,
    status,
    confidence: null,
    sufficiency: 'insufficient',
    evidenceRefs: [],
    observationRefs: [],
    temporality: 'unknown',
    lastDerivedAt: now,
  };
}

export function validateMemberStateShape(state) {
  const errors = [];
  if (!state || typeof state !== 'object') return ['state must be an object'];
  if (state.schemaVersion !== MEMBER_STATE_SCHEMA_VERSION) errors.push('unsupported schemaVersion');
  if (state.taxonomyVersion !== TAXONOMY_VERSION) errors.push('unsupported taxonomyVersion');
  if (!Number.isInteger(state.revision) || state.revision < 0) errors.push('revision must be a non-negative integer');
  if (!state.dimensions || typeof state.dimensions !== 'object') errors.push('dimensions must be an object');
  if (!state.concerns || typeof state.concerns !== 'object') errors.push('concerns must be an object');
  if (!state.drivers || typeof state.drivers !== 'object') errors.push('drivers must be an object');
  if (!state.driverRelationships || typeof state.driverRelationships !== 'object') errors.push('driverRelationships must be an object');

  for (const { id: dimensionId } of DIMENSIONS) {
    const dimension = state.dimensions?.[dimensionId];
    if (!dimension) {
      errors.push(`missing dimension: ${dimensionId}`);
      continue;
    }
    if (!Array.isArray(dimension.topicIds)) errors.push(`topicIds must be an array: ${dimensionId}`);
    for (const topicId of dimension.topicIds ?? []) {
      if (!isTopicId(topicId)) errors.push(`unknown topic ${topicId}: ${dimensionId}`);
    }
  }

  for (const [concernId, concern] of Object.entries(state.concerns ?? {})) {
    if (concern.concernId !== concernId) errors.push(`concern key/id mismatch: ${concernId}`);
    if (!isConcernId(concernId)) errors.push(`unknown concern: ${concernId}`);
    if (!isDimensionId(concern.dimensionId)) errors.push(`invalid concern dimension: ${concernId}`);
    if (!CONCERN_STATUS.includes(concern.status)) errors.push(`invalid concern status: ${concernId}`);
    if (!SUFFICIENCY_STATUS.includes(concern.sufficiency)) errors.push(`invalid concern sufficiency: ${concernId}`);
    for (const topicId of concern.topicIds ?? []) {
      if (!isTopicId(topicId)) errors.push(`unknown concern topic ${topicId}: ${concernId}`);
    }
    if (!Array.isArray(concern.evidenceRefs)) errors.push(`evidenceRefs must be an array: ${concernId}`);
    if (!Array.isArray(concern.observationRefs)) errors.push(`observationRefs must be an array: ${concernId}`);
  }

  for (const [driverId, driver] of Object.entries(state.drivers ?? {})) {
    if (driver.driverId !== driverId) errors.push(`driver key/id mismatch: ${driverId}`);
    if (driver.originDimensionId !== null && !isDimensionId(driver.originDimensionId)) {
      errors.push(`invalid driver origin dimension: ${driverId}`);
    }
  }

  for (const [relationshipId, relationship] of Object.entries(state.driverRelationships ?? {})) {
    if (relationship.relationshipId !== relationshipId) errors.push(`relationship key/id mismatch: ${relationshipId}`);
    if (!state.drivers?.[relationship.driverId]) errors.push(`relationship references unknown driver: ${relationshipId}`);
    if (!state.concerns?.[relationship.concernId]) errors.push(`relationship references unknown concern: ${relationshipId}`);
    if (!RELATIONSHIP_STATUS.includes(relationship.status)) errors.push(`invalid relationship status: ${relationshipId}`);
    if (!SUFFICIENCY_STATUS.includes(relationship.sufficiency)) errors.push(`invalid relationship sufficiency: ${relationshipId}`);
  }

  return errors;
}
