/* EL8 Discovery v2 expanded adversarial scenario definitions.
 * Scenario corpus for the next simulator integration pass.
 */
const EL8_DISCOVERY_V2_SCENARIOS=[
 {id:'healthy_clean',truth:[],presentation:['none'],class:'healthy'},
 {id:'healthy_unsure',truth:[],presentation:['unsure'],class:'uncertainty'},
 {id:'work_as_stress',truth:['work_instability'],presentation:['stress'],class:'masked-driver'},
 {id:'work_as_money',truth:['work_instability','money_pressure'],presentation:['money'],class:'causal-chain'},
 {id:'money_as_sleep',truth:['money_pressure','stress','poor_sleep'],presentation:['sleep'],class:'masked-driver'},
 {id:'schedule_as_energy',truth:['schedule_disruption','poor_sleep','low_energy'],presentation:['energy'],class:'causal-chain'},
 {id:'social_as_energy',truth:['low_support','lonely','low_energy'],presentation:['energy'],class:'masked-driver'},
 {id:'relationship_as_stress',truth:['relationship_strain','stress'],presentation:['stress'],class:'masked-driver'},
 {id:'home_as_stress',truth:['home_instability','stress'],presentation:['stress'],class:'masked-driver'},
 {id:'direction_as_focus',truth:['lack_direction','low_focus'],presentation:['focus'],class:'masked-driver'},
 {id:'sleep_primary',truth:['poor_sleep'],presentation:['sleep','energy'],class:'direct'},
 {id:'stress_primary',truth:['stress'],presentation:['stress'],class:'direct'},
 {id:'work_money_stress',truth:['work_instability','money_pressure','stress'],presentation:['work','money','stress'],class:'multi'},
 {id:'relationship_support',truth:['relationship_strain','low_support'],presentation:['relationships','support'],class:'multi'},
 {id:'home_sleep',truth:['home_instability','poor_sleep'],presentation:['home','sleep'],class:'multi'},
 {id:'many_factor_overflow',truth:['work_instability','money_pressure','relationship_strain','poor_sleep'],presentation:['work','money','relationships','sleep','stress'],class:'overflow'},
 {id:'misleading_work',truth:['low_support'],presentation:['work'],class:'misleading'},
 {id:'misleading_money',truth:['relationship_strain'],presentation:['money'],class:'misleading'},
 {id:'contradiction_work_then_stable',truth:['lack_direction'],presentation:['work','focus'],class:'contradiction'},
 {id:'correction_reject_money',truth:['work_instability'],presentation:['money','work'],correction:'money_pressure',class:'correction'},
 {id:'correction_reject_relationship',truth:['low_support'],presentation:['relationships','support'],correction:'relationship_strain',class:'correction'},
 {id:'warm_stale_money_new_social',truth:['relationship_strain'],presentation:['relationships'],warm:{money_pressure:.8},class:'warm-stale'},
 {id:'warm_stale_work_new_home',truth:['home_instability'],presentation:['home'],warm:{work_instability:.8},class:'warm-stale'},
 {id:'warm_relevant_work',truth:['work_instability'],presentation:['work'],warm:{work_instability:.6},class:'warm-relevant'},
 {id:'not_sure_recovery',truth:['money_pressure'],presentation:['unsure'],class:'uncertainty'},
 {id:'several_recovery',truth:['work_instability','relationship_strain'],presentation:['work','relationships'],class:'multi'},
 {id:'extreme_contradiction',truth:['money_pressure'],presentation:['money','stress'],contradictory:true,class:'mirror'},
 {id:'positive_with_real_pressure',truth:['work_instability'],presentation:['work'],positiveMask:true,class:'mirror'},
 {id:'opt_out',truth:['relationship_strain'],presentation:['relationships'],optOutAfter:1,class:'boundary'},
 {id:'answer_order_a',truth:['work_instability','money_pressure'],presentation:['work','money'],class:'order'},
 {id:'answer_order_b',truth:['work_instability','money_pressure'],presentation:['money','work'],class:'order'},
 {id:'transient_sleep',truth:['poor_sleep'],presentation:['sleep'],transient:true,class:'transient'}
];
const EL8_DISCOVERY_V2_RELEASE_GATES={
 trueDriverTop3AtQ6:.85,
 healthyEarlyExit:.85,
 correctionRecovery:.9,
 unsureRecovery:.75,
 activeOverflowMax:.05,
 phantomPersistenceMax:.05,
 semanticNearDuplicateMax:.08,
 answerSensitivityMin:.7,
 routeOverlapMax:.65
};
if(typeof window!=='undefined'){window.EL8_DISCOVERY_V2_SCENARIOS=EL8_DISCOVERY_V2_SCENARIOS;window.EL8_DISCOVERY_V2_RELEASE_GATES=EL8_DISCOVERY_V2_RELEASE_GATES;}
if(typeof module!=='undefined')module.exports={EL8_DISCOVERY_V2_SCENARIOS,EL8_DISCOVERY_V2_RELEASE_GATES};
