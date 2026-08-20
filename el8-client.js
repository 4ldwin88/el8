import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(
  'https://jprdsidxwjkgiqqakwpr.supabase.co',
  'sb_publishable_CkcqWpD6nkzRzBfuJV08TQ_t38C9j34'
);

let profilePromise = null;

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
      return data;
    });
  }
  return profilePromise;
}

export async function signOut() {
  profilePromise = null;
  await supabase.auth.signOut();
  location.replace('index.html');
}

// Track remains a large working capture surface. Its navigation is isolated
// so capture, interpretation, confirmation and persistence logic stay intact.
if (location.pathname.endsWith('/track.html') || location.pathname.endsWith('track.html')) {
  queueMicrotask(() => import('./track-nav.js').catch(error => console.error('Track navigation unavailable', error)));
}
