'use strict';

const { assertMemberState } = require('./member-state');

/**
 * Project canonical Member State into the bounded input Planning is allowed to use.
 * Planning consumes member-accepted priorities and supported problems; it must not
 * independently reinterpret Discovery or Prioritization state.
 */
function projectPlanningInput(state) {
  assertMemberState(state);

  const acceptedPriorities = state.priorities
    .filter((p) => p.status === 'ACCEPTED')
    .sort((a, b) => {
      const ar = Number.isFinite(Number(a.rank)) ? Number(a.rank) : Number.MAX_SAFE_INTEGER;
      const br = Number.isFinite(Number(b.rank)) ? Number(b.rank) : Number.MAX_SAFE_INTEGER;
      return ar - br || a.id.localeCompare(b.id);
    });
  const acceptedIds = new Set(acceptedPriorities.map((p) => p.id));
  const priorityByProblem = new Map(
    acceptedPriorities
      .filter((p) => p.problemId)
      .map((p) => [p.problemId, p.id]),
  );
  const rankByPriority = new Map(acceptedPriorities.map((p) => [p.id, Number.isFinite(Number(p.rank)) ? Number(p.rank) : null]));

  const problems = state.problems
    .map((problem) => {
      const priorityId = problem.priorityId || priorityByProblem.get(problem.id) || null;
      if (!priorityId || !acceptedIds.has(priorityId)) return null;
      return {
        problemId: problem.id,
        priorityId,
        priorityRank: rankByPriority.get(priorityId),
        status: problem.status || null,
        evidenceRefs: [...(problem.evidenceRefs || [])],
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const ar = a.priorityRank == null ? Number.MAX_SAFE_INTEGER : a.priorityRank;
      const br = b.priorityRank == null ? Number.MAX_SAFE_INTEGER : b.priorityRank;
      return ar - br || a.priorityId.localeCompare(b.priorityId);
    });

  return {
    memberStateRevision: state.revision,
    confirmedPriorityIds: acceptedPriorities.map((p) => p.id),
    priorityOrder: acceptedPriorities.map((p) => ({ priorityId: p.id, rank: Number.isFinite(Number(p.rank)) ? Number(p.rank) : null })),
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
