import Discovery from '../../discovery-v2-engine.js';
import { buildPlan, respondToItem, adaptPlan } from './plan-engine.js';

// Thin MVP orchestration layer:
// Assessment/Discovery -> ranked candidates -> active plan + backlog -> member response -> adaptation.
export function discoveryToPlan(discoverySession, context={}) {
  const trace = Discovery.trace(discoverySession);
  const ranked = (trace.ranked || []).map((x, i) => ({
    id: x.id,
    confidence: x.confidence ?? x.score ?? Math.max(.35, 1 - i * .15),
    rank: i + 1,
    breadth: x.downstreamCount ?? 1,
    urgency: x.urgency ?? 3,
    memberImportance: x.memberImportance ?? context.memberImportance?.[x.id],
    readiness: x.readiness ?? context.readiness
  }));
  return {
    assessment: {
      exitReason: trace.exitReason,
      questionsAsked: trace.asked?.length || 0,
      rankedDrivers: ranked,
      coherent: trace.coherent !== false
    },
    plan: buildPlan({ ranked, safetyHold: context.safetyHold }, context)
  };
}

export function runAssessment(answerer, context={}) {
  const session = Discovery.session(context.prior || {});
  const transcript=[];
  for (let step=0; step<(context.maxQuestions || 8); step++) {
    const q=Discovery.next(session);
    if (!q) break;
    const value=answerer(q,{step,session});
    if (value == null) break;
    Discovery.answer(session,q.id,value);
    transcript.push({questionId:q.id,value});
  }
  return { transcript, ...discoveryToPlan(session,context) };
}

// UI-facing action: member completes, rejects or defers one surfaced item.
// Rejection/defer is not treated as failure; the queue promotes another eligible item.
export function respondToAssessmentPlan(result, itemId, response, context={}) {
  if(!result?.plan) return result;
  return {
    ...result,
    plan: respondToItem(result.plan, itemId, response, context)
  };
}

// Lightweight review after the member has had time to try the plan.
export function reviewAssessmentPlan(result, feedback={}) {
  if(!result?.plan) return result;
  return {
    ...result,
    plan: adaptPlan(result.plan, feedback)
  };
}

// Small view model for the prototype. Keeps UI ignorant of ranking internals.
export function assessmentPlanView(result={}) {
  const plan=result.plan || {};
  return {
    status:plan.status || 'observe',
    active:(plan.active || plan.actions || []).map(item=>({
      id:item.id,
      type:item.type || (item.informationGathering?'log':'action'),
      title:item.title,
      goal:item.goal,
      measurement:item.measurement,
      reviewDays:item.reviewDays,
      rationale:item.rationale
    })),
    backlogCount:(plan.backlog || []).length,
    canReplace:(plan.backlog || []).length>0,
    reviewDays:plan.reviewDays || null,
    uncertainty:plan.uncertainty || null
  };
}
