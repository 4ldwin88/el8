import { emotionalQuestions } from './emotional.js';
import { financialQuestions } from './financial.js';
import { clarificationQuestions } from './clarification.js';

export const questionBank = [
  ...emotionalQuestions,
  ...financialQuestions,
  ...clarificationQuestions
];

export function questionsForDimension(dimension) {
  return questionBank.filter(q => q.dimension === dimension);
}

export function questionById(id) {
  return questionBank.find(q => q.id === id) || null;
}
