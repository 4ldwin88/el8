// GENERATED FROM RECONCILED EL8 DRIVE AUTHORITY — 2026-09-01
// Action↔Discovery coverage audit and blocking exceptions.
// Do not hand-edit generated registry content; reconcile in Drive and regenerate.

export const ACTION_DISCOVERY_COVERAGE = Object.freeze([
  {
    "Action ID": "ACT000001",
    "Action": "Regularize sleep/wake opportunity",
    "Primary Admission Evidence": "SLEEP_QUALITY + irregular timing/schedule constraint",
    "Canonical Discovery Source": "Q000020 direct Sleep state; Q000021 contributor context when decision-relevant",
    "Planning Deepening / Eligibility Source": "Action-specific schedule constraints, dangerous sleep loss/reduced sleep need, Safety/professional boundary",
    "Coverage": "PARTIAL — governed",
    "Gap / Boundary": "Sleep state is canonical; exact irregular timing pattern is not a direct state construct and should be requested only if this Action is being evaluated.",
    "Disposition": "Keep Action-specific Planning deepening; do not add routine Discovery question."
  },
  {
    "Action ID": "ACT000002",
    "Action": "Add a short comfortable movement bout",
    "Primary Admission Evidence": "ACTIVITY_LEVEL or member movement goal + safe suitability",
    "Canonical Discovery Source": "Q000025 direct Activity state",
    "Planning Deepening / Eligibility Source": "Q000026/Q000027 when activity fit/barriers change plan; Action-specific symptoms/restrictions if needed",
    "Coverage": "COVERED",
    "Gap / Boundary": "No admission gap.",
    "Disposition": "Use adaptive fit probes only when needed."
  },
  {
    "Action ID": "ACT000003",
    "Action": "Create a simple hydration cue",
    "Primary Admission Evidence": "Member reports forgetting ordinary fluid intake",
    "Canonical Discovery Source": "No canonical hydration state/forgetting probe in current Question registry",
    "Planning Deepening / Eligibility Source": "Action-specific confirmation of forgetting + fluid restriction/professional instruction",
    "Coverage": "PLANNING-ONLY CANDIDATE",
    "Gap / Boundary": "No Discovery construct justifies proactive hydration recommendation. Must arise from member-stated goal/context, not inferred need.",
    "Disposition": "Retain only as member-initiated/Planning candidate; do not create hydration severity construct."
  },
  {
    "Action ID": "ACT000004",
    "Action": "Anchor a consistent wake-time window",
    "Primary Admission Evidence": "SLEEP_QUALITY + timing variability",
    "Canonical Discovery Source": "Q000020; Q000021 schedule/timing contributor when decision-relevant",
    "Planning Deepening / Eligibility Source": "Shift work/caregiving/fatigue/reduced sleep need/professional guidance",
    "Coverage": "PARTIAL — governed",
    "Gap / Boundary": "Exact wake variability requires Action-specific clarification.",
    "Disposition": "Keep Planning deepening; no new routine Discovery probe."
  },
  {
    "Action ID": "ACT000005",
    "Action": "Reduce one identified sleep-environment friction",
    "Primary Admission Evidence": "SLEEP_QUALITY + member-identified environmental factor",
    "Canonical Discovery Source": "Q000020; Q000021 surroundings contributor",
    "Planning Deepening / Eligibility Source": "Specific factor/control/hazard/medical-device implications",
    "Coverage": "COVERED",
    "Gap / Boundary": "Contributor remains hypothesis until independently identified/member-supported.",
    "Disposition": "Require direct factor confirmation before Action selection."
  },
  {
    "Action ID": "ACT000006",
    "Action": "Use a movement cue tied to an existing routine",
    "Primary Admission Evidence": "ACTIVITY_LEVEL concern or movement goal + initiation/forgetting barrier",
    "Canonical Discovery Source": "Q000025; Q000027 can identify practical barriers; Q000028 Activation only when distinction changes decision",
    "Planning Deepening / Eligibility Source": "Confirm forgetting/initiation is actual barrier + safe movement suitability",
    "Coverage": "PARTIAL — governed",
    "Gap / Boundary": "Do not infer forgetting from low activity.",
    "Disposition": "Action-specific barrier confirmation is required."
  },
  {
    "Action ID": "ACT000007",
    "Action": "Break one long sedentary period",
    "Primary Admission Evidence": "Recurring sedentary pattern + safe mobility",
    "Canonical Discovery Source": "Q000025 establishes days active, not sedentary-period duration",
    "Planning Deepening / Eligibility Source": "Confirm identifiable long sedentary period + symptoms/restrictions",
    "Coverage": "PLANNING-ONLY CANDIDATE",
    "Gap / Boundary": "Current Discovery evidence cannot infer a long sedentary period from low activity frequency.",
    "Disposition": "Retain only when member/context supplies sedentary-period evidence; no inference from ACTIVITY_LEVEL."
  },
  {
    "Action ID": "ACT000008",
    "Action": "Brief daily mood/stress check-in",
    "Primary Admission Evidence": "PRESSURE_PATTERN or member desire to notice patterns",
    "Canonical Discovery Source": "Q000029 direct Stress state; Q000030 context only if decision-relevant",
    "Planning Deepening / Eligibility Source": "Tracking burden/rumination/distress check",
    "Coverage": "COVERED",
    "Gap / Boundary": "Measurement Action, not therapeutic Action.",
    "Disposition": "Preserve learning/measurement classification."
  },
  {
    "Action ID": "ACT000009",
    "Action": "Identify one recurring pressure trigger",
    "Primary Admission Evidence": "PRESSURE_PATTERN + unclear trigger",
    "Canonical Discovery Source": "Q000029 direct Stress; Q000030 governed Stress context",
    "Planning Deepening / Eligibility Source": "Confirm trigger identification would change next decision and tracking is tolerable",
    "Coverage": "COVERED",
    "Gap / Boundary": "Recorded trigger is relationship/context evidence, not causality.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000010",
    "Action": "Schedule one short recovery block",
    "Primary Admission Evidence": "PRESSURE_PATTERN + member-valued restorative activity",
    "Canonical Discovery Source": "Q000029; Q000033 existing supports/resources when Planning changes",
    "Planning Deepening / Eligibility Source": "Chosen activity, feasibility, avoidance risk, mental-health boundary",
    "Coverage": "COVERED",
    "Gap / Boundary": "Restorative activity must be member-selected; not inferred treatment.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000011",
    "Action": "Remove one avoidable pressure friction",
    "Primary Admission Evidence": "PRESSURE_PATTERN + independently identified modifiable contributor",
    "Canonical Discovery Source": "Q000029; Q000030 contributor context",
    "Planning Deepening / Eligibility Source": "Confirm contributor, member control, obligations and possible new harm",
    "Coverage": "COVERED",
    "Gap / Boundary": "Contributor cannot be treated as proven cause.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000012",
    "Action": "Schedule one wanted social contact",
    "Primary Admission Evidence": "LONELINESS or member-stated connection goal",
    "Canonical Discovery Source": "Q000039 direct Loneliness; Q000040 desired support/connection when Planning changes",
    "Planning Deepening / Eligibility Source": "Relationship safety, access, energy and desired connection type",
    "Coverage": "COVERED",
    "Gap / Boundary": "Do not infer wanted contact from low support alone.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000013",
    "Action": "Ask one trusted person for a specific kind of support",
    "Primary Admission Evidence": "SUPPORT_AVAILABILITY/support goal + safe trusted relationship",
    "Canonical Discovery Source": "Q000038 direct Support availability; Q000040/Q000041 fit",
    "Planning Deepening / Eligibility Source": "Specific support type, privacy, relationship safety, professional-vs-informal boundary",
    "Coverage": "COVERED",
    "Gap / Boundary": "Availability does not guarantee relationship is safe/trusted.",
    "Disposition": "Require Action-specific trusted-person confirmation."
  },
  {
    "Action ID": "ACT000014",
    "Action": "Try one low-friction connection option",
    "Primary Admission Evidence": "LONELINESS or member-stated connection goal + access/energy friction",
    "Canonical Discovery Source": "Q000039; Q000040/Q000041",
    "Planning Deepening / Eligibility Source": "Confirm connection is wanted, safe and feasible",
    "Coverage": "COVERED",
    "Gap / Boundary": "Solitude preference must remain valid.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000015",
    "Action": "Protect one relationship boundary",
    "Primary Admission Evidence": "RELATIONSHIP_STRAIN + member-chosen safe boundary",
    "Canonical Discovery Source": "Q000034 direct strain; Q000036 context; Q000037 fit/safety when action considered",
    "Planning Deepening / Eligibility Source": "Abuse/coercion/retaliation and safe direct-boundary feasibility",
    "Coverage": "STRUCTURALLY COVERED / EVIDENCE BLOCKED",
    "Gap / Boundary": "Discovery can supply evidence, but Action is UNSUPPORTED_EXPERIMENTAL and not eligible for ordinary autonomous recommendation.",
    "Disposition": "Keep blocked pending governance/action-specific evidence."
  },
  {
    "Action ID": "ACT000016",
    "Action": "Choose one next work/learning action",
    "Primary Admission Evidence": "Member work/learning goal + identifiable next step",
    "Canonical Discovery Source": "Q000047–Q000055 Occupational routing/state/context as relevant; positive/member goal path can also supply goal",
    "Planning Deepening / Eligibility Source": "Eligibility, credential, schedule, financial/legal facts only when they change next step",
    "Coverage": "COVERED",
    "Gap / Boundary": "Action may be goal-led without deficit state.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000017",
    "Action": "Clarify one work or learning decision",
    "Primary Admission Evidence": "Occupational/member goal + realistic options + unresolved decision",
    "Canonical Discovery Source": "Q000047–Q000052; member-stated goal",
    "Planning Deepening / Eligibility Source": "Decision criteria, eligibility/credential/legal facts, missing information",
    "Coverage": "COVERED",
    "Gap / Boundary": "Do not infer career fit.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000018",
    "Action": "Remove one schedule friction",
    "Primary Admission Evidence": "SCHEDULE_DISRUPTION/member-stated schedule problem",
    "Canonical Discovery Source": "Q000054/Q000055 schedule control/interference; Q000050 contributor context",
    "Planning Deepening / Eligibility Source": "Specific interference, obligations, sleep needs, authority to change",
    "Coverage": "COVERED",
    "Gap / Boundary": "Schedule disruption cannot be assumed sole cause.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000019",
    "Action": "Run one small work/learning trial",
    "Primary Admission Evidence": "Uncertain direction + candidate reversible trial",
    "Canonical Discovery Source": "Occupational/member goal context; Q000047–Q000052 as relevant",
    "Planning Deepening / Eligibility Source": "Candidate direction, eligibility, cost/time ceiling, safety, information value",
    "Coverage": "COVERED",
    "Gap / Boundary": "Learning/measurement Action; trial response does not establish future career fit.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000020",
    "Action": "Complete a short spending snapshot",
    "Primary Admission Evidence": "Financial uncertainty/goal where visibility would change decision",
    "Canonical Discovery Source": "Q000056–Q000062 can establish strain/facets; Q000063 Financial visibility is currently deferred",
    "Planning Deepening / Eligibility Source": "Member consent/scope + material-insecurity/regulatory boundary",
    "Coverage": "PARTIAL — governed",
    "Gap / Boundary": "Canonical visibility probe Q000063 is deferred, so the Action cannot be autonomously triggered merely from presumed low visibility.",
    "Disposition": "Use only when member explicitly reports uncertainty/visibility need or promote Q000063 after downstream-value validation."
  },
  {
    "Action ID": "ACT000021",
    "Action": "List the next essential obligations",
    "Primary Admission Evidence": "FINANCIAL_STRAIN + unclear near-term obligations",
    "Canonical Discovery Source": "Q000056; Q000060 payment urgency; Q000062 at-risk obligations",
    "Planning Deepening / Eligibility Source": "Member-selected scope, material insecurity and regulated-advice boundary",
    "Coverage": "COVERED",
    "Gap / Boundary": "Only ask obligation identity when it changes the decision.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000022",
    "Action": "Remove one recurring cost friction",
    "Primary Admission Evidence": "Financial goal/strain + member-identified discretionary recurring cost",
    "Canonical Discovery Source": "Q000056–Q000064 provide financial state/fit but no specific recurring discretionary-cost inventory",
    "Planning Deepening / Eligibility Source": "Confirm cost is discretionary, modifiable and essential needs protected",
    "Coverage": "PARTIAL — governed",
    "Gap / Boundary": "Specific cost must be member-provided or requested only when evaluating this Action.",
    "Disposition": "Do not add routine spending-detail collection to Discovery."
  },
  {
    "Action ID": "ACT000023",
    "Action": "Create one simple spending boundary",
    "Primary Admission Evidence": "Member financial-control goal + chosen discretionary category",
    "Canonical Discovery Source": "Q000056–Q000064 provide state/fit; chosen category is not a Discovery construct",
    "Planning Deepening / Eligibility Source": "Confirm category, voluntary boundary, deprivation/compulsive risk",
    "Coverage": "PLANNING-ONLY CANDIDATE",
    "Gap / Boundary": "Must be member-chosen; cannot be inferred from Financial strain.",
    "Disposition": "Retain as goal-led Planning option only."
  },
  {
    "Action ID": "ACT000024",
    "Action": "Remove one recurring environmental friction",
    "Primary Admission Evidence": "ENVIRONMENTAL_INTERFERENCE + specific controllable factor",
    "Canonical Discovery Source": "Q000065 direct interference; Q000066 factor context; Q000069 feasibility",
    "Planning Deepening / Eligibility Source": "Authority/control, hazard, tenancy/legal/accessibility",
    "Coverage": "COVERED",
    "Gap / Boundary": "Factor must be independently identified; no causal assumption.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000025",
    "Action": "Create one supportive environmental cue",
    "Primary Admission Evidence": "Member-chosen active goal + forgetting barrier",
    "Canonical Discovery Source": "No generic forgetting construct; goal may arise from any governed focus",
    "Planning Deepening / Eligibility Source": "Confirm forgetting is barrier, stable context, authority/privacy/safe placement",
    "Coverage": "PLANNING-ONLY CANDIDATE",
    "Gap / Boundary": "Mechanism Action must never be triggered from environmental severity alone.",
    "Disposition": "Retain as cross-goal Planning mechanism after underlying target Action/goal is independently justified."
  },
  {
    "Action ID": "ACT000026",
    "Action": "Create one lower-friction setup",
    "Primary Admission Evidence": "Member-chosen active goal + repeated setup friction",
    "Canonical Discovery Source": "No generic setup-friction construct; target goal/action supplies underlying authority",
    "Planning Deepening / Eligibility Source": "Confirm repeated friction, member authority, accessibility and hazards",
    "Coverage": "PLANNING-ONLY CANDIDATE",
    "Gap / Boundary": "Mechanism Action, not a standalone wellness intervention.",
    "Disposition": "Require independently justified target behaviour."
  },
  {
    "Action ID": "ACT000027",
    "Action": "Define one protected space or time",
    "Primary Admission Evidence": "ENVIRONMENTAL_INTERFERENCE + target activity + controllable context",
    "Canonical Discovery Source": "Q000065/Q000066/Q000069",
    "Planning Deepening / Eligibility Source": "Household/work obligations, conflict risk, safety and authority",
    "Coverage": "COVERED",
    "Gap / Boundary": "No entitlement/causality inference.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000028",
    "Action": "Schedule one focused learning block",
    "Primary Admission Evidence": "Member-chosen learning goal + lack of protected execution step",
    "Canonical Discovery Source": "Positive/member goal path; Intellectual Q000042–Q000046 only if Focus evidence is independently relevant",
    "Planning Deepening / Eligibility Source": "Chosen subject, available time, overload/foundational constraints",
    "Coverage": "COVERED — GOAL LED",
    "Gap / Boundary": "Must not infer intellectual deficit or require Focus concern.",
    "Disposition": "Preserve goal-led admission."
  },
  {
    "Action ID": "ACT000029",
    "Action": "Remove one focus friction",
    "Primary Admission Evidence": "FOCUS_FUNCTION + member-identified distraction/setup factor",
    "Canonical Discovery Source": "Q000042 direct Focus; Q000044 contributor context; Q000046 fit",
    "Planning Deepening / Eligibility Source": "Specific factor, overload, sleep/health contributors and feasible change",
    "Coverage": "COVERED",
    "Gap / Boundary": "Do not diagnose attention problems.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000030",
    "Action": "Use a defined short focus block",
    "Primary Admission Evidence": "Concrete task + initiation/sustained-attention friction",
    "Canonical Discovery Source": "Q000042 Focus if independently relevant; Q000028 Activation only when distinction changes decision; member goal can also supply task",
    "Planning Deepening / Eligibility Source": "Concrete task, time, overload/foundational constraints",
    "Coverage": "PARTIAL — governed",
    "Gap / Boundary": "No universal duration can be inferred; Action may be goal-led rather than deficit-led.",
    "Disposition": "Keep Action-specific task/duration selection."
  },
  {
    "Action ID": "ACT000031",
    "Action": "Choose one curiosity or learning experiment",
    "Primary Admission Evidence": "Explicit member intellectual-engagement goal",
    "Canonical Discovery Source": "Q000045 Cognitive engagement is deferred; member-stated goal is sufficient for internal candidate",
    "Planning Deepening / Eligibility Source": "Confirm goal, topic fit, overload/time feasibility",
    "Coverage": "DEFERRED CONSTRUCT",
    "Gap / Boundary": "No autonomous deficit-triggered use until downstream value of COGNITIVE_ENGAGEMENT is validated.",
    "Disposition": "Keep internal/member-initiated candidate only."
  },
  {
    "Action ID": "ACT000032",
    "Action": "Choose one values/meaning reflection practice",
    "Primary Admission Evidence": "Member-stated values/meaning relevance",
    "Canonical Discovery Source": "Q000070–Q000073 Direction/Meaning/discriminator/fit as relevant; positive/member goal path also valid",
    "Planning Deepening / Eligibility Source": "Voluntary practice, belief/value fit, distress/compulsivity/reality-testing boundary",
    "Coverage": "COVERED",
    "Gap / Boundary": "No belief prescription or truth validation.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000033",
    "Action": "Clarify one value for a current decision",
    "Primary Admission Evidence": "VALUES_CLARITY relevant to concrete member decision",
    "Canonical Discovery Source": "Q000072 can distinguish values ambiguity; member-stated decision can directly establish need",
    "Planning Deepening / Eligibility Source": "Concrete decision, voluntary values context, professional/regulated boundary",
    "Coverage": "COVERED",
    "Gap / Boundary": "VALUES_CLARITY is decision context, not global spiritual severity.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000034",
    "Action": "Choose one next step aligned with stated direction",
    "Primary Admission Evidence": "DIRECTION_CLARITY/NEXT_STEP_CLARITY + member-stated direction",
    "Canonical Discovery Source": "Q000070/Q000072; member-stated direction",
    "Planning Deepening / Eligibility Source": "Reversible step + financial/occupational/Safety constraints/dependencies",
    "Coverage": "COVERED",
    "Gap / Boundary": "No objective life-purpose inference.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000035",
    "Action": "Try one personally meaningful activity",
    "Primary Admission Evidence": "MEANING_PURPOSE + member-chosen potentially meaningful activity",
    "Canonical Discovery Source": "Q000071 direct Meaning; Q000072 discrimination; member goal",
    "Planning Deepening / Eligibility Source": "Chosen activity, belief/value fit, safety/distress/compulsivity",
    "Coverage": "COVERED",
    "Gap / Boundary": "No religious/spiritual prescription.",
    "Disposition": "No change."
  },
  {
    "Action ID": "ACT000036",
    "Action": "Reduce plan to one primary action",
    "Primary Admission Evidence": "Plan burden/competing demands + eligible underlying Actions",
    "Canonical Discovery Source": "Not a Discovery construct; downstream Plan/Review state",
    "Planning Deepening / Eligibility Source": "Current actions, burden/adherence, dependencies, member preference, Safety",
    "Coverage": "DOWNSTREAM OPERATION",
    "Gap / Boundary": "Should not require Discovery question coverage.",
    "Disposition": "Keep as Planning/Adaptation operation; validate internally."
  },
  {
    "Action ID": "ACT000037",
    "Action": "Sequence two competing actions",
    "Primary Admission Evidence": "Two independently eligible Actions + resource conflict",
    "Canonical Discovery Source": "Underlying Actions carry Discovery authority",
    "Planning Deepening / Eligibility Source": "Conflict, dependencies, preference, Safety/professional priority",
    "Coverage": "DOWNSTREAM OPERATION",
    "Gap / Boundary": "No standalone Discovery construct needed.",
    "Disposition": "Keep as Planning operation; validate internally."
  },
  {
    "Action ID": "ACT000038",
    "Action": "Choose the lowest-burden viable action",
    "Primary Admission Evidence": "Multiple similarly useful eligible Actions",
    "Canonical Discovery Source": "Underlying Actions carry Discovery authority",
    "Planning Deepening / Eligibility Source": "Comparative burden/feasibility/preference/evidence/Safety",
    "Coverage": "DOWNSTREAM OPERATION",
    "Gap / Boundary": "Burden cannot override stronger evidence or Safety.",
    "Disposition": "Keep as Planning selection rule; validate comparatively."
  },
  {
    "Action ID": "ACT000039",
    "Action": "Run one action as an information-gathering trial",
    "Primary Admission Evidence": "Competing plausible hypotheses/Actions + valid discriminating signal",
    "Canonical Discovery Source": "Underlying constructs/Actions carry Discovery authority",
    "Planning Deepening / Eligibility Source": "Reversibility, predeclared signal, burden, no delay of needed care",
    "Coverage": "DOWNSTREAM LEARNING OPERATION",
    "Gap / Boundary": "Response cannot prove causality.",
    "Disposition": "Keep as learning/measurement operation; validate signal logic."
  },
  {
    "Action ID": "ACT000040",
    "Action": "Pause a nonessential action to protect capacity",
    "Primary Admission Evidence": "Plan burden/capacity + nonessential Action",
    "Canonical Discovery Source": "Not a Discovery construct; downstream Plan/Review evidence",
    "Planning Deepening / Eligibility Source": "Capacity, dependencies, member preference, Safety/professional obligations",
    "Coverage": "DOWNSTREAM OPERATION",
    "Gap / Boundary": "Must keep paused need visible.",
    "Disposition": "Keep as Planning/Adaptation operation; validate burden/adherence outcomes."
  },
  {
    "Action ID": "ACT000041",
    "Action": "Use a member-chosen alternative with the same intended signal",
    "Primary Admission Evidence": "Eligible underlying Action + member preference/access mismatch",
    "Canonical Discovery Source": "Underlying Action carries Discovery authority",
    "Planning Deepening / Eligibility Source": "Mechanism/signal equivalence, feasibility, same Safety boundary",
    "Coverage": "DOWNSTREAM ADAPTATION OPERATION",
    "Gap / Boundary": "Preference evidence supports fit, not efficacy equivalence.",
    "Disposition": "Keep as adaptation operation; action-family equivalence must remain explicit/revisable."
  },
  {
    "Action ID": "Cross-registry dependency validation",
    "Action": "PASS — design authority",
    "Primary Admission Evidence": "2026-09-01",
    "Canonical Discovery Source": "All 41 Actions audited against governed Discovery evidence and Action-specific Planning deepening. No Action requires an ad hoc routine Discovery question. Partial/Planning-only/deferred/downstream classifications are intentional boundaries, not missing runtime evidence."
  },
  {
    "Action ID": "Blocking exceptions",
    "Action": "2 deferred construct dependencies; 1 evidence-blocked Action",
    "Primary Admission Evidence": "Q000063; Q000045; ACT000015",
    "Canonical Discovery Source": "Q000063 Financial visibility and Q000045 Cognitive engagement cannot autonomously admit Actions until separately validated/promoted. ACT000015 remains unavailable for ordinary autonomous recommendation pending evidence/governance."
  },
  {
    "Action ID": "G-01 implication",
    "Action": "Dependency layer reconciled",
    "Primary Admission Evidence": "Not sufficient alone to close G-01",
    "Canonical Discovery Source": "Proceed to stale-term/legacy-reference audit, relationship deduplication, migration-map completion and final 02.01.06.01 ↔ 02.01.07 cross-validation before gate decision."
  }
]);
