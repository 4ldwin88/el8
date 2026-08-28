const STORAGE_KEY='el8_intelligence_test_session_v1';

function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
function id(){return globalThis.crypto?.randomUUID?.()||`test-${Date.now()}-${Math.random().toString(16).slice(2)}`}

export function loadTestSession(){
  try{return JSON.parse(sessionStorage.getItem(STORAGE_KEY)||'null')}catch{return null}
}

export function saveTestSession(session){
  sessionStorage.setItem(STORAGE_KEY,JSON.stringify(session));
  return session;
}

export function clearTestSession(){sessionStorage.removeItem(STORAGE_KEY)}

export function newTestSession(mode='prefer_not_to_say'){
  return {id:id(),version:'Intelligence v0.1',mode,stage:'intro',created_at:new Date().toISOString(),started_at:null,events:[],tester_notes:[]};
}

export async function start(session){
  session.started_at=new Date().toISOString();
  session.stage='baseline';
  saveTestSession(session);
  await event(session,'test_started','intro','start',null,{mode:session.mode});
  return session;
}

export async function event(session,eventType,stage,screenId,questionId=null,payload={}){
  if(!session)return false;
  const entry={occurred_at:new Date().toISOString(),event_type:eventType,stage,screen_id:screenId,question_id:questionId,payload:clone(payload)};
  session.events=Array.isArray(session.events)?session.events:[];
  session.events.push(entry);
  saveTestSession(session);
  return true;
}

export async function note(session,{stage='unknown',screenId='unknown',questionId=null,text='' }={}){
  const clean=String(text||'').trim();
  if(!session||!clean)return false;
  const entry={occurred_at:new Date().toISOString(),stage,screen_id:screenId,question_id:questionId,text:clean};
  session.tester_notes=Array.isArray(session.tester_notes)?session.tester_notes:[];
  session.tester_notes.push(entry);
  saveTestSession(session);
  return true;
}
