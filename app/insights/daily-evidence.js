const SUPPORTED_DAILY_DIMENSIONS = new Set(['Financial', 'Physical', 'Emotional']);

export function summarizeDailyEvidence({ signals = [], planDimensions = [], hydrationTargetMl = 3000 } = {}) {
  const all = Array.isArray(signals) ? signals : [];
  const dimensions = Array.isArray(planDimensions) ? planDimensions : [];
  const byType = type => all.filter(signal => signal.signal_type === type);
  const tracks = all.filter(signal => signal.source === 'track');
  const checks = all.filter(signal => signal.source === 'daily_checkin');

  const water = byType('water').filter(signal => Number(signal.payload?.value) > 0);
  const waterMl = water.reduce((sum, signal) => sum + (String(signal.payload?.unit || '').toLowerCase() === 'ml' ? Number(signal.payload?.value) || 0 : 0), 0);
  const sleep = byType('sleep_end').filter(signal => Number(signal.payload?.value) > 0 && signal.payload?.metadata?.start_time && signal.payload?.metadata?.end_time);
  const mood = byType('mood').filter(signal => Number(signal.payload?.value) >= 1 && Number(signal.payload?.value) <= 10);
  const energy = byType('energy').filter(signal => Number(signal.payload?.value) >= 1 && Number(signal.payload?.value) <= 10);
  const weight = byType('weight').filter(signal => Number(signal.payload?.value) > 0);
  const food = tracks.filter(signal => String(signal.signal_type).toLowerCase() === 'food' || String(signal.payload?.category || '').toLowerCase() === 'food');
  const financial = checks.filter(signal => signal.payload?.employment_result || signal.payload?.debt_direction || signal.payload?.employment_action || signal.payload?.employment);
  const movement = checks.filter(signal => String(signal.payload?.movement || '').trim());
  const physicalCount = food.length + water.length + sleep.length + movement.length;

  const countFor = dimension => dimension === 'Financial' ? financial.length : dimension === 'Physical' ? physicalCount : dimension === 'Emotional' ? mood.length : 0;
  const coverage = dimensions.map(dimension => ({ dimension, evidenceCount: countFor(dimension), supportedMapping: SUPPORTED_DAILY_DIMENSIONS.has(dimension) }));
  const coveredDimensions = coverage.filter(item => item.evidenceCount > 0).length;
  const totalMappedEvidence = coverage.reduce((sum, item) => sum + item.evidenceCount, 0);
  const hasDailyCheckin = checks.length > 0;

  let confidence = 'Limited';
  if (dimensions.length && coveredDimensions === dimensions.length && hasDailyCheckin) confidence = 'Supported';
  if (dimensions.length && coveredDimensions === dimensions.length && totalMappedEvidence >= Math.max(3, dimensions.length) && hasDailyCheckin) confidence = 'Strong';

  const observations = [];
  if (financial.length) observations.push({ type: 'financial', label: 'Financial context', value: 'Captured in daily context' });
  if (food.length) observations.push({ type: 'food', label: 'Nutrition', value: `${food.length} confirmed food log${food.length === 1 ? '' : 's'}` });
  if (waterMl) observations.push({ type: 'water', label: 'Hydration', value: `${waterMl} / ${hydrationTargetMl} mL` });
  if (sleep.length) observations.push({ type: 'sleep', label: 'Sleep', value: `${sleep.length} valid interval${sleep.length === 1 ? '' : 's'}` });
  if (movement.length) observations.push({ type: 'movement', label: 'Movement', value: 'Captured in daily context' });
  if (mood.length) observations.push({ type: 'mood', label: 'Mood', value: `${mood.at(-1).payload.value}/10` });
  if (energy.length) observations.push({ type: 'energy', label: 'Energy', value: `${energy.at(-1).payload.value}/10` });
  if (weight.length) observations.push({ type: 'weight', label: 'Weight', value: `${weight.at(-1).payload.value} ${weight.at(-1).payload.unit || ''}`.trim() });

  const evidenceLimits = coverage.filter(item => !item.evidenceCount).map(item => item.supportedMapping
    ? `No mapped day-level evidence for ${item.dimension}.`
    : `${item.dimension} does not yet have dedicated day-level evidence mapping.`);
  if (!hasDailyCheckin) evidenceLimits.push('No submitted daily context assessment.');

  return {
    confidence,
    observations,
    coverage,
    evidenceLimits,
    hydration: { loggedMl: waterMl, targetMl: hydrationTargetMl, remainingMl: Math.max(hydrationTargetMl - waterMl, 0), met: waterMl >= hydrationTargetMl },
    hasDailyCheckin,
    principle: 'Missing data is not evidence that an event did not occur.'
  };
}
