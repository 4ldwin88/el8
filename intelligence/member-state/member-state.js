'use strict';

/**
 * EL8 Canonical Member State v1
 *
 * The single longitudinal domain contract shared by EL8 intelligence.
 * This is a domain representation, not a persistence schema. Engines may
 * maintain ephemeral working state, but durable member truth must enter this
 * contract through explicit updates.
 */

const MEMBER_STATE_VERSION = '1.0.0';

const DIMENSIONS = Object.freeze([
  'physical',
  'emotional',
  'social',
  'intellectual',
  'spiritual',
  'occupational',
  'financial',
  'environmental',
]);

const DIMENSION_SCOPE = Object.freeze([
  'FOCUS',
  'MONITORED',
  'REFERRED',
  'PAUSED',
]);

const PRIORITY_STATUS = Object.freeze([
  'RECOMMENDED',
  'ACCEPTED',
  'REJECTED',
  'POSTPONED',
  'PAUSED',
  'COMPLETED',
]);

const INTERVENTION_STATUS = Object.freeze([
  'PROPOSED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
  'MODIFIED',
  'PAUSED',
  'DISCONTINUED',
]);

const HYPOTHESIS_STATUS = Object.freeze([
  'SUSPECTED',
  'SUPPORTED',
  'MEMBER_CONFIRMED',
  'EXTERNALLY_ESTABLISHED',
  'CONTRADICTED',
  'STALE',
  'ARCHIVED',
]);

const CONSIDERATION_STATUS = Object.freeze([
  'SAVED',
  'CONSIDERING',
  'DISMISSED',
  'PROPOSED_FOR_PLAN',
  'MOVED_TO_PLAN',
]);

function createDimensionState() {
  return {
    scope: 'MONITORED',
    condition: null,
    confidence: null,
    evidenceRefs: [],
    updatedAt: null,
  };
}

function createMemberState({ memberId, now = new Date().toISOString() } = {}) {
  if (!memberId || typeof memberId !== 'string') {
    throw new TypeError('memberId is required');
  }

  return {
    schemaVersion: MEMBER_STATE_VERSION,
    memberId,
    revision: 0,
    createdAt: now,
    updatedAt: now,

    profile: {
      goals: [],
      preferences: {},
      constraints: [],
      accessibilityNeeds: [],
      consent: {},
      permissions: {},
    },

    dimensions: Object.fromEntries(
      DIMENSIONS.map((dimension) => [dimension, createDimensionState()]),
    ),

    evidence: [],

    problems: [],

    hypotheses: [],

    priorities: [],

    activePlan: {
      planId: null,
      status: null,
      interventions: [],
      reviewDueAt: null,
      activatedAt: null,
      updatedAt: null,
    },

    engagementBurden: {
      capacity: null,
      manageability: null,
      adherenceTrend: null,
      skippedRequests: [],
      deferrals: [],
      trackingBurden: null,
      interventionBurden: null,
      disengagementSignals: [],
      throttle: {
        active: false,
        policyVersion: null,
        reasonCodes: [],
        activatedAt: null,
      },
      updatedAt: null,
    },

    considerations: [],

    learning: [],

    safety: {
      disposition: 'ORDINARY_FLOW',
      unresolvedConstraints: [],
      policyVersion: null,
      updatedAt: null,
    },

    history: [],
  };
}

function assertMemberState(state) {
  if (!state || typeof state !== 'object') {
    throw new TypeError('member state must be an object');
  }
  if (state.schemaVersion !== MEMBER_STATE_VERSION) {
    throw new Error(`unsupported member state schema: ${state.schemaVersion}`);
  }
  if (!state.memberId) throw new Error('memberId is required');

  for (const dimension of DIMENSIONS) {
    if (!state.dimensions || !state.dimensions[dimension]) {
      throw new Error(`missing dimension state: ${dimension}`);
    }
    if (!DIMENSION_SCOPE.includes(state.dimensions[dimension].scope)) {
      throw new Error(`invalid dimension scope: ${dimension}`);
    }
  }

  if (!Array.isArray(state.evidence)) throw new Error('evidence must be an array');
  if (!Array.isArray(state.problems)) throw new Error('problems must be an array');
  if (!Array.isArray(state.hypotheses)) throw new Error('hypotheses must be an array');
  if (!Array.isArray(state.priorities)) throw new Error('priorities must be an array');
  if (!Array.isArray(state.considerations)) throw new Error('considerations must be an array');
  if (!Array.isArray(state.learning)) throw new Error('learning must be an array');
  if (!Array.isArray(state.history)) throw new Error('history must be an array');

  return state;
}

module.exports = {
  MEMBER_STATE_VERSION,
  DIMENSIONS,
  DIMENSION_SCOPE,
  PRIORITY_STATUS,
  INTERVENTION_STATUS,
  HYPOTHESIS_STATUS,
  CONSIDERATION_STATUS,
  createMemberState,
  assertMemberState,
};
