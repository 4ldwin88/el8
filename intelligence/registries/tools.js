// Generated runtime projection of Drive authority 02.01.08.01 EL8 Tool Registry.
// Planning selects the Intervention/Action first. Toolkit composition happens afterward.
// Tool availability MUST NOT affect Intervention eligibility, rank, or core recommendation.
export const TOOL_ROLES=Object.freeze({EXECUTION:'execution',DOWNSTREAM_MONITORING:'downstream_outcome_monitoring',REVIEW:'review',DECISION_HANDOFF:'decision_handoff',EXECUTION_SUPPORT:'execution_support',SUBSTITUTION:'substitution'});
export const TOOL_REQUIREMENT=Object.freeze({REQUIRED:'required',OPTIONAL:'optional',CONDITIONAL:'conditional',CONDITIONAL_SUBSTITUTION:'conditional_substitution'});
const tool=(toolId,name,type,dimensions)=>Object.freeze({toolId,name,type,dimensions:Object.freeze(dimensions),reusable:true,status:'candidate'});
export const TOOLS=Object.freeze([
 tool('TOL000001','Spending Snapshot Worksheet','guided_worksheet_tracker',['Financial']),
 tool('TOL000002','Essential Obligations List','guided_worksheet_checklist',['Financial']),
 tool('TOL000003','Recurring Cost Review','decision_worksheet_experiment_tracker',['Financial']),
 tool('TOL000004','Spending Boundary Planner','planner_tracker',['Financial']),
 tool('TOL000005','Financial Decision Check-In','reflection_review_prompt',['Financial']),
 tool('TOL000006','Financial Next-Step Prompt','guided_decision_prompt',['Financial']),
 tool('TOL000007','Low-Data Capture','accessibility_alternate_input',['Cross-dimensional']),
 tool('TOL000008','Evidence-Aware Reminder','reminder_cue',['Cross-dimensional']),
 tool('TOL000009','Sleep Pattern Log','outcome_monitoring_log',['Physical','Cross-dimensional']),
 tool('TOL000010','Mood & Stress Check-In','outcome_monitoring_checkin',['Emotional','Cross-dimensional']),
 tool('TOL000011','Sleep Routine Planner','planner_lightweight_tracker',['Physical']),
 tool('TOL000012','Movement Bout Log','action_tracker',['Physical']),
 tool('TOL000013','Pressure Pattern Log','learning_measurement_log',['Emotional']),
 tool('TOL000014','Recovery Block Planner','planner_experiment_tracker',['Emotional']),
 tool('TOL000015','Intervention Review Check-In','cross_dimensional_review_prompt',['Cross-dimensional'])
]);
const link=(linkId,actionIds,toolId,role,requirement,opts={})=>Object.freeze({linkId,actionIds:Object.freeze(actionIds),toolId,role,requirement,...opts});
export const INTERVENTION_TOOL_LINKS=Object.freeze([
 link('ITL000001',['ACT000020'],'TOL000001',TOOL_ROLES.EXECUTION,TOOL_REQUIREMENT.REQUIRED),
 link('ITL000002',['ACT000021'],'TOL000002',TOOL_ROLES.EXECUTION,TOOL_REQUIREMENT.REQUIRED),
 link('ITL000003',['ACT000022'],'TOL000003',TOOL_ROLES.EXECUTION,TOOL_REQUIREMENT.REQUIRED),
 link('ITL000004',['ACT000023'],'TOL000004',TOOL_ROLES.EXECUTION,TOOL_REQUIREMENT.REQUIRED),
 ...['ACT000020','ACT000021','ACT000022','ACT000023'].map((id,i)=>link(`ITL00000${i+5}`,[id],'TOL000005',TOOL_ROLES.REVIEW,TOOL_REQUIREMENT.REQUIRED)),
 ...['ACT000020','ACT000021','ACT000022','ACT000023'].map((id,i)=>link(`ITL0000${i+9}`,[id],'TOL000006',TOOL_ROLES.DECISION_HANDOFF,TOOL_REQUIREMENT.CONDITIONAL)),
 link('ITL000013',['ACT000020'],'TOL000009',TOOL_ROLES.DOWNSTREAM_MONITORING,TOOL_REQUIREMENT.CONDITIONAL,{requiresRelationship:true}),
 link('ITL000014',['ACT000020'],'TOL000010',TOOL_ROLES.DOWNSTREAM_MONITORING,TOOL_REQUIREMENT.CONDITIONAL,{requiresRelationship:true}),
 link('ITL000015',['ACT000002'],'TOL000008',TOOL_ROLES.EXECUTION_SUPPORT,TOOL_REQUIREMENT.OPTIONAL,{memberOptIn:true}),
 link('ITL000016',['ACT000010'],'TOL000008',TOOL_ROLES.EXECUTION_SUPPORT,TOOL_REQUIREMENT.OPTIONAL,{memberOptIn:true}),
 ...['ACT000021','ACT000022','ACT000023'].flatMap((id,j)=>[
   link(`ITL0000${17+j*2}`,[id],'TOL000009',TOOL_ROLES.DOWNSTREAM_MONITORING,TOOL_REQUIREMENT.CONDITIONAL,{requiresRelationship:true}),
   link(`ITL0000${18+j*2}`,[id],'TOL000010',TOOL_ROLES.DOWNSTREAM_MONITORING,TOOL_REQUIREMENT.CONDITIONAL,{requiresRelationship:true})
 ]),
 link('ITL000023',['ACT000020'],'TOL000007',TOOL_ROLES.SUBSTITUTION,TOOL_REQUIREMENT.CONDITIONAL_SUBSTITUTION,{substitutesFor:'TOL000001',requiresEquivalentEvidence:true}),
 link('ITL000024',['ACT000023'],'TOL000008',TOOL_ROLES.EXECUTION_SUPPORT,TOOL_REQUIREMENT.OPTIONAL,{memberOptIn:true}),
 link('ITL000025',['ACT000009'],'TOL000013',TOOL_ROLES.EXECUTION,TOOL_REQUIREMENT.REQUIRED),
 link('ITL000026',['ACT000010'],'TOL000014',TOOL_ROLES.EXECUTION,TOOL_REQUIREMENT.REQUIRED),
 link('ITL000027',['ACT000001','ACT000002','ACT000009','ACT000010'],'TOL000015',TOOL_ROLES.REVIEW,TOOL_REQUIREMENT.CONDITIONAL,{architectureValidationOnly:true})
]);
const TOOL_BY_ID=new Map(TOOLS.map(x=>[x.toolId,x]));
export function toolById(toolId){return TOOL_BY_ID.get(toolId)??null}
export function toolLinksForAction(actionId){return INTERVENTION_TOOL_LINKS.filter(link=>link.actionIds.includes(actionId))}
export function assertToolRegistryIntegrity(){for(const link of INTERVENTION_TOOL_LINKS){if(!TOOL_BY_ID.has(link.toolId))throw Error(`Unknown Tool ${link.toolId} in ${link.linkId}`)}return true}
