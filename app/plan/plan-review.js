import { supabase } from '../../el8-client.js';
import { planFocus, planInterventions } from './plan-model.js';

const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

export function mountPlanReview({ plan, session, ctx, answers: a, elements }) {
  const { summary, evidence, resultTitle, resultCopy, resultWhy, error, review, newDim, note, form, result } = elements;
  const focus = planFocus(plan);
  const interventions = planInterventions(plan);

  summary.innerHTML = `${plan.plan_objective ? `<div class="row"><b>Current objective</b><br>${esc(plan.plan_objective)}</div>` : ''}<div class="row"><b>Current focus</b><br>${focus.map(x => esc(x.dimension)).join(' · ') || '—'}</div>${interventions.map((x, i) => `<div class="row"><b>${interventions.length === 1 ? 'Current intervention' : `Intervention ${i + 1}`}</b><br>${esc(x.action || '—')}${x.dimensions?.length ? `<div class="muted">May support: ${x.dimensions.map(esc).join(' · ')}</div>` : ''}${x.expected_outcome ? `<div class="muted">Expected: ${esc(x.expected_outcome)}</div>` : ''}${x.burden ? `<div class="muted">Expected burden: ${esc(x.burden)}</div>` : ''}</div>`).join('')}<div class="row muted">Version ${plan.version || 1} · ${focus.length} focus dimension${focus.length === 1 ? '' : 's'} · ${interventions.length} intervention${interventions.length === 1 ? '' : 's'} · review every ${plan.review_days || 7} days</div>`;
  evidence.textContent = ctx.count ? `${ctx.count} recent check-in${ctx.count === 1 ? '' : 's'} · ${ctx.signal} signal · ${ctx.adherence} adherence · ${ctx.burden} burden.` : 'No plan check-ins yet. This review will rely on your answers below.';

  function decide() {
    if (a.shift === 'yes') return ['reprioritize', 'Reprioritize', 'Your priorities changed. EL8 should reassess what deserves active focus before adding more work.'];
    if (a.signal === 'worsening' || (ctx.signal === 'worsening' && a.signal !== 'improving')) return ['pause_reassess', 'Pause & reassess', 'The current result may be moving the wrong way. Pause and understand what changed before optimizing further.'];
    if (a.burden === 'hard' || a.adherence === 'low' || ctx.burden === 'hard' || ctx.adherence === 'low') return ['simplify', 'Reduce the load', 'The plan appears harder to sustain than useful. EL8 should contract active change rather than add pressure.'];
    if (a.usefulness === 'not_useful' || (a.signal === 'unchanged' && a.adherence === 'strong')) return ['modify', 'Change the approach', 'The current intervention has had a fair enough trial without enough value. Change the method, not simply the amount of effort.'];
    if (a.signal === 'improving' && a.adherence === 'strong' && a.burden === 'easy' && a.usefulness === 'useful') return ['progress', 'Progress what works', 'The current intervention is useful and manageable. Progress it before automatically adding another dimension or task.'];
    return ['continue_briefly', 'Keep it steady', 'There is not enough evidence to justify adding or removing active change. Continue briefly and collect another result.'];
  }

  review.onclick = async () => {
    if (!a.signal || !a.adherence || !a.burden || !a.usefulness || !a.shift || (a.shift === 'yes' && !newDim.value)) {
      error.textContent = 'Please answer each review question.';
      error.classList.remove('hidden');
      return;
    }
    const [rec, title, why] = decide();
    review.disabled = true;
    review.textContent = 'Saving…';
    const payload = { user_id: session.user.id, plan_id: plan.id, outcome: a.signal, adherence: a.adherence, burden: a.burden, usefulness: a.usefulness, priority_shift: a.shift, proposed_dimension: a.shift === 'yes' ? newDim.value : null, recommendation: rec, rationale: note.value.trim() || why, checkin_context: { recent_checkins: ctx, current_review: a, architecture: 'adaptive_multidimensional_v2', plan_version: plan.version || 1, focus_dimensions: focus, interventions }, is_test: false };
    const { data: r, error: e } = await supabase.from('el8_plan_reviews').insert(payload).select('id').single();
    if (e) {
      error.textContent = e.message;
      error.classList.remove('hidden');
      review.disabled = false;
      review.textContent = 'Review the plan';
      return;
    }
    const { data: applied, error: ae } = await supabase.functions.invoke('apply-plan-review', { body: { review_id: r.id } });
    if (ae || !applied?.ok) {
      error.textContent = 'Review saved, but the plan update could not be applied: ' + (ae?.message || applied?.error || 'Unknown error');
      error.classList.remove('hidden');
      review.disabled = false;
      review.textContent = 'Apply review again';
      return;
    }
    form.classList.add('hidden');
    result.classList.remove('hidden');
    resultTitle.textContent = title;
    resultWhy.textContent = why;
    resultCopy.textContent = rec === 'simplify' ? 'EL8 reduced the active load while preserving the previous plan in history.' : rec === 'modify' ? 'EL8 created an adapted plan version while preserving the previous plan in history.' : rec === 'progress' ? 'EL8 progressed the intervention that is already working instead of automatically adding more.' : rec === 'reprioritize' || rec === 'pause_reassess' ? 'The current plan is preserved and marked for reassessment.' : 'The current plan remains active while EL8 collects another result.';
    scrollTo(0, 0);
  };
  return true;
}
