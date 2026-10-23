'use strict';
// Financial projection is deliberately based on the visible plan, not uncertain future harvests.
function farmBudget(state,fields){const cost=E.quote(state,fields).cost;return {capital:state.money,planned:cost,free:state.money-cost};}
(function(){
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const peaks=new WeakMap();let lastState=null,lastMoney=null,busy=false,effectTimer,numberFrame;
 const baseRender=render;
 render=function(){baseRender();renderBudget();decorateScene();};
 function renderBudget(){const box=$('budgetpanel');if(!box)return;const b=farmBudget(s,plan),peak=Math.max(500,peaks.get(s)||0,s.money);peaks.set(s,peak);
 $('budgetcapital').textContent=b.capital.toLocaleString('de-AT')+' G';$('budgetplanned').textContent=b.planned.toLocaleString('de-AT')+' G';$('budgetfree').textContent=b.free.toLocaleString('de-AT')+' G';
 $('budgetfreebar').style.width=(Math.max(0,b.free)/peak*100)+'%';$('budgetreservedbar').style.width=(Math.min(b.capital,b.planned)/peak*100)+'%';
 $('budgetbar').setAttribute('aria-label',`${b.capital} G Kapital, ${b.planned} G geplanter Anbau, ${Math.max(0,b.free)} G danach frei. Skala bis ${peak} G.`);
 $('budgetscale').textContent='0 – '+peak.toLocaleString('de-AT')+' G';box.classList.toggle('overbudget',b.free<0);
 const same=lastState===s,delta=same&&lastMoney!==null?s.money-lastMoney:0;$('budgetdelta').textContent=delta?(delta>0?'+':'')+delta.toLocaleString('de-AT')+' G':(b.free<0?'Plan ist zu teuer':'Für deinen nächsten Schritt');$('budgetdelta').className=delta<0?'money-down':delta>0?'money-up':'';
 if(delta&&!reduced()){cancelAnimationFrame(numberFrame);const from=lastMoney,to=s.money,start=performance.now(),targetState=s;const tick=now=>{if(s!==targetState)return;const t=Math.min(1,(now-start)/480),value=Math.round(from+(to-from)*(1-(1-t)**3));$('budgetcapital').textContent=value.toLocaleString('de-AT')+' G';if(t<1)numberFrame=requestAnimationFrame(tick);};numberFrame=requestAnimationFrame(tick);}
 lastState=s;lastMoney=s.money;
 const report=s.history[s.history.length-1];$('budgetlast').textContent=report?`Letzte Ernte: Gemüse +${report.cash} G · Nahrungskauf ${report.purchase||0} Einheiten`:'Geplante Feldkosten werden erst bei der Ernte abgezogen.';
 }
 function decorateScene(){const svg=$('scene');if(!svg||!svg.querySelectorAll)return;
 svg.querySelectorAll('[data-field]').forEach((field,i)=>{field.classList.toggle('crop-sway',plan[i].crop==='millet'||plan[i].crop==='vegetables');field.style.setProperty('--sway-delay',(-i*.27)+'s');});
 if(s.year&&/Regen|Stark/.test(s.weather)){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','weather-rain');g.setAttribute('aria-hidden','true');g.innerHTML=Array.from({length:22},(_,i)=>`<path d="M${20+i*36} ${40+(i*41)%150}l-5 13" style="animation-delay:${-i*.13}s"/>`).join('');svg.append(g);}
 }
 function fieldAction(index,kind){if(reduced())return;const svg=$('scene');if(!svg)return;clearTimeout(effectTimer);svg.querySelector('#field-fx')?.remove();let x=220+index*55,y=ground(x),g=document.createElementNS('http://www.w3.org/2000/svg','g');g.id='field-fx';g.setAttribute('aria-hidden','true');
 let plough=kind==='millet'||kind==='vegetables';g.innerHTML=`<g transform="translate(${x+6} ${y-4})"><g class="working-farmer">${person(0,0,.8)}<path class="hoe" d="M7-11L18 2 24 1" fill="none" stroke="#d4a667" stroke-width="2"/><g class="dust">${[0,1,2,3].map(i=>`<circle cx="${8+i*6}" cy="${2-i%2*3}" r="1.4" fill="#c8b278"/>`).join('')}</g></g></g>${plough?`<g stroke="#bd9657" fill="none" stroke-width="1.2" class="furrows"><path d="M${x+5} ${y+8}l43-8M${x+5} ${y+13}l43-8M${x+5} ${y+18}l43-8"/></g><g class="sown-seeds" fill="#f0de81"><circle cx="${x+12}" cy="${y+6}" r="2"/><circle cx="${x+26}" cy="${y+3}" r="2"/><circle cx="${x+40}" cy="${y}" r="2"/></g>`:''}<text x="${x+27}" y="${y-50}" text-anchor="middle" class="field-caption">${plough?'Pflügen & säen':kind==='well'?'Wasserloch graben':kind==='terrace'?'Terrasse anlegen':kind==='forest'?'Aufforsten':kind==='pasture'?'Weide pflegen':'Boden erholt sich'}</text>`;
 svg.append(g);effectTimer=setTimeout(()=>g.remove(),1700);
 }
 function harvestAnimation(){if(reduced()||!$('scene'))return;const svg=$('scene'),g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','harvest-glow');g.setAttribute('aria-hidden','true');g.innerHTML=Array.from({length:10},(_,i)=>`<g transform="translate(${247+i*55} ${ground(247+i*55)-20})"><text class="harvest-particle" style="animation-delay:${i*.035}s" text-anchor="middle">${s.lastYields[i]>0?'+'+s.lastYields[i]:'✦'}</text></g>`).join('');svg.append(g);setTimeout(()=>g.remove(),1700);}
 // Let the established handlers commit the action exactly once; decorate afterwards.
 document.addEventListener('click',e=>{const b=e.target.closest?.('[data-crop],[data-upgrade]');if(!b||b.disabled)return;fieldAction(selected,b.dataset.crop||b.dataset.upgrade);});
 const baseHarvest=$('harvest').onclick;
 $('harvest').onclick=()=>{if(busy||$('harvest').disabled)return;if(reduced())return baseHarvest();busy=true;document.querySelector('.app').inert=true;const button=$('harvest');button.disabled=true;const label=button.textContent;button.textContent='Ernte läuft …';$('landscapewrap')?.classList.add('harvesting');
 setTimeout(()=>{try{baseHarvest();harvestAnimation();}finally{busy=false;document.querySelector('.app').inert=false;$('landscapewrap')?.classList.remove('harvesting');if(button.textContent==='Ernte läuft …')button.textContent=label;const q=E.quote(s,plan);button.disabled=s.over||q.cost>s.money||q.work>E.labor(s)+.001||(typeof duo!=='undefined'&&duo?.finished);}},650);
 };
 const baseReport=showReport;
 showReport=function(report){baseReport(report);const title=$('dialogbody').querySelector('h2');if(title){const art=document.createElement('div');art.className='weather-story';art.setAttribute('aria-hidden','true');const rainy=/Regen/.test(report.weather)||report.weather==='Starkregen';art.innerHTML=rainy?'<svg viewBox="0 0 160 65"><path d="M35 33Q15 10 46 14Q63-7 83 14Q113 5 123 32Z"/><g class="rain-story"><path d="M42 42l-5 13m26-13l-5 13m26-13l-5 13m26-13l-5 13"/></g></svg>':'<svg viewBox="0 0 160 65"><g class="sun-story"><circle cx="80" cy="32" r="16"/><path d="M80 4v6m0 44v6M52 32h6m44 0h6M60 12l5 5m30 30l5 5M60 52l5-5m30-30l5-5"/></g></svg>';title.before(art);}};
 render();
})();
