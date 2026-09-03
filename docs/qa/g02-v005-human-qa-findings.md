# G-02 v0.05 Human QA Findings

Source session: `e9525dbc-1cb7-4815-990b-89ab67f13e34`
Candidate tested: `26cf2b6ca9092371f383567161de3315bfd46c87`
Intelligence tested: `v0.05`

## Required correction batch

1. Matrix presentation
   - Remove the matrix outer border while retaining horizontal row separators.
   - Remove small white radio-circle treatment.
   - Selection controls use a thin border and become solid black when selected.

2. Discovery driver triage
   - Triage answers must resolve to individual member-facing drivers, not grouped/internal dimension labels.
   - Remove `Item 1 of 1` presentation.
   - Remove dimension header above the driver answers.
   - The adaptive triage must identify drivers for every difficult area established by the opening assessment; subsequent Discovery should deepen only evidence still needed.

3. Discovery page hierarchy
   - Remove the repeated large generic header (`Let’s start with how life has been lately.`) from question pages. Question/context content should carry the page hierarchy.

4. Focus confirmation
   - Rank supported Focus candidates so the strongest supported candidate(s) are explicitly marked `Recommended` rather than labeling every candidate `Other supported focus`.
   - Member-facing Focus descriptions must explain the actual problem/outcome sufficiently to distinguish choices.
   - Continue filtering low-confidence Focus candidates.

5. Planning completeness and evidence
   - Multiple confirmed Focuses must produce Planning coverage for each confirmed Focus unless the canonical planner explicitly consolidates them into one intervention with evidence-backed cross-Focus coverage.
   - Planning must expose relevant downstream/monitoring drivers separately from upstream selection drivers.
   - `Why this?` must not report recommendation confidence as `insufficient` when the recommendation is supported by established evidence; confidence must be derived from the evidence actually authorizing selection.
   - An activated intervention must expose its associated Toolkit when one exists. Toolkit absence must be explicit only when the selected intervention legitimately has no Toolkit association.

## Version rule

These findings include substantive human-QA behavioral defects in Focus ranking/description and canonical Planning coverage/evidence. The correction candidate therefore qualifies for the next single EL8 Intelligence version (`v0.06`) once the fixes are implemented and the corrected candidate is ready for human retest. UI-only changes do not independently trigger the increment.

PR #144 remains draft/unmerged until fresh human validation passes.