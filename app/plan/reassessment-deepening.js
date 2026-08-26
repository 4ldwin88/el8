import {DISCOVERY_BANK} from '../../intelligence/discovery/question-bank-adapter.js';

const alias=Object.freeze({Physical:['health','energy','sleep'],Emotional:['stress'],Social:['relationships','support'],Occupational:['work','direction'],Financial:['money'],Environmental:['home'],Intellectual:['focus','direction'],Spiritual:['direction']});
const norm=x=>String(x||'').toLowerCase();

export function reassessmentDeepeningQuestions({dimension=null,drivers=[],askedQuestionIds=[]}={}){
  const asked=new Set(askedQuestionIds),driverIds=new Set((drivers||[]).map(d=>norm(d.id))),targets=new Set([...(alias[dimension]||[]).map(norm),...driverIds]);
  const ranked=DISCOVERY_BANK.filter(q=>!asked.has(q.id)).filter(q=>['driver-discriminator','discriminator','confirmation','feasibility-probe'].includes(q.role)).map(q=>{
    const qTargets=(q.concernIds||[q.concernId]).filter(Boolean).map(norm);let score=0;
    if(qTargets.some(t=>targets.has(t)))score+=4;
    if(q.role==='driver-discriminator')score+=3;else if(q.role==='discriminator')score+=2;else if(q.role==='confirmation')score+=1;
    if(q.role==='feasibility-probe')score+=1;
    return{question:q,score};
  }).filter(x=>x.score>=4).sort((a,b)=>b.score-a.score||a.question.id.localeCompare(b.question.id));
  const chosen=[],covered=new Set();
  for(const x of ranked){const qTargets=(x.question.concernIds||[x.question.concernId]).filter(Boolean).map(norm);if(chosen.length&&qTargets.every(t=>covered.has(t))&&x.question.role!=='driver-discriminator')continue;chosen.push(x.question);qTargets.forEach(t=>covered.add(t));if(chosen.length>=3)break;}
  return chosen;
}

export function deepeningNeed({reason,dimension,drivers=[],askedQuestionIds=[]}={}){
  if(!['insufficient_driver_evidence','no_eligible_authorized_action'].includes(reason))return{required:false,questions:[]};
  const questions=reassessmentDeepeningQuestions({dimension,drivers,askedQuestionIds});
  return{required:true,reason,questions,blocked:questions.length===0};
}
