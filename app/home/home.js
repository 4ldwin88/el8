// Canonical Home member-surface module.
// Reads the accepted Active Plan contract without introducing a second plan store.

import { mountAppShell } from '../shell/app-shell.js';

// Primary navigation is structural and must survive failures in secondary Home
// dependencies. Keep this module's static dependency graph limited to the shell,
// mount it immediately, and load Track only when the richer Home surface mounts.
mountAppShell({ active: 'home' });

export async function mountHome({ member, plan, quickLogs = [], routes = {} } = {}) {
  let trackSheet = null;
  try {
    const { mountTrackSheet } = await import('../track/track-sheet.js');
    trackSheet = mountTrackSheet({ quickLogs });
  } catch (error) {
    console.error('EL8 Track failed to initialize; primary navigation remains available.', error);
  }

  const shell = mountAppShell({
    active: 'home',
    routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet?.show || null
  });

  document.documentElement.dataset.el8Surface = 'home';
  document.dispatchEvent(new CustomEvent('el8:home-mounted', { detail: { member, plan } }));
  return { shell, trackSheet };
}

// Home Quick Logs intentionally remain separate presentation from Track Quick Logs.
// Home may show daily cumulative progress and richer controls; both use the same
// evidence definitions/persistence contracts.
export function homeQuickLogModel(definition, today = {}) {
  return {
    ...definition,
    current: today.current ?? null,
    target: today.target ?? definition.target ?? null,
    progress: today.progress ?? null,
    presentation: 'progress-aware'
  };
}
