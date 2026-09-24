// Shared, lightweight line icons. No font or network dependency.
function uiIcon(name){
 const paths={
  today:'<circle cx="12" cy="12" r="8"/><path d="M8 14s1.5 2 4 2 4-2 4-2M8 9h.01M16 9h.01"/>',
  journal:'<path d="M7 3h12v18H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM7 3v18M10 8h6M10 12h4"/>',
  insights:'<path d="M4 19V5M4 19h16M8 14l4-5 4 3 4-7"/><circle cx="8" cy="14" r="1"/>',
  community:'<path d="M20 11a7 7 0 0 1-7 7H8l-5 3 1.5-5A7 7 0 0 1 4 6a8 8 0 0 1 13-1M16 4h5M18.5 1.5v5"/>',
  care:'<path d="M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z"/>',
  leaf:'<path d="M5 19C1 9 9 3 21 3c0 12-7 17-15 13M3 21 15 9"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  breath:'<path d="M3 8h12a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3"/>',
  sound:'<path d="M9 17V5l11-2v12M9 8l11-2"/><ellipse cx="6" cy="17" rx="3" ry="2"/><ellipse cx="17" cy="15" rx="3" ry="2"/>',
  snack:'<path d="M4 12h16c0 6-3 8-8 8s-8-2-8-8ZM8 8V5M12 7V3M16 8V5M2 12h20"/>',
  play:'<circle cx="12" cy="12" r="9"/><path d="M5 5c6 1 13 8 14 14M19 5C13 6 6 13 5 19"/>',
  quiet:'<path d="M20 14a9 9 0 0 1-10-11 9 9 0 1 0 10 11Z"/>',
  chat:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 2 1-5A8 8 0 1 1 21 11Z"/><path d="M8 10h8M8 14h5"/>',
  plan:'<rect x="4" y="4" width="16" height="17" rx="3"/><path d="M8 2v4M16 2v4M4 9h16M8 14l2 2 5-4"/>',
  connections:'<rect x="7" y="6" width="10" height="12" rx="3"/><path d="M9 6V2h6v4M9 18v4h6v-4M9 12h2l1-2 1 4 1-2h1"/>',
  sparkle:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>'
 };
 return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.care}</svg>`;
}
function polishUI(){
 const labels={today:'此刻的我',journal:'情绪日记',insights:'看见自己',community:'心情广场',care:'陪伴关怀'};
 document.querySelectorAll('.nav').forEach(b=>b.querySelector('span').innerHTML=uiIcon(b.dataset.page));
 document.querySelector('#section-title').textContent=labels[page];
 document.body.dataset.careView=page==='care'?supportTab==='chat'?(adoptedPet?companionPane:'adoption'):supportTab:'';
 document.querySelectorAll('[data-ui-icon]').forEach(el=>el.innerHTML=uiIcon(el.dataset.uiIcon));
 document.querySelectorAll('.support-tabs button').forEach(b=>b.insertAdjacentHTML('afterbegin',uiIcon({chat:'care',plan:'plan',exercises:'breath',connections:'connections'}[b.dataset.supportTab])));
 const modes=document.querySelectorAll('.companion-mode button');
 modes.forEach(b=>b.insertAdjacentHTML('afterbegin',uiIcon(b.dataset.companionPane==='room'?'play':'chat')));
 if(page==='today'){
  const form=document.querySelector('.today-primary>.card');
  form.insertAdjacentHTML('afterend',`<div class="care-shortcuts" aria-label="给自己一点关怀"><button data-care="breath"><span class="shortcut-icon">${uiIcon('breath')}</span><span><strong>呼吸一下</strong><small>1 分钟，回到此刻</small></span>${uiIcon('arrow')}</button><button data-care="sound"><span class="shortcut-icon">${uiIcon('sound')}</span><span><strong>听见安宁</strong><small>3 分钟，给思绪留白</small></span>${uiIcon('arrow')}</button></div>`);
  form.nextElementSibling.insertAdjacentHTML('afterend',homeReflection());
 }
 if(page==='care'&&supportTab!=='chat'){
  const copy={plan:['按自己的节奏，照顾自己。','建议可以跳过，也可以随时改变。'],exercises:['给自己，一个小小的暂停。','呼吸、聆听或舒展，选此刻喜欢的方式。'],connections:['让关怀，贴近日常。','探索身体信号与生活节奏的连接设计。']}[supportTab];
  document.querySelector('.page-title').textContent=copy[0];
  document.querySelector('.heading .subtitle').textContent=copy[1];
 }
}
