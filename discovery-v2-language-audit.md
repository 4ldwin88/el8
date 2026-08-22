# Discovery v2 — Member-Facing Language Audit

Status: COMPLETE — issues identified before human pilot

## Overall finding
The bank is materially simpler than the earlier human-test versions, but it is not yet ready to freeze unchanged. Most questions are plain and short. The main remaining problems are semantic scale mismatch, a few abstract words, and correction/bridge questions that sound more technical than normal conversation.

## Pass — already plain enough
These are acceptable for a first pilot without material rewriting:
- G1 — What’s been bothering you lately? Select any that fit.
- D1 — If one thing improved this week, what would help most?
- D3 — When the problem shows up, what gets affected first?
- D4 — Is this mostly one problem or several things piling up?
- D5 — What takes up the most mental space lately?
- W2 — Are you worried that your work, hours, role, or income could change soon?
- W3 — What part of work or school is hardest right now?
- SC1 / SC2
- M1–M4
- R1–R3
- S1–S3
- SL1–SL3
- E1 / E2
- ST1 / ST2
- F1 / F2
- H2
- P1
- HV1 / HV2
- X1

## Fix before pilot

### 1. Generic positive/strain scale does not semantically fit every question
The shared scale is: Very well / Okay / Not great / Really struggling / Not sure.

It works for questions such as “How has your sleep been lately?” but is awkward for:
- “How stable does work or school feel right now?”
- “How has your stress been?”
- “How easy has it been to focus on what you need to do?”
- “Does daily life feel meaningful enough to you right now?”

Required fix: use question-specific labels while preserving the same evidence weights. Never let implementation convenience determine member-facing answer semantics.

### 2. D2 is too abstract
Current: “Does the main problem feel more outside you or inside you?”

Problem: “outside you / inside you” requires interpretation and can feel psychological.

Preferred: “Is this mostly about something happening in your life, how you’ve been feeling, or both?”
Options: Something happening in my life / How I’ve been feeling / Both / Not sure.

### 3. H1 has a semantic mismatch
Current: “How supportive does your home environment feel?” with Very well / Okay / Not great / Really struggling.

Preferred: “How is your home situation working for you right now?”
The existing general wellbeing scale then fits more naturally, or use: Very well / Mostly okay / Not very well / Very poorly / Not sure.

### 4. P2 is more abstract than needed
Current: “Does daily life feel meaningful enough to you right now?”

Preferred: “How good do you feel about what you’re working toward right now?”
Use a matching scale rather than the generic struggle scale.

### 5. B1 uses the word “upstream”
Current: “Which feels more upstream right now?”

This is internal architecture language and should never appear to a member.

Preferred: “Which seems to be causing more of the other right now?”

### 6. B2 uses causal phrasing but is acceptable after simplification
Current: “Which seems to come first most often?”

Keep question. Simplify options to: Stress usually comes first / Poor sleep usually comes first / They affect each other / Not sure.

### 7. B3 is overloaded
Current question contains two competing clauses and requires the member to parse a causal distinction.

Preferred: “When you feel unsupported, is it mostly because of problems with people close to you?”
Options: Mostly yes / Mostly no / Both seem connected / Not sure.

### 8. C1 sounds like system analysis
Current: “That does not fully match the earlier picture. Which answer feels more accurate now?”

Preferred: “Your answers point in two different directions. Which feels closer to what you mean?”
Options should reference the actual conflicting answers dynamically in production. Static “earlier/newer” labels are acceptable only for simulator QA, not human pilot UI.

### 9. C2 correction is incomplete
Current correction options cover several drivers but not sleep, energy, stress, focus, or schedule. A member must be able to reject whatever EL8 is currently focusing on.

Required behavior: generate the correction option dynamically from the active hypothesis, e.g. “No, that’s not really the issue.” Correction should immediately suppress that hypothesis and change the next route.

## Multi-select audit
G1 is correctly multi-select and should remain broad. “Something else” and “Not sure” must be exclusive choices: selecting either clears substantive selections; selecting a substantive option clears “Something else” and “Not sure.” The UI must also allow either exclusive option to be toggled off. This behavior is a human-test release gate because it previously failed in testing.

All later questions should remain single-select unless a specific semantic reason requires multiple answers. Discovery should use G1 for broad capture, then discriminate rather than repeatedly asking wall-of-options questions.

## Vocabulary rule for pilot
Prefer common spoken English. Avoid architecture terms such as upstream, hypothesis, driver, dimension, discriminator, candidate, evidence, causal, or intervention in member-facing copy. Aim for a question that can be understood on first reading without explanation.

## Pilot freeze recommendation
Make the fixes above, then freeze the question wording for the first 3–5-person pilot. Do not continue polishing copy during the pilot unless an objective defect prevents completion. Record comprehension problems and revise them together after the pilot so route comparisons remain meaningful.
