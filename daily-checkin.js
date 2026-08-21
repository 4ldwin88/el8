import { supabase, getSessionOrRedirect, getMyProfile } from './el8-client.js';
import { runCheckinShadow } from './intelligence/integration/checkin-shadow.js';

const $ = id => document.getElementById(id);
const answers = {};
const followAnswers = {};
const scheduledAnswers = {};
const DAY = 86400000;
const days = (a, b = new Date()) => a ? Math.max(0, Math.floor((b - new Date(a)) / DAY)) : null;

function normOpts(o) {
  return (Array.isArray(o) ? o : []).map(x => Array.isArray(x) ? { label: x[0], value: x[1] } : x);
}

function scale(el, opts, onchange) {
  opts = normOpts(opts);
  const unsure = opts.find(x => x.value === 'unsure');
  const ordered = opts.filter(x => x.value !== 'unsure');
  const w = document.createElement('div');
  w.className = 'scale';
  w.innerHTML = `<div class="scaleValue">Choose a response</div><input type="range" min="0" max="${Math.max(0, ordered.length - 1)}" step="1" value="${Math.floor(Math.max(0, ordered.length - 1) / 2)}"><div class="scaleLabels">${ordered.map(x => `<span>${x.label}</span>`).join('')}</div>${unsure ? '<button type="button" class="unsure">Unsure</button>' : ''}`;
  el.appendChild(w);
  const r = w.querySelector('input');
  const v = w.querySelector('.scaleValue');
  const u = w.querySelector('.unsure');
  r.oninput = () => {
    v.textContent = ordered[+r.value].label;
    u?.classList.remove('selected');
    onchange(ordered[+r.value].value);
  };
  if (u) u.onclick = () => {
    u.classList.add('selected');
    v.textContent = 'Unsure';
    onchange('unsure');
  };
}

function choices(el, opts, onchange, multi = false) {
  opts = normOpts(opts);
  const selected = new Set();
  const g = document.createElement('div');
  g.className = 'choices';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'choice';
    b.textContent = o.label;
    b.onclick = () => {
      if (multi) {
        selected.has(o.value) ? selected.delete(o.value) : selected.add(o.value);
        b.classList.toggle('selected', selected.has(o.value));
        onchange([...selected]);
      } else {
        [...g.children].forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        onchange(o.value);
      }
    };
    g.appendChild(b);
  });
  el.appendChild(g);
}

function renderQuestion(host, q, index, store, key, tag) {
  const card = document.createElement('div');
  card.className = 'el8-card' + (tag ? ' followup' : '');
  card.innerHTML = `${tag ? `<div class="tag">${tag}</div>` : ''}<h2>${index}. ${q.title || 'Checking in'}</h2><p class="small">${q.prompt_template || q.prompt}</p><div class="response"></div>`;
  host.appendChild(card);
  const response = card.querySelector('.response');
  const opts = q.options || [];
  if (q.response_type === 'ordered_scale') scale(response, opts, v => store[key] = v);
  else choices(response, opts, v => store[key] = v, q.response_type === 'multi_choice');
}

const BANK = {
  Emotional: { prompt: 'How was your emotional state today?', options: [['Struggling', 'struggling'], ['Mixed', 'mixed'], ['Steady', 'steady'], ['Good', 'good'], ['Unsure', 'unsure']] },
  Physical: { prompt: 'How did your physical wellbeing compare with what you needed today?', options: [['Poor', 'poor'], ['Below usual', 'below_usual'], ['About usual', 'about_usual'], ['Good', 'good'], ['Unsure', 'unsure']] },
  Intellectual: { prompt: 'How well did you engage your mind today?', options: [['Not at all', 'not_at_all'], ['A little', 'a_little'], ['Enough', 'enough'], ['Strongly', 'strongly'], ['Unsure', 'unsure']] },
  Social: { prompt: 'Did you get enough meaningful connection today?', options: [['Far too little', 'far_too_little'], ['A little low', 'a_little_low'], ['Enough', 'enough'], ['More than enough', 'more_than_enough'], ['Unsure', 'unsure']] },
  Spiritual: { prompt: 'Did you have enough reflection, meaning or grounding today?', options: [['Not at all', 'not_at_all'], ['A little', 'a_little'], ['Enough', 'enough'], ['Strongly', 'strongly'], ['Unsure', 'unsure']] },
  Occupational: { prompt: 'How did work, career or productive progress go today?', options: [['No progress', 'no_progress'], ['A little', 'a_little'], ['Useful progress', 'useful_progress'], ['Strong progress', 'strong_progress'], ['Unsure', 'unsure']] },
  Financial: { prompt: 'How did your financial situation or money decisions go today?', options: [['Worse', 'worse'], ['Some concern', 'some_concern'], ['Stable', 'stable'], ['Improved', 'improved'], ['Unsure', 'unsure']] },
  Environmental: { prompt: 'How well did your surroundings support you today?', options: [['Poorly', 'poorly'], ['Somewhat', 'somewhat'], ['Adequately', 'adequately'], ['Very well', 'very_well'], ['Unsure', 'unsure']] }
};

try {
  const session = await getSessionOrRedirect();
  if (!session) throw Error('No session');
  const profile = await getMyProfile();
  document.documentElement.dataset.theme = profile.appearance || 'light';
  if (profile.onboarding_status === 'safety_paused') {
    location.replace('safety-hold.html');
    throw Error('Safety pause');
  }

  const TZ = profile.timezone || 'America/Toronto';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = t => parts.find(p => p.type === t)?.value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const { data: existing } = await supabase.from('el8_daily_checkins').select('*').eq('user_id', session.user.id).eq('local_date', today).maybeSingle();
  const showDone = r => {
    $('form').classList.add('hidden');
    $('consent').classList.add('hidden');
    $('done').classList.remove('hidden');
    $('loggedAt').textContent = r?.submitted_at ? new Date(r.submitted_at).toLocaleString() : '';
  };

  if (existing) {
    showDone(existing);
  } else {
    const [{ data: plan }, { data: pending }, { data: bank }, { data: load }, { data: activity }] = await Promise.all([
      supabase.from('el8_plans').select('*').eq('user_id', session.user.id).eq('status', 'active').eq('is_test', false).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('el8_checkin_followups').select('*').eq('user_id', session.user.id).in('status', ['pending', 'presented']).or(`due_on.is.null,due_on.lte.${today}`).or(`expires_on.is.null,expires_on.gte.${today}`).order('priority', { ascending: false }),
      supabase.from('el8_checkin_question_bank').select('*').eq('active', true),
      supabase.from('el8_member_load_state').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('el8_member_activity').select('*').eq('user_id', session.user.id).maybeSingle()
    ]);

    const memberDay = days(profile.created_at) + 1;
    const planDays = days(plan?.created_at);
    const absenceDays = days(activity?.last_meaningful_activity_at);
    let idx = 1;
    (pending || []).forEach(f => renderQuestion($('followups'), f, idx++, followAnswers, f.id, 'Following up'));

    const eligible = (bank || []).filter(q => {
      const r = q.schedule_rule || {};
      if (q.question_kind !== 'normal' || !Object.keys(r).length) return false;
      if (q.min_member_day && memberDay < q.min_member_day) return false;
      if (q.max_member_day && memberDay > q.max_member_day) return false;
      if (r.anchor === 'membership_start' && Array.isArray(r.days) && !r.days.includes(memberDay)) return false;
      if (r.anchor === 'plan_start' && r.minimum_elapsed_days != null && (planDays == null || planDays < r.minimum_elapsed_days)) return false;
      if (r.anchor === 'last_meaningful_activity') {
        if (absenceDays == null) return false;
        if (r.minimum_absence_days != null && absenceDays < r.minimum_absence_days) return false;
        if (r.maximum_absence_days != null && absenceDays > r.maximum_absence_days) return false;
      }
      return true;
    });

    const scheduled = [];
    for (const q of eligible) {
      if (q.question_key === 'plan_manageability_v1') continue;
      if (q.question_key === 'system_friction_v1' && memberDay === 1) continue;
      scheduled.push(q);
    }
    scheduled.forEach(q => renderQuestion($('scheduled'), q, idx++, scheduledAnswers, q.question_key, q.signal_map?.reengagement ? 'Welcome back' : 'EL8'));

    let focuses = (plan?.focus_dimensions || []).map(x => typeof x === 'string' ? x : x.dimension).filter(x => BANK[x]);
    if (!focuses.length) focuses = [plan?.dimension, plan?.supporting_dimension].filter(x => BANK[x]);
    focuses = [...new Set(focuses)];
    if (!focuses.length) focuses = ['Physical'];
    if (load?.adaptation_direction === 'reduce' && focuses.length > 1) focuses = focuses.slice(0, 1);
    const questionSet = focuses.map((dimension, i) => ({ id: `focus_${i}`, dimension, title: dimension, prompt: BANK[dimension].prompt, response_type: 'ordered_scale', options: BANK[dimension].options }));
    questionSet.forEach(q => renderQuestion($('questions'), q, idx++, answers, q.id, ''));

    const showManage = plan && planDays >= 1;
    if (showManage) {
      $('manageTitle').textContent = `${idx++}. Plan`;
      scale($('manageability'), [['Too much', 'too_much'], ['Difficult', 'difficult'], ['Manageable', 'manageable'], ['Easy', 'easy'], ['Unsure', 'unsure']], v => answers.manageability = v);
    } else $('manageCard').classList.add('hidden');

    let intelligenceShadow = null;
    try {
      intelligenceShadow = runCheckinShadow({ plan, load, activity, pending: pending || [], scheduled, focuses });
    } catch (shadowError) {
      console.warn('Adaptive check-in shadow calculation failed', shadowError);
    }

    const started = new Date();
    $('save').onclick = async () => {
      const missingFollow = (pending || []).some(f => followAnswers[f.id] === undefined);
      const missingScheduled = scheduled.some(q => scheduledAnswers[q.question_key] === undefined);
      const missingFocus = questionSet.some(q => answers[q.id] === undefined);
      const missingManage = showManage && !answers.manageability;
      if (missingFollow || missingScheduled || missingFocus || missingManage) {
        $('error').textContent = 'Please answer the check-in questions. The final note is optional.';
        $('error').classList.remove('hidden');
        return;
      }

      $('save').disabled = true;
      const frictionKey = scheduled.find(q => q.signal_map?.system_signal === 'friction')?.question_key;
      const friction = frictionKey ? scheduledAnswers[frictionKey] : null;
      const manage = answers.manageability || null;
      let recommended = null;
      let reason = null;
      if (['burdening', 'very_difficult', 'friction', 'somewhat_difficult'].includes(friction) || ['too_much', 'difficult'].includes(manage)) {
        recommended = 'reduce';
        reason = 'Member reported friction or plan burden.';
      } else if (['easy', 'very_easy'].includes(friction) && manage === 'easy') {
        recommended = 'expand';
        reason = 'EL8 feels easy and the current plan is manageable.';
      }

      const qs = [
        ...scheduled.map(q => ({ id: q.question_key, prompt: q.prompt_template, type: q.response_type, options: q.options, scheduled: true })),
        ...questionSet.map(q => ({ id: q.id, dimension: q.dimension, prompt: q.prompt, type: q.response_type, options: q.options }))
      ];
      const allAnswers = {
        ...Object.fromEntries(scheduled.map(q => [q.question_key, { value: scheduledAnswers[q.question_key] }])),
        ...Object.fromEntries(questionSet.map(q => [q.id, { dimension: q.dimension, prompt: q.prompt, value: answers[q.id] }]))
      };

      const { data: row, error } = await supabase.from('el8_daily_checkins').insert({
        user_id: session.user.id,
        member_code: profile.member_code || null,
        local_date: today,
        local_timezone: TZ,
        manageability: manage,
        member_note: $('note').value.trim() || null,
        focus_dimensions: focuses,
        question_set: qs,
        answers: allAnswers,
        scheduled_question_keys: scheduled.map(q => q.question_key),
        system_feedback: { friction },
        adaptation_snapshot: { direction: load?.adaptation_direction || 'hold', recommended, intelligence_shadow: intelligenceShadow },
        started_at: started.toISOString(),
        active_duration_seconds: Math.round((Date.now() - started) / 1000),
        interaction_count: Object.keys(allAnswers).length + Object.keys(followAnswers).length + (showManage ? 1 : 0)
      }).select().single();

      if (error) {
        $('error').textContent = error.message;
        $('error').classList.remove('hidden');
        $('save').disabled = false;
        return;
      }

      for (const f of pending || []) await supabase.from('el8_checkin_followups').update({ status: 'answered', answer: { value: followAnswers[f.id] }, answered_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', f.id);
      await supabase.from('el8_member_activity').upsert({ user_id: session.user.id, member_code: profile.member_code || null, last_meaningful_activity_at: new Date().toISOString(), last_checkin_at: new Date().toISOString(), updated_at: new Date().toISOString() });

      if (recommended && recommended !== (load?.adaptation_direction || 'hold') && (!load?.ask_again_after || new Date(load.ask_again_after) <= new Date())) {
        await supabase.from('el8_member_load_state').upsert({
          user_id: session.user.id,
          member_code: profile.member_code || null,
          load_level: load?.load_level || 'normal',
          adaptation_direction: load?.adaptation_direction || 'hold',
          recommended_direction: recommended,
          recommendation_reason: reason,
          recommendation_at: new Date().toISOString(),
          last_manageability: manage,
          friction_score: friction ? ({ burdening: -2, very_difficult: -2, friction: -1, somewhat_difficult: -1, about_right: 0, easy: 1, very_easy: 2 }[friction] ?? null) : null,
          updated_at: new Date().toISOString()
        });
        $('form').classList.add('hidden');
        $('consent').classList.remove('hidden');
        $('consentTitle').textContent = recommended === 'reduce' ? 'Would you like EL8 to lighten things up?' : 'Want EL8 to do a little more?';
        $('consentText').textContent = recommended === 'reduce' ? 'We noticed some friction or burden. EL8 can reduce nonessential questions and interventions.' : 'Things seem to be going smoothly. EL8 can gradually introduce more useful questions or interventions when there is a reason to.';

        const respond = async response => {
          const applied = response === 'accepted' ? recommended : (load?.adaptation_direction || 'hold');
          const cool = new Date(Date.now() + (response === 'snoozed' ? 7 : response === 'keep_same' ? 14 : 3) * DAY).toISOString();
          await supabase.from('el8_member_load_state').update({ adaptation_direction: applied, recommended_direction: null, member_response: response, member_response_at: new Date().toISOString(), ask_again_after: cool, updated_at: new Date().toISOString() }).eq('user_id', session.user.id);
          await supabase.from('el8_adaptation_decisions').insert({ user_id: session.user.id, member_code: profile.member_code || null, from_direction: load?.adaptation_direction || 'hold', recommended_direction: recommended, reason, member_response: response, applied_direction: applied, prompted_at: new Date().toISOString(), responded_at: new Date().toISOString() });
          showDone(row);
        };
        $('acceptPace').onclick = () => respond('accepted');
        $('keepPace').onclick = () => respond('keep_same');
        $('unsurePace').onclick = () => respond('unsure');
        $('snoozePace').onclick = () => respond('snoozed');
      } else showDone(row);
    };
  }
} catch (e) {
  console.error(e);
  $('error').textContent = 'The daily check-in could not load. Please return Home and try again.';
  $('error').classList.remove('hidden');
  $('save').disabled = true;
}
