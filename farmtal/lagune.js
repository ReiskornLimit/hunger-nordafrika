'use strict';
const el=id=>document.getElementById(id),board=el('pond'),ctx=board.getContext('2d'),box=el('dialog');
const species=['Silberfisch','Goldflosse','Blaufisch','Korallenfisch','Mondfisch','Delfin'];
const colors=['#93b7c4','#e9a642','#4697c0','#ca6657','#a58abd','#669dbb'];
const prices=[100,1000,10000,1000,1500,50000];
const goods=['Rogen','Goldrogen','Blaue Perle','Koralle','Mondperle','Schatz','Kaviar','Kaviardose','Perlenkette','Schmuck','Präsent','Schatzkiste'];
const value=[20,80,360,90,130,1800,60,140,220,400,330,3500];
const plots=[['Salzerei',0,6,120],['Konservenküche',6,7,220],['Perlenstube',1,8,320],['Goldschmiede',8,9,550],['Packhaus',7,10,400],['Schatzkammer',5,11,900]];
const levels=[[0,4,100,60],[6,3,190,90],[7,4,330,120],[1,5,1050,120],[8,4,1450,130],[9,5,1900,160],[10,5,950,170],[3,7,1100,160],[4,8,1650,170],[2,9,10100,190],[5,6,50100,220],[11,8,51500,250]];
const sites=plots.map((_,i)=>[i%2?764:136,180+Math.floor(i/2)*157]);
const bg=new Image();bg.src='lagune.jpg';let state,last=0,saveTime=0;
function swimmer(k){return {k,x:345+Math.random()*215,y:245+Math.random()*200,a:Math.random()*6.28,h:95,p:0};}
function fresh(i,medals={}){return {i,medals,coins:levels[i][2],fish:[swimmer(0),swimmer(0)],feed:12,baits:[],drops:[],stock:Array(12).fill(0),made:Array(12).fill(0),plants:Array(6).fill(null),time:0,boat:null,done:false};}
try{state=JSON.parse(localStorage.getItem('perlenlagune-1'));}catch{}if(!state?.plants)state=fresh(0);
function save(){try{localStorage.setItem('perlenlagune-1',JSON.stringify(state));}catch{}}
function say(t){el('message').textContent=t;}
function menu(title,body,actions){box.replaceChildren();const h=document.createElement('h2');h.textContent=title;box.append(h);const p=document.createElement('p');p.textContent=body;box.append(p);for(const [label,action]of actions){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{box.close();action?.();save();hud();};box.append(b);}if(!box.open)box.showModal();}
function info(){const [g,n,,gold]=levels[state.i];menu('Insel '+(state.i+1),n+' × '+goods[g]+' sammeln. Goldzeit '+gold+' Sekunden. Tippe ins Wasser für Futter und auf die schwimmenden Produkte zum Einsammeln.',[['Zum Teich']]);}
function map(){menu('Inselkarte','Wähle eine freigespielte Fischfarm.',levels.flatMap((_,i)=>i===state.i||state.medals[i]||i===0||state.medals[i-1]?[[((state.medals[i]||'')+' Insel '+(i+1)),()=>{if(i!==state.i||state.done){state=fresh(i,state.medals);}info();}]]:[]).concat([['Zurück']]));}
el('map').onclick=map;
function buy(cost,fn){if(state.coins<cost){say('Dir fehlen '+(cost-state.coins)+' Münzen.');return;}state.coins-=cost;fn();}
el('fish').onclick=()=>menu('Fischhändler','Jede Art liefert ein anderes Produkt.',species.map((name,k)=>[name+' · '+prices[k],()=>buy(prices[k],()=>state.fish.push(swimmer(k)))]).concat([['Zurück']]));
el('food').onclick=()=>{if(state.feed<12)buy(15,()=>state.feed=12);hud();save();};
el('stock').onclick=()=>menu('Lager am Steg',state.stock.map((n,k)=>n?goods[k]+' × '+n:'').filter(Boolean).join(' · ')||'Dein Lager ist leer.',[['Zurück']]);
el('ship').onclick=()=>{if(state.boat)return;const total=state.stock.reduce((sum,n,k)=>sum+n*value[k],0);if(!total)return say('Das Lager ist leer.');menu('Marktboot','Alle eingelagerten Waren für '+total+' Münzen verschiffen? Die Fahrt dauert acht Sekunden.',[['Ablegen',()=>{state.stock.fill(0);state.boat={t:8,total};}],['Zurück']]);};
function operate(i){const [name,input,out,cost]=plots[i],b=state.plants[i];if(!b)return menu(name,goods[input]+' → '+goods[out],[['Bauen · '+cost,()=>buy(cost,()=>state.plants[i]={t:0})],['Zurück']]);if(b.t>0)return say(name+' arbeitet noch.');if(!state.stock[input])return say(name+' braucht '+goods[input]+'.');state.stock[input]--;b.t=6;say(name+' verarbeitet '+goods[input]+'.');}
function tick(dt){const s=state;s.time+=dt;
for(const f of s.fish){f.h-=dt*.9;let bait=s.baits.reduce((a,b)=>!a||Math.hypot(b.x-f.x,b.y-f.y)<Math.hypot(a.x-f.x,a.y-f.y)?b:a,null);if(bait&&f.h<95){f.a=Math.atan2(bait.y-f.y,bait.x-f.x);if(Math.hypot(bait.x-f.x,bait.y-f.y)<18){f.h=Math.min(100,f.h+24*dt);bait.food-=dt;}}else f.a+=Math.sin(s.time*.4+f.y*.02)*dt*.6;
f.x+=Math.cos(f.a)*dt*24;f.y+=Math.sin(f.a)*dt*20;if(f.x<286||f.x>611)f.a=Math.PI-f.a;if(f.y<156||f.y>545)f.a=-f.a;f.x=Math.max(286,Math.min(611,f.x));f.y=Math.max(156,Math.min(545,f.y));if(f.h>15)f.p+=dt;if(f.p>=9+f.k){f.p=0;s.drops.push({x:f.x,y:f.y,k:f.k,t:36});}}
s.baits=s.baits.filter(b=>b.food>0);s.fish=s.fish.filter(f=>f.h>0);s.drops=s.drops.filter(d=>(d.t-=dt)>0);
s.plants.forEach((b,i)=>{if(b?.t>0&&(b.t-=dt)<=0){let k=plots[i][2];s.stock[k]++;s.made[k]++;}});
if(s.boat&&(s.boat.t-=dt)<=0){s.coins+=s.boat.total;s.boat=null;say('Das Marktboot ist zurück.');}
const [g,n,,gold]=levels[s.i];if(s.made[g]>=n){s.done=true;s.medals[s.i]=s.time<=gold?'★':'✓';save();menu('Insel geschafft',goods[g]+' gesammelt in '+Math.floor(s.time)+' Sekunden.',[['Zur Inselkarte',map]]);}saveTime+=dt;if(saveTime>=2){saveTime=0;save();hud();}}
board.onclick=e=>{if(box.open||state.done)return;const r=board.getBoundingClientRect(),x=(e.clientX-r.left)*900/r.width,y=(e.clientY-r.top)*660/r.height;
const drop=state.drops.findIndex(d=>Math.hypot(d.x-x,d.y-y)<29);if(drop>=0){const [d]=state.drops.splice(drop,1);state.stock[d.k]++;state.made[d.k]++;say('+1 '+goods[d.k]);}else{const i=sites.findIndex(([a,b])=>((x-a)/110)**2+((y-b)/65)**2<1);if(i>=0)operate(i);else if(y<115&&x>335&&x<560)el('food').click();else if(y>565)el('stock').click();else if(x>248&&x<650&&y>115){if(state.feed){state.feed--;state.baits.push({x:Math.max(286,Math.min(611,x)),y:Math.min(y,545),food:4});}else say('Futterstation am oberen Ufer auffüllen.');}}save();hud();};
function oval(x,y,a,b,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,a,b,0,0,Math.PI*2);ctx.fill();}
function poly(color,points){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function label(x,y,t){ctx.font='bold 17px Georgia';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#44311e';ctx.strokeText(t,x,y);ctx.fillStyle='#fff0c1';ctx.fillText(t,x,y);}
function hut(x,y,kind){ctx.save();ctx.translate(x,y);oval(0,8,56,12,'#625b3c66');ctx.fillStyle='#986d40';ctx.fillRect(-38,-40,76,46);for(let j=-35;j<38;j+=9){ctx.fillStyle='#bc935a';ctx.fillRect(j,-37,5,40);}poly(['#727d59','#b28542','#527f84'][kind%3],[[-52,-36],[-29,-69],[31,-69],[51,-36]]);for(let j=-39;j<40;j+=8)poly('#c0a96988',[[j,-36],[j+10,-64],[j+14,-64],[j+4,-36]]);ctx.fillStyle='#4c4434';ctx.fillRect(-10,-24,21,30);ctx.restore();}
function paintFish(f,t){ctx.save();ctx.translate(f.x,f.y);ctx.scale(Math.cos(f.a)<0?-1:1,1);const w=Math.sin(t*7+f.y)*3;oval(0,9,23,5,'#163b653d');poly('#bad5dd',[[-14,-1],[-31,-10+w],[-27,0],[-31,9+w],[-13,4]]);poly('#607d93',[[-8,-6],[1,-19],[9,-7]]);const g=ctx.createLinearGradient(0,-11,0,11);g.addColorStop(0,'#445d78');g.addColorStop(.42,colors[f.k]);g.addColorStop(.86,'#e9ede1');g.addColorStop(1,'#688997');oval(0,0,22,11,g);for(let j=-12;j<8;j+=5)for(let k=-4;k<4;k+=4)oval(j+k%3,k,1.4,.8,'#cfe4db99');poly('#7695a6',[[-1,2],[6,3],[-3,13]]);oval(14,-3,3,3,'#fff8dd');oval(15,-3,1.7,2,'#273747');ctx.restore();}
function draw(t){ctx.clearRect(0,0,900,660);if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0);hut(450,103,2);label(450,115,'Futter · '+state.feed);sites.forEach(([x,y],i)=>{if(state.plants[i]){hut(x,y,i);label(x,y+33,plots[i][0]+(state.plants[i].t>0?' · '+Math.ceil(state.plants[i].t)+' s':''));}else{label(x,y+5,plots[i][0]);label(x,y+26,'+ '+plots[i][3]);}});
state.baits.forEach(b=>{for(let i=0;i<8;i++)oval(b.x+Math.sin(i*3)*10,b.y+Math.cos(i*2)*6,3,2,'#bea452');});state.fish.forEach(f=>paintFish(f,t));for(const d of state.drops){const y=d.y+Math.sin(t*3)*2;oval(d.x,y+3,13,7,'#b18946');for(let j=0;j<7;j++){const x=d.x+Math.cos(j)*7,yy=y+Math.sin(j)*4;oval(x,yy,4,4,d.k===0?'#ae4142':'#9ccabb');oval(x-1,yy-1,1.4,1.3,'#fff1bf');}}
for(let j=0;j<12;j++){ctx.fillStyle=j%2?'#ab8454':'#b99462';ctx.fillRect(318+j*22,596,21,64);}hut(403,612,0);label(409,645,'Lager');if(state.boat){const x=540+(8-state.boat.t)*22,y=587-(8-state.boat.t)*12;poly('#865737',[[x-32,y],[x+32,y],[x+22,y+10],[x-18,y+10]]);poly('#f2e6be',[[x,y-38],[x,y-2],[x+25,y-3]]);}}
function hud(){const [g,n,,gold]=levels[state.i];el('coins').textContent='◉ '+state.coins;el('goal').textContent='Insel '+(state.i+1)+' · '+goods[g]+' '+state.made[g]+'/'+n;el('clock').textContent=Math.floor(state.time)+' s / Gold '+gold+' s';el('food').textContent='Futter '+state.feed+'/12 · 15 ◉';el('ship').textContent=state.boat?'Boot unterwegs':'Boot beladen';}
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;if(!box.open&&!document.hidden&&!state.done)tick(dt);draw(state.time);requestAnimationFrame(frame);}
window.addEventListener('pagehide',save);hud();if(state.done)map();else info();requestAnimationFrame(frame);
