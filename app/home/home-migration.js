import { mountHome } from './home.js';
import { derivePlanQuickLogs } from './plan-quick-logs.js';

export async function mountMigratedHome({ member, plan } = {}) {
  const quickLogs = derivePlanQuickLogs(plan, {
    onSelect: item => {
      // Existing structured Quick Log remains the persistence implementation during migration.
      // Opening Home's Quick Log is safer than creating a second write path here.
      const details = document.querySelector('.quickDetails');
      if (details) {
        details.open = true;
        details.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      document.dispatchEvent(new CustomEvent('el8:quick-log-selected', { detail: item }));
    }
  });

  return mountHome({
    member,
    plan,
    quickLogs,
    routes: {
      home: 'home.html',
      plan: 'mvp-shell.html#plan',
      insights: 'insights.html',
      explore: 'explore.html',
      profile: 'profile.html'
    }
  });
}
