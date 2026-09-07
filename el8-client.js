import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(
  'https://jprdsidxwjkgiqqakwpr.supabase.co',
  'sb_publishable_CkcqWpD6nkzRzBfuJV08TQ_t38C9j34'
);

let profilePromise = null;
const PROFILE_INITIAL_KEY='el8-profile-initial';

function syncProfileIdentity(profile){
  const source=String(profile?.display_name||profile?.full_name||'').trim();
  const initial=source?source.slice(0,1).toUpperCase():'';
  if(!initial)return profile;
  try{localStorage.setItem(PROFILE_INITIAL_KEY,initial)}catch{}
  document.querySelectorAll?.('.el8-shell-avatar').forEach(avatar=>{avatar.textContent=initial});
  return profile;
}

export async function getSessionOrRedirect() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const next = encodeURIComponent(location.pathname.split('/').pop() || 'home.html');
    location.replace(`index.html?next=${next}`);
    return null;
  }
  return session;
}

export async function getMyProfile({ refresh = false } = {}) {
  if (refresh || !profilePromise) {
    profilePromise = supabase.from('el8_profiles').select('*').single().then(({ data, error }) => {
      if (error) { profilePromise = null; throw error; }
      return syncProfileIdentity(data);
    });
  }
  return profilePromise;
}

export async function signOut() {
  profilePromise = null;
  try{localStorage.removeItem(PROFILE_INITIAL_KEY)}catch{}
  await supabase.auth.signOut();
  location.replace('index.html');
}
