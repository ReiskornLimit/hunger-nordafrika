const assert=require('node:assert/strict'),E=require('../engine.js');
for(let d of [1,2])assert.equal(E.fresh(d).people.length,4);
const initial=E.fresh(1);assert.equal(E.need(initial),96);assert.equal(initial.stock,180);
for(let seed=1;seed<=500;seed++){let s=E.fresh(1);s.seed=seed*997;for(let year=0;year<10;year++){const q=E.quote(s,s.fields);assert.ok(q.cost<=s.money&&q.work<=E.labor(s));const r=E.harvest(s,structuredClone(s.fields));if(year<2)assert.equal(r.weather,'Gute Regenzeit');assert.equal(r.shortage,0);assert.equal(s.over,false);}assert.equal(s.year,10);}
let old=E.fresh(2);delete old.balanceVersion;old.people=[{age:68},{age:64},{age:36},{age:32},{age:18},{age:10},{age:6}];old.money=10;old.stock=0;old.hardship=1;const demand=E.need(old);assert.equal(E.migrate(old),true);assert.equal(old.stock,demand);assert.equal(old.money,110);assert.equal(old.hardship,0);assert.equal(old.people.length,7);const once=structuredClone(old);assert.equal(E.migrate(old),false);assert.deepEqual(old,once);
let ended=E.fresh();delete ended.balanceVersion;ended.over=true;const money=ended.money;E.migrate(ended);assert.equal(ended.money,money);assert.equal(ended.over,true);
console.log('PASS: 500 normal-start runs survive ten years without shortages, four-person starts, reserves, lower demand, one-time old-save support, ended games preserved.');
