// EL8 Intelligence vocabulary contract.
// Registries own governed domain vocabulary. Intelligence consumes that vocabulary
// and adds only decision-state semantics that belong to Intelligence.

import { DIMENSION_IDS } from '../../registries/taxonomy/dimensions.js';
import { CONSTRUCT_IDS as GOVERNED_CONSTRUCT_IDS } from '../../registries/taxonomy/concerns.js';

export const VOCABULARY_VERSION = '2026-08-31.2';

// Re-export governed IDs for Intelligence consumers without maintaining a second source of truth.
export const DIMENSIONS = DIMENSION_IDS;
export const CONSTRUCT_IDS = GOVERNED_CONSTRUCT_IDS;

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

export function isGovernedConstructId(value) {
  return typeof value === 'string' && constructSet.has(value);
}

export function isGovernedDimension(value) {
  return typeof value === 'string' && dimensionSet.has(value);
}

export function assertGovernedConstructId(value, field = 'constructId') {
  if (!isGovernedConstructId(value)) throw new Error(`${field} must be a governed EL8 construct ID`);
  return value;
}

export function assertGovernedDimension(value, field = 'dimension') {
  if (!isGovernedDimension(value)) throw new Error(`${field} must be a governed EL8 dimension`);
  return value;
}
