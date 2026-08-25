import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { BACKEND_CONFIG, assertDevelopmentRuntime } from '../../config/backend.js';

assertDevelopmentRuntime();

export const supabase = createClient(BACKEND_CONFIG.supabaseUrl, BACKEND_CONFIG.supabasePublishableKey, {
  auth: {
    storageKey: BACKEND_CONFIG.storageKey,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

let profilePromise = null;

export async function getSessionOrRedirect({ loginRoute='index.html' }={}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const next = encodeURIComponent(location.pathname.split('/').pop() || 'home.html');
    location.replace(`${loginRoute}?next=${next}`);
    return null;
  }
  return session;
}

export async function getMyProfile({ refresh=false }={}) {
  if (refresh || !profilePromise) {
    profilePromise = supabase.from('el8_profiles').select('*').single().then(({data,error}) => {
      if (error) { profilePromise=null; throw error; }
      return data;
    });
  }
  return profilePromise;
}

export async function signOut({ loginRoute='index.html' }={}) {
  profilePromise=null;
  await supabase.auth.signOut();
  location.replace(loginRoute);
}

export function developmentRecordMetadata(metadata={}) {
  return {...metadata, environment:BACKEND_CONFIG.environment, data_namespace:BACKEND_CONFIG.testDataNamespace};
}
