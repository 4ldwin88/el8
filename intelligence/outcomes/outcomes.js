// Minimal canonical Outcome representation for the vertical slice.
// Outcomes record what happened after an intervention without directly mutating Member State.

export const OUTCOME_SCHEMA_VERSION = '0.1.0';
export const OUTCOME_STATUS = Object.freeze(['completed', 'partially_completed', 'not_completed', 'unknown']);

export function createOutcome({
  outcomeId,
  interventionId,
  concernId,
  status,
  observationRefs = [],
  evidenceRefs = [],
  recordedAt = null,
} = {}) {
  if (!outcomeId) throw new Error('outcomeId is required');
  if (!interventionId) throw new Error('interventionId is required');
  if (!concernId) throw new Error('concernId is required');
  if (!OUTCOME_STATUS.includes(status)) throw new Error(`unknown outcome status: ${status}`);

  return {
    schemaVersion: OUTCOME_SCHEMA_VERSION,
    outcomeId,
    interventionId,
    concernId,
    status,
    observationRefs: [...observationRefs],
    evidenceRefs: [...evidenceRefs],
    recordedAt,
  };
}
