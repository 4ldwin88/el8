import {
  CANONICAL_VOCABULARY_VERSION,
  CONSTRUCT_STATUS,
  assertCanonicalConstructId,
} from './canonical-vocabulary.js';

export const CANONICAL_CONTRACT_VERSION = '0.1.0';
export const UNKNOWN = 'unknown';

function requireObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${field} must be an object`);
  }
  return value;
}

function requireString(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${field} must be a non-empty string`);
  }
  return value;
}

function requireArray(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value;
}

function versioned(type, body) {
  return Object.freeze({
    type,
    contractVersion: CANONICAL_CONTRACT_VERSION,
    vocabularyVersion: CANONICAL_VOCABULARY_VERSION,
    ...body,
  });
}

export function createObservation({ id, source, observedAt, value, provenance = {} }) {
  requireString(id, 'id');
  requireString(source, 'source');
  requireString(observedAt, 'observedAt');
  requireObject(provenance, 'provenance');
  return versioned('observation', { id, source, observedAt, value, provenance });
}

export function createConstructState({
  constructId,
  status = CONSTRUCT_STATUS.UNKNOWN,
  evidenceRefs = [],
  hypothesisRefs = [],
  confidence = UNKNOWN,
}) {
  assertCanonicalConstructId(constructId);
  requireArray(evidenceRefs, 'evidenceRefs');
  requireArray(hypothesisRefs, 'hypothesisRefs');
  if (!Object.values(CONSTRUCT_STATUS).includes(status)) throw new Error('invalid construct status');
  // Unknown is represented explicitly; callers must not substitute a neutral numeric value.
  if (confidence !== UNKNOWN && (typeof confidence !== 'number' || confidence < 0 || confidence > 1)) {
    throw new Error('confidence must be unknown or a number from 0 to 1');
  }
  return versioned('construct_state', {
    constructId,
    status,
    evidenceRefs: [...evidenceRefs],
    hypothesisRefs: [...hypothesisRefs],
    confidence,
  });
}

export function createPriorityCandidate({ constructId, evidenceRefs = [], factors = {}, eligibility = 'eligible' }) {
  assertCanonicalConstructId(constructId);
  requireArray(evidenceRefs, 'evidenceRefs');
  requireObject(factors, 'factors');
  const normalizedFactors = {};
  for (const [key, value] of Object.entries(factors)) {
    if (value === undefined || value === null) normalizedFactors[key] = UNKNOWN;
    else if (value === UNKNOWN) normalizedFactors[key] = UNKNOWN;
    else if (typeof value === 'number' && value >= 0 && value <= 1) normalizedFactors[key] = value;
    else throw new Error(`priority factor ${key} must be unknown or a number from 0 to 1`);
  }
  return versioned('priority_candidate', {
    constructId,
    evidenceRefs: [...evidenceRefs],
    factors: Object.freeze(normalizedFactors),
    eligibility,
  });
}

export function createConfirmedFocus({ constructId, decision, decidedAt, reasonCodes = [], constraintRefs = [] }) {
  assertCanonicalConstructId(constructId);
  if (!['accepted', 'rejected', 'postponed', 'paused'].includes(decision)) throw new Error('invalid focus decision');
  requireString(decidedAt, 'decidedAt');
  requireArray(reasonCodes, 'reasonCodes');
  requireArray(constraintRefs, 'constraintRefs');
  return versioned('confirmed_focus', {
    constructId,
    decision,
    decidedAt,
    reasonCodes: [...reasonCodes],
    constraintRefs: [...constraintRefs],
  });
}

export function createPlanningInput({ memberStateRevision, focuses, evidenceRefs = [], constraintRefs = [], safetyDisposition = 'ordinary_flow' }) {
  if (!Number.isInteger(memberStateRevision) || memberStateRevision < 0) throw new Error('memberStateRevision must be a non-negative integer');
  requireArray(focuses, 'focuses');
  requireArray(evidenceRefs, 'evidenceRefs');
  requireArray(constraintRefs, 'constraintRefs');
  for (const focus of focuses) {
    requireObject(focus, 'focus');
    assertCanonicalConstructId(focus.constructId, 'focus.constructId');
    if (focus.decision !== 'accepted') throw new Error('Planning may consume only member-accepted Focus objects');
  }
  return versioned('planning_input', {
    memberStateRevision,
    focuses: [...focuses],
    evidenceRefs: [...evidenceRefs],
    constraintRefs: [...constraintRefs],
    safetyDisposition,
  });
}
