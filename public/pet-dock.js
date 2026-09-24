// Quiet companion across pages; ambient gestures never earn progress or send reminders.
let dockCollapsed=false,dockIdleTimer=null,dockFrameTimer=null,dockSequence=0,lastViewKey='';
try{dockCollapsed=localStorage.getItem('manman.dock.collapsed')==='true'}catch{}
function dockMotion(frames){const sprite=document.querySelector('#pet-dock .kitten-sprite');if(!sprite)return;clearTimeout(dockFrameTimer);const sequence=++dockSequence;let i=0;const tick=()=>{if(sequence!==dockSequence||!sprite.isConnected)return;if(i===frames.length){sprite.dataset.frame='0';return}sprite.dataset.frame=String(frames[i++]);dockFrameTimer=setTimeout(tick,400)};tick()}
function scheduleDockIdle(){clearTimeout(dockIdleTimer);if(dockCollapsed||!adoptedPet||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;dockIdleTimer=setTimeout(()=>{if(!document.hidden&&!document.querySelector('dialog[open]')&&!document.querySelector('#pet-dock').classList.contains('menu-open'))dockMotion(Math.random()>.5?[1,2,1]:[7,7,0]);scheduleDockIdle()},22000+Math.random()*18000)}
function renderPetDock(){
 clearTimeout(dockIdleTimer);clearTimeout(dockFrameTimer);dockSequence++;document.querySelector('#pet-dock')?.remove();if(!adoptedPet){renderGuestDock();return;}
 const dock=document.createElement('aside');dock.id='pet-dock';dock.className=dockCollapsed?'collapsed':'';dock.setAttribute('aria-label',petName()+'的悬浮陪伴');const look=adoptedPet.look==='silver'?'silver':'apricot';
 dock.innerHTML=`<div class="dock-menu" id="dock-menu" hidden><p>${escape(petName())}<small>有心事，就和我说说。</small></p><button class="secondary" id="dock-pat">摸摸头 ♡</button><button class="primary" id="dock-chat">和小猫聊心事</button><button class="secondary" id="dock-home">回到小屋 ↗</button></div><button class="dock-hide" id="dock-hide" aria-label="收起悬浮宠物">×</button><button class="dock-character" id="dock-character" aria-label="打开${escape(petName())}的小猫情绪陪伴菜单" aria-controls="dock-menu" aria-expanded="false"><span class="kitten-sprite" data-frame="0" aria-hidden="true" style="background-image:url(assets/${look}-actions.png)"></span><span class="dock-name">${escape(petName())}</span></button><button class="dock-restore" id="dock-restore" aria-label="唤回${escape(petName())}">♡</button>`;
 document.body.append(dock);
 const setCollapsed=value=>{dockCollapsed=value;try{localStorage.setItem('manman.dock.collapsed',String(value))}catch{}renderPetDock();document.querySelector(value?'#dock-restore':'#dock-character')?.focus({preventScroll:true})};
 document.querySelector('#dock-hide').onclick=()=>setCollapsed(true);document.querySelector('#dock-restore').onclick=()=>setCollapsed(false);
 document.querySelector('#dock-character').onclick=()=>{const open=dock.classList.toggle('menu-open');document.querySelector('#dock-menu').hidden=!open;document.querySelector('#dock-character').setAttribute('aria-expanded',String(open));if(open&&!matchMedia('(prefers-reduced-motion: reduce)').matches)dockMotion([1,2,0])};
 document.querySelector('#dock-pat').onclick=()=>{dockMotion(matchMedia('(prefers-reduced-motion: reduce)').matches?[1,1]:[1,2,1,2]);petMoment('touch');document.querySelector('.dock-menu small').textContent='蹭蹭你的手，收到啦。'};
 document.querySelector('#dock-chat').onclick=()=>{supportTab='chat';companionPane='talk';go('care');document.querySelector('#chat-input')?.focus({preventScroll:true})};
 document.querySelector('#dock-home').onclick=()=>{supportTab='chat';companionPane='room';go('care')};
 dock.onkeydown=e=>{if(e.key==='Escape'){dock.classList.remove('menu-open');document.querySelector('#dock-menu').hidden=true;document.querySelector('#dock-character').setAttribute('aria-expanded','false');document.querySelector('#dock-character').focus()}};scheduleDockIdle();
}
document.addEventListener('visibilitychange',()=>{clearTimeout(dockFrameTimer);const sprite=document.querySelector('#pet-dock .kitten-sprite');if(sprite)sprite.dataset.frame='0';scheduleDockIdle()});
document.addEventListener('click',e=>{const dock=document.querySelector('#pet-dock');if(dock&&!dock.classList.contains('guest-dock')&&!dock.contains(e.target)){dock.classList.remove('menu-open');document.querySelector('#dock-menu').hidden=true;document.querySelector('#dock-character').setAttribute('aria-expanded','false')}});
function bindViewMotion(){const key=[page,supportTab,companionPane,adoptionStep].join('/');if(key!==lastViewKey&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('#main').animate([{opacity:.45,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:230,easing:'cubic-bezier(.2,.8,.2,1)'});lastViewKey=key;renderPetDock()}

// An invitation, not an adopted pet. Dismissal survives navigation and reloads.
const GUEST_DOCK_KEY='manman.dock.guest.v1';
let guestDockDismissed=false,guestInviteSeen=false,guestInviteTimer=null;
try{const preference=JSON.parse(localStorage.getItem(GUEST_DOCK_KEY)||'{}');guestDockDismissed=preference.dismissed===true;guestInviteSeen=preference.seen===true}catch{}
function saveGuestPreference(){try{localStorage.setItem(GUEST_DOCK_KEY,JSON.stringify({dismissed:guestDockDismissed,seen:guestInviteSeen}))}catch{}}
function dismissGuestDock(){guestDockDismissed=true;guestInviteSeen=true;saveGuestPreference();clearTimeout(guestInviteTimer);document.querySelector('#pet-dock')?.remove();toast('想见小猫时，到「陪伴关怀 → 小猫陪伴」就能找到。');document.querySelector('.nav[data-page="care"]')?.focus({preventScroll:true})}
function restoreGuestDock(){guestDockDismissed=false;saveGuestPreference();renderPetDock();document.querySelector('#dock-character')?.focus({preventScroll:true});toast('小猫回到页面边上了，点它就能认识它。')}
function beginGuestAdoption(){guestInviteSeen=true;saveGuestPreference();adoptionStep=1;supportTab='chat';companionPane='room';go('care')}
function scheduleGuestInvite(){clearTimeout(guestInviteTimer);if(adoptedPet||guestDockDismissed||guestInviteSeen)return;guestInviteTimer=setTimeout(()=>{const dock=document.querySelector('#pet-dock.guest-dock');if(!dock||document.hidden||document.querySelector('dialog[open]')||document.activeElement?.matches('input,textarea'))return;guestInviteSeen=true;saveGuestPreference();dock.classList.add('menu-open');dock.querySelector('#dock-menu').hidden=false;dock.querySelector('#dock-character').setAttribute('aria-expanded','true');if(!matchMedia('(prefers-reduced-motion: reduce)').matches)dockMotion([1,2,0])},1000)}
function renderGuestDock(){
 if(guestDockDismissed)return;
 const dock=document.createElement('aside');dock.id='pet-dock';dock.className='guest-dock';dock.setAttribute('aria-label','小猫认养邀请');
 dock.innerHTML=`<div class="dock-menu guest-invitation" id="dock-menu" hidden><p>想带一只小猫回家吗？<small>陪你聊聊，也陪你发会儿呆。</small></p><button class="primary" id="guest-adopt">认识小猫</button><button class="link-button" id="guest-dismiss">暂时不用</button></div><button class="dock-hide" id="dock-hide" aria-label="关闭小猫邀请">×</button><button class="dock-character" id="dock-character" aria-label="认识一只陪伴小猫" aria-controls="dock-menu" aria-expanded="false"><span class="kitten-sprite" data-frame="0" aria-hidden="true" style="background-image:url(assets/apricot-actions.png)"></span><span class="dock-name">等一个家</span></button>`;
 document.body.append(dock);
 dock.querySelector('#dock-hide').onclick=dismissGuestDock;dock.querySelector('#guest-dismiss').onclick=dismissGuestDock;dock.querySelector('#guest-adopt').onclick=beginGuestAdoption;
 dock.querySelector('#dock-character').onclick=()=>{guestInviteSeen=true;saveGuestPreference();const open=dock.classList.toggle('menu-open');dock.querySelector('#dock-menu').hidden=!open;dock.querySelector('#dock-character').setAttribute('aria-expanded',String(open));if(open&&!matchMedia('(prefers-reduced-motion: reduce)').matches)dockMotion([1,2,0])};
 dock.onkeydown=e=>{if(e.key==='Escape'){dock.classList.remove('menu-open');dock.querySelector('#dock-menu').hidden=true;dock.querySelector('#dock-character').setAttribute('aria-expanded','false');dock.querySelector('#dock-character').focus()}};
 scheduleGuestInvite();
}
