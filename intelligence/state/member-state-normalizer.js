// Temporary compatibility boundary for persisted/legacy Member State.
// Current code consumes v3 only. This module may READ legacy semantics but
// must emit governed construct-native Member State and explicit migration notes.

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
  money_pressure: ['FINANCIAL_STRAIN', 'FINANCIAL_CONTROL'],
  home_instability: ['HOUSING_STABILITY'],
  lack_direction: ['MEANING_PURPOSE', 'DIRECTION_CLARITY'],
  'problem:financial_strain': ['FINANCIAL_STRAIN'],
  'problem:stress': ['PRESSURE_PATTERN'],
  'problem:low_activity': ['ACTIVITY_LEVEL'],
  'problem:poor_sleep': ['SLEEP_QUALITY'],
  'problem:income_gap': ['JOB_SECURITY'],
  'problem:execution_gap': ['NEXT_STEP_CLARITY', 'ACTIVATION'],
  'problem:social_disconnection': ['LONELINESS', 'SUPPORT_AVAILABILITY'],
  'problem:environment_friction': ['ENVIRONMENTAL_INTERFERENCE'],
  ENVIRONMENTAL_SUPPORT: ['ENVIRONMENTAL_INTERFERENCE'],
});

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function unique(values) { return [...new Set(values.filter(Boolean))]; }
function legacyIds(value) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return unique([value.constructId, value.concernId, value.problemId, value.id, value.legacyConcernId]);
}
function mapLegacy(value) {
  const mapped = [];
  for (const id of legacyIds(value)) {
    if (isConstructId(id)) mapped.push(id);
    else mapped.push(...(LEGACY_CONSTRUCT_MAP[id] ?? []));
  }
  return unique(mapped);
}
function addConstruct(state, constructId, source = {}) {
  if (!state.constructs[constructId]) state.constructs[constructId] = createConstructState({ constructId });
  const target = state.constructs[constructId];
  const legacyStatus = String(source.status ?? '').toLowerCase();
  if (['supported','active','established','member_confirmed','externally_established'].includes(legacyStatus)) target.status = 'supported';
  else if (['candidate','suspected','generated','corroborating'].includes(legacyStatus)) target.status = 'hypothesis';
  else if (['contradicted','rejected'].includes(legacyStatus)) target.status = 'contradicted';
  target.evidenceRefs = unique([...(target.evidenceRefs ?? []), ...(source.evidenceRefs ?? [])]);
  target.factIds = unique([...(target.factIds ?? []), ...(source.factIds ?? [])]);
  for (const dimensionId of target.dimensionIds) {
    const d = state.dimensions[dimensionId];
    if (d && !d.constructIds.includes(constructId)) d.constructIds.push(constructId);
  }
}

export function normalizeMemberState(input, { now = new Date().toISOString() } = {}) {
  if (!input || typeof input !== 'object') throw new TypeError('member state must be an object');
  if (input.schemaVersion === MEMBER_STATE_SCHEMA_VERSION) {
    const state = clone(input);
    const errors = validateMemberStateShape(state);
    if (errors.length) throw new Error(`invalid Member State: ${errors.join('; ')}`);
    return { state, migrated: false, sourceSchemaVersion: input.schemaVersion, notes: [] };
  }

  const state = createMemberState({ memberId: input.memberId ?? input.userId ?? null, now: input.createdAt ?? now });
  state.revision = Number.isInteger(input.revision) && input.revision >= 0 ? input.revision : 0;
  state.updatedAt = input.updatedAt ?? now;
  const notes = [`normalized legacy Member State ${input.schemaVersion ?? 'unknown'} to ${MEMBER_STATE_SCHEMA_VERSION}`];

  const profile = input.profile ?? {};
  state.goals = Array.isArray(profile.goals) ? Object.fromEntries(profile.goals.map((goal, i) => [`legacy-goal-${i + 1}`, clone(goal)])) : {};
  state.memberContext.preferences = clone(profile.preferences ?? input.memberContext?.preferences ?? {});
  state.memberContext.accessibility = clone(input.memberContext?.accessibility ?? profile.accessibilityNeeds ?? {});
  state.memberContext.capacity = input.memberContext?.capacity ?? input.engagementBurden?.capacity ?? 'unknown';
  state.memberContext.manageability = input.memberContext?.manageability ?? input.engagementBurden?.manageability ?? 'unknown';
  state.memberContext.readiness = input.memberContext?.readiness ?? 'unknown';
  if (state.memberContext.capacity == null) state.memberContext.capacity = 'unknown';
  if (state.memberContext.manageability == null) state.memberContext.manageability = 'unknown';
  if (state.memberContext.readiness == null) state.memberContext.readiness = 'unknown';

  for (const [dimensionId, source] of Object.entries(input.dimensions ?? {})) {
    const target = state.dimensions[dimensionId];
    if (!target || !source || typeof source !== 'object') continue;
    target.evidenceRefs = unique(source.evidenceRefs ?? []);
    target.coverageEvidenceRefs = unique(source.coverageEvidenceRefs ?? source.evidenceRefs ?? []);
    target.lastObservedAt = source.lastObservedAt ?? source.updatedAt ?? null;
    target.lastDerivedAt = source.lastDerivedAt ?? source.updatedAt ?? null;
    if (['unknown','insufficient','sufficient'].includes(source.coverageState)) target.coverageState = source.coverageState;
    if (['unknown','need_attention','stable','healthy','thriving'].includes(source.conditionState)) target.conditionState = source.conditionState;
  }

  const semanticRecords = [
    ...Object.values(input.concerns ?? {}),
    ...(Array.isArray(input.problems) ? input.problems : []),
  ];
  for (const record of semanticRecords) {
    const mapped = mapLegacy(record);
    if (!mapped.length) { notes.push(`unmapped legacy semantic id: ${legacyIds(record).join('|') || 'unknown'}`); continue; }
    if (mapped.length > 1) notes.push(`ambiguous legacy semantic mapping retained as separate constructs: ${legacyIds(record).join('|')} -> ${mapped.join(',')}`);
    for (const constructId of mapped) addConstruct(state, constructId, record);
  }

  for (const [id, record] of Object.entries(input.constructs ?? {})) {
    const constructId = isConstructId(id) ? id : (LEGACY_CONSTRUCT_MAP[id]?.[0] ?? mapLegacy(record)[0]);
    if (constructId) addConstruct(state, constructId, record);
  }

  for (const [id, fact] of Object.entries(input.facts ?? {})) state.facts[id] = clone(fact);
  for (const evidence of Array.isArray(input.evidence) ? input.evidence : []) {
    const id = evidence.evidenceId ?? evidence.id;
    if (id) state.facts[`legacy-evidence:${id}`] = { factId:`legacy-evidence:${id}`, semanticKey:'legacy.evidence', value:clone(evidence), sourceType:'legacy_member_state', sourceRef:String(id), affectedConstructId:null, affectedDimensionId:null, observedAt:evidence.observedAt ?? evidence.createdAt ?? now, timeWindow:null, reliability:'unknown', memberConfirmed:false, currentStatus:'current' };
  }

  const hypothesisEntries = Array.isArray(input.hypotheses) ? input.hypotheses.map((h,i)=>[h.hypothesisId ?? h.id ?? `legacy-hypothesis-${i+1}`,h]) : Object.entries(input.hypotheses ?? {});
  for (const [id, h] of hypothesisEntries) {
    state.hypotheses[id] = {
      hypothesisId:id,
      proposition:h.proposition ?? h.label ?? id,
      linkedConstructIds:unique([...(h.linkedConstructIds ?? []), ...mapLegacy(h)]).filter(isConstructId),
      linkedDimensionIds:unique(h.linkedDimensionIds ?? (h.originDimensionId ? [h.originDimensionId] : [])),
      evidenceFor:clone(h.evidenceFor ?? h.evidenceRefs ?? []), evidenceAgainst:clone(h.evidenceAgainst ?? []),
      status:'generated', confirmationStatus:'not_required', createdAt:h.createdAt ?? now, lastDerivedAt:h.lastDerivedAt ?? h.updatedAt ?? now,
    };
  }

  const priorityEntries = Array.isArray(input.priorities) ? input.priorities : [];
  for (const priority of priorityEntries) {
    const decisionMap = { ACCEPTED:'accepted', REJECTED:'rejected', POSTPONED:'postponed', PAUSED:'paused' };
    const decision = decisionMap[String(priority.status ?? '').toUpperCase()];
    if (!decision) continue;
    for (const constructId of mapLegacy(priority)) {
      addConstruct(state, constructId, priority);
      state.focusDecisions[constructId] = createFocusDecision({ constructId, decision, decidedAt:priority.decidedAt ?? priority.memberDecisionAt ?? priority.updatedAt ?? now, reasonCodes:priority.reasonCodes ?? [], constraintRefs:priority.constraintRefs ?? [] });
      if (decision === 'accepted' && !state.activeFocusIds.includes(constructId)) state.activeFocusIds.push(constructId);
    }
  }
  for (const id of input.activePriorities ?? []) {
    for (const constructId of mapLegacy(typeof id === 'string' ? { id } : id)) {
      addConstruct(state, constructId, typeof id === 'object' ? id : {});
      if (!state.focusDecisions[constructId]) state.focusDecisions[constructId] = createFocusDecision({ constructId, decision:'accepted', decidedAt:now, reasonCodes:['legacy_active_priority'] });
      if (!state.activeFocusIds.includes(constructId)) state.activeFocusIds.push(constructId);
    }
  }

  const legacyPlan = input.activePlan ?? input.plan;
  if (legacyPlan && typeof legacyPlan === 'object') {
    const planId = legacyPlan.planId ?? legacyPlan.id ?? null;
    if (planId) state.activePlanRef = { planId, version: legacyPlan.version ?? null, sourceSchemaVersion: input.schemaVersion ?? 'unknown' };
    const interventions = legacyPlan.interventions ?? legacyPlan.actions ?? [];
    state.activeActionIds = unique(interventions.map(item => typeof item === 'string' ? item : item.actionId ?? item.interventionId ?? item.id));
  }

  state.safety = {
    dispositionRef: input.safety?.dispositionRef ?? null,
    active: Boolean(input.safety?.active || (input.safety?.disposition && input.safety.disposition !== 'ORDINARY_FLOW')),
    signalRefs: unique(input.safety?.signalRefs ?? []),
    updatedAt: input.safety?.updatedAt ?? null,
  };
  state.reviewCycles = clone(input.reviewCycles ?? []);
  state.historyRefs = unique((input.historyRefs ?? []).map(String));
  if (Array.isArray(input.history) && input.history.length) notes.push(`legacy inline history retained outside current state: ${input.history.length} record(s)`);

  const errors = validateMemberStateShape(state);
  if (errors.length) throw new Error(`normalized Member State failed validation: ${errors.join('; ')}`);
  return { state, migrated: true, sourceSchemaVersion: input.schemaVersion ?? 'unknown', notes };
}

export { LEGACY_CONSTRUCT_MAP };
