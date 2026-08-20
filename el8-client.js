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

// Track remains a large working capture surface. Migrate only its navigation
// so capture, interpretation, confirmation and persistence logic stay intact.
if (location.pathname.endsWith('/track.html') || location.pathname.endsWith('track.html')) {
  queueMicrotask(() => import('./track-nav.js').catch(error => console.error('Track navigation unavailable', error)));
}

// Compatibility enhancements for the retired combined shell while old links
// are being drained. New primary navigation uses independent pages.
if (location.pathname.endsWith('/app.html') || location.pathname.endsWith('app.html')) {
  queueMicrotask(() => {
    const actions = document.getElementById('planActions');
    if (actions && !document.getElementById('planEngineActions')) {
      const wrap = document.createElement('div');
      wrap.id = 'planEngineActions';
      wrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px';
      wrap.innerHTML = '<a href="plan-checkin.html" style="display:block;text-align:center;text-decoration:none;border:1px solid var(--line);border-radius:13px;padding:12px;color:var(--ink);font-weight:800;background:var(--card)">Plan check-in</a><a href="plan-review.html" style="display:block;text-align:center;text-decoration:none;border:1px solid var(--line);border-radius:13px;padding:12px;color:var(--ink);font-weight:800;background:var(--card)">Review plan</a>';
      actions.parentElement?.appendChild(wrap);
    }
    const insightCards = document.getElementById('dimensionBars');
    if (insightCards && !document.getElementById('planEvidenceLink')) {
      const card = document.createElement('a');
      card.id = 'planEvidenceLink';
      card.href = 'insights-evidence.html';
      card.className = 'card';
      card.style.cssText = 'display:block;text-decoration:none;color:inherit';
      card.innerHTML = '<div class="row"><div><h2>Plan evidence</h2><p style="margin:0">See what check-ins and reviews actually support.</p></div><span>›</span></div>';
      insightCards.after(card);
    }
  });
}
