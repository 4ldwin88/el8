export const STANDARD_ENTRY_PLAN=Object.freeze({
 id:'standard-entry-probe-v1',
 title:'Standard entry plan',
 purpose:'Build a clearer whole-person signal before EL8 narrows to a more specific plan.',
 duration:'7 days or an accelerated QA review',
 actions:Object.freeze([
  Object.freeze({id:'ENTRY_DAILY_SIGNAL',title:'Daily signal check-in',action:'Once a day, record energy, stress, and the main thing making the day easier or harder.',tracking:'Energy, stress, and one main friction or support.',rationale:'Shows which concerns repeatedly affect day-to-day functioning instead of treating every selected concern as equally actionable.'}),
  Object.freeze({id:'ENTRY_ROUTINE_SNAPSHOT',title:'Routine snapshot',action:'Record sleep timing, intentional movement, and whether your day had a workable structure.',tracking:'Sleep timing, movement, and routine structure.',rationale:'Adds a small set of observable baseline signals that can explain or rule out several overlapping concerns.'}),
  Object.freeze({id:'ENTRY_PRIORITY_SIGNAL',title:'What mattered today',action:'At the end of the day, choose the one concern that had the biggest practical effect.',tracking:'One daily concern plus a short optional note.',rationale:'Creates comparative evidence so EL8 can distinguish what is important in principle from what is actually driving current needs.'})
 ])
});
export function standardEntryPlan(){return STANDARD_ENTRY_PLAN}
export default STANDARD_ENTRY_PLAN;
