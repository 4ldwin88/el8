import { DISCOVERY_QUESTIONS } from './index.js';

const REQUIRED_DIMENSION_FILES = [
  'physical',
  'emotional',
  'financial',
  'occupational',
  'social',
  'environmental',
  'intellectual',
  'spiritual',
];

const failures = [];
const ids = new Set();

for (const question of DISCOVERY_QUESTIONS) {
  if (!question?.id) failures.push('Question missing id');
  if (!question?.role) failures.push(`${question?.id ?? 'unknown'} missing role`);
  if (!question?.text) failures.push(`${question?.id ?? 'unknown'} missing text`);
  if (!Array.isArray(question?.options) || question.options.length === 0) {
    failures.push(`${question?.id ?? 'unknown'} has no options`);
  }
  if (ids.has(question.id)) failures.push(`Duplicate id: ${question.id}`);
  ids.add(question.id);

  const optionIds = new Set();
  for (const option of question.options ?? []) {
    if (!option?.id) failures.push(`${question.id} has option without id`);
    if (!option?.label) failures.push(`${question.id}/${option?.id ?? 'unknown'} missing label`);
    if (optionIds.has(option.id)) failures.push(`${question.id} duplicate option id: ${option.id}`);
    optionIds.add(option.id);
  }
}

const expectedHistoricalIds = [
  'G1', 'D1', 'D2', 'D3', 'D4', 'D5', 'C1', 'C2', 'HV1', 'HV2', 'X1',
  'M1', 'M2', 'M3', 'M4', 'W1', 'W2', 'W3', 'W4', 'SC1', 'SC2',
  'R1', 'R2', 'R3', 'S1', 'S2', 'S3', 'H1', 'H2', 'P1', 'P2',
  'SL1', 'SL2', 'SL3', 'E1', 'E2', 'ST1', 'ST2', 'F1', 'F2',
  'PH0', 'PH1', 'PH2', 'PH3', 'B1', 'B2', 'B3', 'B4',
];

for (const id of expectedHistoricalIds) {
  if (!ids.has(id)) failures.push(`Historical question not represented: ${id}`);
}

if (failures.length) {
  console.error('Discovery question-bank validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Discovery question bank valid: ${DISCOVERY_QUESTIONS.length} questions.`);
console.log(`Dimension modules expected: ${REQUIRED_DIMENSION_FILES.join(', ')}.`);
