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

export function aggregateEvidence(effects = []) {
  let support = 0;
  let contradiction = 0;
  let definitiveContradiction = false;

  for (const effect of effects.filter(e => e?.type === 'evidence')) {
    const weighted = weightEffect(effect);
    if (effect.polarity === 'supports') support += weighted;
    if (effect.polarity === 'contradicts') contradiction += weighted;
    if (effect.polarity === 'contradicts' && effect.certainty === 'definitive') definitiveContradiction = true;
  }

  const total = support + contradiction;
  const net = total === 0 ? 0 : (support - contradiction) / total;
  const confidence = clamp(total);
  const conflict = total === 0 ? 0 : Math.min(support, contradiction) / Math.max(support, contradiction, 0.0001);

  return Object.freeze({ support, contradiction, net, confidence, conflict, definitiveContradiction });
}

export function classifyConcern(effects = []) {
  const evidence = aggregateEvidence(effects);
  let state = 'UNKNOWN';

  if (evidence.definitiveContradiction && evidence.support < POLICY.candidateScore) state = 'CLEARED';
  else if (evidence.conflict >= POLICY.conflictBand && evidence.support >= POLICY.candidateScore && evidence.contradiction >= POLICY.candidateScore) state = 'UNRESOLVED';
  else if (evidence.net >= POLICY.supportedScore && evidence.confidence >= POLICY.focusConfidenceFloor) state = 'SUPPORTED';
  else if (evidence.support >= POLICY.candidateScore) state = 'CANDIDATE';
  else if (evidence.contradiction >= POLICY.supportedScore) state = 'CLEARED';

  return Object.freeze({ state, ...evidence });
}

export function evaluateDriverHypothesis(effects = []) {
  const result = classifyConcern(effects);
  const established = result.state === 'SUPPORTED' && result.confidence >= POLICY.driverConfidenceFloor && result.conflict < POLICY.conflictBand;
  return Object.freeze({
    ...result,
    established,
    residualUncertainty: !established,
    presentationRule: established ? 'may-present-as-supported-driver' : 'must-present-as-hypothesis'
  });
}

export function focusEligibility(effects = []) {
  const result = classifyConcern(effects);
  return Object.freeze({
    ...result,
    eligible: result.state === 'SUPPORTED' && result.confidence >= POLICY.focusConfidenceFloor,
    reason: result.state === 'SUPPORTED' && result.confidence >= POLICY.focusConfidenceFloor ? 'supported-above-floor' : 'insufficient-evidence'
  });
}
