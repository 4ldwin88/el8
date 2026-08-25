# Step 2 — Shared Contracts Lock

Status: **LOCKED for canonical vertical-slice milestone**

The minimal cross-subsystem contract surface is now intentionally frozen unless the vertical slice proves a missing boundary.

## Shared surface

- `core.js` — contract references, provenance, decision traces
- `observations.js` — Observation envelope and lightweight Evidence references
- `safety.js` — cross-cutting Safety/Escalation signal and disposition interface
- `handoffs.js` — minimal subsystem handoff envelope
- `contracts.test.js` — canonical contract regression coverage

## Boundary rule

Shared contracts carry identity, provenance, references, safety state, unresolved references, and routing metadata across subsystem boundaries.

They do **not** own subsystem-private decision logic or rich internal payloads. Discovery effect semantics, Prioritization ranking internals, Planning plan construction, Intervention selection, Learning policy, and persistence implementation remain with their owning components.

## Validation gate

Commit `f7a10772e4b19486b893c241225ee041ccd693cb` passed both:

- Canonical Repository QA
- Discovery Development Regression

The contract tests cover Observation creation/correction, Evidence provenance/reference semantics, Safety propagation, unresolved-state handoff, decision traces, and rejection of invalid shared-contract values.

## Change control

Do not expand `intelligence/contracts/**` merely because two modules use similar data.

A new shared contract is justified only when:
1. a value crosses a canonical subsystem boundary,
2. both producer and consumer require stable semantics,
3. keeping the type private would cause duplicated interpretation or contract drift, and
4. the vertical-slice or a proven downstream requirement demonstrates the need.

Step 3 may adapt Discovery to these contracts, but should not broaden this surface without satisfying the above gate.
