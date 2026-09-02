import test from 'node:test';
import assert from 'node:assert/strict';
import {createContextModifier,contextModifierReviewSchedule,markContextModifierReviewDue,confirmContextModifier,activeContextModifierRefs,CONTEXT_MODIFIER_STATUS as S} from './context-modifier-lifecycle.js';

const pregnancy=()=>createContextModifier({modifierId:'ctx-pregnancy-1',type:'PREGNANCY',value:'current',sourceType:'member_report',sourceRef:'Q:CTX-PREG',knownSince:'2026-01-10T00:00:00Z',expectedEndAt:'2026-09-01T00:00:00Z',recordedAt:'2026-03-01T00:00:00Z'});

test('estimated due/end timing schedules confirmation instead of automatic resolution',()=>{
 const m=pregnancy();const schedule=contextModifierReviewSchedule([m],{now:'2026-09-02T00:00:00Z'});
 assert.equal(schedule[0].followUpRequired,true);assert.equal(schedule[0].status,S.REVIEW_DUE);assert.equal(m.status,S.ACTIVE);
 const due=markContextModifierReviewDue(m,{now:'2026-09-02T00:00:00Z'});assert.equal(due.status,S.REVIEW_DUE);assert.notEqual(due.status,S.RESOLVED);
});

test('member confirmation closes a temporary modifier while preserving history semantics',()=>{
 const due=markContextModifierReviewDue(pregnancy(),{now:'2026-09-02T00:00:00Z'});const resolved=confirmContextModifier(due,{stillApplies:false,confirmedAt:'2026-09-02T12:00:00Z'});
 assert.equal(resolved.status,S.RESOLVED);assert.equal(resolved.lastConfirmedAt,'2026-09-02T12:00:00Z');assert.deepEqual(activeContextModifierRefs([resolved]),[]);
});

test('still-active status is refreshed rather than expired from an estimate',()=>{
 const injury=createContextModifier({modifierId:'ctx-injury-1',type:'INJURY',value:{area:'knee'},sourceType:'member_report',sourceRef:'Q:CTX-INJURY',expectedReviewAt:'2026-09-01T00:00:00Z',recordedAt:'2026-08-01T00:00:00Z'});
 const due=markContextModifierReviewDue(injury,{now:'2026-09-02T00:00:00Z'});const refreshed=confirmContextModifier(due,{stillApplies:true,confirmedAt:'2026-09-02T12:00:00Z',replacement:{expectedReviewAt:'2026-09-30T00:00:00Z'}});
 assert.equal(refreshed.status,S.ACTIVE);assert.equal(refreshed.expectedReviewAt,'2026-09-30T00:00:00Z');assert.deepEqual(activeContextModifierRefs([refreshed]),['context_modifier:ctx-injury-1']);
});

test('replacement supersedes rather than erases the prior modifier',()=>{
 const old=pregnancy();const replacement=createContextModifier({modifierId:'ctx-postpartum-1',type:'POSTPARTUM',value:'current',sourceType:'member_report',sourceRef:'Q:CTX-POST',recordedAt:'2026-09-02T12:00:00Z'});const superseded=confirmContextModifier(old,{stillApplies:false,replacement,confirmedAt:'2026-09-02T12:00:00Z'});
 assert.equal(superseded.status,S.SUPERSEDED);assert.equal(superseded.supersededByModifierId,'ctx-postpartum-1');
});
