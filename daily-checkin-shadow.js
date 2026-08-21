import {supabase,getSessionOrRedirect,getMyProfile} from './el8-client.js';
import {runCheckinShadow} from './intelligence/integration/checkin-shadow.js';

const DAY=86400000;
const days=a=>a?Math.max(0,Math.floor((Date.now()-new Date(a))/DAY)):null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function prepare(){
 const session=await getSessionOrRedirect();
 if(!session)return null;
 const profile=await getMyProfile();
 const TZ=profile.timezone||'America/Toronto';
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=t=>parts.find(p=>p.type===t)?.value;
 const today=`${part('year')}-${part('month')}-${part('day')}`;
 const [{data:plan},{data:pending},{data:bank},{data:load},{data:activity}]=await Promise.all([
  supabase.from('el8_plans').select('*').eq('user_id',session.user.id).eq('status','active').eq('is_test',false).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  supabase.from('el8_checkin_followups').select('*').eq('user_id',session.user.id).in('status',['pending','presented']),
  supabase.from('el8_checkin_question_bank').select('*').eq('active',true),
  supabase.from('el8_member_load_state').select('*').eq('user_id',session.user.id).maybeSingle(),
  supabase.from('el8_member_activity').select('*').eq('user_id',session.user.id).maybeSingle()
 ]);
 let focuses=(plan?.focus_dimensions||[]).map(x=>typeof x==='string'?x:x?.dimension).filter(Boolean);
 if(!focuses.length)focuses=[plan?.dimension,plan?.supporting_dimension].filter(Boolean);
 const memberDay=days(profile.created_at)+1,planDays=days(plan?.created_at),absenceDays=days(activity?.last_meaningful_activity_at);
 const scheduled=(bank||[]).filter(q=>{
  const r=q.schedule_rule||{};
  if(q.question_kind!=='normal'||!Object.keys(r).length)return false;
  if(q.min_member_day&&memberDay<q.min_member_day)return false;
  if(q.max_member_day&&memberDay>q.max_member_day)return false;
  if(r.anchor==='membership_start'&&Array.isArray(r.days)&&!r.days.includes(memberDay))return false;
  if(r.anchor==='plan_start'&&r.minimum_elapsed_days!=null&&(planDays==null||planDays<r.minimum_elapsed_days))return false;
  if(r.anchor==='last_meaningful_activity'&&(absenceDays==null||(r.minimum_absence_days!=null&&absenceDays<r.minimum_absence_days)||(r.maximum_absence_days!=null&&absenceDays>r.maximum_absence_days)))return false;
  return q.question_key!=='plan_manageability_v1'&&!(q.question_key==='system_friction_v1'&&memberDay===1);
 });
 const shadow=runCheckinShadow({plan,load,activity,pending:pending||[],scheduled,focuses});
 return {session,today,shadow};
}

async function persist(prepared){
 if(!prepared)return;
 for(let i=0;i<20;i++){
  const{data:row}=await supabase.from('el8_daily_checkins').select('id,adaptation_snapshot').eq('user_id',prepared.session.user.id).eq('local_date',prepared.today).maybeSingle();
  if(row){
   const snapshot={...(row.adaptation_snapshot||{}),intelligence_shadow:prepared.shadow};
   const{error}=await supabase.from('el8_daily_checkins').update({adaptation_snapshot:snapshot}).eq('id',row.id);
   if(error)console.warn('EL8 shadow log could not be saved',error);
   return;
  }
  await sleep(500);
 }
 console.warn('EL8 shadow log timed out waiting for submitted check-in');
}

try{
 const prepared=await prepare();
 const save=document.getElementById('save');
 if(save&&prepared)save.addEventListener('click',()=>persist(prepared),{once:true});
}catch(e){
 // Shadow mode must never block or alter the member-facing check-in.
 console.warn('EL8 adaptive shadow unavailable',e);
}
