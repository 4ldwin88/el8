import { decidePlanAdaptation } from '../../intelligence/planning/adaptation-policy.js';

export function normalizeReviewRow(row={}){
  const derived=row.derived_outputs||{};
  if(!derived.outcome||!derived.decision)return null;
  return {sessionId:row.id,recordedAt:row.submitted_at||derived.outcome.recordedAt||null,outcome:derived.outcome,decision:derived.decision};
}

export function adaptationFromReviewRows(rows=[],interventionId){
  const reviews=rows.map(normalizeReviewRow).filter(Boolean).filter(r=>r.outcome.interventionId===interventionId).sort((a,b)=>String(a.recordedAt||'').localeCompare(String(b.recordedAt||'')));
  return {reviews,policy:decidePlanAdaptation(reviews)};
}
