// Discovery v2.4 generalized concern-sufficiency policy.
// Keeps concern existence separate from concern understanding.

const POLICY = {
  energy: {
    scopeQuestion: 'PH0',
    targets: ['low_energy','poor_sleep','low_activity','physical_condition','low_activation'],
    minTouches: 2
  },
  work: {
    scopeQuestion: 'W3',
    targets: ['work_instability','schedule_disruption'],
    minTouches: 2
  },
  relationships: {
    scopeQuestion: 'R3',
    targets: ['relationship_strain','low_support'],
    minTouches: 2
  },
  support: {
    scopeQuestion: 'S3',
    targets: ['low_support','lonely','relationship_strain'],
    minTouches: 2
  },
  focus: {
    scopeQuestion: 'F2',
    targets: ['low_focus','low_activation','low_energy','poor_sleep','stress','lack_direction','schedule_disruption'],
    minTouches: 2
  },
  money: {
    driverQuestion: 'M3',
    targets: ['money_pressure','work_instability'],
    minTouches: 1
  }
};

const BROAD_CONCERNS = new Set(['energy','work','relationships','support','focus']);

function usableAnswer(answer) {
  if (!answer) return null;
  const ids = (answer.ids || []).filter(id => !['unsure','none','other'].includes(id));
  return ids.length ? ids : null;
}

function evidenceFor(session, questionId) {
  return usableAnswer(session.answers.find(a => a.qid === questionId));
}

function requirementFor(signalId) {
  return POLICY[signalId] || null;
}

function refreshSufficiency(session, signal) {
  const rule = requirementFor(signal.id);
  if (!rule) return signal;
  const qid = rule.scopeQuestion || rule.driverQuestion;
  const evidence = evidenceFor(session, qid);
  signal.driverKnown = !!evidence;
  signal.driverEvidence = evidence ? evidence.join(',') : null;
  if (rule.scopeQuestion) signal.scoped = !!evidence;
  return signal;
}

function priorityQuestion(signal) {
  const rule = requirementFor(signal.id);
  if (!rule) return null;
  if (rule.scopeQuestion && !signal.scoped) return rule.scopeQuestion;
  if (rule.driverQuestion && !signal.driverKnown) return rule.driverQuestion;
  return null;
}

export { POLICY, BROAD_CONCERNS, requirementFor, refreshSufficiency, priorityQuestion };
export default { POLICY, BROAD_CONCERNS, requirementFor, refreshSufficiency, priorityQuestion };
