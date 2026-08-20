# EL8 Prototype

Current version: **v0.25**  
Status: **Authoritative working prototype / Member Zero validation**

The current `main` branch is the authoritative implementation baseline for prototype behavior and UI as of 2026-08-19. Future prototype work should move forward from this state rather than reconstructing shared files from older commits. The prototype remains subordinate to the EL8 Concept Authority and Product & App Blueprint for product doctrine.

## Current member information architecture

Primary navigation: **Home · Plan · [EL8] Track · Insights · Me**.

- **Home** — collapsible Quick Log, Daily Check-in state, current Plan and concise reasoning. Completed Daily Check-ins leave the active area and move into a collapsed Completed Today section.
- **Quick Log** — Water, retrospective Sleep, Mood, Energy and Weight. Water, Mood, Energy and Weight can complete for the day and move into the nested Completed Today disclosure. Sleep remains continuously available because more than one sleep period may be logged.
- **Plan** — account-backed active actions, review schedule and current priority, with truthful empty states when no active plan exists.
- **Track** — central universal capture. Text, Photo and Voice are communication methods rather than tracker silos. Inference-bearing entries require confirmation/correction before confirmed structured persistence.
- **Insights** — account-backed eight-dimension visualization with **Baseline / Current / Both**, four qualitative condition bands and dimension detail/evidence routing.
- **Me** — member identity, Profile, Achievements, History, Saved, Manage Subscription, one Settings route, Privacy & Data and Sign Out. Settings owns persisted Light/Dark appearance controls. Admin Console remains authorization-restricted.

## Condition architecture

EL8 keeps four concepts distinct:

- **Condition** — Attention / Stable / Healthy / Thriving.
- **Trajectory** — Improving / Steady / Declining / Unclear.
- **Priority** — how much active EL8 attention the dimension warrants.
- **Safety** — independently determines whether ordinary wellness guidance is appropriate.

The four condition bands are qualitative, not a disguised numerical wellness grade. Thriving is descriptive, not a universal goal. Legacy labels may be normalized for display; **Beyond is legacy and Thriving is the current highest condition label.**

## Time and record model

- Baseline is the original validated starting snapshot and is never overwritten.
- Current is EL8's best-supported present condition and changes only when evidence/confidence justifies a change.
- Reassessment snapshots are retained as dated historical checkpoints.
- Formal condition history is monthly by default in the current design direction.
- Submitted Daily and Weekly Check-ins are immutable historical records.
- Completed assessment sessions are immutable.
- Canonical tracking entries use the revision/correction pathway for material corrections.
- Plan check-ins, plan reviews, focus clarifications and emotional deepening submissions are append-only historical observations.

## Brand direction

- Canonical brand name: **EL8** (pronounced “elate”).
- Current tagline: **Life, in balance.**
- Core prototype palette: **Gold #D6A648 · Ivory #F7F3EA · Ink #121417**.
- The approved vector emblem is `assets/brand/el8-mark.svg` and is the central Track affordance.

## Product principles retained

- Official dimensions: **Physical, Emotional, Intellectual, Social, Spiritual, Occupational, Financial, Environmental**.
- Qualitative member-facing interpretation; no prominent universal numerical wellness grade.
- Universal capture is the front door to structured longitudinal records.
- AI-derived, transcribed, classified or estimated information remains provisional when materially uncertain until member confirmation/correction.
- Recommendations use compact **What → Why → Next Step** reasoning with deeper evidence available on demand.
- Cross-dimensional observations are patterns/possible relationships unless causation is independently justified.
- Architecture direction remains **local-first, AI-enhanced**.
- Accessibility target remains **WCAG 2.2 AA** where applicable.
- Public prototype content must not expose sensitive Member Zero data.
- EL8 should absorb complexity so the member does not have to.

## Prototype maintenance rule

The v0.25 `main` implementation is the reference point for subsequent implementation work. Before replacing or restoring a large shared file such as `app.html`, compare against current `main` and preserve unrelated working surfaces. Prefer narrow component-level changes over whole-file restoration from historical commits.

When a feature is confirmed working in Member Zero testing, changes to shared Home, Plan, navigation, Insights, Me, Settings or persistence should be checked for regressions across the other shared surfaces before being treated as complete.

## Member 1 boundary

Member 1 remains a controlled external test, not a public launch. Visual polish does not supersede the formal Member 1 safety, privacy, persistence-integrity, prioritization, reporting and decision-reconstruction gates.

## Changelog

### v0.25 — 2026-08-19

Member Zero interaction and prototype-stability pass.

- Added persistent, collapsible Quick Log with Water, retrospective Sleep, Mood, Energy and Weight.
- Added nested Quick Log Completed Today behavior while keeping Sleep continuously available.
- Added retrospective sleep entry using start and end times rather than a foreground timer.
- Connected Daily Check-in to persistent storage and corrected timestamp/schema handling.
- Moved completed Daily Check-in from the active Home area into collapsed Completed Today.
- Restored the approved bottom navigation after regression testing.
- Restored account-backed Insights with Baseline / Current / Both and four qualitative condition bands.
- Consolidated Me to one Settings route and restored persisted Light/Dark appearance behavior.
- Established current `main` as the authoritative prototype implementation baseline.

### v0.24 — 2026-08-19

Persistence, security and consistency pass: database immutability for submitted check-ins and completed assessments; hardened access controls; account-aware Privacy & Data; explicit Coming Soon surfaces; Thriving normalization; linked dimension detail; persisted Plan state; and immutable-history-aligned check-in UI.

### v0.23 — 2026-08-18

Condition/history model pass: four condition bands, separation of Condition/Trajectory/Priority/Safety, immutable Baseline, best-supported Current, monthly reassessment direction and qualitative dimension history.

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
4. **Current `main` prototype implementation**
5. **Historical prototype commits and implementation references**

For implementation behavior, current `main` is authoritative unless a higher-level governing document explicitly requires a change.