# Discovery interpretation — pre-implementation decision

Base: 122a2256e9bf50256578ba55d9f40d9395617b09. The completed source, adapter,
Financial-period and explicit-completion slices are preserved.

Current Drive 02.01.02 and 02.01.06.01 Scoring Guide govern this slice: direct state
is specific to its question/construct scale; context, contributors, uncertainty
and constraints cannot create condition evidence; contradictory required state
cannot be averaged or resolved by majority. Source observations remain immutable.

Observed defect: runtimeEffect converts categorical STATE into generic +1 support,
converts CONTEXT/FACET to generic support, and drops other effect classes. The
construct projection then sums/clamps those invented strengths, drops state values,
and supplies member relationship confidence/direction defaults. This occurs before
lossless persistence. The complete source records now exist in registryEvidence.

Minimum repair: remove runtimeEffect and derive directly from each observation's
captured registry records. No second executable registry and no current registry
lookup during projection. Keep state/facet/context/relationship/uncertainty records
separate with observation/fact/question provenance. An explicit direct-state
conflict blocks sufficiency; contributor context never creates another construct
or causal direction. Remove additive confidence fields and the unused clamp helper.
The sole non-registry production effect producer is the existing importance/triage
command; preserve that typed command. Generic evidence effects have no remaining
production producer once runtimeEffect is removed; reject that obsolete format
explicitly rather than reconstructing source semantics. Ordinary Member State
storage still preserves historical documents without interpretation. No live data
is migrated. Explicit draft reacquisition/migration handling remains a later gate.

Owners: observationNormalizer captures source; construct-projection interprets it;
orientation-session presents explicit resolution; discovery-member-state-adapter
projects derived state atomically. Current graph/Planning consumers must not infer
member evidence merely from context references. Two test files create obsolete
synthetic evidence effects; migrate their setup to actual registry observations
without relaxing their behavior assertions. No change to Prioritization rules,
Plan contracts, Safety disposition or immutable-baseline timing is authorized by
this slice. Plan-targeted constraints stay losslessly in source facts pending the
one Planning consumption boundary; do not misattribute them to a construct.

Acceptance before repair: opposite Sleep values remain distinct in derived state;
context/relationship-only answers cannot establish a condition; reported relationship
has unknown confidence/direction and intact provenance; opposite answers to the
same direct question block handoff with both observations retained; no additive
confidence fields; retired generic evidence fails explicitly. Run actual mapper,
SQL and existing runtime/Planning tests plus the canonical gate.

## Verification and self-review

All four initial acceptance tests failed on 122a225. The repaired scoped run passes
40/40, including eight interpretation tests, completion tests, real registry-backed
Planning fixtures and lossless storage. The canonical offline gate passes 374 of
375 tests; its sole failing test remains mixed-focus-plan-regression and the same
nine HTML imports remain broken. Disposable PostgreSQL replay, writer ownership,
CAS/retry and immutable-observation tests pass within that gate. No hosted Auth
result is claimed for this slice, and no release validation receipt is emitted.

Self-review found and fixed two additional propagation risks: graph node support
was inferred from any reference, and mapper allowlisting dropped categorical
views. State support now requires direct state records; context references stay
provenance only. The mapper retains the derived categorical views and their fact
references. Unknown answers to a previously answered direct question also block
sufficiency; optional contributor uncertainty does not become that condition.
Repeated answers neither add confidence nor outvote a conflicting answer. Tests
verify actual mapper/storage round trips and preserved source records.

No copied registry, numeric score, compatibility interpreter or additional writer
was introduced. Historical generic observations remain readable through ordinary
storage but cannot be silently interpreted by current Discovery. Reacquisition,
explicit correction/supersession and cross-question conflict disposition are
remaining contracts; this change does not invent them. Existing typed fit commands
remain separate from registry-derived sourceEvidence; Plan-targeted constraints
remain in immutable source facts pending the Planning consumer repair. Confidence
labels concern reported state, not clinical truth, causal confidence or readiness.

Unchanged adjacent blockers: concern disposition persistence, global required-gap
persistence, immutable completed-Discovery baseline, population/member relationship
separation, Prioritization, Plan activation, Review and the real browser journey.
This slice improves evidence interpretation; it does not establish human-test readiness.
