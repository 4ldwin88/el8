export const EXPERIENCE_OPTIONS=[
 {id:'sleep_energy',label:'Sleep or energy',dimensions:{Physical:.9,Emotional:.25,Intellectual:.25}},
 {id:'mood_stress',label:'Mood, stress or emotions',dimensions:{Emotional:.9,Intellectual:.2,Physical:.15}},
 {id:'relationships',label:'Relationships, loneliness or support',dimensions:{Social:.9,Emotional:.3}},
 {id:'meaning',label:'Meaning, purpose or direction',dimensions:{Spiritual:.9,Emotional:.25,Occupational:.2}},
 {id:'focus',label:'Focus, learning or mental overload',dimensions:{Intellectual:.9,Emotional:.25,Occupational:.2}},
 {id:'work',label:'Work, school or career',dimensions:{Occupational:.9,Financial:.35,Emotional:.25}},
 {id:'money',label:'Money or financial security',dimensions:{Financial:.9,Emotional:.3,Occupational:.2}},
 {id:'environment',label:'Home, surroundings or access',dimensions:{Environmental:.9,Emotional:.25,Physical:.2}},
 {id:'multiple',label:'Several things are interacting',dimensions:{}},
 {id:'none',label:'Nothing in particular',dimensions:{}},
 {id:'unsure',label:'I’m not sure',dimensions:{}}
];
export const EXPERIENCE_SCREEN={id:'EXP01',prompt:"What's been affecting you lately?",helper:'Choose anything that feels relevant. EL8 will work out the wellness areas underneath it.',multi:true};
export const EXPERIENCE_SEVERITY={id:'EXP02',prompt:'Overall, how much has this been affecting your day-to-day life?',options:['A little','Moderately','A lot','Severely','Unsure']};
const S={'A little':.22,'Moderately':.42,'A lot':.68,'Severely':.88};
export function inferExperienceRoute(ids=[]){const scores={};for(const id of ids){const x=EXPERIENCE_OPTIONS.find(o=>o.id===id);for(const[d,v]of Object.entries(x?.dimensions||{}))scores[d]=Math.max(scores[d]||0,v)}return scores}
export function applyExperienceSeverity(route={},answer='Moderately'){const severity=S[answer];if(severity==null)return Object.fromEntries(Object.keys(route).map(d=>[d,Math.max(.28,route[d]*.45)]));return Object.fromEntries(Object.entries(route).map(([d,w])=>[d,Math.min(1,severity*(.55+.45*Number(w)))]))}
export function shouldDiscover(ids=[],route={}){return ids.includes('unsure')||ids.includes('multiple')||Object.keys(route).length===0}
export function expandRoute(route={},evidence={}){const next={...route};for(const key of Object.keys(evidence)){const d=key.split('.')[0];if(d&&!next[d])next[d]=.32}return next}
