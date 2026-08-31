// Canonical EL8 construct registry.
// Historical "concern" IDs are not decision authority; this manifest filename
// exposes the governed constructs used by Member State and Intelligence.

import { DIMENSION_IDS, isDimensionId } from './dimensions.js';

export const CONSTRUCT_IDS = Object.freeze([
  'EMOTIONAL_STATE','PRESSURE_PATTERN','SLEEP_QUALITY','ENERGY_FUNCTION','LONELINESS',
  'JOB_SECURITY','FINANCIAL_STRAIN','FINANCIAL_CONTROL','ENVIRONMENTAL_SUPPORT','MEANING_PURPOSE',
  'COGNITIVE_ENGAGEMENT','RELATIONSHIP_STRAIN','SUPPORT_AVAILABILITY','PHYSICAL_CONDITION','ACTIVITY_LEVEL',
  'FOCUS_FUNCTION','ACTIVATION','SCHEDULE_DISRUPTION','BODY_WEIGHT_CONCERN','VALUES_CLARITY',
  'NEXT_STEP_CLARITY','DIRECTION_CLARITY',
]);

const topic=(id,dimensionId,label)=>Object.freeze({id,dimensionId,label});
export const TOPICS=Object.freeze([
  topic('physical.sleep','physical','Sleep'),topic('physical.energy','physical','Energy'),topic('physical.movement','physical','Movement'),topic('physical.nutrition','physical','Nutrition'),topic('physical.health','physical','Physical health'),topic('physical.substance_exposure','physical','Substance exposure'),
  topic('emotional.mood','emotional','Mood'),topic('emotional.stress','emotional','Stress'),topic('emotional.regulation','emotional','Emotional regulation'),topic('emotional.resilience','emotional','Resilience'),topic('emotional.self_perception','emotional','Self-perception'),topic('emotional.manageability','emotional','Manageability'),
  topic('social.connection','social','Connection'),topic('social.support','social','Support'),topic('social.belonging','social','Belonging'),topic('social.relationship_quality','social','Relationship quality'),topic('social.isolation','social','Isolation'),
  topic('spiritual.meaning','spiritual','Meaning'),topic('spiritual.purpose','spiritual','Purpose'),topic('spiritual.values_alignment','spiritual','Values alignment'),topic('spiritual.inner_peace','spiritual','Inner peace'),topic('spiritual.practice','spiritual','Practice'),
  topic('intellectual.focus','intellectual','Focus'),topic('intellectual.clarity','intellectual','Clarity'),topic('intellectual.learning','intellectual','Learning'),topic('intellectual.curiosity','intellectual','Curiosity'),topic('intellectual.cognitive_load','intellectual','Cognitive load'),topic('intellectual.decision_capacity','intellectual','Decision capacity'),topic('intellectual.activation','intellectual','Activation and follow-through'),
  topic('occupational.employment_stability','occupational','Employment stability'),topic('occupational.workload','occupational','Workload'),topic('occupational.satisfaction','occupational','Work satisfaction'),topic('occupational.direction','occupational','Work direction'),topic('occupational.development','occupational','Development'),topic('occupational.income_stability','occupational','Income stability'),topic('occupational.schedule','occupational','Work and schedule stability'),
  topic('financial.income_adequacy','financial','Income adequacy'),topic('financial.expense_load','financial','Expense load'),topic('financial.debt_burden','financial','Debt burden'),topic('financial.liquidity','financial','Liquidity'),topic('financial.security','financial','Financial security'),topic('financial.control','financial','Financial control'),
  topic('environmental.safety','environmental','Environmental safety'),topic('environmental.stability','environmental','Home and environmental stability'),topic('environmental.comfort','environmental','Comfort'),topic('environmental.organization','environmental','Organization'),topic('environmental.access','environmental','Access'),topic('environmental.stress','environmental','Environmental stress'),
]);
export const TOPIC_BY_ID=Object.freeze(Object.fromEntries(TOPICS.map(item=>[item.id,item])));
export function isTopicId(value){return Object.hasOwn(TOPIC_BY_ID,value);}

const construct=(id,dimensionIds,topicIds,label,options={})=>Object.freeze({id,dimensionIds:Object.freeze([...dimensionIds]),topicIds:Object.freeze([...topicIds]),label,experimental:Boolean(options.experimental)});
export const CONSTRUCTS=Object.freeze([
  construct('EMOTIONAL_STATE',['emotional'],['emotional.mood','emotional.regulation'],'Emotional state'),
  construct('PRESSURE_PATTERN',['emotional'],['emotional.stress','emotional.manageability'],'Pressure / stress pattern'),
  construct('SLEEP_QUALITY',['physical'],['physical.sleep'],'Sleep quality / restoration'),
  construct('ENERGY_FUNCTION',['physical'],['physical.energy'],'Energy / physical functioning'),
  construct('LONELINESS',['social'],['social.isolation','social.connection','social.belonging'],'Loneliness / belonging'),
  construct('JOB_SECURITY',['occupational'],['occupational.employment_stability','occupational.income_stability'],'Work / income security'),
  construct('FINANCIAL_STRAIN',['financial'],['financial.income_adequacy','financial.expense_load','financial.debt_burden','financial.liquidity','financial.security'],'Financial strain'),
  construct('FINANCIAL_CONTROL',['financial'],['financial.control'],'Financial control / agency'),
  construct('ENVIRONMENTAL_SUPPORT',['environmental'],['environmental.stability','environmental.comfort','environmental.organization','environmental.access','environmental.stress'],'Environmental support'),
  construct('MEANING_PURPOSE',['spiritual'],['spiritual.meaning','spiritual.purpose'],'Meaning / purpose'),
  construct('COGNITIVE_ENGAGEMENT',['intellectual'],['intellectual.learning','intellectual.curiosity'],'Cognitive engagement',{experimental:true}),
  construct('RELATIONSHIP_STRAIN',['social'],['social.relationship_quality'],'Relationship strain'),
  construct('SUPPORT_AVAILABILITY',['social'],['social.support'],'Support availability / adequacy'),
  construct('PHYSICAL_CONDITION',['physical'],['physical.health'],'Physical condition / health burden'),
  construct('ACTIVITY_LEVEL',['physical'],['physical.movement'],'Physical activity / movement level'),
  construct('FOCUS_FUNCTION',['intellectual'],['intellectual.focus'],'Focus / attention functioning'),
  construct('ACTIVATION',['intellectual'],['intellectual.activation'],'Action initiation / activation'),
  construct('SCHEDULE_DISRUPTION',['occupational'],['occupational.schedule'],'Schedule / routine disruption'),
  construct('BODY_WEIGHT_CONCERN',['physical'],['physical.nutrition','physical.health'],'Body / weight concern'),
  construct('VALUES_CLARITY',['spiritual'],['spiritual.values_alignment'],'Values clarity'),
  construct('NEXT_STEP_CLARITY',['intellectual','occupational'],['intellectual.clarity','intellectual.decision_capacity','occupational.direction'],'Next-step clarity'),
  construct('DIRECTION_CLARITY',['spiritual','occupational'],['spiritual.purpose','occupational.direction'],'Direction clarity'),
]);
export const CONSTRUCT_BY_ID=Object.freeze(Object.fromEntries(CONSTRUCTS.map(item=>[item.id,item])));
export function isConstructId(value){return Object.hasOwn(CONSTRUCT_BY_ID,value);}

export function validateConstructRegistry(){
  const errors=[];const ids=new Set();const topicIds=new Set();
  for(const item of TOPICS){if(topicIds.has(item.id))errors.push(`duplicate topic id: ${item.id}`);topicIds.add(item.id);if(!isDimensionId(item.dimensionId))errors.push(`invalid topic dimension: ${item.id}`);}
  for(const item of CONSTRUCTS){if(ids.has(item.id))errors.push(`duplicate construct id: ${item.id}`);ids.add(item.id);if(!CONSTRUCT_IDS.includes(item.id))errors.push(`non-canonical construct id: ${item.id}`);for(const dimensionId of item.dimensionIds)if(!isDimensionId(dimensionId))errors.push(`invalid construct dimension ${dimensionId}: ${item.id}`);for(const topicId of item.topicIds)if(!isTopicId(topicId))errors.push(`unknown construct topic ${topicId}: ${item.id}`);}
  for(const id of CONSTRUCT_IDS)if(!ids.has(id))errors.push(`missing canonical construct: ${id}`);
  for(const dimensionId of DIMENSION_IDS)if(!CONSTRUCTS.some(item=>item.dimensionIds.includes(dimensionId)))errors.push(`dimension has no canonical construct: ${dimensionId}`);
  return errors;
}
export const validateTaxonomy=validateConstructRegistry;
