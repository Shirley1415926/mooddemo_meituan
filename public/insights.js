// Evidence first: tags describe co-occurrence, never an inferred diagnosis.
let insightView='patterns', insightFactor='', insightEvidencePage=0, reflectionExample=false;
function analyzeMoodFactors(source,days,now=new Date()){
 const cutoff=new Date(now);cutoff.setHours(0,0,0,0);cutoff.setDate(cutoff.getDate()-days+1);
 const items=source.filter(r=>new Date(r.date)>=cutoff&&new Date(r.date)<=now);
 const factors=TAGS.map(tag=>{const entries=items.filter(r=>(r.tags||[]).includes(tag));return {tag,entries,total:entries.length,low:entries.filter(r=>r.mood<=2).length}}).filter(f=>f.total).sort((a,b)=>b.low-a.low||b.total-a.total);
 return {items,factors};
}
function renderInsights(){
 const {items,factors}=analyzeMoodFactors(data(),range);
 const selected=factors.find(f=>f.tag===insightFactor)||factors[0];
 const nav=`<nav class="insight-navigation" aria-label="了解情绪"><button data-insight-view="patterns" aria-pressed="${insightView==='patterns'}">触发因素分析</button><button data-insight-view="reflect" aria-pressed="${insightView==='reflect'}">梳理一次经历</button><button data-insight-view="trend" aria-pressed="${insightView==='trend'}">情绪趋势</button></nav>`;
 const top=heading('','是什么影响了我的心情？','先从记录里找线索，再回到具体经历。')+nav;
 if(insightView==='reflect')return top+`${reflectionExample?'<p class="demo-banner">正在梳理一条示例经历。可修改内容或重新梳理，不会写入你的日记。</p>':''}<button class="link-button" data-insight-view="patterns">返回触发线索</button>${reflectionPanel()}`;
 const filters=`<div class="insight-filters"><div class="range-tabs" aria-label="分析时间范围">${[7,30].map(n=>`<button data-range="${n}" class="${range===n?'active':''}" aria-pressed="${range===n}">近 ${n} 天</button>`).join('')}</div><button class="link-button" id="toggle-demo">${demo?'返回我的记录':'体验示例分析'}</button></div>${demo?'<p class="demo-banner">正在查看示例日记，不是你的真实分析；示例不会保存到你的日记。</p>':''}`;
 if(insightView==='trend')return top+filters+`<section class="card insight-detail"><h2>心情随时间的变化</h2>${chart(range,true)}<p class="small-note">同一天多次记录取平均值；短线代表暂无记录。</p><p>记录 ${new Set(items.map(r=>dayKey(r.date))).size} 天 · 平均心情 ${items.length?(items.reduce((s,r)=>s+r.mood,0)/items.length).toFixed(1):'—'} / 5 · 累计完成 ${careCount} 次关怀练习</p></section>`;
 let body='';
 if(!selected)body=`<section class="card insight-empty"><h2>${items.length?'给记录补充一点情境':'从一条带情境的记录开始'}</h2><p>记录心情时，标记「工作」「睡眠」等影响因素。这里会帮你回看：哪些情境常伴随低落，当时具体发生了什么。</p><button class="primary" data-go="today">去记录心情</button><p class="small-note">也可以点击上方「体验示例分析」，先看看完整过程。</p></section>`;
 else {
  const entries=[...selected.entries].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const totalPages=Math.ceil(entries.length/2);insightEvidencePage=Math.min(insightEvidencePage,totalPages-1);
  body=`<section class="trigger-explorer" aria-labelledby="trigger-title"><div class="trigger-summary"><h2 id="trigger-title">哪些情境伴随了情绪变化？</h2><p>近 ${range} 天共 ${items.length} 条记录，其中 ${items.filter(r=>r.mood<=2).length} 条低落。点选情境，回看具体经历。</p></div><div class="trigger-columns"><div class="trigger-list" role="group" aria-label="选择影响因素">${factors.map(f=>`<button class="trigger-option" data-insight-factor="${escape(f.tag)}" aria-pressed="${selected.tag===f.tag}"><strong>${escape(f.tag)}</strong><span>低落 ${f.low} 次 / 记录 ${f.total} 次</span><span class="trigger-meter" aria-hidden="true"><i style="width:${f.low/f.total*100}%"></i></span></button>`).join('')}<p class="small-note">低落指「很低落」或「有些低落」。按低落次数排序；同一记录可有多个标签。</p></div><section class="trigger-evidence" aria-labelledby="evidence-title"><h3 id="evidence-title" tabindex="-1">关于「${escape(selected.tag)}」的记录</h3><p class="evidence-summary">${selected.low?`有 ${selected.low} 条记录中，这个情境与低落一起出现。`:'这些记录中暂未出现低落。'}先看看当时发生了什么，不急着认定原因。</p>${entries.slice(insightEvidencePage*2,insightEvidencePage*2+2).map(r=>`<article class="evidence-entry"><div><time>${new Date(r.date).toLocaleDateString('zh-CN',{month:'short',day:'numeric'})}</time><span>${MOODS[r.mood-1]||'心情记录'}</span></div><p>${escape(r.text||'这次没有留下文字。可以从记得的一个片段开始梳理。')}</p><button class="link-button" data-reflect-entry="${escape(String(r.id))}" data-reflect-factor="${escape(selected.tag)}">${demo?'用这条示例体验梳理':'梳理这次经历'} →</button></article>`).join('')}${totalPages>1?`<div class="evidence-pagination"><button class="secondary" data-evidence-page="-1" ${insightEvidencePage===0?'disabled':''}>上一页</button><span>${insightEvidencePage+1} / ${totalPages}</span><button class="secondary" data-evidence-page="1" ${insightEvidencePage===totalPages-1?'disabled':''}>下一页</button></div>`:''}</section></div><p class="insight-limit">这些是你标记的情境与心情共同出现的线索，不代表因果关系。记录越少，越需要结合具体经历理解。旧版「有点累」记录请结合正文回看。</p></section>`;
 }
 return top+filters+body;
}
function bindInsightExplorer(){
 document.querySelectorAll('[data-insight-view]').forEach(b=>b.onclick=()=>{insightView=b.dataset.insightView;render();document.querySelector(`[data-insight-view="${insightView}"]`)?.focus({preventScroll:true})});
 document.querySelectorAll('[data-insight-factor]').forEach(b=>b.onclick=()=>{insightFactor=b.dataset.insightFactor;insightEvidencePage=0;render();const target=document.querySelector('#evidence-title');target?.focus({preventScroll:true});if(matchMedia('(max-width: 700px)').matches)target?.scrollIntoView({block:'start',behavior:'instant'})});
 document.querySelectorAll('[data-evidence-page]').forEach(b=>b.onclick=()=>{insightEvidencePage+=Number(b.dataset.evidencePage);render();document.querySelector('#evidence-title')?.focus()});
 document.querySelectorAll('[data-reflect-entry]').forEach(b=>b.onclick=()=>{const entry=data().find(r=>String(r.id)===b.dataset.reflectEntry);reflectionExample=demo;reflectionStep=0;reflection={trigger:b.dataset.reflectFactor,moment:(entry?.text||'').slice(0,160),feeling:'',need:'',support:''};insightView='reflect';render();focusReflectionStep()});
}
