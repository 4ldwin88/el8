# EL8 Prototype

`main` is the authoritative working prototype for EL8.

## Repository role

This repository contains the member-facing EL8 prototype and the technical infrastructure required to run, secure, persist, and test it.

Internal project-management surfaces do not belong in this repository.

## Canonical member information architecture

The member experience is organized around five primary destinations:

- Home
- Explore
- Track
- Insights
- Profile

**Home** is the member's current-day surface: quick logging, current evidence, check-ins, and contextually relevant adaptive-plan actions.

**Explore** is the learning and discovery destination for modules, lessons, practical guidance, recommended resources, and dimension-based content.

**Track** is where members deliberately record and review logs and tracked events.

**Insights** interprets patterns, relationships, progress, and the member's broader wellness picture.

**Profile** is the member's personal EL8 hub and record, not merely account settings. Its working information architecture is:

- Overview
- Saved
- History
- Achievements
- Assessments
- Goals
- Rewards
- Reports
- Connections
- Settings & Data

Overview is the Profile landing surface. Saved contains member-saved Explore content and resources. History contains meaningful historical EL8 records and activity. Achievements and Rewards remain distinct: achievements represent milestones/accomplishments, while rewards represent points, credits, benefits, or redemption systems. Assessments contains the immutable Universal Baseline and later assessments/reassessments. Goals contains active and historical goals. Reports contains member-facing summaries and future share/export reports. Connections contains integrations, devices, apps, and future connected services/providers. Settings & Data contains preferences, measurement settings, notifications, privacy, permissions, export/deletion, and account administration.

The member's **adaptive plan** remains a core EL8 feature, but it is not a primary navigation destination. Plan actions surface contextually on Home and through focused workflows such as plan check-in, plan review, plan history, and plan evidence. The word “Plan” should therefore describe the member's personalized adaptive plan, not a tab or navigation destination.

Standalone pages support onboarding, assessment/deepening, check-ins, adaptive-plan review/history/evidence, safety, privacy/data, account states, reports, and other focused workflows.

## Internal infrastructure

Some repository files are intentionally not member navigation surfaces. These include the restricted Admin Console, persistence/test harnesses, shared client infrastructure, and technical documentation. Their presence in the repository does not make them part of the member-facing information architecture.

## Development rule

Prefer narrow, dependency-aware changes to shared or large files. Do not reconstruct canonical files from partial/truncated reads. Before retiring a page or asset, verify that active routes and dependencies no longer require it.
