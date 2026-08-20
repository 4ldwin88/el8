const item=(label,href,description='')=>`<a href="${href}"><span><b>${label}</b>${description?`<span class="quickMeta" style="display:block;margin-top:3px">${description}</span>`:''}</span><span>›</span></a>`;
export function mountProfileV2(){
  const legacy=document.getElementById('me');
  if(!legacy)return;
  legacy.id='profile';
  const eyebrow=legacy.querySelector('.el8-eyebrow');
  if(eyebrow)eyebrow.textContent='Profile';
  const h1=legacy.querySelector('h1');
  if(h1)h1.textContent='Your EL8.';
  const head=legacy.querySelector('.memberHead');
  const menus=[...legacy.querySelectorAll('.menu')];
  const mainMenu=menus[0];
  if(mainMenu)mainMenu.innerHTML=[
    item('Overview','profile-setup.html?return=profile','Your profile, membership and personal summary.'),
    item('Saved','coming-soon.html?feature=Saved','Content and resources you chose to keep.'),
    item('History','history.html?return=profile','Your meaningful EL8 activity and historical records.'),
    item('Achievements','coming-soon.html?feature=Achievements','Milestones and accomplishments.'),
    item('Assessments','history.html?return=profile','Baseline, assessments and reassessments.'),
    item('Goals','coming-soon.html?feature=Goals','Active, completed and historical goals.'),
    item('Rewards','coming-soon.html?feature=Rewards','Points, credits and future member benefits.'),
    item('Reports','coming-soon.html?feature=Reports','Summaries and future shareable reports.'),
    item('Connections','coming-soon.html?feature=Connections','Connected apps, devices and services.'),
    '<button id="profileSettingsBtn"><span><b>Settings & Data</b><span class="quickMeta" style="display:block;margin-top:3px">Preferences, privacy, permissions and account controls.</span></span><span>›</span></button>'
  ].join('');
  const oldSettings=document.getElementById('settingsBtn');if(oldSettings)oldSettings.remove();
  const navButton=document.querySelector('.nav button[data-page="me"]');
  if(navButton){navButton.dataset.page='profile';const label=navButton.querySelector('span:last-child');if(label)label.textContent='Profile'}
  document.querySelectorAll('a').forEach(a=>{if(a.textContent.includes('Me → Saved'))a.textContent=a.textContent.replace('Me → Saved','Profile → Saved')});
  const settings=document.getElementById('settings');if(settings){const e=settings.querySelector('.el8-eyebrow');if(e)e.textContent='Settings & Data';const sh=settings.querySelector('h1');if(sh)sh.textContent='Settings & Data.';const back=document.getElementById('settingsBack');if(back)back.textContent='Back to Profile'}
  const settingsBtn=document.getElementById('profileSettingsBtn');if(settingsBtn)settingsBtn.onclick=()=>{document.querySelectorAll('.page,.subpage').forEach(x=>x.classList.toggle('active',x.id==='settings'));const nav=document.getElementById('nav');if(nav)nav.style.display='none';history.replaceState(null,'','#settings');scrollTo(0,0)};
  const back=document.getElementById('settingsBack');if(back)back.onclick=()=>{document.querySelectorAll('.page,.subpage').forEach(x=>x.classList.toggle('active',x.id==='profile'));const nav=document.getElementById('nav');if(nav)nav.style.display='block';document.querySelectorAll('.nav button[data-page]').forEach(x=>x.classList.toggle('active',x.dataset.page==='profile'));history.replaceState(null,'','#profile');scrollTo(0,0)};
  if(location.hash==='#me')history.replaceState(null,'','#profile');
}
