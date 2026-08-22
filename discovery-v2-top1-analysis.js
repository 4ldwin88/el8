import {report} from './discovery-v2-synthetic-runner.js';
const out=report();
const rows=out.rows.filter(r=>r.truth?.length);
const misses=rows.filter(r=>!r.truth.includes(r.top1)).map(r=>({id:r.id,class:r.class,truth:r.truth,top1:r.top1,top3:r.top3,asked:r.asked,ranked:r.trace.ranked.slice(0,5)}));
const byClass={};for(const r of rows){const k=r.class||'unknown';byClass[k]??={total:0,top1:0,top3:0};byClass[k].total++;if(r.truth.includes(r.top1))byClass[k].top1++;if(r.top3.length)byClass[k].top3++;}
for(const v of Object.values(byClass)){v.top1Rate=+(v.top1/v.total).toFixed(3);v.top3Rate=+(v.top3/v.total).toFixed(3);}
const summary={scenarioCount:rows.length,top1Rate:+(rows.filter(r=>r.truth.includes(r.top1)).length/rows.length).toFixed(3),top3Rate:out.metrics.trueDriverAnyTop3,missCount:misses.length,byClass,misses};
console.log(JSON.stringify(summary,null,2));
export {summary,misses,byClass}; export default summary;