// EEV1.0 isolated simulation target.
// This module is intentionally separate from Discovery v0.11 production logic.

export const EEV1_VERSION = '1.0-sim';
export const CONCERN_STATES = Object.freeze(['UNKNOWN','CANDIDATE','SUPPORTED','CLEARED','UNRESOLVED']);

export const POLICY = Object.freeze({
  supportedScore: 0.70,
  candidateScore: 0.25,
  conflictBand: 0.30,
  focusConfidenceFloor: 0.60,
  driverConfidenceFloor: 0.80,
  currentSupportFloor: 0.25,
  maxEvidenceScore: 1,
  sourceWeight: Object.freeze({ direct: 1, derived: 0.75, inferred: 0.5 }),
  certaintyWeight: Object.freeze({ definitive: 1, graded: 0.8 }),
  temporalityWeight: Object.freeze({ current: 1, recurring: 0.9, historical: 0.55, resolved: 0.25, unknown: 0.5 })
});

const clamp = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

function weightEffect(effect) {
  const strength = clamp(effect.strength ?? 0);
  const source = POLICY.sourceWeight[effect.sourceType ?? 'direct'] ?? 0.5;
  const certainty = POLICY.certaintyWeight[effect.certainty ?? 'graded'] ?? 0.8;
  const temporality = POLICY.temporalityWeight[effect.temporality ?? 'unknown'] ?? 0.5;
  return strength * source * certainty * temporality;
}

function normalizeEvidence(effects = []) {
  const evidence = effects.filter(e => e?.type === 'evidence');
  const superseded = new Set(evidence.map(e => e.supersedes).filter(Boolean));
  const seenObservationIds = new Set();
  const normalized = [];

  for (const effect of evidence) {
    if (effect.observationId && superseded.has(effect.observationId)) continue;
    if (effect.observationId) {
      if (seenObservationIds.has(effect.observationId)) continue;
      seenObservationIds.add(effect.observationId);
    }
    normalized.push(effect);
  }
  return normalized;
}

export function aggregateEvidence(effects = []) {
  let support = 0;
  let contradiction = 0;
  let actionableSupport = 0;
  let definitiveContradiction = false;

  for (const effect of normalizeEvidence(effects)) {
    const weighted = weightEffect(effect);
    if (effect.polarity === 'supports') {
      support += weighted;
      if (effect.temporality === 'current' || effect.temporality === 'recurring') actionableSupport += weighted;
    }
    if (effect.polarity === 'contradicts') contradiction += weighted;
    if (effect.polarity === 'contradicts' && effect.certainty === 'definitive') definitiveContradiction = true;
  }

  const total = support + contradiction;
  const net = total === 0 ? 0 : (support - contradiction) / total;
  const confidence = clamp(total);
  const conflict = total === 0 ? 0 : Math.min(support, contradiction) / Math.max(support, contradiction, 0.0001);

  return Object.freeze({ support, contradiction, actionableSupport, net, confidence, conflict, definitiveContradiction });
}

export function classifyConcern(effects = []) {
  const evidence = aggregateEvidence(effects);
  let state = 'UNKNOWN';

  if (evidence.definitiveContradiction && evidence.support < POLICY.candidateScore) state = 'CLEARED';
  else if (evidence.conflict >= POLICY.conflictBand && evidence.support >= POLICY.candidateScore && evidence.contradiction >= POLICY.candidateScore) state = 'UNRESOLVED';
  else if (evidence.net >= POLICY.supportedScore && evidence.confidence >= POLICY.focusConfidenceFloor && evidence.actionableSupport >= POLICY.currentSupportFloor) state = 'SUPPORTED';
  else if (evidence.support >= POLICY.candidateScore) state = 'CANDIDATE';
  else if (evidence.contradiction >= POLICY.supportedScore) state = 'CLEARED';

  return Object.freeze({ state, ...evidence });
}

export function evaluateDriverHypothesis(effects = []) {
  const result = classifyConcern(effects);
  const established = result.state === 'SUPPORTED' && result.confidence >= POLICY.driverConfidenceFloor && result.actionableSupport >= POLICY.currentSupportFloor && result.conflict < POLICY.conflictBand;
  return Object.freeze({
    ...result,
    established,
    residualUncertainty: !established,
    presentationRule: established ? 'may-present-as-supported-driver' : 'must-present-as-hypothesis'
  });
}

export function focusEligibility(effects = []) {
  const result = classifyConcern(effects);
  const eligible = result.state === 'SUPPORTED' && result.confidence >= POLICY.focusConfidenceFloor && result.actionableSupport >= POLICY.currentSupportFloor;
  return Object.freeze({
    ...result,
    eligible,
    reason: eligible ? 'supported-current-or-recurring-above-floor' : 'insufficient-current-evidence'
  });
}
