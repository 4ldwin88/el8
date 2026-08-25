import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';

export function mountProfileShell({ member, quickLogs = [], routes = {} } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs, legacyTrackUrl: '../../track.html' });
  const shell = mountAppShell({
    active: '', routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet.show,
    onProfile: () => window.scrollTo({ top: 0, behavior: 'smooth' })
  });
  document.documentElement.dataset.el8Surface = 'profile';
  return { shell, trackSheet };
}
