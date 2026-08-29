// Production browser projection from completed Discovery into canonical Member State.
// Discovery supplies the evidence and supported problems that define the initial member snapshot.
// Baseline is that immutable snapshot at completed Discovery; Prioritization is a later decision.
import {canonicalMemberProblemId} from './canonical-problem-map.js';

const DIMENSIONS=['physical','emotional','social','intellectual','spiritual','occupational','financial','environmental'];
const candidateRows=output=>output?.trace?.states||[];
const normalizeCondition=value=>({'Struggling':'Attention','Needs attention':'Attention','Not great':'Attention','Okay':'Stable','Good':'Healthy','Going well':'Thriving','Very strong':'Thriving','Beyond':'Thriving'}[value]||null);
function dimensionConditions(discoveryOutput={}){
 const signals=discoveryOutput.baselineHandoff?.signals||{},conditions={};
 for(const signal of signals.indicatorSignals||[]){const dimension=String(signal?.dimension||'').toLowerCase();if(!DIMENSIONS.includes(dimension))continue;const condition=normalizeCondition(signal?.condition??signal?.rating??signal?.labelValue??signal?.valueLabel??(signal?.value===1?'Struggling':signal?.value===2?'Not great':signal?.value===3?'Okay':signal?.value===4?'Good':signal?.value===5?'Going well':null));if(!condition)continue;const previous=conditions[dimension];const order=['Attention','Stable','Healthy','Thriving'];if(!previous||order.indexOf(condition)<order.indexOf(previous))conditions[dimension]=condition}
 for(const signal of signals.legacy?.dimensionSignals||[]){const dimension=String(signal?.dimension||'').toLowerCase();if(!DIMENSIONS.includes(dimension)||conditions[dimension])continue;const condition=normalizeCondition(signal?.condition);if(condition)conditions[dimension]=condition}
 return conditions;
}
export function projectOnboardingMemberState({memberId,discoveryOutput,now=new Date().toISOString()}){
 if(!memberId||!discoveryOutput)throw new Error('memberId and completed Discovery output are required');
 const evidence=[],problems=[];
 for(const row of candidateRows(discoveryOutput)){const id=row.concernId||row.sourceConcernId||row.id;if(!id)continue;const refs=[...(row.evidenceRefs||row.observationRefs||[])];for(const ref of refs)if(!evidence.some(x=>x.id===ref))evidence.push({id:ref,provenance:'DISCOVERY',recordedAt:now,concernId:id});const pid=canonicalMemberProblemId(row.problemId||id);if(!pid)continue;if(!problems.some(x=>x.id===pid))problems.push({id:pid,status:'SUPPORTED',evidenceRefs:refs,sourceConcernId:id})}
 const feasibility=discoveryOutput.baselineHandoff?.signals?.feasibility||{},capacity=feasibility.capacity??null,conditions=dimensionConditions(discoveryOutput);
 const baselineEvidenceRefs=[...new Set(evidence.map(x=>x.id))];
 const dimensions=Object.fromEntries(DIMENSIONS.map(d=>[d,{scope:'MONITORED',condition:conditions[d]||null,confidence:null,evidenceRefs:[],updatedAt:conditions[d]?now:null}]));
 return{schemaVersion:'1.0.0',memberId,revision:0,createdAt:now,updatedAt:now,profile:{goals:[],preferences:{},constraints:[],accessibilityNeeds:[],consent:{},permissions:{}},dimensions,baseline:{status:'ESTABLISHED',establishedAt:now,sourceRevision:0,dimensionSnapshots:structuredClone(dimensions),evidenceRefs:baselineEvidenceRefs},evidence,problems,hypotheses:[],priorities:[],activePlan:{planId:null,status:null,interventions:[],reviewDueAt:null,activatedAt:null,updatedAt:null},engagementBurden:{capacity,manageability:feasibility.overall_load||null,adherenceTrend:null,skippedRequests:[],deferrals:[],trackingBurden:null,interventionBurden:null,disengagementSignals:[],throttle:{active:false,policyVersion:null,reasonCodes:[],activatedAt:null},updatedAt:now},considerations:[],learning:[],safety:{disposition:'ORDINARY_FLOW',unresolvedConstraints:[],policyVersion:null,updatedAt:now},history:[]};
}
