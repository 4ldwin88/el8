import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionTrace, validateDecisionTrace } from '../../intelligence/contracts/decision-trace.js';
import { buildPlan } from '../../intelligence/planning/planningEngine.js';

const baseInput={memberStateRevision:7,focuses:[{constructId:'ACTIVITY_LEVEL',decision:'accepted'}],evidenceRefs:['EVD000001'],constraintRefs:[],safetyDisposition:'ordinary_flow',planningContext:{byConstruct:{ACTIVITY_LEVEL:{mechanismMatch:.8,feasibility:.8,memberPreference:.8,actionability:.8,priorLearning:.5,decisionValue:.8,evidenceStrength:.8,discrimination:.7,recencyRelevance:.8,sufficiency:.8,corroboration:.7}}}};

test('T01 structured decision trace carries the required explainability fields',()=>{
 const trace=createDecisionTrace({decisionType:'test',whyThis:['x'],whyNow:['y'],whyNot:[{actionId:'ACT000003',reasonCodes:['not_selected']}],whatWouldChangeMind:['new_evidence'],evidenceRefs:['EVD000001'],alternatives:[{actionId:'ACT000003'}],policyRefs:['policy']});
 assert.deepEqual(validateDecisionTrace(trace),[]);
 for(const key of ['whyThis','whyNow','whyNot','whatWouldChangeMind','evidenceRefs','uncertaintyRefs','alternatives','policyRefs'])assert.ok(Array.isArray(trace[key]),key);
});

test('T01 Planning records WHY THIS, WHY NOW, WHY NOT, and WHAT WOULD CHANGE EL8 MIND',()=>{
 const plan=buildPlan(baseInput,{now:'2026-09-01T12:00:00.000Z'});
 assert.equal(plan.status,'proposed');
 assert.deepEqual(validateDecisionTrace(plan.decisionTrace),[]);
 assert.ok(plan.decisionTrace.whyThis.some(x=>x.startsWith('selected:ACT')));
 assert.ok(plan.decisionTrace.whyNow.includes('member_confirmed_focus'));
 assert.ok(plan.decisionTrace.whyNot.length>0);
 assert.ok(plan.decisionTrace.whatWouldChangeMind.includes('new_material_evidence'));
 assert.deepEqual(plan.decisionTrace.evidenceRefs,['EVD000001']);
 const shadow=plan.decisionTrace.diagnostics.shadow;
 assert.equal(shadow.role,'Subcon');
 assert.equal(shadow.authoritative,false);
 assert.equal(typeof shadow.model,'string');
 assert.ok(shadow.ranking.length>0);
 assert.equal(shadow.ranking[0].rank,1);
 assert.equal(typeof shadow.ranking[0].strength,'number');
 assert.equal(typeof shadow.ranking[0].confidence,'number');
 assert.deepEqual(shadow,plan.shadow);
 assert.equal('candidateScores' in plan.decisionTrace.diagnostics,false);
});

test('T02 failed/no-plan path remains diagnosable instead of returning an opaque empty result',()=>{
 const plan=buildPlan({...baseInput,focuses:[]},{now:'2026-09-01T12:00:00.000Z'});
 assert.equal(plan.status,'no_plan');
 assert.equal(plan.reason,'no_member_accepted_focus');
 assert.deepEqual(validateDecisionTrace(plan.decisionTrace),[]);
 assert.ok(plan.decisionTrace.whyNow.includes('no_member_accepted_focus'));
 assert.ok(plan.decisionTrace.whatWouldChangeMind.includes('member_accepts_governed_focus'));
});

test('T02 Safety-blocked Planning records the governing failure reason and recovery condition',()=>{
 const plan=buildPlan({...baseInput,safetyDisposition:'pause_ordinary_flow'},{now:'2026-09-01T12:00:00.000Z'});
 assert.equal(plan.status,'blocked');
 assert.equal(plan.reason,'safety_override');
 assert.ok(plan.decisionTrace.whyNow.includes('safety_override'));
 assert.ok(plan.decisionTrace.policyRefs.includes('safety_precedes_planning'));
 assert.ok(plan.decisionTrace.whatWouldChangeMind.includes('safety_disposition_cleared_by_governed_safety_flow'));
});
