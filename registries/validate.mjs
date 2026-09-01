import { QUESTIONS, ANSWERS, EFFECTS, ACTIONS, EVIDENCE, SOURCES, RELATIONSHIPS, ID_MIGRATION_MAP } from './index.js';
function assert(c,m){if(!c)throw new Error(m)}
function unique(rows,key){const s=new Set(); for(const r of rows){const v=r[key]; if(!v)continue; assert(!s.has(v),`duplicate ${key}: ${v}`); s.add(v)} return s}
const q=unique(QUESTIONS,'Question ID'), a=unique(ANSWERS,'Answer ID'), efx=unique(EFFECTS,'Effect ID'), act=unique(ACTIONS,'Action ID'), evd=unique(EVIDENCE,'Evidence ID'), src=unique(SOURCES,'Source ID');
for(const r of ANSWERS) assert(q.has(r['Parent Question ID']),`orphan answer ${r['Answer ID']} -> ${r['Parent Question ID']}`);
for(const r of EFFECTS){assert(a.has(r['Answer ID']),`orphan effect ${r['Effect ID']} -> ${r['Answer ID']}`)}
assert(QUESTIONS.length===76,`expected 76 Questions, got ${QUESTIONS.length}`);
assert(ANSWERS.length===506,`expected 506 Answers, got ${ANSWERS.length}`);
assert(EFFECTS.length===398,`expected 398 Effects, got ${EFFECTS.length}`);
assert(ACTIONS.length===41,`expected 41 Actions, got ${ACTIONS.length}`);
assert(!RELATIONSHIPS.some(r=>r['Relationship ID']==='REL000011' && !String(r.Status??'').toLowerCase().includes('retir')), 'REL000011 must not be active');
const legacyRuntime=ID_MIGRATION_MAP.filter(r=>!r['New Permanent ID']); assert(!legacyRuntime.length,'migration rows missing permanent ID');
console.log(JSON.stringify({questions:QUESTIONS.length,answers:ANSWERS.length,effects:EFFECTS.length,actions:ACTIONS.length,evidence:EVIDENCE.length,sources:SOURCES.length,relationships:RELATIONSHIPS.length,migrations:ID_MIGRATION_MAP.length},null,2));
