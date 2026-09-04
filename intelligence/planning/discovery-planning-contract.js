// Canonical implementation projection of Drive Discovery → Planning authority.
// Drive remains authority. Planning support is not inferred merely from whether an Action
// is directly mapped to a Focus construct: outcome-oriented Focuses may resolve through
// independently supported driver constructs, while boundary Focuses may require deepening
// or a professional/no-autonomous-intervention disposition.
export const PLANNING_DISPOSITION=Object.freeze({DIRECT:'direct_action',CONDITIONAL:'conditional_action',OUTCOME:'outcome_driver_resolution',BOUNDARY:'boundary_or_no_action',HELD:'held'});
export const DISCOVERY_PLANNING_CONTRACT=Object.freeze({
EMOTIONAL_STATE:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['EMT-A01'],noActionAllowed:true},
PRESSURE_PATTERN:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['EMT-A02','EMT-A03','EMT-A04'],noActionAllowed:true},
SLEEP_QUALITY:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['PHY-A01','PHY-A04','PHY-A05'],noActionAllowed:true},
ENERGY_FUNCTION:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['XDM-A01','XDM-A05'],noActionAllowed:true,professionalRouteAllowed:true},
LONELINESS:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['SOC-A01','SOC-A03'],noActionAllowed:true},
JOB_SECURITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['OCC-A01','OCC-A02','OCC-A04'],noActionAllowed:true},
FINANCIAL_STRAIN:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['FIN-A01','FIN-A02','FIN-A03','FIN-A04'],noActionAllowed:true},
FINANCIAL_CONTROL:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['FIN-A01','FIN-A02'],noActionAllowed:true},
ENVIRONMENTAL_SUPPORT:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['ENV-A01','ENV-A02','ENV-A03','ENV-A04','PHY-A05'],noActionAllowed:true},
MEANING_PURPOSE:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['SPT-A01','SPT-A04'],noActionAllowed:true},
COGNITIVE_ENGAGEMENT:{disposition:PLANNING_DISPOSITION.HELD,actionIds:['INT-A04'],noActionAllowed:true},
RELATIONSHIP_STRAIN:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SOC-A02','SOC-A04'],noActionAllowed:true},
SUPPORT_AVAILABILITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SOC-A02','SOC-A03'],noActionAllowed:true},
PHYSICAL_CONDITION:{disposition:PLANNING_DISPOSITION.BOUNDARY,actionIds:[],noActionAllowed:true,professionalRouteAllowed:true},
ACTIVITY_LEVEL:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['PHY-A02','PHY-A06','PHY-A07'],noActionAllowed:true},
FOCUS_FUNCTION:{disposition:PLANNING_DISPOSITION.DIRECT,actionIds:['INT-A01','INT-A02','INT-A03'],noActionAllowed:true},
ACTIVATION:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['XDM-A01','XDM-A03','XDM-A04','XDM-A05'],memberDefinedActionAllowed:true,noActionAllowed:true},
SCHEDULE_DISRUPTION:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['OCC-A03','PHY-A01','PHY-A04'],noActionAllowed:true},
BODY_WEIGHT_CONCERN:{disposition:PLANNING_DISPOSITION.OUTCOME,actionIds:[],driverConstructIds:['ACTIVITY_LEVEL','SLEEP_QUALITY'],goalClarificationRequired:true,goalKey:'weight_management',deepeningPrompt:'What would you like help with around your body or weight?',deepeningOptions:['Manage my weight','Improve habits that may affect it','Understand what may be contributing','I do not want a plan for this right now'],noActionAllowed:true,professionalRouteAllowed:true},
VALUES_CLARITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SPT-A02','SPT-A01'],noActionAllowed:true},
NEXT_STEP_CLARITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SPT-A03','OCC-A01','OCC-A02','OCC-A04','XDM-A04'],noActionAllowed:true},
DIRECTION_CLARITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SPT-A03','OCC-A02','OCC-A04','XDM-A04'],noActionAllowed:true}
});
export function planningContractForConstruct(constructId){return DISCOVERY_PLANNING_CONTRACT[constructId]??null}
export function ordinaryPlanningCandidateAllowed(constructId){const c=planningContractForConstruct(constructId);return Boolean(c&&c.disposition!==PLANNING_DISPOSITION.HELD)}
const resolution=(contract,value)=>Object.freeze({...value,noActionAllowed:Boolean(contract?.noActionAllowed)});
export function planningResolutionForFocus(constructId,{supportedConstructIds=[],goalIntents={}}={}){const contract=planningContractForConstruct(constructId);if(!contract)return Object.freeze({focusId:constructId,status:'coverage_gap',reason:'missing_planning_contract',driverConstructIds:[],noActionAllowed:false});if(contract.disposition===PLANNING_DISPOSITION.HELD)return resolution(contract,{focusId:constructId,status:'no_autonomous_intervention',reason:'held_by_governance',driverConstructIds:[]});if(contract.disposition===PLANNING_DISPOSITION.OUTCOME){const intent=goalIntents?.[constructId]??goalIntents?.[contract.goalKey]??null;if(contract.goalClarificationRequired&&!intent)return resolution(contract,{focusId:constructId,status:'deepen',reason:'goal_clarification_required',driverConstructIds:[],requirement:{requirementId:`goal:${constructId}`,purpose:'outcome_goal',prompt:contract.deepeningPrompt,options:[...(contract.deepeningOptions??[])]}});if(String(intent).toLowerCase().includes('do not want'))return resolution(contract,{focusId:constructId,status:'deferred',reason:'member_preference',driverConstructIds:[]});const supported=new Set(supportedConstructIds);const drivers=(contract.driverConstructIds??[]).filter(id=>supported.has(id));if(!drivers.length)return resolution(contract,{focusId:constructId,status:'deepen',reason:'supported_driver_required',driverConstructIds:[],requirement:{requirementId:`drivers:${constructId}`,purpose:'driver_resolution',candidateConstructIds:[...(contract.driverConstructIds??[])],prompt:'A little more information is needed to identify which change would be most useful.'}});return resolution(contract,{focusId:constructId,status:'driver_resolved',reason:'supported_driver_evidence',driverConstructIds:drivers});}if(contract.disposition===PLANNING_DISPOSITION.BOUNDARY)return resolution(contract,{focusId:constructId,status:contract.professionalRouteAllowed?'professional_route':'no_autonomous_intervention',reason:'governed_boundary',driverConstructIds:[]});return resolution(contract,{focusId:constructId,status:'direct',reason:'direct_or_conditional_action_contract',driverConstructIds:[constructId]})}
