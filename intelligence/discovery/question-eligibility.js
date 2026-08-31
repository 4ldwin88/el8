import {questionRedundantWithFacts,semanticCoverage} from './semantic-question-coverage.js';

export function contradictionDetected(constructId,observationLog){
  const effects=observationLog.flatMap(o=>o.effects??[]).filter(e=>e.type==='evidence'&&e.target===constructId&&e.polarity!=='neutral');
  return effects.some(a=>effects.some(b=>a!==b&&a.polarity!==b.polarity));
}

export function isQuestionEligible(question,state,observationLog,facts={}){
  if(!question||!state)return false;
  if(questionRedundantWithFacts(question,facts))return false;
  if(typeof question.prerequisite==='function'&&!question.prerequisite(state,observationLog))return false;
  const frontier=state.specificityFrontier??0,level=question.specificityLevel??0;
  if(level<frontier&&!contradictionDetected(state.constructId,observationLog))return false;
  return true;
}

export function eligibleQuestions(questions,states,observationLog,facts={}){
  const byId=new Map(states.map(s=>[s.constructId,s]));
  return questions.filter(q=>{
    const targets=[q.constructId,...(q.constructIds??[])].filter(Boolean);
    if(!targets.length)return false;
    return targets.some(id=>isQuestionEligible(q,byId.get(id),observationLog,facts));
  });
}

export function questionCoverage(question,facts={}){return semanticCoverage(question,facts);}
