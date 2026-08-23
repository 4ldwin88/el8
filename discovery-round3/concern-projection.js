import { clampConfidence } from './contracts.js';

const importanceRank = Object.freeze({low:1, moderate:2, high:3, 'very-high':4});

function latest(effects, predicate) {
  return [...effects].reverse().find(predicate);
}

export function deriveConcernState(observationLog, concernId) {
  const observations = observationLog.filter(o => o.concernId === concernId || o.effects?.some(e => e.target === concernId));
  const effects = observations.flatMap(o => o.effects ?? []);
  const evidence = effects.filter(e => e.type === 'evidence' && e.target === concernId);
  let rawEvidenceScore = 0;
  let excluded = false;
  for (const e of evidence) {
    const strength = Number.isFinite(e.strength) ? e.strength : 0;
    if (e.polarity === 'supports') rawEvidenceScore += strength;
    if (e.polarity === 'contradicts') rawEvidenceScore -= strength;
    if (e.polarity === 'contradicts' && e.certainty === 'definitive') excluded = true;
  }
  const importance = latest(effects, e => e.type === 'importance' && e.target === concernId);
  const safety = latest(effects, e => e.type === 'safety' && e.target === concernId);
  const immediacy = latest(effects, e => e.type === 'immediacy' && e.target === concernId);
  const readiness = latest(effects, e => e.type === 'readiness' && e.target === concernId);
  const temporal = latest(effects, e => ['current','recurring'].includes(e.temporality)) ?? latest(effects, e => ['historical','resolved'].includes(e.temporality));
  const specificityFrontier = observations.reduce((m,o) => Math.max(m, o.specificityLevel ?? 0), 0);
  const evidenceConfidence = excluded ? 0 : clampConfidence(Math.max(0, rawEvidenceScore));
  return Object.freeze({
    concernId,
    evidenceConfidence,
    rawEvidenceScore,
    excluded,
    memberImportance: importance?.value ?? null,
    memberImportanceRank: importanceRank[importance?.value] ?? 0,
    safetyEscalationLevel: safety?.level ?? 0,
    immediacyClass: immediacy?.value ?? null,
    readiness: readiness?.value ?? null,
    temporality: temporal?.temporality ?? 'unknown',
    specificityFrontier,
    evidenceRefs: observations.map(o => o.questionId),
  });
}

export function deriveAllConcernStates(observationLog, concernIds) {
  return concernIds.map(id => deriveConcernState(observationLog, id));
}
