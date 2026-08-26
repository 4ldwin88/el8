import {observationsForAnswer} from '../../intelligence/discovery/question-bank-adapter.js';
import {deriveConcernState} from '../../intelligence/discovery/concern-projection.js';

export function observationsFromReassessmentAnswers(questions=[],answers={},options={}){
  return questions.flatMap(q=>observationsForAnswer(q,answers[q.id]??[],options));
}

export function mergeReassessmentDrivers({existingDrivers=[],questions=[],answers={},timestamp=Date.now()}={}){
  const observations=observationsFromReassessmentAnswers(questions,answers,{timestamp});
  const ids=[...new Set([...existingDrivers.map(d=>d.id).filter(Boolean),...observations.flatMap(o=>[o.concernId,...(o.effects||[]).map(e=>e.target)]).filter(Boolean)])];
  const prior=new Map(existingDrivers.map(d=>[d.id,d]));
  const drivers=ids.map(id=>{
    const projected=deriveConcernState(observations,id),old=prior.get(id)||{},priorConfidence=Number(old.confidence??old.evidenceConfidence??0),newConfidence=Number(projected.evidenceConfidence||0);
    return {...old,id,confidence:Math.max(priorConfidence,newConfidence),evidenceConfidence:Math.max(priorConfidence,newConfidence),evidenceRefs:[...new Set([...(old.evidenceRefs||[]),...projected.evidenceRefs])],feasibility:projected.feasibility};
  });
  return {observations,drivers};
}
