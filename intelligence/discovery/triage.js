export const DEFAULT_TRIAGE_THRESHOLD = 3;
const MEMBER_LABELS=Object.freeze({money:'Money or financial pressure',work:'Work, school, or responsibilities',health:'Health or physical condition',energy:'Low energy or tiredness',sleep:'Sleep',stress:'Stress or difficult emotions',relationships:'Relationships',support:'Feeling lonely or unsupported',home:'Home or surroundings',focus:'Focus or getting started',direction:'Direction, purpose, or knowing what to do next'});

export function needsTriage(concernIds, threshold = DEFAULT_TRIAGE_THRESHOLD) {
  return new Set(concernIds).size > threshold;
}

export function buildTriageQuestion(concernIds, labels = {}) {
  const ids = [...new Set(concernIds)];
  return Object.freeze({
    id: 'TRIAGE_DYNAMIC',
    type: 'impact-matrix',
    prompt: 'How important are these to you right now?',
    concerns: ids.map(id => ({id, label: labels[id] ?? MEMBER_LABELS[id] ?? id.replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase()), options:['not-important','somewhat-important','important','very-important']}))
  });
}

export function needsRetriage(states, activeConcernCount, threshold = DEFAULT_TRIAGE_THRESHOLD) {
  if (activeConcernCount <= threshold) return false;
  return states.some(s => (s.memberImportance === null || s.memberImportance === undefined) && !['deferred','nonIssue','escalated'].includes(s.resolutionState));
}
