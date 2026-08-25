// Canonical EL8 Intelligence Member State contract.
// State is a shared, derived substrate. Observations/evidence remain the source of truth.

export const DIMENSION_IDS = Object.freeze([
  'physical',
  'emotional',
  'social',
  'spiritual',
  'intellectual',
  'occupational',
  'financial',
  'environmental',
]);

export const CONCERN_STATUS = Object.freeze([
  'unknown',
  'candidate',
  'active',
  'excluded',
  'resolved',
]);

export const SUFFICIENCY_STATUS = Object.freeze([
  'insufficient',
  'sufficient',
]);

export const MEMBER_STATE_SCHEMA_VERSION = '1.0.0';

function isoNow() {
  return new Date().toISOString();
}

export function createMemberState({ memberId = null, now = isoNow() } = {}) {
  return {
    schemaVersion: MEMBER_STATE_SCHEMA_VERSION,
    memberId,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    dimensions: Object.fromEntries(
      DIMENSION_IDS.map((dimensionId) => [dimensionId, {
        dimensionId,
        concernIds: [],
        evidenceRefs: [],
        lastObservedAt: null,
        lastDerivedAt: null,
      }]),
    ),
    concerns: {},
    drivers: {},
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
  dimensionId,
  subdimensionId = null,
  status = 'unknown',
  now = isoNow(),
} = {}) {
  if (!concernId) throw new Error('concernId is required');
  if (!DIMENSION_IDS.includes(dimensionId)) throw new Error(`Unknown dimensionId: ${dimensionId}`);
  if (!CONCERN_STATUS.includes(status)) throw new Error(`Unknown concern status: ${status}`);

  return {
    concernId,
    dimensionId,
    subdimensionId,
    status,
    evidenceConfidence: 0,
    sufficiency: 'insufficient',
    unresolvedReasons: [],
    candidateDriverIds: [],
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

export function validateMemberStateShape(state) {
  const errors = [];
  if (!state || typeof state !== 'object') return ['state must be an object'];
  if (state.schemaVersion !== MEMBER_STATE_SCHEMA_VERSION) errors.push('unsupported schemaVersion');
  if (!Number.isInteger(state.revision) || state.revision < 0) errors.push('revision must be a non-negative integer');
  if (!state.dimensions || typeof state.dimensions !== 'object') errors.push('dimensions must be an object');
  if (!state.concerns || typeof state.concerns !== 'object') errors.push('concerns must be an object');
  if (!state.drivers || typeof state.drivers !== 'object') errors.push('drivers must be an object');

  for (const dimensionId of DIMENSION_IDS) {
    if (!state.dimensions?.[dimensionId]) errors.push(`missing dimension: ${dimensionId}`);
  }

  for (const [concernId, concern] of Object.entries(state.concerns ?? {})) {
    if (concern.concernId !== concernId) errors.push(`concern key/id mismatch: ${concernId}`);
    if (!DIMENSION_IDS.includes(concern.dimensionId)) errors.push(`invalid concern dimension: ${concernId}`);
    if (!CONCERN_STATUS.includes(concern.status)) errors.push(`invalid concern status: ${concernId}`);
    if (!SUFFICIENCY_STATUS.includes(concern.sufficiency)) errors.push(`invalid concern sufficiency: ${concernId}`);
    if (!Array.isArray(concern.evidenceRefs)) errors.push(`evidenceRefs must be an array: ${concernId}`);
    if (!Array.isArray(concern.observationRefs)) errors.push(`observationRefs must be an array: ${concernId}`);
  }

  return errors;
}
