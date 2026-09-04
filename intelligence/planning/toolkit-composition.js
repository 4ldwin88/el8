// Projection of Drive 02.01.08.01 Tool Registry / Intervention-Tool Links.
// Toolkit composition is downstream of Intervention selection and cannot make an Action eligible.
// Initial port is intentionally limited to the Tool required by the human-QA Action that exposed the gap.
const TOOLS=Object.freeze({
 TOL000013:Object.freeze({toolId:'TOL000013',name:'Pressure Pattern Log',role:'learning_measurement_execution',purpose:'Capture brief context-linked pressure observations only when identifying a recurring pattern can change the next decision.',memberDescription:'A short log for noticing when pressure shows up and what was happening around it.',lifecycle:'candidate',safety:'Stop or adapt if tracking increases rumination, distress, fixation or avoidance; concerning disclosure routes separately.'})
});
const LINKS=Object.freeze({
 ACT000009:Object.freeze([{linkId:'ITL000025',toolId:'TOL000013',requirement:'required',role:'learning_measurement_execution'}])
});
export function composeToolkitForAction(actionId){const links=LINKS[actionId]??[];if(!links.length)return null;const tools=links.map(link=>Object.freeze({...TOOLS[link.toolId],linkId:link.linkId,requirement:link.requirement,role:link.role})).filter(Boolean);return tools.length?Object.freeze({actionId,tools,compositionAuthority:'02.01.08.01'}):null}
