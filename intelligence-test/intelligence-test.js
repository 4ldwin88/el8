import{createIntelligenceTestSession,beginIntelligenceTest,elapsedMs,nextSequence,telemetryEnvelope,recordTelemetryFailure,recordTelemetrySuccess,telemetryHealthy}from'../app/research/intelligence-test-contract.js';
import{INTELLIGENCE_TEST_STORAGE_KEY}from'../app/research/intelligence-test-version.js';

const STORAGE_KEY=INTELLIGENCE_TEST_STORAGE_KEY;
const API_BASE='https://jprdsidxwjkgiqqakwpr.supabase.co/functions/v1/intelligence-test';
const TELEMETRY_TIMEOUT_MS=2500;
export const TELEMETRY_STATE_EVENT='el8:qa-telemetry-state';

export function loadTestSession(){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch{return null}}
export function saveTestSession(session){localStorage.setItem(STORAGE_KEY,JSON.stringify(session));return session}
export function clearTestSession(){localStorage.removeItem(STORAGE_KEY)}
export function newTestSession(testerMode='prefer_not_to_say'){return createIntelligenceTestSession({testerMode})}
export function qaTelemetryHealthy(session){return telemetryHealthy(session)}
function publishTelemetryState(detail){try{globalThis.dispatchEvent?.(new CustomEvent(TELEMETRY_STATE_EVENT,{detail}))}catch{}return detail}
async function send(session,path,payload){const body=telemetryEnvelope(session,payload),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),TELEMETRY_TIMEOUT_MS);try{const r=await fetch(`${API_BASE}/${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:controller.signal});if(!r.ok)throw new Error(`QA telemetry ${path} failed (${r.status})`);recordTelemetrySuccess(session);saveTestSession(session);publishTelemetryState({ok:true,path,session_id:session.id});return true}catch(error){const normalized=error?.name==='AbortError'?new Error(`QA telemetry ${path} timed out after ${TELEMETRY_TIMEOUT_MS}ms`):error;recordTelemetryFailure(session,normalized);saveTestSession(session);console.error('EL8 internal QA telemetry failure',normalized);publishTelemetryState({ok:false,path,session_id:session.id,error:session.telemetry?.last_error});return false}finally{clearTimeout(timeout)}}
function dispatch(session,path,payload){void send(session,path,payload);return true}

export async function start(session){const begun=beginIntelligenceTest(session);begun.stage='discovery';saveTestSession(begun);dispatch(begun,'event',{sequence:nextSequence(begun),event_type:'test_started',stage:'discovery',screen_id:'introduction',elapsed_ms:elapsedMs(begun),payload:{tester_mode:begun.tester_mode}});saveTestSession(begun);return begun}
export async function event(session,eventType,stage,screenId,questionId=null,payload={}){if(!session)return false;const record={sequence:nextSequence(session),event_type:eventType,stage,screen_id:screenId,question_id:questionId,elapsed_ms:elapsedMs(session),payload};saveTestSession(session);return dispatch(session,'event',record)}
export async function note(session,{stage,screenId,questionId=null,text}){if(!session||!text?.trim())return false;return dispatch(session,'note',{sequence:nextSequence(session),stage,screen_id:screenId,question_id:questionId,elapsed_ms:elapsedMs(session),text:text.trim()})}
