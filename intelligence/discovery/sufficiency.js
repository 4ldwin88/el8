const terminal = new Set(['established','dismissed','deferred']);

function requiredEvidenceAudit(state) {
  const requirements = Array.isArray(state.sufficiencyRequirements) ? state.sufficiencyRequirements : [];
  const unresolved = requirements.filter(requirement => requirement?.required !== false && requirement?.satisfied !== true);
  return {complete: unresolved.length === 0, unresolved};
}

export function concernSufficiency(state) {
  if (!state) return {complete:false, reason:'missing-concern-state', unresolved:[]};
  if (terminal.has(state.resolutionState)) return {complete:true, reason:`concern-${state.resolutionState}`, unresolved:[]};
  const evidence = requiredEvidenceAudit(state);
  if (!evidence.complete) return {complete:false, reason:'required-evidence-unresolved', unresolved:evidence.unresolved};
  return {complete:false, reason:'concern-resolution-unresolved', unresolved:[]};
}

export function coverageAudit(states) {
  const audits = states.map(state => ({concernId:state.concernId, ...concernSufficiency(state)}));
  const unresolved = audits.filter(audit => !audit.complete);
  return {complete: unresolved.length === 0, unresolved, audits};
}

export function stoppingDecision({states, questionsAsked, outerGuardrail = null}) {
  const coverage = coverageAudit(states);
  if (coverage.complete) return {stop:true, reason:'sufficient-coverage', incomplete:false};
  const hasExplicitGuardrail = Number.isInteger(outerGuardrail) && outerGuardrail >= 0;
  if (hasExplicitGuardrail && questionsAsked >= outerGuardrail) return {stop:true, reason:'outer-guardrail', incomplete:true, defer:coverage.unresolved.map(s => s.concernId)};
  return {stop:false, reason:'coverage-incomplete', unresolved:coverage.unresolved};
}
