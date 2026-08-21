const loading = document.getElementById('loading');
const loadError = document.getElementById('loadError');
const form = document.getElementById('form');
const done = document.getElementById('done');
const manageCard = document.getElementById('manageCard');

const revealReadyForm = () => {
  const hasQuestion = document.querySelector('#followups .response, #scheduled .response, #questions .response, #experiments .response');
  const hasManageability = document.querySelector('#manageability .scale');
  const alreadyDone = done && !done.classList.contains('hidden');

  if (alreadyDone) {
    loading?.classList.add('hidden');
    return true;
  }

  if (hasQuestion || hasManageability) {
    if (hasManageability) manageCard?.classList.remove('hidden');
    loading?.classList.add('hidden');
    loadError?.classList.add('hidden');
    form?.classList.remove('hidden');
    return true;
  }
  return false;
};

if (!revealReadyForm()) {
  const observer = new MutationObserver(() => {
    if (revealReadyForm()) observer.disconnect();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

  window.setTimeout(() => {
    if (!revealReadyForm()) {
      observer.disconnect();
      loading?.classList.add('hidden');
      form?.classList.add('hidden');
      loadError?.classList.remove('hidden');
    }
  }, 12000);
}
