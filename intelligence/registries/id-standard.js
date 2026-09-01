// GENERATED FROM RECONCILED EL8 DRIVE AUTHORITY — 2026-09-01
// Locked opaque identifier and semantic standard.
// Do not hand-edit generated registry content; reconcile in Drive and regenerate.

export const ID_SEMANTIC_STANDARD = Object.freeze([
  {
    "Entity Type": "Construct",
    "Permanent ID Pattern": "C000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Referenced by questions/effects/actions/evidence",
    "Example": "C000001 = Sleep Quality",
    "Rule": "Immutable identity; dimension, name, lifecycle and classification are metadata.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Question",
    "Permanent ID Pattern": "Q000001",
    "Sort Key Pattern": "S.DQQQ",
    "Dimension in ID?": "No",
    "Relationship": "Answers reference Parent Question ID",
    "Example": "Q000123",
    "Rule": "Permanent ID never encodes dimension, construct, stage, wording or display order.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Answer",
    "Permanent ID Pattern": "A000001",
    "Sort Key Pattern": "S.DQQQ.AA",
    "Dimension in ID?": "No",
    "Relationship": "Parent Question ID",
    "Example": "A000847 → Q000123",
    "Rule": "Independent immutable ID; parent relationship is explicit. Sort key inherits question position for manual review.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Action",
    "Permanent ID Pattern": "ACT000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Construct/eligibility/tracking/evidence links",
    "Example": "ACT000042",
    "Rule": "Action identity does not encode current dimension, sequence, eligibility or tracking method.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Evidence",
    "Permanent ID Pattern": "EVD000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Links sources to supported claims/relationships",
    "Example": "EVD000173",
    "Rule": "Evidence identity is independent of domain ownership.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Source",
    "Permanent ID Pattern": "SRC000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Referenced by evidence records",
    "Example": "SRC000091",
    "Rule": "A publication/source exists once globally; domain applicability belongs in mappings.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Relationship",
    "Permanent ID Pattern": "REL000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Explicit source/target construct IDs",
    "Example": "REL000024",
    "Rule": "Direction and relationship semantics are fields, not inferred from the ID.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Tracking Contract",
    "Permanent ID Pattern": "TRK000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Referenced by Action",
    "Example": "TRK000015",
    "Rule": "Tracking may change independently from Action identity.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Eligibility Contract",
    "Permanent ID Pattern": "ELG000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Referenced by Action",
    "Example": "ELG000015",
    "Rule": "Eligibility may evolve without changing Action identity.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Reason Code",
    "Permanent ID Pattern": "RSN000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Semantic Name field provides human-readable meaning",
    "Example": "RSN000012 = INSUFFICIENT_EVIDENCE",
    "Rule": "Stable identity plus semantic name; avoid embedding mutable taxonomy in ID.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Control",
    "Permanent ID Pattern": "CTL000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Control Type + Target metadata",
    "Example": "CTL000006 = MEMBER_OPT_OUT",
    "Rule": "Member/system control is not wellness evidence.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Safety Condition",
    "Permanent ID Pattern": "SAF000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Safety policy references condition ID",
    "Example": "SAF000001 = IMMEDIATE_DANGER",
    "Rule": "Categorical/deterministic; do not encode fabricated probability or severity into identity.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Effect",
    "Permanent ID Pattern": "EFX000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Answer → zero/one/many typed effects",
    "Example": "EFX000218",
    "Rule": "Effect has type, target, operation/value, flags, conditions and provenance as structured fields.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Migration Alias",
    "Permanent ID Pattern": "No new runtime ID",
    "Sort Key Pattern": "N/A",
    "Dimension in ID?": "No",
    "Relationship": "Old ID → New Permanent ID",
    "Example": "GEN001.01 → A000xxx",
    "Rule": "Temporary migration metadata only; aliases are retired from active architecture after migration validation.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "Module",
    "Permanent ID Pattern": "MOD000001",
    "Sort Key Pattern": "10",
    "Dimension in ID?": "No",
    "Relationship": "Module registry references governed triggers, outputs, evidence and canonical stage contracts",
    "Example": "MOD000006",
    "Rule": "Module identity is opaque and immutable; dimension, depth class, topic, wording and status are metadata.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "SORT KEY RULE",
    "Permanent ID Pattern": "N/A",
    "Sort Key Pattern": "S.DQQQ / S.DQQQ.AA",
    "Dimension in ID?": "No",
    "Relationship": "Sort metadata only; identity and parentage use immutable IDs",
    "Example": "1.1034 / 1.1034.07",
    "Rule": "S = review section; D = dimension grouping digit; QQQ = question sequence within that dimension; AA = answer sequence. Sort keys are mutable and never runtime identity.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "DIMENSION SORT MAP",
    "Permanent ID Pattern": "N/A",
    "Sort Key Pattern": "D = 0–9",
    "Dimension in ID?": "No",
    "Relationship": "Human organization only",
    "Example": "0 General/Cross-dimensional; 1 Physical; 2 Emotional; 3 Social; 4 Intellectual; 5 Occupational; 6 Financial; 7 Environmental; 8 Spiritual; 9 Safety",
    "Rule": "Dimension digit is mutable sort metadata, not permanent identity. General and cross-dimensional/system questions share D=0 and therefore use one shared sequential D=0 question space; they must never restart numbering in separate source banks. Safety uses D=9.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "SORT CAPACITY",
    "Permanent ID Pattern": "N/A",
    "Sort Key Pattern": "S.D001–S.D999; answers .01–.99",
    "Dimension in ID?": "No",
    "Relationship": "Fixed-width lexical/manual ordering",
    "Example": "1.1009 → 1.1010 → 1.1099 → 1.1100",
    "Rule": "Each dimension has 999 question positions per section and each question has 99 answer positions. Do not increment question numbers by 10.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "PERMANENT ID RULE",
    "Permanent ID Pattern": "Q000001 / A000001",
    "Sort Key Pattern": "Independent of sort key",
    "Dimension in ID?": "No",
    "Relationship": "Answers reference immutable Parent Question ID",
    "Example": "A000847 → Q000123",
    "Rule": "Permanent IDs are opaque and immutable. Dimension, section, question order, answer order, semantics, wording, stage and status are metadata and never encoded in the ID.",
    "Status": "LOCKED"
  },
  {
    "Entity Type": "MIGRATION RULE",
    "Permanent ID Pattern": "Legacy alias → opaque permanent ID",
    "Sort Key Pattern": "Sort key may change independently",
    "Dimension in ID?": "No",
    "Relationship": "Stage → validate → cut over → retire alias",
    "Example": "GEN001 → Q000001",
    "Rule": "Legacy IDs are migration inputs only. Do not overwrite source-bank IDs until parent/answer integrity and downstream consumers are validated.",
    "Status": "LOCKED"
  }
]);
