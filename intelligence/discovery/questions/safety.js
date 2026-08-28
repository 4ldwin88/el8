import { Q } from './core.js';

// Safety clarification is deliberately small and direct. Contextual wellness answers
// may trigger these questions, but they do not establish acute risk by themselves.
// Disposition belongs to intelligence/safety/policy.js, not to Discovery scoring.
// These EL8-authored prompts are not the ASQ or another validated suicide screener.
const safety = (question, safetyPriority) => Object.assign(question, {
  path: 'safety',
  decisionCritical: true,
  safetyPriority,
});

export const SAFETY_QUESTIONS = Object.freeze([
  safety(Q('SAFE1', 'safety-confirmation', 'Before we continue, are you in immediate danger or at risk of being seriously hurt right now?', ['safety'], [
    ['yes', 'Yes', { __safety_immediate_danger: 1 }],
    ['no', 'No', { __safety_immediate_danger: 0 }],
    ['unsure', 'I’m not sure', { __safety_uncertain: 1 }],
    ['prefer_not', 'I prefer not to answer', { __safety_uncertain: 1 }],
  ], 0.08), 100),
  safety(Q('SAFE2', 'safety-confirmation', 'Are you having thoughts right now about seriously harming yourself or ending your life?', ['safety'], [
    ['yes', 'Yes', { __safety_current_self_harm: 1 }],
    ['no', 'No', { __safety_current_self_harm: 0 }],
    ['unsure', 'I’m not sure', { __safety_uncertain: 1 }],
    ['prefer_not', 'I prefer not to answer', { __safety_uncertain: 1 }],
  ], 0.08), 95),
  safety(Q('SAFE3', 'safety-confirmation', 'Do you feel able to keep yourself safe right now?', ['safety'], [
    ['yes', 'Yes', { __safety_can_stay_safe: 1 }],
    ['no', 'No', { __safety_cannot_stay_safe: 1 }],
    ['unsure', 'I’m not sure', { __safety_uncertain: 1 }],
    ['prefer_not', 'I prefer not to answer', { __safety_uncertain: 1 }],
  ], 0.08), 90),
]);
