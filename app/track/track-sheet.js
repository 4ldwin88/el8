// EL8 global Track sheet migration scaffold.
// Keeps existing root Track flow available while canonical Track moves out of primary navigation.

const DEFAULT_QUICK_LOGS = [];

function button(label, action, className = 'el8-track-option') {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = className;
  el.textContent = label;
  el.addEventListener('click', action);
  return el;
}

export function createTrackSheet({ quickLogs = DEFAULT_QUICK_LOGS, legacyTrackUrl = '../../track.html' } = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'el8-track-backdrop';
  backdrop.hidden = true;

  const sheet = document.createElement('section');
  sheet.className = 'el8-track-sheet';
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Track');

  const header = document.createElement('div');
  header.className = 'el8-track-header';
  header.innerHTML = '<div><strong>Track</strong><p>Quick log or tell EL8 something.</p></div>';
  const close = button('Close', () => hide(), 'el8-track-close');
  header.appendChild(close);

  const quick = document.createElement('div');
  quick.className = 'el8-track-quick';
  const quickTitle = document.createElement('h3');
  quickTitle.textContent = 'Quick logs';
  quick.appendChild(quickTitle);

  const quickGrid = document.createElement('div');
  quickGrid.className = 'el8-track-quick-grid';
  if (quickLogs.length) {
    quickLogs.forEach(item => quickGrid.appendChild(button(item.label, () => item.onSelect?.(item))));
  } else {
    const empty = document.createElement('p');
    empty.className = 'el8-track-empty';
    empty.textContent = 'Your plan-specific quick logs will appear here.';
    quickGrid.appendChild(empty);
  }
  quick.appendChild(quickGrid);

  const universal = document.createElement('div');
  universal.className = 'el8-track-universal';
  universal.innerHTML = '<h3>Anything else</h3><textarea rows="3" placeholder="Tell EL8 what happened…" aria-label="Tell EL8 what happened"></textarea>';
  const actions = document.createElement('div');
  actions.className = 'el8-track-actions';
  actions.append(
    button('Text', () => window.location.href = legacyTrackUrl),
    button('Photo', () => window.location.href = legacyTrackUrl),
    button('File', () => window.location.href = legacyTrackUrl),
    button('Audio', () => window.location.href = legacyTrackUrl)
  );
  universal.appendChild(actions);

  sheet.append(header, quick, universal);
  backdrop.appendChild(sheet);

  function show() {
    backdrop.hidden = false;
    document.documentElement.classList.add('el8-track-open');
    close.focus();
  }
  function hide() {
    backdrop.hidden = true;
    document.documentElement.classList.remove('el8-track-open');
  }
  backdrop.addEventListener('click', event => { if (event.target === backdrop) hide(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !backdrop.hidden) hide(); });

  return { element: backdrop, show, hide };
}

export function mountTrackSheet(options = {}) {
  const sheet = createTrackSheet(options);
  document.body.appendChild(sheet.element);
  document.addEventListener('el8:track-requested', sheet.show);
  return sheet;
}
