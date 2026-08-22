// EL8 Intelligence — Discovery -> Prioritization handoff v1
// Converts Discovery's evidence model into an auditable candidate set.

const TERMINAL = new Set(['resolved','linked','cleared','deferred']);

function normalizeTrace(trace={}) {
  return {
    ranked: Array.isArray(trace.ranked) ? trace.ranked : [],
    signals: Array.isArray(trace.signals) ? trace.signals : [],
    exitReason: trace.exitReason || null,
    coherent: trace.coherent !== false
  };
}

function signalState(signals, hypothesisId) {
  const relevant = signals.filter(s => (s.targets || []).includes(hypothesisId));
  if (!relevant.length) return {raised:false,resolved:false,deferred:false,evidenceRefs:[]};
  return {
    raised:true,
    resolved:relevant.some(s => TERMINAL.has(s.status) && s.status !== 'deferred'),
    deferred:relevant.some(s => s.status === 'deferred'),
    evidenceRefs:[...new Set(relevant.flatMap(s => s.evidenceRefs || []))]
  };
}

function priorityScore(item,state) {
  const confidence = Math.max(0, Math.min(1.5, Number(item.score) || 0));
  const direct = Math.max(-1, Math.min(1, Number(item.direct) || 0));
  const memberRaised = state.raised ? 0.18 : 0;
  const resolvedEvidence = state.resolved ? 0.12 : 0;
  const deferredPenalty = state.deferred ? 0.3 : 0;
  return +(confidence + Math.max(0,direct)*0.2 + memberRaised + resolvedEvidence - deferredPenalty).toFixed(3);
}

function buildPrioritizationCandidates(discoveryTrace,{limit=5,minScore=.25}={}) {
  const t=normalizeTrace(discoveryTrace);
  return t.ranked
    .map(item=>{
      const state=signalState(t.signals,item.id);
      return {
        id:item.id,
        discoveryScore:Number(item.score)||0,
        belief:Number(item.belief)||0,
        direct:Number(item.direct)||0,
        memberRaised:state.raised,
        discoveryResolved:state.resolved,
        discoveryDeferred:state.deferred,
        evidenceRefs:state.evidenceRefs,
        priorityScore:priorityScore(item,state)
      };
    })
    .filter(x=>x.priorityScore>=minScore)
    .sort((a,b)=>b.priorityScore-a.priorityScore)
    .slice(0,limit);
}

function handoff(discoveryTrace,options={}) {
  const t=normalizeTrace(discoveryTrace);
  const candidates=buildPrioritizationCandidates(t,options);
  return {
    version:'Prioritization Handoff v1',
    discoveryExitReason:t.exitReason,
    discoveryCoherent:t.coherent,
    candidates,
    requiresReview:!t.coherent || candidates.some(x=>x.discoveryDeferred),
    readyForPrioritization:t.coherent && candidates.length>0
  };
}

export {buildPrioritizationCandidates,handoff};
export default {buildPrioritizationCandidates,handoff};
