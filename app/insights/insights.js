import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';

export function mountInsightsShell({ member, quickLogs = [], routes = {} } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs, legacyTrackUrl: '../../track.html' });
  const shell = mountAppShell({
    active: 'insights', routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet.show
  });
  document.documentElement.dataset.el8Surface = 'insights';
  return { shell, trackSheet };
}

export const DIMENSIONS=['Physical','Emotional','Intellectual','Social','Spiritual','Occupational','Financial','Environmental'];
export const CONDITION_VALUE={'Attention':.125,'Struggling':.125,'Needs attention':.125,'Stable':.375,'Okay':.375,'Healthy':.625,'Going well':.625,'Thriving':.875,'Very strong':.875,'Beyond':.875};
export function normalizeCondition(value){return ({'Struggling':'Attention','Needs attention':'Attention','Okay':'Stable','Going well':'Healthy','Very strong':'Thriving','Beyond':'Thriving'}[value]||value||'No data');}
