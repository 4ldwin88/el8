// Minimal cross-boundary handoff envelopes for the canonical vertical slice.
// Domain-specific payloads stay owned by their subsystem; these envelopes carry refs and routing metadata.

export const HANDOFF_CONTRACT_VERSION = '1.0.0';

const HANDOFF_TYPES = Object.freeze([
  'discovery_to_prioritization',
  'prioritization_to_planning',
  'planning_to_intervention',
  'intervention_to_outcome',
]);

export function createHandoff({
  handoffId,
  type,
  memberStateRef,
  inputRefs = [],
  resultRefs = [],
  safetySignalRefs = [],
  unresolvedRefs = [],
  createdAt = null,
} = {}) {
  if (!handoffId) throw new Error('handoffId is required');
  if (!HANDOFF_TYPES.includes(type)) throw new Error(`unknown handoff type: ${type}`);
  if (!memberStateRef) throw new Error('memberStateRef is required');

  return {
    schemaVersion: HANDOFF_CONTRACT_VERSION,
    handoffId,
    type,
    memberStateRef,
    inputRefs: [...inputRefs],
    resultRefs: [...resultRefs],
    safetySignalRefs: [...safetySignalRefs],
    unresolvedRefs: [...unresolvedRefs],
    createdAt,
  };
}

export function validateHandoff(handoff) {
  const errors = [];
  if (!handoff || typeof handoff !== 'object') return ['handoff must be an object'];
  if (handoff.schemaVersion !== HANDOFF_CONTRACT_VERSION) errors.push('unsupported schemaVersion');
  if (!handoff.handoffId) errors.push('handoffId is required');
  if (!HANDOFF_TYPES.includes(handoff.type)) errors.push('invalid handoff type');
  if (!handoff.memberStateRef) errors.push('memberStateRef is required');
  for (const key of ['inputRefs', 'resultRefs', 'safetySignalRefs', 'unresolvedRefs']) {
    if (!Array.isArray(handoff[key])) errors.push(`${key} must be an array`);
  }
  return errors;
}
