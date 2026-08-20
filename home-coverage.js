import { supabase, getMyProfile } from './el8-client.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function localDate(timeZone) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date());
  const get = type => parts.find(x => x.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function classify(rows) {
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
    {key:'nutrition',name:'Nutrition',state:food.length >= 2 ? 'Complete' : food.length ? 'Partial' : 'No data',detail:food.length ? `${food.length} food log${food.length===1?'':'s'}` : 'No confirmed meals'},
    {key:'hydration',name:'Hydration',state:waterMl >= 2000 ? 'Complete' : waterMl > 0 ? 'Partial' : 'No data',detail:waterMl ? `${waterMl.toLocaleString()} mL logged` : 'No water logged'},
    {key:'sleep',name:'Sleep',state:sleep.length ? 'Complete' : 'No data',detail:sleep.length ? `${sleep.length} sleep interval${sleep.length===1?'':'s'}` : 'No valid sleep interval'},
    {key:'mood',name:'Mood',state:mood.length ? 'Complete' : 'No data',detail:mood.length ? `${mood.at(-1).payload.value}/10` : 'Not logged'},
    {key:'energy',name:'Energy',state:energy.length ? 'Complete' : 'No data',detail:energy.length ? `${energy.at(-1).payload.value}/10` : 'Not logged'},
    {key:'movement',name:'Movement',state:movement.length ? 'Complete' : 'No data',detail:movement.length ? 'Captured in check-in' : 'Not captured'},
    {key:'weight',name:'Weight',state:weight.length ? 'Complete' : 'No data',detail:weight.length ? `${weight.at(-1).payload.value} ${weight.at(-1).payload.unit || ''}`.trim() : 'Optional today'},
    {key:'checkin',name:'Daily check-in',state:checkins.length ? 'Complete' : 'No data',detail:checkins.length ? 'Submitted' : 'Not submitted'}
  ];
}

function adaptivePrompt(signals) {
  const missing = key => signals.find(x => x.key === key)?.state === 'No data';
  const partial = key => signals.find(x => x.key === key)?.state === 'Partial';
  if (missing('mood') && missing('energy')) return {title:'A little more context would help',body:'Mood and energy are still unknown today. Logging them gives EL8 context for interpreting sleep, activity and other changes.',action:'Log mood & energy',target:'quick'};
  if (missing('sleep')) return {title:'Sleep context is missing',body:'If you slept or napped today, logging the interval will improve today’s Physical evidence.',action:'Log sleep',href:'sleep-log.html'};
  if (missing('hydration') || partial('hydration')) return {title:'Hydration is still incomplete',body:'EL8 has limited hydration evidence today. Add water as you drink it rather than estimating everything later.',action:'Add water',target:'quick'};
  if (missing('checkin')) return {title:'Daily context is still missing',body:'Your quick logs show events; the daily check-in adds context about how the day actually went.',action:'Daily check-in',href:'daily-checkin.html'};
  if (missing('nutrition') || partial('nutrition')) return {title:'Nutrition coverage is limited',body:'If you have another meal today, Track can add it without requiring a separate questionnaire.',action:'Track something',href:'track.html'};
  return {title:'No extra question needed',body:'Today’s core signals are sufficiently covered. EL8 will avoid asking for information it already has.',action:'View coverage',href:'daily-coverage.html'};
}

export async function mountHomeCoverage() {
  const home = document.getElementById('home');
  const quickCard = home?.querySelector('.el8-card');
  if (!home || !quickCard || document.getElementById('homeCoverage')) return;
  const profile = await getMyProfile();
  const today = localDate(profile.timezone || 'America/Toronto');
  const { data, error } = await supabase.rpc('el8_member_daily_signals', { p_local_date: today });
  const card = document.createElement('div');
  card.id = 'homeCoverage';
  card.className = 'el8-card';
  if (error) {
    card.innerHTML = '<h2>Today’s coverage</h2><p>Coverage is temporarily unavailable.</p>';
    quickCard.after(card);
    return;
  }
  const signals = classify(data || []);
  const complete = signals.filter(x => x.state === 'Complete').length;
  const partial = signals.filter(x => x.state === 'Partial').length;
  const percent = Math.round((complete + partial * .5) / signals.length * 100);
  const missingNames = signals.filter(x => x.state !== 'Complete').slice(0,3).map(x => x.name);
  const prompt = adaptivePrompt(signals);
  card.innerHTML = `
    <div class="quickHead"><div><h2 style="margin:0">Today’s coverage</h2><div class="quickMeta">${complete} of ${signals.length} core signals covered${partial ? ` · ${partial} partial` : ''}</div></div><b>${percent}%</b></div>
    <div class="progress"><i style="width:${percent}%"></i></div>
    <p class="quickMeta">${missingNames.length ? `Still limited: ${esc(missingNames.join(', '))}.` : 'EL8 has adequate daily evidence.'} Missing data is not scored as failure.</p>
    <a class="reviewLink" href="daily-coverage.html">View daily coverage</a>
    <div style="border-top:1px solid var(--line);margin-top:16px;padding-top:16px"><b>${esc(prompt.title)}</b><p style="margin:6px 0 0">${esc(prompt.body)}</p>${prompt.href ? `<a class="reviewLink" href="${esc(prompt.href)}">${esc(prompt.action)}</a>` : `<button class="qbtn" id="adaptiveQuick" style="margin-top:10px">${esc(prompt.action)}</button>`}</div>`;
  quickCard.after(card);
  document.getElementById('adaptiveQuick')?.addEventListener('click', () => {
    document.querySelector('.quickDetails')?.setAttribute('open','');
    quickCard.scrollIntoView({behavior:'smooth',block:'start'});
  });
}
