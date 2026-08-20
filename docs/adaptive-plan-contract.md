# EL8 Adaptive Plan Contract v1

Status: implementation contract for the current prototype.

## Information architecture boundary

The member's adaptive plan is a core EL8 system, not a primary navigation destination. The canonical navigation destination formerly called Plan is now **Explore**. Explore contains modules, lessons, practical guidance and discoverable wellness content. Adaptive-plan actions should surface contextually on Home and in focused plan workflows; implementation must not recreate a Plan tab by accident.

## Core model

An EL8 plan is not defined as one primary dimension plus one supporting dimension. The canonical model contains two independent collections:

- `focus_dimensions`: zero or more dimensions that currently deserve active attention.
- `interventions`: zero or more concrete actions. One intervention may support one, several, or all active focus dimensions.

The counts are independent. Three focus dimensions do not imply three interventions. A single high-leverage intervention may support all three.

Legacy `dimension`, `supporting_dimension`, `primary_action`, `supporting_action`, and `actions` fields remain compatibility projections for historical records and older backend surfaces. New member-facing interpretation must use `focus_dimensions` and `interventions` through `plan-model.js`.

## Adaptation

EL8 may narrow, maintain, modify, progress, reprioritize, or expand a plan based on evidence and member capacity. More activity is not inherently better.

Plan review considers outcome signal, adherence, burden/manageability, usefulness, priority change, and evidence from the exact plan version being reviewed.

## Version integrity

Material plan change creates a new immutable version. The prior version is preserved as historical evidence and linked through `parent_plan_id` / review lineage. Continue-without-material-change may retain the same active version.

Plan check-ins are bound to the exact `plan_id`. New check-ins cannot be written to a historical plan version. Evidence from one version is not silently treated as evidence produced by a later version.

## Test isolation

QA plans are identified with `is_test=true` and excluded from member-facing plan queries. Legacy immutable QA reviews remain preserved but are classified by their QA markers and excluded from member history.

The Plan v2 branch matrix is non-persistent. It must not create disposable production-schema plan or review rows because review immutability is a product invariant, not something QA may temporarily disable.

## Member-facing query rule

Any surface requesting the current plan must scope by authenticated `user_id`, `status='active'`, and `is_test=false`, then interpret the returned plan through the shared plan model. Member-facing history must exclude test plans and QA reviews.

## Evidence mapping rule

Daily reports and coverage surfaces may map only evidence sources they actually understand. An active dimension without a dedicated day-level mapping must be shown as unmapped rather than inferred from unrelated logs or converted into filler work for the member.
