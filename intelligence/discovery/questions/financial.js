import { Q, scale } from './core.js';

// Financial owns money-pressure questions. Answers may still emit cross-dimensional
// evidence when financial strain is connected to another part of life.
export const FINANCIAL_QUESTIONS = Object.freeze([
  Q('M1', 'driver-probe', 'How manageable does money feel right now?', ['money_pressure'], scale('money_pressure'), 0.18),
  Q('M2', 'driver-probe', 'Are bills, debt, or basic expenses creating pressure?', ['money_pressure'], [
    ['no', 'No', { money_pressure: -0.65 }],
    ['some', 'Some pressure', { money_pressure: 0.35 }],
    ['major', 'A lot of pressure', { money_pressure: 0.75 }],
  ], 0.18),
  Q('M3', 'driver-discriminator', 'What is contributing to the money pressure? Select all that fit.', ['money_pressure', 'work_instability'], [
    ['no_income', 'I do not currently have a job or income', { work_instability: 0.7, money_pressure: 0.55 }],
    ['low_income', 'My income is too low', { work_instability: 0.3, money_pressure: 0.5 }],
    ['unstable_income', 'My income is uncertain or irregular', { work_instability: 0.55, money_pressure: 0.45 }],
    ['expenses', 'Bills or expenses are too high', { money_pressure: 0.6 }],
    ['debt', 'Debt', { money_pressure: 0.65, stress: 0.2 }],
    ['acute', 'A major or unexpected expense', { money_pressure: 0.55 }],
    ['other', 'Something else', {}],
    ['unsure', 'Not sure', {}],
  ], 0.24, 'multi'),
  Q('M4', 'confirmation', 'If your money situation improved, would much of the current stress ease?', ['money_pressure'], [
    ['yes', 'Yes', { money_pressure: 0.5 }],
    ['some', 'Some', { money_pressure: 0.25 }],
    ['no', 'Not much', { money_pressure: -0.3 }],
    ['unsure', 'Not sure', {}],
  ], 0.2),
]);
