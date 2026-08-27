# EL8 Repository Governance

Status: Interim MVP-first repository policy  
Reconciled: 2026-08-27

## Purpose

This document governs EL8 development during MVP establishment. The immediate objective is a coherent working MVP, not a mature release-management system.

The product must first prove its canonical member loop safely and end to end. Formal environment protection, promotion ceremonies, production-grade operating procedures and stricter release governance will be established after the MVP is coherent enough to protect.

## 1. Current phase — MVP establishment

EL8 is pre-MVP. During this phase, use the simplest development topology that keeps the code coherent and testable.

One authoritative active MVP development line is sufficient. Short-lived `feat/*`, `fix/*`, `cleanup/*` or `experiment/*` branches may be used when they make bounded work safer or easier to review, but the experiment → development → stable pipeline is not itself an MVP requirement.

There is no Stable Build yet, and no branch should be treated as production-grade merely because of its name.

## 2. What remains mandatory now

Process is simplified, not abandoned. During MVP development EL8 still requires:

- one canonical implementation per capability;
- no parallel decision engines or environment-specific source copies;
- traceable evidence, state and safety behavior;
- `npm test` / Canonical Repository QA as the repository regression gate;
- accelerated end-to-end closed-loop QA so the lifecycle can be tested without waiting real-world days;
- relevant live persistence/backend checks where mocks cannot prove correctness;
- human validation before declaring the MVP established;
- Git history as the default archive for retired implementation.

A failed relevant gate is fixed against the canonical MVP architecture. Obsolete machinery is not restored merely to satisfy historical tests.

## 3. Canonical MVP objective

The architecture being protected is:

`Discovery → Member State → Prioritization → Planning → Action → Outcome evidence → Review → Planning or focused Reassessment`

Safety may interrupt ordinary flow.

Repository/process decisions should make this loop easier to build, test and understand. They should not create additional architecture whose main purpose is satisfying a premature governance model.

## 4. Temporary branch protocol

Until the MVP is established:

- Keep one obvious authoritative MVP candidate/development line.
- Work directly on that line when the change is controlled and doing so reduces unnecessary ceremony.
- Use a short-lived branch when isolation materially reduces risk or enables useful review/QA.
- Do not create retry branches because CI failed.
- Do not preserve rejected experiments as archive branches.
- Do not duplicate source trees for Stable, Development or Experiment environments.
- Close/delete temporary branches after their useful work has been incorporated or rejected.

Git history and closed PRs preserve recoverability.

## 5. MVP establishment gate

The MVP is established when all of the following are true:

1. The canonical member loop works coherently end to end.
2. Core onboarding and primary member workflows can be exercised without hidden/manual architectural workarounds.
3. Canonical Repository QA and applicable regressions are green.
4. Accelerated closed-loop QA proves assessment/discovery → priority → plan → action/outcome → review → adaptation/reassessment.
5. Canonical persistence and authentication/session behavior required by the MVP are reliable.
6. Safety-critical behavior is durably tested and verified.
7. A representative human-validation round has no unresolved MVP-blocking usability or comprehension defect.
8. The implementation and authoritative documentation agree on the canonical architecture.

Passing automation alone does not establish the MVP.

## 6. Governance deferred until after MVP

After the MVP establishment gate passes, EL8 will define and enforce the protected environment model. That work should include, as appropriate:

- explicit Stable and Development authority;
- isolated experiment/preview rules;
- branch protection and required status checks;
- promotion/release criteria;
- deployment/environment isolation;
- backend/environment separation;
- rollback and recovery procedures;
- change-management and release documentation;
- production monitoring and operational runbooks;
- hotfix and reconciliation procedures.

These capabilities are deferred, not discarded. We should design them around the validated MVP rather than guessing their requirements beforehand.

## 7. Repository architecture

Permanent implementation belongs in:

```text
/
├── README.md
├── package.json
├── .github/workflows/
├── app/
├── intelligence/
├── assets/
├── admin/                 # when required
├── supabase/              # repository-owned backend source/config
├── tests/                 # cross-domain/system validation
└── docs/                  # current technical authority only
```

The root remains deployment-oriented and small. Shared implementation belongs to its domain owner. Temporary reports, scripts, experiments, screenshots, exports and generated files do not belong in root merely because it is convenient.

## 8. Source and archive strategy

There is one canonical source location for each accepted capability.

For artifacts under review:

- **KEEP** — canonical and useful for the MVP.
- **MERGE** — useful behavior belongs inside an existing canonical owner.
- **MIGRATE** — useful but incorrectly located.
- **HOLD** — a temporary live dependency prevents safe movement and has an exit condition.
- **RETIRE** — superseded or unnecessary; recoverable through Git history.
- **FUTURE SPEC** — durable post-MVP design knowledge worth preserving without keeping obsolete executable architecture.

Do not retain executable code merely because it might be useful someday. Preserve a clean extension seam or concise future specification when reconstruction would otherwise be expensive or ambiguous.

## 9. Testing ownership

Prefer domain-local tests when a test protects one owner. Use `tests/` for cross-domain persistence, authentication/session isolation, fixtures/evals, deployable-build smoke checks and validation without a natural single owner.

Tests should primarily protect canonical/member-visible behavior and architectural invariants, not superseded implementation internals.

A defect found during live or human testing should receive a regression test when the behavior can be durably automated.

## 10. Backend and persistence

Backend schema/function changes remain first-class code changes during MVP development.

For material backend changes:

1. preserve the invariant being protected unless intentionally changed;
2. prefer migration/supersession over destructive deletion of member history;
3. update repository-owned persistence contracts/migrations where applicable;
4. test against the live development backend when mocks cannot prove correctness;
5. avoid undocumented backend mutations that make the MVP impossible to reconstruct.

Full production environment isolation is post-MVP governance unless it becomes necessary to prove the MVP safely.

## 11. Documentation protocol

README is the short entry point. `intelligence/README.md` owns canonical MVP Intelligence boundaries. This document owns the temporary development/governance policy.

Update authoritative documentation whenever a change modifies canonical architecture, MVP scope, persistence authority, safety authority or the MVP establishment gate.

Historical documents do not override newer explicit MVP decisions. Normalize or mark them when their guidance could cause implementation drift.

## 12. Anti-drift decision rule

Before adding a subsystem, abstraction, process requirement or protocol, ask:

1. Is it required to make the current MVP loop useful, safe, testable or maintainable?
2. Does an existing canonical owner already answer this question?
3. Will real MVP evidence materially inform how this should be designed?
4. Can we preserve a clean seam and build it after validation instead?

If the capability can wait, defer the machinery.

## 13. Post-MVP transition

Once the MVP establishment gate passes, this interim policy should be replaced—not endlessly appended—with a concise permanent development/release governance model based on the validated system.

At that point EL8 should deliberately establish protected environments and procedures around the MVP baseline. Until then, the governing priority is straightforward: build the right small system, prove it works, and avoid process or architecture that exists mainly to look mature.