# EL8 Intelligence Engine

## Purpose

The Intelligence Engine is the broader decision and coordination layer for EL8. Discovery is one subsystem of the Intelligence Engine, not a synonym for the whole engine.

The Intelligence Engine owns the decision lifecycle from understanding a member through deciding what EL8 should do next and learning from the result.

## Canonical architecture

1. **Discovery** — understand the member, identify concerns and drivers, resolve uncertainty, and gather sufficient evidence.
2. **State** — maintain traceable member/concern state derived from evidence rather than opaque scores.
3. **Prioritization** — determine what deserves attention now, including member priority, urgency, dependencies, burden, and safety.
4. **Planning** — convert prioritized concerns into a focused member plan.
5. **Intervention** — select appropriate actions/interventions and manage their lifecycle.
6. **Outcomes / Learning** — evaluate results and improve future decisions without silently changing canonical meaning.
7. **Safety / escalation** — override ordinary routing when explicit safety conditions require it.
8. **Orchestration / validation** — coordinate lifecycle execution and prove canonical behavior without becoming a second domain model.

## Current repository boundary

`intelligence/discovery/**` is the canonical Discovery implementation. Its current component version is **Discovery v3**. Canonical entry files use capability names such as `discovery-engine.js` and `discovery-controller.js`; development-history labels such as “Round 3” are not canonical API names.

Shared contracts live under `intelligence/contracts/**`; canonical Member State and taxonomy live under `intelligence/state/**`. Prioritization, Planning, Interventions, and Outcomes consume those canonical boundaries.

Historical repository files outside the canonical subsystem folders may still exist for product, migration, or earlier prototype purposes. Their presence does not make their APIs, scores, constants, object shapes, or historical development labels authoritative Intelligence contracts.

## Versioning standard

EL8 separates release/test versions from component versions.

- **Product or research-test versions** describe a complete tested experience, for example Intelligence Test `v0.2.1`.
- **Component versions** describe a canonical subsystem contract, for example Baseline `v3.1`, Discovery `v3`, or Planning `v1`.
- **Implementation names** describe capability and responsibility, not development history. Prefer `discovery-engine`, `discovery-controller`, `question-bank`, and similar capability names.
- Do not combine unrelated version dimensions into labels such as `round3-v0.2.1`.
- A component version changes only when its contract or behavior changes materially; a research-test patch does not automatically rename every component.
- Historical review artifacts may retain their original historical terminology when needed for provenance, but current authority must identify the canonical modern name.

## Design rules

- Discovery gathers and resolves evidence; it does not own the entire Intelligence Engine.
- Evidence retains provenance.
- Derived state remains traceable to evidence.
- Ambiguity remains explicit until resolved; do not hide uncertainty inside arbitrary wellness scores.
- Member-facing plans remain focused rather than forcing all eight dimensions into active work.
- Safety escalation may override normal burden and prioritization rules when explicitly triggered.
- Internal ranking calculations may support decisions but are not Member State or member wellness scores.
- Tests and simulations validate canonical behavior; they do not define member truth.
- Canonical files should be cohesive and reasonably sized.
- Stable and development environments should consume the same canonical engine contracts while remaining independently deployable and independently authenticated.

## Canonical validation

The repository-level `npm test` gate exercises shared contracts, Member State, Discovery, Prioritization, Planning, Interventions, and Outcomes. Discovery also has its dedicated regression workflow rooted at `intelligence/discovery/**`.

Legacy behavior is not kept merely for compatibility. A behavior survives only when it is required, semantically valid, rebuilt against canonical contracts where necessary, and covered by canonical QA.

## Naming

Use **Intelligence Engine** for the overall EL8 decision system.

Use **Discovery** for the subsystem responsible for understanding the member and producing sufficient, traceable evidence/state for downstream intelligence functions. Use **Discovery v3** when a version is required. “Round 3” refers only to the historical development iteration that produced v3 and should not be used as a current component or API name.
