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

function decisionUsefulState(state={}) {
  if ((state.safetyEscalationLevel ?? 0) > 0) return false;
  if (!usableConfidence.has(state.qualitativeConfidence)) return false;
  if (!(state.evidenceRefs?.length > 0)) return false;
  // A surface-state answer is not enough to hand a concern to Planning. Discovery
  // must either reach driver/context depth (specificity 3), explicitly establish a
  // governed driver, or terminate the construct through a governed resolution.
  // This preserves uncertainty without allowing premature Planning-ready handoff.
  return state.driverKnown === true || (state.specificityFrontier ?? 0) >= 3;
}

// Discovery may legitimately stop with unresolved constructs when the available
// governed bank has nothing else useful to ask. A bounded handoff is allowed only
// when every unresolved state has decision-useful evidence; unresolved safety never
// qualifies. Driver/context depth is required so a supported surface concern cannot
// silently become Planning-ready before Narrow/Deepen has done its job.
export function handoffAudit(states) {
  const unresolved = states.filter(s => !terminal.has(s.resolutionState));
  const blocking = unresolved.filter(s => !decisionUsefulState(s));
  return {
    usable: states.length > 0 && blocking.length === 0,
    unresolved,
    blocking,
    candidateIds: unresolved.filter(decisionUsefulState).map(s => s.constructId)
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
