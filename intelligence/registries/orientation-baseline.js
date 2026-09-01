// GENERATED FROM RECONCILED EL8 DRIVE AUTHORITY — 2026-09-01
// Eight-dimension Orientation baseline added after research reconciliation.
// Source authority: 02.01.02 Discovery Specification + 02.01.06.01 Question & Signal Registry.

const dimensions = Object.freeze([
  ['Physical','Q000077','Thinking about the past 2 weeks, how have your physical health, energy, sleep, and ability to do everyday things been overall?','SRC000121/SRC000122'],
  ['Emotional','Q000078','Thinking about the past 2 weeks, how have your stress, mood, and ability to handle difficult emotions been overall?','SRC000121/SRC000123'],
  ['Social','Q000079','Thinking about the past 2 weeks, how have your close relationships, available support, and sense of connection with other people been overall?','SRC000121/SRC000122'],
  ['Intellectual','Q000080','Thinking about the past 2 weeks, how have your focus, mental engagement, learning, or opportunities to feel mentally stimulated been overall?','SRC000126'],
  ['Occupational','Q000081','Thinking about your work, school, caregiving, or main daily responsibilities, how manageable and fitting has that part of life felt recently?','SRC000125'],
  ['Financial','Q000082','Thinking about the past month, how manageable and secure has your financial situation felt overall?','SRC000124/SRC000125'],
  ['Environmental','Q000083','Thinking about your home and immediate surroundings, how well have they supported your everyday life recently?','SRC000122'],
  ['Spiritual','Q000084','Thinking about your life as a whole, how have your sense of meaning, direction, and connection to what matters to you felt recently?','SRC000125']
]);
const states = Object.freeze([
  ['Going well','going_well'],['Mostly okay','mostly_okay'],['Mixed','mixed'],['Difficult','difficult'],['Not sure / not enough information','unknown']
]);
const slug = value => value.toUpperCase();

export const ORIENTATION_BASELINE_QUESTIONS = Object.freeze(dimensions.map(([dimension,id,text,sources],i)=>Object.freeze({
  'Question ID':id,'Sort Key':`1.010${i+1}`,'Legacy ID':'','Question':text,'Response Type':'Single','Role':'orientation-baseline',
  'Primary Dimension':dimension,'Primary Construct':`${dimension} dimension baseline`,'Prerequisite / Trigger':'Orient baseline unless equivalent recent evidence exists',
  'Scheduling / Stage':'Orient — eight-dimension baseline snapshot','Burden':0.12,'Audit Status':'Keep — research-informed baseline',
  'Runtime Status':'Active / orientation baseline','Evidence Status':'Evidence-informed EL8-authored item',
  'Decision Use':`Dimension-level coverage/triage only; specific ${dimension} constructs require direct evidence.`,
  'Variant Group':`ORIENTATION_BASELINE_${slug(dimension)}`,'Source Sheet':'General',
  'Registry Notes':`Original EL8 wording informed by ${sources}; not a validated scale item.`
})));

export const ORIENTATION_BASELINE_ANSWERS = Object.freeze(dimensions.flatMap(([dimension,qid],di)=>states.map(([label,state],si)=>{
  const n=507+di*5+si;
  return Object.freeze({'Answer ID':`A${String(n).padStart(6,'0')}`,'Sort Key':`1.010${di+1}.0${si+1}`,'Parent Question ID':qid,'Legacy ID':'',
    'Answer':label,'Primary Dimension':dimension,'Primary Construct':`${dimension} dimension baseline`,'Audit Status':'Keep',
    'Runtime Status':'Available when parent is asked','Evidence Status':state==='unknown'?'Uncertain':'Evidence-informed',
    'Mapping Notes':state==='unknown'?'Explicit unknown; never neutral.':'Broad dimension baseline; specific evidence remains authoritative.',
    'Decision Use':state==='mixed'||state==='difficult'?`Route ${dimension} Narrow clarification.`:state==='unknown'?`Preserve ${dimension} baseline uncertainty.`:`Establish ${dimension} baseline coverage.`,
    'Variant Group':`ORIENTATION_BASELINE_${slug(dimension)}`,'Safety Meaning':'No automatic Safety classification','Source Sheet':'General','Registry Notes':'EL8-authored orientation response'});
})));

export const ORIENTATION_BASELINE_EFFECTS = Object.freeze(ORIENTATION_BASELINE_ANSWERS.map((answer,i)=>{
  const dimension=answer['Primary Dimension'],state=states[i%5][1],n=399+i;
  return Object.freeze({'Effect ID':`EFX${String(n).padStart(6,'0')}`,'Answer ID':answer['Answer ID'],'Effect Type':'BASELINE_COVERAGE',
    'Target ID / Construct':`DIMENSION_${slug(dimension)}`,'Key':'baseline_state','Value':state,
    'Qualifier / Semantics':state==='unknown'?'Unknown is not neutral':'Broad dimension evidence only; no specific construct inference',
    'Decision Use':state==='mixed'||state==='difficult'?`Activate ${dimension} Narrow clarification`:state==='unknown'?`Mark ${dimension} baseline explicitly unknown`:`Mark ${dimension} baseline covered`,
    'Evidence Status':'Evidence-informed','Runtime Status':'Executable','Legacy Answer ID':'','Source Sheet':'General',
    'Registry Notes':'Orientation baseline evidence cannot erase contrary specific evidence or independently determine Safety.'});
}));

export const ORIENTATION_BASELINE_SOURCES = Object.freeze([
  {'Source ID':'SRC000121','Source':'PROMIS Global Health / HealthMeasures','Evidence Type':'Validated measurement system','Coverage':'Physical, mental and social global health','Use':'Brief global-item architecture','Limit':'EL8 wording is original; not a PROMIS scale.'},
  {'Source ID':'SRC000122','Source':'WHOQOL-BREF / WHOQOL Group','Evidence Type':'Validated cross-cultural quality-of-life instrument','Coverage':'Physical, psychological, social and environmental quality of life','Use':'Multidimensional whole-person coverage','Limit':'EL8 does not reproduce WHOQOL-BREF.'},
  {'Source ID':'SRC000123','Source':'WHO-5 Well-Being Index','Evidence Type':'Validated brief self-report instrument','Coverage':'Recent mental wellbeing','Use':'Brief recent-period appraisal','Limit':'EL8 Emotional baseline is original, not WHO-5 scoring.'},
  {'Source ID':'SRC000124','Source':'CFPB Financial Well-Being Scale','Evidence Type':'Validated financial wellbeing scale','Coverage':'Financial security, control and freedom of choice','Use':'Subjective financial manageability/security','Limit':'EL8 does not use CFPB scale scoring.'},
  {'Source ID':'SRC000125','Source':'Harvard Human Flourishing Measure / Secure Flourish','Evidence Type':'Research-based multidimensional wellbeing measure','Coverage':'Health, meaning, relationships, financial/material stability and broader flourishing','Use':'Compact multidomain baseline concept','Limit':'EL8 eight-dimension model is distinct.'},
  {'Source ID':'SRC000126','Source':'Curiosity and Exploration Inventory-II (CEI-II) research','Evidence Type':'Validated psychometric scale / construct research','Coverage':'Curiosity, knowledge seeking and engagement with novelty','Use':'Intellectual engagement construct support','Limit':'EL8 Intellectual baseline is broader and original.'}
]);
