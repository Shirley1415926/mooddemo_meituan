// Progressive disclosure keeps each view focused without clipping content.
let companionPane='room',journalPage=0,communityPage=0;
const DISCLOSURE_COPY={
 '想多说一点？补充原因与日记 · 选填':['journal','补充原因与日记','选填 · 记录感受、原因与今天的故事'],
 '看看这一周的心情':['insights','这一周的心情','查看近 7 天的情绪变化'],
 '其他放松方式与温柔提醒':['breath','更多放松与关怀','呼吸练习 · 环境声音 · 今日寄语'],
 '查看情绪趋势':['insights','查看情绪趋势','回看近 7 天或 30 天的心情起伏'],
 '陪伴说明与更多支持':['care','陪伴说明与更多支持','了解陪伴方式，寻找适合自己的支持'],
 '回看反馈与更多关怀':['care','回看反馈与更多关怀','查看练习后的感受与其他关怀方式'],
 '提醒偏好与功能说明':['plan','提醒偏好与功能说明','设置示例提醒，了解功能边界'],
 '查看连接设置与示例':['connections','连接设置与示例','查看连接步骤、授权范围与模拟效果'],
 '阅读这篇日记':['journal','阅读这篇日记','打开查看完整记录'],
 '展开完整心情':['chat','阅读完整心情','打开查看这段故事']
};
function compactDetails(title,nodes,cls=''){
 const d=document.createElement('details');d.className='compact-details disclosure '+cls;
 const [icon,label,hint]=DISCLOSURE_COPY[title]||['journal',title,'点击查看详细内容'];
 const summary=document.createElement('summary');
 const mark=document.createElement('span');mark.className='disclosure-icon';mark.setAttribute('aria-hidden','true');mark.innerHTML=uiIcon(icon);
 const copy=document.createElement('span');copy.className='disclosure-copy';const heading=document.createElement('strong');heading.textContent=label;const preview=document.createElement('small');preview.textContent=hint;copy.append(heading,preview);
 const action=document.createElement('span');action.className='disclosure-action';const state=document.createElement('span');state.textContent='展开查看';action.append(state);action.insertAdjacentHTML('beforeend','<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m5 7 5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>');
 summary.append(mark,copy,action);d.append(summary);
 const content=document.createElement('div');content.className='compact-content';nodes[0].before(d);nodes.forEach(n=>content.append(n));d.append(content);
 d.addEventListener('toggle',()=>{state.textContent=d.open?'收起内容':'展开查看'});
 return d;
}
function compactPages(selector,size,key){const entries=[...document.querySelectorAll(selector)];if(entries.length<=size)return;const total=Math.ceil(entries.length/size);let current=key==='journal'?journalPage:communityPage;current=Math.min(current,total-1);if(key==='journal')journalPage=current;else communityPage=current;entries.forEach((el,i)=>el.hidden=i<current*size||i>=(current+1)*size);const bar=document.createElement('div');bar.className='compact-pagination';bar.innerHTML=`<button class="secondary" data-paging="${key}" data-step="-1" ${current===0?'disabled':''}>上一页</button><span>${current+1} / ${total}</span><button class="secondary" data-paging="${key}" data-step="1" ${current===total-1?'disabled':''}>下一页</button>`;entries.at(-1).after(bar)}
function compactLayout(){
 const main=document.querySelector('#main');
 if(page==='record'){
  const form=main.querySelector('.today-primary>.card');const start=form.querySelector('.feeling-details');const end=form.querySelector('.text-count');let list=[],node=start;while(node){list.push(node);if(node===end)break;node=node.nextElementSibling}compactDetails('想多说一点？补充原因与日记 · 选填',list,'record-extra');
 }
 if(page==='journal'){
  main.querySelectorAll('.entry>p:first-of-type').forEach(p=>{if(p.textContent.length>100)compactDetails('阅读这篇日记',[p],'entry-full')});compactPages('.entry',3,'journal');
 }
 if(page==='community'){
  compactPages('.community-post',2,'community');
  main.querySelectorAll('.post-text').forEach(p=>{if(p.textContent.length>140&&!p.closest('details'))compactDetails('展开完整心情',[p],'entry-full')});
 }
 if(page==='care'){
  const side=main.querySelector('.chat-layout>.support-aside');if(side)compactDetails('陪伴说明与更多支持',[side],'care-explainer');
  const planSide=main.querySelector('.support-grid>.support-aside');if(planSide)compactDetails('回看反馈与更多关怀',[planSide]);
  const notify=main.querySelector('.notification-design');if(notify)compactDetails('提醒偏好与功能说明',[notify]);
  main.querySelectorAll('.connection-grid>section').forEach(section=>{const nodes=[...section.children].slice(1);if(nodes.length)compactDetails('查看连接设置与示例',nodes)});
 }
}
function bindCompact(){
 document.querySelectorAll('[data-companion-pane]').forEach(b=>b.onclick=()=>{companionPane=b.dataset.companionPane;render();window.scrollTo({top:0,behavior:'instant'})});
 document.querySelectorAll('[data-paging]').forEach(b=>b.onclick=()=>{if(b.dataset.paging==='journal')journalPage+=+b.dataset.step;else communityPage+=+b.dataset.step;render();window.scrollTo({top:0,behavior:'instant'})});
}
