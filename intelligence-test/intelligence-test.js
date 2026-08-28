import{createIntelligenceTestSession,beginIntelligenceTest,nextSequence}from'../app/research/intelligence-test-contract.js';
const STORAGE_KEY='el8_intelligence_test_session_v1';
export function loadTestSession(){try{return JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null')}catch{return null}}
export function saveTestSession(session){sessionStorage.setItem(STORAGE_KEY,JSON.stringify(session));return session}
export function clearTestSession(){sessionStorage.removeItem(STORAGE_KEY)}
export function newTestSession(mode='prefer_not_to_say'){return createIntelligenceTestSession({testerMode:mode})}
export async function start(session){const next=beginIntelligenceTest(session);Object.assign(session,next,{stage:'discovery'});saveTestSession(session);await event(session,'test_started','discovery','introduction',null,{mode:session.tester_mode});return session}
export async function event(session,eventType,stage,screenId,questionId=null,payload={}){if(!session)return false;session.events=Array.isArray(session.events)?session.events:[];session.events.push({sequence:nextSequence(session),occurred_at:new Date().toISOString(),event_type:eventType,stage,screen_id:screenId,question_id:questionId,payload});saveTestSession(session);return true}
export async function note(session,{stage='unknown',screenId='unknown',questionId=null,text=''}={}){const clean=String(text||'').trim();if(!session||!clean)return false;session.tester_notes=Array.isArray(session.tester_notes)?session.tester_notes:[];session.tester_notes.push({sequence:nextSequence(session),occurred_at:new Date().toISOString(),stage,screen_id:screenId,question_id:questionId,text:clean});saveTestSession(session);return true}
