import Discovery from '../../discovery-v2-engine.js';
import { buildPlan, respondToItem, adaptPlan } from './plan-engine.js';
const clamp01=n=>Math.max(0,Math.min(1,Number(n)||0));

export function discoveryToPlan(discoverySession, context={}) {
  const trace = Discovery.trace(discoverySession);
  const ranked = (trace.ranked || []).map((x, i) => ({
    id: x.id,
    confidence: clamp01(x.confidence ?? x.score ?? Math.max(.35, 1 - i * .15)),
    evidenceScore: x.score ?? x.confidence ?? 0,
    rank: i + 1,
    breadth: x.downstreamCount ?? 1,
    urgency: x.urgency ?? 3,
    memberImportance: x.memberImportance ?? context.memberImportance?.[x.id],
    readiness: x.readiness ?? context.readiness
  }));
  return {assessment:{exitReason:trace.exitReason,questionsAsked:trace.asked?.length||0,rankedDrivers:ranked,coherent:trace.coherent!==false},plan:buildPlan({ranked,safetyHold:context.safetyHold},context)};
}
export function runAssessment(answerer,context={}){const session=Discovery.session(context.prior||{}),transcript=[];for(let step=0;step<(context.maxQuestions||8);step++){const q=Discovery.next(session);if(!q)break;const value=answerer(q,{step,session});if(value==null)break;Discovery.answer(session,q.id,value);transcript.push({questionId:q.id,value});}return{transcript,...discoveryToPlan(session,context)}}
export function respondToAssessmentPlan(result,itemId,response,context={}){if(!result?.plan)return result;return{...result,plan:respondToItem(result.plan,itemId,response,context)}}
export function reviewAssessmentPlan(result,feedback={}){if(!result?.plan)return result;return{...result,plan:adaptPlan(result.plan,feedback)}}
export function assessmentPlanView(result={}){const plan=result.plan||{};return{status:plan.status||'observe',active:(plan.active||plan.actions||[]).map(item=>({id:item.id,type:item.type||(item.informationGathering?'log':'action'),title:item.title,goal:item.goal,measurement:item.measurement,reviewDays:item.reviewDays,rationale:item.rationale})),backlogCount:(plan.backlog||[]).length,canReplace:(plan.backlog||[]).length>0,reviewDays:plan.reviewDays||null,uncertainty:plan.uncertainty||null}}
