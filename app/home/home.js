// Canonical Home member-surface module.
// Reads the accepted Active Plan contract without introducing a second plan store.

import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';

export async function mountHome({ member, plan, quickLogs = [], routes = {} } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs });
  const shell = mountAppShell({
    active: 'home',
    routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet.show
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
