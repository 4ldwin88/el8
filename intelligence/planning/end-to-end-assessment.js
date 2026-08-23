import Discovery from '../../discovery-v2-engine.js';
import { buildPlan } from './plan-engine.js';

// Thin integration layer. Keep the MVP simple: Discovery owns questioning;
// Plan Engine owns prioritization. This adapter only translates the handoff.
export function discoveryToPlan(discoverySession, context={}) {
  const trace = Discovery.trace(discoverySession);
  const ranked = (trace.ranked || []).map((x, i) => ({
    id: x.id,
    confidence: x.confidence ?? x.score ?? Math.max(.35, 1 - i * .15),
    rank: i + 1,
    breadth: x.downstreamCount ?? 1,
    urgency: x.urgency ?? 3
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
