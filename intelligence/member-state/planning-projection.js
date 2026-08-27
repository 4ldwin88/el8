'use strict';

const { assertMemberState } = require('./member-state');

/**
 * Project canonical Member State into the bounded input Planning is allowed to use.
 * Planning consumes member-accepted priorities and supported problems; it must not
 * independently reinterpret Discovery or Prioritization state.
 */
function projectPlanningInput(state) {
  assertMemberState(state);

  const acceptedPriorities = state.priorities.filter((p) => p.status === 'ACCEPTED');
  const acceptedIds = new Set(acceptedPriorities.map((p) => p.id));
  const priorityByProblem = new Map(
    acceptedPriorities
      .filter((p) => p.problemId)
      .map((p) => [p.problemId, p.id]),
  );

  const problems = state.problems
    .map((problem) => {
      const priorityId = problem.priorityId || priorityByProblem.get(problem.id) || null;
      if (!priorityId || !acceptedIds.has(priorityId)) return null;
      return {
        problemId: problem.id,
        priorityId,
        status: problem.status || null,
        evidenceRefs: [...(problem.evidenceRefs || [])],
      };
    })
    .filter(Boolean);

  return {
    memberStateRevision: state.revision,
    confirmedPriorityIds: acceptedPriorities.map((p) => p.id),
    problems,
    constraints: {
      capacity: state.engagementBurden.capacity || 'medium',
      throttle: {
        active: Boolean(state.engagementBurden.throttle?.active),
        reasonCodes: [...(state.engagementBurden.throttle?.reasonCodes || [])],
      },
      safety: {
        disposition: state.safety.disposition || 'ORDINARY_FLOW',
        unresolvedConstraints: [...(state.safety.unresolvedConstraints || [])],
      },
    },
  };
}

module.exports = { projectPlanningInput };
