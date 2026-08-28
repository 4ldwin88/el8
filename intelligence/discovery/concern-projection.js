const importanceRank=Object.freeze({low:1,moderate:2,high:3,'very-high':4,1:1,2:2,3:3,4:4});
function latest(effects,predicate){return[...effects].reverse().find(predicate)}
const FEASIBILITY_TYPES=new Set(['feasibility','constraint','barrier','support','access','capacity']);
function evidenceKey(effect){return effect.evidenceKey??effect.construct??effect.topic??effect.target}
function currentEvidence(evidence){
 const byKey=new Map();
 for(const effect of evidence){
  const key=evidenceKey(effect);
  if(effect.retracted===true||effect.currentStatus==='retracted'){byKey.delete(key);continue}
  if(effect.supersedesEvidenceKey)byKey.delete(effect.supersedesEvidenceKey);
  byKey.set(key,effect);
 }
 return [...byKey.values()];
}
function feasibilityProjection(effects,concernId){
 const relevant=effects.filter(e=>e.target===concernId&&(FEASIBILITY_TYPES.has(e.type)||e.feasibility));
 const values={};
 for(const effect of relevant){
  const source=effect.feasibility&&typeof effect.feasibility==='object'?effect.feasibility:null;
  if(source) Object.assign(values,source);
  if(effect.key) values[effect.key]=effect.value;
 }
 return Object.freeze({
  constraints:Object.freeze(relevant.filter(e=>['constraint','barrier'].includes(e.type)).map(e=>e.value??e.key).filter(Boolean)),
  supports:Object.freeze(relevant.filter(e=>e.type==='support').map(e=>e.value??e.key).filter(Boolean)),
  values:Object.freeze(values),
  evidenceRefs:Object.freeze(relevant.map(e=>e.questionId).filter(Boolean))
 });
}
export function deriveConcernState(observationLog,concernId){
 const observations=observationLog.filter(o=>o.concernId===concernId||o.effects?.some(e=>e.target===concernId));
 const effects=observations.flatMap((o,observationIndex)=>(o.effects??[]).map((e,effectIndex)=>({...e,questionId:e.questionId??o.questionId,observationIndex,effectIndex})));
 const evidence=currentEvidence(effects.filter(e=>e.type==='evidence'&&e.target===concernId));
 const supports=evidence.filter(e=>e.polarity==='supports'),contradicts=evidence.filter(e=>e.polarity==='contradicts'),neutral=evidence.filter(e=>e.polarity==='neutral');
 const excluded=supports.length===0&&contradicts.some(e=>e.certainty==='definitive');
 const evidenceSummary=Object.freeze({supports:Object.freeze(supports.map(e=>e.questionId).filter(Boolean)),contradicts:Object.freeze(contradicts.map(e=>e.questionId).filter(Boolean)),neutral:Object.freeze(neutral.map(e=>e.questionId).filter(Boolean))});
 const importance=latest(effects,e=>e.type==='importance'&&e.target===concernId);const memberPriority=latest(effects,e=>e.type==='member-priority'&&e.target===concernId);const safety=latest(effects,e=>e.type==='safety'&&e.target===concernId);const immediacy=latest(effects,e=>e.type==='immediacy'&&e.target===concernId);const readiness=latest(effects,e=>e.type==='readiness'&&e.target===concernId);const temporal=latest(effects,e=>['current','recurring'].includes(e.temporality))??latest(effects,e=>['historical','resolved'].includes(e.temporality));const specificityFrontier=observations.reduce((m,o)=>Math.max(m,o.specificityLevel??0),0);
 return Object.freeze({concernId,excluded,evidenceSummary,memberImportance:importance?.value??null,memberImportanceRank:importanceRank[importance?.value]??0,memberPriority:memberPriority?.value??null,memberPrioritySelected:Boolean(memberPriority),safetyEscalationLevel:safety?.level??0,immediacyClass:immediacy?.value??null,readiness:readiness?.value??null,temporality:temporal?.temporality??'unknown',specificityFrontier,feasibility:feasibilityProjection(effects,concernId),evidenceRefs:observations.map(o=>o.questionId)});
}
export function deriveAllConcernStates(observationLog,concernIds){return concernIds.map(id=>deriveConcernState(observationLog,id))}
