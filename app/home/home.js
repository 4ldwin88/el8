// Canonical Home member-surface module.
// Reads the accepted Active Plan contract without introducing a second plan store.

import { mountAppShell } from '../shell/app-shell.js';
import { mountTrackSheet } from '../track/track-sheet.js';
import { RUNTIME_STATE, runtimeState } from '../resilience/runtime-state.js';

const ACTION_LABEL = Object.freeze({
  continue_discovery: 'Continue Discovery', retry: 'Try again', reload: 'Reload', safety: 'Get immediate help'
});

export function homeRuntimeModel(state = runtimeState(RUNTIME_STATE.READY)) {
  return Object.freeze({
    hidden: state.kind === RUNTIME_STATE.READY,
    kind: state.kind,
    title: state.title,
    message: state.message,
    action: state.action,
    actionLabel: ACTION_LABEL[state.action] || null,
    blocking: state.blocking
  });
}

export function renderHomeRuntimeState(state, { root = document, onAction = null } = {}) {
  const model = homeRuntimeModel(state);
  const region = root.querySelector?.('[data-home-runtime]');
  if (!region) return model;
  region.hidden = model.hidden;
  region.dataset.runtimeKind = model.kind;
  const title = region.querySelector('[data-home-runtime-title]');
  const message = region.querySelector('[data-home-runtime-message]');
  const action = region.querySelector('[data-home-runtime-action]');
  if (title) title.textContent = model.title;
  if (message) message.textContent = model.message;
  if (action) {
    action.hidden = !model.action;
    action.textContent = model.actionLabel || '';
    action.onclick = model.action ? () => onAction?.(model.action, state) : null;
  }
  return model;
}

// Home follows the same member-aware shell lifecycle as Insights and Explore:
// structural HTML supplies first paint; the shell is enhanced once member data is ready.
export function mountHome({ member, plan, quickLogs = [], routes = {}, runtime = runtimeState(RUNTIME_STATE.READY), onRuntimeAction = null } = {}) {
  const trackSheet = mountTrackSheet({ quickLogs });
  const shell = mountAppShell({
    active: 'home',
    routes,
    profileInitial: member?.display_name || member?.full_name || 'M',
    onTrack: trackSheet.show
  });

  renderHomeRuntimeState(runtime, { onAction: onRuntimeAction });
  document.documentElement.dataset.el8Surface = 'home';
  document.dispatchEvent(new CustomEvent('el8:home-mounted', { detail: { member, plan, runtime } }));
  return { shell, trackSheet, runtime: homeRuntimeModel(runtime) };
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
