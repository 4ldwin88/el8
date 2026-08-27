'use strict';

const { assertMemberState } = require('./member-state');

const ELIGIBLE_PROBLEM_STATUSES = Object.freeze(['SUPPORTED']);
const INELIGIBLE_REASONS = Object.freeze({
  UNRESOLVED: 'discovery_incomplete',
  DEFERRED: 'discovery_deferred',
  ESCALATED: 'safety_or_specialist_resolution',
  CONTRADICTED: 'not_supported',
});

/**
 * Produces the only problem set canonical Prioritization may rank.
 * Visibility and eligibility are deliberately separate: unresolved/deferred/
 * contradicted problems remain in Member State, but cannot become priorities.
 */
function projectPrioritizationCandidates(state) {
  assertMemberState(state);
  const candidates = [];
  const excluded = [];

  for (const problem of state.problems) {
    if (ELIGIBLE_PROBLEM_STATUSES.includes(problem.status)) {
      candidates.push({
        problemId: problem.id,
        evidenceRefs: [...(problem.evidenceRefs || [])],
        confidence: problem.confidence ?? null,
        temporality: problem.temporality || 'unknown',
      });
    } else {
      excluded.push({
        problemId: problem.id,
        status: problem.status,
        reason: INELIGIBLE_REASONS[problem.status] || 'not_eligible',
      });
    }
  }

  return {
    memberStateRevision: state.revision,
    supportedProblemIds: candidates.map((item) => item.problemId),
    candidates,
    excluded,
  };
}

module.exports = { ELIGIBLE_PROBLEM_STATUSES, projectPrioritizationCandidates };
