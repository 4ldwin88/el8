import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';
export { DIMENSIONS, CONDITION_BANDS, normalizeCondition } from './condition-model.js';

export function mountInsightsShell({ member, quickLogs = [], routes = {} } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs });
  const shell = mountAppShell({
    active: 'insights', routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet.show
  });
  document.documentElement.dataset.el8Surface = 'insights';
  return { shell, trackSheet };
}
