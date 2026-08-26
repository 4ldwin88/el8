// Experimental Baseline -> initial-plan bridge.
// Onboarding should establish enough evidence for a basic plan without forcing full Discovery.
// Deeper causal/fit Discovery belongs downstream in plan-specific assessment/reassessment.
import {DIMENSION_CONCERN_MAP} from './baseline-discovery-handoff.js';

const LABELS={money:'Money',work:'Work',sleep:'Sleep',health:'Health',energy:'Energy',stress:'Stress',focus:'Focus',direction:'Direction',relationships:'Relationships',support:'Support',home:'Home'};
const ACTIONS={
 money:{id:'money-baseline-log',label:'Do a 2-minute money check-in',mechanism:'establish a usable financial baseline'},
 work:{id:'work-next-step',label:'Take one concrete work or income step',mechanism:'create forward movement'},
 sleep:{id:'sleep-window',label:'Keep one consistent sleep boundary',mechanism:'stabilize recovery'},
 health:{id:'health-baseline',label:'Choose one small physical-health action',mechanism:'build a sustainable baseline'},
 energy:{id:'energy-reset',label:'Take a short intentional movement break',mechanism:'support daytime energy'},
 stress:{id:'stress-reset',label:'Take a 5-minute decompression break',mechanism:'reduce immediate load'},
 focus:{id:'focus-block',label:'Protect one short focus block',mechanism:'reduce fragmentation'},
 direction:{id:'direction-step',label:'Write down the next useful step',mechanism:'turn uncertainty into action'},
 relationships:{id:'relationship-touchpoint',label:'Make one intentional connection',mechanism:'strengthen social support'},
 support:{id:'support-touchpoint',label:'Reach out to one support person',mechanism:'increase available support'},
 home:{id:'home-reset',label:'Reset one small part of your space',mechanism:'reduce environmental friction'}
};
const ATTENTION=new Set(['Struggling','Needs attention']);

function unique(xs){return [...new Set(xs.filter(Boolean))]}
export function initialPlanFromBaseline(derived={}){
 const conditions=derived.condition_baseline||{}, explicit=derived.member_priority;
 const attention=Object.entries(conditions).filter(([,v])=>ATTENTION.has(v)).map(([d])=>d);
 const dims=unique([explicit,...(derived.functional_impact||[]),...(derived.worsening||[]),...attention]).filter(d=>DIMENSION_CONCERN_MAP[d]);
 const concerns=unique(dims.flatMap(d=>DIMENSION_CONCERN_MAP[d]||[]));
 const primaryDimension=dims[0]||null;
 const primaryConcern=primaryDimension?(DIMENSION_CONCERN_MAP[primaryDimension]||[])[0]:null;
 const action=primaryConcern?ACTIONS[primaryConcern]:null;
 const lowCapacity=['Overwhelming','Difficult'].includes(derived.feasibility?.overall_load)||derived.feasibility?.time==='<5 min';
 return Object.freeze({
   version:'baseline-initial-plan-v1',status:action?'proposed':'needs_clarification',reviewDays:7,
   uncertainty:action?'Basic plan only; deepen evidence with a plan-specific assessment after acceptance.':'Baseline did not identify a sufficiently clear starting priority.',
   explanation:action?`Your Baseline points to ${primaryDimension} as the clearest place to start. This first action is intentionally small; EL8 will ask plan-specific questions next to personalize how success is measured and what should adapt.`:'EL8 needs one lightweight priority clarification before proposing a plan.',
   candidatePriorities:concerns.slice(0,4).map((id,i)=>({concernId:id,label:LABELS[id]||id,recommended:i===0,memberSelected:false,evidenceConfidence:i===0?.6:.45,source:'universal_baseline'})),
   candidateActions:action?[{...action,concernId:primaryConcern,concernLabel:LABELS[primaryConcern]||primaryConcern,evidenceConfidence:.6,memberSelected:false,source:'universal_baseline'}]:[],
   confirmedPriorities:primaryConcern?[primaryConcern]:[],selectedActionIds:action?[action.id]:[],capacity:{mode:lowCapacity?'micro':'bounded',maxConcurrentActions:lowCapacity?1:2},requiresPlanSpecificAssessment:Boolean(action)
 })
}
