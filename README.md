# EL8 Prototype

Current version: **v0.23**  
Status: **Working prototype / Member Zero validation**

This repository contains the mobile-first EL8 interface prototype. It remains subordinate to the EL8 Concept Authority and Product & App Blueprint.

## Current member information architecture

Primary navigation: **Home · Plan · [EL8] Track · Insights · Me**.

- **Home** — Today's Plan, concise expandable reasoning/“Why this today?”, contextually relevant learning, and only a small status element where useful.
- **Plan** — Actions, Schedule organized as Today / This Week / Later, and current priorities. Completed actions remain in context and are crossed out/faded when checked rather than moved into a separate completed area.
- **Track** — central universal capture. Text, Photo and Voice are communication methods rather than tracker silos. Inference-bearing entries require confirmation/correction before confirmed structured persistence.
- **Insights** — whole-person comparison plus linked dimension detail. The working qualitative condition model is four bands: **Attention · Stable · Healthy · Thriving**. Target is removed from condition visualization. Baseline is immutable; Current is the best-supported present condition. Dimension detail carries trajectory and longitudinal history.
- **Me** — Profile, Achievements, History, Saved, Manage Subscription, Settings, Privacy & Data and Sign Out. Admin Console remains authorization-restricted.

## Condition architecture

EL8 keeps four concepts distinct:

- **Condition** — Attention / Stable / Healthy / Thriving.
- **Trajectory** — Improving / Steady / Declining / Unclear.
- **Priority** — how much active EL8 attention the dimension warrants (for example primary, supporting, monitor).
- **Safety** — independently determines whether ordinary wellness guidance is appropriate.

The four condition bands are a working member-facing vocabulary pending external comprehension testing. They are qualitative bands, not a disguised 1–4 wellness score. **Thriving is descriptive, not a universal goal.** Stable may be entirely appropriate for a dimension that does not warrant additional optimization.

## Time model

- **Baseline** is the original validated starting snapshot and is never overwritten.
- **Current** is EL8's best-supported present condition and should change only when sufficient evidence/confidence justifies a change.
- **Reassessment snapshots** are retained as dated historical checkpoints.
- Formal condition history is **monthly by default** in the current design direction. Continuous/weekly evidence may inform Current and Trajectory without forcing weekly condition-band changes.
- Detailed dimension pages show the original Baseline and Current on one segmented condition bar and provide a qualitative history line chart across formal reassessments.
- History chart positions map internally to ordered display bands only for rendering; the member-facing axis remains Attention / Stable / Healthy / Thriving rather than numerical scores.

## Brand direction

- Canonical brand name: **EL8** (pronounced “elate”).
- Current tagline: **Life, in balance.**
- Core prototype palette: **Gold #D6A648 · Ivory #F7F3EA · Ink #121417**.
- Domains/TLDs are not part of the brand name.
- The approved vector emblem is committed at `assets/brand/el8-mark.svg` and is the central Track affordance.
- Typography remains technically provisional pending final typeface selection/licensing and outlined wordmark production.

## Product principles retained

- Official dimensions: **Physical, Emotional, Intellectual, Social, Spiritual, Occupational, Financial, Environmental**.
- Qualitative member-facing interpretation; no prominent universal numerical wellness grade.
- Universal capture is the front door to structured longitudinal records.
- AI-derived, transcribed, classified or estimated information remains provisional when materially uncertain until member confirmation/correction.
- Recommendations use compact **What → Why → Next Step** reasoning with deeper evidence available on demand.
- Cross-dimensional observations must be described as patterns/possible relationships unless causation is independently justified.
- Architecture direction remains **local-first, AI-enhanced**.
- Accessibility target remains **WCAG 2.2 AA** where applicable.
- Public prototype content must not expose sensitive Member Zero data.
- EL8 should absorb complexity so the member does not have to.

## Member 1 boundary

Member 1 remains a controlled external test, not a public launch. Visual polish does not supersede the formal Member 1 safety, privacy, persistence-integrity, prioritization, reporting and decision-reconstruction gates.

## Changelog

### v0.23 — 2026-08-18

Condition/history model pass.

- Adopted four working condition bands: Attention / Stable / Healthy / Thriving.
- Separated Condition, Trajectory, Priority and Safety conceptually.
- Removed Target from the condition-history model.
- Defined Baseline as immutable and Current as the best-supported present condition.
- Defined formal monthly reassessment snapshots without overwriting Baseline.
- Rebuilt dimension detail around Baseline/Current markers, trajectory, priority, monthly qualitative history, subdimensions, evidence/reasoning and relevant actions.
- Preserved non-numerical member-facing labels on the history visualization.

### v0.22 — 2026-08-18

Introduced real account-aware Insights charting and explicit handling of missing data rather than fabricated values.

### v0.21 — 2026-08-18

Simplified Insights hierarchy and moved the member avatar to the Me navigation position.

### v0.20 — 2026-08-18

Account-awareness, dimension detail routing, functional Me destinations and Light/Dark appearance pass.

### v0.19 — 2026-08-18

Brand and member-information-architecture pass establishing Home / Plan / Track / Insights / Me and the EL8 visual direction.

## Governing hierarchy

1. **EL8 Concept Authority**
2. **EL8 Product & App Blueprint**
3. **Design System & Component Specifications**
4. **Prototype**
5. **Implementation**

If this prototype conflicts with a higher-level governing document, the higher-level document governs.
