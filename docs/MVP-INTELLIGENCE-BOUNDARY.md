# EL8 MVP Intelligence Boundary

Status: Canonical development constraint for the pre-human-testing branch.

## Core hypothesis
EL8 MVP exists to test one proposition: can a lightweight closed loop understand what matters enough to help a member choose a useful next action, observe what happens, and adapt appropriately?

## Required MVP loop
Baseline → Targeted Discovery → Member Confirmation → Planning → 1 active action by default (maximum 2) → Minimal Tracking → Review → Adapt → Repeat.

Safety and Member Agency are cross-cutting authorities over the loop.

## KEEP — required before controlled human testing
- Universal Baseline: broad orientation across eight dimensions; no intervention authority.
- Targeted Discovery: resolve only decision-relevant uncertainty; stop when sufficient for MVP decisions.
- Member confirmation: confirm starting focus; lightweight structured reason only when overriding it.
- Simple prioritization: safety and member agency first, then sufficient evidence, importance, feasibility/capacity.
- Curated intervention library: reviewed, bounded wellness actions; no unconstrained generated advice.
- Planning: one action by default; maximum two only when independently justified and combined burden is acceptable.
- Minimal activation evidence: ask only facts that can change selection or safe/appropriate activation.
- Minimal tracking: adherence plus the smallest outcome evidence needed for review.
- Review: KEEP / SIMPLIFY / REPLACE / DEEPEN / REASSESS, with disengagement distinct from failure.
- Adaptation: avoid immediate repetition of a failed action; use bounded exclusions rather than permanent blacklists.
- Safety interrupt: contextual indicators may trigger clarification; canonical Safety can pause ordinary flow; no pseudo-clinical risk score.
- Explainability: member can understand why this focus, why this action, and why a plan changed.
- Persistence/history: preserve evidence, active plan, review result, and enough decision trace to continue the loop.
- Automated regression coverage for the above boundaries.

## SIMPLIFY — retain the contract, minimize implementation
- Confidence: use coarse evidence sufficiency/floors for gating; do not build probabilistic inference for MVP.
- Mechanisms: retain a simple mechanism field and bounded exclusion support; do not build mechanism-learning models.
- Decision trace: record inputs/reasons needed for QA and explanation; no generalized explainability platform.
- Capacity: low/medium/high or equivalent bounded capacity is enough; avoid elaborate burden mathematics.
- Known facts: reuse clearly established facts where practical; no generalized information-gain engine before human evidence shows repetition is a problem.
- Cross-dimensional reasoning: allow linked concerns to inform priority; do not attempt global optimization across all eight dimensions.
- Safety: preserve clean cross-stage authority and escalation hooks; exact clinical policy/wording requires appropriate external review rather than autonomous product invention.

## DEFER — post-MVP unless human testing proves necessary
- Advanced causal inference and hypothesis-learning models.
- Sophisticated mechanism exhaustion/re-eligibility optimization.
- Probabilistic confidence calibration and learned ranking weights.
- Automated evidence-governance systems beyond curated/versioned MVP policy.
- Large intervention taxonomies and broad generated intervention synthesis.
- Wearable and broad third-party integrations.
- Predictive personalization and long-term recommendation models.
- Advanced cross-dimensional optimization.
- Professional/provider marketplace and service routing beyond necessary safety escalation.
- Community/social systems.
- Rewards, achievements, points, gamification and complex streak systems.
- Large learning/content platform.
- Advanced scheduling and multi-plan orchestration.
- Automated clinical-style diagnosis or risk prediction.

## REMOVE / DO NOT REINTRODUCE
- Baseline selecting interventions directly.
- Parallel or legacy Planning engines with separate semantics.
- Hard-coded default plans that bypass evidence gates.
- Silent fallback plans after activation/readiness rejection.
- Safety as a weighted wellness score or ordinary ranking input.
- Treating member silence as intervention failure.
- Permanent action/mechanism blacklists from a single noisy review.
- Asking additional questions merely because more information could be collected.

## Architecture boundary
Evidence layer: Baseline, Discovery and Tracking produce evidence.

Decision layer: Prioritization determines what matters; Planning chooses a bounded intervention.

Execution layer: member performs the action and provides minimal useful evidence.

Learning layer: Review interprets execution/outcome evidence and routes adaptation upstream.

Safety: independent cross-stage interrupt.

Member Agency: member may confirm, modify, decline, pause or supply constraints throughout the loop.

Each layer owns one responsibility. Future sophistication must extend these contracts rather than create parallel paths.

## Feature admission rule
Every new proposal is classified before implementation:
1. MVP BLOCKER — required for safety, core-loop correctness, or ability to test the core hypothesis. Implement now.
2. ARCHITECTURAL PROVISION — cheap contract/metadata that prevents a future dead end. Preserve minimally; do not build the future system.
3. FUTURE ENHANCEMENT — useful sophistication not required to validate MVP. Defer.

Third-party review findings do not automatically become features. They must first pass this classification.

## Pre-human gate
Controlled human testing begins only when:
- the required MVP loop works end-to-end;
- canonical repository QA for MVP boundaries is green;
- no unresolved finding demonstrates a credible safety or core-loop correctness failure;
- remaining findings are explicitly classified as architectural provisions or future enhancements;
- member-facing Safety wording/escalation policy receives appropriate external review where required.

Human testing should then answer product questions that synthetic QA cannot: question burden, trust, perceived relevance, adherence, usefulness of interventions, clarity of explanations, and whether adaptation feels genuinely responsive.
