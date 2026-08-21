export const QA_DIMENSIONS=['Physical','Emotional','Social','Spiritual','Intellectual','Occupational','Financial','Environmental'];

export function coveredDimensions(evidenceCount={}){
  return QA_DIMENSIONS.filter(d=>Number(evidenceCount[d]||0)>0);
}

export function shouldResolveBlindQa({turns=0,belief={},uncertainty={},evidenceCount={}}={}){
  if(turns<3)return false;
  const covered=coveredDimensions(evidenceCount);
  const hot=QA_DIMENSIONS.filter(d=>Number(belief[d]||0)>=.42&&Number(uncertainty[d]??1)<=.45);
  const unresolved=QA_DIMENSIONS.filter(d=>Number(belief[d]||0)>=.25&&Number(uncertainty[d]??1)>.5);
  // A healthy-looking member needs broad negative evidence before the cycle can stop.
  // A problem hypothesis can stop earlier, but only after cross-dimensional coverage.
  if(!hot.length)return covered.length===QA_DIMENSIONS.length;
  return covered.length>=4&&unresolved.length===0;
}

export function chooseOpeningProbe({matrix=[],turns=[],evidenceCount={},cycle=1}={}){
  const state=matrix.filter(q=>(q.question_family||q.family)==='state');
  if(!state.length)return null;
  const used=new Set(turns.map(t=>t.q?.id).filter(Boolean));
  const available=state.filter(q=>!used.has(q.question_key||q.id));
  if(!available.length)return null;
  const uncovered=QA_DIMENSIONS.filter(d=>Number(evidenceCount[d]||0)===0);
  const targetPool=uncovered.length?uncovered:QA_DIMENSIONS;
  const target=targetPool[(Math.max(1,cycle)-1+turns.length)%targetPool.length];
  const preferred=available.filter(q=>(q.primary_dimension||q.dimension)===target);
  const pool=preferred.length?preferred:available;
  return [...pool].sort((a,b)=>(b.expected_information_gain||3)-(a.expected_information_gain||3)||(a.burden||2)-(b.burden||2))[0]||null;
}
