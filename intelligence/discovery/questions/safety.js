import { Q } from './core.js';

// Safety clarification is deliberately small and direct. Contextual wellness answers
// may trigger these questions, but they do not establish acute risk by themselves.
// Disposition belongs to intelligence/safety/policy.js, not to Discovery scoring.
// These EL8-authored prompts are not a validated suicide screener and require expert,
// cognitive and human validation before member-facing release.
const safety = (question, safetyPriority, confirmationField) => Object.assign(question, {
  path: 'safety',
  decisionCritical: true,
  safetyPriority,
  safetyConfirmationField: confirmationField,
});

export const SAFETY_QUESTIONS = Object.freeze([
  safety(Q('SAFE1', 'safety-confirmation', 'Before we continue, are you in immediate danger right now?', ['safety'], [
    ['yes', 'Yes', { __safety_immediate_danger: 1 }],
    ['no', 'No', { __safety_immediate_danger: 0 }],
    ['unsure', 'I’m not sure', { __safety_uncertain: 1 }],
    ['prefer_not', 'I prefer not to answer', { __safety_uncertain: 1 }],
  ], 0.08), 100, 'immediateDanger'),
  safety(Q('SAFE2', 'safety-confirmation', 'Are you thinking about seriously harming yourself or ending your life right now, and do you intend to act on those thoughts?', ['safety'], [
    ['yes', 'Yes', { __safety_intent: 1 }],
    ['thoughts_no_intent', 'I’m having thoughts, but I do not intend to act on them', { __safety_intent: 0, __safety_current_self_harm_thoughts: 1 }],
    ['no', 'No', { __safety_intent: 0 }],
    ['unsure', 'I’m not sure', { __safety_uncertain: 1 }],
    ['prefer_not', 'I prefer not to answer', { __safety_uncertain: 1 }],
  ], 0.08), 95, 'intent'),
  safety(Q('SAFE3', 'safety-confirmation', 'Do you feel able to keep yourself safe right now?', ['safety'], [
    ['yes', 'Yes', { __safety_can_stay_safe: 1 }],
    ['no', 'No', { __safety_cannot_stay_safe: 1 }],
    ['unsure', 'I’m not sure', { __safety_uncertain: 1 }],
    ['prefer_not', 'I prefer not to answer', { __safety_uncertain: 1 }],
  ], 0.08), 90, 'canStaySafe'),
]);
