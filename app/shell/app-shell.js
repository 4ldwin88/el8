// EL8 canonical MVP member shell.
// Primary navigation is structural: HTML renders it immediately; this module progressively enhances it.

const DEFAULT_ROUTES = Object.freeze({
  home: 'home.html', plan: 'plan.html', insights: 'insights.html', explore: 'explore.html', profile: 'profile.html'
});
const PROFILE_INITIAL_KEY='el8-profile-initial';
const ICONS = Object.freeze({
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  plan: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M8 11h8M8 15h5"/></svg>',
  insights: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></svg>',
  explore: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4z"/></svg>',
  track: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
});
function routeMap(overrides={}){return{...DEFAULT_ROUTES,...overrides}}
function go(url){if(url)window.location.href=url}
function normalizedInitial(initial){const value=String(initial||'').trim();return value?value.slice(0,1).toUpperCase():''}
export function cachedProfileInitial(){try{return normalizedInitial(localStorage.getItem(PROFILE_INITIAL_KEY))}catch{return''}}
export function rememberProfileInitial(initial){const value=normalizedInitial(initial);if(value)try{localStorage.setItem(PROFILE_INITIAL_KEY,value)}catch{}return value}
function resolvedInitial(initial){return normalizedInitial(initial)||cachedProfileInitial()}
// Unknown identity stays visually neutral. Never flash a fictional/default member avatar.
function initialMarkup(initial){return resolvedInitial(initial)}
function drawerMarkup(resolved, initial){return `<div class="el8-profile-backdrop" data-profile-close></div><aside class="el8-profile-drawer" role="dialog" aria-modal="true" aria-label="Profile menu" tabindex="-1"><div class="el8-profile-drawer-head"><span class="el8-shell-avatar">${initialMarkup(initial)}</span><div><strong>Profile</strong><small>Your EL8 account</small></div><button type="button" class="el8-profile-close" data-profile-close aria-label="Close Profile menu">×</button></div><nav class="el8-profile-menu" aria-label="Profile"><a href="${resolved.profile}">Profile & history <span>›</span></a><a href="personal-info.html?return=profile">Personal information <span>›</span></a><a href="privacy-data.html">Privacy & data <span>›</span></a></nav></aside>`}
function installDrawer(shell,resolved,initial,trigger){
  const host=document.createElement('div');host.className='el8-profile-drawer-host';host.hidden=true;host.innerHTML=drawerMarkup(resolved,initial);document.body.appendChild(host);
  const drawer=host.querySelector('.el8-profile-drawer');let prior=null;let touchX=null;
  const focusables=()=>[...drawer.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')];
  const close=()=>{if(host.hidden)return;host.classList.remove('is-open');document.body.classList.remove('el8-profile-open');setTimeout(()=>{host.hidden=true},180);(prior||trigger)?.focus?.()};
  const open=()=>{prior=document.activeElement;host.hidden=false;requestAnimationFrame(()=>host.classList.add('is-open'));document.body.classList.add('el8-profile-open');drawer.focus()};
  host.querySelectorAll('[data-profile-close]').forEach(el=>el.addEventListener('click',close));
  drawer.addEventListener('touchstart',e=>{touchX=e.touches[0]?.clientX??null},{passive:true});drawer.addEventListener('touchend',e=>{if(touchX!=null&&(e.changedTouches[0]?.clientX??touchX)-touchX>70)close();touchX=null},{passive:true});
  document.addEventListener('keydown',e=>{if(host.hidden)return;if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='Tab'){const f=focusables();if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  window.addEventListener('popstate',()=>{if(!host.hidden)close()});
  return{open,close};
}
function installScrollBehavior(shell){
  const nav=shell.querySelector('.el8-shell-nav'),track=shell.querySelector('.el8-shell-track');if(!nav)return;
  if(shell._el8ScrollHandler)window.removeEventListener('scroll',shell._el8ScrollHandler);
  let last=Math.max(0,window.scrollY),down=0,up=0,ticking=false;
  const paint=()=>{const y=Math.max(0,window.scrollY),delta=y-last;
    if(y<28){nav.classList.remove('is-hidden');track?.classList.remove('nav-hidden');down=0;up=0}
    else if(delta>0){down+=delta;up=0;if(y>72&&down>=28){nav.classList.add('is-hidden');track?.classList.add('nav-hidden');down=0}}
    else if(delta<0){up+=-delta;down=0;if(up>=12){nav.classList.remove('is-hidden');track?.classList.remove('nav-hidden');up=0}}
    last=y;ticking=false};
  const handler=()=>{if(!ticking){ticking=true;requestAnimationFrame(paint)}};shell._el8ScrollHandler=handler;window.addEventListener('scroll',handler,{passive:true});
}
function wireNavigation(shell,active,resolved){
  const items=[...shell.querySelectorAll('.el8-shell-nav-item')];
  for(const [index,key] of ['home','plan','insights','explore'].entries()){
    const button=items[index];if(!button)continue;button.type='button';button.className='el8-shell-nav-item';button.toggleAttribute('aria-current',key===active);if(key===active)button.setAttribute('aria-current','page');button.innerHTML=`${ICONS[key]}<span>${key[0].toUpperCase()}${key.slice(1)}</span>`;button.onclick=()=>go(resolved[key]);
  }
}
function enhanceShell(shell,{active='home',routes={},profileInitial='',onTrack=null,onProfile=null}={}){
  const resolved=routeMap(routes);wireNavigation(shell,active,resolved);const confirmed=rememberProfileInitial(profileInitial),initial=confirmed||cachedProfileInitial();
  let profileButton=shell.querySelector('.el8-shell-profile');if(!profileButton){profileButton=document.createElement('button');profileButton.type='button';profileButton.className='el8-shell-profile';profileButton.setAttribute('aria-label','Open Profile menu');shell.prepend(profileButton)}profileButton.innerHTML=`<span class="el8-shell-avatar">${initialMarkup(initial)}</span>`;
  let trackButton=shell.querySelector('.el8-shell-track');if(!trackButton){trackButton=document.createElement('button');trackButton.type='button';trackButton.className='el8-shell-track';trackButton.setAttribute('aria-label','Track or quick log');shell.appendChild(trackButton)}trackButton.innerHTML=`${ICONS.track}<span>Track</span>`;trackButton.onclick=()=>onTrack?onTrack():document.dispatchEvent(new CustomEvent('el8:track-requested'));
  document.querySelector('.el8-profile-drawer-host')?.remove();const drawer=installDrawer(shell,resolved,initial,profileButton);profileButton.onclick=()=>onProfile?onProfile():drawer.open();installScrollBehavior(shell);return shell;
}
export function createAppShell({active='home',routes={},profileInitial='',onTrack=null,onProfile=null}={}){
  const resolved=routeMap(routes),shell=document.createElement('div');shell.className='el8-app-shell';
  const profileButton=document.createElement('button');profileButton.type='button';profileButton.className='el8-shell-profile';profileButton.setAttribute('aria-label','Open Profile menu');profileButton.innerHTML=`<span class="el8-shell-avatar">${initialMarkup(profileInitial)}</span>`;
  const nav=document.createElement('nav');nav.className='el8-shell-nav';nav.setAttribute('aria-label','Primary');const navInner=document.createElement('div');navInner.className='el8-shell-nav-inner';
  for(const key of ['home','plan','insights','explore']){const button=document.createElement('button');button.type='button';button.className='el8-shell-nav-item';if(key===active)button.setAttribute('aria-current','page');button.innerHTML=`${ICONS[key]}<span>${key[0].toUpperCase()}${key.slice(1)}</span>`;button.addEventListener('click',()=>go(resolved[key]));navInner.appendChild(button)}nav.appendChild(navInner);
  const trackButton=document.createElement('button');trackButton.type='button';trackButton.className='el8-shell-track';trackButton.setAttribute('aria-label','Track or quick log');trackButton.innerHTML=`${ICONS.track}<span>Track</span>`;trackButton.addEventListener('click',()=>onTrack?onTrack():document.dispatchEvent(new CustomEvent('el8:track-requested')));
  shell.append(profileButton,nav,trackButton);return shell;
}
export function mountAppShell(options={}){
  const root=options.root||document.body;
  const active=options.active||pageFromLocation();
  const existing=(active&&root.querySelector(`[data-static-shell="${active}"]`))||root.querySelector('.el8-app-shell');
  if(existing)return enhanceShell(existing,options);
  const shell=createAppShell(options);root.appendChild(shell);return enhanceShell(shell,options);
}
function pageFromLocation(){const file=(location.pathname.split('/').pop()||'home.html').toLowerCase();if(file==='plan.html')return'plan';if(file==='insights.html')return'insights';if(file==='explore.html')return'explore';if(file==='home.html'||file===''||file==='index.html')return'home';return null}
const structuralPage=pageFromLocation();if(structuralPage&&document.body)mountAppShell({active:structuralPage,profileInitial:cachedProfileInitial()});
export const EL8_MVP_DESTINATIONS=Object.freeze(['home','plan','insights','explore']);
