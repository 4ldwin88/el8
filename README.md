# EL8 Prototype

Current version: **v0.16**  
Status: **Working prototype / Member Zero validation**

This repository contains the mobile-first EL8 interface prototype. It tests product architecture, interaction concepts, information hierarchy, and the current visual direction. Prototype behavior remains subordinate to the EL8 Concept Authority and Product & App Blueprint.

## Interactive prototype entry points

- `index.html` — current EL8 product prototype shell.
- `baseline.html` — **interactive Universal Baseline v0.4** prototype. This is a real browser-based six-screen flow, not a static design mockup. It includes timing, structured controls, conditional result logic, local browser persistence for the demo, and a completion summary.

## Governing hierarchy

1. **EL8 Concept Authority**
2. **EL8 Product & App Blueprint**
3. **Design System & Component Specifications**
4. **Prototype**
5. **Implementation**

If this prototype conflicts with a higher-level governing document, the higher-level document governs.

## Current product direction

- Official dimensions: **Physical, Emotional, Intellectual, Social, Spiritual, Occupational, Financial, Environmental**.
- Member-facing state is qualitative rather than a universal numerical wellness score.
- Navigation hypothesis: **Home / Plan / + / Insights / Me**.
- Quick Add is universal capture for check-ins, expenses/logs, notes, photos, voice, and progress.
- Assessments use progressive disclosure and should preserve progress.
- Longer optional assessments may show estimated completion time and participation Points before starting.
- Points reward useful participation and honest completion, never desirable answers or preferred outcomes.
- Points and future tangible-value Credits remain separate concepts; Credit economics are not approved.
- Recommendations use compact **What → Why → Next Step** reasoning.
- Architecture direction remains **local-first, AI-enhanced**.
- Accessibility target remains **WCAG 2.2 AA** where applicable.
- Public prototype content must not expose sensitive Member Zero data.

## Current visual direction

Concept 1 / Continuous Flow remains the preferred exploration direction: warm ivory default interface, EL8 Ink, Solar Gold accent, restrained functional dimension colors, generous whitespace, and low visual clutter. Branding remains exploratory.

## Changelog

### v0.16 — 2026-08-17

Interactive Universal Baseline prototype pass.

- Added `baseline.html` as a functioning six-screen Universal Baseline v0.4 prototype.
- Replaced serial-chat interaction assumptions with grouped form controls suitable for actual burden testing.
- Added an in-session completion timer.
- Added structured consent/profile, compact safety routing inputs, eight-dimension life scan, combined prioritization screen, readiness/feasibility, and material-constraint capture.
- Added explicit handling for No / Yes / Unsure safety responses without pretending the prototype implements final safety routing.
- Added simple demonstration-only primary/supporting output logic while preserving that final prioritization rules remain governed elsewhere.
- Added browser-local demo persistence only; no Member Zero private data is committed to the repository.

### v0.15 — 2026-08-16

Member Zero live-plan and Financial deepening pass.

- Corrected the prototype state to show **Member Zero is already underway** rather than waiting for an August 17 start.
- Rebuilt Home around the current primary Financial focus, Physical supporting focus, and Occupational dependency pathway.
- Added a Financial plan sequence: **stabilize → measure → earn → repay**.
- Added expense capture to Quick Add so the real monthly burn rate can be learned prospectively.
- Added the assessment-reward hypothesis: estimated time plus participation Points before longer optional modules.
- Explicitly separated participation Points from future tangible-value Credits.
- Added save/resume direction for longer assessments.
- Added the product principle that rewards are based on participation, not desirable answers or wellness outcomes.
- Added the distinction between financial risk tolerance and financial risk capacity.
- Added Financial privacy/system-of-record language: specialist financial systems may hold source data while EL8 performs interpretation, planning, and coordination.
- Kept private Member Zero balances out of the public prototype and used qualitative/demo-safe financial language instead.
- Preserved qualitative states, eight-dimension architecture, Quick Add, local-first/AI-enhanced direction, and mobile-first visual language.

### v0.14 — 2026-08-16

External-review refinement and prototype traceability pass.

- Added visible version/status identification.
- Added qualitative directional context without restoring universal numerical scores.
- Refined Insights around meaningful context and raw measurements.
- Reworked check-ins around rotating micro-prompts and progressive disclosure.
- Clarified post-entry classification and planned dark-mode direction.

### v0.13 — 2026-08-16

Blueprint-alignment pass.

- Replaced numerical life/dimension scoring with qualitative state concepts.
- Rebuilt the whole-person view around the official eight dimensions.
- Added the experimental EL8 Ring.
- Introduced Home / Plan / + / Insights / Me navigation and universal Quick Add.
- Added What → Why → Next Step recommendations and local-first / AI-enhanced direction.

## External review rule

External reviews should identify the exact prototype version. Feedback describing behavior absent from that version should be treated as feedback on another build or visual concept.

## Repository rule

Meaningful prototype changes should update both the visible prototype version and this changelog. Public prototype content must remain demonstration content; do not commit sensitive member or personal data.
