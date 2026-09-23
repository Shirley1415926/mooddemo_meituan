// Progressive disclosure keeps each view focused without clipping content.
let companionPane='room',journalPage=0,communityPage=0;
function compactDetails(title,nodes,cls=''){const d=document.createElement('details');d.className='compact-details '+cls;const summary=document.createElement('summary');summary.textContent=title;d.append(summary);const content=document.createElement('div');content.className='compact-content';nodes[0].before(d);nodes.forEach(n=>content.append(n));d.append(content);return d}
function compactPages(selector,size,key){const entries=[...document.querySelectorAll(selector)];if(entries.length<=size)return;const total=Math.ceil(entries.length/size);let current=key==='journal'?journalPage:communityPage;current=Math.min(current,total-1);if(key==='journal')journalPage=current;else communityPage=current;entries.forEach((el,i)=>el.hidden=i<current*size||i>=(current+1)*size);const bar=document.createElement('div');bar.className='compact-pagination';bar.innerHTML=`<button class="secondary" data-paging="${key}" data-step="-1" ${current===0?'disabled':''}>上一页</button><span>${current+1} / ${total}</span><button class="secondary" data-paging="${key}" data-step="1" ${current===total-1?'disabled':''}>下一页</button>`;entries.at(-1).after(bar)}
function compactLayout(){
 const main=document.querySelector('#main');
 if(page==='today'){
  const form=main.querySelector('.today-primary>.card');const start=form.querySelector('.feeling-details');const end=form.querySelector('.text-count');let list=[],node=start;while(node){list.push(node);if(node===end)break;node=node.nextElementSibling}compactDetails('想多说一点？补充原因与日记 · 选填',list,'record-extra');
  const chart=main.querySelector('.today-primary>.card:last-child');compactDetails('看看这一周的心情', [chart]);
  const side=main.querySelector('.today-secondary');const cards=[...side.children].slice(1);if(cards.length)compactDetails('其他放松方式与温柔提醒',cards,'home-more');
 }
 if(page==='journal'){
  main.querySelectorAll('.entry>p:first-of-type').forEach(p=>{if(p.textContent.length>100)compactDetails('阅读这篇日记',[p],'entry-full')});compactPages('.entry',3,'journal');
 }
 if(page==='insights'){
  const detail=main.querySelector('.bottom-row');if(detail)compactDetails('查看影响因素与行动建议',[detail]);
 }
 if(page==='community'){
  compactPages('.community-post',2,'community');const aside=main.querySelector('.community-aside');if(aside)compactDetails('社区约定与内容管理',[aside],'community-guide');
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
