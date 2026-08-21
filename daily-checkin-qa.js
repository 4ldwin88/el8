import { supabase, getSessionOrRedirect, getMyProfile } from './el8-client.js';

const $=id=>document.getElementById(id);
const localDate=(timezone='America/Toronto')=>{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};

try{
  const session=await getSessionOrRedirect();
  if(!session) throw new Error('No session');
  const profile=await getMyProfile();
  if(profile?.member_code==='T0006') $('qaReset')?.classList.remove('hidden');

  const button=$('qaResetToday');
  if(button) button.onclick=async()=>{
    const date=localDate(profile?.timezone||'America/Toronto');
    if(!confirm(`Reset your submitted Daily Check-in for ${date}? This is a Member Zero QA action.`)) return;
    button.disabled=true;
    $('qaResetStatus').textContent='Resetting…';
    try{
      const {data,error}=await supabase.functions.invoke('qa-reset-daily-checkin',{body:{local_date:date}});
      if(error) throw error;
      if(!data?.ok) throw new Error(data?.error||'QA reset failed');
      $('qaResetStatus').textContent=data.deleted?'Check-in reset. Reloading…':'No matching check-in was found.';
      if(data.deleted) setTimeout(()=>location.reload(),500);
      else button.disabled=false;
    }catch(e){
      console.error('QA reset failed',e);
      $('qaResetStatus').textContent=`Reset failed: ${e?.message||e}`;
      button.disabled=false;
    }
  };
}catch(e){
  console.warn('QA reset control unavailable',e);
}
