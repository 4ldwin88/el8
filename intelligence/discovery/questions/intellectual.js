import { Q } from './core.js';

// Intellectual owns focus and cognitive-engagement investigation. These EL8-authored
// items are hypothesis evidence, not a validated cognitive assessment. They describe
// recent attention/function and member-observed context; they do not diagnose a
// cognitive disorder or establish why a focus problem exists.
export const INTELLECTUAL_QUESTIONS = Object.freeze([
  Q('F1', 'state-probe', 'Thinking about the past 7 days, how often was it hard to stay focused on something you needed or wanted to do?', ['low_focus'], [
    ['never', 'Never', { low_focus: -0.65 }],
    ['rarely', 'Rarely', { low_focus: -0.35 }],
    ['sometimes', 'Sometimes', { low_focus: 0.25 }],
    ['often', 'Often', { low_focus: 0.6 }],
    ['almost_always', 'Almost always', { low_focus: 0.8 }],
    ['unsure', 'Not sure', {}],
  ], 0.16),
  Q('F2', 'impact-probe', 'Thinking about the past 7 days, how much did difficulty focusing interfere with things that mattered to you?', ['low_focus'], [
    ['none', 'Not at all', { low_focus: -0.45 }],
    ['little', 'A little', { low_focus: 0.15 }],
    ['some', 'Somewhat', { low_focus: 0.4 }],
    ['quite', 'Quite a bit', { low_focus: 0.65 }],
    ['very', 'Very much', { low_focus: 0.8 }],
    ['unsure', 'Not sure', {}],
  ], 0.18),
  Q('F3', 'discriminator', 'When focusing was difficult in the past 7 days, what did you notice around those times? Select any that fit.', ['low_focus'], [
    ['tired', 'I felt tired or low on energy', { low_energy: 0.3 }],
    ['poor_sleep', 'My sleep had been poor', { poor_sleep: 0.3 }],
    ['stress', 'I felt stressed or worried', { stress: 0.3 }],
    ['unclear', 'I was not clear about what to do next', { lack_direction: 0.25 }],
    ['starting', 'Getting started was difficult', { low_activation: 0.3 }],
    ['interruptions', 'There were frequent demands, distractions, or interruptions', { schedule_disruption: 0.25 }],
    ['environment', 'The place I was in made concentrating difficult', { home_instability: 0.15 }],
    ['nothing', 'Nothing specific stood out', {}],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.2, 'multi'),
  Q('F4', 'engagement-probe', 'Thinking about the past 7 days, how often did you have a chance to do something that kept your mind interested or engaged?', ['low_focus'], [
    ['never', 'Never', {}],
    ['rarely', 'Rarely', {}],
    ['sometimes', 'Sometimes', {}],
    ['often', 'Often', {}],
    ['almost_always', 'Almost always', {}],
    ['unsure', 'Not sure', {}],
  ], 0.1),
  Q('F5', 'feasibility-probe', 'If you wanted to make focusing easier right now, what would need to be taken into account? Select any that fit.', ['low_focus'], [
    ['time', 'I only have short blocks of uninterrupted time', { schedule_disruption: 0.12 }],
    ['interruptions', 'I cannot reliably control interruptions', { schedule_disruption: 0.15 }],
    ['energy', 'My energy changes a lot during the day', { low_energy: 0.12 }],
    ['environment', 'I do not have a reliable place to concentrate', { home_instability: 0.12 }],
    ['starting', 'Getting started is harder than staying focused', { low_activation: 0.15 }],
    ['none', 'Nothing obvious', {}],
    ['unsure', 'Not sure', {}],
  ], 0.11, 'multi'),
]);
