export const DEFAULT_TRIAGE_THRESHOLD = 3;

export function needsTriage(concernIds, threshold = DEFAULT_TRIAGE_THRESHOLD) {
  return new Set(concernIds).size > threshold;
}

export function buildTriageQuestion(concernIds, labels = {}) {
  const ids = [...new Set(concernIds)];
  return Object.freeze({
    id: 'TRIAGE_DYNAMIC',
    type: 'impact-matrix',
    prompt: 'How much is each of these affecting your life right now?',
    concerns: ids.map(id => ({id, label: labels[id] ?? id, options:['low','moderate','high','very-high']}))
  });
}

export function needsRetriage(states, activeConcernCount, threshold = DEFAULT_TRIAGE_THRESHOLD) {
  if (activeConcernCount <= threshold) return false;
  return states.some(s => !s.memberImportance && !['deferred','nonIssue','escalated'].includes(s.resolutionState));
}
