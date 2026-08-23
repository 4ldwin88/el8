function ordinaryScore(candidate, state) {
  const importance = state.memberImportanceRank ?? 0;
  const uncertaintyReduction = candidate.expectedUncertaintyReduction ?? 0;
  const coverage = candidate.coverageDeficit ?? 0;
  const immediacy = state.immediacyClass === 'acute' ? 2 : state.immediacyClass === 'time-sensitive' ? 1 : 0;
  const redundancy = candidate.redundancyPenalty ?? 0;
  return importance * 10 + uncertaintyReduction * 4 + coverage * 2 + immediacy - redundancy * 5;
}

export function selectNextQuestion({candidates, states}) {
  const stateById = new Map(states.map(s => [s.concernId, s]));
  const safetyConcerns = states.filter(s => (s.safetyEscalationLevel ?? 0) > 0 && !['escalated','nonIssue'].includes(s.resolutionState));
  if (safetyConcerns.length) {
    const ids = new Set(safetyConcerns.map(s => s.concernId));
    const eligibleSafety = candidates.filter(q => ids.has(q.concernId) && q.eligible !== false);
    if (!eligibleSafety.length) return {type:'escalate-safety', question:null, reason:'unresolved-safety-no-eligible-question'};
    eligibleSafety.sort((a,b) => (b.safetyPriority ?? 0) - (a.safetyPriority ?? 0) || a.id.localeCompare(b.id));
    return {type:'question', question:eligibleSafety[0], reason:'safety-hard-gate'};
  }
  const eligible = candidates.filter(q => q.eligible !== false);
  if (!eligible.length) return {type:'none', question:null, reason:'no-eligible-question'};
  const ranked = eligible.map(q => ({q, score:ordinaryScore(q, stateById.get(q.concernId) ?? {})}));
  ranked.sort((a,b) => b.score - a.score || a.q.id.localeCompare(b.q.id));
  return {type:'question', question:ranked[0].q, score:ranked[0].score, reason:'ordinary-scheduler'};
}
