import { getSessionOrRedirect, getMyProfile } from '../../el8-client.js';
import { QUALITATIVE_SCALES, addQuickLog, getQuickLogsForDate, summarizeQuickLogs } from '../track/quick-log.js';

const $=id=>document.getElementById(id);
const sleepDuration=mins=>{const h=Math.floor(mins/60),m=mins%60;if(!mins)return'No sleep logged yet';return`${h?h+'h ':''}${m?m+'m ':''}slept`.trim()};
const rating=(label,measure)=>`<div class="quickItem" data-box="${measure}"><b>${label}</b><div class="quickBtns qualitativeBtns">${QUALITATIVE_SCALES[measure].map((v,i)=>`<button class="qbtn" data-measure="${measure}" data-rate="${i+1}" data-label="${v}">${v}</button>`).join('')}</div><div class="loggedNote" data-note="${measure}"></div></div>`;

export async function mountQuickLog(){
  const session=await getSessionOrRedirect();if(!session)return;
  const profile=await getMyProfile(),timezone=profile.timezone||'America/Toronto',waterTarget=Number(profile.hydration_target_ml)||3000,defaultWeightUnit=String(profile.measurement_system||'metric').toLowerCase()==='imperial'?'lb':'kg';
  async function add(measure,value,unit,metadata={}){try{await addQuickLog({userId:session.user.id,timezone,measure,value,unit,metadata});return true}catch(error){alert(error.message);return false}}
  async function render(){
    let data=[];try{data=await getQuickLogsForDate({userId:session.user.id,timezone})}catch(error){$('quickActive').innerHTML='Quick logs unavailable.';return}
    const summary=summarizeQuickLogs(data,{hydrationTargetMl:waterTarget}),water=summary.waterMl,sleepLogs=data.filter(x=>x.measure==='sleep_end'),mood=summary.mood,energy=summary.energy,weight=summary.weight;
    let a='',due=0;
    if(water<waterTarget){due++;a+=`<div class="quickItem"><div class="quickHead"><b class="quickTitle">Water</b><span class="quickValue">${water.toLocaleString()} / ${waterTarget.toLocaleString()} mL</span></div><div class="progress"><i style="width:${Math.min(100,water/waterTarget*100)}%"></i></div><div class="quickBtns"><button class="qbtn" data-water="200">+200 mL</button><button class="qbtn" data-water="500">+500 mL</button><button class="qbtn" data-water="1000">+1 L</button><button class="qbtn" id="customWater">Custom</button></div></div>`}
    a+=`<div class="quickItem"><div class="quickHead"><b>Sleep</b><span class="quickValue">${sleepDuration(summary.sleepMinutes)}</span></div><div class="quickBtns"><button class="qbtn primary" id="sleepBtn">Log sleep</button></div></div>`;if(!sleepLogs.length)due++;
    if(!mood){due++;a+=rating('Mood','mood')}if(!energy){due++;a+=rating('Energy','energy')}
    if(!weight){due++;a+=`<div class="quickItem"><b>Weight</b><div class="weightRow"><input class="quickInput" id="weightInput" type="number" step="0.1" inputmode="decimal" placeholder="Weight"><select class="unitSelect" id="weightUnit"><option value="kg"${defaultWeightUnit==='kg'?' selected':''}>kg</option><option value="lb"${defaultWeightUnit==='lb'?' selected':''}>lb</option></select><button class="qbtn weightSave" id="weightSave">Log</button></div></div>`}
    $('quickActive').innerHTML=a;
    const done=[];if(water>=waterTarget)done.push(`Water · ${water.toLocaleString()} mL`);if(mood)done.push(`Mood · ${mood.metadata?.label||QUALITATIVE_SCALES.mood[(+mood.value||3)-1]||mood.value}`);if(energy)done.push(`Energy · ${energy.metadata?.label||QUALITATIVE_SCALES.energy[(+energy.value||3)-1]||energy.value}`);if(weight)done.push(`Weight · ${weight.value} ${weight.unit||'kg'}`);
    $('quickCount').textContent=`${due} due · ${done.length+(sleepLogs.length?1:0)} completed`;$('quickCompleted').innerHTML=done.length?`<details class="completedDetails"><summary>Completed today (${done.length})</summary>${done.map(x=>`<div class="quickItem">${x}</div>`).join('')}</details>`:'';
    document.querySelectorAll('[data-water]').forEach(b=>b.onclick=async()=>{if(await add('water',+b.dataset.water,'mL'))render()});const cw=$('customWater');if(cw)cw.onclick=async()=>{const v=+prompt('Water amount in mL');if(v>0&&await add('water',v,'mL'))render()};const sb=$('sleepBtn');if(sb)sb.onclick=()=>location.href='sleep-log.html';
    document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=async()=>{const m=b.dataset.measure,n=+b.dataset.rate,label=b.dataset.label,box=b.closest('[data-box]');box.querySelectorAll('.qbtn').forEach(x=>x.classList.toggle('selected',x===b));if(await add(m,n,'qualitative',{label})){box.querySelector(`[data-note="${m}"]`).textContent=`${label} logged`;setTimeout(render,500)}});const ws=$('weightSave');if(ws)ws.onclick=async()=>{const v=+$('weightInput').value,u=$('weightUnit').value;if(v>0&&await add('weight',v,u))render()};
  }
  await render();
}
