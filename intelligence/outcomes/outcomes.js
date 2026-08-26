// Canonical EL8 Outcome representation.
// Outcomes record what happened after one independently justified action. They preserve
// adherence, observed benefit and context separately so Planning can learn without
// inventing a package-level success/failure state or directly mutating Member State.

export const OUTCOME_SCHEMA_VERSION = '0.2.0';
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

export function interpretOutcome(outcome = {}) {
  if (outcome.safetyChanged) return { adaptation: 'escalate', attribution: 'safety_change' };
  if (outcome.contextChanged) return { adaptation: 'reprioritize', attribution: 'context_change' };
  if (outcome.measurementSufficient === false) return { adaptation: 'deepen_measurement', attribution: 'measurement_insufficiency' };
  if (outcome.adherence != null && outcome.adherence < 0.5) return { adaptation: 'simplify_or_reschedule', attribution: 'adherence_or_barrier' };
  if ((outcome.barrierCodes || []).length) return { adaptation: 'simplify_or_reschedule', attribution: 'adherence_or_barrier' };
  if (outcome.adherence != null && outcome.adherence >= 0.7 && outcome.benefitDirection === 'improved') return { adaptation: 'maintain', attribution: null };
  if (outcome.adherence != null && outcome.adherence >= 0.7 && ['unchanged', 'worsened'].includes(outcome.benefitDirection)) return { adaptation: 'reassess', attribution: 'action_or_hypothesis' };
  return { adaptation: 'continue_observation', attribution: 'insufficient_observation' };
}
