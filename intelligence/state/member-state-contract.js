// Canonical EL8 Intelligence Member State contract.
// Durable state records evidence and member decisions. Discovery, Prioritization,
// Planning, Safety and Review remain separate authorities.

import { DIMENSIONS, isDimensionId, isTopicId, isConstructId, CONSTRUCT_BY_ID, TAXONOMY_VERSION } from '../../registries/taxonomy/index.js';
import { CONSTRUCT_STATUS } from '../contracts/canonical-vocabulary.js';

export const CONDITION_STATUS = Object.freeze(['unknown', 'need_attention', 'stable', 'healthy', 'thriving']);
export const COVERAGE_STATUS = Object.freeze(['unknown', 'insufficient', 'sufficient']);
export const HYPOTHESIS_STATUS = Object.freeze(['generated', 'corroborating', 'contradicted', 'inconclusive', 'eligible_for_confirmation', 'member_confirmed', 'rejected', 'deferred']);
export const CONFIRMATION_STATUS = Object.freeze(['not_required', 'pending', 'confirmed', 'rejected', 'deferred']);
export const FACT_STATUS = Object.freeze(['current', 'superseded', 'retracted']);
export const FOCUS_DECISION = Object.freeze(['accepted', 'rejected', 'postponed', 'paused']);
export const MEMBER_STATE_SCHEMA_VERSION = '3.0.0';

function isoNow() { return new Date().toISOString(); }

export function createMemberState({ memberId = null, now = isoNow() } = {}) {
  return {
    schemaVersion: MEMBER_STATE_SCHEMA_VERSION,
    taxonomyVersion: TAXONOMY_VERSION,
    memberId,
    revision: 0,
    createdAt: now,
    updatedAt: now,
    dimensions: Object.fromEntries(DIMENSIONS.map(({ id: dimensionId }) => [dimensionId, {
      dimensionId, conditionState: 'unknown', coverageState: 'unknown', coverageEvidenceRefs: [],
      topicIds: [], constructIds: [], strengthIds: [], constraintIds: [], evidenceRefs: [],
      lastObservedAt: null, lastDerivedAt: null,
    }])),
    constructs: {},
    facts: {},
    hypotheses: {},
    focus: { decisions: {}, activeFocusIds: [], updatedAt: null },
    memberContext: { capacity: 'unknown', readiness: 'unknown', preferences: {}, constraints: [], supports: [] },
    safety: { disposition: 'ordinary_flow', updatedAt: null, evidenceRefs: [] },
    activePlanRef: null,
    reviewCycleRef: null,
    provenance: { discoverySessionRefs: [], evidenceRefs: [], sourceVersions: {} },
  };
}

export function createConstructState({ constructId, dimensionId = null, topicIds = [], status = 'unknown', sufficiency = 'insufficient', evidenceRefs = [], confidence = null, lastObservedAt = null, lastDerivedAt = null, metadata = {} } = {}) {
  if (!isConstructId(constructId)) throw new Error(`Unknown constructId: ${constructId}`);
  const canonical = CONSTRUCT_BY_ID[constructId];
  const resolvedDimensionId = dimensionId ?? canonical.dimensionId;
  if (!isDimensionId(resolvedDimensionId)) throw new Error(`Unknown dimensionId: ${resolvedDimensionId}`);
  const resolvedTopicIds = topicIds.length ? topicIds : canonical.topicIds;
  for (const topicId of resolvedTopicIds) if (!isTopicId(topicId)) throw new Error(`Unknown topicId: ${topicId}`);
  if (!CONSTRUCT_STATUS.includes(status)) throw new Error(`Invalid construct status: ${status}`);
  if (!COVERAGE_STATUS.includes(sufficiency)) throw new Error(`Invalid construct sufficiency: ${sufficiency}`);
  return { constructId, dimensionId: resolvedDimensionId, topicIds: [...resolvedTopicIds], status, sufficiency, evidenceRefs: [...evidenceRefs], confidence, lastObservedAt, lastDerivedAt, metadata: { ...metadata } };
}

export function createFact({ factId, key, value, status = 'current', observedAt = isoNow(), source = 'member', evidenceRefs = [], supersedesFactId = null, metadata = {} } = {}) {
  if (!factId || !key) throw new Error('Fact requires factId and key');
  if (!FACT_STATUS.includes(status)) throw new Error(`Invalid fact status: ${status}`);
  return { factId, key, value, status, observedAt, source, evidenceRefs: [...evidenceRefs], supersedesFactId, metadata: { ...metadata } };
}

export function createHypothesis({ hypothesisId, constructIds = [], relationship = null, status = 'generated', confidence = null, evidenceForRefs = [], evidenceAgainstRefs = [], generatedAt = isoNow(), updatedAt = generatedAt, metadata = {} } = {}) {
  if (!hypothesisId) throw new Error('Hypothesis requires hypothesisId');
  for (const constructId of constructIds) if (!isConstructId(constructId)) throw new Error(`Unknown constructId: ${constructId}`);
  if (!HYPOTHESIS_STATUS.includes(status)) throw new Error(`Invalid hypothesis status: ${status}`);
  return { hypothesisId, constructIds: [...constructIds], relationship, status, confidence, evidenceForRefs: [...evidenceForRefs], evidenceAgainstRefs: [...evidenceAgainstRefs], generatedAt, updatedAt, metadata: { ...metadata } };
}

export function createFocusDecision({ constructId, decision, decidedAt = isoNow(), reason = null, evidenceRefs = [], source = 'member', metadata = {} } = {}) {
  if (!isConstructId(constructId)) throw new Error(`Unknown constructId: ${constructId}`);
  if (!FOCUS_DECISION.includes(decision)) throw new Error(`Invalid focus decision: ${decision}`);
  return { constructId, decision, decidedAt, reason, evidenceRefs: [...evidenceRefs], source, metadata: { ...metadata } };
}

export function validateMemberStateShape(state) {
  const errors = [];
  if (!state || typeof state !== 'object') return ['Member State must be an object'];
  if (state.schemaVersion !== MEMBER_STATE_SCHEMA_VERSION) errors.push(`schemaVersion must be ${MEMBER_STATE_SCHEMA_VERSION}`);
  if (state.taxonomyVersion !== TAXONOMY_VERSION) errors.push(`taxonomyVersion must be ${TAXONOMY_VERSION}`);
  if (!Number.isInteger(state.revision) || state.revision < 0) errors.push('revision must be a non-negative integer');
  if (!state.dimensions || typeof state.dimensions !== 'object') errors.push('dimensions required');
  if (!state.constructs || typeof state.constructs !== 'object') errors.push('constructs required');
  if (!state.facts || typeof state.facts !== 'object') errors.push('facts required');
  if (!state.hypotheses || typeof state.hypotheses !== 'object') errors.push('hypotheses required');
  if (!state.focus || typeof state.focus !== 'object') errors.push('focus required');
  if (!state.memberContext || typeof state.memberContext !== 'object') errors.push('memberContext required');
  if (!state.safety || typeof state.safety !== 'object') errors.push('safety required');
  for (const [dimensionId, dimension] of Object.entries(state.dimensions ?? {})) {
    if (!isDimensionId(dimensionId)) errors.push(`Unknown dimension: ${dimensionId}`);
    if (!CONDITION_STATUS.includes(dimension.conditionState)) errors.push(`Invalid conditionState for ${dimensionId}`);
    if (!COVERAGE_STATUS.includes(dimension.coverageState)) errors.push(`Invalid coverageState for ${dimensionId}`);
  }
  for (const [constructId, construct] of Object.entries(state.constructs ?? {})) {
    if (!isConstructId(constructId)) errors.push(`Unknown construct: ${constructId}`);
    if (construct.constructId !== constructId) errors.push(`Construct key/id mismatch: ${constructId}`);
    if (!CONSTRUCT_STATUS.includes(construct.status)) errors.push(`Invalid construct status: ${constructId}`);
    if (!COVERAGE_STATUS.includes(construct.sufficiency)) errors.push(`Invalid construct sufficiency: ${constructId}`);
  }
  return errors;
}
