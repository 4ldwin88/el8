// Canonical Action/Intervention Bank entry point.
// During reconciliation the proven Action definitions remain implemented in
// intelligence/planning/canonical-action-bank.js; this registry establishes the
// manifest-owned boundary without duplicating the governed bank.

export {
  CANONICAL_ACTION_BANK as INTERVENTION_BANK,
  CANONICAL_ACTION_BY_ID as INTERVENTION_BY_ID,
} from '../../intelligence/planning/canonical-action-bank.js';

export { buildTrackingRequirementIndex, getTrackingRequirements } from './trackingRequirements.js';
