// Additional adversarial scenarios for Discovery v2 synthetic QA.
// These scenarios intentionally stress v2.7's contract: member-raised signal
// accountability, stale priors, uncertainty, contradiction recovery and
// multiple simultaneous drivers.
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
{id:'adv_work_schedule_conflict',truth:['schedule_disruption','poor_sleep'],presentation:['work','sleep'],class:'adversarial-causal'},
// v2.7 additions: a stale prior must not overpower a current member-raised signal.
{id:'adv_stale_money_current_sleep',truth:['poor_sleep'],presentation:['sleep','money'],warm:{money_pressure:.95},class:'adversarial-warm'},
{id:'adv_stale_sleep_current_money',truth:['money_pressure'],presentation:['money','sleep'],warm:{poor_sleep:.95},class:'adversarial-warm'},
// Multiple true drivers must remain representable rather than collapsing to one cause.
{id:'adv_money_multi_driver',truth:['money_pressure','work_instability','stress'],presentation:['money','work','stress'],class:'adversarial-multidriver'},
{id:'adv_sleep_multi_driver',truth:['poor_sleep','schedule_disruption','stress'],presentation:['sleep','work','stress'],class:'adversarial-multidriver'},
// Broad/noisy presentations test whether the engine accounts for raised signals
// without declaring causal certainty from propagation alone.
{id:'adv_noise_sleep_money_home',truth:['poor_sleep','money_pressure'],presentation:['sleep','money','home','stress','other'],class:'adversarial-noise'},
{id:'adv_noise_support_direction_work',truth:['low_support','lack_direction'],presentation:['support','direction','work','relationships','unsure'],class:'adversarial-noise'},
// Uncertainty should trigger observable-state questions, not count as driver evidence.
{id:'adv_unsure_sleep',truth:['poor_sleep'],presentation:['sleep','unsure'],class:'adversarial-uncertainty'},
{id:'adv_unsure_money_work',truth:['money_pressure','work_instability'],presentation:['money','work','unsure'],class:'adversarial-uncertainty'},
// Conflict pairs intentionally include a plausible but false competing explanation.
{id:'adv_false_relationship_true_support',truth:['low_support'],presentation:['relationships','support','stress'],class:'adversarial-conflict'},
{id:'adv_false_home_true_money',truth:['money_pressure'],presentation:['home','money','stress'],class:'adversarial-conflict'},
{id:'adv_false_direction_true_work',truth:['work_instability'],presentation:['direction','work','stress'],class:'adversarial-conflict'}
];
export {ADVERSARIAL_SCENARIOS}; export default ADVERSARIAL_SCENARIOS;
