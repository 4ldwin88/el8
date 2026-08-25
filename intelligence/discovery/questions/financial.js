import { Q, scale } from './core.js';

// Financial owns money-pressure questions. Deepening stays selective: these questions
// distinguish urgency, resilience and plausible drivers rather than constructing a plan.
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
  Q('M5', 'urgency-probe', 'How much near-term financial pressure is there?', ['money_pressure'], [
    ['none', 'None', { money_pressure: -0.45 }],
    ['manageable', 'Manageable', { money_pressure: 0.15 }],
    ['risk', 'At risk of missing required payments', { money_pressure: 0.65 }],
    ['behind', 'Already behind on required payments', { money_pressure: 0.85 }],
  ], 0.14),
  Q('M6', 'resilience-probe', 'About how much emergency breathing room do you have in liquid cash?', ['money_pressure'], [
    ['three_plus', '3+ months', { money_pressure: -0.35 }],
    ['one_three', '1–3 months', { money_pressure: -0.1 }],
    ['under_one', 'Less than 1 month', { money_pressure: 0.4 }],
    ['little_none', 'Little or none', { money_pressure: 0.65 }],
    ['unsure', 'Unsure', {}],
  ], 0.14),
  Q('M7', 'obligation-probe', 'Which required expenses are currently difficult or at risk? Select all that fit.', ['money_pressure'], [
    ['housing', 'Housing', { money_pressure: 0.55, home_instability: 0.35 }],
    ['utilities', 'Utilities', { money_pressure: 0.45, home_instability: 0.2 }],
    ['food', 'Food', { money_pressure: 0.5 }],
    ['transport', 'Transportation', { money_pressure: 0.35 }],
    ['healthcare', 'Medication or healthcare', { money_pressure: 0.45, physical_condition: 0.2 }],
    ['debt', 'Debt or minimum payments', { money_pressure: 0.55 }],
    ['other', 'Another required obligation', { money_pressure: 0.4 }],
    ['none', 'None', { money_pressure: -0.25 }],
  ], 0.2, 'multi'),
  Q('M8', 'visibility-probe', 'How clear is your current financial picture?', ['money_pressure'], [
    ['clear', 'Very clear', {}],
    ['mostly', 'Mostly clear', {}],
    ['broad', 'I only know the broad picture', { money_pressure: 0.1 }],
    ['poor', 'Poorly known', { money_pressure: 0.2 }],
    ['unsure', 'Unsure', {}],
  ], 0.1),
]);
