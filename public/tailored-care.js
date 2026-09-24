// User-steered suggestions, inspired by research on the activity types; not a treatment matcher.
let careConcern='';
const CARE_CONCERNS={
 pressure:{label:'学业 / 工作压力',title:'先给呼吸一点空间',type:'breath',button:'试试 1 分钟自然呼吸',reason:'当事情一件接一件时，先暂停片刻，比立刻解决所有问题更容易开始。',paper:'Balban 等，2023 · 结构化呼吸随机试验',url:'https://pubmed.ncbi.nlm.nih.gov/36630953/',limit:'研究测试的是每天 5 分钟、持续一个月的呼吸练习；这里的 1 分钟只是体验入口，不能推断有相同效果。'},
 noisy:{label:'思绪太满，想安静',title:'给耳朵一个安静的选择',type:'sound',button:'试试 3 分钟环境音',reason:'如果此刻不想继续思考，可以试着听一会儿；不喜欢声音就立即关掉。',paper:'Adiasto 等，2022 · 音乐与压力恢复的系统综述',url:'https://pubmed.ncbi.nlm.nih.gov/35714120/',limit:'综述中音乐对短时压力恢复的总体效果不显著；本页是合成环境音，不等同于论文中的音乐，是否适合以你的感受为准。'},
 still:{label:'久坐，身体有点僵',title:'让身体轻轻动一下',type:'move',button:'试试 2 分钟轻舒展',reason:'长时间坐着时，先用舒适的幅度活动肩膀和双手；不需要追求运动强度。',paper:'Weinstein 等，2024 · 单次运动与情绪的荟萃分析',url:'https://pubmed.ncbi.nlm.nih.gov/38787545/',limit:'研究涵盖不同类型和时长的运动，结果差异较大；不能将其效果直接套用到本页的 2 分钟舒展。若有疼痛，请跳过。'},
 hurt:{label:'委屈，想被理解',title:'先把感受说清楚',type:'reflect',button:'慢慢梳理这份心情',reason:'此刻也许更需要有人听见，而不是马上做放松练习。可以先说出发生的事和感受。',paper:'Levy-Gigi 等，2022 · 命名感受的实验',url:'https://pubmed.ncbi.nlm.nih.gov/36580454/',limit:'实验使用图片诱发的感受，并非真实的人际经历；效果随情境和强度变化，不想继续时可以随时停下。'}
};
function recentCareCue(){
 const r=records.at(-1);if(!r||r.mood>2||Date.now()-new Date(r.date).getTime()>7*86400000)return null;
 const pairs=[['工作','pressure'],['学业','pressure'],['人际关系','hurt'],['亲密关系','hurt']];
 const found=pairs.find(([tag])=>r.tags.includes(tag));return found?{tag:found[0],id:found[1]}:null;
}
function careRecommendation(id){
 const c=CARE_CONCERNS[id];if(!c)return '<p class="tailored-placeholder">选一个最接近此刻的困扰，就能看到一个轻量建议。也可以直接使用下方任意练习。</p>';
 return `<div class="tailored-result-inner"><span class="section-label">为你展开的可选建议</span><h3>${c.title}</h3><p>${c.reason}</p><button type="button" class="primary" data-tailored-action="${id}">${c.button} ↗</button><div class="tailored-evidence"><strong>研究从哪里来？</strong><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.paper} ↗</a><small>${c.limit}</small></div></div>`;
}
function tailoredCarePanel(){
 const cue=recentCareCue(),selected=careConcern||cue?.id||'';
 return `<section class="card tailored-care" aria-labelledby="tailored-care-title"><div class="tailored-care-head"><div><span class="section-label">按此刻的需要 · 自选练习</span><h2 id="tailored-care-title" tabindex="-1">此刻，哪种困扰更接近你？</h2><p>先选一个接近的描述，我们给出一个可更换的小建议。</p></div><span class="tailored-time">约 1–3 分钟 · 随时可停</span></div>${cue&&!careConcern?`<p class="tailored-context">你最近的低落记录标记了「${escape(cue.tag)}」，先为你展开一个方向；这不代表我们知道你的原因。</p>`:''}<div class="tailored-options" role="group" aria-label="选择此刻的困扰">${Object.entries(CARE_CONCERNS).map(([id,c])=>`<button type="button" data-care-concern="${id}" aria-pressed="${selected===id}" class="${selected===id?'selected':''}">${c.label}</button>`).join('')}</div><div class="tailored-result" id="tailored-result" aria-live="polite">${careRecommendation(selected)}</div><p class="tailored-limit">研究启发的是练习方向；“困扰与练习”的匹配由产品设计提出，尚未经过验证。你可以换一种或跳过，不提供诊断与疗效保证。</p></section>`;
}
function bindTailoredCare(){
 document.querySelectorAll('[data-tailored-entry]').forEach(button=>button.onclick=()=>{supportTab='exercises';go('care');document.querySelector('#tailored-care-title')?.focus({preventScroll:true})});
 const panel=document.querySelector('.tailored-care');if(!panel)return;
 const result=panel.querySelector('#tailored-result');
 panel.querySelectorAll('[data-care-concern]').forEach(button=>button.onclick=()=>{careConcern=button.dataset.careConcern;panel.querySelectorAll('[data-care-concern]').forEach(other=>{const active=other===button;other.classList.toggle('selected',active);other.setAttribute('aria-pressed',String(active))});result.innerHTML=careRecommendation(careConcern);bindTailoredAction(result)});
 bindTailoredAction(result);
}
function bindTailoredAction(result){
 const button=result.querySelector('[data-tailored-action]');if(!button)return;
 button.onclick=()=>{if(button.dataset.tailoredAction==='hurt'){go('insights');focusReflectionStep()}else startCare(CARE_CONCERNS[button.dataset.tailoredAction].type)};
}
