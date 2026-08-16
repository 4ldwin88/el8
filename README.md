# EL8 Prototype

Current version: **v0.13**  
Status: **Working prototype / concept validation**

This repository contains the mobile-first EL8 interface prototype. It is used to test product architecture, interaction concepts, information hierarchy, and the current visual direction before implementation decisions are treated as approved product specifications.

## Governing hierarchy

1. **EL8 Concept Authority** — governs what EL8 is and the non-negotiable concept baseline.
2. **EL8 Product & App Blueprint** — governs how the concept is expressed as a digital product.
3. **Design System & Component Specifications** — reusable visual and interaction standards.
4. **Prototype** — demonstrates approved or explicitly experimental behavior.
5. **Implementation** — production software built from approved specifications.

If this prototype conflicts with a higher-level governing document, the higher-level document governs.

## Current product direction

- Official eight dimensions: **Physical, Emotional, Intellectual, Social, Spiritual, Occupational, Financial, Environmental**.
- Subdimensions such as movement, nutrition, sleep, and recovery sit beneath their official dimension rather than replacing top-level dimensions.
- Member-facing state is currently being explored qualitatively rather than through universal 0–100 life or dimension scores.
- Current navigation hypothesis: **Home / Plan / + / Insights / Me**.
- The central **+** is being explored as universal capture for check-ins, logs, notes, photos, and voice.
- Check-ins should be simple, intuitive, seamless, and progressively disclose follow-up questions only when useful.
- Recommendations are being explored through a compact **What → Why → Next Step** pattern.
- Core architecture direction: **local-first, AI-enhanced**. Basic product operation should not depend on AI or constant connectivity when technically reasonable.
- Accessibility target: **WCAG 2.2 AA** for applicable interfaces.

## Current visual direction

The preferred concept-design direction is **Concept 1 / Continuous Flow**.

Working characteristics:
- warm ivory default/light theme;
- EL8 Ink typography and dark surfaces;
- Solar Gold primary brand accent;
- restrained functional colors for the eight dimensions;
- continuous eight-part EL8 emblem;
- generous whitespace and low visual clutter;
- dark mode as an alternative appearance;
- color is never the sole carrier of meaning.

Branding remains exploratory and is not yet a final production identity.

## Prototype status

The prototype is intentionally allowed to contain experimental behavior. A mockup or implemented interaction does **not** become an approved EL8 product rule merely because it appears here.

Internal maturity states used by the Blueprint are:

**PROPOSED → PROTOTYPE → VALIDATED → APPROVED → DEPRECATED**

## Versioning

Prototype versions use lightweight pre-release numbering (`v0.xx`). A version should be incremented when a meaningful product, UX, information-architecture, or visual-design iteration is published.

The README changelog records the purpose and major changes of each meaningful prototype version. Git commit history remains the detailed technical record and should not be duplicated here.

## Changelog

### v0.13 — 2026-08-16

Blueprint-alignment pass.

- Replaced numerical life/dimension scoring with qualitative state concepts.
- Rebuilt the whole-person view around the eight official EL8 dimensions.
- Added an experimental eight-segment **EL8 Ring** with current focus in the center.
- Correctly nested movement, nutrition, sleep, and recovery beneath Physical.
- Changed primary navigation from `Today / Plan / Progress / EL8` to the proposed `Home / Plan / + / Insights / Me` model.
- Added universal Quick Add concept.
- Added a low-friction 10-second check-in concept with progressive follow-up behavior.
- Reframed Insights around meaning, direction, patterns, and context rather than numerical scores.
- Added the proposed **What → Why → Next Step** recommendation presentation.
- Added explicit local-first / AI-enhanced product messaging.
- Added accessibility and non-color semantic cues to the prototype direction.
- Continued the warm ivory / Ink / restrained dimension-color visual direction.

### v0.12

Earlier mobile-first prototype iteration.

- Established a strong daily-focus information hierarchy.
- Explored low-cognitive-load navigation and guided plan presentation.
- Used `Today / Plan / Progress / EL8` navigation.
- Pre-dated the current Blueprint alignment and is retained only as historical prototype context.

## Repository rule

When a meaningful prototype update changes the visible product concept, update both the prototype version and this README changelog in the same development pass.

Public prototype content must remain demonstration content. Do not commit sensitive member or personal data to this repository.
