// Keep brief taps perceptible without delaying the action or capturing scrolling.
(()=>{
 let pressed=null,started=0,releaseTimer;
 const release=(immediate=false)=>{
  const el=pressed;clearTimeout(releaseTimer);
  if(!el)return;
  const clear=()=>{el.classList.remove('is-pressing');if(pressed===el)pressed=null};
  if(immediate)clear();else releaseTimer=setTimeout(clear,Math.max(0,130-(performance.now()-started)));
 };
 document.addEventListener('pointerdown',e=>{
  release(true);if(e.button!==0)return;
  const button=e.target.closest('button');
  if(!button||button.disabled||button.getAttribute('aria-disabled')==='true')return;
  pressed=button;started=performance.now();button.classList.add('is-pressing');
 },{passive:true});
 document.addEventListener('pointerup',()=>release(),{passive:true});
 document.addEventListener('pointercancel',()=>release(true),{passive:true});
 document.addEventListener('scroll',()=>release(true),{passive:true,capture:true});
 window.addEventListener('blur',()=>release(true));
})();
