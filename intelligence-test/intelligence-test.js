import{createIntelligenceTestSession,beginIntelligenceTest,elapsedMs,nextSequence}from'../app/research/intelligence-test-contract.js';

const STORAGE_KEY='el8_intelligence_test_session_v1';
const API_BASE='https://jprdsidxwjkgiqqakwpr.supabase.co/functions/v1/intelligence-test';

export function loadTestSession(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch{return null}}
export function saveTestSession(session){localStorage.setItem(STORAGE_KEY,JSON.stringify(session));return session}
export function clearTestSession(){localStorage.removeItem(STORAGE_KEY)}
export function newTestSession(testerMode='prefer_not_to_say'){return createIntelligenceTestSession({testerMode})}

async function send(path,payload){try{const r=await fetch(`${API_BASE}/${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});return r.ok}catch{return false}}

export async function start(session){const begun=beginIntelligenceTest(session);begun.stage='discovery';saveTestSession(begun);await send('event',{session_id:begun.id,sequence:nextSequence(begun),event_type:'test_started',stage:'discovery',screen_id:'introduction',elapsed_ms:elapsedMs(begun),payload:{tester_mode:begun.tester_mode}});saveTestSession(begun);return begun}
export async function event(session,eventType,stage,screenId,questionId=null,payload={}){if(!session)return false;const record={session_id:session.id,sequence:nextSequence(session),event_type:eventType,stage,screen_id:screenId,question_id:questionId,elapsed_ms:elapsedMs(session),payload};saveTestSession(session);return send('event',record)}
export async function note(session,{stage,screenId,questionId=null,text}){if(!text?.trim())return false;return send('note',{session_id:session.id,sequence:nextSequence(session),stage,screen_id:screenId,question_id:questionId,elapsed_ms:elapsedMs(session),text:text.trim()})}
