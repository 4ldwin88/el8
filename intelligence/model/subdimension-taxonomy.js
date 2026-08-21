export const SUBDIMENSION_TAXONOMY={
 Physical:['Sleep','Energy','Movement','Nutrition','MedicalHealth','SubstanceExposure'],
 Emotional:['Mood','Stress','Regulation','Resilience','SelfPerception','Manageability'],
 Social:['Connection','Support','Belonging','RelationshipQuality','Isolation'],
 Spiritual:['Meaning','Purpose','ValuesAlignment','InnerPeace','Practice'],
 Intellectual:['Focus','Clarity','Learning','Curiosity','CognitiveLoad','DecisionCapacity'],
 Occupational:['EmploymentStability','Workload','Satisfaction','Direction','Development','IncomeStability'],
 Financial:['IncomeAdequacy','ExpenseLoad','DebtBurden','Liquidity','Security','FinancialControl'],
 Environmental:['Safety','Stability','Comfort','Organization','Access','EnvironmentalStress']
};
export const SUBDIMENSION_TO_DIMENSION=Object.fromEntries(Object.entries(SUBDIMENSION_TAXONOMY).flatMap(([d,subs])=>subs.map(s=>[`${d}.${s}`,d])));
export function createSubdimensionState(initial=.12){return Object.fromEntries(Object.entries(SUBDIMENSION_TAXONOMY).flatMap(([d,subs])=>subs.map(s=>[`${d}.${s}`,initial])))}
export function aggregateDimensionState(subState={},fallback=.12){return Object.fromEntries(Object.entries(SUBDIMENSION_TAXONOMY).map(([d,subs])=>{const vals=subs.map(s=>subState[`${d}.${s}`]).filter(Number.isFinite);return[d,vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:fallback]}))}
