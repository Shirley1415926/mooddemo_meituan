const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const context=vm.createContext({TAGS:['工作','睡眠','独处']});
vm.runInContext(fs.readFileSync('public/insights.js','utf8'),context);
const analyze=context.analyzeMoodFactors;
const now=new Date(2026,8,24,12);
const entry=(id,day,mood,tags)=>({id,date:new Date(2026,8,day,8).toISOString(),mood,tags});
test('factor evidence counts each diary once, retains positive records, ranks by low count',()=>{
 const rows=[entry('a',20,2,['工作','工作','睡眠']),entry('b',21,1,['工作']),entry('c',22,5,['工作']),entry('d',24,4,['独处'])];
 const {factors}=analyze(rows,7,now);
 assert.equal(factors[0].tag,'工作');assert.equal(factors[0].low,2);assert.equal(factors[0].total,3);
 assert.equal(factors.find(f=>f.tag==='睡眠').entries[0].id,'a');
 assert.equal(factors.find(f=>f.tag==='独处').low,0);
 assert.equal(rows[0].tags.length,3);
});
test('calendar range excludes stale and future entries, preserves untagged records',()=>{
 const rows=[entry('old',17,1,['工作']),entry('boundary',18,2,['睡眠']),entry('future',25,1,['工作']),entry('untagged',24,3,[])];
 const result=analyze(rows,7,now);
 assert.equal(result.items.length,2);assert.equal(result.factors.length,1);assert.equal(result.factors[0].tag,'睡眠');
 assert.equal(analyze(rows,30,now).items.length,3);
 assert.equal(analyze([],7,now).factors.length,0);
});
