// Temporary compatibility boundary for persisted/legacy Member State.
// Canonical code consumes v3 only. This module may READ legacy semantics but
// must emit canonical construct-native Member State and explicit migration notes.

import {
  MEMBER_STATE_SCHEMA_VERSION,
  createMemberState,
  createConstructState,
  createFocusDecision,
  validateMemberStateShape,
} from './member-state-contract.js';
import { isConstructId } from '../../registries/taxonomy/index.js';

const LEGACY_CONSTRUCT_MAP = Object.freeze({
  poor_sleep: ['SLEEP_QUALITY'],
  low_energy: ['ENERGY_FUNCTION'],
  low_activity: ['ACTIVITY_LEVEL'],
  physical_condition: ['PHYSICAL_CONDITION'],
  stress: ['PRESSURE_PATTERN'],
  relationship_strain: ['RELATIONSHIP_STRAIN'],
  low_support: ['SUPPORT_AVAILABILITY'],
  lonely: ['LONELINESS'],
  low_focus: ['FOCUS_FUNCTION'],
  low_activation: ['ACTIVATION'],
  work_instability: ['JOB_SECURITY'],
  schedule_disruption: ['SCHEDULE_DISRUPTION'],
  money_pressure: ['FINANCIAL_STRAIN'],
  home_instability: ['HOUSING_STABILITY'],
  lack_direction: ['DIRECTION_CLARITY'],
});

const LEGACY_STATUS_MAP = Object.freeze({
  unknown: 'unknown',
  possible: 'possible',
  suspected: 'possible',
  supported: 'supported',
  confirmed: 'supported',
  resolved: 'resolved',
  inactive: 'resolved',
});

function clone(value) { return value === undefined ? undefined : structuredClone(value); }
function list(value) { return Array.isArray(value) ? value : []; }
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function pushUnique(target, values) { for (const value of values) if (!target.includes(value)) target.push(value); }
function note(notes, code, detail = {}) { notes.push({ code, ...detail }); }

function legacyConstructIds(rawId) {
  if (isConstructId(rawId)) return [rawId];
  return LEGACY_CONSTRUCT_MAP[rawId] ?? [];
}

function normalizeStatus(status) { return LEGACY_STATUS_MAP[status] ?? 'unknown'; }

function normalizeConstruct(rawId, raw = {}, notes = []) {
  const ids = legacyConstructIds(rawId);
  if (!ids.length) {
    note(notes, 'unmapped_legacy_construct', { rawId });
    return [];
  }
  if (ids.length > 1) note(notes, 'ambiguous_legacy_construct', { rawId, constructIds: ids });
  return ids.map(constructId => {
    const item = createConstructState({ constructId, status: normalizeStatus(raw.status) });
    item.evidenceConfidence = raw.evidenceConfidence ?? raw.confidence ?? 'unknown';
    item.sufficiency = raw.sufficiency ?? raw.coverageState ?? 'insufficient';
    item.unresolvedReasons = [...list(raw.unresolvedReasons)];
    item.factIds = [...list(raw.factIds)];
    item.evidenceRefs = [...list(raw.evidenceRefs)];
    item.observationRefs = [...list(raw.observationRefs)];
    item.indicatorIds = [...list(raw.indicatorIds)];
    item.hypothesisIds = [...list(raw.hypothesisIds)];
    item.firstObservedAt = raw.firstObservedAt ?? null;
    item.lastObservedAt = raw.lastObservedAt ?? null;
    item.lastDerivedAt = raw.lastDerivedAt ?? item.lastDerivedAt;
    return item;
  });
}

function normalizeDimensions(target, source = {}, notes = []) {
  for (const [dimensionId, raw] of Object.entries(object(source))) {
    if (!target.dimensions[dimensionId]) {
      note(notes, 'unmapped_legacy_dimension', { dimensionId });
      continue;
    }
    const dimension = target.dimensions[dimensionId];
    dimension.conditionState = raw.conditionState ?? raw.status ?? dimension.conditionState;
    dimension.coverageState = raw.coverageState ?? raw.sufficiency ?? dimension.coverageState;
    dimension.coverageEvidenceRefs = [...list(raw.coverageEvidenceRefs)];
    dimension.topicIds = [...list(raw.topicIds)];
    dimension.constructIds = [...list(raw.constructIds).flatMap(legacyConstructIds).filter(isConstructId)];
    dimension.strengthIds = [...list(raw.strengthIds)];
    dimension.constraintIds = [...list(raw.constraintIds)];
    dimension.evidenceRefs = [...list(raw.evidenceRefs)];
    dimension.lastObservedAt = raw.lastObservedAt ?? null;
    dimension.lastDerivedAt = raw.lastDerivedAt ?? null;
  }
}

function normalizeFocus(target, source = {}, notes = []) {
  const rawDecisions = object(source.focusDecisions ?? source.focus?.decisions);
  for (const [rawId, rawDecision] of Object.entries(rawDecisions)) {
    const ids = legacyConstructIds(rawId);
    if (ids.length !== 1) {
      note(notes, ids.length ? 'ambiguous_focus_not_migrated' : 'unmapped_focus_not_migrated', { rawId });
      continue;
    }
    const constructId = ids[0];
    const decisionValue = typeof rawDecision === 'string' ? rawDecision : rawDecision?.decision;
    try {
      target.focusDecisions[constructId] = createFocusDecision({
        constructId,
        decision: decisionValue,
        decidedAt: rawDecision?.decidedAt,
        reasonCodes: list(rawDecision?.reasonCodes),
        constraintRefs: list(rawDecision?.constraintRefs),
      });
    } catch {
      note(notes, 'invalid_focus_decision_not_migrated', { rawId, decision: decisionValue });
    }
  }
  target.activeFocusIds = list(source.activeFocusIds ?? source.focus?.activeFocusIds)
    .flatMap(legacyConstructIds)
    .filter(id => target.focusDecisions[id]?.decision === 'accepted');
}

export function normalizeMemberState(input, { memberId = null } = {}) {
  const source = object(input);
  const notes = [];
  const target = createMemberState({ memberId: source.memberId ?? memberId ?? null, now: source.createdAt });
  target.createdAt = source.createdAt ?? target.createdAt;
  target.updatedAt = source.updatedAt ?? target.updatedAt;
  target.revision = Number.isInteger(source.revision) && source.revision >= 0 ? source.revision : 0;

  normalizeDimensions(target, source.dimensions, notes);

  for (const [rawId, raw] of Object.entries(object(source.constructs ?? source.concerns))) {
    for (const item of normalizeConstruct(rawId, object(raw), notes)) {
      const existing = target.constructs[item.constructId];
      if (!existing) target.constructs[item.constructId] = item;
      else {
        pushUnique(existing.evidenceRefs, item.evidenceRefs);
        pushUnique(existing.observationRefs, item.observationRefs);
        pushUnique(existing.factIds, item.factIds);
        pushUnique(existing.indicatorIds, item.indicatorIds);
        pushUnique(existing.hypothesisIds, item.hypothesisIds);
        pushUnique(existing.unresolvedReasons, item.unresolvedReasons);
        if (existing.status === 'unknown' && item.status !== 'unknown') existing.status = item.status;
      }
    }
  }

  target.facts = clone(object(source.facts));
  target.hypotheses = clone(object(source.hypotheses));
  target.indicators = clone(object(source.indicators));
  target.goals = clone(object(source.goals));
  target.constraints = clone(object(source.constraints));
  normalizeFocus(target, source, notes);
  target.activePlanRef = clone(source.activePlanRef ?? source.planRef ?? null);
  target.activeActionIds = [...list(source.activeActionIds)];
  target.reviewCycles = [...list(source.reviewCycles)];
  target.memberContext = { ...target.memberContext, ...clone(object(source.memberContext)) };
  target.safety = { ...target.safety, ...clone(object(source.safety)) };
  target.historyRefs = [...list(source.historyRefs)];

  const errors = validateMemberStateShape(target);
  if (errors.length) note(notes, 'normalized_state_validation_errors', { errors });
  if (source.schemaVersion !== MEMBER_STATE_SCHEMA_VERSION) note(notes, 'schema_migrated', { from: source.schemaVersion ?? null, to: MEMBER_STATE_SCHEMA_VERSION });
  return { state: target, migrationNotes: notes };
}

export function legacyConstructMap() { return LEGACY_CONSTRUCT_MAP; }
