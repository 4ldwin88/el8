import { CONDITION_BANDS, normalizeCondition } from './condition-model.js';

const dimensionKey=dimension=>String(dimension||'').trim().toLowerCase();
function snapshotCondition(snapshot,dimension){
  const row=snapshot?.[dimensionKey(dimension)]||snapshot?.[dimension];
  return normalizeCondition(row?.condition??row);
}

// Historical compatibility reader only. New canonical Insights history must come from
// Member State baseline/current revisions rather than Universal Baseline assessment sessions.
export function conditionFromHistoricalAssessment(dimension, assessment = {}) {
  const source = {...(assessment.responses || {}),...(assessment.derived_outputs || {})};
  return normalizeCondition(source?.condition_baseline?.[dimension]||source?.life?.[dimension]||source?.conditions?.[dimension]||source?.dimension_conditions?.[dimension]||source?.[dimension]);
}

export function buildHistoricalDimensionHistory(dimension,sessions=[]){
  const completed=sessions.filter(session=>session?.status==='completed');
  const baseline=completed.find(session=>session.module_type==='universal_baseline');
  const history=[];
  const baselineCondition=baseline?conditionFromHistoricalAssessment(dimension,baseline):'No data';
  if(baselineCondition!=='No data')history.push({type:'historical-baseline',label:'Historical baseline',condition:baselineCondition,date:baseline.submitted_at||baseline.completed_at||null,source:'legacy-universal-baseline'});
  completed.filter(session=>session!==baseline&&['reassessment','monthly_reassessment','universal_reassessment'].includes(session.module_type)).forEach(session=>{const condition=conditionFromHistoricalAssessment(dimension,session);if(condition!=='No data')history.push({type:'historical-reassessment',label:session.submitted_at||session.completed_at||'Historical reassessment',condition,date:session.submitted_at||session.completed_at||null,source:'legacy-assessment-session'})});
  return history;
}

export function buildDimensionHistory(dimension,{memberState=null,historicalSessions=[]}={}){
  const history=[];
  const baselineCondition=snapshotCondition(memberState?.baseline?.dimensionSnapshots,dimension);
  if(memberState?.baseline?.status==='ESTABLISHED'&&baselineCondition!=='No data')history.push({type:'baseline',label:'Baseline',condition:baselineCondition,date:memberState.baseline.establishedAt||memberState.createdAt||null,source:'member-state-baseline'});
  const currentCondition=snapshotCondition(memberState?.dimensions,dimension);
  if(currentCondition!=='No data'&&(currentCondition!==baselineCondition||!history.length))history.push({type:'current',label:'Current',condition:currentCondition,date:memberState?.updatedAt||null,source:'member-state-current'});
  // Legacy records are appended only when canonical Member State cannot provide the same
  // semantic point. They remain identifiable and never establish the canonical baseline.
  if(!history.length)history.push(...buildHistoricalDimensionHistory(dimension,historicalSessions));
  return history;
}

export function summarizeDimensionHistory(history = []) {
  const baseline=history.find(item=>item.type==='baseline')?.condition||history.find(item=>item.type==='historical-baseline')?.condition||null;
  const current=history.at(-1)?.condition||baseline;
  const firstIndex=CONDITION_BANDS.indexOf(baseline),currentIndex=CONDITION_BANDS.indexOf(current);
  let trajectory='unclear';
  if(firstIndex>=0&&currentIndex>=0)trajectory=currentIndex>firstIndex?'improving':currentIndex<firstIndex?'declining':'steady';
  return{baseline,current,trajectory};
}
