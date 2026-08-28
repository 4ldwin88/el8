import { Q } from './core.js';

// Environmental owns observable conditions in the member's home and immediate
// surroundings that may be associated with daily functioning. Home quality, safety,
// physical conditions, access and housing stability are distinct constructs; Discovery
// records member-reported conditions and interference without treating them as proven
// causal drivers.
//
// These are EL8-authored hypothesis items informed by environmental quality-of-life
// and healthy-housing constructs. They are not the WHOQOL-BREF or another validated
// environmental instrument and must not inherit another instrument's validity or score.
export const ENVIRONMENTAL_QUESTIONS = Object.freeze([
  Q('H1', 'state-probe', 'Over the past 7 days, how often did something about your home or immediate surroundings interfere with your usual daily activities?', ['home_instability'], [['never', 'Never', { home_instability: -0.65 }], ['rarely', 'Rarely', { home_instability: -0.2 }], ['sometimes', 'Sometimes', { home_instability: 0.3 }], ['often', 'Often', { home_instability: 0.6 }], ['always', 'Almost always', { home_instability: 0.8 }], ['unsure', 'Not sure', {}]], 0.18),
  Q('H2', 'discriminator', 'Which conditions, if any, seemed connected with times daily life was harder recently? Select any that fit.', ['home_instability'], [['noise', 'Noise or frequent interruptions', { home_instability: 0.3 }], ['privacy', 'Not enough privacy', { home_instability: 0.3 }], ['space', 'Not enough usable space or too much crowding', { home_instability: 0.35 }], ['temperature_air', 'Temperature, air quality, smoke, dampness, or similar physical conditions', { home_instability: 0.35 }], ['accessibility', 'Accessibility or difficulty using the space', { home_instability: 0.35 }], ['transport', 'Transportation or location makes important activities difficult', { home_instability: 0.25 }], ['people', 'Conflict or tension with people I live with', { relationship_strain: 0.35 }], ['housing', 'Uncertainty about being able to stay where I live', { home_instability: 0.6 }], ['other', 'Something else', {}], ['none', 'None of these', {}], ['unsure', 'Not sure', {}]], 0.2, 'multi'),
  Q('H3', 'safety-probe', 'Do you currently feel physically safe where you live?', ['home_instability'], [['yes', 'Yes', { home_instability: -0.15 }], ['mostly', 'Mostly', { home_instability: 0.2 }], ['no', 'No', { home_instability: 0.7 }], ['unsure', 'Not sure', {}], ['na', 'I prefer not to answer', {}]], 0.2),
  Q('H4', 'stability-probe', 'How secure is your current housing for the near future?', ['home_instability'], [['secure', 'I expect to be able to stay here', { home_instability: -0.35 }], ['uncertain', 'There is some uncertainty', { home_instability: 0.35 }], ['risk', 'I may have to leave or lose this housing', { home_instability: 0.7 }], ['temporary', 'This is temporary housing', { home_instability: 0.35 }], ['unsure', 'Not sure', {}], ['na', 'Not applicable', {}]], 0.18),
  Q('H5', 'feasibility-probe', 'For the environmental difficulty that matters most, how much can you realistically change yourself right now?', ['home_instability'], [['high', 'A lot', {}], ['some', 'Some of it', {}], ['little', 'Very little', {}], ['none', 'None right now', {}], ['unsure', 'Not sure', {}]], 0.12),
]);
