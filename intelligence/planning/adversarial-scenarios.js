// EL8 Plan Engine v1 — adversarial synthetic scenarios.
// Synthetic scenarios are for early failure discovery, not evidence that EL8 works
// for real people. Human/Member Zero validation remains a separate gate.

export const ADVERSARIAL_SCENARIOS = [
  {
    id:'low_capacity_many_problems',
    description:'Many plausible drivers but very low member capacity.',
    discovery:{ranked:[
      {id:'poor_sleep',confidence:.85,importance:5,urgency:4,readiness:2},
      {id:'money_pressure',confidence:.8,importance:5,urgency:5,readiness:3},
      {id:'low_activity',confidence:.7,importance:3,urgency:2,readiness:2},
      {id:'stress',confidence:.75,importance:4,urgency:3,readiness:2}
    ]},
    context:{capacity:'low'},
    expect:{status:'active',maxActive:1,requiresBacklog:true}
  },
  {
    id:'uncertain_driver_should_measure',
    description:'Low-confidence problem should favor low-burden evidence gathering over confident prescription.',
    discovery:{ranked:[{id:'low_energy',confidence:.42,importance:3,urgency:2,readiness:3}]},
    context:{capacity:'medium'},
    expect:{status:'active',activeType:'data'}
  },
  {
    id:'sleep_uncertain_data_first',
    description:'Poor sleep with only moderate confidence should keep a sleep log available as a sensible first move.',
    discovery:{ranked:[{id:'poor_sleep',confidence:.55,importance:4,urgency:3,readiness:4}]},
    context:{capacity:'medium'},
    expect:{status:'active',containsCandidate:'sleep_log'}
  },
  {
    id:'flexible_activity_cadence',
    description:'Physical activity should be a weekly frequency target rather than falsely scheduled every day.',
    discovery:{ranked:[{id:'low_activity',confidence:.9,importance:4,urgency:3,readiness:4}]},
    context:{capacity:'medium'},
    expect:{status:'active',cadenceType:'weekly_target'}
  },
  {
    id:'reject_then_replace',
    description:'Member rejection should remove the commitment and promote another eligible option.',
    discovery:{ranked:[
      {id:'low_activity',confidence:.9,importance:4,urgency:3,readiness:4},
      {id:'low_support',confidence:.75,importance:3,urgency:2,readiness:3}
    ]},
    context:{capacity:'low'},
    interaction:{decision:'reject',reason:'not_for_me'},
    expect:{status:'active',replacement:true,rejectedNotActive:true}
  },
  {
    id:'defer_not_reject',
    description:'Later should preserve a commitment for future eligibility instead of permanently suppressing it.',
    discovery:{ranked:[
      {id:'stress',confidence:.85,importance:4,urgency:3,readiness:4},
      {id:'low_support',confidence:.7,importance:3,urgency:2,readiness:3}
    ]},
    context:{capacity:'low'},
    interaction:{decision:'defer',reason:'bad_timing'},
    expect:{status:'active',deferredPreserved:true}
  },
  {
    id:'no_supported_driver',
    description:'Unknown Discovery output must not cause the Plan Engine to invent an intervention.',
    discovery:{ranked:[{id:'unknown_driver',confidence:.95,importance:5,urgency:5,readiness:5}]},
    context:{capacity:'medium'},
    expect:{status:'observe',reason:'no_authorized_action'}
  },
  {
    id:'no_evidence',
    description:'No usable Discovery evidence should produce observation, not fake certainty.',
    discovery:{ranked:[]},
    context:{capacity:'medium'},
    expect:{status:'observe',reason:'insufficient_evidence'}
  },
  {
    id:'safety_override',
    description:'Safety hold must override ordinary planning regardless of otherwise strong evidence.',
    discovery:{safetyHold:true,ranked:[{id:'low_activity',confidence:.99,importance:5,urgency:5,readiness:5}]},
    context:{capacity:'high'},
    expect:{status:'escalate',maxActive:0}
  },
  {
    id:'adherent_but_no_benefit',
    description:'Good adherence without benefit should trigger reassessment rather than blame or automatic intensification.',
    discovery:{ranked:[{id:'stress',confidence:.9,importance:4,urgency:3,readiness:5}]},
    context:{capacity:'medium'},
    feedback:{adherence:.9,benefit:0},
    expect:{adaptation:'reassess'}
  },
  {
    id:'nonadherence_is_barrier_signal',
    description:'Low adherence should lead to simplification/rescheduling rather than declaring the intervention ineffective.',
    discovery:{ranked:[{id:'low_activity',confidence:.9,importance:4,urgency:3,readiness:3}]},
    context:{capacity:'medium'},
    feedback:{adherence:.2,benefit:0},
    expect:{adaptation:'simplify_or_reschedule'}
  },
  {
    id:'working_plan_stays_stable',
    description:'A followed plan with benefit should remain stable instead of being needlessly optimized.',
    discovery:{ranked:[{id:'low_activity',confidence:.9,importance:4,urgency:3,readiness:5}]},
    context:{capacity:'medium'},
    feedback:{adherence:.9,benefit:.7},
    expect:{adaptation:'maintain'}
  }
];
