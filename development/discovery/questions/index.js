import { CORE_QUESTIONS } from './core.js';
import { FINANCIAL_QUESTIONS } from './financial.js';
import { OCCUPATIONAL_QUESTIONS } from './occupational.js';
import { PHYSICAL_QUESTIONS } from './physical.js';
import { EMOTIONAL_QUESTIONS } from './emotional.js';

// Canonical candidate bank. Each EL8 dimension owns its own small module.
// Cross-dimensional relationships belong in question effects/intelligence logic,
// not in combined source files.
export const DISCOVERY_QUESTIONS = Object.freeze([
  ...CORE_QUESTIONS,
  ...PHYSICAL_QUESTIONS,
  ...EMOTIONAL_QUESTIONS,
  ...FINANCIAL_QUESTIONS,
  ...OCCUPATIONAL_QUESTIONS,
]);

const ids = new Set();
for (const question of DISCOVERY_QUESTIONS) {
  if (ids.has(question.id)) throw new Error(`Duplicate Discovery question id: ${question.id}`);
  ids.add(question.id);
}

export default DISCOVERY_QUESTIONS;
