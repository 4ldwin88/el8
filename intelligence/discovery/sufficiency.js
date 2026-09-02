// Question count is telemetry, not a production completion rule. QA may pass an
// explicit outerGuardrail to detect runaway paths without treating the threshold
// as semantic sufficiency.
export const DEFAULT_EFFICIENCY_BENCHMARK = 8;
const terminal = new Set(['sufficient','deferred','escalated','nonIssue']);
const usableConfidence = new Set(['MODERATE','WELL_SUPPORTED']);

export function coverageAudit(states) {
  const unresolved = states.filter(s => !terminal.has(s.resolutionState));
  return {complete: unresolved.length === 0, unresolved};
}

// Discovery may legitimately stop with unresolved constructs when the available
// governed bank has nothing else useful to ask. That is different from having no
// decision-useful evidence. A bounded handoff is allowed only when every unresolved
// state has direct evidence and at least moderate qualitative confidence; unresolved
// safety never qualifies.
export function handoffAudit(states) {
  const unresolved = states.filter(s => !terminal.has(s.resolutionState));
  const blocking = unresolved.filter(s =>
    (s.safetyEscalationLevel ?? 0) > 0 ||
    !usableConfidence.has(s.qualitativeConfidence) ||
    !(s.evidenceRefs?.length > 0)
  );
  return {
    usable: states.length > 0 && blocking.length === 0,
    unresolved,
    blocking,
    candidateIds: unresolved.filter(s => usableConfidence.has(s.qualitativeConfidence) && (s.evidenceRefs?.length > 0)).map(s => s.constructId)
  };
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
