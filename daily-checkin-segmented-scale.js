function enhanceScale(scale) {
  if (!scale || scale.dataset.segmented === 'true') return;
  const range = scale.querySelector('input[type="range"]');
  const labels = [...scale.querySelectorAll('.scaleLabels span')];
  if (!range || !labels.length) return;

  scale.dataset.segmented = 'true';
  range.hidden = true;
  const oldLabels = scale.querySelector('.scaleLabels');
  if (oldLabels) oldLabels.hidden = true;

  const segmented = document.createElement('div');
  segmented.className = 'segmentedScale';
  segmented.style.setProperty('--scale-count', String(labels.length));
  segmented.setAttribute('role', 'radiogroup');
  segmented.setAttribute('aria-label', 'Choose a response');

  const stops = labels.map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scaleStop';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', 'false');
    button.innerHTML = `<span class="scaleDot" aria-hidden="true"></span><span class="scaleStopLabel">${label.textContent}</span>`;
    button.onclick = () => {
      stops.forEach(stop => {
        stop.classList.remove('selected');
        stop.setAttribute('aria-checked', 'false');
      });
      button.classList.add('selected');
      button.setAttribute('aria-checked', 'true');
      range.value = String(index);
      range.dispatchEvent(new Event('input', { bubbles: true }));
    };
    segmented.appendChild(button);
    return button;
  });

  range.insertAdjacentElement('afterend', segmented);

  const unsure = scale.querySelector('.unsure');
  if (unsure) {
    unsure.addEventListener('click', () => {
      stops.forEach(stop => {
        stop.classList.remove('selected');
        stop.setAttribute('aria-checked', 'false');
      });
    });
  }
}

function enhanceAll(root = document) {
  if (root.matches?.('.scale')) enhanceScale(root);
  root.querySelectorAll?.('.scale').forEach(enhanceScale);
}

enhanceAll();

const observer = new MutationObserver(records => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) enhanceAll(node);
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });
