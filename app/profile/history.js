export function normalizeHistoryRecords({ entries = [], daily = [], weekly = [], assessments = [] } = {}) {
  const pretty = value => String(value ?? '—').replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
  return [
    ...entries.map(record => ({
      key: `t:${record.entry_id}`,
      type: 'tracking', kind: 'tracking',
      time: record.payload?.event_time || record.created_at,
      title: record.payload?.summary || 'Tracking record',
      label: record.payload?.category || record.record_type || 'Tracking',
      raw: record
    })),
    ...daily.map(record => ({ key: `d:${record.id}`, type: 'checkin', kind: 'daily', time: record.submitted_at || record.created_at, title: 'Daily check-in', label: 'Daily', raw: record })),
    ...weekly.map(record => ({ key: `w:${record.id}`, type: 'checkin', kind: 'weekly', time: record.submitted_at || record.created_at, title: 'Weekly check-in', label: 'Weekly', raw: record })),
    ...assessments.map(record => ({ key: `a:${record.id}`, type: 'assessment', kind: 'assessment', time: record.submitted_at || record.completed_at || record.created_at, title: pretty(record.module_type), label: 'Assessment', raw: record }))
  ].filter(record => record.time).sort((a, b) => new Date(b.time) - new Date(a.time));
}

export function filterHistoryRecords(records = [], { type = 'all', year, month, timeZone = 'UTC' } = {}) {
  return records.filter(record => {
    if (type !== 'all' && record.type !== type) return false;
    if (year == null && month == null) return true;
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' }).formatToParts(new Date(record.time));
    const get = key => Number(parts.find(part => part.type === key)?.value);
    return (year == null || get('year') === Number(year)) && (month == null || get('month') === Number(month));
  });
}

export function historyRecordPolicy(record) {
  if (!record) return { editable: false, immutableReason: 'Unknown record.' };
  if (record.kind === 'tracking') return { editable: true, correctionMode: 'append-audited-correction' };
  if (record.kind === 'assessment') return { editable: false, immutableReason: 'Submitted assessments are permanent records. Measure change with a new reassessment.' };
  return { editable: false, immutableReason: 'Submitted check-ins are permanent historical records. Later check-ins capture later changes.' };
}

export function buildTrackingCorrection(record, { summary, dimension, category, reason, correctedAt = new Date().toISOString() } = {}) {
  if (record?.kind !== 'tracking') throw new Error('Only tracking records can be corrected.');
  if (!String(reason || '').trim()) throw new Error('A correction reason is required.');
  return {
    entryId: record.raw.entry_id,
    expectedPayloadHash: record.raw.payload_hash,
    changeReason: String(reason).trim(),
    payload: {
      ...(record.raw.payload || {}),
      summary: String(summary || '').trim(),
      dimension: String(dimension || '').trim(),
      category: String(category || '').trim(),
      member_corrected_at: correctedAt
    }
  };
}
