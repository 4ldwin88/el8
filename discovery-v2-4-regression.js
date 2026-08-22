import {session,answer,next,trace} from './discovery-v2-engine.js';

const CASES=[
  {id:'work',opening:['work'],required:'W3'},
  {id:'relationships',opening:['relationships'],required:'R3'},
  {id:'support',opening:['support'],required:'S3'},
  {id:'focus',opening:['focus'],required:'F2'}
];

function runCase(c){
  const s=session();
  answer(s,'G1',c.opening);
  const first=next(s);
  const premature=trace(s).signals.find(x=>x.id===c.id)?.status!=='open';
  return {id:c.id,required:c.required,firstQuestion:first?.id||null,prematurelyClosed:premature,pass:first?.id===c.required&&!premature};
}

const results=CASES.map(runCase);
const failed=results.filter(x=>!x.pass);
console.log(JSON.stringify({suite:'Discovery v2.4 concern sufficiency',results,passed:failed.length===0},null,2));
if(failed.length) process.exit(1);
