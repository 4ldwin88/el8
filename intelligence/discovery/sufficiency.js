const terminal = new Set(['established','dismissed']);

function requiredEvidenceAudit(state) {
  const requirements = Array.isArray(state.sufficiencyRequirements) ? state.sufficiencyRequirements : [];
  const unresolved = requirements.filter(requirement => requirement?.required !== false && requirement?.satisfied !== true);
  return {complete: unresolved.length === 0, unresolved, requirements};
}

export function concernSufficiency(state) {
  if (!state) return {complete:false, reason:'missing-concern-state', unresolved:[], requirements:[]};
  const evidence = requiredEvidenceAudit(state);
  if (!evidence.complete) return {complete:false, reason:'required-evidence-unresolved', unresolved:evidence.unresolved, requirements:evidence.requirements};
  if (terminal.has(state.resolutionState)) return {complete:true, reason:`concern-${state.resolutionState}`, unresolved:[], requirements:evidence.requirements};
  return {complete:false, reason:'concern-resolution-unresolved', unresolved:[], requirements:evidence.requirements};
}

export function coverageAudit(states) {
  const audits = states.map(state => ({concernId:state.concernId, ...concernSufficiency(state)}));
  const unresolved = audits.filter(audit => !audit.complete);
  return {complete: unresolved.length === 0, unresolved, audits};
}

export function stoppingDecision({states, questionsAsked, outerGuardrail = null, memberStopped = false}) {
  const coverage = coverageAudit(states);
  if (coverage.complete) return {stop:true, reason:'sufficient-coverage', incomplete:false, coverage};
  if (memberStopped) return {stop:true, reason:'member-stopped', incomplete:true, defer:coverage.unresolved.map(s => s.concernId), coverage};
  const hasExplicitGuardrail = Number.isInteger(outerGuardrail) && outerGuardrail >= 0;
  if (hasExplicitGuardrail && questionsAsked >= outerGuardrail) return {stop:true, reason:'outer-guardrail', incomplete:true, defer:coverage.unresolved.map(s => s.concernId), coverage};
  return {stop:false, reason:'coverage-incomplete', unresolved:coverage.unresolved, coverage};
}
