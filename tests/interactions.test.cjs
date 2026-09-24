const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
 const handlers={},timers=new Map();let id=0,now=0;
 const ctx={document:{addEventListener:(n,fn)=>handlers[n]=fn},window:{addEventListener:(n,fn)=>handlers[n]=fn},performance:{now:()=>now},setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:i=>timers.delete(i)};
 vm.runInNewContext(fs.readFileSync('public/interactions.js','utf8'),ctx);
 const button=disabled=>{const classes=new Set();return {disabled,classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)},getAttribute:()=>null,classes}};
 return {handlers,button,down:b=>handlers.pointerdown({button:0,target:{closest:()=>b}}),flush:()=>{for(const [i,f] of timers){timers.delete(i);f()}}};
}
test('rapid consecutive taps release the previous button and settle both',()=>{const s=setup(),a=s.button(),b=s.button();s.down(a);s.handlers.pointerup();s.down(b);assert.equal(a.classes.size,0);assert.ok(b.classes.has('is-pressing'));s.handlers.pointerup();s.flush();assert.equal(b.classes.size,0)});
test('scroll, pointer cancellation and blur release the press; disabled buttons stay still',()=>{const s=setup(),b=s.button();for(const event of ['scroll','pointercancel','blur']){s.down(b);s.handlers[event]();assert.equal(b.classes.size,0)}const disabled=s.button(true);s.down(disabled);assert.equal(disabled.classes.size,0)});
