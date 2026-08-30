// Canonical implementation projection of Drive 02.06 Discovery → Planning Contract Matrix.
// Drive remains authority. This file prevents Planning support from being inferred merely
// from whether an Action is directly mapped to a construct.
export const PLANNING_DISPOSITION=Object.freeze({DIRECT:'direct_action',CONDITIONAL:'conditional_action',BOUNDARY:'boundary_or_no_action',HELD:'held'});
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
BODY_WEIGHT_CONCERN:{disposition:PLANNING_DISPOSITION.BOUNDARY,actionIds:[],noActionAllowed:true,professionalRouteAllowed:true},
VALUES_CLARITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SPT-A02','SPT-A01'],noActionAllowed:true},
NEXT_STEP_CLARITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SPT-A03','OCC-A01','OCC-A02','OCC-A04','XDM-A04'],noActionAllowed:true},
DIRECTION_CLARITY:{disposition:PLANNING_DISPOSITION.CONDITIONAL,actionIds:['SPT-A03','OCC-A02','OCC-A04','XDM-A04'],noActionAllowed:true}
});
export function planningContractForConstruct(constructId){return DISCOVERY_PLANNING_CONTRACT[constructId]??null}
export function ordinaryPlanningCandidateAllowed(constructId){const c=planningContractForConstruct(constructId);return Boolean(c&&c.disposition!==PLANNING_DISPOSITION.HELD)}
