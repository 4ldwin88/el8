// Question count is telemetry, not a production completion rule. QA may pass an
// explicit outerGuardrail to detect runaway paths without treating the threshold
// as semantic sufficiency.
export const DEFAULT_EFFICIENCY_BENCHMARK = 8;
const terminal = new Set(['sufficient','deferred','escalated','nonIssue']);

export function coverageAudit(states) {
  const unresolved = states.filter(s => !terminal.has(s.resolutionState));
  return {complete: unresolved.length === 0, unresolved};
}

export function stoppingDecision({states, questionsAsked = 0, outerGuardrail = null}) {
  const unresolvedSafety = states.filter(s => (s.safetyEscalationLevel ?? 0) > 0 && !['escalated','nonIssue'].includes(s.resolutionState));
  if (unresolvedSafety.length) return {stop:false, reason:'unresolved-safety'};
  const coverage = coverageAudit(states);
  if (coverage.complete) return {stop:true, reason:'sufficient-coverage', incomplete:false};
  if (Number.isFinite(outerGuardrail) && outerGuardrail > 0 && questionsAsked >= outerGuardrail) {
    return {stop:true, reason:'qa-outer-guardrail', incomplete:true, testOnly:true, defer:coverage.unresolved.map(s => s.constructId)};
  }
  return {stop:false, reason:'coverage-incomplete'};
}
