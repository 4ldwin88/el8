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
  const ranked = acceptedPriorities.map((p) => ({ p, rank: Number(p.rank) }));
  const unresolvedRank = acceptedPriorities.length > 1 && ranked.some(({ rank }) => !Number.isFinite(rank) || rank < 1);
  const duplicateRank = acceptedPriorities.length > 1 && new Set(ranked.map(({ rank }) => rank)).size !== ranked.length;
  const priorityOrderResolved = !unresolvedRank && !duplicateRank;

  if (priorityOrderResolved) acceptedPriorities.sort((a, b) => Number(a.rank) - Number(b.rank) || a.id.localeCompare(b.id));

  const acceptedIds = new Set(acceptedPriorities.map((p) => p.id));
  const priorityByProblem = new Map(acceptedPriorities.filter((p) => p.problemId).map((p) => [p.problemId, p.id]));
  const rankByPriority = new Map(acceptedPriorities.map((p) => [p.id, Number.isFinite(Number(p.rank)) ? Number(p.rank) : null]));

  const problems = state.problems.map((problem) => {
    const priorityId = problem.priorityId || priorityByProblem.get(problem.id) || null;
    if (!priorityId || !acceptedIds.has(priorityId)) return null;
    return { problemId: problem.id, priorityId, priorityRank: rankByPriority.get(priorityId), status: problem.status || null, evidenceRefs: [...(problem.evidenceRefs || [])] };
  }).filter(Boolean);

  if (priorityOrderResolved) problems.sort((a, b) => Number(a.priorityRank) - Number(b.priorityRank) || a.priorityId.localeCompare(b.priorityId));

  return {
    memberStateRevision: state.revision,
    confirmedPriorityIds: acceptedPriorities.map((p) => p.id),
    priorityOrderResolved,
    priorityOrderReason: priorityOrderResolved ? 'canonical_rank' : (duplicateRank ? 'duplicate_rank' : 'missing_or_invalid_rank'),
    priorityOrder: acceptedPriorities.map((p) => ({ priorityId: p.id, rank: Number.isFinite(Number(p.rank)) ? Number(p.rank) : null })),
    problems,
    constraints: {
      capacity: state.engagementBurden.capacity || 'medium',
      throttle: { active: Boolean(state.engagementBurden.throttle?.active), reasonCodes: [...(state.engagementBurden.throttle?.reasonCodes || [])] },
      safety: { disposition: state.safety.disposition || 'ORDINARY_FLOW', unresolvedConstraints: [...(state.safety.unresolvedConstraints || [])] },
    },
  };
}

module.exports = { projectPlanningInput };
