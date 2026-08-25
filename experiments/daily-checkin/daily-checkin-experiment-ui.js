import { supabase, getSessionOrRedirect, getMyProfile } from '../../el8-client.js';
import { selectDailyCheckinExperiment, recordQuestionExposure } from './daily-checkin-experiments.js';

const host = document.getElementById('experiments');
const save = document.getElementById('save');

let profile = null;
let assignment = null;

async function init() {
  await getSessionOrRedirect();
  profile = await getMyProfile();
  assignment = await selectDailyCheckinExperiment(profile?.member_code);
  if (!assignment) {
    host.textContent = 'No daily check-in experiment assigned.';
    save.disabled = true;
    return;
  }

  host.innerHTML = '';
  for (const question of assignment.questions || []) {
    const section = document.createElement('section');
    section.dataset.questionId = question.id;
    section.innerHTML = `<h3>${question.prompt}</h3>`;
    for (const option of question.options || []) {
      const label = document.createElement('label');
      label.innerHTML = `<input type="radio" name="${question.id}" value="${option.value}"> ${option.label}`;
      section.appendChild(label);
    }
    host.appendChild(section);
    await recordQuestionExposure({ experimentId: assignment.experiment.id, questionId: question.id, memberCode: profile?.member_code });
  }
}

save?.addEventListener('click', async () => {
  const responses = {};
  for (const question of assignment?.questions || []) {
    const selected = document.querySelector(`input[name="${question.id}"]:checked`);
    if (selected) responses[question.id] = selected.value;
  }
  const { error } = await supabase.from('daily_checkin_experiment_responses').insert({
    experiment_id: assignment?.experiment?.id,
    member_code: profile?.member_code,
    responses
  });
  if (error) throw error;
  save.textContent = 'Saved';
  save.disabled = true;
});

init().catch(error => {
  console.error(error);
  host.textContent = 'Unable to load experiment.';
});
