const importanceRank = Object.freeze({low:1, moderate:2, high:3, 'very-high':4});
const immediacyRank = Object.freeze({routine:0, 'time-sensitive':1, acute:2});

export function comparePlanConcerns(a,b) {
  const safety = (b.safetyEscalationLevel ?? 0) - (a.safetyEscalationLevel ?? 0);
  if (safety) return safety;
  const importance = (importanceRank[b.memberImportance] ?? 0) - (importanceRank[a.memberImportance] ?? 0);
  if (importance) return importance;
  const evidence = (b.evidenceConfidence ?? 0) - (a.evidenceConfidence ?? 0);
  if (evidence) return evidence;
  const leverage = (b.leverage ?? 0) - (a.leverage ?? 0);
  if (leverage) return leverage;
  const immediacy = (immediacyRank[b.immediacyClass] ?? 0) - (immediacyRank[a.immediacyClass] ?? 0);
  if (immediacy) return immediacy;
  return String(a.concernId).localeCompare(String(b.concernId));
}

export function selectPlanConcerns(states, maxPlanSize = 3) {
  const ordered = states.filter(s => s.resolutionState === 'sufficient').sort(comparePlanConcerns);
  const qualifies = s => (s.safetyEscalationLevel ?? 0) > 0 || ['high','very-high'].includes(s.memberImportance);
  const guaranteed = ordered.filter(qualifies);
  const selected = guaranteed.slice(0,maxPlanSize);
  for (const s of ordered) {
    if (selected.length >= maxPlanSize) break;
    if (!selected.includes(s)) selected.push(s);
  }
  const selectedIds = new Set(selected.map(s => s.concernId));
  return {selected, backlog: ordered.filter(s => !selectedIds.has(s.concernId)), ordered};
}
