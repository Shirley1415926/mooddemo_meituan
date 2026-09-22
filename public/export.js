/* Local-only diary exports. No diary content leaves the browser. */
function openDiaryExport() {
  const entries = records.slice().sort((a,b)=>new Date(b.date)-new Date(a.date));
  if (!entries.length) return toast('先记录一份心情，再把它收藏起来。');
  openModal(`<span class="section-label">把心情，收藏成一份礼物</span><h2 class="modal-title">留一份，写给自己的日记</h2><p class="modal-copy">整本日记保存为 PDF，或将一篇心情下载成图片。只在当前设备生成。</p><div class="export-paper"><span>慢慢 · 私人情绪手记</span><strong>每一种心情，<br>都值得被温柔收藏。</strong><small>${entries.length} 篇记录 · 写给认真生活的自己</small></div><button class="primary full" id="export-pdf">整本日记 · 打印 / 保存为 PDF</button><p class="small-note">在打印窗口中选择「另存为 PDF」。建议使用 A4 纸张，并关闭页眉和页脚。</p><label for="export-entry" class="label-row">选择一篇，保存为图片</label><select id="export-entry" class="export-select">${entries.map((r,i)=>`<option value="${i}">${escape(new Date(r.date).toLocaleDateString('zh-CN'))} · ${MOODS[r.mood-1]} · ${escape((r.text||'一份此刻的心情').slice(0,24))}</option>`).join('')}</select><button class="secondary full" id="export-image" style="margin-top:12px">预览并下载 PNG 图片</button><button class="link-button full" id="export-backup" style="margin-top:14px">下载原始数据备份（JSON）</button><p class="small-note center">导出内容包含你的私人日记，分享前请确认。</p>`);
  $('#export-pdf').onclick=()=>printDiaryBook(entries);
  $('#export-image').onclick=()=>previewDiaryImage(entries[Number($('#export-entry').value)]);
  $('#export-backup').onclick=()=>downloadDiaryBlob(new Blob([JSON.stringify(entries,null,2)],{type:'application/json'}),'慢慢-日记备份.json');
}
function downloadDiaryBlob(blob,name) {
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=name;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function printDiaryBook(entries) {
  openModal('<h2 class="modal-title">我的情绪手记</h2><p class="small-note">预览整本日记，点击下方按钮后选择「另存为 PDF」。</p><iframe id="diary-print-preview" title="日记 PDF 排版预览" style="width:100%;height:48vh;border:1px solid #e2e8d4;border-radius:12px;margin:12px 0"></iframe><button id="save-diary-pdf" class="primary full">打印 / 保存为 PDF</button><button id="back-export" class="link-button full" style="margin-top:12px">返回导出选项</button>');
  const win=$('#diary-print-preview').contentWindow;
  const date=r=>new Date(r.date).toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const oldest=entries[entries.length-1];
  win.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>慢慢 · 我的情绪手记</title><style>
  *{box-sizing:border-box}body{margin:0;background:#eceee5;color:#35402f;font-family:"PingFang SC","Microsoft YaHei",sans-serif;line-height:1.9}.actions{position:sticky;top:0;display:flex;gap:18px;align-items:center;justify-content:center;background:#fff;padding:14px;font-size:14px;border-bottom:1px solid #ddd}button{background:#656c47;border:0;padding:10px 20px;border-radius:8px;color:white;font-size:15px;cursor:pointer}.book{max-width:800px;margin:30px auto;background:#fff;padding:40px}.actions{display:none}.cover{padding:30px 0 45px;border-bottom:1px solid #d6ddc6;margin-bottom:35px}.brand{font-size:15px;color:#7a8861;letter-spacing:3px}.cover h1{font-family:"Songti SC",serif;font-size:42px;font-weight:500;line-height:1.5;margin:35px 0 24px}.cover p{font-size:15px;color:#869077}.cover .meta{font-size:12px;margin-top:35px}.entry{padding:30px 0;border-bottom:1px solid #e4e8dd;break-inside:avoid}.date{font-size:12px;color:#869077;letter-spacing:1px}.entry h2{font-size:23px;font-weight:500;margin:10px 0 15px}.entry p{font-size:15px;white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3}.tag{display:inline-block;background:#edf1e4;border:1px solid #dce3cc;padding:2px 10px;border-radius:12px;font-size:12px;margin:4px 7px 4px 0;color:#74815d}.end{margin-top:45px;font-size:12px;color:#8d957e;text-align:center}.private{font-size:11px;letter-spacing:2px;color:#9ba28d;margin-top:8px}@media screen and (max-width:600px){.book{padding:26px;margin:15px auto}.cover h1{font-size:28px}.cover{padding:20px 0 30px}}@page{size:A4;margin:18mm 19mm}@media print{body{background:white}.actions{display:none}.book{margin:0;padding:0;max-width:none}.cover{padding-top:35mm;break-after:page;border:0}.cover h1{font-size:38px}.entry{padding:20px 0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body><div class="actions"><button id="print-book">打印 / 保存为 PDF</button><span>选择「另存为 PDF」，关闭页眉页脚</span></div><main class="book"><header class="cover"><div class="brand">m. &nbsp; 慢慢 · 情绪手记</div><h1>每一种心情，<br>都值得被温柔收藏。</h1><p>不用每一天都很好，每一天都可以被记录。<br>写给认真生活的自己。</p><div class="meta">${escape(new Date(oldest.date).toLocaleDateString('zh-CN'))} — ${escape(new Date(entries[0].date).toLocaleDateString('zh-CN'))}<br>共 ${entries.length} 篇日记</div><div class="private">私人收藏 · 仅为自己留存</div></header>${entries.map(r=>`<article class="entry"><div class="date">${escape(date(r))}</div><h2>${MOODS[r.mood-1]}</h2><div>${r.tags.map(t=>`<span class="tag">${escape(t)}</span>`).join('')}</div><p>${escape(r.text||'这一次，只记录心情，也很好。')}</p></article>`).join('')}<footer class="end">慢慢来，也是一种前进。<div class="private">慢慢 · 接住每一种心情</div></footer></main></body></html>`);
  win.document.close();
  win.document.getElementById('print-book').onclick=()=>win.print();
  $('#save-diary-pdf').onclick=()=>{win.focus();win.print();};
  $('#back-export').onclick=openDiaryExport;
}
function drawDiaryImage(entry) {
  const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
  if(!ctx) throw new Error('当前浏览器不支持生成图片');
  const width=1080,padding=100,textWidth=width-padding*2;
  const font='"PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.font=`30px ${font}`;
  const lines=[];
  for(const paragraph of (entry.text||'这一次，只记录心情，也很好。').split('\n')){
    if(!paragraph){lines.push('');continue;}
    let line='';
    for(const char of Array.from(paragraph)){
      if(ctx.measureText(line+char).width>textWidth&&line){lines.push(line);line=char;}else line+=char;
    }
    lines.push(line);
  }
  ctx.font=`23px ${font}`;
  let tagX=padding,tagRow=0;const tags=[];
  for(const tag of entry.tags){const text=String(tag),w=ctx.measureText(text).width+36;if(tagX+w>width-padding){tagRow++;tagX=padding;}tags.push({text,x:tagX,y:360+tagRow*58,w});tagX+=w+14;}
  const bodyY=tags.length?440+tagRow*58:370;
  canvas.width=width;canvas.height=Math.max(1050,bodyY+lines.length*58+225);
  ctx.fillStyle='#f6f7ef';ctx.fillRect(0,0,width,canvas.height);
  ctx.fillStyle='#ffffff';ctx.fillRect(40,40,width-80,canvas.height-80);
  ctx.fillStyle='#768354';ctx.fillRect(padding,95,48,5);
  ctx.font=`24px ${font}`;ctx.fillText('慢慢  /  私人情绪手记',padding,158);
  ctx.fillStyle='#8d957d';ctx.font=`22px ${font}`;
  ctx.fillText(new Date(entry.date).toLocaleString('zh-CN',{year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}),padding,221);
  ctx.fillStyle='#39452d';ctx.font=`500 54px ${font}`;ctx.fillText(MOODS[entry.mood-1],padding,310);
  for(const tag of tags){ctx.fillStyle='#edf1e3';ctx.beginPath();ctx.roundRect(tag.x,tag.y,tag.w,43,13);ctx.fill();ctx.fillStyle='#76835d';ctx.font=`23px ${font}`;ctx.fillText(tag.text,tag.x+18,tag.y+30);}
  ctx.fillStyle='#48523e';ctx.font=`30px ${font}`;
  lines.forEach((line,i)=>ctx.fillText(line,padding,bodyY+i*58));
  ctx.strokeStyle='#e2e7d8';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(padding,canvas.height-185);ctx.lineTo(width-padding,canvas.height-185);ctx.stroke();
  ctx.fillStyle='#899775';ctx.font=`25px ${font}`;ctx.fillText('慢慢来，也是一种前进。',padding,canvas.height-124);
  ctx.fillStyle='#a3ab97';ctx.font=`19px ${font}`;ctx.fillText('给心情一点空间 · 给自己一点温柔',padding,canvas.height-83);
  return canvas;
}
function previewDiaryImage(entry) {
  try{
    const canvas=drawDiaryImage(entry);
    openModal('<span class="section-label">属于你的心情卡片</span><h2 class="modal-title">把这一刻，温柔收藏</h2><div id="diary-image-preview" class="diary-image-preview"></div><button id="download-diary-image" class="primary full">下载高清 PNG</button><button id="back-export" class="link-button full" style="margin-top:12px">返回导出选项</button>');
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label','即将导出的日记图片预览');$('#diary-image-preview').appendChild(canvas);
    $('#download-diary-image').onclick=()=>canvas.toBlob(blob=>{if(!blob)return toast('图片生成失败，请重试');downloadDiaryBlob(blob,`慢慢-心情-${dayKey(entry.date)}.png`);toast('图片已生成，请在下载中查看');},'image/png');
    $('#back-export').onclick=openDiaryExport;
  }catch(error){toast(error.message||'图片生成失败，请尝试 PDF 导出');}
}
