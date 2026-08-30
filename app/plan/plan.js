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

export function planScheduleModel(plan, actions = []) {
  const source = actions.length ? actions : (plan?.activeActions || plan?.proposedActions || plan?.actions || []);
  const items = source.map((item, index) => ({
    id: item.actionId || item.id || `plan-${index + 1}`,
    title: item.title || item.name || item.instruction || 'Plan action',
    cadence: item.cadence || item.frequency || item.schedule || item.measurement?.cadence || null,
    timing: item.timing || item.time || null,
    focusIds: Array.isArray(item.focusIds) ? item.focusIds : [],
    dimensionIds: Array.isArray(item.dimensionIds) ? item.dimensionIds : []
  }));
  return { items, hasSchedule: items.some(item => item.cadence || item.timing) };
}
