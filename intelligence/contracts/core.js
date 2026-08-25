// Minimal cross-subsystem EL8 Intelligence contracts.
// Keep subsystem-private structures with their owning subsystem.

export const INTELLIGENCE_CONTRACT_VERSION = '1.0.0';

export function createContractRef({ id, type, schemaVersion, createdAt = null } = {}) {
  if (!id) throw new Error('id is required');
  if (!type) throw new Error('type is required');
  if (!schemaVersion) throw new Error('schemaVersion is required');
  return Object.freeze({ id, type, schemaVersion, createdAt });
}

export function createProvenance({
  sourceType,
  sourceId,
  observationId = null,
  evidenceId = null,
  recordedAt = null,
} = {}) {
  if (!sourceType) throw new Error('sourceType is required');
  if (!sourceId) throw new Error('sourceId is required');
  return {
    sourceType,
    sourceId,
    observationId,
    evidenceId,
    recordedAt,
  };
}

export function createDecisionTrace({
  decisionId,
  component,
  inputRefs = [],
  outputRefs = [],
  rationaleCodes = [],
  createdAt = null,
} = {}) {
  if (!decisionId) throw new Error('decisionId is required');
  if (!component) throw new Error('component is required');
  return {
    decisionId,
    component,
    contractVersion: INTELLIGENCE_CONTRACT_VERSION,
    inputRefs: [...inputRefs],
    outputRefs: [...outputRefs],
    rationaleCodes: [...rationaleCodes],
    createdAt,
  };
}
