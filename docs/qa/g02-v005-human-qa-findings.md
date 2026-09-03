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
   - **Disposition for v0.06:** the original observation that two Focuses produced one Action is not itself a defect. Canonical Planning already permits shared-leverage Actions with explicit coverage. The remaining evidence/Toolkit behavior stays subject to the fresh human retest rather than forcing a one-Action-per-Focus patch.

## v0.06 retest candidate

Exact candidate: `4780315eb5a76fb7f54c8d4e79ba3072ad6ddfd6`
Intelligence: `v0.06`

Validation provenance:
- G-02 Intelligence Validation: run `33808187151` — success on the exact candidate.
- GitHub Pages human-QA deployment: run `33808187226` — success on the exact candidate.

The candidate is ready for fresh internal human QA. G-02 remains open until that human validation is completed and any new substantive behavioral findings are resolved.

## Version rule

The v0.05 findings contained substantive human-QA behavioral defects, so the corrected human-test candidate advanced the single EL8 Intelligence version to `v0.06`. Subsequent CI, deployment, documentation, refactoring, or validation corrections within the same human-QA correction cycle do not independently increment Intelligence.

PR #144 remains draft/open/unmerged until fresh human validation passes.