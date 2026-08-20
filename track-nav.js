const nav=document.querySelector('nav.nav .navin');
if(nav){
 nav.innerHTML=`<button type="button" data-dest="home"><svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5v8a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>Home</button><button type="button" data-dest="explore"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4z"/></svg>Explore</button><button type="button" aria-current="page"><span class="mark"><img src="assets/brand/el8-mark.svg" alt=""></span>Track</button><button type="button" data-dest="insights"><svg viewBox="0 0 24 24"><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></svg>Insights</button><button type="button" data-dest="profile"><span class="avatar" id="trackNavAvatar">M</span>Profile</button>`;
 const pages={home:'home.html',explore:'explore.html',insights:'insights.html',profile:'profile.html'};
 nav.querySelectorAll('[data-dest]').forEach(b=>b.addEventListener('click',()=>location.href=pages[b.dataset.dest]));
}