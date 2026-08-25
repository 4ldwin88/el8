import assert from 'node:assert/strict';
import { rankDiscoveryQuestions, selectNextDiscoveryQuestion } from './question-selector.js';

const effect = target => [{ type: 'evidence', target }];
const q = (id, target, extra = {}) => ({ id, effects: effect(target), ...extra });

// Unresolved concern should outrank an already-supported concern.
{
  const memberState = { concerns: {
    stress: { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient' },
    poor_sleep: { concernId: 'poor_sleep', status: 'active', sufficiency: 'sufficient' },
  }};
  const ranked = rankDiscoveryQuestions({ questions: [q('sleep-q', 'poor_sleep'), q('stress-q', 'stress')], memberState });
  assert.deepEqual(ranked.map(item => item.question.id), ['stress-q', 'sleep-q']);
}

// Dependency and trigger gating must be explicit.
{
  const questions = [
    q('base', 'stress'),
    q('dependent', 'stress', { dependsOn: ['base'] }),
    q('triggered', 'stress', { trigger: 'followup' }),
  ];
  assert.deepEqual(rankDiscoveryQuestions({ questions, memberState: { concerns: {} } }).map(item => item.question.id), ['base']);
  assert.deepEqual(rankDiscoveryQuestions({ questions, memberState: { concerns: {} }, answeredQuestionIds: ['base'], triggers: ['followup'] }).map(item => item.question.id), ['dependent', 'triggered']);
}

// Burden exhaustion blocks ordinary questions, but a safety-critical question can still surface.
{
  const questions = [q('ordinary', 'stress', { burden: 2 }), q('safety', 'stress', { burden: 5, safetyCritical: true })];
  const ranked = rankDiscoveryQuestions({ questions, memberState: { concerns: {} }, burdenUsed: 3, burdenBudget: 3 });
  assert.deepEqual(ranked.map(item => item.question.id), ['safety']);
  assert.equal(ranked[0].rationale.safetyCritical, true);
}

// Repeated coverage should lose to equally-needed fresh coverage.
{
  const questions = [q('repeat-stress', 'stress'), q('fresh-energy', 'low_energy')];
  const answeredQuestions = [q('old-stress-1', 'stress'), q('old-stress-2', 'stress')];
  const memberState = { concerns: {
    stress: { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient' },
    low_energy: { concernId: 'low_energy', status: 'candidate', sufficiency: 'insufficient' },
  }};
  const ranked = rankDiscoveryQuestions({ questions, answeredQuestions, memberState });
  assert.equal(ranked[0].question.id, 'fresh-energy');
  assert.ok(ranked.find(item => item.question.id === 'repeat-stress').rationale.redundancyPenalty > 0);
}

// Low capacity penalizes high-burden questions.
{
  const questions = [q('heavy', 'stress', { burden: 4 }), q('light', 'stress', { burden: 1 })];
  const ranked = rankDiscoveryQuestions({ questions, memberState: { concerns: {} }, capacity: 0 });
  assert.equal(ranked[0].question.id, 'light');
}

// Equal candidates are deterministic by ID.
{
  const questions = [q('b-question', 'stress'), q('a-question', 'stress')];
  const first = rankDiscoveryQuestions({ questions, memberState: { concerns: {} } }).map(item => item.question.id);
  const second = rankDiscoveryQuestions({ questions: [...questions].reverse(), memberState: { concerns: {} } }).map(item => item.question.id);
  assert.deepEqual(first, ['a-question', 'b-question']);
  assert.deepEqual(second, first);
  assert.equal(selectNextDiscoveryQuestion({ questions, memberState: { concerns: {} } }).question.id, 'a-question');
}

// Selection mechanics remain ephemeral; they must not mutate Member State.
{
  const memberState = { concerns: { stress: { concernId: 'stress', status: 'candidate', sufficiency: 'insufficient' } } };
  const before = JSON.stringify(memberState);
  const result = selectNextDiscoveryQuestion({ questions: [q('stress-q', 'stress')], memberState });
  assert.ok(Number.isFinite(result.selectionValue));
  assert.equal(JSON.stringify(memberState), before);
  assert.equal('score' in memberState.concerns.stress, false);
}

assert.throws(() => rankDiscoveryQuestions({ memberState: { concerns: {} } }), /questions is required/);
console.log('canonical Discovery question-selector tests passed');
