import test from 'node:test';
import assert from 'node:assert/strict';
import {projectOnboardingMemberState} from './member-state-projection.js';

const now='2026-08-27T00:00:00.000Z';
function discovery(){return{trace:{states:[{concernId:'poor_sleep',evidenceRefs:['e:sleep']},{concernId:'money_pressure',evidenceRefs:['e:money']}]},baselineHandoff:{signals:{feasibility:{overall_load:'Difficult',time:'<5 min'}}}}}

test('projection translates explicit member focus into canonical supported problems and accepted priorities',()=>{const s=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:discovery(),confirmedPriorities:['poor_sleep','money_pressure'],now});assert.equal(s.schemaVersion,'1.0.0');assert.equal(s.memberId,'member:test');assert.equal(s.revision,0);assert.deepEqual(s.problems.map(p=>[p.id,p.status]),[['problem:poor_sleep','SUPPORTED'],['problem:financial_strain','SUPPORTED']]);assert.deepEqual(s.priorities.map(p=>[p.id,p.problemId,p.status,p.rank]),[['priority:poor_sleep','problem:poor_sleep','ACCEPTED',1],['priority:money_pressure','problem:financial_strain','ACCEPTED',2]]);assert.deepEqual(s.evidence.map(e=>e.id),['e:sleep','e:money']);assert.equal(s.engagementBurden.capacity,'low');assert.equal(s.activePlan.planId,null);assert.deepEqual(s.history,[])});

test('projection does not rank beyond explicit confirmed order',()=>{const s=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:discovery(),confirmedPriorities:['money_pressure','poor_sleep'],now});assert.deepEqual(s.priorities.map(p=>p.id),['priority:money_pressure','priority:poor_sleep']);assert.deepEqual(s.priorities.map(p=>p.rank),[1,2])});
test('projection accepts already canonical problem ids without inventing another namespace',()=>{const d={trace:{states:[{concernId:'problem:stress',evidenceRefs:['e:stress']}]},baselineHandoff:{signals:{feasibility:{}}}};const s=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:d,confirmedPriorities:['problem:stress'],now});assert.equal(s.problems[0].id,'problem:stress')});
test('projection requires explicit member focus',()=>{assert.throws(()=>projectOnboardingMemberState({memberId:'member:test',discoveryOutput:discovery(),confirmedPriorities:[],now}),/confirmed priorities are required/)});
