# EL8 Repository Governance

Status: Authoritative repository organization and maintenance policy

## Purpose

This document defines how the EL8 repository is organized, maintained, tested, promoted, archived, and cleaned. It governs repository structure; product and wellness authority remains in the appropriate EL8 authoritative documents outside this repository.

## Core states

Every substantive repository artifact should have one clear state.

### Active
Accepted code and assets that form the current working EL8 prototype. Active material should be production-intent, understandable, maintained, and covered by appropriate regression checks.

### Development
Candidate work that is being designed, implemented, tested, reviewed, or considered for future promotion into Active. Development is not a junk drawer. Each development area should represent a defined initiative or experiment with a plausible path to acceptance or retirement.

### Archive
Superseded, rejected, obsolete, or historical work retained for traceability. Archived material is not part of the accepted product and should not be referenced by Active code.

### Delete candidate
Material with no continuing operational, historical, testing, or reference value. Deletion should occur only after dependency checks and confirmation that useful history remains available through Git when appropriate.

### Test Freeze
A temporary protection state applied to files, routes, assets, data, workflows, or dependencies involved in a live human test. Test Freeze overrides cleanup convenience: frozen material must not be moved, renamed, refactored, archived, or behaviorally changed during the active test unless a critical defect requires intervention.

## Target repository architecture

```text
/
├── README.md
├── .github/                 # GitHub configuration and accepted CI workflows
├── app/                     # accepted EL8 product implementation
│   ├── pages/
│   ├── components/
│   ├── styles/
│   ├── scripts/
│   └── data/
├── assets/                  # accepted shared production assets
│   ├── brand/
│   ├── icons/
│   └── images/
├── development/             # candidate work not yet accepted
│   ├── discovery/
│   ├── assessments/
│   ├── check-ins/
│   ├── interventions/
│   ├── experiments/
│   └── qa/
├── tests/                   # regression/validation for accepted product
├── docs/                    # repository governance and technical documentation
└── archive/                 # retired repository material
    ├── prototypes/
    ├── superseded/
    ├── experiments/
    └── legacy/
```

The architecture is a target, not permission to move files blindly. Deployment constraints and stable public URLs take precedence. Root entry points may remain at root when required by GitHub Pages or other deployment behavior.

## Promotion lifecycle

Candidate work should normally progress through:

1. Isolated development
2. Automated or synthetic validation
3. Independent or third-party review when warranted
4. Human testing when warranted
5. Resolution of findings
6. Regression validation
7. Promotion into Active

Promotion means the accepted implementation becomes part of the maintained product. Experimental scaffolding, obsolete variants, and temporary QA artifacts should then be archived or deleted as appropriate.

## Human-test protection

The currently distributed Discovery assessment human-test build is under TEST FREEZE until that testing round is formally closed.

During the freeze:
- Do not change public test URLs unnecessarily.
- Do not move or rename Discovery files or their dependencies.
- Do not refactor frozen code merely for repository cleanliness.
- Do not replace the tested build with a different implementation mid-round.
- Critical fixes must be documented so results can distinguish pre-fix and post-fix participants.

After the round closes, Discovery may be migrated into the target architecture only after dependency mapping, route verification, regression testing, and confirmation that any required public URL remains stable.

## Active rules

Active should contain only accepted product behavior and required supporting material. Temporary experiments, abandoned implementations, one-off QA triggers, investigation scripts, and superseded versions do not belong in Active.

Active files should not depend on Archive. Active should not depend on Development unless explicitly documented as a temporary migration exception.

## Development rules

Development work should be grouped by initiative rather than accumulated at repository root. Each initiative should be easy to identify and retire. When an initiative is accepted, promote only what the product needs; do not promote the entire experimental workspace by default.

## Archive rules

Archive preserves useful history without contaminating the active architecture. Archive is not a backup system and should not become a second junk drawer. Prefer Git history over retaining meaningless duplicates.

Archived code must not be part of the deployed application or required by Active tests.

## Branch rules

Use branches for isolated implementation and review. A branch is not a permanent storage location. After work is merged, rejected, or superseded, stale branches should be periodically reviewed and pruned when their history is safely represented elsewhere.

Meaningful checkpoints may be retained deliberately, but checkpoint naming should be explicit.

## Pull requests and validation

Structural migrations should be performed through focused pull requests. Avoid mixing large repository moves with unrelated behavioral changes. Verify deployment and relevant tests after path changes.

Independent review is a distinct validation layer. Self-review does not count as third-party review.

## File movement rules

Before moving or renaming a live file:
1. Identify imports, relative links, asset references, routes, workflow references, test references, and deployment assumptions.
2. Determine whether the file or any dependency is under TEST FREEZE.
3. Update references in the same migration.
4. Run relevant validation.
5. Verify deployed/public behavior when applicable.

## Deletion rules

Do not delete merely because a file looks old. A delete candidate must be checked for dependencies and historical value. Prefer Archive when uncertainty remains. Git history may be sufficient for truly obsolete generated or temporary artifacts.

## Repository root

Keep the root intentionally small. It should contain only essential entry points, top-level configuration, README material, and files that must remain there for deployment or tooling. New experiments should not be added directly to root.

## Documentation authority

This file is authoritative for repository organization and maintenance. `README.md` should remain concise and point here rather than duplicating this policy. If repository practice conflicts with this document, either correct the repository or deliberately amend this document through review.

## Cleanup migration policy

Repository cleanup is performed in controlled stages:
1. Inventory current `main`.
2. Classify files as Active, Development, Archive, Delete Candidate, or TEST FREEZE.
3. Map dependencies and deployment risk.
4. Approve the migration map.
5. Move low-risk material first.
6. Migrate live material only in controlled batches.
7. Validate after each batch.
8. Review stale branches after the file tree is stable.

No current Discovery human-test path is to be moved as part of the initial cleanup migration.