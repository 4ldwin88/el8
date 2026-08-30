// Cross-cutting question helpers only.
// Canonical General questions live in general.js. Dimension-owned questions live in their own modules.
// Legacy O*/G*/D*/C*/HV*/X* runtime questions were removed during Drive Question Bank reconciliation.

export const Q = (id, role, text, targets = [], options = [], burden = 0.2, mode = 'single', metadata = {}) => ({
  id,
  role,
  text,
  targets,
  burden,
  mode,
  ...metadata,
  options: options.map(([optionId, label, effects = {}, optionMetadata = {}]) => ({
    id: optionId,
    label,
    effects,
    ...optionMetadata,
  })),
});

export const CORE_QUESTIONS = Object.freeze([]);
