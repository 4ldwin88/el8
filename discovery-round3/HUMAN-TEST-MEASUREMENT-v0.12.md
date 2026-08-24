# Discovery v0.12 Candidate — Human Test Measurement

## Purpose
Measure whether Discovery is accurate, appropriately scoped, low-burden, understandable, and useful. Do not optimize only for completion rate or tester satisfaction.

## Instrument design
Keep the post-assessment survey short enough that the survey itself does not materially inflate perceived assessment burden. Use structured responses for comparison across testers plus one optional free-text field.

### Required post-assessment questions
1. **How did the overall length feel?**
   - Much too short
   - A little too short
   - About right
   - A little too long
   - Much too long

2. **How relevant did the questions feel to your situation?**
   - 1 Not relevant — 5 Extremely relevant

3. **How easy were the questions to understand?**
   - 1 Very difficult — 5 Very easy

4. **How repetitive did the assessment feel?**
   - 1 Not repetitive — 5 Extremely repetitive

5. **Did EL8 miss anything important about what is affecting you right now?**
   - No
   - Yes
   - Unsure
   - If Yes: optional explanation

6. **Did EL8 ask about anything that felt unnecessarily unrelated to your situation?**
   - No
   - Yes
   - Unsure
   - If Yes: optional explanation

7. **How well did the final focus areas reflect what you actually want help with?**
   - 1 Very poorly — 5 Extremely well

8. **How confident would you be continuing with the plan based on this assessment?**
   - 1 Not confident — 5 Very confident

9. **If this were a real EL8 assessment, would you have completed it without being asked to test it?**
   - Definitely no
   - Probably no
   - Unsure
   - Probably yes
   - Definitely yes

10. **Anything else we should change?**
   - Optional free text

## Automatically captured measures
- Total assessment duration
- Per-question response time
- Number of displayed questions
- Question IDs/path
- Tester notes by screen
- Suggested focus areas
- Member-confirmed/corrected focus areas
- Plan relevance by focus
- Plan usefulness by focus
- Selected actions
- Technical trace/version

## Derived optimization measures
- Perceived burden: length + repetition + completion-intent
- Relevance failure: low relevance and/or unrelated-question report
- Coverage failure: important-missing report and focus correction
- Comprehension failure: low understandability
- Outcome-fit failure: low final-focus fit
- Confidence failure: low willingness/confidence to continue
- Objective burden: duration + question count, compared with perceived burden

## Interpretation rule
Do not shorten the assessment merely because a tester reports that it felt long. First determine whether burden came from unnecessary branching, repetition, unclear wording, slow interaction, or genuinely necessary discovery depth. Likewise, high satisfaction does not compensate for missed concerns, unsafe closure, or incorrect focus selection.

## Gate 3 use
Every reproducible defect found in human testing should become a permanent automated regression case where technically possible. Human-test results should be reviewed alongside the automated/adversarial evidence before v0.12 is considered merge-ready.
