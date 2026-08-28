import {supabase,getSessionOrRedirect,getMyProfile} from './el8-client.js';
const INTELLIGENCE_VERSION='Intelligence v0.1';
const session=await getSessionOrRedirect();
// Mobile opening Discovery matrix override: all five response columns must remain visible at once.
if(document.querySelector('.matrix')){
  const matrixStyle=document.createElement('style');
  matrixStyle.textContent=`@media(max-width:700px){.page{padding-left:8px!important;padding-right:8px!important}.matrix-wrap{overflow-x:hidden!important}.matrix{width:100%!important;min-width:0!important;table-layout:fixed!important}.matrix .label{position:static!important;width:34%!important;padding:8px 5px!important;font-size:10px!important;line-height:1.15!important}.matrix thead th{font-size:8px!important;padding:7px 1px!important;white-space:normal!important;overflow-wrap:anywhere!important}.matrix th:not(.label),.matrix td{width:13.2%!important;padding:7px 1px!important}.pick{width:26px!important;height:26px!important}.pick.sel{box-shadow:inset 0 0 0 6px var(--card)!important}}`;
  document.head.appendChild(matrixStyle);
}
if(session){
  const profile=await getMyProfile();
  if(/^T\d+/i.test(profile?.member_code||'')){
    const component=document.querySelector('.el8-eyebrow')?.textContent?.split('·')[0]?.trim()||document.title.split('·').pop()?.trim()||'';
    const versionEl=document.querySelector('.version');
    if(versionEl)versionEl.textContent=component?`${INTELLIGENCE_VERSION} · ${component}`:INTELLIGENCE_VERSION;
    const style=document.createElement('style');
    style.textContent=`.el8-qa-note{position:static;box-sizing:border-box;width:min(650px,calc(100% - 36px));margin:28px auto 18px;background:var(--card,#fff);color:var(--ink,#111);border:1px solid var(--line,#ddd);border-radius:16px;padding:12px}.el8-qa-note summary{cursor:pointer;font-weight:800}.el8-qa-note textarea{width:100%;box-sizing:border-box;margin-top:9px;border:1px solid var(--line,#ddd);border-radius:10px;padding:10px;background:var(--card,#fff);color:inherit;font:inherit}.el8-qa-note button{width:100%;margin-top:7px;border:0;border-radius:10px;padding:10px;background:var(--ink,#111);color:var(--bg,#fff);font:inherit;font-weight:800}.el8-qa-note small{display:block;margin-top:6px;color:var(--muted,#666)}`;
    document.head.appendChild(style);
    const box=document.createElement('details');box.className='el8-qa-note';box.open=true;box.innerHTML='<summary>Dev note</summary><textarea rows="3" placeholder="What feels wrong, confusing, or worth changing on this page?"></textarea><button type="button">Save note</button><small>Tester-only · attached to this QA run and page.</small>';document.body.appendChild(box);
    const textarea=box.querySelector('textarea'),button=box.querySelector('button'),status=box.querySelector('small');
    button.onclick=async()=>{const note=textarea.value.trim();if(!note){status.textContent='Enter a note first.';return}const runId=sessionStorage.getItem('el8_qa_run_id');if(!runId){status.textContent='Open Full E2E MVP QA first to start a recorded run.';return}button.disabled=true;status.textContent='Saving…';const snapshot={url:location.href,title:document.title,discovery:!!sessionStorage.getItem('el8_discovery_output'),confirmedPriorities:JSON.parse(sessionStorage.getItem('el8_confirmed_priorities')||'[]'),plan:JSON.parse(sessionStorage.getItem('el8_canonical_initial_plan')||'null')};const{error}=await supabase.from('el8_qa_events').insert({run_id:runId,user_id:session.user.id,event_type:'tester_dev_note',step:location.pathname.split('/').pop()||'page',payload:{note,snapshot,intelligenceVersion:INTELLIGENCE_VERSION}});status.textContent=error?'Save failed: '+error.message:'Saved to QA telemetry.';if(!error)textarea.value='';button.disabled=false};
  }
}
