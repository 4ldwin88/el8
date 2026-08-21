const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const sev={emotional:{struggling:1,mixed:.6,steady:.25,good:.05},physical:{poor:1,below_usual:.65,about_usual:.25,good:.05}};
const DIM_SIGNAL={Emotional:'E01',Physical:'P03'};
const familyBoost={DRIVER:.18,SPILLOVER:.12,ACTION:.08,STATE:0};

function recentSelected(history=[]){return history.slice(-6).flatMap(r=>r.intelligence_shadow?.selected||[])}
function score(q,ctx){
  const info=(q.expected_information_gain??50)/100,act=(q.actionability??50)/100,burden=(q.burden??30)/100,sens=(q.sensitivity??20)/100;
  const dim=ctx.dimensionSeverity[q.primary_dimension]??0;
  const affected=Math.max(0,...(q.affected_dimensions||[]).map(d=>ctx.dimensionSeverity[d]??0));
  const signalU=ctx.uncertainty[q.primary_signal]??Math.max(dim,affected)*.75;
  const recent=ctx.recentIds.has(q.question_key)||ctx.recentFamilies.has(q.redundancy_family);
  const bridge=(q.affected_dimensions||[]).length>1?.08:0;
  return info*.34+act*.25+signalU*.2+Math.max(dim,affected)*.16+(familyBoost[q.question_family]||0)+bridge-burden*.13-sens*.06-(recent?.55:0);
}
function eligible(q,ctx){
  if(!q.active||!q.qa_only)return false;
  if(ctx.recentIds.has(q.question_key))return false;
  const d=ctx.dimensionSeverity[q.primary_dimension]??0,a=Math.max(0,...(q.affected_dimensions||[]).map(x=>ctx.dimensionSeverity[x]??0));
  if(q.question_family==='STATE')return Math.max(d,a)>=.45;
  if(q.question_family==='DRIVER')return Math.max(d,a)>=.55;
  if(q.question_family==='SPILLOVER')return ctx.maxSeverity>=.65;
  if(q.question_family==='ACTION')return ctx.maxSeverity>=.55;
  return true;
}
export function selectMatrixQuestion({matrix=[],history=[],answers={}}={}){
  const emotional=sev.emotional[answers.emotional]??.5,physical=sev.physical[answers.physical]??.5;
  const prev=history.at(-1)?.answers||{};
  const uncertainty={E01:clamp(.2+emotional*.55+(prev.emotional?Math.abs(emotional-(sev.emotional[prev.emotional]??emotional))*.25:0)),P03:clamp(.2+physical*.55+(prev.physical?Math.abs(physical-(sev.physical[prev.physical]??physical))*.25:0))};
  const recent=recentSelected(history),ctx={dimensionSeverity:{Emotional:emotional,Physical:physical},maxSeverity:Math.max(emotional,physical),uncertainty,recentIds:new Set(recent.map(x=>x.id||x.question_key)),recentFamilies:new Set(recent.map(x=>x.redundancy_family).filter(Boolean))};
  const ranked=matrix.filter(q=>eligible(q,ctx)).map(q=>({q,score:score(q,ctx)})).sort((a,b)=>b.score-a.score);
  const best=ranked[0];
  if(!best||best.score<.38)return{engine:'question-signal-matrix-v0.1',selected:[],ranked:ranked.slice(0,5).map(x=>({id:x.q.question_key,prompt:x.q.prompt,score:+x.score.toFixed(3)})),context:{...ctx,dimensionSeverity:ctx.dimensionSeverity,recentIds:[...ctx.recentIds],recentFamilies:[...ctx.recentFamilies]}};
  const q=best.q;
  return{engine:'question-signal-matrix-v0.1',selected:[{id:q.question_key,prompt:q.prompt,signal:q.primary_signal,secondary_signals:q.secondary_signals||[],dimension:q.primary_dimension,affected_dimensions:q.affected_dimensions||[],family:q.question_family,redundancy_family:q.redundancy_family,score:+best.score.toFixed(3),options:q.options,intervention_implications:q.intervention_implications}],ranked:ranked.slice(0,5).map(x=>({id:x.q.question_key,prompt:x.q.prompt,score:+x.score.toFixed(3)})),context:{dimensionSeverity:ctx.dimensionSeverity,uncertainty,recentIds:[...ctx.recentIds],recentFamilies:[...ctx.recentFamilies]}};
}
