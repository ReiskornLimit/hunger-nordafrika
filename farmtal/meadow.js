// A miniature alpine farm, painted in perspective across the playable meadow.
const field = document.getElementById('farm');
const canvas = document.createElement('canvas');
field.prepend(canvas);
const ctx = canvas.getContext('2d');
const backdrop = document.createElement('canvas');
backdrop.width = 1000; backdrop.height = 600;
const brush = backdrop.getContext('2d');
let pen = brush;
function oval(x,y,w,h,color){pen.fillStyle=color;pen.beginPath();pen.ellipse(x,y,w,h,0,0,Math.PI*2);pen.fill();}
function polygon(color,...points){pen.fillStyle=color;pen.beginPath();points.forEach(([x,y],i)=>i?pen.lineTo(x,y):pen.moveTo(x,y));pen.closePath();pen.fill();}
function rect(x,y,w,h,color){pen.fillStyle=color;pen.fillRect(x,y,w,h);}
let seed=127;
function random(){seed=(seed*16807)%2147483647;return seed/2147483647;}
const sky=brush.createLinearGradient(0,0,0,600);sky.addColorStop(0,'#9ed6df');sky.addColorStop(.33,'#ffe8b3');sky.addColorStop(.34,'#afc679');sky.addColorStop(1,'#7fa65a');rect(0,0,1000,600,sky);
oval(778,43,29,29,'#fff2bf');
for(let i=-1;i<11;i++){let x=i*105,y=15+random()*45;polygon('#799998',[x-130,180],[x,y],[x+145,180]);polygon('#e0e5d5',[x-27,y+33],[x,y],[x+29,y+32],[x+8,y+23],[x,y+29],[x-9,y+22]);}
for(let i=0;i<12;i++)oval(i*107,166,151,46+random()*42,'#789966');
for(let i=0;i<90;i++){let x=random()*1000,y=135+random()*38,h=22+random()*28;rect(x,y,3,10,'#715d44');polygon('#436d58',[x-h*.28,y],[x,y-h],[x+h*.28,y]);}
polygon('#abc779',[0,156],[300,183],[670,158],[1000,171],[1000,600],[0,600]);
polygon('#d7bc86',[1000,143],[1000,172],[790,201],[734,222],[540,211],[526,204],[722,207],[771,189]);
for(let i=0;i<1550;i++){let x=random()*1000,y=180+random()*415;oval(x,y,1+random()*4,.7,random()>.5?'#92af62':'#c6d590');}
for(const y of [166,174])rect(0,y,1000,4,'#a67d54');
for(let x=3;x<1000;x+=43){rect(x,159,6,24,'#836344');rect(x,158,4,23,'#d6b785');}
function building(x,y,color,kind,working,t){
pen.save();pen.translate(x,y);oval(2,0,63,10,'#6d864d88');rect(-42,-49,78,48,'#f4d9a5');polygon('#c19f72',[36,-49],[54,-63],[54,-13],[36,0]);polygon(color,[-53,-47],[-27,-87],[49,-87],[36,-47]);polygon('#6e5040',[36,-47],[49,-87],[63,-61]);rect(-18,-32,24,32,'#755337');rect(-36,-35,12,14,'#668483');rect(16,-35,13,15,'#668483');rect(-44,-5,81,5,'#b68e60');
if(kind==='mill'){pen.save();pen.translate(-4,-54);pen.rotate(t*(working?2:.3));for(let i=0;i<4;i++){pen.rotate(Math.PI/2);rect(0,-2,38,4,'#705b44');rect(12,-9,26,8,'#fff0c8');}pen.restore();}
else {rect(17,-99,9,16,'#966a54');if(working)for(let j=0;j<3;j++)oval(21+j*3,-107-((t*14+j*9)%28),5+j,4+j,'#fff7dfaa');}pen.restore();}
const places=[['mill',133,'Mühle','#aa7555'],['bakery',365,'Backstube','#ba624d'],['dairy',613,'Käserei','#5e8594'],['weaver',852,'Weberei','#687d6d']];
function sprite(a,t){
let cow=a.type==='cow',hen=a.type==='hen',bear=a.type==='bear',scale=hen?.72:1;
let tone=hen?'#fff4d7':cow?'#efe6ce':bear?'#956340':'#f7ecd6';
pen.save();pen.translate(a.x*10,a.y*6);pen.scale(Math.cos(a.dir||0)<0?-scale:scale,scale);
oval(0,3,hen?19:28,5,'#50623655');let stride=Math.sin(t*6+a.y)*3;
for(let i=0;i<4;i++){let x=-15+i*9;rect(x,-9,hen?3:5,11+Math.sin(i*2+t*6)*2,hen?'#bd853c':'#765e4a');}
pen.translate(0,-Math.abs(stride)*.4);oval(0,-16,hen?18:26,hen?14:16,tone);
if(cow){oval(-9,-21,9,7,'#504b47');oval(6,-12,7,5,'#504b47');}
if(hen){polygon('#b98253',[-14,-18],[-27,-35],[-25,-12]);oval(-3,-15,10,7,'#e4cba3');}
if(a.type==='sheep')for(let i=0;i<7;i++)oval(-18+i*5,-26+Math.cos(i)*2,7,6,'#fff4df');
oval(18,-28,hen?9:13,hen?11:12,a.type==='sheep'?'#937c66':tone);
if(hen){oval(18,-39,5,4,'#bc4836');polygon('#de9b3d',[25,-31],[35,-28],[25,-25]);}else{oval(11,-38,6,5,tone);oval(26,-21,8,5,cow?'#dca899':'#816448');}
oval(22,-31,1.9,2,'#302e28');pen.restore();}
function paint(t){canvas.width=1000;canvas.height=600;pen=ctx;ctx.drawImage(backdrop,0,0);
for(const [id,x,,c] of places){ctx.globalAlpha=s.buildings[id]?1:.76;building(x,163,c,id,s.buildings[id]?.remaining>0,t);}ctx.globalAlpha=1;
if(s.truck){let x=760+(8-s.truck.remaining)*50;ctx.save();ctx.translate(x,190);rect(-24,-17,33,15,'#bc6544');rect(9,-12,13,11,'#4c716f');oval(-16,0,5,5,'#504937');oval(14,0,5,5,'#504937');ctx.restore();}
for(const a of [...s.animals,...s.bears.map(b=>({...b,type:'bear'}))].sort((a,b)=>a.y-b.y))sprite(a,t);
requestAnimationFrame(()=>paint(s.elapsed));}
for(const [id,x,title] of places){const b=document.createElement('button');b.className='plot';b.style.left=x/10+'%';b.textContent=title;b.onclick=e=>{e.stopPropagation();if(!s.complete)build(id);};field.append(b);}
paint(0);
