import { Q, scale } from './core.js';

// Environmental owns the member's home and immediate surroundings. Discovery also
// captures what is realistically changeable so Planning does not assume control the
// member does not have.
export const ENVIRONMENTAL_QUESTIONS = Object.freeze([
  Q('H1', 'driver-probe', 'How supportive does your home environment feel?', ['home_instability'], scale('home_instability'), 0.18),
  Q('H2', 'driver-probe', 'Does your home or immediate environment make daily life harder?', ['home_instability'], [
    ['no', 'No', { home_instability: -0.6 }],
    ['sometimes', 'Sometimes', { home_instability: 0.3 }],
    ['yes', 'Yes', { home_instability: 0.7 }],
  ], 0.18),
  Q('H3', 'discriminator', 'What about your environment is making daily life harder? Select any that fit.', ['home_instability'], [
    ['noise', 'Noise, interruptions, or lack of privacy', { home_instability: 0.35 }],
    ['space', 'Not enough usable space', { home_instability: 0.3 }],
    ['people', 'Tension or difficulty with people I live with', { home_instability: 0.4, relationship_strain: 0.2 }],
    ['safety', 'I do not consistently feel safe or secure there', { home_instability: 0.65 }],
    ['housing', 'Housing stability or the possibility of needing to move', { home_instability: 0.6, money_pressure: 0.2 }],
    ['access', 'Accessibility or getting around the space', { home_instability: 0.35, physical_condition: 0.1 }],
    ['other', 'Something else', {}], ['unsure', 'Not sure', {}],
  ], 0.18, 'multi'),
  Q('H4', 'feasibility-probe', 'How much control do you realistically have over the part of your environment that is causing difficulty?', ['home_instability'], [
    ['high', 'A lot — I can change it directly', { home_instability: -0.1 }],
    ['some', 'Some — I can make limited changes', {}],
    ['little', 'Very little — it mostly depends on other people or circumstances', { home_instability: 0.2 }],
    ['none', 'None right now', { home_instability: 0.3 }],
    ['unsure', 'Not sure', {}],
  ], 0.12),
]);
