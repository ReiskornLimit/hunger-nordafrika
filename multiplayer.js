'use strict';
const FarmDuo=(()=>{
 const clone=x=>structuredClone(x);
 function create(mode,difficulty){const a=E.fresh(difficulty),b=clone(a);return {version:1,mode,players:[{state:a,plan:clone(a.fields)},{state:b,plan:clone(b.fields)}],active:0,round:0,seed:a.seed,ready:[false,false],gift:[false,false],water:0,paid:[false,false],finished:false};}
 function score(p){const x=p.state;return Math.round(x.money+x.stock*.6+x.herd*(x.species==='Rinder'?35:11)+x.tools+x.fields.reduce((n,f)=>n+f.soil*.3+(f.well?40:0)+(f.terrace?30:0),0));}
 function gift(g){const i=g.active,a=g.players[i].state,b=g.players[1-i].state;if(g.finished||g.gift[i]||a.stock<20)throw Error('Einmal pro Jahr möglich: Du brauchst 20 Nahrung.');a.stock-=20;b.stock+=20;g.gift[i]=true;}
 function water(g){const i=g.active,a=g.players[i].state;if(g.finished||g.water>=2||g.paid[i]||a.money<40)throw Error('Jeder Hof kann einmal 40 G zum Wasserspeicher beitragen.');a.money-=40;g.paid[i]=true;g.water++;}
 function turn(g){if(g.finished)throw Error('Die Partie ist beendet.');const i=g.active,p=g.players[i],q=E.quote(p.state,p.plan);if(q.cost>p.state.money||q.work>E.labor(p.state)+.001)throw Error('Prüfe Geld und Arbeitskraft für deinen Plan.');g.ready[i]=true;if(!g.ready.every(Boolean)){g.active=1-i;return null;}
 const reports=[];for(const player of g.players){player.state.seed=g.seed;if(g.water===2)player.state.stock+=15;reports.push(E.harvest(player.state,player.plan));player.plan=clone(player.state.fields);}
 g.seed=g.seed*16807%2147483647;g.round++;g.ready=[false,false];g.gift=[false,false];g.active=g.round%2;g.finished=g.round>=10||g.players.some(p=>p.state.over);return reports;}
 return {create,score,gift,water,turn};
})();
if(typeof module!=='undefined')module.exports=FarmDuo;
