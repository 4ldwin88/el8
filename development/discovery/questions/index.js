import { CORE_QUESTIONS } from './core.js';
import { FINANCIAL_WORK_QUESTIONS } from './financial-work.js';
import { PHYSICAL_EMOTIONAL_QUESTIONS } from './physical-emotional.js';

// Canonical candidate bank. Additional domain modules should be added here in small,
// reviewable files rather than rebuilding a single oversized versioned question-bank blob.
export const DISCOVERY_QUESTIONS = Object.freeze([
  ...CORE_QUESTIONS,
  ...FINANCIAL_WORK_QUESTIONS,
  ...PHYSICAL_EMOTIONAL_QUESTIONS,
]);

const ids = new Set();
for (const question of DISCOVERY_QUESTIONS) {
  if (ids.has(question.id)) throw new Error(`Duplicate Discovery question id: ${question.id}`);
  ids.add(question.id);
}

export default DISCOVERY_QUESTIONS;
