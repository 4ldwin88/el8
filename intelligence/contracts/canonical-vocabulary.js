// Canonical EL8 Intelligence vocabulary — migration Slice 1.
// Drive-controlled construct IDs are authoritative. Legacy aliases belong only
// in explicit compatibility/ingestion modules and must never be emitted here.

export const CANONICAL_VOCABULARY_VERSION = '2026-08-30.1';

export const DIMENSIONS = Object.freeze([
  'physical',
  'emotional',
  'social',
  'spiritual',
  'intellectual',
  'occupational',
  'financial',
  'environmental',
]);

export const CONSTRUCT_IDS = Object.freeze([
  'EMOTIONAL_STATE',
  'PRESSURE_PATTERN',
  'SLEEP_QUALITY',
  'ENERGY_FUNCTION',
  'LONELINESS',
  'JOB_SECURITY',
  'FINANCIAL_STRAIN',
  'FINANCIAL_CONTROL',
  'ENVIRONMENTAL_SUPPORT',
  'MEANING_PURPOSE',
  'COGNITIVE_ENGAGEMENT',
  'RELATIONSHIP_STRAIN',
  'SUPPORT_AVAILABILITY',
  'PHYSICAL_CONDITION',
  'ACTIVITY_LEVEL',
  'FOCUS_FUNCTION',
  'ACTIVATION',
  'SCHEDULE_DISRUPTION',
  'BODY_WEIGHT_CONCERN',
  'VALUES_CLARITY',
  'NEXT_STEP_CLARITY',
  'DIRECTION_CLARITY',
]);

export const CONSTRUCT_STATUS = Object.freeze({
  ESTABLISHED: 'established',
  SUPPORTED: 'supported',
  HYPOTHESIS: 'hypothesis',
  INSUFFICIENT: 'insufficient',
  UNKNOWN: 'unknown',
  CONTRADICTED: 'contradicted',
  DEFERRED: 'deferred',
});

export const EVIDENCE_CLASS = Object.freeze({
  FEASIBILITY_CONSTRAINT: 'feasibility_constraint',
  SYSTEM_CONTROL: 'system_control',
  SAFETY_CONFIRMATION: 'safety_confirmation',
});

const constructSet = new Set(CONSTRUCT_IDS);
const dimensionSet = new Set(DIMENSIONS);

export function isCanonicalConstructId(value) {
  return typeof value === 'string' && constructSet.has(value);
}

export function isCanonicalDimension(value) {
  return typeof value === 'string' && dimensionSet.has(value);
}

export function assertCanonicalConstructId(value, field = 'constructId') {
  if (!isCanonicalConstructId(value)) {
    throw new Error(`${field} must be a canonical EL8 construct ID`);
  }
  return value;
}

export function assertCanonicalDimension(value, field = 'dimension') {
  if (!isCanonicalDimension(value)) {
    throw new Error(`${field} must be a canonical EL8 dimension`);
  }
  return value;
}
