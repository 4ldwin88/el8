// Cross-cutting EL8 Safety/Escalation interface.
// This contract defines transport/override semantics, not clinical diagnosis or policy content.

export const SAFETY_CONTRACT_VERSION = '1.1.0';

export const SAFETY_LEVEL = Object.freeze({
  NONE: 0,
  ATTENTION: 1,
  ESCALATE: 2,
  IMMEDIATE: 3,
});

export const SAFETY_DISPOSITION = Object.freeze([
  'continue',
  'continue_with_constraints',
  'pause_ordinary_flow',
  'escalate',
]);

export function createSafetySignal({
  signalId,
  level,
  code,
  sourceComponent,
  observationRefs = [],
  evidenceRefs = [],
  constructRefs = [],
  detectedAt = null,
} = {}) {
  if (!signalId) throw new Error('signalId is required');
  if (!Number.isInteger(level) || level < 1 || level > 3) throw new Error('level must be 1, 2, or 3');
  if (!code) throw new Error('code is required');
  if (!sourceComponent) throw new Error('sourceComponent is required');

  return {
    schemaVersion: SAFETY_CONTRACT_VERSION,
    signalId,
    level,
    code,
    sourceComponent,
    observationRefs: [...observationRefs],
    evidenceRefs: [...evidenceRefs],
    constructRefs: [...constructRefs],
    detectedAt,
  };
}

export function createSafetyDisposition({
  dispositionId,
  signalRefs,
  disposition,
  constraints = [],
  rationaleCodes = [],
  decidedAt = null,
} = {}) {
  if (!dispositionId) throw new Error('dispositionId is required');
  if (!Array.isArray(signalRefs) || signalRefs.length === 0) throw new Error('signalRefs must be non-empty');
  if (!SAFETY_DISPOSITION.includes(disposition)) throw new Error(`unknown safety disposition: ${disposition}`);

  return {
    schemaVersion: SAFETY_CONTRACT_VERSION,
    dispositionId,
    signalRefs: [...signalRefs],
    disposition,
    constraints: [...constraints],
    rationaleCodes: [...rationaleCodes],
    decidedAt,
  };
}

export function highestSafetyLevel(signals = []) {
  return signals.reduce((highest, signal) => Math.max(highest, signal?.level ?? 0), SAFETY_LEVEL.NONE);
}

export function requiresOrdinaryFlowPause(disposition) {
  return disposition?.disposition === 'pause_ordinary_flow' || disposition?.disposition === 'escalate';
}
