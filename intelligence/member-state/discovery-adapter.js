'use strict';

const { assertMemberState } = require('./member-state');
const { assertBoundaryMessage } = require('./contracts');
const { applyMemberStateUpdate } = require('./member-state-update');

/**
 * Thin migration adapter for Discovery results.
 * Discovery remains free to use ephemeral session state, but only evidence,
 * problems, hypotheses and dimension conclusions may become durable here.
 * Priorities, plans and interventions are deliberately rejected.
 */
function applyDiscoveryResult(state, result, { at, source = 'discovery' } = {}) {
  assertMemberState(state);
  if (!result || typeof result !== 'object') throw new Error('discovery result is required');
  assertBoundaryMessage('evidenceToDiscovery', {
    memberStateRevision: result.memberStateRevision,
    evidenceRefs: result.evidenceRefs || [],
  });
  if (result.memberStateRevision !== state.revision) {
    throw new Error(`discovery result revision conflict: expected ${result.memberStateRevision}, actual ${state.revision}`);
  }
  for (const forbidden of ['priorities', 'recommendedPriorities', 'interventions', 'plan', 'memberPlan']) {
    if (result[forbidden] != null) throw new Error(`Discovery cannot persist ${forbidden}`);
  }

  let next = state;
  const write = (type, payload, refs = result.evidenceRefs || []) => {
    next = applyMemberStateUpdate(next, {
      type,
      payload,
      refs,
      at,
      source,
      expectedRevision: next.revision,
      reason: 'canonical Discovery result',
    });
  };

  for (const evidence of result.evidence || []) write('EVIDENCE_RECORDED', evidence, [evidence.id]);
  for (const problem of result.problemUpdates || []) write('PROBLEM_UPDATED', problem);
  for (const hypothesis of result.hypothesisUpdates || []) write('HYPOTHESIS_UPDATED', hypothesis);
  for (const dimension of result.dimensionUpdates || []) write('DIMENSION_UPDATED', dimension);

  return next;
}

module.exports = { applyDiscoveryResult };
