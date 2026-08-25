import assert from 'node:assert/strict';
import BANK, { DISCOVERY_QUESTION_BY_ID } from './index.js';
import { adaptQuestion, normalizeAnswerIds, observationsForAnswer } from '../question-bank-adapter.js';

const requiredIds = [
  'G1','D1','D2','D3','D4','D5','C1','C2','HV1','HV2','X1',
  'PH0','PH1','PH2','PH3','SL1','SL2','SL3','E1','E2','ST1','ST2','F1','F2',
  'M1','M2','M3','M4','W1','W2','W3','W4','SC1','SC2',
  'R1','R2','R3','S1','S2','S3','H1','H2','P1','P2','B1','B2','B3','B4',
];
for (const id of requiredIds) assert.ok(DISCOVERY_QUESTION_BY_ID[id], `missing canonical question ${id}`);
assert.equal(new Set(BANK.map(q => q.id)).size, BANK.length);

// Gateway must support multiple simultaneous concerns and retain dimension effects.
const gateway = adaptQuestion(DISCOVERY_QUESTION_BY_ID.G1);
assert.equal(gateway.responseMode, 'multi');
const gatewayObs = observationsForAnswer(gateway, ['money','sleep','relationships']);
const gatewayTargets = new Set(gatewayObs.flatMap(o => o.effects.map(e => e.target)));
assert.ok(gatewayTargets.has('money'));
assert.ok(gatewayTargets.has('sleep'));
assert.ok(gatewayTargets.has('relationships'));

// Weak/exclusive answers cannot be combined with substantive multi-select evidence.
const moneyDrivers = adaptQuestion(DISCOVERY_QUESTION_BY_ID.M3);
assert.deepEqual(normalizeAnswerIds(moneyDrivers, ['debt','unsure']), ['unsure']);
const weak = observationsForAnswer(moneyDrivers, ['unsure']);
assert.ok(weak.every(o => o.effects.every(e => e.strength === 0)));

// Cross-dimensional evidence is preserved even though questions have one source owner.
const debt = observationsForAnswer(moneyDrivers, ['debt']);
const debtTargets = new Set(debt.flatMap(o => o.effects.map(e => e.target)));
assert.ok(debtTargets.has('money'));
assert.ok(debtTargets.has('stress'));
const stressDriver = observationsForAnswer(adaptQuestion(DISCOVERY_QUESTION_BY_ID.ST2), ['work']);
assert.ok(stressDriver.flatMap(o => o.effects).some(e => e.target === 'work' && e.polarity === 'supports'));

// Explicit bridges remain separate from dimension ownership and can resolve directionality.
for (const id of ['B1','B2','B3','B4']) assert.equal(DISCOVERY_QUESTION_BY_ID[id].role, 'bridge');
const sleepStress = observationsForAnswer(adaptQuestion(DISCOVERY_QUESTION_BY_ID.B2), ['sleep']);
assert.ok(sleepStress.flatMap(o => o.effects).some(e => e.target === 'sleep' && e.strength > 0));
assert.ok(sleepStress.flatMap(o => o.effects).some(e => e.target === 'stress' && e.strength > 0));

// Every EL8 dimension has a canonical member-facing question surface.
const dimensionAnchors = {
  physical: ['PH0','SL1','E1'],
  emotional: ['ST1'],
  financial: ['M1'],
  occupational: ['W1'],
  social: ['R1','S1'],
  environmental: ['H1'],
  intellectual: ['F1'],
  spiritual: ['P1'],
};
for (const [dimension, ids] of Object.entries(dimensionAnchors)) {
  assert.ok(ids.every(id => DISCOVERY_QUESTION_BY_ID[id]), `${dimension} missing canonical coverage`);
}

console.log(`Canonical Discovery question behavior passed: ${BANK.length} questions across eight dimensions.`);
