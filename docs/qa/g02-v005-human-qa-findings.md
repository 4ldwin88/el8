# G-02 v0.05 Human QA Findings

Source session: `e9525dbc-1cb7-4815-990b-89ab67f13e34`
Candidate tested: `26cf2b6ca9092371f383567161de3315bfd46c87`
Intelligence tested: `v0.05`

## Required correction batch

1. Matrix presentation
   - Remove the matrix outer border while retaining horizontal row separators.
   - Remove small white radio-circle treatment.
   - Selection controls use a thin border and become solid black when selected.
   - **Disposition for v0.06:** corrected in the human-QA harness.

2. Discovery driver triage
   - Triage answers must resolve to individual member-facing drivers, not grouped/internal dimension labels.
   - Remove `Item 1 of 1` presentation.
   - Remove dimension header above the driver answers.
   - The adaptive triage must identify drivers for every difficult area established by the opening assessment; subsequent Discovery should deepen only evidence still needed.
   - **Disposition for v0.06:** corrected. The eight-dimension orientation remains the broad initial screen; difficult/mixed areas narrow to individual member-facing drivers. An experimental indiscriminate downstream screen was rejected because it exceeded the governed evidence/burden contract. Self-reported single-issue scope is directional evidence, not proof that every other dimension is healthy; cross-dimensional effects are pursued when evidence or governed relationship context makes them worth testing.

3. Discovery page hierarchy
   - Remove the repeated large generic header (`Let’s start with how life has been lately.`) from question pages. Question/context content should carry the page hierarchy.
   - **Disposition for v0.06:** corrected.

4. Focus confirmation
   - Rank supported Focus candidates when evidence supports meaningful ordering; do not manufacture ordering when it does not.
   - Member-facing Focus descriptions must explain the actual problem/outcome sufficiently to distinguish choices.
   - Continue filtering low-confidence Focus candidates.
   - **Disposition for v0.06:** corrected contract. `NEAR_EQUIVALENT` remains intentionally unordered and is presented as `Strong starting options`; `Recommended` is reserved for evidence-supported ordering.

5. Planning completeness and evidence
   - Multiple confirmed Focuses require Planning coverage, but Focus count and Action count are independent. One Action may legitimately cover multiple Focuses when canonical portfolio selection establishes explicit cross-Focus coverage.
   - Planning must expose relevant downstream/monitoring drivers separately from upstream selection drivers.
   - `Why this?` must derive recommendation confidence from evidence actually authorizing selection rather than manufacturing confidence from missing context.
   - An activated intervention must expose its associated Toolkit when one exists. Toolkit absence must be explicit only when the selected intervention legitimately has no Toolkit association.
   - **Disposition for v0.06:** the original observation that two Focuses produced one Action is not itself a defect. Canonical Planning already permits shared-leverage Actions with explicit coverage. The remaining evidence/Toolkit behavior stayed subject to fresh human retest rather than forcing a one-Action-per-Focus patch.

## v0.06 retest candidate

Exact candidate: `4780315eb5a76fb7f54c8d4e79ba3072ad6ddfd6`
Intelligence: `v0.06`

Validation provenance:
- G-02 Intelligence Validation: run `33808187151` — success on the exact candidate.
- GitHub Pages human-QA deployment: run `33808187226` — success on the exact candidate.

## v0.06 human-QA Planning dead end

Affected session: `8fca90b1-08df-4597-9dfd-d2313e77e3eb`
Tested candidate: `52802d910c610f3448468be3a50ddf557257db9f`
Intelligence tested: `v0.06`
Deployment: `github-actions-33808401476-1`

The member confirmed `ACTIVITY_LEVEL` and `BODY_WEIGHT_CONCERN`. Canonical Planning correctly returned `status: deepen` because the outcome-oriented body/weight Focus required goal clarification before it could be resolved through independently supported drivers. The human-QA Plan page displayed the requirement but did not render its governed options or provide a way to apply an answer. Finish remained blocked with `decision_critical_evidence_required`, creating a dead end.

This was a human-QA behavioral defect at the Planning interaction boundary, not a reason to bypass the Planning architecture. The canonical resolution path remains: capture the governed clarification in `planningContext.goalIntents`, rerun canonical `buildPlan`, and then continue with the rebuilt Plan. For requirements without governed answer options, the harness must remain blocked rather than fabricate an assessment interaction.

## v0.07 correction cycle

The substantive v0.06 human-QA dead end advanced the single Intelligence version to `v0.07`.

The v0.07 human-QA Plan interaction now:
- renders governed option-backed decision-critical Planning deepening requirements;
- records the selected clarification into canonical Planning input;
- reruns canonical `buildPlan` rather than selecting an Action in the harness;
- persists the rebuilt Planning input, canonical Plan, and deepening answer;
- keeps unsupported/no-option requirements blocked instead of inventing answer content;
- preserves Action member agency and the `Why this?` evidence explanation with expandable internal QA provenance;
- surfaces Toolkit information when the canonical Action contains Toolkit data;
- persists tester notes locally while testing rather than depending on final submission;
- uses the reconciled Focus/Plan member-facing presentation without manufacturing recommendation ordering.

An initial v0.07 harness edit temporarily removed the `QA provenance` disclosure. CI caught that regression. Provenance was restored within the same v0.07 correction cycle, so no additional Intelligence version increment was warranted.

Subsequent presentation reconciliation changed incidental Plan copy. The behavioral regression test was updated to protect the governed behavior and reconciled copy rather than obsolete text. This also did not warrant an Intelligence version increment.

### v0.07 validated candidate before documentation reconciliation

Exact candidate: `9d389c84f61f2e9ebb940fcdb1a7a78c97126432`
Intelligence: `v0.07`

Validation provenance:
- G-02 Intelligence Validation: run `33828369131` — success on the exact candidate.
- GitHub Pages human-QA deployment: run `33828369167` — success on the exact candidate.

This documentation update is non-behavioral. Its resulting HEAD must also pass G-02 validation and GitHub Pages deployment before it is treated as the final exact human-QA candidate.

## Version rule

Intelligence increments only when human testing identifies a substantive behavioral defect and a corrected human-test candidate is prepared. CI, deployment, documentation, regression-test maintenance, refactoring, or presentation reconciliation within the same correction cycle do not independently increment Intelligence.

PR #144 remains draft/open/unmerged until fresh human validation passes.