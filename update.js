'use strict';
(function(){
const BUILD=7;const badge=document.createElement('span');badge.id='buildbadge';badge.style.cssText='display:block;padding:12px 0;color:#b9d7a4;font:11px monospace;line-height:1.7';document.querySelector('.topline').after(badge);
const previous=render;render=function(){previous();const adults=s.people.filter(p=>p.age>=16).length,children=s.people.length-adults;badge.textContent='UPDATE '+BUILD+' · '+adults+' Erwachsene · '+children+' Kinder · Bedarf '+E.need(s)+'/Jahr · Nahrung 1 G';};
const button=document.createElement('button');button.textContent='Spiel aktualisieren ↻';button.style.cssText='display:block;margin:8px 0 14px;padding:8px 14px;color:#c6dba9';document.querySelector('.bottom').after(button);
button.onclick=async()=>{button.disabled=true;button.textContent='Aktualisiere …';try{if('serviceWorker'in navigator){const r=await navigator.serviceWorker.getRegistration();if(r)await r.update();}if('caches'in window){const names=await caches.keys();await Promise.all(names.filter(k=>k.startsWith('nordafrika-')).map(k=>caches.delete(k)));}}catch{}const url=new URL('play.html',location.href);url.searchParams.set('update',Date.now());location.replace(url.href);};
async function check(){if(!navigator.onLine)return;try{const r=await fetch('release.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const release=await r.json();if(release.build>BUILD){button.textContent='Neues Update verfügbar – jetzt laden ↻';button.style.borderColor='#f0de81';}}catch{}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});render();check();
})();
