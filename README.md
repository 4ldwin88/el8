# EL8 Prototype

`main` is the authoritative working prototype for EL8.

## Repository role

This repository contains the member-facing EL8 prototype and the technical infrastructure required to run, secure, persist, and test it.

Internal project-management surfaces do not belong in this repository.

## MVP scope freeze

The member-facing MVP architecture is frozen as of August 24, 2026. The frozen architecture is the implementation contract for this repository. New primary destinations, tracking catalogs, marketplace mechanics, or other material product expansion should not be added merely because they appear useful. A material scope change requires validation evidence, a newly identified safety/privacy/data-integrity requirement, or an explicit governing authority decision that resolves a genuine gap.

Historical prototypes, experiments, research, and repository artifacts remain useful evidence and implementation history, but they do not override the current EL8 authorities.

## Canonical member information architecture

The MVP uses four bottom-navigation destinations:

- Home
- Plan
- Insights
- Explore

Profile is accessed through the member avatar rather than occupying a bottom-navigation destination. Track is a persistent global floating action rather than a navigation destination.

### Home

Home is the current-day execution surface. It owns the member's immediate priorities, next actions, EL8-initiated evidence requests, due check-ins, and plan-linked daily progress.

Where cumulative daily status materially helps the member act—for example water intake—Home may expose a compact expandable Quick Log showing current progress and richer controls. Home should not become a permanent dashboard of every metric EL8 could collect.

### Plan

Plan is the complete member-facing view of the personalized Active Plan. It explains what the member is working on, why it matters, the relevant actions/commitments, cadence or schedule, and review/adaptation context. A compact calendar or schedule view may live here as a secondary/collapsible surface.

Plan is not a generic task manager. Its contents are generated from governed EL8 assessment, prioritization, intervention, evidence, and adaptation logic.

### Insights

Insights explains what EL8 has learned. It owns understandable qualitative condition, Baseline-versus-Current comparison, dimension-level interpretation, trends, longitudinal graphs, relationships, and progress explanations. Internal quantitative scoring must not be exposed as a member grade.

### Explore

Explore is the discovery surface and is organized around:

- For You
- Learn
- Experts
- Saved

For You prioritizes personalized recommendations. Learn contains modules, lessons, practical guidance, and relevant resources. Experts reserves a coherent MVP home for future/optional professional support without implying that a full provider marketplace, matching, booking, or payment system already exists. Saved contains member-bookmarked Explore content and resources.

### Profile

Profile is reached through the member avatar. It is the member's account and personal-record surface and may contain profile/account details, assessment access/history, broader history, achievements, connections/integrations, membership/subscription controls, notifications, privacy/data controls, language/theme, and other settings.

Profile should remain compact at entry: member image, name, and member identifier must not consume excessive screen space.

### Track

Track is the persistent member-initiated evidence-entry action: “I want to tell EL8 something.”

When opened, Track presents customized Quick Logs first. These are derived from the member's current Active Plan and evidence requirements rather than from a permanent catalog of wellness metrics. Selecting a Quick Log opens the simplest appropriate structured input for that evidence type. For example, sleep duration can use hour and minute controls with 15-minute increments and a single Log action.

Below Quick Logs, Track provides universal capture routes:

- Text field
- Photo/camera
- File attachment
- Audio/voice

Additional structured inputs should appear only when they materially reduce logging burden. Text, voice, photo, and attachments remain universal fallbacks. Any uncertain interpretation must be confirmed before it becomes canonical member data.

Home and Track must use the same underlying evidence model and reusable logging components. Home emphasizes EL8-requested evidence and visible daily progress; Track emphasizes fast member-initiated capture.

## Locked interaction principle

Home asks for what EL8 needs and can show today's progress while collecting richer plan-linked evidence. Track lets the member tell EL8 something as quickly as possible. Plan explains why the evidence matters. Insights shows what EL8 learned from it. Explore helps the member discover relevant knowledge and optional support.

## Supporting workflows

Standalone or secondary flows may support onboarding, Universal Baseline and later assessments/reassessments, check-ins, plan review/history, evidence detail, safety/escalation, privacy/data, account states, reports, and other focused workflows. They are not additional primary navigation destinations.

## Internal infrastructure

Some repository files are intentionally not member navigation surfaces. These include the restricted Admin Console, persistence/test harnesses, Discovery/assessment validation branches or tooling, shared client infrastructure, and technical documentation. Their presence in the repository does not make them part of the member-facing information architecture.

## Repository reconciliation rules

1. Build and organize the repository against the frozen MVP rather than historical screen structure.
2. Preserve functioning infrastructure and validation work unless it conflicts with current authority or is deliberately superseded.
3. Treat old navigation, experimental UI, and obsolete product assumptions as migration candidates—not as product authority.
4. Prefer reusable components and one canonical evidence model over parallel Home/Track logging implementations.
5. Keep assessment, safety, persistence, provenance, confidence, correction, and audit behavior separate from cosmetic UI decisions.
6. Do not delete or rewrite large working files from partial reads. Inspect dependencies before moving or retiring them.
7. Keep experiments and QA isolated from production/member-facing paths where practical.
8. Material deviations from the frozen MVP should be documented before implementation.

## Immediate implementation sequence

1. Inventory current member-facing routes and map each to Home, Plan, Insights, Explore, Profile, Track, or a supporting workflow.
2. Identify obsolete/duplicate navigation and screens without deleting dependencies prematurely.
3. Establish the four-destination shell plus avatar Profile access and global Track action as the canonical shell.
4. Reconcile Home and Track around the shared evidence/logging model.
5. Reconcile Plan as the complete Active Plan destination.
6. Reconcile Insights around Baseline-versus-Current and longitudinal interpretation.
7. Reconcile Explore around For You, Learn, Experts, and Saved.
8. Reconcile Profile and supporting history/assessment/settings flows.
9. Preserve and validate assessment/Discovery, safety, persistence, correction, and audit infrastructure behind the member shell.
10. Run internal and external validation against the frozen scope before expanding it.

## Development rule

Prefer narrow, dependency-aware changes to shared or large files. Do not reconstruct canonical files from partial/truncated reads. Before retiring a page or asset, verify that active routes and dependencies no longer require it.
