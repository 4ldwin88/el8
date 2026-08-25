import { supabase } from '../../el8-client.js';

function memberEligible(experiment, memberCode) {
  const rule = experiment?.eligibility_rule || {};
  const members = Array.isArray(rule.member_codes) ? rule.member_codes : [];
  return members.length === 0 || members.includes(memberCode);
}

export async function selectDailyCheckinExperiment(memberCode) {
  const { data: experiments, error } = await supabase
    .from('experiments')
    .select('*')
    .eq('status', 'active')
    .eq('surface', 'daily_checkin');
  if (error) throw error;
  const experiment = (experiments || []).find(item => memberEligible(item, memberCode));
  if (!experiment) return null;

  const { data: questions, error: questionError } = await supabase
    .from('experiment_questions')
    .select('*')
    .eq('experiment_id', experiment.id)
    .order('position');
  if (questionError) throw questionError;
  return { experiment, questions: questions || [] };
}

export async function recordQuestionExposure({ experimentId, questionId, memberCode }) {
  const { error } = await supabase.from('experiment_exposures').insert({
    experiment_id: experimentId,
    question_id: questionId,
    member_code: memberCode
  });
  if (error) throw error;
}
