const clamp01=n=>Math.max(0,Math.min(1,Number(n)||0));

// Answer effects are deliberately separate from question-selection scores.
// Selection asks: is this worth asking now?
// Evidence asks: after an answer, what did EL8 actually learn?
export function normalizeAnswerEffect(effect={}){
  return {
    signal:effect.signal??null,
    dimensions:effect.dimensions??{},
    uncertaintyReduction:clamp01(effect.uncertainty_reduction??effect.uncertaintyReduction??0),
    confidence:clamp01(effect.confidence??1),
    severity:Number(effect.severity??0),
    direction:Number(effect.direction??0),
    triggers:[...(effect.triggers??[])],
    resolves:[...(effect.resolves??[])],
    notes:effect.notes??null
  };
}

export function resolveAnswerEvidence(question,answer){
  const map=question.answer_evidence??question.answerEvidence??{};
  const raw=Array.isArray(answer)
    ? answer.flatMap(v=>map[v]??[])
    : (map[answer]??[]);
  const effects=(Array.isArray(raw)?raw:[raw]).filter(Boolean).map(normalizeAnswerEffect);
  return effects;
}

export function applyAnswerEvidence(state={},effects=[]){
  const next={
    ...state,
    uncertaintyBySignal:{...(state.uncertaintyBySignal??{})},
    dimensionEvidence:{...(state.dimensionEvidence??{})},
    activeTriggers:[...(state.activeTriggers??[])],
    evidenceLog:[...(state.evidenceLog??[])]
  };
  const triggers=new Set(next.activeTriggers);
  for(const e of effects){
    if(e.signal){
      const prior=next.uncertaintyBySignal[e.signal]??1;
      next.uncertaintyBySignal[e.signal]=clamp01(prior*(1-e.uncertaintyReduction*e.confidence));
    }
    for(const signal of e.resolves){
      const prior=next.uncertaintyBySignal[signal]??1;
      next.uncertaintyBySignal[signal]=clamp01(prior*(1-e.uncertaintyReduction*e.confidence));
    }
    for(const [dimension,weight] of Object.entries(e.dimensions)){
      const prior=next.dimensionEvidence[dimension]??{net:0,observations:0};
      next.dimensionEvidence[dimension]={net:prior.net+(Number(weight)||0)*e.confidence,observations:prior.observations+1};
    }
    e.triggers.forEach(t=>triggers.add(t));
    next.evidenceLog.push(e);
  }
  next.activeTriggers=[...triggers];
  return next;
}

export function informationGain(before={},after={}){
  const keys=new Set([...Object.keys(before.uncertaintyBySignal??{}),...Object.keys(after.uncertaintyBySignal??{})]);
  let gain=0;
  for(const k of keys) gain+=(before.uncertaintyBySignal?.[k]??1)-(after.uncertaintyBySignal?.[k]??1);
  return Math.max(0,gain);
}
