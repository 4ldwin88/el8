# EL8 Intelligence Engine

## Purpose

The Intelligence Engine is the broader decision and coordination layer for EL8. Discovery is one subsystem of the Intelligence Engine, not a synonym for the whole engine.

The Intelligence Engine ultimately owns the pipeline from understanding a member through deciding what EL8 should do next and learning from the result.

## Target architecture

1. **Discovery** — understand the member, identify concerns and drivers, resolve uncertainty, and gather sufficient evidence.
2. **State** — maintain traceable member/concern state derived from evidence rather than opaque scores.
3. **Prioritization** — determine what deserves attention now, including member priority, urgency, dependencies, burden, and safety.
4. **Planning** — convert prioritized concerns into a focused member plan.
5. **Intervention** — select appropriate actions/interventions and manage their lifecycle.
6. **Learning** — use outcomes and history to improve future decisions without silently changing canonical meaning.
7. **Safety / escalation** — override ordinary routing when explicit safety conditions require it.

## Current repository boundary

`development/discovery/**` is the canonical implementation of the current Discovery subsystem while reconstruction is underway.

Existing code under `intelligence/**` predates that reconstruction and is migration source material unless explicitly promoted into the canonical architecture. Do not treat historical APIs, scores, filenames, constants, or object shapes as authoritative merely because they exist here.

Useful behavior should be migrated into clean canonical modules and covered by canonical tests before its legacy implementation is retired.

## Migration order

Migrate in dependency order to minimize rework:

1. evidence and state/model behavior
2. question selection and routing
3. prioritization and planning
4. interventions
5. learning/adaptation
6. simulation and integration harnesses
7. retire superseded legacy modules and tests

## Design rules

- Discovery gathers and resolves evidence; it does not own the entire Intelligence Engine.
- Evidence retains provenance.
- Derived state remains traceable to evidence.
- Ambiguity remains explicit until resolved; do not hide uncertainty inside arbitrary scores.
- Member-facing plans remain focused rather than forcing all eight dimensions into active work.
- Safety escalation may override normal burden and prioritization rules when explicitly triggered.
- Historical tests are evidence of useful behavior, not automatic architecture requirements.
- New canonical files should be cohesive and reasonably sized; split responsibilities before files become difficult to review or prone to truncated edits.
- Stable and development environments should consume the same canonical engine contracts while remaining independently deployable and independently authenticated.

## Naming

Use **Intelligence Engine** for the overall EL8 decision system.

Use **Discovery** only for the subsystem responsible for understanding the member and producing sufficient, traceable evidence/state for downstream intelligence functions.
