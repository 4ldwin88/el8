// Cross-boundary Observation/Evidence references.
// Full Discovery effect semantics remain owned by Discovery until promotion.
import { assertGovernedConstructId } from './vocabulary.js';

export const OBSERVATION_CONTRACT_VERSION = '1.0.0';
export const EVIDENCE_REFERENCE_VERSION = '1.1.0';

export const OBSERVATION_SOURCE = Object.freeze([
  'assessment',
  'check_in',
  'tracking',
  'integration',
  'intervention_outcome',
  'system',
]);

export function createObservationEnvelope({
  observationId,
  memberId = null,
  sourceType,
  sourceId,
  observedAt = null,
  recordedAt = null,
  payloadRef = null,
  supersedesObservationId = null,
} = {}) {
  if (!observationId) throw new Error('observationId is required');
  if (!OBSERVATION_SOURCE.includes(sourceType)) throw new Error(`unknown observation source: ${sourceType}`);
  if (!sourceId) throw new Error('sourceId is required');

  return {
    schemaVersion: OBSERVATION_CONTRACT_VERSION,
    observationId,
    memberId,
    sourceType,
    sourceId,
    observedAt,
    recordedAt,
    payloadRef,
    supersedesObservationId,
  };
}

export function createEvidenceRef({
  evidenceId,
  observationId,
  targetType,
  targetId,
  polarity,
  temporality = 'unknown',
} = {}) {
  if (!evidenceId) throw new Error('evidenceId is required');
  if (!observationId) throw new Error('observationId is required');
  if (!['construct', 'driver', 'driver_relationship'].includes(targetType)) throw new Error(`unknown evidence target type: ${targetType}`);
  if (!targetId) throw new Error('targetId is required');
  if (targetType === 'construct') assertGovernedConstructId(targetId);
  if (!['supports', 'contradicts', 'neutral'].includes(polarity)) throw new Error(`unknown evidence polarity: ${polarity}`);

  return {
    schemaVersion: EVIDENCE_REFERENCE_VERSION,
    evidenceId,
    observationId,
    targetType,
    targetId,
    polarity,
    temporality,
  };
}
