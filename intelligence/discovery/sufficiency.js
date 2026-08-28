const terminal = new Set(['sufficient','deferred','escalated','nonIssue']);

export function coverageAudit(states) {
  const unresolved = states.filter(s => !terminal.has(s.resolutionState));
  return {complete: unresolved.length === 0, unresolved};
}

export function stoppingDecision({states, questionsAsked, outerGuardrail = null}) {
  const unresolvedSafety = states.filter(s => (s.safetyEscalationLevel ?? 0) > 0 && !['escalated','nonIssue'].includes(s.resolutionState));
  if (unresolvedSafety.length) return {stop:false, reason:'unresolved-safety'};
  const coverage = coverageAudit(states);
  if (coverage.complete) return {stop:true, reason:'sufficient-coverage', incomplete:false};
  const hasExplicitGuardrail = Number.isInteger(outerGuardrail) && outerGuardrail >= 0;
  if (hasExplicitGuardrail && questionsAsked >= outerGuardrail) return {stop:true, reason:'outer-guardrail', incomplete:true, defer:coverage.unresolved.map(s => s.concernId)};
  return {stop:false, reason:'coverage-incomplete'};
}
