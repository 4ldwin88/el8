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

function evidenceUsable(state={}) {
  if ((state.safetyEscalationLevel ?? 0) > 0) return false;
  if (!usableConfidence.has(state.qualitativeConfidence)) return false;
  return (state.evidenceRefs?.length ?? 0) > 0;
}

function decisionUsefulState(state={}, {allowBoundedUncertainty=false}={}) {
  if (!evidenceUsable(state)) return false;
  // Normal handoff still expects governed driver/context depth. When Discovery has
  // exhausted the governed questions that could add decision value, however, a
  // supported concern may cross the boundary with its uncertainty preserved rather
  // than forcing an artificial specificity question solely to satisfy a threshold.
  if (state.driverKnown === true || (state.specificityFrontier ?? 0) >= 3) return true;
  return allowBoundedUncertainty && (state.specificityFrontier ?? 0) >= 2;
}

// Discovery may legitimately stop with unresolved constructs when the available
// governed bank has nothing else useful to ask. Bounded uncertainty is opt-in and
// is used only by the controller after eligible/recovery questions are exhausted.
// Safety and weak/unsupported evidence remain blocking in every mode.
export function handoffAudit(states,{allowBoundedUncertainty=false}={}) {
  const unresolved = states.filter(s => !terminal.has(s.resolutionState));
  const blocking = unresolved.filter(s => !decisionUsefulState(s,{allowBoundedUncertainty}));
  return {
    usable: states.length > 0 && blocking.length === 0,
    unresolved,
    blocking,
    candidateIds: unresolved.filter(s=>decisionUsefulState(s,{allowBoundedUncertainty})).map(s => s.constructId),
    boundedUncertainty: allowBoundedUncertainty && unresolved.some(s=>evidenceUsable(s)&&s.driverKnown!==true&&(s.specificityFrontier??0)<3)
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
