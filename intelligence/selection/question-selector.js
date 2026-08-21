// EL8 adaptive question selector v0.1
// Pure/deterministic: receives member context + candidate questions and returns ranked candidates.

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const arr = v => Array.isArray(v) ? v : [];

function triggerFit(question, context) {
  const active = new Set(arr(context.activeTriggers));
  const triggers = arr(question.triggers ?? question.intelligence_triggers);
  if (!triggers.length) return 0.6;
  const hits = triggers.filter(t => active.has(t)).length;
  return hits ? clamp(hits / triggers.length + 0.35, 0, 1) : 0;
}

function dependenciesMet(question, context) {
  const evidence = new Set(arr(context.availableEvidence));
  return arr(question.dependencies).every(dep => {
    if (dep === 'candidate_dimensions>=2') return arr(context.candidateDimensions).length >= 2;
    return evidence.has(dep);
  });
}

function freshnessNeed(question, context) {
  const age = context.evidenceAgeDays?.[question.signal];
  if (age == null) return 1;
  const stale = question.stale_after_days;
  if (stale == null || stale <= 0) return 0.5;
  return clamp(age / stale, 0.15, 1);
}

function uncertaintyNeed(question, context) {
  const explicit = context.uncertaintyBySignal?.[question.signal];
  if (explicit != null) return clamp(explicit, 0, 1);
  return arr(context.uncertainSignals).includes(question.signal) ? 1 : 0.55;
}

function redundancyPenalty(question, context) {
  const recent = new Set(arr(context.recentQuestionIds));
  const recentSignals = new Set(arr(context.recentSignals));
  if (recent.has(question.id ?? question.question_key)) return 1;
  if (recentSignals.has(question.signal)) return 0.45;
  return 0;
}

function frictionPenalty(context) {
  const f = clamp(context.friction ?? 0, 0, 1);
  const capacity = clamp(context.capacity ?? 1, 0, 1);
  return clamp((f * 0.7) + ((1 - capacity) * 0.6), 0, 1);
}

export function scoreQuestion(question, context = {}) {
  const id = question.id ?? question.question_key;
  const safety = Boolean(question.safety_relevant || question.safety_rules?.override_burden);
  if (!id || question.active === false && !context.includeInactive) return { eligible: false, score: -Infinity, reason: 'inactive' };
  if (!dependenciesMet(question, context)) return { eligible: false, score: -Infinity, reason: 'dependencies' };
  const trigger = triggerFit(question, context);
  if (trigger === 0 && !safety) return { eligible: false, score: -Infinity, reason: 'trigger' };
  const uncertainty = uncertaintyNeed(question, context);
  const freshness = freshnessNeed(question, context);
  const iv = clamp((question.information_value ?? 3) / 5, 0, 1);
  const action = clamp((question.actionability ?? 3) / 5, 0, 1);
  const burden = clamp((question.burden ?? question.burden_cost ?? 1) / 5, 0, 1);
  const redundancy = redundancyPenalty(question, context);
  const friction = safety ? 0 : frictionPenalty(context);

  // Multiplicative value prevents a question with one weak justification from ranking highly.
  const value = uncertainty * iv * action * freshness * trigger;
  const penalty = (burden * 0.22) + (redundancy * 0.45) + (friction * burden * 0.45);
  const score = safety ? Math.max(value - penalty, 0.75) : value - penalty;
  return { eligible: true, score, components: { uncertainty, informationValue: iv, actionability: action, freshnessNeed: freshness, triggerFit: trigger, burden, redundancy, friction } };
}

export function selectQuestions(candidates, context = {}, options = {}) {
  const maxQuestions = options.maxQuestions ?? context.maxQuestions ?? 2;
  const maxBurden = options.maxBurden ?? context.maxBurden ?? (context.capacity != null && context.capacity < 0.4 ? 1 : 3);
  const minScore = options.minScore ?? 0.08;
  const scored = arr(candidates).map(question => ({ question, ...scoreQuestion(question, context) })).filter(x => x.eligible && x.score >= minScore).sort((a, b) => b.score - a.score || String(a.question.id ?? a.question.question_key).localeCompare(String(b.question.id ?? b.question.question_key)));

  const selected = [];
  let burdenUsed = 0;
  for (const item of scored) {
    const burden = item.question.burden ?? item.question.burden_cost ?? 1;
    const safety = Boolean(item.question.safety_relevant || item.question.safety_rules?.override_burden);
    if (!safety && (selected.length >= maxQuestions || burdenUsed + burden > maxBurden)) continue;
    selected.push(item);
    if (!safety) burdenUsed += burden;
  }
  return { selected, ranked: scored, burdenUsed, maxQuestions, maxBurden };
}
