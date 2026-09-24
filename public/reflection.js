// A short, optional self-reflection path. It stays in this page session only.
let reflectionStep=0;
let reflection={trigger:'',moment:'',feeling:'',need:'',support:''};
let reflectionRecordId=null,reflectionSummaryEdit='';
function beginReflectionFromRecord(record,tag=''){reflectionDraft=null;reflectionExample=String(record.id).startsWith('sample-');reflectionRecordId=reflectionExample?null:record.id;reflectionStep=0;reflectionSummaryEdit='';reflection={trigger:tag||record.tags?.[0]||'',moment:(record.text||'').slice(0,160),feeling:(record.feelings||[])[0]||'',need:'',support:''};insightView='reflect'}
function reflectionSummaryText(){return reflectionSummaryEdit||`${reflection.moment?`在「${reflection.moment}」这件事里，`:`在「${reflection.trigger}」相关的情境里，`}我感到「${reflection.feeling}」，也在意「${reflection.need}」。`}
const REFLECTION_NEEDS=['担心做不好','没有被理解','身体已经很累','暂时说不清'];
const REFLECTION_SUPPORT=[['listen','想被听一听'],['breath','想先慢下来'],['plan','想找一个小行动']];
function reflectionChoice(value,selected,attribute){return `<button type="button" class="reflection-choice ${selected===value?'selected':''}" ${attribute}="${escape(value)}" aria-pressed="${selected===value}">${escape(value)}</button>`}
function reflectionPanel(){
 const steps=['发生了什么','我感受到了什么','现在需要什么'];
 const progress=`<div class="reflection-progress" aria-label="情绪梳理第 ${Math.min(reflectionStep+1,3)} 步，共 3 步">${steps.map((label,i)=>`<span class="${i===reflectionStep?'current':''} ${i<reflectionStep?'done':''}">${i+1} ${label}</span>`).join('')}</div>`;
 let body='';
 if(reflectionStep===0)body=`<h2>最近一次情绪变化，发生在什么情境？</h2><p>先选一个方向，再想想具体是哪一刻。不需要找出唯一原因。</p><div class="reflection-choices" role="group" aria-label="可能的情境">${TAGS.map(t=>reflectionChoice(t,reflection.trigger,'data-reflect-trigger')).join('')}</div><label for="reflection-moment">是哪一件小事？（选填）</label><textarea id="reflection-moment" maxlength="160" rows="2" placeholder="例如：开会时，我的话还没说完…">${escape(reflection.moment)}</textarea>`;
 else if(reflectionStep===1)body=`<h2>那一刻，更像哪种感受？</h2><p>留意感受背后，你最在意的是什么。可以先选一个接近的答案。</p><div class="reflection-choices" role="group" aria-label="具体感受">${FEELINGS.map(t=>reflectionChoice(t,reflection.feeling,'data-reflect-feeling')).join('')}</div><span class="reflection-label">这件事最触碰了我什么？</span><div class="reflection-choices" role="group" aria-label="在意的点">${REFLECTION_NEEDS.map(t=>reflectionChoice(t,reflection.need,'data-reflect-need')).join('')}</div>`;
 else body=`<h2>现在，哪种陪伴更适合你？</h2><p>这段理解可以留给自己；愿意的话，再选一个轻轻的下一步。</p><div class="reflection-choices reflection-support" role="group" aria-label="需要的支持">${REFLECTION_SUPPORT.map(([value,label])=>reflectionChoice(label,reflection.support,'data-reflect-support')).join('')}</div><div class="reflection-result"><label for="reflection-summary"><strong>这一次，我发现</strong></label><textarea id="reflection-summary" maxlength="500" rows="3">${escape(reflectionSummaryText())}</textarea><small>你可以修改这段总结。它只表达此刻的理解，不代表找到唯一原因。</small></div><div class="reflection-recommendation" aria-live="polite">${reflectionRecommendation()}</div>${reflectionRecordId&&!reflectionExample?'<button type="button" class="secondary" id="reflection-save">把这段发现存回原日记</button>':'<p class="small-note">从自己的日记进入梳理后，可以将发现存回原记录。示例不会保存。</p>'}`;
 const action=reflectionStep===2?`<button type="button" class="primary" id="reflection-action" ${reflection.support?'':'disabled'}>${reflectionActionLabel()}</button>`:`<button type="button" class="primary" id="reflection-next">继续 ${reflectionStep+1} / 3</button>`;
 return `<section class="card reflection-card" id="reflection-card" aria-labelledby="reflection-title"><div class="reflection-head"><div><h2 id="reflection-title">一起理一理这份心情</h2><p>从事情、感受，到此刻需要的照顾。按自己的节奏选择。</p></div><span>自我梳理 · 约 1 分钟</span></div>${progress}<div class="reflection-body">${body}<p id="reflection-error" class="field-error" role="alert" hidden></p><div class="reflection-actions">${reflectionStep?'<button type="button" class="secondary" id="reflection-back">上一步</button>':''}${action}<button type="button" class="link-button" id="reflection-reset">重新梳理</button></div></div><p class="reflection-foot">梳理内容只在本次页面会话保留；仅点击保存时才写回自己的日记，不会公开分享。</p></section>`;
}
function homeReflection(){
 const since=Date.now()-7*86400000;
 const recent=records.filter(r=>new Date(r.date).getTime()>=since);
 const low=recent.filter(r=>r.mood<=2);
 const ranked=TAGS.map(tag=>({tag,count:low.filter(r=>r.tags.includes(tag)).length})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
 const lead=ranked[0];
 const cue=lead?`近 7 天的低落记录中，「${escape(lead.tag)}」出现 ${lead.count} 次。这只是共同出现的线索，可以从一次具体经历继续梳理。`:recent.length?`已有 ${recent.length} 条心情记录。试着在下次记录时选择影响因素，线索会逐渐清晰。`:'记录心情时可以标记影响因素；也可以先用示例，体验如何发现线索。';
 return `<section class="card home-reflection"><div><h2>是什么影响了我的心情？</h2><p>${cue}</p></div><div class="home-reflection-actions"><button type="button" class="primary" id="view-insight-example">${recent.length?'查看情绪触发线索':'体验示例分析'}</button><button type="button" class="link-button" id="start-reflection">梳理一次具体经历</button></div><p class="home-reflection-note">再选一个适合此刻的方式：呼吸、听声音，或轻轻活动身体。所有建议都可以跳过。</p></section>`;
}
function reflectionRecommendation(){if(!reflection.support)return '<strong>可以先停在这里</strong><p>选一种需要的支持，我们再给出一个轻量建议；也可以只保存这段发现。</p>';const reason=reflection.support==='想被听一听'?'你希望先被听见，可以从一件小事说起。':reflection.support==='想找一个小行动'?'你想找一个可做到的小行动，可以从很短的时间开始。':reflection.need==='身体已经很累'?'你提到身体有些累，可以试着暂停一会儿，感受现在的状态。':'如果想先慢下来，可以试一小段自然呼吸。';return `<strong>接下来，可以这样照顾自己</strong><p>${reason}</p><small>这是根据你刚才的选择给出的可选建议；不适合时可以换一种或停在这里。</small>`}
function reflectionActionLabel(){if(!reflection.support)return '先选择一种支持';return reflection.support==='想被听一听'?(adoptedPet?'去和小猫聊聊':'去认养陪伴小猫'):reflection.support==='想找一个小行动'?'看看轻关怀建议':'开始一分钟呼吸'}
function focusReflectionStep(){if(page==='insights'&&insightView!=='reflect'){insightView='reflect';render()}const card=document.querySelector('#reflection-card');card?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});const heading=card?.querySelector('.reflection-body h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function bindReflection(){
 bindInsightExplorer();
 bindReflectionExample();
 const start=document.querySelector('#start-reflection');if(start)start.onclick=()=>{demo=false;if(reflectionExample){reflectionStep=0;reflection={trigger:'',moment:'',feeling:'',need:'',support:''}}reflectionExample=false;reflectionRecordId=null;reflectionSummaryEdit='';go('insights');focusReflectionStep()};
 const example=document.querySelector('#view-insight-example');if(example)example.onclick=()=>{demo=!records.length;insightView='patterns';go('insights')};
 const card=document.querySelector('#reflection-card');if(!card)return;
 for(const [attribute,key] of [['data-reflect-trigger','trigger'],['data-reflect-feeling','feeling'],['data-reflect-need','need'],['data-reflect-support','support']])card.querySelectorAll(`[${attribute}]`).forEach(button=>button.onclick=()=>{reflection[key]=button.getAttribute(attribute);if(key!=='support')reflectionSummaryEdit='';card.querySelectorAll(`[${attribute}]`).forEach(other=>{other.classList.toggle('selected',other===button);other.setAttribute('aria-pressed',String(other===button))});if(key==='support'){const action=card.querySelector('#reflection-action');action.disabled=false;action.textContent=reflectionActionLabel();card.querySelector('.reflection-recommendation').innerHTML=reflectionRecommendation()}card.querySelector('#reflection-error').hidden=true});
 const moment=card.querySelector('#reflection-moment');if(moment)moment.oninput=()=>{reflection.moment=moment.value;reflectionSummaryEdit=''};
 const summary=card.querySelector('#reflection-summary');if(summary)summary.oninput=()=>reflectionSummaryEdit=summary.value;
 const next=card.querySelector('#reflection-next');if(next)next.onclick=()=>{const missing=reflectionStep===0&&!reflection.trigger?'先选一个接近的情境。':reflectionStep===1&&(!reflection.feeling||!reflection.need)?'先选择一种感受和最在意的点。':'';if(missing){const error=card.querySelector('#reflection-error');error.textContent=missing;error.hidden=false;card.querySelector('.reflection-choices button')?.focus();return}reflectionStep++;render();focusReflectionStep()};
 const back=card.querySelector('#reflection-back');if(back)back.onclick=()=>{reflectionStep--;render();focusReflectionStep()};
 card.querySelector('#reflection-reset').onclick=()=>{reflectionExample=false;reflectionStep=0;reflectionRecordId=null;reflectionSummaryEdit='';reflection={trigger:'',moment:'',feeling:'',need:'',support:''};render();focusReflectionStep()};
 const saveButton=card.querySelector('#reflection-save');if(saveButton)saveButton.onclick=()=>{const entry=records.find(r=>r.id===reflectionRecordId);if(!entry)return toast('原日记已不存在，请重新选择记录');const value=card.querySelector('#reflection-summary').value.trim();if(!value)return toast('先写下一点你发现的内容');const previous=entry.reflectionSummary;entry.reflectionSummary=value;if(!persist()){entry.reflectionSummary=previous;return toast('保存失败，请检查浏览器存储')}reflectionSummaryEdit=value;go('journal');toast('已存回原日记')};
 const action=card.querySelector('#reflection-action');if(action)action.onclick=()=>{if(reflection.support==='想被听一听'){supportTab='chat';companionPane=adoptedPet?'talk':'room';go('care');document.querySelector('#chat-input')?.focus({preventScroll:true})}else if(reflection.support==='想找一个小行动'){supportTab='plan';go('care')}else startCare('breath')};
}


// A visible worked example; trying it keeps the user's in-session draft intact.
let reflectionDraft=null;
function reflectionWorkspace(){
 return `<div class="reflection-workspace"><aside class="reflection-example example-step-${reflectionStep}" aria-labelledby="reflection-example-title"><h2 id="reflection-example-title">不知道从哪里开始？看一个例子</h2><p class="reflection-example-note">虚构情境 · 没有标准答案</p><dl><div class="example-moment"><dt>发生了什么</dt><dd>工作进度比预期慢，今天又被问起。</dd></div><div class="example-feeling"><dt>我的感受</dt><dd>焦虑，心里一直绷着。</dd></div><div class="example-need"><dt>我在意什么</dt><dd>担心做不好，也希望自己的努力被看见。</dd></div><div class="example-support"><dt>此刻需要什么</dt><dd>先被听一听，愿意时再想下一小步。</dd></div></dl><p class="reflection-example-takeaway">从「我怎么又焦虑了」，到「原来我很在意把事情做好」。先理解自己，不急着解决一切。</p><button type="button" class="secondary" id="try-reflection-example">${reflectionDraft?'重新体验这个示例':'用这个示例试一遍'}</button>${reflectionDraft?'<button type="button" class="link-button" id="restore-reflection-draft">回到我的梳理</button>':''}</aside>${reflectionPanel()}</div>`;
}
function bindReflectionExample(){
 const example=document.querySelector('#try-reflection-example');
 if(example)example.onclick=()=>{if(!reflectionDraft)reflectionDraft={value:{...reflection},step:reflectionStep,example:reflectionExample,recordId:reflectionRecordId,summary:reflectionSummaryEdit};reflectionExample=true;reflectionRecordId=null;reflectionSummaryEdit='';reflectionStep=0;reflection={trigger:'工作',moment:'工作进度比预期慢，今天又被问起。',feeling:'焦虑',need:'担心做不好',support:'想被听一听'};render();focusReflectionStep()};
 const restore=document.querySelector('#restore-reflection-draft');
 if(restore)restore.onclick=()=>{if(!reflectionDraft)return;reflection={...reflectionDraft.value};reflectionStep=reflectionDraft.step;reflectionExample=reflectionDraft.example;reflectionRecordId=reflectionDraft.recordId;reflectionSummaryEdit=reflectionDraft.summary;reflectionDraft=null;render();focusReflectionStep()};
}
