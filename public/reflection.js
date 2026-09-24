// A short, optional self-reflection path. It stays in this page session only.
let reflectionStep=0;
let reflection={trigger:'',moment:'',feeling:'',need:'',support:''};
const REFLECTION_NEEDS=['担心做不好','没有被理解','身体已经很累','暂时说不清'];
const REFLECTION_SUPPORT=[['listen','想被听一听'],['breath','想先慢下来'],['plan','想找一个小行动']];
function reflectionChoice(value,selected,attribute){return `<button type="button" class="reflection-choice ${selected===value?'selected':''}" ${attribute}="${escape(value)}" aria-pressed="${selected===value}">${escape(value)}</button>`}
function reflectionPanel(){
 const steps=['发生了什么','我感受到了什么','现在需要什么'];
 const progress=`<div class="reflection-progress" aria-label="情绪梳理第 ${Math.min(reflectionStep+1,3)} 步，共 3 步">${steps.map((label,i)=>`<span class="${i===reflectionStep?'current':''} ${i<reflectionStep?'done':''}">${i+1} ${label}</span>`).join('')}</div>`;
 let body='';
 if(reflectionStep===0)body=`<h2>最近一次情绪变化，发生在什么情境？</h2><p>先选一个方向，再想想具体是哪一刻。不需要找出唯一原因。</p><div class="reflection-choices" role="group" aria-label="可能的情境">${TAGS.map(t=>reflectionChoice(t,reflection.trigger,'data-reflect-trigger')).join('')}</div><label for="reflection-moment">是哪一件小事？（选填）</label><textarea id="reflection-moment" maxlength="160" rows="2" placeholder="例如：开会时，我的话还没说完…">${escape(reflection.moment)}</textarea>`;
 else if(reflectionStep===1)body=`<h2>那一刻，更像哪种感受？</h2><p>留意感受背后，你最在意的是什么。可以先选一个接近的答案。</p><div class="reflection-choices" role="group" aria-label="具体感受">${FEELINGS.map(t=>reflectionChoice(t,reflection.feeling,'data-reflect-feeling')).join('')}</div><span class="reflection-label">这件事最触碰了我什么？</span><div class="reflection-choices" role="group" aria-label="在意的点">${REFLECTION_NEEDS.map(t=>reflectionChoice(t,reflection.need,'data-reflect-need')).join('')}</div>`;
 else body=`<h2>现在，哪种陪伴更适合你？</h2><p>可以只停在这里，也可以选一个很轻的下一步。</p><div class="reflection-choices reflection-support" role="group" aria-label="需要的支持">${REFLECTION_SUPPORT.map(([value,label])=>reflectionChoice(label,reflection.support,'data-reflect-support')).join('')}</div><div class="reflection-result" aria-live="polite"><strong>我听到的是</strong><p>${reflection.moment?`在「${escape(reflection.moment)}」这件事里，`:`在「${escape(reflection.trigger)}」相关的情境里，`}你感到「${escape(reflection.feeling)}」，也在意「${escape(reflection.need)}」。</p><small>这是你此刻的描述，帮助继续探索，不代表找到情绪的唯一原因。</small></div>`;
 const action=reflectionStep===2?`<button type="button" class="primary" id="reflection-action" ${reflection.support?'':'disabled'}>${reflectionActionLabel()}</button>`:`<button type="button" class="primary" id="reflection-next">继续 ${reflectionStep+1} / 3</button>`;
 return `<section class="card reflection-card" id="reflection-card" aria-labelledby="reflection-title"><div class="reflection-head"><div><h2 id="reflection-title">一起理一理这份心情</h2><p>从事情、感受，到此刻需要的照顾。按自己的节奏选择。</p></div><span>自我梳理 · 约 1 分钟</span></div>${progress}<div class="reflection-body">${body}<p id="reflection-error" class="field-error" role="alert" hidden></p><div class="reflection-actions">${reflectionStep?'<button type="button" class="secondary" id="reflection-back">上一步</button>':''}${action}<button type="button" class="link-button" id="reflection-reset">重新梳理</button></div></div><p class="reflection-foot">仅在本次页面会话中保留，不会自动写入日记或公开分享。</p></section>`;
}
function homeReflection(){
 const since=Date.now()-7*86400000;
 const recent=records.filter(r=>new Date(r.date).getTime()>=since);
 const low=recent.filter(r=>r.mood<=2);
 const ranked=TAGS.map(tag=>({tag,count:low.filter(r=>r.tags.includes(tag)).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
 const lead=ranked[0];
 const cue=lead?`近 7 天的低落记录中，「${escape(lead.tag)}」出现 ${lead.count} 次。这只是共同出现的线索，可以从一次具体经历继续梳理。`:recent.length?`已有 ${recent.length} 条心情记录。试着在下次记录时选择影响因素，线索会逐渐清晰。`:'记录心情时可以标记影响因素；也可以先用示例，体验如何发现线索。';
 return `<section class="card home-reflection"><div><h2>情绪从哪里来？一起理一理</h2><p>${cue}</p></div><div class="home-reflection-actions"><button type="button" class="primary" id="start-reflection">开始梳理心情</button><button type="button" class="secondary" id="view-insight-example">${recent.length?'看近 7 天的线索':'体验示例分析'}</button><button type="button" class="secondary" data-tailored-entry>按困扰选练习</button></div><p class="home-reflection-note">再选一个适合此刻的方式：呼吸、听声音，或轻轻活动身体。所有建议都可以跳过。</p></section>`;
}
function reflectionActionLabel(){return reflection.support==='想被听一听'?(adoptedPet?'去和小猫聊聊':'去认养陪伴小猫'):reflection.support==='想找一个小行动'?'看看轻关怀建议':'开始一分钟呼吸'}
function focusReflectionStep(){const card=document.querySelector('#reflection-card');card?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});const heading=card?.querySelector('.reflection-body h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function bindReflection(){
 const start=document.querySelector('#start-reflection');if(start)start.onclick=()=>{demo=false;go('insights');focusReflectionStep()};
 const example=document.querySelector('#view-insight-example');if(example)example.onclick=()=>{demo=!records.length;go('insights')};
 const card=document.querySelector('#reflection-card');if(!card)return;
 for(const [attribute,key] of [['data-reflect-trigger','trigger'],['data-reflect-feeling','feeling'],['data-reflect-need','need'],['data-reflect-support','support']])card.querySelectorAll(`[${attribute}]`).forEach(button=>button.onclick=()=>{reflection[key]=button.getAttribute(attribute);card.querySelectorAll(`[${attribute}]`).forEach(other=>{other.classList.toggle('selected',other===button);other.setAttribute('aria-pressed',String(other===button))});if(key==='support'){const action=card.querySelector('#reflection-action');action.disabled=false;action.textContent=reflectionActionLabel()}card.querySelector('#reflection-error').hidden=true});
 const moment=card.querySelector('#reflection-moment');if(moment)moment.oninput=()=>reflection.moment=moment.value;
 const next=card.querySelector('#reflection-next');if(next)next.onclick=()=>{const missing=reflectionStep===0&&!reflection.trigger?'先选一个接近的情境。':reflectionStep===1&&(!reflection.feeling||!reflection.need)?'先选择一种感受和最在意的点。':'';if(missing){const error=card.querySelector('#reflection-error');error.textContent=missing;error.hidden=false;card.querySelector('.reflection-choices button')?.focus();return}reflectionStep++;render();focusReflectionStep()};
 const back=card.querySelector('#reflection-back');if(back)back.onclick=()=>{reflectionStep--;render();focusReflectionStep()};
 card.querySelector('#reflection-reset').onclick=()=>{reflectionStep=0;reflection={trigger:'',moment:'',feeling:'',need:'',support:''};render();focusReflectionStep()};
 const action=card.querySelector('#reflection-action');if(action)action.onclick=()=>{if(reflection.support==='想被听一听'){supportTab='chat';companionPane=adoptedPet?'talk':'room';go('care');document.querySelector('#chat-input')?.focus({preventScroll:true})}else if(reflection.support==='想找一个小行动'){supportTab='plan';go('care')}else startCare('breath')};
}
