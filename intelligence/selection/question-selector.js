// EL8 adaptive question selector v0.2
// Pure/deterministic: receives member context + candidate questions and returns ranked candidates.

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const arr=v=>Array.isArray(v)?v:[];
const idOf=q=>q.id??q.question_key;
const signalOf=q=>q.signal??q.signal_map?.signal??null;
const triggersOf=q=>arr(q.triggers??q.intelligence_triggers??q.eligibility_triggers);
const safetyOf=q=>Boolean(q.safety_relevant||q.safety_rules?.safety_relevant||q.safety_rules?.override_burden);

function triggerFit(q,c){const active=new Set(arr(c.activeTriggers)),triggers=triggersOf(q);if(!triggers.length)return .6;const hits=triggers.filter(t=>active.has(t)).length;return hits?clamp(hits/triggers.length+.35,0,1):0}
function dependenciesMet(q,c){const evidence=new Set([...arr(c.availableEvidence),...arr(c.completedQuestionIds)]);return arr(q.dependencies).every(dep=>{if(dep==='candidate_dimensions>=2')return arr(c.candidateDimensions).length>=2;return evidence.has(dep)})}
function freshnessNeed(q,c){const age=c.evidenceAgeDays?.[signalOf(q)];if(age==null)return 1;const stale=q.stale_after_days;if(stale==null||stale<=0)return .5;return clamp(age/stale,.15,1)}
function uncertaintyNeed(q,c){const signal=signalOf(q),explicit=c.uncertaintyBySignal?.[signal];if(explicit!=null)return clamp(explicit,0,1);return arr(c.uncertainSignals).includes(signal)?1:.55}
function redundancyPenalty(q,c){const recent=new Set(arr(c.recentQuestionIds)),signals=new Set(arr(c.recentSignals));if(recent.has(idOf(q)))return 1;if(signals.has(signalOf(q)))return .45;return 0}
function frictionPenalty(c){const f=clamp(c.friction??0,0,1),capacity=clamp(c.capacity??1,0,1);return clamp(f*.7+(1-capacity)*.6,0,1)}

export function scoreQuestion(question,context={}){
 const id=idOf(question),safety=safetyOf(question);
 if(!id||(question.active===false&&!context.includeInactive))return{eligible:false,score:-Infinity,reason:'inactive'};
 if(!dependenciesMet(question,context))return{eligible:false,score:-Infinity,reason:'dependencies'};
 const trigger=triggerFit(question,context);if(trigger===0&&!safety)return{eligible:false,score:-Infinity,reason:'trigger'};
 const uncertainty=uncertaintyNeed(question,context),freshness=freshnessNeed(question,context),iv=clamp((question.information_value??3)/5,0,1),action=clamp((question.actionability??3)/5,0,1),burden=clamp((question.burden??question.burden_cost??1)/5,0,1),redundancy=redundancyPenalty(question,context),friction=safety?0:frictionPenalty(context);
 const value=uncertainty*iv*action*freshness*trigger,penalty=burden*.22+redundancy*.45+friction*burden*.45,score=safety?Math.max(value-penalty,.75):value-penalty;
 return{eligible:true,score,components:{uncertainty,informationValue:iv,actionability:action,freshnessNeed:freshness,triggerFit:trigger,burden,redundancy,friction,signal:signalOf(question)}}

export function selectQuestions(candidates,context={},options={}){
 const maxQuestions=options.maxQuestions??context.maxQuestions??2,maxBurden=options.maxBurden??context.maxBurden??(context.capacity!=null&&context.capacity<.4?1:3),minScore=options.minScore??.08;
 const scored=arr(candidates).map(question=>({question,...scoreQuestion(question,context)})).filter(x=>x.eligible&&x.score>=minScore).sort((a,b)=>b.score-a.score||String(idOf(a.question)).localeCompare(String(idOf(b.question))));
 const selected=[];let burdenUsed=0;for(const item of scored){const burden=item.question.burden??item.question.burden_cost??1,safety=safetyOf(item.question);if(!safety&&(selected.length>=maxQuestions||burdenUsed+burden>maxBurden))continue;selected.push(item);if(!safety)burdenUsed+=burden}
 return{selected,ranked:scored,burdenUsed,maxQuestions,maxBurden}
}
