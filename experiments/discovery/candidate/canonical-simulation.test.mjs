import assert from 'node:assert/strict';
import { DISCOVERY_QUESTIONS } from './questions/index.js';
import { rankDiscoveryQuestions } from './question-selector.js';

function targets(question) {
  const canonicalTargets = Array.isArray(question.targets) ? question.targets : [];
  const evidenceTargets = (question.effects ?? [])
    .filter(effect => effect.type === 'evidence')
    .map(effect => effect.target);
  return [...new Set([...canonicalTargets, ...evidenceTargets].filter(Boolean))];
}

// Synthetic scenarios are deliberately fictional and contain no production/member data.
const scenarios = [
  {
    id: 'stable-supported',
    memberState: { concerns: { stress: { concernId: 'stress', status: 'active', sufficiency: 'sufficient' } } },
    expect: { maxTopNeed: 0.25 },
  },
  {
    id: 'financial-unclear',
    memberState: { concerns: { money_pressure: { concernId: 'money_pressure', status: 'candidate', sufficiency: 'insufficient' } } },
    expect: { target: 'money_pressure' },
  },
  {
    id: 'emotional-unclear',
    memberState: { concerns: { stress: { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient' } } },
    expect: { target: 'stress' },
  },
  {
    id: 'low-capacity',
    memberState: { concerns: { money_pressure: { concernId: 'money_pressure', status: 'candidate', sufficiency: 'insufficient' } } },
    capacity: 0,
    burdenBudget: 1,
    expect: { maxBurden: 1 },
  },
  {
    id: 'recent-redundancy',
    memberState: { concerns: {
      stress: { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient' },
      low_energy: { concernId: 'low_energy', status: 'candidate', sufficiency: 'insufficient' },
    } },
    answeredQuestions: DISCOVERY_QUESTIONS.filter(q => targets(q).includes('stress')).slice(0, 2),
    expect: { avoidTarget: 'stress' },
  },
];

for (const scenario of scenarios) {
  const ranked = rankDiscoveryQuestions({
    questions: DISCOVERY_QUESTIONS,
    memberState: scenario.memberState,
    answeredQuestions: scenario.answeredQuestions ?? [],
    capacity: scenario.capacity ?? 1,
    burdenBudget: scenario.burdenBudget ?? 12,
  });
  assert.ok(ranked.length > 0, `${scenario.id}: expected candidates`);
  const top = ranked[0];
  if (scenario.expect.target) assert.ok(targets(top.question).includes(scenario.expect.target), `${scenario.id}: top question should target ${scenario.expect.target}`);
  if (scenario.expect.avoidTarget) assert.ok(!targets(top.question).includes(scenario.expect.avoidTarget), `${scenario.id}: top question should avoid redundant ${scenario.expect.avoidTarget}`);
  if (scenario.expect.maxBurden != null) assert.ok(top.rationale.burden <= scenario.expect.maxBurden || top.rationale.safetyCritical, `${scenario.id}: burden exceeded`);
  if (scenario.expect.maxTopNeed != null) assert.ok(top.rationale.informationGain <= 1, `${scenario.id}: invalid information gain`);
}

// Simulation must remain deterministic for the same canonical state and bank.
const opts = { questions: DISCOVERY_QUESTIONS, memberState: scenarios[1].memberState };
assert.deepEqual(
  rankDiscoveryQuestions(opts).slice(0, 5).map(x => x.question.id),
  rankDiscoveryQuestions(opts).slice(0, 5).map(x => x.question.id),
);

console.log(`canonical synthetic simulation passed (${scenarios.length} scenarios)`);
