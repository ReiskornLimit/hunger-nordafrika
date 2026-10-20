'use strict';
const FarmExpansion=(()=>{
 const buildings={oil:{name:'Ölbohrturm',cost:180,max:2,description:'Fördert je 12 Barrel/Jahr. 15 G Wartung pro Turm; begrenzte Lagerstätte. Risiko: Ölunfall schädigt Boden.'},solar:{name:'Solaranlage',cost:120,max:3,description:'18 G Einkommen pro Jahr. Jede Anlage senkt die gesamte Öl-Wartung um 5 G.'},silo:{name:'Getreidespeicher',cost:90,max:2,description:'20 zusätzliche Nahrung pro Jahr und Speicherprämie: 5 % des Vorrats, maximal 20 pro Speicher.'},lab:{name:'Forschungsstation',cost:160,max:1,description:'Schaltet drei Forschungsstufen frei. Jede Stufe verbessert jährlich den Boden und senkt das Ölunfall-Risiko.'}};
 function init(s){s.expansion={version:1,oil:0,solar:0,silo:0,lab:0,research:0,reserves:240,price:4,pump:true,seed:s.seed,milestone:false};return s;}
 function rng(x){x.seed=x.seed*16807%2147483647;return(x.seed-1)/2147483646;}
 function build(s,key){const x=s.expansion,b=buildings[key];if(s.over||!b||x[key]>=b.max)throw Error('Dieser Ausbau ist nicht verfügbar.');if(s.money<b.cost)throw Error('Nicht genug Geld für diesen Ausbau.');s.money-=b.cost;x[key]++;}
 function research(s){const x=s.expansion,cost=80+40*x.research;if(s.over||!x.lab||x.research>=3)throw Error('Forschungsstation bauen; maximal drei Forschungsstufen.');if(s.money<cost)throw Error('Für diese Forschung fehlen '+cost+' G.');s.money-=cost;x.research++;}
 function before(s){const x=s.expansion,events=[];if(!x)return events;
 let pumped=x.pump?Math.min(x.reserves,x.oil*12):0,maintenance=x.pump&&x.oil?Math.max(0,x.oil*15-x.solar*5):0;
 if(pumped){x.reserves-=pumped;s.money+=pumped*x.price;events.push('Ölförderung: '+pumped+' Barrel × '+x.price+' G = '+pumped*x.price+' G.');}
 let solar=x.solar*18;if(solar){s.money+=solar;events.push('Solarstrom verkauft: +'+solar+' G.');}
 if(maintenance){const paid=Math.min(s.money,maintenance);s.money-=paid;events.push('Öl-Wartung: −'+paid+' G.');}
 if(x.silo){const bonus=x.silo*20+Math.min(x.silo*20,Math.floor(s.stock*.05*x.silo));s.stock+=bonus;events.push('Getreidespeicher sichert '+bonus+' zusätzliche Nahrung.');}
 if(x.research){s.fields.forEach(f=>f.soil=Math.min(100,f.soil+x.research*2));events.push('Bodenforschung: +'+x.research*2+' Bodenpunkte auf allen Feldern.');}
 const accident=rng(x);if(pumped&&accident<Math.max(.03,.18-x.research*.04)){const field=Math.floor(rng(x)*10);s.fields[field].soil=Math.max(15,s.fields[field].soil-20);events.push('Ölunfall auf Feld '+(field+1)+': −20 Bodenpunkte.');}
 x.price=2+Math.floor(rng(x)*6);events.push('Ölpreis für das nächste Jahr: '+x.price+' G/Barrel.');return events;
 }
 function value(s){const x=s.expansion;return Math.round(s.money+s.stock*.6+s.herd*(s.species==='Rinder'?35:11)+s.tools+Object.entries(buildings).reduce((v,[k,b])=>v+x[k]*b.cost*.6,0)+x.research*60);}
 return {buildings,init,build,research,before,value};
})();
if(typeof module!=='undefined')module.exports=FarmExpansion;
