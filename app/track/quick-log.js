import { supabase } from '../../el8-client.js';

export const QUALITATIVE_SCALES = Object.freeze({
  mood: Object.freeze(['Very low','Low','Okay','Good','Great']),
  energy: Object.freeze(['Drained','Low','Okay','Energized','High'])
});

export function localDate(timezone = 'UTC', date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
  const get = type => parts.find(part => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export async function addQuickLog({ userId, timezone='UTC', measure, value, unit=null, metadata={}, date=new Date() } = {}) {
  if (!userId || !measure) throw new Error('Quick log requires userId and measure.');
  const { data, error } = await supabase.from('el8_quick_logs').insert({
    user_id:userId,
    local_date:localDate(timezone,date),
    measure,
    value,
    unit,
    metadata
  }).select().single();
  if (error) throw error;
  return data;
}

export async function getQuickLogsForDate({ userId, timezone='UTC', date=new Date() } = {}) {
  if (!userId) throw new Error('Quick logs require userId.');
  const day=localDate(timezone,date);
  const { data=[], error } = await supabase.from('el8_quick_logs').select('*').eq('user_id',userId).eq('local_date',day).order('logged_at');
  if (error) throw error;
  return data;
}

export function summarizeQuickLogs(logs=[], { hydrationTargetMl=3000 } = {}) {
  const latest = measure => [...logs].reverse().find(log => log.measure === measure) || null;
  const sleep = logs.filter(log => log.measure === 'sleep_end');
  return {
    waterMl: logs.filter(log => log.measure === 'water').reduce((sum,log)=>sum+(Number(log.value)||0),0),
    hydrationTargetMl,
    sleepMinutes: sleep.reduce((sum,log)=>sum+(Number(log.value)||Number(log.metadata?.duration_minutes)||0),0),
    sleepEntries:sleep.length,
    mood:latest('mood'),
    energy:latest('energy'),
    weight:latest('weight')
  };
}

export async function logSleepInterval({ userId, timezone='UTC', start, end } = {}) {
  const startDate = new Date(start), endDate = new Date(end), durationMinutes = Math.round((endDate-startDate)/60000);
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('Sleep end time must be after start time.');
  return addQuickLog({
    userId, timezone, measure:'sleep_end', value:durationMinutes, unit:'minutes', date:endDate,
    metadata:{start_time:startDate.toISOString(),end_time:endDate.toISOString(),duration_minutes:durationMinutes,entry_method:'manual_interval',sleep_start_local_date:localDate(timezone,startDate)}
  });
}
