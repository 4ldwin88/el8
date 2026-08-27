# EL8 Intelligence Engine

## MVP purpose

The Intelligence Engine is EL8's decision loop. The current goal is not to build the most sophisticated wellness intelligence architecture possible; it is to establish the smallest coherent architecture that can prove the EL8 closed loop with real members and remain cleanly extensible later.

The MVP must reliably answer: what is going on, what matters now, what should the member do, what happened, and what should change next?

## Canonical MVP architecture

1. **Discovery** — understand the member, establish concerns, resolve decision-relevant uncertainty, and gather sufficient evidence.
2. **Member State / Evidence** — maintain traceable facts, concerns, hypotheses and provenance. State is shared infrastructure, not another decision engine.
3. **Prioritization** — rank established concerns by what matters now: member importance, urgency, materiality and useful cross-dimension leverage.
4. **Planning** — select a small feasible set of evidence-supported actions. Planning owns action selection and may ask only for information capable of changing or safely activating the selected action.
5. **Outcome evidence** — record what happened: completion/adherence, benefit, burden, barriers, changed context and provenance. Outcomes do not decide what EL8 should do next.
6. **Review** — interpret outcome evidence and decide whether to keep, deepen, simplify, replace or reassess. Replanning constraints sent back to Planning should stay simple.
7. **Focused reassessment** — return to Discovery only when circumstances changed or existing evidence is genuinely insufficient. Do not restart broad onboarding by default.
8. **Safety** — may interrupt ordinary flow whenever explicit canonical safety conditions require it.

The ordinary loop is:

`Discovery → Member State → Prioritization → Planning → Action → Outcome evidence → Review → Planning or focused Reassessment`

Safety is a cross-cutting gate, not a competing wellness score or parallel planner.

## MVP boundaries

For the MVP, there is one decision authority per question:

- Discovery: **What is going on, and do we know enough?**
- Prioritization: **What matters most now?**
- Planning: **What should the member do?**
- Outcomes: **What happened?**
- Review: **What should change next?**
- Safety: **Can ordinary flow continue?**

Do not introduce a second adaptation engine, intervention-routing engine, outcome interpreter, generic handoff framework, or parallel scoring model to answer the same questions.

Member-facing plans should normally contain one or two active actions, not simultaneous optimization across all eight dimensions. Additional questions must earn their burden by being decision-useful.

## Future extension policy

Future capability is welcome when evidence from MVP use justifies it. Likely extension seams include richer personalization, longitudinal learning, more sophisticated intervention eligibility, provider/professional routing, integrations, predictive models, experimentation, and more advanced cross-dimensional reasoning.

Those possibilities are **not MVP requirements**. Do not pre-build them as dormant production subsystems. Preserve clean contracts and provenance now so they can be added later without rewriting the core loop.

When an experimental implementation is retired, Git history is the archive. Preserve a separate future specification only when it contains durable design knowledge that would be expensive or ambiguous to reconstruct. Do not maintain executable legacy architecture merely because it may someday be useful.

## Current repository boundary

`intelligence/discovery/**` is canonical Discovery. Shared evidence/safety contracts live under `intelligence/contracts/**`; canonical Member State and taxonomy live under `intelligence/state/**`; `intelligence/prioritization/**`, `intelligence/planning/**`, `intelligence/outcomes/**`, and `intelligence/review/**` own their respective MVP decisions.

Member-facing reassessment orchestration may live under `app/plan/**`, but it must reuse canonical Discovery and Planning rather than becoming another intelligence model.

Historical files do not become authoritative merely because they remain in Git history or older commits.

## Design rules

- One canonical implementation per capability.
- Evidence retains provenance.
- Derived state remains traceable to evidence.
- Ambiguity stays explicit until resolving it is useful.
- Internal ranking may support a decision but is not member wellness truth.
- No aggregate wellness score is required for the MVP.
- Member rejection and consent are hard constraints, not soft ranking hints.
- Capacity and burden constrain Planning rather than becoming Prioritization truth.
- Review interprets outcomes; Planning does not review itself.
- Reassessment is focused and evidence-driven.
- Safety can override ordinary routing.
- Tests should primarily prove member-visible/canonical behavior rather than obsolete implementation internals.
- Delete duplication instead of preserving compatibility with superseded internal APIs.

## Canonical validation

`npm test` is the repository-level automated MVP gate. It covers shared contracts/state, Safety, Discovery, Prioritization, Planning, focused reassessment, Outcomes, Review and relevant member-flow regression.

Passing automation is necessary but not sufficient. Before promotion, the closed loop must also be exercised through accelerated end-to-end QA so we can test assessment → plan → action/outcome → review → adaptation without waiting real-world days between steps.

Legacy behavior survives only when it remains semantically valid for the MVP, is implemented through the canonical boundaries above, and is covered by useful QA.
