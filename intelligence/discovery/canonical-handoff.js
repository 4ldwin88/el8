// Adapter from reconstructed Discovery state into the canonical Intelligence boundary.
// This intentionally does not change Discovery's internal evidence model yet.

import { createContractRef } from '../../intelligence/contracts/core.js';
import { createHandoff } from '../../intelligence/contracts/handoffs.js';
import { MEMBER_STATE_SCHEMA_VERSION } from '../../intelligence/state/member-state-contract.js';

export function createDiscoveryPrioritizationHandoff({
  handoffId,
  memberStateId,
  observationRefs = [],
  evidenceRefs = [],
  safetySignalRefs = [],
  concernStates = [],
  createdAt = null,
} = {}) {
  if (!memberStateId) throw new Error('memberStateId is required');

  const unresolvedRefs = concernStates
    .filter(state => !state.excluded && !['sufficient', 'nonIssue'].includes(state.resolutionState ?? ''))
    .map(state => createContractRef({
      id: state.concernId,
      type: 'concern',
      schemaVersion: '1.0.0',
    }));

  return createHandoff({
    handoffId,
    type: 'discovery_to_prioritization',
    memberStateRef: createContractRef({
      id: memberStateId,
      type: 'member_state',
      schemaVersion: MEMBER_STATE_SCHEMA_VERSION,
    }),
    inputRefs: observationRefs,
    resultRefs: evidenceRefs,
    safetySignalRefs,
    unresolvedRefs,
    createdAt,
  });
}
