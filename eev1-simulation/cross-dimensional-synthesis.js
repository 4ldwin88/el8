import { focusEligibility, evaluateDriverHypothesis } from './evidence-engine.js';

export const RELATION_TYPES=Object.freeze(['CO_OCCURS','POSSIBLE_DRIVER','POSSIBLE_DOWNSTREAM','SHARED_CONTEXT','UNKNOWN_RELATION']);

export function synthesizeDimensions({concerns=[],relations=[]}={}){
 const supported=concerns.filter(c=>focusEligibility(c.effects??[]).eligible).map(c=>c.id);
 const supportedSet=new Set(supported);
 const links=[];
 for(const r of relations){
  if(!RELATION_TYPES.includes(r.type)||!supportedSet.has(r.from)||!supportedSet.has(r.to)||r.from===r.to)continue;
  const driver=r.driverEffects?evaluateDriverHypothesis(r.driverEffects):{established:false};
  const causalEstablished=(r.type==='POSSIBLE_DRIVER'||r.type==='POSSIBLE_DOWNSTREAM')&&driver.established===true;
  links.push(Object.freeze({from:r.from,to:r.to,type:r.type,causalEstablished,residualUncertainty:!causalEstablished}));
 }
 return Object.freeze({supportedConcerns:Object.freeze(supported),links:Object.freeze(links),causalClaimsAllowed:links.some(x=>x.causalEstablished)});
}

export function memberFacingSynthesis(synthesis={}){
 const concerns=synthesis.supportedConcerns??[];
 if(concerns.length<2)return Object.freeze({kind:'SINGLE_CONCERN',text:null,claimsCausation:false});
 const established=(synthesis.links??[]).filter(x=>x.causalEstablished);
 if(established.length){
  return Object.freeze({kind:'ESTABLISHED_RELATION',text:`Several areas are showing up together. We have enough evidence to treat ${established[0].from} and ${established[0].to} as related for this decision, while continuing to test whether that relationship holds over time.`,claimsCausation:false});
 }
 return Object.freeze({kind:'COMPOUND_CONTEXT',text:`Several areas are showing up at the same time (${concerns.join(', ')}). That can make things feel more complicated, but EL8 will not assume one is causing another without evidence.`,claimsCausation:false});
}

export function canMergeIntoSharedAction({focusIds=[],actionSupports=[],mechanismRequiresCausation=false,establishedRelation=false}={}){
 const covers=focusIds.length>1&&focusIds.every(id=>actionSupports.includes(id));
 if(!covers)return Object.freeze({allowed:false,reason:'ACTION_DOES_NOT_COVER_ALL_FOCUSES'});
 if(mechanismRequiresCausation&&!establishedRelation)return Object.freeze({allowed:false,reason:'CAUSAL_RELATION_UNRESOLVED'});
 return Object.freeze({allowed:true,reason:null});
}
