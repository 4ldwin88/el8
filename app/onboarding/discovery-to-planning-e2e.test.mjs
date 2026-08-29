import test from 'node:test';
import assert from 'node:assert/strict';
import * as Discovery from '../../intelligence/discovery/discovery-engine.js';
import {finishDiscovery} from './discovery-runtime.js';
import {projectOnboardingMemberState} from './member-state-projection.js';
import {buildCanonicalBrowserPriorities} from './canonical-browser-prioritization.js';
import {buildCanonicalBrowserPlan} from './canonical-browser-plan.js';

function answerFor(question){
 const byId={G1:['money','health'],M3:['expenses'],PH0:['body'],M1:['often'],M9:['time'],HOF1:['yes']};
 const selected=byId[question.id];
 if(selected)return selected;
 const preferred=['often','sometimes','difficult','quite','very','body','expenses','time','none','yes'];
 const ids=(question.options||[]).map(o=>o.id);
 const id=preferred.find(x=>ids.includes(x))||ids.find(x=>!['unsure','prefer_not','not_sure'].includes(x));
 if(!id)throw new Error(`No deterministic E2E answer for ${question.id}`);
 return [id];
}

function establishSupportedConcerns(session){
 for(const state of Discovery.trace(session).states){
  if(['money','health'].includes(state.concernId)&&(state.evidenceRefs||[]).length)Discovery.resolve(session,state.concernId,'established');
 }
}

function runDiscovery(){
 const session=Discovery.session();
 let guard=0;
 while(guard++<30){
  const step=Discovery.next(session);
  if(step.type==='question'){
   Discovery.answer(session,step.question,answerFor(step.question));
   if(session.phase==='deepen-fit')establishSupportedConcerns(session);
   continue;
  }
  if(step.type==='triage'){
   Discovery.triage(session,Object.fromEntries(session.concernIds.map(id=>[id,3])));
   establishSupportedConcerns(session);
   continue;
  }
  if(step.type==='finish'){
   assert.equal(step.stop.incomplete,false,`Discovery stopped incomplete: ${step.stop.reason}`);
   return finishDiscovery(session);
  }
  throw new Error(`Unexpected Discovery step: ${step.type}`);
 }
 throw new Error('Discovery E2E guardrail exceeded');
}

test('accelerated adaptive Discovery reaches canonical Planning without dropping a selected concern',()=>{
 const discoveryOutput=runDiscovery();
 const active=new Set(discoveryOutput.trace.activeConcerns);
 assert.ok(active.has('money'));
 assert.ok(active.has('health'));
 assert.ok(discoveryOutput.trace.asked.includes('G1'));
 assert.ok(discoveryOutput.trace.asked.includes('M3'));
 assert.ok(discoveryOutput.trace.asked.includes('PH0'));
 assert.ok(discoveryOutput.trace.asked.includes('M9'),'money concern must gather plan-fit evidence before handoff');
 assert.equal(discoveryOutput.trace.facts.handoffUnderstanding,'accurate');

 const memberState=projectOnboardingMemberState({memberId:'member:e2e',discoveryOutput,now:'2026-08-29T12:00:00.000Z'});
 const supported=new Set(memberState.problems.map(p=>p.id));
 assert.ok(supported.has('problem:financial_strain'),'money must survive Discovery projection');
 assert.ok(supported.has('problem:low_activity'),'health must survive Discovery projection');

 const prioritization=buildCanonicalBrowserPriorities({memberState,discoveryOutput});
 assert.ok(prioritization.candidates.length>=2,'both supported concerns must reach Prioritization');
 const confirmed=prioritization.candidates.slice(0,2).map(x=>x.problemId);
 memberState.priorities=confirmed.map(problemId=>({id:`priority:${problemId.replace(/^problem:/,'')}`,problemId,status:'ACCEPTED'}));
 memberState.revision=1;

 const planning=buildCanonicalBrowserPlan({discoveryOutput,confirmedPriorities:confirmed,memberState});
 assert.ok(['active','deepen'].includes(planning.plan.status),'canonical Planning must return an actionable or explicitly deepening result');
 assert.ok(planning.plan.active?.length||planning.view.selectionDeepening?.required,'Planning cannot silently return an empty terminal result');
});
