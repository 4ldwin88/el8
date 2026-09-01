// GENERATED FROM RECONCILED EL8 DRIVE AUTHORITY — 2026-09-01
// Governance standards, not a runtime Protocol entity namespace.
// Do not hand-edit generated registry content; reconcile in Drive and regenerate.

export const PROTOCOL_STANDARDS = Object.freeze([
  {
    "Rule ID": "PS-01",
    "Standard": "Safety first",
    "Requirement": "Run 06.02 safety/suitability branch before action selection. Safety level is independent of wellness scores and recommendation confidence.",
    "Failure Response": "Block/pause affected action and follow 06.02."
  },
  {
    "Rule ID": "PS-02",
    "Standard": "Minimum evidence",
    "Requirement": "Required decision-critical inputs must be present and sufficiently current for the action.",
    "Failure Response": "Use 02.07 recommendation-confidence/fallback rules; clarify, narrow or defer rather than fabricate precision."
  },
  {
    "Rule ID": "PS-03",
    "Standard": "Member choice",
    "Requirement": "Action must align with member goals/preferences and remain optional unless an external professional/safety obligation exists.",
    "Failure Response": "Offer safe alternative, defer or decline."
  },
  {
    "Rule ID": "PS-04",
    "Standard": "Smallest useful scope",
    "Requirement": "Canonical Planning selects the smallest useful intervention set justified by current focus, evidence, expected benefit and member capacity. Intervention count is independent of focus-dimension count; more than three meaningful actions requires explicit justification rather than being a default target.",
    "Failure Response": "Narrow, sequence, or justify additional burden."
  },
  {
    "Rule ID": "PS-05",
    "Standard": "Low-risk automation",
    "Requirement": "Autonomous actions must be conservative, reversible and within an approved wellness boundary.",
    "Failure Response": "Defer or route to qualified support."
  },
  {
    "Rule ID": "PS-06",
    "Standard": "Explainability",
    "Requirement": "System can explain what, why now, evidence used, uncertainty, expected signal and reconsideration condition.",
    "Failure Response": "Do not issue material recommendation until reconstructable."
  },
  {
    "Rule ID": "PS-07",
    "Standard": "Measurement",
    "Requirement": "Track only the smallest decision-useful signal and its source.",
    "Failure Response": "Remove unnecessary tracking."
  },
  {
    "Rule ID": "PS-08",
    "Standard": "Stop condition",
    "Requirement": "Every action has an observable reason to stop, pause or reconsider.",
    "Failure Response": "Action is ineligible until defined."
  },
  {
    "Rule ID": "PS-09",
    "Standard": "Cross-dimensional check",
    "Requirement": "Check whether the action materially harms another dimension or competes with a higher-priority foundational constraint.",
    "Failure Response": "Modify, sequence, narrow or select alternative."
  },
  {
    "Rule ID": "PS-10",
    "Standard": "No hidden human synthesis",
    "Requirement": "Routine selection must not depend on undocumented founder judgment.",
    "Failure Response": "Log exception and redesign rule/protocol."
  },
  {
    "Rule ID": "PS-11",
    "Standard": "No clinical substitution",
    "Requirement": "Library actions do not diagnose, prescribe medication, replace therapy, or override professional care.",
    "Failure Response": "Refer/coordinate within scope."
  },
  {
    "Rule ID": "PS-12",
    "Standard": "Validation before lock",
    "Requirement": "Provisional candidates remain provisional until validation evidence supports usefulness, safety, burden and automation.",
    "Failure Response": "Revise, retain as provisional or retire."
  },
  {
    "Rule ID": "PS-13",
    "Standard": "Action-linked evidence capture",
    "Requirement": "Every action must declare its required tracking/logging, additional-assessment trigger, cadence and stopping condition. Tracking is part of the intervention contract, not a generic app feature; collect no more than the next Review decision needs.",
    "Failure Response": "Action remains provisional/ineligible for canonical automation until the evidence-capture contract is explicit."
  },
  {
    "Rule ID": "PS-14",
    "Standard": "Distinct visual identity",
    "Requirement": "Every canonical action receives a stable semantic icon key used consistently in Plan, Home/Today, Track and Review surfaces. Icons identify the action or evidence task; they must not encode severity, diagnosis or Safety status.",
    "Failure Response": "Assign/repair icon key before member-facing promotion; UI implementation may map the key to the approved EL8 icon asset."
  },
  {
    "Rule ID": "PS-15",
    "Standard": "Evidence-backed rationale",
    "Requirement": "Every promoted action must link to evidence sources supporting the recommendation mechanism and any material member-facing claim. Prefer systematic reviews, meta-analyses, guidelines or strong primary studies appropriate to the action/population. Population evidence is a prior, not proof of individual benefit.",
    "Failure Response": "Keep provisional, narrow the claim, request evidence review or retire the action; never fabricate certainty."
  },
  {
    "Rule ID": "PS-16",
    "Standard": "Claim discipline",
    "Requirement": "The library must store the strongest permitted plain-language rationale/claim for each action and its evidence strength. Recommendation text may be weaker than this ceiling but not stronger. Research association must not be presented as individual causation, diagnosis, treatment efficacy or guaranteed outcome.",
    "Failure Response": "Block or rewrite unsupported member-facing rationale; route clinical/regulatory claims through 09.03 and 09.07 governance."
  }
]);
