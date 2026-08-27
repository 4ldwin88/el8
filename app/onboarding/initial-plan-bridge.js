// Experimental Baseline -> canonical planning bridge.
// Baseline may identify candidate concerns and capacity, but it MUST NOT select interventions.
// Intervention authority belongs exclusively to the canonical Discovery -> Planning path.
import {DIMENSION_CONCERN_MAP} from './baseline-discovery-handoff.js';
const LABELS={money:'Money',work:'Work',sleep:'Sleep',health:'Health',energy:'Energy',stress:'Stress',focus:'Focus',direction:'Direction',relationships:'Relationships',support:'Support',home:'Home'};
const ATTENTION=new Set(['Struggling','Needs attention']);
function unique(xs){return [...new Set(xs.filter(Boolean))]}
export function initialPlanFromBaseline(derived={}){
 const conditions=derived.condition_baseline||{},explicit=derived.member_priority;
 const attention=Object.entries(conditions).filter(([,v])=>ATTENTION.has(v)).map(([d])=>d);
 const dims=unique([explicit,...(derived.functional_impact||[]),...(derived.worsening||[]),...attention]).filter(d=>DIMENSION_CONCERN_MAP[d]);
 const concerns=unique(dims.flatMap(d=>DIMENSION_CONCERN_MAP[d]||[]));
 const primaryDimension=dims[0]||null;
 const primaryConcern=primaryDimension?(DIMENSION_CONCERN_MAP[primaryDimension]||[])[0]:null;
 const lowCapacity=['Overwhelming','Difficult'].includes(derived.feasibility?.overall_load)||derived.feasibility?.time==='<5 min';
 return Object.freeze({version:'baseline-planning-bridge-v2',status:primaryConcern?'requires_discovery_handoff':'needs_clarification',reviewDays:null,uncertainty:primaryConcern?'Baseline identifies a starting concern, not an intervention. Discovery must establish sufficient evidence and Planning must select any action.':'Baseline did not identify a sufficiently clear starting concern.',explanation:primaryConcern?`Your Baseline points to ${primaryDimension} as a possible place to start. EL8 will verify what matters about that concern before choosing an action.`:'EL8 needs one lightweight priority clarification before continuing.',candidatePriorities:concerns.slice(0,4).map((id,i)=>({concernId:id,label:LABELS[id]||id,recommended:i===0,memberSelected:id===primaryConcern&&Boolean(explicit),source:'universal_baseline'})),candidateActions:[],confirmedPriorities:[],selectedActionIds:[],discoverySeed:primaryConcern?{concernId:primaryConcern,dimension:primaryDimension,memberPrioritySelected:Boolean(explicit),source:'universal_baseline',feasibility:{overall_load:derived.feasibility?.overall_load??null,time:derived.feasibility?.time??null,capacity:lowCapacity?'low':'medium'}}:null,capacity:{mode:lowCapacity?'micro':'bounded',maxConcurrentActions:lowCapacity?1:2},requiresDiscoveryHandoff:Boolean(primaryConcern),requiresPlanSpecificAssessment:false})
}
