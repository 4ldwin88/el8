// EL8 MVP intervention + evidence-gathering library
// Candidate commitments are evidence-informed options, not prescriptions or claims
// that any item is optimal for a particular member.

export const LIBRARY = {
  poor_sleep: [
    {id:'sleep_log',type:'data',dimension:'physical',title:'Log your sleep',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Sleep start, end and optional quality',reviewDays:7,evidenceStrength:'supported'},
    {id:'stabilize_sleep_window',type:'intervention',dimension:'physical',title:'Keep a more consistent sleep window',effort:2,cadence:{type:'daily',target:7,period:'week'},measurement:'Log whether sleep/wake timing stayed near the chosen window',reviewDays:7,evidenceStrength:'supported'}
  ],
  schedule_disruption: [
    {id:'anchor_daily_schedule',type:'intervention',dimension:'occupational',title:'Create one daily anchor',effort:2,cadence:{type:'daily',target:7,period:'week'},measurement:'Log whether the anchor happened',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  stress: [
    {id:'stress_check',type:'data',dimension:'emotional',title:'Log stress and context',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Stress level plus what was happening',reviewDays:7,evidenceStrength:'evidence_informed'},
    {id:'daily_decompression',type:'intervention',dimension:'emotional',title:'Use a short decompression block',effort:1,cadence:{type:'weekly_target',target:5,period:'week'},measurement:'Completion and stress before/after',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  low_energy: [
    {id:'energy_observation',type:'data',dimension:'physical',title:'Track when energy drops',effort:1,cadence:{type:'daily',target:7,period:'week'},measurement:'Low-energy time and preceding activity',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  low_focus: [
    {id:'protected_focus_block',type:'intervention',dimension:'occupational',title:'Protect one focus block',effort:2,cadence:{type:'weekly_target',target:3,period:'week'},measurement:'Log completion and approximate duration',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  low_activity: [
    {id:'walk',type:'intervention',dimension:'physical',title:'Go for a walk',effort:2,cadence:{type:'weekly_target',target:3,period:'week'},measurement:'Log walk completion and approximate duration',reviewDays:7,evidenceStrength:'supported'},
    {id:'strength_activity',type:'intervention',dimension:'physical',title:'Do a strength-training session',effort:3,cadence:{type:'weekly_target',target:2,period:'week'},measurement:'Log completed session',reviewDays:7,evidenceStrength:'supported'}
  ],
  work_instability: [
    {id:'income_action',type:'intervention',dimension:'occupational',title:'Take one concrete income action',effort:3,cadence:{type:'weekly_target',target:2,period:'week'},measurement:'Record completed action and result',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  money_pressure: [
    {id:'money_snapshot',type:'data',dimension:'financial',title:'Create a current money snapshot',effort:2,cadence:{type:'one_time',target:1,period:'once'},measurement:'Available cash, required payments and due dates',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  relationship_strain: [
    {id:'relationship_repair_step',type:'intervention',dimension:'social',title:'Take one relationship repair step',effort:3,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record action and result',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  low_support: [
    {id:'support_contact',type:'intervention',dimension:'social',title:'Strengthen one support connection',effort:2,cadence:{type:'weekly_target',target:1,period:'week'},measurement:'Log one meaningful support contact',reviewDays:7,evidenceStrength:'supported'}
  ],
  home_instability: [
    {id:'home_stability_step',type:'intervention',dimension:'environmental',title:'Resolve one home stability issue',effort:3,cadence:{type:'one_time',target:1,period:'once'},measurement:'Record completed stability action',reviewDays:7,evidenceStrength:'evidence_informed'}
  ],
  lack_direction: [
    {id:'direction_next_step',type:'intervention',dimension:'spiritual',title:'Take one meaningful next step',effort:2,cadence:{type:'weekly_target',target:1,period:'week'},measurement:'Complete one step tied to what matters now',reviewDays:7,evidenceStrength:'evidence_informed'}
  ]
};

export function candidatesForDriver(driverId) {
  return (LIBRARY[driverId] || []).map(x=>({...x,cadence:{...x.cadence}}));
}

export function allLibraryItems() {
  return Object.entries(LIBRARY).flatMap(([driver,items])=>items.map(item=>({driver,...item,cadence:{...item.cadence}})));
}
