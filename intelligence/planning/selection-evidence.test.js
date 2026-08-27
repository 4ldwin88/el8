import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPlan} from './plan-engine.js';

const driver=(id,extra={})=>({id,confidence:.85,memberImportance:4,urgency:3,readiness:3,...extra});

test('money pressure cannot become generic financial advice without clarifying the actual need',()=>{
  const plan=buildPlan({ranked:[driver('money_pressure')]},{capacity:'medium'});
  assert.equal(plan.status,'deepen');
  assert.deepEqual(plan.selectionDeepening.requirements.map(x=>x.evidenceKey),['financial.current_snapshot']);
});

test('sleep concern cannot become sleep prescription before current pattern is known',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep')]},{capacity:'medium'});
  assert.equal(plan.status,'deepen');
  assert.deepEqual(plan.selectionDeepening.requirements.map(x=>x.evidenceKey),['baseline.sleep_pattern']);
});

test('two supported concerns request only their decision-changing evidence',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep'),driver('low_activity')]},{capacity:'medium'});
  assert.equal(plan.status,'deepen');
  assert.deepEqual(plan.selectionDeepening.requirements.map(x=>x.evidenceKey).sort(),['baseline.activity_level','baseline.sleep_pattern']);
});

test('partial selection evidence asks only what remains missing',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep'),driver('low_activity')]},{capacity:'medium',selectionEvidence:{'baseline.sleep_pattern':'5–6 hours, inconsistent'}});
  assert.equal(plan.status,'deepen');
  assert.deepEqual(plan.selectionDeepening.requirements.map(x=>x.evidenceKey),['baseline.activity_level']);
});

test('unsupported secondary concern does not create needless deepening burden',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep'),driver('low_activity',{confidence:.3})]},{capacity:'medium'});
  assert.equal(plan.status,'deepen');
  assert.deepEqual(plan.selectionDeepening.requirements.map(x=>x.evidenceKey),['baseline.sleep_pattern']);
});

test('safety hold outranks all normal selection questioning',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep')]},{safetyHold:true});
  assert.equal(plan.status,'escalate');
  assert.equal(plan.selectionDeepening,undefined);
});

test('lack of consent outranks normal selection questioning',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep')]},{consent:false});
  assert.equal(plan.status,'observe');
  assert.equal(plan.reason,'member_consent_required');
  assert.equal(plan.selectionDeepening,undefined);
});

test('no capacity still requires enough evidence to know what would be selected before capacity hold',()=>{
  const before=buildPlan({ranked:[driver('poor_sleep')]},{capacity:'none'});
  assert.equal(before.status,'deepen');
  const after=buildPlan({ranked:[driver('poor_sleep')]},{capacity:'none',selectionEvidence:{'baseline.sleep_pattern':'5–6 hours'}});
  assert.equal(after.status,'observe');
  assert.equal(after.reason,'capacity_hold');
});

test('selection evidence completion permits bounded composition, not unlimited recommendations',()=>{
  const plan=buildPlan({ranked:[driver('poor_sleep'),driver('low_activity')]},{capacity:'medium',selectionEvidence:{'baseline.sleep_pattern':'5–6 hours','baseline.activity_level':'one short walk weekly'}});
  assert.equal(plan.status,'active');
  assert.ok(plan.active.length>=1&&plan.active.length<=2);
});
