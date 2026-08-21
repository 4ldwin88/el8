import { supabase } from './el8-client.js';

function memberEligible(experiment, memberCode) {
  const rule = experiment?.eligibility_rule || {};
  const members = Array.isArray(rule.member_codes) ? rule.member_codes : [];
  if (rule.surface && rule.surface !== 'daily_checkin') return false;
  return !members.length || members.includes(memberCode);
}

export async function selectDailyCheckinExperiment({ userId, memberCode }) {
  if (!userId || !memberCode) return null;

  const { data: experiments, error: experimentError } = await supabase
    .from('el8_question_experiments')
    .select('*')
    .eq('status', 'active')
    .order('priority', { ascending: false });
  if (experimentError) throw experimentError;

  const experiment = (experiments || []).find(x => memberEligible(x, memberCode));
  if (!experiment || experiment.max_experimental_questions_per_checkin < 1) return null;

  const { data: variants, error: variantError } = await supabase
    .from('el8_question_experiment_variants')
    .select('experiment_key,question_key,variant_label,allocation_weight,active')
    .eq('experiment_key', experiment.experiment_key)
    .eq('active', true);
  if (variantError) throw variantError;
  if (!variants?.length) return null;

  const keys = variants.map(v => v.question_key);
  const [{ data: questions, error: questionError }, { data: prior, error: priorError }] = await Promise.all([
    supabase.from('el8_checkin_question_bank').select('*').in('question_key', keys).eq('active', true),
    supabase.from('el8_question_exposures').select('question_key,offered_at').eq('user_id', userId).eq('experiment_key', experiment.experiment_key).order('offered_at', { ascending: false }).limit(50)
  ]);
  if (questionError) throw questionError;
  if (priorError) throw priorError;

  const questionByKey = new Map((questions || []).map(q => [q.question_key, q]));
  const counts = new Map(keys.map(k => [k, 0]));
  for (const row of prior || []) counts.set(row.question_key, (counts.get(row.question_key) || 0) + 1);

  const candidates = variants
    .filter(v => questionByKey.has(v.question_key))
    .sort((a, b) => (counts.get(a.question_key) - counts.get(b.question_key)) || (Number(b.allocation_weight) - Number(a.allocation_weight)) || a.variant_label.localeCompare(b.variant_label));
  if (!candidates.length) return null;

  const variant = candidates[0];
  return { experiment, variant, question: questionByKey.get(variant.question_key), offeredAt: new Date().toISOString() };
}

export async function recordQuestionExposure({ userId, memberCode, checkinId, selection, value, activeDurationSeconds = null }) {
  if (!selection?.question || !selection?.experiment || !selection?.variant) return;
  const now = new Date().toISOString();
  const { error } = await supabase.from('el8_question_exposures').insert({
    user_id: userId,
    member_code: memberCode || null,
    checkin_id: checkinId || null,
    experiment_key: selection.experiment.experiment_key,
    question_key: selection.question.question_key,
    variant_label: selection.variant.variant_label,
    offered_at: selection.offeredAt || now,
    answered_at: value === undefined ? null : now,
    response: value === undefined ? null : { value },
    active_duration_seconds: activeDurationSeconds,
    metadata: { surface: 'daily_checkin', selector: 'balanced_rotation_v1' }
  });
  if (error) throw error;
}
