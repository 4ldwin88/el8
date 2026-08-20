# EL8 Prototype

`main` is the authoritative working prototype for EL8.

## Repository role

This repository contains the member-facing EL8 prototype and the technical infrastructure required to run, secure, persist, and test it.

Internal project-management surfaces do not belong in this repository.

## Canonical member information architecture

The member experience is organized around five primary destinations:

- Home
- Plan
- Track
- Insights
- Me

Standalone pages support onboarding, assessment/deepening, check-ins, plan review, history, safety, privacy/data, account states, reports, and other focused workflows.

## Internal infrastructure

Some repository files are intentionally not member navigation surfaces. These include the restricted Admin Console, persistence/test harnesses, shared client infrastructure, and technical documentation. Their presence in the repository does not make them part of the member-facing information architecture.

## Development rule

Prefer narrow, dependency-aware changes to shared or large files. Do not reconstruct canonical files from partial/truncated reads. Before retiring a page or asset, verify that active routes and dependencies no longer require it.
