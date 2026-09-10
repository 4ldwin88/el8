// Interpret the source captured with the answer, never today's registry or a
// synthetic support score. Ordinary persistence does not call this projection.
const importanceRank=Object.freeze({low:1,moderate:2,high:3,'very-high':4,1:1,2:2,3:3,4:4});
const latest=(effects,predicate)=>[...effects].reverse().find(predicate);
const unique=values=>[...new Set(values)];
const FEASIBILITY_TYPES=new Set(['feasibility','constraint','barrier','support','access','capacity']);
function feasibilityProjection(effects,constructId){const relevant=effects.filter(e=>e.target===constructId&&(FEASIBILITY_TYPES.has(e.type)||e.feasibility));const values={};for(const effect of relevant){const source=effect.feasibility&&typeof effect.feasibility==='object'?effect.feasibility:null;if(source)Object.assign(values,source);if(effect.key)values[effect.key]=effect.value}return Object.freeze({constraints:Object.freeze(relevant.filter(e=>['constraint','barrier'].includes(e.type)).map(e=>e.value??e.key).filter(Boolean)),supports:Object.freeze(relevant.filter(e=>e.type==='support').map(e=>e.value??e.key).filter(Boolean)),values:Object.freeze(values),evidenceRefs:Object.freeze(relevant.map(e=>e.questionId).filter(Boolean))})}

function sourceRecords(observations,constructId){
 return observations.flatMap(o=>(o.registryEvidence?.effects??[])
  .filter(e=>e['Target ID / Construct']===constructId)
  .map(effect=>Object.freeze({effect:structuredClone(effect),observationRef:o.id,
   factRef:`discovery:${o.id}`,questionId:o.questionId,observedAt:o.timestamp})));
}
function directConflicts(records){
 const groups=new Map();
 for(const record of records){
  // Values on different questions/scales are not commensurate.
  const key=JSON.stringify([record.questionId,record.effect.Key]);
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(record);
 }
 return [...groups.values()].filter(group=>new Set(group.map(r=>JSON.stringify(r.effect.Value))).size>1)
  .map(group=>({code:'conflicting_direct_state',questionId:group[0].questionId,
   key:group[0].effect.Key,evidenceRefs:unique(group.map(r=>r.factRef))}));
}
export function deriveConstructState(observationLog,constructId){
 if(observationLog.some(o=>o.effects?.some(e=>e.type==='evidence')))
  throw new Error('Obsolete generic Discovery evidence requires explicit reacquisition or governed migration');
 const records=sourceRecords(observationLog,constructId);
 const observations=observationLog.filter(o=>o.constructId===constructId||records.some(r=>r.observationRef===o.id)||o.effects?.some(e=>e.target===constructId));
 const effects=observations.flatMap(o=>(o.effects??[]).map(e=>({...e,questionId:e.questionId??o.questionId})));
 const ofType=(...types)=>records.filter(r=>types.includes(r.effect['Effect Type']));
 const stateEvidence=ofType('STATE');
 const uncertaintyEvidence=ofType('UNCERTAINTY');
 const unresolvedReasons=directConflicts(stateEvidence);
 for(const record of uncertaintyEvidence){
  if(stateEvidence.some(state=>state.questionId===record.questionId))
   unresolvedReasons.push({code:'unresolved_direct_state',questionId:record.questionId,evidenceRefs:[record.factRef]});
 }
 const sufficiencyBlocked=unresolvedReasons.length>0;
 const importance=latest(effects,e=>e.type==='importance'&&e.target===constructId);
 const memberPriority=latest(effects,e=>e.type==='member-priority'&&e.target===constructId);
 const safety=latest(effects,e=>e.type==='safety'&&e.target===constructId);
 const immediacy=latest(effects,e=>e.type==='immediacy'&&e.target===constructId);
 const readiness=latest(effects,e=>e.type==='readiness'&&e.target===constructId);
 const temporal=latest(effects,e=>['current','recurring'].includes(e.temporality))??latest(effects,e=>['historical','resolved'].includes(e.temporality));
 // Evidence presence and conflict are explicit below. Neither supplies a
 // governed confidence assessment; do not manufacture a calibrated category.
 const qualitativeConfidence='UNKNOWN';
 return Object.freeze({constructId,status:stateEvidence.length?(sufficiencyBlocked?'supported':'established'):'unknown',
  qualitativeConfidence,excluded:false,sufficiencyBlocked,unresolvedReasons,
  stateEvidence,facetEvidence:ofType('FACET','IMPACT'),contextEvidence:ofType('CONTEXT'),
  negativeEvidence:ofType('NEGATIVE_EVIDENCE'),uncertaintyEvidence,
  uncertaintyRefs:unique([...uncertaintyEvidence.map(r=>r.factRef),...unresolvedReasons.flatMap(r=>r.evidenceRefs)]),
  relationships:ofType('RELATIONSHIP').map(r=>Object.freeze({...r,kind:'member_reported_hypothesis',
   confidence:'unknown',direction:'unknown',evidenceRefs:[r.factRef]})),
  evidenceRefs:unique(stateEvidence.map(r=>r.factRef)),provenanceRefs:unique(records.map(r=>r.factRef)),
  observationRefs:unique(observations.map(o=>o.id)),questionRefs:unique(observations.map(o=>o.questionId)),
  memberImportance:importance?.value??null,memberImportanceRank:importanceRank[importance?.value]??0,
  memberPriority:memberPriority?.value??null,memberPrioritySelected:Boolean(memberPriority),
  safetyEscalationLevel:safety?.level??0,immediacyClass:immediacy?.value??null,readiness:readiness?.value??null,
  temporality:temporal?.temporality??'unknown',specificityFrontier:observations.reduce((m,o)=>Math.max(m,o.specificityLevel??0),0),
  feasibility:{...feasibilityProjection(effects,constructId),
   sourceEvidence:ofType('CONSTRAINT','SUPPORT','FEASIBILITY')}});
}
export function deriveAllConstructStates(observationLog,constructIds){return constructIds.map(id=>deriveConstructState(observationLog,id))}
