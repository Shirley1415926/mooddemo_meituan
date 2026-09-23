const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){let saved={};const context=vm.createContext({localStorage:{getItem:k=>saved[k],setItem:(k,v)=>saved[k]=v},toast:()=>{}});vm.runInContext(fs.readFileSync('public/pet.js','utf8'),context);return code=>vm.runInContext(code,context)}
test('repeating one interaction cannot farm growth; different actions keep distinct memories',()=>{const run=setup();run("petMoment('touch');petMoment('touch');petMoment('play')");assert.equal(run('petMoments.length'),2);assert.equal(run('petStage()'),0)});
test('growth counts distinct dates without requiring consecutive attendance',()=>{const run=setup();run("petMoments=[{day:'2025-01-01',kind:'chat'},{day:'2025-04-01',kind:'quiet'},{day:'2025-12-01',kind:'play'}]");assert.equal(run('petStage()'),1);run("petMoments.push(...['02','03','04','05'].map(d=>({day:'2026-01-'+d,kind:'chat'})))");assert.equal(run('petStage()'),2)});
