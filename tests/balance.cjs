const E=require('../engine.js'),assert=require('node:assert/strict');
function trial(E,seed,policy){let s=E.fresh(2);s.seed=seed*997;let dead=30,m10=null,spent=0;for(let y=0;y<30;y++){if(s.over){dead=y;break;}if(policy==='protect')s.planning=true;
const livestock=s.species==='Rinder'?8:20;if(policy!=='idle'&&s.herd>livestock){s.money+=(s.herd-livestock)*(s.species==='Rinder'?35:11);s.herd=livestock;}
if(policy!=='idle')while(s.stock>E.need(s)*(policy==='cash'?1:1.7)+20){s.stock-=20;s.money+=12;}
let p=structuredClone(s.fields);
if(policy==='cash'){for(let i=0;i<3;i++)p[i].crop='vegetables';}
if(policy==='food'){for(let i=0;i<3;i++)p[i].crop='millet';}
if(policy!=='idle'&&s.tools<55&&s.money>120){s.money-=25;s.tools+=25;spent+=25;}
if(policy==='protect'&&s.money>160){const i=p.findIndex(f=>(f.crop==='millet'||f.crop==='vegetables')&&!f.well);if(i>=0)p[i].well=true;else {const j=p.findIndex(f=>(f.crop==='millet'||f.crop==='vegetables')&&!f.terrace);if(j>=0)p[j].terrace=true;}}
let q=E.quote(s,p);if(policy!=='idle')while(q.work>E.labor(s)&&s.money-q.cost>50){s.money-=25;s.tools+=25;spent+=25;}
if(q.work>E.labor(s)){p=structuredClone(s.fields);q=E.quote(s,p);}
while(q.cost>s.money&&s.herd>1){s.herd--;s.money+=s.species==='Rinder'?35:11;}
if(q.work>E.labor(s)||q.cost>s.money){dead=y;break;}
const before=s.money;E.harvest(s,p);if(y===9)m10=s.money;
}return {dead,m10,wealth:s.money+s.stock*.6+s.tools+s.herd*11,spent};}

const normal=E.fresh(2);assert.equal(normal.people.length,4);assert.equal(E.need(normal),92);assert.equal(normal.money,300);assert.equal(normal.stock,60);assert.ok(E.fresh(1).stock>normal.stock);
for(let d of [1,2])for(let seed=1;seed<=200;seed++){const s=E.fresh(d);s.seed=seed*997;const r=E.harvest(s,structuredClone(s.fields));assert.equal(r.weather,'Gute Regenzeit');assert.equal(r.shortage,0);}
const stats={};for(const policy of ['idle','food','cash','protect']){const a=Array.from({length:500},(_,i)=>trial(E,i+1,policy));const rate=n=>a.filter(r=>r.dead>=n).length/a.length;stats[policy]={five:rate(5),ten:rate(10),twenty:rate(20),meanYears:a.reduce((n,r)=>n+r.dead,0)/a.length};}
console.log(JSON.stringify(stats,null,2));assert.ok(stats.idle.five>=.95,'A simple start must survive early learning');assert.ok(stats.idle.twenty<.4,'Inaction must carry long-term consequences');assert.ok(stats.protect.twenty>=.65&&stats.protect.twenty<.99,'Investment strategy should be viable without guaranteed success');assert.ok(stats.protect.twenty-stats.idle.twenty>.4,'Planning must materially improve results');
let old=E.fresh(2);delete old.balanceVersion;old.people=[68,64,36,32,18,10,6].map(age=>({age}));old.money=10;old.stock=0;old.hardship=1;E.migrate(old);assert.equal(old.people.length,4);assert.equal(old.stock,E.need(old));assert.equal(old.money,110);const once=structuredClone(old);assert.equal(E.migrate(old),false);assert.deepEqual(old,once);
{const s=E.fresh(3);s.year=5;s.seed=1;s.money=1000;s.stock=0;s.herd=0;s.fields.forEach(f=>f.crop='fallow');const r=E.harvest(s,structuredClone(s.fields));assert.equal(r.weather,'Dürre');assert.equal(r.purchase,92);assert.equal(r.money,908);}
{const s=E.fresh(2);s.fields[0].well=true;s.fields[0].terrace=true;const q=E.quote(s,s.fields);assert.equal(q.upkeep,2);assert.ok(q.cost>=q.upkeep);}
console.log('PASS: calibrated strategy outcomes across 2,000 thirty-year runs, safe first years, starter migration, upkeep disclosure and fixed food price.');
