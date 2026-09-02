import { QUESTIONS, ANSWERS, EFFECTS, SIGNALS, ACTIONS, EVIDENCE, SOURCES, ID_MIGRATION_MAP, ORIENTATION_BASELINE_QUESTIONS, ORIENTATION_BASELINE_ANSWERS, ORIENTATION_BASELINE_EFFECTS, ORIENTATION_BASELINE_SOURCES, BASELINE_DISCRIMINATOR_QUESTIONS, BASELINE_DISCRIMINATOR_ANSWERS, BASELINE_DISCRIMINATOR_EFFECTS, DIRECT_STATE_PROBE_QUESTIONS, DIRECT_STATE_PROBE_ANSWERS, DIRECT_STATE_PROBE_EFFECTS } from './index.js';

export const ALL_QUESTIONS = Object.freeze([...QUESTIONS,...ORIENTATION_BASELINE_QUESTIONS,...BASELINE_DISCRIMINATOR_QUESTIONS,...DIRECT_STATE_PROBE_QUESTIONS]);
export const ALL_ANSWERS = Object.freeze([...ANSWERS,...ORIENTATION_BASELINE_ANSWERS,...BASELINE_DISCRIMINATOR_ANSWERS,...DIRECT_STATE_PROBE_ANSWERS]);
export const ALL_EFFECTS = Object.freeze([...EFFECTS,...ORIENTATION_BASELINE_EFFECTS,...BASELINE_DISCRIMINATOR_EFFECTS,...DIRECT_STATE_PROBE_EFFECTS]);
export const ALL_SOURCES = Object.freeze([...SOURCES,...ORIENTATION_BASELINE_SOURCES]);
const indexBy = (rows, key) => Object.freeze(Object.fromEntries(rows.map(row => [row[key], row])));
const groupBy = (rows, key) => { const grouped = {}; for (const row of rows) (grouped[row[key]] ??= []).push(row); return Object.freeze(Object.fromEntries(Object.entries(grouped).map(([k,v]) => [k, Object.freeze(v)]))); };

export const QUESTION_BY_ID = indexBy(ALL_QUESTIONS, 'Question ID');
export const ANSWER_BY_ID = indexBy(ALL_ANSWERS, 'Answer ID');
export const EFFECT_BY_ID = indexBy(ALL_EFFECTS, 'Effect ID');
export const SIGNAL_BY_ID = indexBy(SIGNALS, 'Signal ID');
export const ACTION_BY_ID = indexBy(ACTIONS, 'Action ID');
export const EVIDENCE_BY_ID = indexBy(EVIDENCE, 'Evidence ID');
export const SOURCE_BY_ID = indexBy(ALL_SOURCES, 'Source ID');
export const ANSWERS_BY_QUESTION_ID = groupBy(ALL_ANSWERS, 'Parent Question ID');
export const EFFECTS_BY_ANSWER_ID = groupBy(ALL_EFFECTS, 'Answer ID');

// Canonical runtime accepts permanent IDs only. Historical aliases remain solely at this explicit
// ingress migration boundary for persisted/imported data created before permanent registry IDs.
const aliasEntries = ID_MIGRATION_MAP.filter(row => row['Legacy ID'] && row['New Permanent ID'] && row.Status === 'MAPPED').map(row => [row['Legacy ID'], row['New Permanent ID']]);
export const PERMANENT_ID_BY_LEGACY_ALIAS = Object.freeze(Object.fromEntries(aliasEntries));
export function migrateLegacyRegistryId(id) { if (typeof id !== 'string' || !id) throw new Error('id required'); return PERMANENT_ID_BY_LEGACY_ALIAS[id] ?? id; }
export function getQuestion(id) { return QUESTION_BY_ID[id] ?? null; }
export function getAnswer(id) { return ANSWER_BY_ID[id] ?? null; }
export function getAction(id) { return ACTION_BY_ID[id] ?? null; }
export function getEffectsForAnswer(id) { return EFFECTS_BY_ANSWER_ID[id] ?? Object.freeze([]); }
export function getAnswersForQuestion(id) { return ANSWERS_BY_QUESTION_ID[id] ?? Object.freeze([]); }
export function isRuntimeQuestion(row) { const status = String(row?.['Runtime Status'] ?? '').toLowerCase(); return status.includes('active') || status.includes('conditional') || status.includes('member-controlled'); }
export function isExecutableEffect(row) { return String(row?.['Runtime Status'] ?? '').toLowerCase() === 'executable'; }
