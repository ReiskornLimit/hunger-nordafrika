'use strict';
const FarmExpansion=(()=>{
 const buildings={wind:{name:'Windrad',cost:150,max:3,requires:'wind',description:'Nach Windkraft-Forschung baubar. Verkauft jährlich 24 G Strom; mit Batteriespeicher 36 G.'},oil:{name:'Ölbohrturm',cost:180,max:2,description:'Fördert je 12 Barrel/Jahr. 15 G Wartung pro Turm; begrenzte Lagerstätte. Risiko: Ölunfall schädigt Boden.'},solar:{name:'Solaranlage',cost:120,max:3,description:'18 G Einkommen pro Jahr. Jede Anlage senkt die gesamte Öl-Wartung um 5 G.'},silo:{name:'Getreidespeicher',cost:90,max:2,description:'20 zusätzliche Nahrung pro Jahr und Speicherprämie: 5 % des Vorrats, maximal 20 pro Speicher.'},lab:{name:'Forschungsstation',cost:160,max:1,description:'Schaltet drei Forschungsstufen frei. Jede Stufe verbessert jährlich den Boden und senkt das Ölunfall-Risiko.'}};
 const technologies={
 seeds:{name:'Verbessertes Saatgut',branch:'Landwirtschaft',cost:100,level:1,needs:[],description:'+10 Nahrung pro geplantem Hirsefeld und Jahr.'},
 irrigation:{name:'Tröpfchenbewässerung',branch:'Landwirtschaft',cost:140,level:1,needs:['seeds'],description:'+12 Nahrung pro Wasserloch und Jahr.'},
 tractor:{name:'Landmaschinen',branch:'Landwirtschaft',cost:200,level:2,needs:['seeds'],description:'Jährlich +15 Gerätewert vor der Ernte; erhöht Arbeitskraft ab dem Folgejahr.'},
 logistics:{name:'Kühllager & Logistik',branch:'Landwirtschaft',cost:180,level:2,needs:['irrigation'],building:'silo',description:'Getreidespeicher liefern zusätzlich je 20 Nahrung pro Jahr.'},
 wind:{name:'Windkraft',branch:'Energie',cost:120,level:1,needs:[],description:'Schaltet bis zu drei Windräder frei. Bau: je 150 G, Einkommen: je 24 G/Jahr.'},
 battery:{name:'Batteriespeicher',branch:'Energie',cost:220,level:2,needs:['wind'],building:'solar',description:'+50 % Einnahmen aus Solarstrom und Windkraft.'},
 drill:{name:'Präzisionsbohrer',branch:'Industrie',cost:160,level:1,needs:[],building:'oil',description:'Ölförderung steigt von 12 auf 18 Barrel pro Bohrturm und Jahr.'},
 geology:{name:'Tiefenprospektion',branch:'Industrie',cost:240,level:2,needs:['drill'],description:'Entdeckt einmalig 240 zusätzliche Barrel Öl.'},
 safety:{name:'Sicherheitstechnik',branch:'Industrie',cost:180,level:2,needs:['drill'],description:'Halbiert das verbleibende Ölunfallrisiko.'},
 automation:{name:'Automatisierte Förderung',branch:'Industrie',cost:300,level:3,needs:['drill','battery'],description:'Halbiert die Öl-Wartung nach dem Solar-Rabatt.'}
 };
 function migrate(s){const x=s.expansion;if(!x)return; if(!Number.isInteger(x.wind))x.wind=0;if(!x.tech||typeof x.tech!=='object'||Array.isArray(x.tech))x.tech={};for(const k of Object.keys(x.tech))if(!Object.hasOwn(technologies,k)||x.tech[k]!==true)delete x.tech[k];return x;}
 function reason(s,key){const x=migrate(s),t=technologies[key];if(!t)return 'Unbekannte Technologie';if(s.over)return 'Hof aufgegeben';if(x.tech[key])return 'Bereits freigeschaltet';if(!x.lab)return 'Forschungsstation benötigt';if(x.research<t.level)return 'Grundlagenforschung Stufe '+t.level+' benötigt';const missing=t.needs.filter(k=>!x.tech[k]);if(missing.length)return 'Zuerst: '+missing.map(k=>technologies[k].name).join(', ');if(t.building&&!x[t.building])return buildings[t.building].name+' benötigt';if(s.money<t.cost)return 'Noch '+(t.cost-s.money)+' G nötig';return '';}
 function unlock(s,key){const problem=reason(s,key);if(problem)throw Error(problem);const x=s.expansion,t=technologies[key];s.money-=t.cost;x.tech[key]=true;if(key==='geology')x.reserves+=240;}
 function init(s){s.expansion={version:1,wind:0,tech:{},oil:0,solar:0,silo:0,lab:0,research:0,reserves:240,price:4,pump:true,seed:s.seed,milestone:false};return s;}
 function rng(x){x.seed=x.seed*16807%2147483647;return(x.seed-1)/2147483646;}
 function build(s,key){const x=migrate(s),b=buildings[key];if(s.over||!b||x[key]>=b.max)throw Error('Dieser Ausbau ist nicht verfügbar.');if(b.requires&&!x.tech[b.requires])throw Error('Zuerst '+technologies[b.requires].name+' erforschen.');if(s.money<b.cost)throw Error('Nicht genug Geld für diesen Ausbau.');s.money-=b.cost;x[key]++;}
 function research(s){const x=s.expansion,cost=80+40*x.research;if(s.over||!x.lab||x.research>=3)throw Error('Forschungsstation bauen; maximal drei Forschungsstufen.');if(s.money<cost)throw Error('Für diese Forschung fehlen '+cost+' G.');s.money-=cost;x.research++;}
 function before(s,plan=s.fields){const x=migrate(s),events=[];if(!x)return events;const tech=x.tech;
 let pumped=x.pump?Math.min(x.reserves,x.oil*(tech.drill?18:12)):0,maintenance=x.pump&&x.oil?Math.max(0,x.oil*15-x.solar*5):0;
 if(tech.automation)maintenance=Math.ceil(maintenance/2);
 if(pumped){x.reserves-=pumped;s.money+=pumped*x.price;events.push('Ölförderung: '+pumped+' Barrel × '+x.price+' G = '+pumped*x.price+' G.');}
 let solar=x.solar*(tech.battery?27:18);if(solar){s.money+=solar;events.push('Solarstrom verkauft: +'+solar+' G.');}
 const wind=x.wind*(tech.battery?36:24);if(wind){s.money+=wind;events.push('Windstrom verkauft: +'+wind+' G.');}
 const bonusFood=(tech.seeds?plan.filter(f=>f.crop==='millet').length*10:0)+(tech.irrigation?plan.filter(f=>f.well).length*12:0)+(tech.logistics?x.silo*20:0);if(bonusFood){s.stock+=bonusFood;events.push('Agrartechnologien: +'+bonusFood+' Nahrung.');}
 if(tech.tractor){s.tools+=15;events.push('Landmaschinen: +15 Gerätewert.');}
 if(maintenance){const paid=Math.min(s.money,maintenance);s.money-=paid;events.push('Öl-Wartung: −'+paid+' G.');}
 if(x.silo){const bonus=x.silo*20+Math.min(x.silo*20,Math.floor(s.stock*.05*x.silo));s.stock+=bonus;events.push('Getreidespeicher sichert '+bonus+' zusätzliche Nahrung.');}
 if(x.research){s.fields.forEach(f=>f.soil=Math.min(100,f.soil+x.research*2));events.push('Bodenforschung: +'+x.research*2+' Bodenpunkte auf allen Feldern.');}
 const accident=rng(x);if(pumped&&accident<Math.max(.03,.18-x.research*.04)*(tech.safety?.5:1)){const field=Math.floor(rng(x)*10);s.fields[field].soil=Math.max(15,s.fields[field].soil-20);events.push('Ölunfall auf Feld '+(field+1)+': −20 Bodenpunkte.');}
 x.price=2+Math.floor(rng(x)*6);events.push('Ölpreis für das nächste Jahr: '+x.price+' G/Barrel.');return events;
 }
 function value(s){const x=migrate(s);return Math.round(s.money+s.stock*.6+s.herd*(s.species==='Rinder'?35:11)+s.tools+Object.entries(buildings).reduce((v,[k,b])=>v+x[k]*b.cost*.6,0)+x.research*60+Object.keys(x.tech).reduce((n,k)=>n+technologies[k].cost*.5,0));}
 return {buildings,technologies,migrate,reason,unlock,init,build,research,before,value};
})();
if(typeof module!=='undefined')module.exports=FarmExpansion;
