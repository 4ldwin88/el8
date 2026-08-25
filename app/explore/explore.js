import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';

export function mountExploreShell({ member, quickLogs = [], routes = {} } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs, legacyTrackUrl: '../../track.html' });
  const shell = mountAppShell({ active:'explore', routes, profileInitial:member?.display_name||member?.full_name||'M', onTrack:trackSheet.show });
  document.documentElement.dataset.el8Surface='explore';
  return { shell, trackSheet };
}
