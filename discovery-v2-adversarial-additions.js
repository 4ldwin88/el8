// Additional adversarial scenarios for Discovery v2 synthetic QA.
const ADVERSARIAL_SCENARIOS=[
{id:'adv_stale_work_new_relationship',truth:['relationship_strain'],presentation:['relationships','work'],warm:{work_instability:.9},class:'adversarial-warm'},
{id:'adv_stale_relationship_new_direction',truth:['lack_direction'],presentation:['relationships','direction'],warm:{relationship_strain:.9},class:'adversarial-warm'},
{id:'adv_broad_noise_home',truth:['home_instability'],presentation:['money','work','stress','relationships','home'],class:'adversarial-noise'},
{id:'adv_broad_noise_relationship',truth:['relationship_strain'],presentation:['money','work','relationships','support'],class:'adversarial-noise'},
{id:'adv_unsure_direction_signal',truth:['lack_direction'],presentation:['unsure','direction'],class:'adversarial-uncertainty'},
{id:'adv_other_support_signal',truth:['low_support'],presentation:['other','support'],class:'adversarial-other'},
{id:'adv_sleep_environment_driver',truth:['home_instability','poor_sleep'],presentation:['sleep','home'],class:'adversarial-causal'},
{id:'adv_stress_unsure_money',truth:['money_pressure','stress'],presentation:['stress','money','unsure'],class:'adversarial-uncertainty'},
{id:'adv_direction_work_conflict',truth:['work_instability'],presentation:['direction','work'],class:'adversarial-conflict'},
{id:'adv_relationship_support_conflict',truth:['low_support'],presentation:['relationships','support'],class:'adversarial-conflict'},
{id:'adv_home_money_conflict',truth:['money_pressure'],presentation:['home','money'],class:'adversarial-conflict'},
{id:'adv_work_schedule_conflict',truth:['schedule_disruption','poor_sleep'],presentation:['work','sleep'],class:'adversarial-causal'}
];
export {ADVERSARIAL_SCENARIOS}; export default ADVERSARIAL_SCENARIOS;