export const DEFAULT_TRIAGE_THRESHOLD = 3;

export function needsTriage(concernIds, threshold = DEFAULT_TRIAGE_THRESHOLD) {
  return new Set(concernIds).size > threshold;
}

export function buildTriageQuestion(concernIds, labels = {}) {
  const ids = [...new Set(concernIds)];
  return Object.freeze({
    id: 'TRIAGE_DYNAMIC',
    type: 'impact-matrix',
    prompt: 'How important are these to you right now?',
    concerns: ids.map(id => ({id, label: labels[id] ?? id, options:['not-important','somewhat-important','important','very-important']}))
  });
}

export function needsRetriage(states, activeConcernCount, threshold = DEFAULT_TRIAGE_THRESHOLD) {
  if (activeConcernCount <= threshold) return false;
  return states.some(s => (s.memberImportance === null || s.memberImportance === undefined) && !['deferred','nonIssue','escalated'].includes(s.resolutionState));
}
