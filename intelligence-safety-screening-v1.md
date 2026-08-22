# EL8 Adaptive Safety Screening v1

## Purpose
Detect material safety concerns without turning ordinary EL8 interactions into a conspicuous clinical checklist.

## Non-negotiable rule
Indirect questions may be used for low-friction signal detection, but EL8 must not rely on disguised or euphemistic wording to establish acute risk. If indirect evidence crosses a safety threshold, the system transitions to clear, direct, respectful confirmation questions. Accuracy takes precedence over keeping the safety purpose hidden.

## Layered pattern
1. Passive evidence: recent logs, abrupt changes, repeated negative trends, corrections, opt-outs, language/context signals where permitted.
2. Natural contextual probes: questions that belong naturally in Discovery and assess manageability, control, functioning, connection, sleep, impulsivity, or feeling overwhelmed.
3. Safety threshold: multiple converging signals or one sufficiently strong signal opens explicit safety confirmation.
4. Direct confirmation: concise questions establishing immediate danger, intent, ability to stay safe, and whether urgent human support is needed.
5. Escalation: safety output bypasses ordinary prioritization when required.

## Example low-friction probes
These are not substitutes for direct acute-risk screening.

- "When things have been at their worst lately, how manageable have they felt?"
  Options: Still manageable / Hard, but I can handle it / Sometimes feels out of control / I’m not sure

- "How much have you felt able to trust your decisions lately?"
  Options: About as usual / A little less than usual / Much less than usual / It varies a lot

- "When you’re overwhelmed, what tends to happen first?"
  Options: I slow down or withdraw / I get restless or impulsive / I stop taking care of basics / I feel trapped or unable to cope / Something else

- "How connected have you felt to people you could actually turn to if things got rough?"
  Options: Well connected / Someone is available / Not very connected / I don’t really have anyone

- "Has there been a point recently when getting through the day felt like more than you could manage?"
  Options: No / Briefly / More than once / Yes, and it still feels that way

## Design safeguards
- Never score a benign answer as proof of safety.
- Never infer acute danger from one ambiguous lifestyle answer alone.
- Do not bury direct confirmation when evidence indicates potentially imminent harm.
- Member correction overrides inference and triggers model recalculation.
- Safety evidence retains provenance so EL8 can explain why a confirmation was asked.
- Safety questions should be sparse and context-sensitive, not mechanically inserted into every session.
- Evaluate false-negative rate, false-positive burden, disclosure rate, member trust, and escalation appropriateness before production use.
