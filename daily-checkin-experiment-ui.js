import { supabase, getSessionOrRedirect, getMyProfile } from './el8-client.js';
import { selectDailyCheckinExperiment, recordQuestionExposure } from './daily-checkin-experiments.js';

const host = document.getElementById('experiments');
const save = document.getElementById('save');
const errorBox = document.getElementById('error');
let selection = null;
let value;
let startedAt = Date.now();
let recorded = false;
let experimentCard = null;

function normalizeOptions(options) {
  return (Array.isArray(options) ? options : []).map(option =>
    Array.isArray(option) ? { label: option[0], value: option[1] } : option
  );
}

function markAnswered() {
  experimentCard?.classList.remove('question-missing');
  if (errorBox?.dataset.source === 'experiment') {
    errorBox.classList.add('hidden');
    errorBox.textContent = '';
    delete errorBox.dataset.source;
  }
}

function renderChoiceQuestion(question) {
  const card = document.createElement('div');
  experimentCard = card;
  card.className = 'el8-card';
  card.innerHTML = `<div class="tag">EL8 research</div><h2>One extra question</h2><p class="small">${question.prompt_template}</p><div class="choices"></div>`;
  const choices = card.querySelector('.choices');
  normalizeOptions(question.options).forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    button.textContent = option.label;
    button.onclick = () => {
      [...choices.children].forEach(x => x.classList.remove('selected'));
      button.classList.add('selected');
      value = option.value;
      markAnswered();
    };
    choices.appendChild(button);
  });
  host.appendChild(card);
}

function renderScaleQuestion(question) {
  const options = normalizeOptions(question.options);
  const unsure = options.find(x => x.value === 'unsure');
  const ordered = options.filter(x => x.value !== 'unsure');
  const card = document.createElement('div');
  experimentCard = card;
  card.className = 'el8-card';
  card.innerHTML = `<div class="tag">EL8 research</div><h2>One extra question</h2><p class="small">${question.prompt_template}</p><div class="scale"><div class="scaleValue">Choose a response</div><input type="range" min="0" max="${Math.max(0, ordered.length - 1)}" step="1" value="${Math.floor(Math.max(0, ordered.length - 1) / 2)}" aria-label="Choose a response"><div class="scaleLabels">${ordered.map(x => `<span>${x.label}</span>`).join('')}</div>${unsure ? '<button type="button" class="unsure">Unsure</button>' : ''}</div>`;
  const range = card.querySelector('input');
  const label = card.querySelector('.scaleValue');
  const unsureButton = card.querySelector('.unsure');
  range.oninput = () => {
    const option = ordered[+range.value];
    label.textContent = option.label;
    unsureButton?.classList.remove('selected');
    value = option.value;
    markAnswered();
  };
  if (unsureButton) unsureButton.onclick = () => {
    unsureButton.classList.add('selected');
    label.textContent = 'Unsure';
    value = 'unsure';
    markAnswered();
  };
  host.appendChild(card);
}

async function recordAfterSubmission(session, profile) {
  if (recorded || value === undefined || !selection) return;
  const timezone = profile.timezone || 'America/Toronto';
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = type => parts.find(p => p.type === type)?.value;
  const localDate = `${part('year')}-${part('month')}-${part('day')}`;
  const { data: checkin } = await supabase.from('el8_daily_checkins').select('id').eq('user_id', session.user.id).eq('local_date', localDate).maybeSingle();
  if (!checkin?.id) return;
  await recordQuestionExposure({
    userId: session.user.id,
    memberCode: profile.member_code || null,
    checkinId: checkin.id,
    selection,
    value,
    activeDurationSeconds: Math.round((Date.now() - startedAt) / 1000)
  });
  recorded = true;
}

try {
  if (host && save) {
    const session = await getSessionOrRedirect();
    const profile = await getMyProfile();
    selection = await selectDailyCheckinExperiment({ userId: session?.user?.id, memberCode: profile?.member_code });
    if (selection?.question) {
      if (selection.question.response_type === 'ordered_scale') renderScaleQuestion(selection.question);
      else renderChoiceQuestion(selection.question);

      save.addEventListener('click', event => {
        if (value === undefined) {
          event.preventDefault();
          event.stopImmediatePropagation();
          experimentCard?.classList.add('question-missing');
          errorBox.dataset.source = 'experiment';
          errorBox.textContent = 'Please answer “One extra question” before submitting. The final note is optional.';
          errorBox.classList.remove('hidden');
          experimentCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, true);

      const observer = new MutationObserver(async () => {
        const doneVisible = !document.getElementById('done')?.classList.contains('hidden');
        const consentVisible = !document.getElementById('consent')?.classList.contains('hidden');
        if (doneVisible || consentVisible) {
          try { await recordAfterSubmission(session, profile); } catch (error) { console.error('Experiment exposure recording failed', error); }
        }
      });
      observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });
    }
  }
} catch (error) {
  console.error('Daily check-in experiment unavailable', error);
}
