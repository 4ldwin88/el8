import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONS, ANSWERS, EFFECTS, ACTIONS, ACTION_EVIDENCE_REGISTRY, PROTOCOL_STANDARDS } from '../../intelligence/registries/index.js';

const ids=(rows,key)=>new Set(rows.map(r=>r[key]).filter(Boolean));
const splitIds=value=>String(value??'').split(';').map(v=>v.trim()).filter(Boolean);

test('R01 governed Question/Answer/Effect graph has no orphan runtime references',()=>{
 const q=ids(QUESTIONS,'Question ID'),a=ids(ANSWERS,'Answer ID');
 assert.equal(q.size,QUESTIONS.length);
 assert.equal(a.size,ANSWERS.length);
 for(const row of ANSWERS) assert.ok(q.has(row['Parent Question ID']),`orphan answer ${row['Answer ID']}`);
 for(const row of EFFECTS) assert.ok(a.has(row['Answer ID']),`orphan effect ${row['Effect ID']}`);
});

test('R01 every canonical Action carries the governed intervention contract fields',()=>{
 const required=['Action ID','Dimension','Action','Use When','Minimum Evidence','Default Duration / Review','Measure / Expected Signal','Burden','Exclusions / Contraindications','Stop / Reconsider','Safety / Referral Rule','Status','Icon Key','Tracking Contract ID (inline governed contract)','Eligibility Contract ID (inline governed contract)','Additional Assessment Trigger','Review Trigger','Permitted Member-Facing Rationale / Claim Ceiling','Evidence Basis / Source IDs','Evidence Strength','Permitted Recommendation Rationale / Claim','Evidence Review Status','Action Evidence Tier','Recommendation Eligibility','Planning Evidence Class'];
 for(const action of ACTIONS) for(const field of required) assert.ok(String(action[field]??'').trim(),`${action['Action ID']} missing ${field}`);
});

test('R01 Action contract identifiers and icon keys are unique',()=>{
 for(const field of ['Action ID','Tracking Contract ID (inline governed contract)','Eligibility Contract ID (inline governed contract)','Icon Key']){
  const values=ACTIONS.map(a=>a[field]); assert.equal(new Set(values).size,values.length,`duplicate ${field}`);
 }
});

test('R01 Action evidence registry never points to a nonexistent Action',()=>{
 const actionIds=ids(ACTIONS,'Action ID');
 for(const row of ACTION_EVIDENCE_REGISTRY) for(const actionId of splitIds(row['Applicable Action IDs'])) assert.ok(actionIds.has(actionId),`${row['Source ID']} references missing ${actionId}`);
});

test('R01 every Action evidence Source ID resolves to governed evidence registry metadata',()=>{
 const sourceRows=new Map(ACTION_EVIDENCE_REGISTRY.map(r=>[r['Source ID'],r]));
 for(const action of ACTIONS){
  const sourceIds=[...String(action['Evidence Basis / Source IDs']??'').matchAll(/SRC\d{6}/g)].map(m=>m[0]);
  assert.ok(sourceIds.length>0,`${action['Action ID']} has no governed Source ID`);
  for(const sourceId of sourceIds) assert.ok(sourceRows.has(sourceId),`${action['Action ID']} references unmapped ${sourceId}`);
 }
});

test('R01 externally unreviewed Actions cannot claim external-test eligibility',()=>{
 for(const action of ACTIONS){
  const review=String(action['Evidence Review Status']??'').toLowerCase();
  const eligibility=String(action['Recommendation Eligibility']??'').toLowerCase();
  if(review.includes('external-test')&&review.includes('pending')) assert.ok(eligibility.includes('external-test')&&/(requires|pending|not eligible|blocked)/.test(eligibility),`${action['Action ID']} external eligibility outruns review`);
 }
});

test('R01 protocol governance includes required Safety, evidence, explainability, measurement, stop, tracking, evidence and claim controls',()=>{
 const standards=new Set(PROTOCOL_STANDARDS.map(r=>r.Standard));
 for(const required of ['Safety first','Minimum evidence','Member choice','Smallest useful scope','Explainability','Measurement','Stop condition','Action-linked evidence capture','Evidence-backed rationale','Claim discipline']) assert.ok(standards.has(required),`missing protocol standard ${required}`);
});
