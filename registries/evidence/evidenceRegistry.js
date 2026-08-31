// Governed relationship-evidence registry derived from Drive 02.04.01 Evidence Bank.
// Relationship evidence is a population prior/context boundary. It never creates
// member state, transfers severity, or independently selects a Focus or Action.

export const EVIDENCE_REGISTRY_VERSION = '2026-08-31.1';

const relationship = (evidenceId, fromConstructIds, toConstructIds, {
  strength,
  directionality,
  decisionUse,
  guardrail,
  sourceIds = [],
  status = 'active',
} = {}) => Object.freeze({
  evidenceId,
  fromConstructIds: Object.freeze([...fromConstructIds]),
  toConstructIds: Object.freeze([...toConstructIds]),
  strength,
  directionality,
  decisionUse,
  guardrail,
  sourceIds: Object.freeze([...sourceIds]),
  status,
});

export const EVIDENCE_REGISTRY = Object.freeze([
  relationship('EVD001',['SLEEP_QUALITY'],['EMOTIONAL_STATE'],{strength:'high',directionality:'bidirectional',sourceIds:['SRC003','SRC004','SRC016'],decisionUse:'Test a sleep/emotional relationship only when both constructs are independently supported and the result can change Focus or Planning.',guardrail:'Do not transfer severity, assert individual causality, or promise emotional improvement.'}),
  relationship('EVD002',['FINANCIAL_STRAIN'],['EMOTIONAL_STATE'],{strength:'high_association',directionality:'primarily_financial_to_emotional',sourceIds:['SRC007','SRC011','SRC014'],decisionUse:'Investigate only when both constructs are independently supported and the relationship can change Focus, urgency or Planning.',guardrail:'Do not transfer severity, infer a single causal pathway, or promise emotional improvement from financial change.'}),
  relationship('EVD003',['JOB_SECURITY'],['EMOTIONAL_STATE'],{strength:'high',directionality:'primarily_occupational_to_emotional',sourceIds:['SRC006'],decisionUse:'Clarify security/status separately from workload, fit, progress and direction before testing a relationship.',guardrail:'Do not equate unemployment, insecurity, workload and dissatisfaction or transfer severity.'}),
  relationship('EVD004',['LONELINESS'],['EMOTIONAL_STATE'],{strength:'high_association',directionality:'bidirectional_or_feedback_plausible',sourceIds:['SRC005','SRC012','SRC013','SRC015'],decisionUse:'Use emotional relationship only when LONELINESS and EMOTIONAL_STATE are independently supported; physical-health/QoL findings remain contextual unless a governed Physical construct is directly established.',guardrail:'Do not infer loneliness from contact frequency, manufacture PHYSICAL_CONDITION, predict individual health risk, or transfer severity.'}),
  relationship('EVD005',['ENVIRONMENTAL_INTERFERENCE'],['SLEEP_QUALITY','ENERGY_FUNCTION','EMOTIONAL_STATE','ACTIVITY_LEVEL','LONELINESS'],{strength:'moderate_high',directionality:'environmental_to_multiple_heterogeneous',sourceIds:['SRC008'],decisionUse:'Use only after a specific environmental factor and a linked governed member construct are independently supported.',guardrail:'Do not manufacture ENVIRONMENTAL_INTERFERENCE from a contributor/feasibility answer; HOUSING_STABILITY requires separate direct evidence; every target requires its own direct evidence.'}),
  relationship('EVD006',['ACTIVITY_LEVEL'],['ENERGY_FUNCTION'],{strength:'high_intervention_average',directionality:'activity_to_energy',sourceIds:['SRC017'],decisionUse:'Candidate leverage prior only when activity and energy are independently supported and activity is feasible; Planning owns Action selection.',guardrail:'Do not infer inactivity caused low energy, transfer severity, prescribe despite contraindications, or promise benefit.'}),
  relationship('EVD007',['ACTIVITY_LEVEL'],['SLEEP_QUALITY'],{strength:'high_intervention_average',directionality:'activity_to_sleep',sourceIds:['SRC018'],decisionUse:'Candidate leverage prior only when activity and sleep are independently supported and activity is feasible.',guardrail:'Do not infer inactivity caused poor sleep, create sleep impairment, or automatically prioritize activity over direct sleep drivers.'}),
  relationship('EVD008',['SLEEP_QUALITY'],['PRESSURE_PATTERN'],{strength:'moderate_high',directionality:'likely_bidirectional',sourceIds:['SRC003','SRC004','SRC019'],decisionUse:'When both constructs are independently supported, test a member-specific relationship before treating either as leverage.',guardrail:'Do not infer either direction of causality, transfer severity, or promise improvement.'}),
  relationship('EVD009',['SLEEP_QUALITY'],['FOCUS_FUNCTION'],{strength:'moderate_high',directionality:'sleep_to_focus_population_prior',sourceIds:['SRC020'],decisionUse:'Use only when sleep and focus are independently supported; member-specific temporal evidence may strengthen but cannot create focus impairment.',guardrail:'Do not infer poor sleep caused focus difficulty, create FOCUS_FUNCTION impairment, or promise cognitive improvement.'}),
  relationship('EVD010',['LONELINESS'],['SLEEP_QUALITY'],{strength:'moderate',directionality:'association_direction_uncertain',sourceIds:['SRC021'],decisionUse:'When both constructs are independently supported, test co-variation without assuming direction or leverage.',guardrail:'Do not infer either construct from the other, transfer severity, or claim causality.'}),
  relationship('EVD011',['JOB_SECURITY'],['EMOTIONAL_STATE'],{strength:'moderate_high',directionality:'longitudinal_occupational_to_emotional',sourceIds:['SRC006','SRC022'],decisionUse:'Supporting evidence for EVD003; refine confidence and interpretation without counting a second independent relationship.',guardrail:'Do not double-count EVD003/EVD011, transfer severity, treat employment as the sole cause, or promise re-employment resolves distress.'}),
  relationship('EVD012',['PRESSURE_PATTERN'],['FOCUS_FUNCTION'],{strength:'moderate_domain_specific',directionality:'pressure_to_selected_executive_functions',sourceIds:['SRC023'],decisionUse:'Weak population prior only when pressure and focus are independently supported; prefer direct/member-specific evidence before treating pressure as leverage.',guardrail:'Do not generalize that stress damages cognition, create focus impairment, transfer severity, or infer stress is the main cause.'}),
]);

export const EVIDENCE_BY_ID = Object.freeze(Object.fromEntries(EVIDENCE_REGISTRY.map(record => [record.evidenceId, record])));

export function getEvidenceRecord(evidenceId) {
  return EVIDENCE_BY_ID[evidenceId] ?? null;
}

export function findRelationshipEvidence({ fromConstructId, toConstructId } = {}) {
  return Object.freeze(EVIDENCE_REGISTRY.filter(record =>
    (!fromConstructId || record.fromConstructIds.includes(fromConstructId)) &&
    (!toConstructId || record.toConstructIds.includes(toConstructId))
  ));
}
