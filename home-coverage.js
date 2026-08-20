import { supabase, getMyProfile } from './el8-client.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function localDate(timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const get = type => parts.find(x => x.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function classify(rows, waterTarget) {
  const byType = type => rows.filter(x => x.signal_type === type);
  const tracks = rows.filter(x => x.source === 'track');
  const checkins = rows.filter(x => x.source === 'daily_checkin');
  const water = byType('water').filter(x => Number(x.payload?.value) > 0);
  const waterMl = water.reduce((sum,x) => sum + (String(x.payload?.unit || '').toLowerCase() === 'ml' ? Number(x.payload?.value) || 0 : 0), 0);
  const sleep = byType('sleep_end').filter(x => Number(x.payload?.value) > 0 && x.payload?.metadata?.start_time && x.payload?.metadata?.end_time);
  const mood = byType('mood').filter(x => Number(x.payload?.value) >= 1 && Number(x.payload?.value) <= 10);
  const energy = byType('energy').filter(x => Number(x.payload?.value) >= 1 && Number(x.payload?.value) <= 10);
  const weight = byType('weight').filter(x => Number(x.payload?.value) > 0);
  const food = tracks.filter(x => String(x.signal_type).toLowerCase() === 'food' || String(x.payload?.category || '').toLowerCase() === 'food');
  const movement = checkins.filter(x => String(x.payload?.movement || '').trim());
  return [
    {key:'nutrition',role:'expected',name:'Nutrition',state:food.length?'Present':'Missing',detail:food.length?`${food.length} confirmed food log${food.length===1?'':'s'}`:'No confirmed meal evidence'},
    {key:'hydration',role:'expected',name:'Hydration',state:waterMl>=waterTarget?'Target met':waterMl>0?'In progress':'Missing',detail:`${waterMl.toLocaleString()} / ${waterTarget.toLocaleString()} mL`},
    {key:'sleep',role:'expected',name:'Sleep',state:sleep.length?'Present':'Missing',detail:sleep.length?`${sleep.length} valid sleep interval${sleep.length===1?'':'s'}`:'No valid sleep interval'},
    {key:'mood',role:'expected',name:'Mood',state:mood.length?'Present':'Missing',detail:mood.length?`${mood.at(-1).payload.value}/10`:'Not logged'},
    {key:'energy',role:'expected',name:'Energy',state:energy.length?'Present':'Missing',detail:energy.length?`${energy.at(-1).payload.value}/10`:'Not logged'},
    {key:'checkin',role:'expected',name:'Daily check-in',state:checkins.length?'Present':'Missing',detail:checkins.length?'Submitted':'Not submitted'},
    {key:'movement',role:'supporting',name:'Movement',state:movement.length?'Present':'Optional',detail:movement.length?'Captured in check-in':'No movement context'},
    {key:'weight',role:'supporting',name:'Weight',state:weight.length?'Present':'Optional',detail:weight.length?`${weight.at(-1).payload.value} ${weight.at(-1).payload.unit||''}`.trim():'Not logged'}
  ];
}

function coverageState(signals) {
  const expected=signals.filter(x=>x.role==='expected'),present=expected.filter(x=>x.state!=='Missing').length,supporting=signals.filter(x=>x.role==='supporting'&&x.state==='Present').length,targetMet=signals.some(x=>x.key==='hydration'&&x.state==='Target met');
  if(!present)return {name:'No data',body:'EL8 does not yet have enough evidence to characterize today.'};
  if(present<=2)return {name:'Minimal',body:'Some useful evidence exists, but important context is still missing.'};
  if(present<=4)return {name:'Acceptable',body:'EL8 has enough useful evidence to begin interpreting today without requiring every possible log.'};
  if(present<expected.length||supporting<1)return {name:'Exceptional',body:'Today is supported by rich evidence across most relevant signals.'};
  if(targetMet&&supporting===2)return {name:'Beyond',body:'Evidence extends beyond what EL8 needs for a well-supported daily picture.'};
  return {name:'Exceptional',body:'Today is supported by rich evidence across the relevant signals.'};
}

function adaptivePrompt(signals,state) {
  const missing=key=>signals.find(x=>x.key===key)?.state==='Missing';
  if(state.name==='Acceptable'||state.name==='Exceptional'||state.name==='Beyond')return null;
  if(missing('mood')&&missing('energy'))return {title:'A little more context would help',body:'Mood and energy would materially improve EL8’s interpretation of today.'};
  if(missing('sleep'))return {title:'Sleep context is missing',body:'If you slept or napped today, a valid interval would materially improve today’s evidence.',href:'sleep-log.html',action:'Log sleep'};
  if(missing('checkin'))return {title:'Daily context is still missing',body:'The daily check-in adds context that event logs alone cannot provide.',href:'daily-checkin.html',action:'Daily check-in'};
  if(missing('nutrition'))return {title:'Nutrition context is missing',body:'If you eat today, tracking a meal will add useful Physical evidence.',href:'track.html',action:'Track something'};
  return null;
}

export async function mountHomeCoverage() {
  const home=document.getElementById('home'),quickCard=home?.querySelector('.el8-card');
  if(!home||!quickCard||document.getElementById('homeCoverage'))return;
  const profile=await getMyProfile(),today=localDate(profile.timezone||'America/Toronto'),waterTarget=Number(profile.hydration_target_ml)||3000;
  const{data,error}=await supabase.rpc('el8_member_daily_signals',{p_local_date:today});
  const card=document.createElement('div');card.id='homeCoverage';card.className='el8-card';
  if(error){card.innerHTML='<h2>Today’s coverage</h2><p>Coverage is temporarily unavailable.</p>';quickCard.after(card);return;}
  const signals=classify(data||[],waterTarget),state=coverageState(signals),gaps=signals.filter(x=>x.role==='expected'&&x.state==='Missing').slice(0,3),inProgress=signals.filter(x=>x.state==='In progress'),prompt=adaptivePrompt(signals,state);
  const promptHtml=prompt?`<div style="border-top:1px solid var(--line);margin-top:16px;padding-top:16px"><b>${esc(prompt.title)}</b><p style="margin:6px 0 0">${esc(prompt.body)}</p>${prompt.href?`<a class="reviewLink" href="${esc(prompt.href)}">${esc(prompt.action)}</a>`:''}</div>`:'';
  card.innerHTML=`<div class="quickHead"><div><h2 style="margin:0">Today’s coverage</h2><div class="quickMeta">Evidence sufficiency, not checklist completion</div></div><span class="pill"><b>${esc(state.name)}</b></span></div><p>${esc(state.body)}</p><div class="quickMeta">${inProgress.map(x=>`<div style="margin-top:5px"><b>${esc(x.name)}</b> · ${esc(x.detail)}</div>`).join('')}${gaps.length?`<div style="margin-top:7px">Useful gaps: ${esc(gaps.map(x=>x.name).join(', '))}.</div>`:'<div style="margin-top:7px">No important evidence gaps right now.</div>'}</div><a class="reviewLink" href="daily-coverage.html">View daily coverage</a>${promptHtml}`;
  quickCard.after(card);
}
