# EL8 Plan Engine v1 — Member Zero Validation

Status: READY TO RUN — controlled human validation
Branch: `plan-engine-v1`
Production merge: prohibited during this gate

## Purpose
Test whether the Plan Engine produces a small, understandable and realistically actionable plan from a real Discovery result. This is product validation, not evidence of clinical or wellness efficacy.

## Method
1. Run Member Zero through the existing Discovery flow honestly, without trying to produce a particular plan.
2. Freeze the resulting Discovery evidence before viewing Plan Engine output.
3. Before revealing the generated plan, record a simple expectation: what 1–2 commitments would a reasonable planner probably prioritize from the Discovery result?
4. Generate the Plan Engine result in shadow mode. Do not write it into the live member plan.
5. Review each active commitment and answer the evaluation questions below.
6. Test at least one rejection/defer path so backlog replacement behavior is observed.
7. Record defects and disagreements. Do not tune the engine merely to match Member Zero preference unless the disagreement exposes a generalizable rule or defect.

## Evaluation questions
For each active commitment rate:
- Relevance: Does this address an important current problem? Yes / Partly / No
- Actionability: Could you realistically do this at the proposed cadence? Yes / Partly / No
- Burden: Too easy / Appropriate / Too demanding
- Clarity: Immediately understandable? Yes / No
- Preference: Accept / Later / Not for me

Then answer:
- Did EL8 miss an obviously better commitment? Yes / No; if yes, what?
- Did anything feel unsafe, intrusive, patronizing or impractical? Yes / No; if yes, what?
- Did the number of active commitments feel right? Too few / Right / Too many
- Was Daily vs This Week cadence clear? Yes / No
- Did the replacement after rejection/defer make sense? Yes / Partly / No

## Pass rule for H1
H1 passes provisionally when:
- no safety or eligibility failure occurs;
- no active commitment lacks traceable Discovery support;
- all active commitments are at least Partly relevant and Partly actionable;
- there is no obviously superior omitted commitment that reveals a general ranking defect;
- rejection/defer does not produce an obviously unsuitable replacement; and
- Member Zero can understand the plan without explanation of internal scoring.

A preference disagreement alone is not a failure. A systematic ranking, safety, eligibility, cadence or burden defect is.

## Evidence record
Capture:
- Discovery result/version
- Plan Engine commit SHA
- active commitments and backlog order
- Member Zero ratings and comments
- rejection/defer result
- defects found
- H1 verdict: PASS / PASS WITH CONDITIONS / FAIL

## Boundary
One-person testing is sufficient for this early H1 gate because its purpose is to find obvious product and logic failures before broader validation. It cannot establish population effectiveness, optimality, safety for all users, or marketing claims. Synthetic/adversarial QA remains separate evidence.
