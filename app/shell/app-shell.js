// EL8 canonical MVP member shell.
// Route defaults are repository-root relative because the shell is mounted by
// deployed member pages at the repository root. Feature modules may override
// them explicitly when embedded elsewhere.

const DEFAULT_ROUTES = Object.freeze({
  home: 'home.html',
  plan: 'plan.html',
  insights: 'insights.html',
  explore: 'explore.html',
  profile: 'profile.html'
});

const ICONS = Object.freeze({
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M8 11h8M8 15h5"/></svg>',
  insights: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></svg>',
  explore: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4z"/></svg>',
  track: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
});

function routeMap(overrides = {}) {
  return { ...DEFAULT_ROUTES, ...overrides };
}

function go(url) {
  if (url) window.location.href = url;
}

export function createAppShell({
  active = 'home',
  routes = {},
  profileInitial = 'M',
  onTrack = null,
  onProfile = null
} = {}) {
  const resolved = routeMap(routes);
  const shell = document.createElement('div');
  shell.className = 'el8-app-shell';

  const profileButton = document.createElement('button');
  profileButton.type = 'button';
  profileButton.className = 'el8-shell-profile';
  profileButton.setAttribute('aria-label', 'Open Profile');
  profileButton.innerHTML = `<span class="el8-shell-avatar">${String(profileInitial || 'M').slice(0, 1).toUpperCase()}</span>`;
  profileButton.addEventListener('click', () => onProfile ? onProfile() : go(resolved.profile));

  const nav = document.createElement('nav');
  nav.className = 'el8-shell-nav';
  nav.setAttribute('aria-label', 'Primary');
  const navInner = document.createElement('div');
  navInner.className = 'el8-shell-nav-inner';

  for (const key of ['home', 'plan', 'insights', 'explore']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'el8-shell-nav-item';
    if (key === active) button.setAttribute('aria-current', 'page');
    button.innerHTML = `${ICONS[key]}<span>${key[0].toUpperCase()}${key.slice(1)}</span>`;
    button.addEventListener('click', () => go(resolved[key]));
    navInner.appendChild(button);
  }
  nav.appendChild(navInner);

  const trackButton = document.createElement('button');
  trackButton.type = 'button';
  trackButton.className = 'el8-shell-track';
  trackButton.setAttribute('aria-label', 'Track or quick log');
  trackButton.innerHTML = `${ICONS.track}<span>Track</span>`;
  trackButton.addEventListener('click', () => {
    if (onTrack) onTrack();
    else document.dispatchEvent(new CustomEvent('el8:track-requested'));
  });

  shell.append(profileButton, nav, trackButton);
  return shell;
}

export function mountAppShell(options = {}) {
  const root = options.root || document.body;
  const existing = root.querySelector(':scope > .el8-app-shell');
  if (existing) existing.remove();
  const shell = createAppShell(options);
  root.appendChild(shell);
  return shell;
}

export const EL8_MVP_DESTINATIONS = Object.freeze(['home', 'plan', 'insights', 'explore']);
