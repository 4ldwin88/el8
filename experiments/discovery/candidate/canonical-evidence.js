// Converts Discovery-owned observations/effects into canonical cross-boundary references.
// Rich effect semantics remain inside Discovery; canonical evidence keeps provenance and semantic target.

import { createObservationEnvelope, createEvidenceRef } from '../../intelligence/contracts/observations.js';

function timestampToIso(timestamp) {
  if (timestamp === null || timestamp === undefined) return null;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function canonicalizeDiscoveryObservation(observation, { memberId = null } = {}) {
  if (!observation?.id || !observation?.questionId) throw new Error('Discovery observation requires id and questionId');

  const envelope = createObservationEnvelope({
    observationId: observation.id,
    memberId,
    sourceType: 'assessment',
    sourceId: observation.questionId,
    observedAt: timestampToIso(observation.timestamp),
    recordedAt: timestampToIso(observation.timestamp),
    payloadRef: `discovery:${observation.id}`,
  });

  const evidenceRefs = (observation.effects ?? [])
    .filter(effect => effect.type === 'evidence')
    .map((effect, index) => createEvidenceRef({
      evidenceId: `${observation.id}:evidence:${index}`,
      observationId: observation.id,
      targetType: 'concern',
      targetId: effect.target,
      polarity: effect.polarity,
      temporality: effect.temporality ?? 'unknown',
    }));

  return { envelope, evidenceRefs };
}

export function canonicalizeDiscoveryObservations(observations, options = {}) {
  const canonical = observations.map(observation => canonicalizeDiscoveryObservation(observation, options));
  return {
    observations: canonical.map(item => item.envelope),
    evidenceRefs: canonical.flatMap(item => item.evidenceRefs),
  };
}
