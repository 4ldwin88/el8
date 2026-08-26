import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';

export function mountPlanShell({ member, quickLogs = [], routes = {} } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs });
  const shell = mountAppShell({
    active: 'plan',
    routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet.show
  });
  document.documentElement.dataset.el8Surface = 'plan';
  return { shell, trackSheet };
}

export function planScheduleModel(plan, interventions = []) {
  const items = interventions.map((item, index) => ({
    id: item.id || `plan-${index + 1}`,
    title: item.action || item.title || item.label || 'Plan action',
    cadence: item.cadence || item.frequency || item.schedule || null,
    timing: item.timing || item.time || null,
    dimensions: Array.isArray(item.dimensions) ? item.dimensions : []
  }));
  return { items, hasSchedule: items.some(item => item.cadence || item.timing) };
}
