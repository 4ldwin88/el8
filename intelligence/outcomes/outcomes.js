// Canonical EL8 Outcome representation.
// Outcomes are evidence records only. Review owns interpretation and adaptation decisions.

export const OUTCOME_SCHEMA_VERSION = '0.3.0';
export const OUTCOME_STATUS = Object.freeze(['completed', 'partially_completed', 'not_completed', 'unknown']);
export const BENEFIT_DIRECTION = Object.freeze(['improved', 'unchanged', 'worsened', 'unknown']);
export const BARRIER_CODES = Object.freeze(['burden', 'irrelevance', 'forgotten', 'external_barrier', 'access', 'schedule', 'other']);

function normalizedAdherence(value, status) {
  if (value != null) {
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0 || number > 1) throw new Error('adherence must be between 0 and 1');
    return number;
  }
  if (status === 'completed') return 1;
  if (status === 'not_completed') return 0;
  return null;
}

export function createOutcome({
  outcomeId,
  interventionId,
  concernId,
  status,
  adherence = null,
  benefitDirection = 'unknown',
  barrierCodes = [],
  burden = null,
  contextChanged = false,
  safetyChanged = false,
  measurementSufficient = null,
  observationRefs = [],
  evidenceRefs = [],
  recordedAt = null,
} = {}) {
  if (!outcomeId) throw new Error('outcomeId is required');
  if (!interventionId) throw new Error('interventionId is required');
  if (!concernId) throw new Error('concernId is required');
  if (!OUTCOME_STATUS.includes(status)) throw new Error(`unknown outcome status: ${status}`);
  if (!BENEFIT_DIRECTION.includes(benefitDirection)) throw new Error(`unknown benefit direction: ${benefitDirection}`);
  for (const code of barrierCodes) if (!BARRIER_CODES.includes(code)) throw new Error(`unknown barrier code: ${code}`);
  if (burden != null && (!Number.isFinite(Number(burden)) || Number(burden) < 0 || Number(burden) > 1)) throw new Error('burden must be between 0 and 1');

  return {
    schemaVersion: OUTCOME_SCHEMA_VERSION,
    outcomeId,
    interventionId,
    concernId,
    status,
    adherence: normalizedAdherence(adherence, status),
    benefitDirection,
    barrierCodes: [...barrierCodes],
    burden: burden == null ? null : Number(burden),
    contextChanged: Boolean(contextChanged),
    safetyChanged: Boolean(safetyChanged),
    measurementSufficient: measurementSufficient == null ? null : Boolean(measurementSufficient),
    observationRefs: [...observationRefs],
    evidenceRefs: [...evidenceRefs],
    recordedAt,
  };
}
