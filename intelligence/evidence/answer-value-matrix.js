// Canonical experimental answer-value matrix v0.1.
// Values are hypotheses for testing, not member-facing scores or validated clinical/financial measures.
// d = dimension evidence (-1 pressure, +1 supportive), u = uncertainty reduction, t = downstream triggers.
const e=(dimensions={},u=.75,triggers=[],extra={})=>({dimensions,uncertainty_reduction:u,triggers,...extra});
const unsure=(signal)=>e({},.08,[`${signal}_uncertain`],{confidence:.6});

export const answerValueMatrix={
  emo_pressure_pattern_v1:{
    'Stress / overwhelm':e({Emotional:-.8,Occupational:-.3},.9,['overload_identified']),
    'Anxiety / worry':e({Emotional:-.8},.9,['anxiety_pattern_identified']),
    'Low mood':e({Emotional:-.8,Physical:-.15},.9,['low_mood_identified']),
    'Anger / irritability':e({Emotional:-.7,Social:-.2},.9,['irritability_identified']),
    'Grief / loss':e({Emotional:-.85,Social:-.2},.9,['grief_identified']),
    'Loneliness / disconnection':e({Emotional:-.7,Social:-.8},.9,['connection_pressure_identified']),
    'Relationship strain':e({Emotional:-.65,Social:-.75},.9,['relationship_strain_identified']),
    'Motivation / emotional exhaustion':e({Emotional:-.7,Occupational:-.45,Physical:-.2},.9,['exhaustion_identified']),
    'Something else / mixed':e({Emotional:-.45},.35,['pressure_pattern_still_uncertain'])},
  emo_duration_v1:{'Days':e({Emotional:-.25},.9), 'A few weeks':e({Emotional:-.45},.9), '1–3 months':e({Emotional:-.65},.9,['persistent_emotional_pressure']), 'More than 3 months':e({Emotional:-.8},.9,['persistent_emotional_pressure'])},
  emo_functioning_v1:{'Mild — noticeable but manageable':e({Emotional:-.3},.95), 'Moderate — disrupting some routines':e({Emotional:-.65,Occupational:-.3,Physical:-.2,Social:-.2},.95,['material_emotional_interference']), 'High — disrupting several important routines':e({Emotional:-1,Occupational:-.55,Physical:-.4,Social:-.4},.95,['material_emotional_interference','high_functional_interference'])},
  emo_helps_v1:{'Rest / recovery time':e({Emotional:.3,Physical:.25},.8,['recovery_support_identified']), 'Movement / being outside':e({Emotional:.3,Physical:.4,Environmental:.2},.8,['movement_support_identified']), 'Talking with someone I trust':e({Emotional:.3,Social:.5},.8,['social_support_identified']), 'Structure / reducing demands':e({Emotional:.3,Occupational:.25},.8,['structure_support_identified']), 'Reflection / calming practice':e({Emotional:.3,Spiritual:.4},.8,['grounding_support_identified']), 'Nothing clearly helps yet':e({Emotional:-.25},.75,['helpful_supports_uncertain'])},
  emo_professional_support_v1:{Yes:e({Emotional:.2},.9,['professional_support_present']),No:e({},.9,['professional_support_absent']),'Prefer not to say':unsure('professional_support_context')},
  emo_workable_next_step_v1:{'Protect recovery time':e({Emotional:.2,Physical:.15},.9,['recovery_step_preferred']), 'Reduce one source of overload':e({Emotional:.2,Occupational:.15},.9,['overload_reduction_preferred']), 'Reconnect with someone supportive':e({Emotional:.2,Social:.25},.9,['connection_step_preferred']), 'Restore one basic routine':e({Emotional:.2,Physical:.2},.9,['routine_step_preferred']), 'Track the pattern before changing more':e({},.9,['observation_step_preferred'])},

  fin_income_stability_v1:{Stable:e({Financial:.7},.95), 'Mostly stable':e({Financial:.35},.95), 'Irregular / variable':e({Financial:-.55},.95,['income_variability']), 'No reliable income':e({Financial:-1,Occupational:-.45},.95,['income_increase_needed','high_financial_pressure'])},
  fin_cashflow_v1:{Positive:e({Financial:.75},.95), 'Roughly even':e({Financial:.15},.95), 'Often short':e({Financial:-.7},.95,['cashflow_pressure']), 'Significantly short':e({Financial:-1},.95,['cashflow_pressure','financial_pressure_possible']), Unsure:unsure('cashflow_after_essentials')},
  fin_near_term_pressure_v1:{None:e({Financial:.55},.95),Manageable:e({Financial:.1},.95),'At risk of missing obligations':e({Financial:-.8},.95,['financial_pressure_confirmed']), 'Already behind':e({Financial:-1},.95,['financial_pressure_confirmed','high_financial_pressure'])},
  fin_obligations_v1:{'Housing risk':e({Financial:-.9,Environmental:-.8},.75,['essential_pressure']), 'Utilities risk':e({Financial:-.75,Environmental:-.55},.75,['essential_pressure']), 'Food affordability':e({Financial:-.8,Physical:-.65},.75,['essential_pressure']), 'Transportation affordability':e({Financial:-.65,Occupational:-.25},.75,['essential_pressure']), 'Medication / healthcare affordability':e({Financial:-.8,Physical:-.8},.75,['essential_pressure']), 'Debt / minimum payments difficult':e({Financial:-.8},.75,['debt_relevant']), 'Other required obligation':e({Financial:-.6},.55,['essential_pressure']), 'Voluntary support to partner / family / other':e({Financial:-.45,Social:-.15},.65), None:e({Financial:.3},.9)},
  fin_debt_status_v1:{None:e({Financial:.45},.95),Manageable:e({Financial:.2},.95),'Difficult but current':e({Financial:-.45},.95,['debt_pressure']), 'At risk of missing payments':e({Financial:-.8},.95,['debt_pressure','financial_pressure_possible']), 'Behind / defaulted':e({Financial:-1},.95,['debt_pressure','high_financial_pressure'])},
  fin_obligation_coverage_v1:{'Easily covered':e({Financial:.7},.95),'Usually covered':e({Financial:.3},.95),'Difficult to cover':e({Financial:-.7},.95,['cashflow_pressure']),'Cannot reliably cover':e({Financial:-1},.95,['cashflow_pressure','high_financial_pressure'])},
  fin_runway_v1:{'3+ months':e({Financial:.8},.95),'1–3 months':e({Financial:.35},.95),'Less than 1 month':e({Financial:-.65},.95,['low_runway']),'Little or none':e({Financial:-1},.95,['low_runway','high_financial_pressure']),Unsure:unsure('liquid_runway')},
  fin_spending_flex_v1:{'Already near minimum':e({Financial:-.2},.9,['low_spending_flex']),'Limited, some cuts possible':e({Financial:.05},.9),'Moderate room to cut':e({Financial:.25},.9,['spending_leverage_present']),'Substantial room to cut':e({Financial:.4},.9,['spending_leverage_present']),Unsure:unsure('nonessential_spending_flexibility')},
  fin_pausable_expense_v1:{Yes:e({Financial:.3},.9,['pausable_expense_present']),No:e({},.9,['pausable_expense_absent']),Unsure:unsure('pausable_expense')},
  fin_spending_control_v1:{No:e({Financial:.25},.9),Sometimes:e({Financial:-.25},.9,['spending_pattern_relevant']),Often:e({Financial:-.6},.9,['spending_pattern_relevant']),'Prefer not to say':unsure('spending_control')},
  fin_income_path_v1:{'Increase current work':e({Financial:.1,Occupational:.25},.9,['income_path_selected']),'Find new employment':e({Financial:.1,Occupational:.3},.9,['income_path_selected']),'Freelance / gig / contract':e({Financial:.1,Occupational:.25},.9,['income_path_selected']),'Build or grow business':e({Financial:.1,Occupational:.3},.9,['income_path_selected']),'Sell assets / one-time cash':e({Financial:.05},.9,['income_path_selected']),'Multiple paths':e({Financial:.15,Occupational:.2},.8,['income_path_selected']),'No realistic path':e({Financial:-.55,Occupational:-.25},.9,['income_path_blocked']),Unsure:unsure('income_path')},
  fin_income_readiness_v1:{'Ready now':e({Financial:.15,Occupational:.45},.95,['income_action_ready']),'Mostly ready':e({Financial:.1,Occupational:.25},.95,['income_action_near_ready']),'Significant preparation needed':e({Financial:-.15,Occupational:-.25},.95,['income_preparation_needed']),'Not ready':e({Financial:-.25,Occupational:-.4},.95,['income_path_blocked'])},
  fin_income_urgency_v1:{Days:e({Financial:-.9},.95,['high_financial_pressure']),Weeks:e({Financial:-.65},.95,['income_urgent']),'1–3 months':e({Financial:-.3},.95), 'No immediate urgency':e({Financial:.25},.95)},
  fin_contingency_sources_v1:{Family:e({Financial:.15,Social:.25},.65),Partner:e({Financial:.15,Social:.25},.65),Friends:e({Financial:.1,Social:.2},.65),'Government / community benefits':e({Financial:.15},.65),Insurance:e({Financial:.15},.65),'Borrowing / credit':e({Financial:.05},.65,['credit_contingency']), 'Saleable assets':e({Financial:.1},.65),Other:e({Financial:.05},.5),None:e({Financial:-.45},.85,['financial_resilience_low']),Unsure:unsure('contingency_sources'),'Prefer not to say':unsure('contingency_sources')},
  fin_visibility_v1:{'Very clear':e({Financial:.35},.95),'Mostly clear':e({Financial:.2},.95),'Broad picture only':e({Financial:-.15},.95,['financial_visibility_gap']),'Poorly known':e({Financial:-.4},.95,['financial_visibility_gap','data_quality_uncertain']),Unsure:unsure('financial_visibility')},
  fin_goal_v1:{'Protect essentials / payments':e({},.95,['goal_protect_essentials']),'Reduce spending':e({},.95,['goal_reduce_spending']),'Increase income':e({},.95,['goal_increase_income']),'Reduce debt':e({},.95,['goal_reduce_debt']),'Preserve / build emergency cash':e({},.95,['goal_build_buffer']),'Build budget / visibility':e({},.95,['goal_visibility']),'Let EL8 recommend':e({},.7,['financial_plan_choice_uncertain'])},
  fin_expected_change_v1:{'Large required expense':e({Financial:-.35},.9,['forecast_expense_pressure']),'Payment increase':e({Financial:-.35},.9,['forecast_expense_pressure']),'Income / support loss':e({Financial:-.65},.9,['forecast_income_pressure']),'Major purchase / commitment':e({Financial:-.2},.9,['forecast_commitment']),'Expected money coming in':e({Financial:.35},.9,['forecast_inflow']),'Multiple':e({Financial:-.25},.55,['financial_forecast_complex']), 'None known':e({Financial:.15},.9),Unsure:unsure('expected_near_term_change')},
  fin_tightness_v1:{Comfortable:e({Financial:.8},.95),'Adequate but protect':e({Financial:.35},.95),'Tight — little room for surprises':e({Financial:-.65},.95,['low_buffer']),'Critically low':e({Financial:-1},.95,['low_buffer','high_financial_pressure']),Unsure:unsure('available_cash_tightness')}
};

export function attachAnswerEvidence(question){
  const matrix=answerValueMatrix[question.id];
  if(!matrix)return question;
  const answer_evidence={};
  for(const [answer,effect] of Object.entries(matrix)) answer_evidence[answer]=[{signal:question.signal,...effect}];
  return {...question,answer_evidence};
}

export function matrixCoverage(questions=[]){
  return questions.map(q=>({id:q.id,options:q.options?.length??0,mapped:(q.options??[]).filter(o=>answerValueMatrix[q.id]?.[o]).length}));
}
