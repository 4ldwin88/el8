import { CORE_QUESTIONS } from './core.js';
import { PHYSICAL_QUESTIONS } from './physical.js';
import { EMOTIONAL_QUESTIONS } from './emotional.js';
import { FINANCIAL_QUESTIONS } from './financial.js';
import { OCCUPATIONAL_QUESTIONS } from './occupational.js';
import { SOCIAL_QUESTIONS } from './social.js';
import { ENVIRONMENTAL_QUESTIONS } from './environmental.js';
import { INTELLECTUAL_QUESTIONS } from './intellectual.js';
import { SPIRITUAL_QUESTIONS } from './spiritual.js';
import { CROSS_DIMENSIONAL_QUESTIONS } from './cross-dimensional.js';

// Canonical candidate bank. Each EL8 dimension owns its own small module.
// Explicit multi-dimension bridge questions live in cross-dimensional.js.
// Cross-dimensional answer effects remain valid regardless of source ownership.
export const DISCOVERY_QUESTIONS = Object.freeze([
  ...CORE_QUESTIONS,
  ...PHYSICAL_QUESTIONS,
  ...EMOTIONAL_QUESTIONS,
  ...FINANCIAL_QUESTIONS,
  ...OCCUPATIONAL_QUESTIONS,
  ...SOCIAL_QUESTIONS,
  ...ENVIRONMENTAL_QUESTIONS,
  ...INTELLECTUAL_QUESTIONS,
  ...SPIRITUAL_QUESTIONS,
  ...CROSS_DIMENSIONAL_QUESTIONS,
]);

const ids = new Set();
for (const question of DISCOVERY_QUESTIONS) {
  if (ids.has(question.id)) throw new Error(`Duplicate Discovery question id: ${question.id}`);
  ids.add(question.id);
}

export const DISCOVERY_QUESTION_BY_ID = Object.freeze(
  Object.fromEntries(DISCOVERY_QUESTIONS.map(question => [question.id, question])),
);

export default DISCOVERY_QUESTIONS;
