# EL8 Discovery v2.7 — Stage Contract

Status: candidate contract for synthetic QA and implementation.

## Purpose

Discovery is a routing and evidence-sufficiency stage. It is not a full assessment and must not manufacture causal certainty.

Its job is to convert member-raised concerns and baseline triggers into an accountable evidence state that tells EL8 what is sufficiently understood, what remains uncertain, and what should be assessed next.

## Inputs

Discovery may receive:

- member-raised concerns from the Discovery gateway;
- documented Universal Baseline triggers;
- warm-start evidence from prior EL8 observations;
- explicit corrections from the member.

Warm-start evidence is a prior, not a fact. Current direct member evidence outranks it.

## Required outputs

For every material member-raised concern, Discovery must produce exactly one terminal disposition before exit:

- `resolved` — enough evidence exists to identify the relevant state/driver hypothesis for downstream routing;
- `linked` — the concern is sufficiently explained by another resolved concern and the relationship is evidence-backed;
- `cleared` — current direct evidence contradicts the concern;
- `deferred` — the question budget or member choice prevented sufficient resolution.

A concern may never disappear silently.

Discovery also outputs:

- ranked hypotheses with confidence/evidence state;
- unresolved uncertainty;
- explicit corrections/contradictions;
- exit reason;
- downstream assessment triggers.

## Evidence rules

1. Member-raised concerns receive routing priority over speculative cross-domain hypotheses.
2. Cross-domain propagation creates hypotheses only. It cannot by itself resolve a concern or establish causality.
3. Direct current evidence outranks propagated evidence and warm-start evidence.
4. A negative direct answer must suppress or clear the contradicted hypothesis rather than merely reduce its rank.
5. Broad concerns require scope evidence before they can resolve.
6. Where knowing the driver could change the next assessment or intervention, driver evidence is required before resolution.
7. `Not sure` is evidence of uncertainty, not evidence for or against a driver.
8. Repeated uncertainty must change question strategy: move from causal questions toward observable impact, frequency, timing, or behaviour.
9. Contradictory evidence triggers clarification or branch clearing before unrelated topic expansion.
10. Multiple simultaneous drivers may coexist. No forced single-cause interpretation.

## State certainty vs driver certainty

Discovery tracks these separately.

- State certainty: confidence that the member is experiencing a meaningful issue.
- Driver certainty: confidence about what is contributing to that issue.

A state can be sufficiently established while its driver remains unknown. In that case Discovery routes to targeted assessment rather than inventing a driver.

## Stopping policy

Discovery stops when the first applicable condition is met:

1. member opts out;
2. all material signals have terminal dispositions and downstream routing is coherent;
3. a healthy/no-material-concern route has been verified;
4. the eight-question fatigue ceiling is reached.

The eight-question ceiling is hard. Any still-open material signals become `deferred` with an explicit reason.

Discovery must not stop merely because one high-scoring hypothesis looks coherent while another member-raised signal remains open.

## Healthy route

A clean or low-concern gateway should receive a short verification route. Healthy members should not be dragged through driver probes simply to fill an evidence graph.

## Contradictions and corrections

When current direct evidence contradicts a prior or propagated hypothesis:

- suppress the contradicted branch immediately;
- reopen any signal that depended on that branch;
- prefer a clarification question when the contradiction materially changes routing;
- do not jump to an unrelated dimension solely because the previous top hypothesis fell.

Explicit member correction has the highest routing priority.

## Downstream boundary

Discovery does not prescribe interventions. It produces triggers for targeted/deep assessment when additional information could materially change safety, priority, confidence, plan, or next action.

The downstream sequence is:

`Universal Baseline → Discovery → Targeted Assessment → Driver/Need Model → Goals & Readiness → Intervention Selection → Active Plan → Logs/Check-ins → Adaptation`

Safety remains upstream of routine prioritization and may interrupt this sequence at any time.

## v2.7 release gates

A candidate build is not releasable unless synthetic QA demonstrates:

- true relevant driver/state appears in Top 3 for at least 85% of truth-bearing scenarios;
- healthy early exit succeeds for at least 85% of healthy scenarios;
- correction recovery succeeds for at least 90% of correction scenarios;
- uncertainty recovery succeeds for at least 75% of uncertainty scenarios with known truth;
- 100% accountability for required member-raised signals;
- 0% silent abandonment of required signals;
- no more than 40% of multi-signal scenarios terminate only because the eight-question budget was exhausted;
- average cross-class route overlap remains at or below 0.65.

Passing aggregate metrics is necessary but not sufficient: any regression that silently drops a member-raised concern is a release blocker.
