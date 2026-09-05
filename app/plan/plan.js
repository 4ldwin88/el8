import { mountAppShell } from '../shell/app-shell.js';

// Primary navigation is structural. Mount it as soon as the Plan module evaluates
// so Track or plan-data failures cannot remove access to the rest of EL8.
mountAppShell({ active: 'plan' });

export async function mountPlanShell({ member, quickLogs = [], routes = {} } = {}) {
  let trackSheet = null;
  try {
    const { mountTrackSheet } = await import('../track/track-sheet.js');
    trackSheet = mountTrackSheet({ quickLogs });
  } catch (error) {
    console.error('EL8 Track failed to initialize on Plan; primary navigation remains available.', error);
  }
  const shell = mountAppShell({
    active: 'plan',
    routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet?.show || null
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
