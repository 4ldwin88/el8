# EL8 Post-Gate-3 Integration Plan

Status: APPROVED PLANNING BASELINE — implementation not yet promoted into Discovery v0.11.

## 1. Baseline boundary

- Discovery v0.11 remains the current human-testing baseline and must not be silently modified by EEV1 integration work.
- EEV1 is the hardened technical baseline for evidence evaluation, decision sufficiency, safety routing, prioritization, plan composition, version/replay, event audit, response contracts, learning governance, escape/burden semantics, and cross-dimensional synthesis.
- Integration must occur behind an explicit new Discovery version boundary.

## 2. Proposed next version

Working integration target: **Discovery v0.12 candidate**.

v0.12 is not a UX redesign. It is a controlled integration candidate that preserves the validated v0.11 member-facing interaction model wherever possible while replacing or wrapping decision machinery with EEV1 contracts.

Promotion sequence:

`Discovery v0.11 (human baseline) → v0.12 candidate (isolated integration) → automated validation → adversarial/blinded validation → human comparison → promotion decision`

## 3. Integration layers and order

### Layer A — response boundary
Map v0.11 answer values into EEV1 typed response contracts. Escape paths must use the closed EEV1 escape codes. Invalid responses fail closed rather than creating evidence.

### Layer B — evidence/state
Route validated responses through EEV1 evidence effects and concern/driver state logic. Preserve the separation between observed concern and possible driver. No member-facing causal language may be generated from co-occurrence alone.

### Layer C — safety
Run deterministic governed-safety evaluation before optimization. AI assistance may escalate or structure information but may not lower the deterministic safety floor or bypass interruption rules.

### Layer D — discovery stopping
Use EEV1 decision-sufficiency and bounded clarification rules to decide whether another question has enough expected decision value to justify burden. Repeated unsure/escape paths must terminate predictably.

### Layer E — prioritization and agency
Generate only evidence-eligible focus candidates, order them using the deterministic EEV1 priority policy, then pass proposed focuses through the member agency gate. Member alternatives remain subject to evidence and safety eligibility.

### Layer F — plan composition
Compose the initial plan from eligible actions only. Enforce focus/action ceilings, duplicate protection, safety blocks, member-reported burden overrides, and the total initial burden cap.

### Layer G — longitudinal adaptation
Record outcomes/non-adherence using controlled reason codes. Outcome failure must reopen or weaken the relevant driver hypothesis rather than merely swapping actions while preserving an unsupported causal story.

### Layer H — event/provenance layer
Record material decision-chain events append-only with strict stream sequencing, provenance and exact version references. Derived state must remain rebuildable from immutable events.

### Layer I — governed learning
Historical patterns may generate candidate policy changes but cannot satisfy current evidence, make causal claims, or alter production behavior directly. Any policy change follows shadow → held-out validation → explicit approval → monitored deployment/rollback.

## 4. Compatibility rule

For every existing v0.11 test fixture, v0.12 must produce one of three explicitly classified outcomes:

1. `EQUIVALENT` — same materially valid decision/result.
2. `INTENTIONAL_HARDENING` — different result because EEV1 blocks unsupported inference, reduces burden, strengthens safety, preserves uncertainty, or improves auditability.
3. `REGRESSION` — unexplained or undesirable behavioral change.

No unexplained difference may be accepted as implementation noise.

## 5. UX preservation rule

The following v0.11 experience properties are invariants unless separate human testing approves a change:

- compact opening controls;
- Health remains distinct from Energy;
- questions do not presume unreported problems;
- plain-language member copy;
- technical confidence/state machinery remains hidden unless needed for meaningful explanation;
- agency/correction rights remain obvious;
- unsure, none-fit, prefer-not-to-answer and skip paths remain low-friction and non-punitive.

Technical integration must not leak internal state names, numeric evidence weights, reason-code identifiers, or causal speculation into normal member-facing copy.

## 6. Migration boundary

Existing v0.11 historical assessment records are not retroactively reinterpreted as if EEV1 had processed them at the time. If replay is useful for comparison, it creates a separately labeled v0.12-derived projection with explicit source/version provenance. Original observations and historical decisions remain unchanged.

## 7. Required validation before promotion

A v0.12 candidate cannot replace v0.11 until all of the following pass:

- existing Discovery regression suite;
- complete EEV1 suite;
- v0.11 ↔ v0.12 compatibility harness;
- adversarial contradictory-answer cases;
- repeated unsure/escape cases;
- safety interruption cases;
- cross-dimensional correlation/causation cases;
- high-burden/multi-concern cases;
- blinded decision benchmark;
- deterministic replay/version tests;
- human side-by-side testing focused on clarity, burden, trust, agency and perceived relevance.

## 8. Human test gate

Automated success is necessary but insufficient. Human testers should compare v0.11 and the v0.12 candidate without being told which architecture is newer. At minimum capture:

- completion rate and time;
- perceived repetition;
- clarity of why a follow-up was asked;
- whether questions felt presumptive/pathologizing;
- whether the resulting focus felt accurate and useful;
- whether the member felt able to correct/decline the recommendation;
- total perceived burden;
- trust/resonance with the resulting plan.

Promotion requires no material safety/epistemic regression and a human experience at least non-inferior to v0.11.

## 9. First implementation slice

Build a **v0.12 compatibility adapter + comparison harness** before altering the live assessment UI. The adapter should accept the same normalized v0.11 fixture inputs, route them through EEV1 response/evidence/decision contracts, and emit a comparable decision artifact. The harness should classify every difference as EQUIVALENT, INTENTIONAL_HARDENING or REGRESSION.

This creates the safest bridge between the validated human experience and the hardened architecture without prematurely merging the two.

## 10. Promotion rule

Do not merge v0.12 behavior into the live Discovery path merely because automated tests are green. Promotion is a separate governed decision after compatibility, adversarial and human validation are complete.
