export const ROUTING_DIMENSIONS=['Physical','Emotional','Social','Spiritual','Intellectual','Occupational','Financial','Environmental'];
export const ROUTING_SCREEN={
 id:'ROUTE01',
 prompt:'Which areas have affected your wellbeing recently?',
 helper:'Choose all that apply. If nothing stands out, choose None right now.',
 options:[...ROUTING_DIMENSIONS,'None right now','Unsure'],
 multi:true
};
export const ROUTING_SEVERITY={
 id:'ROUTE02',
 prompt:'How much are these areas affecting you right now?',
 options:['A little','Moderately','A lot','Severely','Unsure'],
 multi:false
};
const severity={"A little":.22,"Moderately":.42,"A lot":.68,"Severely":.88};
export function routeDimensions(answer=[]){const a=Array.isArray(answer)?answer:[answer];return ROUTING_DIMENSIONS.filter(d=>a.includes(d))}
export function routingEvidence(dimensions=[],answer='Moderately'){const v=severity[answer]??0;return Object.fromEntries(dimensions.map(d=>[d,v]))}
export function routingState(dimensions=[],answer='Moderately'){return{dimensions:[...dimensions],severity:severity[answer]??0,ambiguous:answer==='Unsure',healthy:dimensions.length===0}}
