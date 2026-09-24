// First-run adoption is real and voluntary; feature examples never create diary records.
const TOUR_KEY='manman.tour.v2';
let tourStep=0,tourOrigin='today',tourSeen=false,tourAdoptionPhase=null;
let tourPetDraft={look:'apricot',name:''};
try{tourSeen=localStorage.getItem(TOUR_KEY)==='seen'}catch{}
const TOUR_STEPS=[
 {page:'record',target:'.moods',action:'[data-mood]',title:'01 · 选一个此刻的心情',text:'点选下方最接近你的心情。这里只保留为草稿，点「保存此刻」才会写入日记。',done:'心情已经选好了。以后可以再添一点情境或文字，然后保存。'},
 {page:'care',tab:'chat',pane:'room',target:'.companion-chat-entry [data-open-pet-chat],.adoption-intro [data-adopt-start]',action:'[data-adopt-start],[data-open-pet-chat]',title:'02 · 认识你的陪伴小猫',text:'点击亮起的按钮，选一只小猫，或和已有的小猫聊聊。不想认养，也可以跳过这一步。',done:'已经打开小猫的聊天空间，想说什么时都可以来。'},
 {page:'insights',target:'#toggle-demo',action:'#toggle-demo',title:'03 · 找一条情绪线索',text:'点击「体验示例分析」，再选一个情境，看看它对应的心情记录。示例不会存进你的日记。',done:'这些记录帮你回看情境与心情如何一起出现；它们是线索，不是原因的定论。'},
 {page:'care',tab:'exercises',target:'.tailored-options',action:'[data-care-concern]',title:'04 · 试试适合此刻的关怀',text:'点击一个接近你的困扰，让建议为你展开。你可以更换方向，随时停下。',done:'建议已经展开。点击亮起的练习按钮，就能开始体验；也可以先到这里。'}
];
let tourActive=false,tourDone=false,tourSubstep=false;
function clearTourTarget(){document.querySelectorAll('.tour-action-target').forEach(e=>e.classList.remove('tour-action-target'))}
function finishTour(start=false,stay=false){tourActive=false;tourAdoptionPhase=null;clearTourTarget();tourSeen=true;try{localStorage.setItem(TOUR_KEY,'seen')}catch{};const dialog=document.querySelector('#feature-tour');dialog.close();if(!stay)go(start?'record':tourOrigin);scheduleGuestInvite();if(!stay)document.querySelector(start?'.mood':'#open-guide')?.focus({preventScroll:true})}
function activeTourTarget(){if(tourStep===2&&tourSubstep)return '.trigger-list';if(tourStep===3&&tourDone)return '[data-tailored-action]';return TOUR_STEPS[tourStep].target}
function positionTour(){const dialog=document.querySelector('#feature-tour');if(!dialog?.open||tourAdoptionPhase)return;const target=document.querySelector(activeTourTarget())||document.querySelector('#main h1'),card=dialog.querySelector('.tour-card');if(!target||!card)return;const r=target.getBoundingClientRect(),w=innerWidth,h=innerHeight,gap=9;const left=Math.max(8,r.left-gap),right=Math.min(w-8,r.right+gap),top=Math.max(8,r.top-gap),bottom=Math.min(h-8,r.bottom+gap);const focus=dialog.querySelector('.tour-focus');Object.assign(focus.style,{left:left+'px',top:top+'px',width:Math.max(0,right-left)+'px',height:Math.max(0,bottom-top)+'px'});const rects=[[0,0,w,top],[0,top,left,bottom-top],[right,top,w-right,bottom-top],[0,bottom,w,h-bottom]];dialog.querySelectorAll('.tour-shade').forEach((e,i)=>{const[x,y,width,height]=rects[i];Object.assign(e.style,{left:x+'px',top:y+'px',width:Math.max(0,width)+'px',height:Math.max(0,height)+'px'})});const cue=dialog.querySelector('.tour-point-hint');if(cue){const cw=cue.offsetWidth;Object.assign(cue.style,{left:Math.max(8,Math.min(left,w-cw-8))+'px',top:(top>48?top-cue.offsetHeight-8:bottom+8)+'px'})}const ch=card.offsetHeight,cw=card.offsetWidth;let y=bottom+48;if(y+ch>h-12)y=top-ch-14;if(y<12)y=Math.max(12,h-ch-12);Object.assign(card.style,{left:Math.max(12,Math.min(left,w-cw-12))+'px',top:y+'px'});}
function tourCard(){
 clearTourTarget();const dialog=document.querySelector('#feature-tour'),step=TOUR_STEPS[tourStep];
 const cueText=tourStep===0?'点这里，选一个心情':tourStep===1?'点这里，认识小猫':tourStep===2?(tourSubstep?'选一个情境，找找线索':'点这里，看看示例'):(tourDone?'点这里，开始放松':'点这里，选一种困扰');
 const copy=tourDone?step.done:tourStep===2&&tourSubstep?'示例已展开。点选一个亮起的情境，看看当时发生了什么。':step.text;
 dialog.innerHTML=`<div class="tour-shade"></div><div class="tour-shade"></div><div class="tour-shade"></div><div class="tour-shade"></div><div class="tour-focus" aria-hidden="true"></div>${!tourDone||tourStep===3?`<div class="tour-point-hint">${uiIcon('arrow')}<span>${cueText}</span></div>`:''}<section class="tour-card"><div class="tour-top"><span>亲手试一试 · ${tourStep+1} / 4</span><button type="button" id="tour-skip">跳过引导 ×</button></div><div class="tour-progress" aria-hidden="true">${TOUR_STEPS.map((_,i)=>`<i class="${i<=tourStep?'done':''}"></i>`).join('')}</div><h2 id="tour-title" tabindex="-1">${step.title}</h2><p role="status">${copy}</p><div class="tour-actions">${tourDone?`<span class="tour-complete">已体验</span>${tourStep<3?'<button class="primary" id="tour-next">继续体验 →</button>':'<button class="secondary" id="tour-end">完成引导</button>'}`:`<span class="tour-action-hint">请点击页面上亮起的按钮</span><button class="link-button" id="tour-step-skip">跳过这一步</button>`}</div></section>`;
 dialog.querySelector('#tour-skip').onclick=()=>finishTour();
 dialog.querySelector('#tour-step-skip')?.addEventListener('click',()=>{if(tourStep===3)finishTour(false,true);else{tourStep++;tourView()}});
 dialog.querySelector('#tour-next')?.addEventListener('click',()=>{tourStep++;tourView()});
 dialog.querySelector('#tour-end')?.addEventListener('click',()=>finishTour(false,true));
 const target=document.querySelector(activeTourTarget());if(!tourDone||tourStep===3)target?.classList.add('tour-action-target');target?.scrollIntoView({block:'center',behavior:'instant'});
 requestAnimationFrame(()=>{positionTour();if(!tourDone){const control=target?.matches('button')?target:target?.querySelector('button');control?.focus({preventScroll:true})}else dialog.querySelector('#tour-title')?.focus({preventScroll:true})});
}
function tourView(){tourAdoptionPhase=null;tourDone=false;tourSubstep=false;const dialog=document.querySelector('#feature-tour');dialog.classList.remove('tour-adopting');if(dialog.open){dialog.close();dialog.show()}const step=TOUR_STEPS[tourStep];if(step.tab)supportTab=step.tab;if(step.pane)companionPane=step.pane;if(tourStep===1)adoptionStep=0;if(tourStep===2){insightView='patterns';demo=false}go(step.page);document.querySelector('#main').getAnimations().forEach(a=>a.finish());tourCard()}
function openTour(){tourOrigin=page;tourStep=0;tourActive=true;tourView();document.querySelector('#feature-tour').show();positionTour()}
function onTourAction(event){
 if(!tourActive||tourAdoptionPhase||event.target.closest('#feature-tour'))return;
 const action=tourStep===2&&tourSubstep?'[data-insight-factor]':tourStep===3&&tourDone?'[data-tailored-action]':TOUR_STEPS[tourStep].action;
 if(!event.target.closest(action)||tourDone&&tourStep!==3)return;
 if(tourStep===3&&tourDone){finishTour(false,true);return}
 setTimeout(()=>{
  if(!tourActive)return;
  if(tourStep===1&&!adoptedPet){clearTourTarget();tourPetDraft={look:'apricot',name:''};tourAdoptionPhase='look';const dialog=document.querySelector('#feature-tour');dialog.close();tourAdoptionView();dialog.showModal();dialog.querySelector('#tour-title').focus();return}
  if(tourStep===2&&!tourSubstep){tourSubstep=true;tourCard();return}
  tourDone=true;tourCard();
 },0);
}
function tourAdoptionView(){
 const dialog=document.querySelector('#feature-tour'),phase=tourAdoptionPhase,look=petLook(tourPetDraft.look);
 dialog.classList.add('tour-adopting');
 const n=phase==='look'?1:phase==='name'?2:3;
 let content='';
 if(phase==='look')content=`<h2 id="tour-title" tabindex="-1">先遇见，愿意陪你的小猫。</h2><p class="tour-pet-copy">它可以听你说心事，也可以陪你安静待着。<br>选一个让你想靠近的模样。</p><div class="tour-pet-looks" role="group" aria-label="选择小猫外貌">${PET_LOOKS.map(p=>`<button type="button" data-tour-look="${p.id}" aria-pressed="${tourPetDraft.look===p.id}"><img src="${p.image}" alt="${p.label}小猫"><strong>${p.label}</strong><span>${p.description}</span><small class="tour-look-state">${tourPetDraft.look===p.id?'已选择':'选这只'}</small></button>`).join('')}</div><p class="tour-pet-note">不用每天照顾，也没有缺席惩罚。</p><button class="primary full" id="tour-pet-next">选好了，给它起名字 ${uiIcon('arrow')}</button>`;
 else if(phase==='name')content=`<h2 id="tour-title" tabindex="-1">你想怎么叫它？</h2><p class="tour-pet-copy">一个小名字，让陪伴从此有了回应。</p><img class="tour-pet-portrait" src="${look.image}" alt="你选中的${look.label}小猫"><form id="tour-adopt-form"><label for="tour-pet-name">它的名字</label><input id="tour-pet-name" required maxlength="12" autocomplete="off" placeholder="例如：奶糖、团团、小满" value="${escape(tourPetDraft.name)}" aria-describedby="tour-name-hint tour-adopt-error"><p id="tour-name-hint" class="tour-pet-note">1–12 个字，以后也能修改。认养信息仅保存在当前浏览器。</p><p id="tour-adopt-error" role="alert"></p><div class="tour-actions"><button class="secondary" type="button" id="tour-pet-back">重选外貌</button><button class="primary" type="submit">接它回家 ${uiIcon('care')}</button></div></form>`;
 else content=`<h2 id="tour-title" tabindex="-1">${escape(petName())}，欢迎回家。</h2><p class="tour-pet-copy">从现在起，页面边上的小猫就是你的伙伴。</p><button type="button" class="tour-pet-greet" id="tour-pet-touch" aria-label="摸摸${escape(petName())}">${petDrawing(0)}</button><p id="tour-pet-response" class="tour-pet-response" aria-live="polite">轻轻摸摸它，打个招呼吧。</p><p class="tour-pet-note">点页面边上的小猫，就能聊天或玩耍。<br>聊天目前为本地模拟，尚未接入真实 AI。</p><button type="button" class="primary full" id="tour-pet-continue">带着${escape(petName())}，继续认识慢慢 ${uiIcon('arrow')}</button><button type="button" class="link-button full" id="tour-pet-chat">想先和它说句话</button>`;
 dialog.innerHTML=`<section class="tour-adopt-card"><div class="tour-top"><span>初次见面 · ${n} / 3</span><button type="button" id="tour-skip">${adoptedPet?'结束引导':'暂时跳过'}</button></div><div class="tour-progress" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=n?'done':''}"></i>`).join('')}</div><div class="tour-adopt-content">${content}</div>${phase!=='hello'?'<button type="button" class="link-button full" id="tour-without-pet">先了解功能，以后再认养</button>':''}</section>`;
 dialog.querySelector('#tour-skip').onclick=()=>{tourAdoptionPhase=null;finishTour()};
 dialog.querySelector('#tour-without-pet')?.addEventListener('click',()=>{tourStep++;tourView()});
 dialog.querySelectorAll('[data-tour-look]').forEach(b=>b.onclick=()=>{tourPetDraft.look=b.dataset.tourLook;dialog.querySelectorAll('[data-tour-look]').forEach(x=>{const selected=x===b;x.setAttribute('aria-pressed',selected);x.querySelector('.tour-look-state').textContent=selected?'已选择':'选这只'})});
 dialog.querySelector('#tour-pet-next')?.addEventListener('click',()=>{tourAdoptionPhase='name';tourAdoptionView()});
 dialog.querySelector('#tour-pet-back')?.addEventListener('click',()=>{tourAdoptionPhase='look';tourAdoptionView()});
 dialog.querySelector('#tour-pet-name')?.addEventListener('input',e=>{tourPetDraft.name=e.target.value;e.target.setCustomValidity('');dialog.querySelector('#tour-adopt-error').textContent=''});
 dialog.querySelector('#tour-adopt-form')?.addEventListener('submit',e=>{e.preventDefault();const input=dialog.querySelector('#tour-pet-name'),name=input.value.trim();if(!name){input.setCustomValidity('给小猫留一个名字吧');input.reportValidity();return}if(!adoptPet(tourPetDraft.look,name)){dialog.querySelector('#tour-adopt-error').textContent='认养信息还没有保存成功，请允许浏览器存储后再试。';return}adoptionStep=0;renderPetDock();tourAdoptionPhase='hello';tourAdoptionView()});
 dialog.querySelector('#tour-pet-touch')?.addEventListener('click',e=>{playPetAction(e.currentTarget,'touch');petMoment('touch');dialog.querySelector('#tour-pet-response').textContent=petName()+'眯起眼睛，轻轻蹭了蹭你的手。'});
 dialog.querySelector('#tour-pet-continue')?.addEventListener('click',()=>{tourStep++;tourView()});
 dialog.querySelector('#tour-pet-chat')?.addEventListener('click',()=>{tourAdoptionPhase=null;finishTour();supportTab='chat';companionPane='talk';go('care')});
 dialog.scrollTop=0;if(dialog.open)dialog.querySelector('#tour-title').focus({preventScroll:true});
}
function initTour(auto=true){const dialog=document.createElement('dialog');dialog.id='feature-tour';dialog.setAttribute('aria-labelledby','tour-title');document.addEventListener('click',onTourAction,true);document.body.append(dialog);dialog.addEventListener('cancel',e=>{e.preventDefault();finishTour()});window.addEventListener('resize',positionTour);window.addEventListener('scroll',positionTour,{passive:true});document.querySelector('#open-guide').onclick=openTour;if(auto&&!tourSeen)openTour()}

// Keep keyboard exploration on the highlighted action and its coaching controls.
document.addEventListener('keydown',event=>{
 if(!tourActive||tourAdoptionPhase)return;
 if(event.key==='Escape'){event.preventDefault();finishTour();return}
 if(event.key!=='Tab')return;
 const target=document.querySelector(activeTourTarget()),card=document.querySelector('#feature-tour .tour-card');
 const actions=target?(target.matches('button')?[target]:[...target.querySelectorAll('button')]):[];
 const controls=[...actions,...(card?.querySelectorAll('button')||[])].filter(e=>!e.disabled&&e.getClientRects().length);
 if(!controls.length)return;
 const current=controls.indexOf(document.activeElement),next=event.shiftKey?(current<=0?controls.length-1:current-1):(current+1)%controls.length;
 event.preventDefault();controls[next].focus({preventScroll:true});
});
