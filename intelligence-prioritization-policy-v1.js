// EL8 Prioritization Policy v1
// Prioritization is not diagnosis: it decides what deserves attention first.

const DEFAULTS={maxPrimary:1,maxSecondary:2,minPrimary:.65,minSecondary:.4,closeMargin:.18};

function prioritize(handoff,{maxPrimary=1,maxSecondary=2,minPrimary=.65,minSecondary=.4,closeMargin=.18}={}){
 const candidates=[...(handoff?.candidates||[])].sort((a,b)=>b.priorityScore-a.priorityScore);
 if(!handoff?.readyForPrioritization||!candidates.length)return{version:'Prioritization v1',primary:[],secondary:[],deferred:candidates,requiresReview:!!handoff?.requiresReview,reason:'insufficient-handoff'};
 const top=candidates[0];
 const primary=top.priorityScore>=minPrimary?[top]:[];
 const secondary=candidates.filter((x,i)=>i>0&&x.priorityScore>=minSecondary&&(top.priorityScore-x.priorityScore<=closeMargin||x.memberRaised)).slice(0,maxSecondary);
 const selected=new Set([...primary,...secondary].map(x=>x.id));
 const deferred=candidates.filter(x=>!selected.has(x.id));
 return{version:'Prioritization v1',primary:primary.slice(0,maxPrimary),secondary,deferred,requiresReview:!!handoff.requiresReview,reason:primary.length?'ranked-evidence':'below-primary-threshold'};
}

export {DEFAULTS,prioritize};
export default {DEFAULTS,prioritize};
