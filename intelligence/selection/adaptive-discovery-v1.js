// EL8 Adaptive Discovery v1
// Experimental orchestration layer. v0.13 remains the comparison baseline.
// Goal: ask the smallest useful question that can discriminate between live hypotheses.

import { scoreQuestion } from './question-selector.js';

const arr = v => Array.isArray(v) ? v : [];
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
const idOf = q => q.id ?? q.question_key;
const signalOf = q => q.signal ?? q.signal_map?.signal ?? null;

function hypothesesFor(question, context={}) {
  const explicit = arr(question.hypotheses ?? question.discriminates_hypotheses);
  if (explicit.length) return explicit;
  const signal = signalOf(question);
  return arr(context.hypotheses).filter(h => arr(h.signals).includes(signal)).map(h => h.id);
}

function hypothesisValue(question, context={}) {
  const live = new Map(arr(context.hypotheses).map(h => [h.id, h]));
  const targets = hypothesesFor(question, context).map(id => live.get(id)).filter(Boolean);
  if (!targets.length) return 0;
  const unresolved = targets.reduce((sum,h) => sum + clamp(h.uncertainty ?? (1-(h.confidence ?? 0)),0,1),0) / targets.length;
  const competition = targets.length > 1 ? Math.min(1, targets.length / 3) : .35;
  return clamp(unresolved * (.7 + competition*.3),0,1);
}

function decisionImpact(question, context={}) {
  const explicit = question.decision_impact ?? question.decisionImpact;
  if (explicit != null) return clamp(Number(explicit),0,1);
  const signal = signalOf(question);
  return arr(context.decisionRelevantSignals).includes(signal) ? 1 : .5;
}

export function scoreDiscoveryQuestion(question, context={}) {
  const base = scoreQuestion(question, context);
  if (!base.eligible) return base;
  const discrimination = hypothesisValue(question, context);
  const impact = decisionImpact(question, context);
  // Existing selector score preserves trigger, evidence, freshness, redundancy,
  // actionability and burden logic. Discovery v1 adds explicit hypothesis discrimination.
  const score = base.score * .55 + discrimination * .30 + impact * .15;
  return {...base, score, components:{...base.components, hypothesisDiscrimination:discrimination, decisionImpact:impact}};
}

export function shouldStopDiscovery(context={}, ranked=[]) {
  if (context.safetyTriggered) return {stop:false, reason:'safety-routing-required'};
  const asked = context.questionsAsked ?? 0;
  const maxQuestions = context.maxQuestions ?? 3;
  const burdenUsed = context.burdenUsed ?? 0;
  const maxBurden = context.maxBurden ?? (context.capacity != null && context.capacity < .4 ? 1 : 3);
  if (asked >= maxQuestions) return {stop:true, reason:'question-budget'};
  if (burdenUsed >= maxBurden) return {stop:true, reason:'burden-budget'};
  const live = arr(context.hypotheses).filter(h => (h.status ?? 'candidate') !== 'rejected');
  const unresolved = live.filter(h => clamp(h.uncertainty ?? (1-(h.confidence ?? 0)),0,1) > (context.uncertaintyThreshold ?? .35));
  if (live.length && !unresolved.length) return {stop:true, reason:'sufficient-confidence'};
  const best = ranked[0];
  if (!best || best.score < (context.minimumDiscoveryValue ?? .10)) return {stop:true, reason:'low-information-value'};
  return {stop:false, reason:'continue'};
}

export function selectDiscoveryQuestion(candidates, context={}) {
  const ranked = arr(candidates)
    .map(question => ({question, ...scoreDiscoveryQuestion(question, context)}))
    .filter(x => x.eligible)
    .sort((a,b) => b.score-a.score || String(idOf(a.question)).localeCompare(String(idOf(b.question))));
  const stop = shouldStopDiscovery(context, ranked);
  if (stop.stop) return {selected:null, ranked, stop};
  const maxBurden = context.maxBurden ?? (context.capacity != null && context.capacity < .4 ? 1 : 3);
  const burdenUsed = context.burdenUsed ?? 0;
  const selected = ranked.find(item => {
    const override = item.components?.safetyOverride;
    const burden = item.question.burden ?? item.question.burden_cost ?? 1;
    return override || burdenUsed + burden <= maxBurden;
  }) ?? null;
  if (!selected) return {selected:null, ranked, stop:{stop:true,reason:'burden-budget'}};
  return {selected, ranked, stop:{stop:false,reason:'continue'}};
}
