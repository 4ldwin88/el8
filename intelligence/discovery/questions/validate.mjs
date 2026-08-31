import { QUESTION_BANK, QUESTION_BANK_COLUMNS } from './index.js';

const EXPECTED_TOTAL = 584;
const EXPECTED_TYPES = Object.freeze({ Question: 76, Answer: 508 });
const EXPECTED_NAMESPACES = Object.freeze({ EMT: 40, ENV: 38, FIN: 66, GEN: 124, INT: 40, OCC: 75, PHY: 85, SFT: 16, SOC: 65, SPT: 33, XDM: 2 });
const ALLOWED_EXTERNAL_PREREQUISITES = new Set(['XDM001']);

function fail(message) { throw new Error(`Question Bank validation failed: ${message}`); }
function namespaceOf(id) { return String(id).match(/^[A-Z]+/)?.[0] ?? ''; }

if (QUESTION_BANK_COLUMNS.length !== 30) fail(`schema has ${QUESTION_BANK_COLUMNS.length} columns; expected 30`);
if (QUESTION_BANK_COLUMNS.some((column) => /legacy|runtime id/i.test(column))) fail('obsolete compatibility column exists in schema');
if (QUESTION_BANK.length !== EXPECTED_TOTAL) fail(`record count ${QUESTION_BANK.length}; expected ${EXPECTED_TOTAL}`);

const ids = new Set();
const typeCounts = { Question: 0, Answer: 0 };
const namespaceCounts = {};
const questions = new Set();

for (const row of QUESTION_BANK) {
  if (!Array.isArray(row) || row.length !== 30) fail(`${row?.[0] ?? '<unknown>'} has ${row?.length ?? 'non-array'} fields; expected 30`);
  const [id, itemType] = row;
  if (!id || typeof id !== 'string') fail('record missing Canonical ID');
  if (ids.has(id)) fail(`duplicate Canonical ID ${id}`);
  ids.add(id);
  if (!(itemType in typeCounts)) fail(`${id} has invalid Item Type ${itemType}`);
  typeCounts[itemType] += 1;
  if (itemType === 'Question') questions.add(id);
  const ns = namespaceOf(id);
  namespaceCounts[ns] = (namespaceCounts[ns] ?? 0) + 1;
}

for (const [type, expected] of Object.entries(EXPECTED_TYPES)) if (typeCounts[type] !== expected) fail(`${type} count ${typeCounts[type]}; expected ${expected}`);
for (const [ns, expected] of Object.entries(EXPECTED_NAMESPACES)) if (namespaceCounts[ns] !== expected) fail(`${ns} count ${namespaceCounts[ns] ?? 0}; expected ${expected}`);
for (const ns of Object.keys(namespaceCounts)) if (!(ns in EXPECTED_NAMESPACES)) fail(`unexpected namespace ${ns}`);

for (const row of QUESTION_BANK) {
  const [id, itemType] = row;
  if (itemType !== 'Answer') continue;
  const parent = id.includes('.') ? id.slice(0, id.indexOf('.')) : null;
  if (parent && !questions.has(parent) && !ALLOWED_EXTERNAL_PREREQUISITES.has(parent)) fail(`${id} has missing parent ${parent}`);
}

console.log(`Question Bank valid: ${QUESTION_BANK.length} records; ${typeCounts.Question} Questions; ${typeCounts.Answer} Answers; 30 fields each; Canonical IDs unique.`);
