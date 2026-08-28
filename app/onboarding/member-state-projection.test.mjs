import test from 'node:test';
import assert from 'node:assert/strict';
import {projectOnboardingMemberState} from './member-state-projection.js';
import {applyMemberPriorityDecision} from './member-state-priority-decision.js';

const now='2026-08-27T00:00:00.000Z';
function discovery(){return{trace:{states:[{concernId:'poor_sleep',evidenceRefs:['e:sleep']},{concernId:'money_pressure',evidenceRefs:['e:money']}]},baselineHandoff:{signals:{feasibility:{overall_load:'Difficult',time:'<5 min'}}}}}

test('Discovery establishes baseline and supported problems before any priority decision',()=>{const s=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:discovery(),now});assert.equal(s.baseline.status,'ESTABLISHED');assert.deepEqual(s.problems.map(p=>[p.id,p.status]),[['problem:poor_sleep','SUPPORTED'],['problem:financial_strain','SUPPORTED']]);assert.deepEqual(s.evidence.map(e=>e.id),['e:sleep','e:money']);assert.deepEqual(s.priorities,[]);assert.equal(s.revision,0);assert.equal(s.engagementBurden.capacity,'low')});
test('member confirmation is a later canonical transition with explicit order',()=>{const baseline=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:discovery(),now});const s=applyMemberPriorityDecision(baseline,['money_pressure','poor_sleep'],{at:now});assert.deepEqual(s.priorities.map(p=>[p.id,p.problemId,p.status,p.rank]),[['priority:money_pressure','problem:financial_strain','ACCEPTED',1],['priority:poor_sleep','problem:poor_sleep','ACCEPTED',2]]);assert.equal(s.revision,1);assert.equal(s.history.at(-1).type,'PRIORITIES_UPDATED');assert.equal(baseline.priorities.length,0)});
test('priority confirmation cannot invent an unsupported problem',()=>{const baseline=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:discovery(),now});assert.throws(()=>applyMemberPriorityDecision(baseline,['stress'],{at:now}),/supported problem/)});
test('projection accepts already canonical problem ids without inventing another namespace',()=>{const d={trace:{states:[{concernId:'problem:stress',evidenceRefs:['e:stress']}]},baselineHandoff:{signals:{feasibility:{}}}};const s=projectOnboardingMemberState({memberId:'member:test',discoveryOutput:d,now});assert.equal(s.problems[0].id,'problem:stress')});
