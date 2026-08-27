'use strict';

/**
 * Canonical EL8 inter-capability contracts.
 *
 * These contracts deliberately describe domain messages rather than engine
 * internals. Each capability receives Member State plus the minimum explicit
 * decision input it needs and returns proposals/updates rather than silently
 * mutating another capability's state.
 */

const CONTRACT_VERSION = '1.0.0';

const CONTRACTS = Object.freeze({
  evidenceToDiscovery: {
    required: ['memberStateRevision', 'evidenceRefs'],
    produces: ['problemUpdates', 'hypothesisUpdates', 'dimensionUpdates', 'deepeningRequests'],
  },
  discoveryToPrioritization: {
    required: ['memberStateRevision', 'supportedProblemIds'],
    produces: ['recommendedPriorities', 'alternatives', 'rationale'],
  },
  priorityChoiceToPlanning: {
    required: ['memberStateRevision', 'confirmedPriorityIds', 'memberChoice'],
    produces: ['interventionOptions', 'planRationale', 'requiredEvidence'],
  },
  executionToFeedback: {
    required: ['memberStateRevision', 'planId', 'evidenceRefs'],
    produces: ['reviewInterpretation', 'learningUpdates', 'nextDisposition'],
  },
  feedbackToMemberState: {
    required: ['memberStateRevision', 'learningUpdates', 'nextDisposition'],
    produces: ['memberStateUpdates'],
  },
});

const NEXT_DISPOSITIONS = Object.freeze([
  'CONTINUE',
  'DEEPEN',
  'SIMPLIFY',
  'REPLACE',
  'REASSESS',
  'PAUSE_REENGAGE',
  'REFER',
  'EXIT',
]);

function assertRevision(message) {
  if (!Number.isInteger(message.memberStateRevision) || message.memberStateRevision < 0) {
    throw new Error('memberStateRevision must be a non-negative integer');
  }
}

function assertRefs(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  if (value.some((ref) => typeof ref !== 'string' || !ref)) {
    throw new Error(`${field} must contain non-empty string references`);
  }
}

function assertBoundaryMessage(name, message) {
  const contract = CONTRACTS[name];
  if (!contract) throw new Error(`unknown boundary contract: ${name}`);
  if (!message || typeof message !== 'object') throw new Error(`${name} message is required`);
  assertRevision(message);

  for (const field of contract.required) {
    if (!(field in message)) throw new Error(`${name}.${field} is required`);
  }

  if ('evidenceRefs' in message) assertRefs(message.evidenceRefs, `${name}.evidenceRefs`);
  if ('supportedProblemIds' in message) assertRefs(message.supportedProblemIds, `${name}.supportedProblemIds`);
  if ('confirmedPriorityIds' in message) assertRefs(message.confirmedPriorityIds, `${name}.confirmedPriorityIds`);
  if ('planId' in message && (!message.planId || typeof message.planId !== 'string')) {
    throw new Error(`${name}.planId is required`);
  }
  if ('nextDisposition' in message && !NEXT_DISPOSITIONS.includes(message.nextDisposition)) {
    throw new Error(`${name}.nextDisposition is invalid`);
  }

  return message;
}

module.exports = {
  CONTRACT_VERSION,
  CONTRACTS,
  NEXT_DISPOSITIONS,
  assertBoundaryMessage,
};
