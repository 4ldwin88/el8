// EL8 adaptive question selector v0.4
// Pure/deterministic: receives member context + candidate questions and returns ranked candidates.

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const arr=v=>Array.isArray(v)?v:[];
const idOf=q=>q.id??q.question_key;
const signalOf=q=>q.signal??q.signal_map?.signal??null;
const triggersOf=q=>arr(q.triggers??q.intelligence_triggers??q.eligibility_triggers);
const safetyRelevant=q=>Boolean(q.safety_relevant||q.safety_rules?.safety_relevant);
const safetyOverride=(q,c)=>Boolean(q.safety_rules?.override_burden&&c.safetyTriggered);

function triggerFit(q,c){const active=new Set(arr(c.activeTriggers)),triggers=triggersOf(q);if(!triggers.length)return .6;const hits=triggers.filter(t=>active.has(t)).length;return hits?clamp(hits/triggers.length+.35,0,1):0}
function dependenciesMet(q,c){const evidence=new Set([...arr(c.availableEvidence),...arr(c.completedQuestionIds)]);return arr(q.dependencies).every(dep=>{if(dep==='candidate_dimensions>=2')return arr(c.candidateDimensions).length>=2;return evidence.has(dep)})}
function freshnessNeed(q,c){const age=c.evidenceAgeDays?.[signalOf(q)];if(age==null)return 1;const stale=q.stale_after_days;if(stale==null||stale<=0)return .5;return clamp(age/stale,.15,1)}
function uncertaintyNeed(q,c){const signal=signalOf(q),explicit=c.uncertaintyBySignal?.[signal];if(explicit!=null)return clamp(explicit,0,1);return arr(c.uncertainSignals).includes(signal)?1:.55}
function redundancyPenalty(q,c){const recent=new Set(arr(c.recentQuestionIds)),signals=new Set(arr(c.recentSignals));if(recent.has(idOf(q)))return 1;if(signals.has(signalOf(q)))return .45;return 0}
function frictionPenalty(c){const f=clamp(c.friction??0,0,1),capacity=clamp(c.capacity??1,0,1);return clamp(f*.7+(1-capacity)*.6,0,1)}

// Expected information gain (EIG) estimates how much uncertainty a question is likely
// to remove before we ask it. Caller-supplied answer probabilities are preferred;
// otherwise the selector uses an intentionally conservative uniform distribution.
export function expectedInformationGain(question,context={}){
 const evidence=question.answer_evidence??question.answerEvidence;
 if(!evidence||typeof evidence!=='object')return null;
 const options=arr(question.options);if(!options.length)return null;
 const supplied=context.answerProbabilities?.[idOf(question)]??{};
 let weights=options.map(o=>Math.max(0,Number(supplied[o]??0)));
 const suppliedTotal=weights.reduce((a,b)=>a+b,0);
 if(suppliedTotal<=0)weights=options.map(()=>1/options.length);else weights=weights.map(x=>x/suppliedTotal);
 let eig=0;
 options.forEach((option,i)=>{
   const raw=evidence[option];const effects=arr(raw).length?arr(raw):raw?[raw]:[];
   if(!effects.length)return;
   // Multiple effects from one answer can resolve several signals. Cap at 1 so a
   // broad answer does not receive an unlimited bonus merely for touching more fields.
   const gain=clamp(effects.reduce((sum,e)=>sum+clamp((e.uncertainty_reduction??e.uncertaintyReduction??0)*(e.confidence??1),0,1),0),0,1);
   eig+=weights[i]*gain;
 });
 return clamp(eig,0,1);
}

export function scoreQuestion(question,context={}){
 const id=idOf(question),override=safetyOverride(question,context);
 if(!id||(question.active===false&&!context.includeInactive))return{eligible:false,score:-Infinity,reason:'inactive'};
 if(!dependenciesMet(question,context))return{eligible:false,score:-Infinity,reason:'dependencies'};
 const trigger=triggerFit(question,context);if(trigger===0&&!override)return{eligible:false,score:-Infinity,reason:'trigger'};
 const uncertainty=uncertaintyNeed(question,context),freshness=freshnessNeed(question,context),iv=clamp((question.information_value??3)/5,0,1),action=clamp((question.actionability??3)/5,0,1),burden=clamp((question.burden??question.burden_cost??1)/5,0,1),redundancy=redundancyPenalty(question,context),friction=override?0:frictionPenalty(context),eig=expectedInformationGain(question,context);
 // Matrix-backed EIG refines information value; it does not replace relevance,
 // actionability, freshness, burden or trigger eligibility.
 const learnedValue=eig==null?iv:clamp(iv*.55+eig*.45,0,1);
 const value=uncertainty*learnedValue*action*freshness*trigger,penalty=burden*.22+redundancy*.45+friction*burden*.45,score=override?Math.max(value-penalty,.75):value-penalty;
 return{eligible:true,score,components:{uncertainty,informationValue:iv,expectedInformationGain:eig,learnedValue,actionability:action,freshnessNeed:freshness,triggerFit:trigger,burden,redundancy,friction,signal:signalOf(question),safetyRelevant:safetyRelevant(question),safetyOverride:override}}
}

export function selectQuestions(candidates,context={},options={}){
 const maxQuestions=options.maxQuestions??context.maxQuestions??2,maxBurden=options.maxBurden??context.maxBurden??(context.capacity!=null&&context.capacity<.4?1:3),minScore=options.minScore??.08;
 const scored=arr(candidates).map(question=>({question,...scoreQuestion(question,context)})).filter(x=>x.eligible&&x.score>=minScore).sort((a,b)=>b.score-a.score||String(idOf(a.question)).localeCompare(String(idOf(b.question))));
 const selected=[];let burdenUsed=0;for(const item of scored){const burden=item.question.burden??item.question.burden_cost??1,override=safetyOverride(item.question,context);if(!override&&(selected.length>=maxQuestions||burdenUsed+burden>maxBurden))continue;selected.push(item);if(!override)burdenUsed+=burden}
 return{selected,ranked:scored,burdenUsed,maxQuestions,maxBurden}
}
