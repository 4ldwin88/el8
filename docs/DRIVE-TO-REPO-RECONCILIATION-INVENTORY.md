# EL8 Drive → Repository Reconciliation Inventory

Status: ACTIVE / BLOCKING  
Candidate branch: `qa/intelligence-test`  
Authority: companion execution evidence for `DRIVE-TO-REPO-INTELLIGENCE-RECONCILIATION.md`.

## Current Drive facts verified 2026-08-30

### Question & Signal authority

The current `02.04.01 EL8 Question & Signal Matrix Workbook` has nine governed tabs: Question Bank, Scoring Guide, Test Results, Signals, Relationships, Sources, README, Path Audit and Evidence Bank. The Question Bank contains the canonical descriptive ID namespace and legacy/runtime ID trace column.

Critical current rules verified directly from the workbook:

- Canonical Question IDs are descriptive (`GEN###`, `PHY###`, `EMT###`, `SOC###`, `OCC###`, `FIN###`, `INT###`, `SPT###`, `ENV###`, `SFT###`, `XDM###`).
- Legacy/runtime IDs are traceability metadata, not the target runtime namespace.
- Questions produce evidence, not plans.
- Gateway selections are routing/salience priors, not impairment/severity evidence.
- Direct state answers establish their named construct only.
- Discriminators identify constructs/facets without adding severity.
- Contributor/cross-domain answers create hypotheses/context rather than parallel construct severity.
- Feasibility/preferences/constraints are Planning evidence, not wellness severity.
- System-control/positive/opt-out answers govern flow rather than wellness state.
- Safety state is categorical and governed separately.
- Semantic sufficiency is decision-based, not a question/stage count or numeric threshold.

The Path Audit explicitly marks the major Focus/mixed/positive/uncertain paths as design-resolved with runtime reconciliation pending. This means the repository must implement the Drive path semantics rather than preserve old controller behavior.

### GEN001 authority

Canonical `GEN001` is the opening gateway. Its selections route to possible areas but have no direct construct-severity effect. In particular:

- money → Financial routing only; no direct FINANCIAL_STRAIN severity;
- work → Occupational routing only; no direct JOB_SECURITY/SCHEDULE_DISRUPTION severity;
- health → PHYSICAL_CONDITION scope only;
- energy → ENERGY_FUNCTION routing only;
- sleep → SLEEP_QUALITY routing only;
- stress → PRESSURE_PATTERN/emotional routing only;
- relationships → RELATIONSHIP_STRAIN routing only;
- support → Social support/loneliness cluster routing only;
- home → Environmental routing only;
- focus → Focus/Activation cluster routing only;
- direction → Direction/Meaning/Next-step cluster routing only;
- other → uncategorized until clarified;
- well → positive path;
- unsure → low-burden uncertain-start path.

### Signal/construct authority

Current mapped constructs include EMOTIONAL_STATE, PRESSURE_PATTERN, SLEEP_QUALITY, ENERGY_FUNCTION, LONELINESS, JOB_SECURITY, FINANCIAL_STRAIN, FINANCIAL_CONTROL, ENVIRONMENTAL_SUPPORT, MEANING_PURPOSE, RELATIONSHIP_STRAIN, SUPPORT_AVAILABILITY, PHYSICAL_CONDITION, ACTIVITY_LEVEL, FOCUS_FUNCTION, ACTIVATION, SCHEDULE_DISRUPTION, BODY_WEIGHT_CONCERN, VALUES_CLARITY, NEXT_STEP_CLARITY and DIRECTION_CLARITY. COGNITIVE_ENGAGEMENT remains experimental/deferred.

## Action Bank authority verified 2026-08-30

`02.06 EL8 Protocol & Action Library` is not just an ID list. Its Action Library has 20 governed fields per Action including use conditions, minimum evidence, review window, expected signal, burden, exclusions/contraindications, stop/reconsider rules, Safety/referral rules, confidence floor, status, tracking/logging requirement, additional assessment requirement, semantic icon key, evidence/source IDs, evidence strength, permitted claim and evidence-review status.

The repository therefore cannot call its Action Bank reconciled merely because all Action IDs exist.

Current canonical Action IDs verified from Drive:

`PHY-A01`, `PHY-A02`, `PHY-A03`, `PHY-A04`, `PHY-A05`, `PHY-A06`, `PHY-A07`; `EMT-A01`, `EMT-A02`, `EMT-A03`, `EMT-A04`; `SOC-A01`, `SOC-A02`, `SOC-A03`, `SOC-A04`; `OCC-A01`, `OCC-A02`, `OCC-A03`, `OCC-A04`; `FIN-A01`, `FIN-A02`, `FIN-A03`, `FIN-A04`; `ENV-A01`, `ENV-A02`, `ENV-A03`, `ENV-A04`; `INT-A01`, `INT-A02`, `INT-A03`, `INT-A04`; `SPT-A01`, `SPT-A02`, `SPT-A03`, `SPT-A04`; `XDM-A01`, `XDM-A02`, `XDM-A03`, `XDM-A04`, `XDM-A05`, `XDM-A06`.

Special statuses are material: `SOC-A04` is held for governance/evidence review; `INT-A04` is held pending COGNITIVE_ENGAGEMENT construct validation. Plan-scope Actions such as the XDM family are not construct treatments.

Protocol Standards PS-01 through PS-16 are implementation requirements. Important invariants include Safety first, minimum decision-critical evidence, member choice, smallest useful scope, low-risk/reversible automation, reconstructable explainability, minimum decision-useful measurement, explicit stop condition, cross-dimensional harm check, no hidden human synthesis, no clinical substitution, provisional-until-validated status, Action-linked evidence capture, stable semantic icon identity, evidence-backed rationale and claim discipline.

The Drive Discovery→Planning Contract is also binding. It specifies which Actions/families are eligible for each construct, when clarification is warranted, valid no-action/handoff dispositions, professional routes, Safety overrides, held/deferred families, tracking contracts and claim limits.

## Repository findings — confirmed defects / reconciliation blockers

### BLOCKER Q-001 — GEN001 currently creates severity evidence

`intelligence/discovery/questions/general.js` currently assigns positive numeric effects directly to GEN001 selections such as `money_pressure:.2`, `work_instability:.2`, `physical_condition:.2`, `low_energy:.2`, `poor_sleep:.2`, `stress:.2`, `relationship_strain:.2`, `home_instability:.2`, etc. This directly violates the Drive rule that GEN001 selections are routing priors only.

Disposition: REWRITE producer semantics and all dependent tests/consumers before further browser testing.

### BLOCKER Q-002 — active adapter perpetuates legacy concern ontology

`intelligence/discovery/question-bank-adapter.js` currently maps legacy effect keys through `CONCERN_ALIAS`, converts numeric effects into support/contradiction evidence, and treats the old concern namespace as an active internal decision layer. This is exactly the compatibility architecture the controlled reconciliation is intended to retire.

Disposition: MIGRATE to canonical Question IDs + canonical construct/evidence semantics. Preserve legacy IDs only as traceability metadata or bounded compatibility input where genuinely required.

### BLOCKER Q-003 — Question Bank is not yet Drive-canonical end-to-end

Repository question files still use a mixture of legacy IDs/effect keys and Drive-era concepts. Presence of canonical `GEN001` alone is insufficient. Every active Question/Answer must be reconciled against the workbook row, including status (Keep/Deferred/Retired/Design-only), role, response mode, answer semantics, stage/scheduling, direct-vs-hypothesis-vs-fit-vs-system-control class and Safety boundary.

Disposition: row-by-row migration plus CI registry validation.

### BLOCKER A-001 — duplicate Planning/Action authorities exist

Repository contains both `intelligence/planning/canonical-action-bank.js` and `intelligence/planning/intervention-library.js`. The latter still exposes legacy driver-keyed entries such as `poor_sleep`, `schedule_disruption`, `stress`, `low_energy`, `low_focus`, `low_activity`, `work_instability`, `money_pressure`, `relationship_strain`, `low_support`, `home_instability`, `lack_direction` and noncanonical Action IDs such as `sleep_log`, `walk`, `money_snapshot`, etc.

This is a parallel executable intervention authority and violates the one-canonical-implementation rule.

Disposition: trace all consumers. MERGE any still-useful behavior/evidence mechanics into canonical Drive Action definitions where the Drive supports it, then RETIRE the executable legacy library. Do not maintain two Action Banks.

### BLOCKER A-002 — canonical Action Bank is structurally incomplete versus Drive

`canonical-action-bank.js` has all current canonical Action IDs and some tracking/assessment/icon metadata, but its generic `make()` function fills major governed fields with generic defaults. Drive-specific `Use When`, `Minimum Evidence`, duration/review, expected signal, exclusions/contraindications, stop/reconsider, Safety/referral rule, confidence floor, status, evidence basis/source IDs, evidence strength, permitted rationale/claim and evidence review status are not faithfully represented per row.

Disposition: expand the canonical Action contract and migrate every Drive Action row field-by-field. Generic defaults may exist only where the Drive itself defines a common default; they cannot erase row-specific governance.

### BLOCKER A-003 — Action status/evidence claims require exact preservation

The current code normalizes many evidence statuses/strengths and claims. Drive distinguishes provisional, held, pending action-specific review, moderate general mechanism, low/governance review, validation required, etc. These affect recommendation eligibility and member-facing claim ceilings.

Disposition: preserve exact governed status/claim/evidence semantics needed by Planning and QA.

### BLOCKER A-004 — Discovery→Planning contract must be executable

The Drive contract explicitly permits no-action dispositions for many constructs and forbids generic Actions for EMOTIONAL_STATE, ENERGY_FUNCTION, PHYSICAL_CONDITION and BODY_WEIGHT_CONCERN. It also distinguishes conditional Action families and held Actions. The repo must prove Planning consumes this contract rather than simply looking up Actions by construct.

Disposition: reconcile `discovery-planning-contract.js`, canonical plan engine, scoring/gates and browser Plan view against the Drive contract matrix.

## Active implementation inventory — first classification

KEEP / reconcile in place:
- `intelligence/discovery/questions/*` — canonical owner, but content requires Drive migration.
- `intelligence/discovery/discovery-controller.js`
- `intelligence/discovery/discovery-engine.js`
- `intelligence/discovery/question-eligibility.js`
- `intelligence/discovery/question-scheduler.js`
- `intelligence/discovery/sufficiency.js`
- `intelligence/state/*` canonical Member State implementation, subject to construct/evidence reconciliation.
- `intelligence/prioritization/*` canonical Prioritization owner, subject to Drive factor/ambiguity reconciliation.
- `intelligence/planning/action-contract.js` — expand to exact 02.06 governed fields.
- `intelligence/planning/canonical-action-bank.js` — canonical Action Bank target; field-by-field migration required.
- `intelligence/planning/discovery-planning-contract.js` — canonical boundary target; exact Drive matrix reconciliation required.
- `intelligence/planning/canonical-plan-engine.js`
- `intelligence/planning/recommendation-scoring.js`
- `intelligence/planning/selection-evidence.js`
- `intelligence-test/*` — preserve tester shell, replace product semantics with canonical engine output.

MIGRATE / then retire:
- `intelligence/discovery/question-bank-adapter.js` — migrate away from legacy concern/effect ontology.
- `intelligence/discovery/concern-projection.js` — inspect consumers; likely migrate to construct-native projection.
- `intelligence/planning/intervention-library.js` — duplicate executable legacy Action authority; merge any unique still-governed mechanics then retire.

REVIEW FOR RETIREMENT / duplication:
- `intelligence/discovery/round3-controller.js`
- `intelligence/discovery/round3-engine.js`
- any tests whose sole purpose is preserving legacy IDs, old concern scoring or duplicate intervention behavior.

HOLD / validation-gated:
- SFT design-only Safety wording must not be promoted for external use without the governed validation gate.
- `SOC-A04` and `INT-A04` must retain their Drive hold semantics.

## Next execution batch

1. Trace consumers of `intervention-library.js`, `question-bank-adapter.js`, `concern-projection.js`, round3 files and `canonical-action-bank.js`.
2. Create a machine-readable canonical Question/Answer registry from the current Drive rows, or migrate the existing domain files so they exactly encode those rows without legacy effect semantics.
3. Make GEN001 routing-only and update every dependent test/consumer in the same batch.
4. Expand Action contract to encode the complete governed 02.06 row contract.
5. Rebuild `canonical-action-bank.js` from the Drive Action Library field-by-field.
6. Reconcile `discovery-planning-contract.js` against the Drive contract matrix.
7. Retire duplicate executable intervention authority after consumer migration.
8. Add CI validation that detects unknown/duplicate Question IDs, unauthorized active legacy IDs, unknown Action IDs, duplicate Action authorities, missing Action governance fields and held/deferred Action misuse.
9. Only then continue into controller/sufficiency/Member State/Prioritization/browser reconciliation.

Human test status remains BLOCKED.