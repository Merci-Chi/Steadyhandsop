"use strict";
const toggle=document.querySelector('.menu-toggle');
const menu=document.getElementById('mobile-nav');
function setMenu(open){if(!toggle||!menu)return;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close menu':'Open menu');menu.hidden=!open;toggle.classList.toggle('is-open',open)}
if(toggle&&menu){toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});window.addEventListener('resize',()=>{if(window.innerWidth>1024)setMenu(false)})}
// Scroll entrances: each content element gets its own observer and entrance delay.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const motionSelectors=['.header .brand','.desktop-nav a','.header-cta','.menu-toggle','.hero .eyebrow','.hero h1','.hero-description','.hero-actions .btn','.hero-edge span','.ticker','.about .eyebrow','.about h2','.about-copy > p:not(.eyebrow)','.about .text-link','.about-image','.selection .eyebrow','.section-top h2','.section-top > p','.product-card','.stock-note','.break-content .eyebrow','.break-content h2','.break-content .btn','.visit-intro .eyebrow','.visit h2','.visit-intro > p:not(.eyebrow)','.visit-details > div','.visit-buttons .btn','.map-panel','.closing .eyebrow','.closing h2','.closing .btn','.footer > div','.footer-disclaimer'];
const targets=[...new Set(motionSelectors.flatMap(s=>Array.from(document.querySelectorAll(s))))];
function revealAll(){targets.forEach(el=>el.classList.add('is-visible'))}
if(!reducedMotion.matches&&'IntersectionObserver' in window){
 document.documentElement.classList.add('js-motion');
 targets.forEach((el,i)=>{el.classList.add('reveal');const siblings=el.parentElement?Array.from(el.parentElement.children).filter(n=>targets.includes(n)):[];let position=siblings.indexOf(el);el.style.setProperty('--reveal-delay',Math.min(Math.max(position,0)*95,390)+'ms');if(el.matches('.about-image,.map-panel'))el.classList.add('reveal-right');else if(el.matches('.product-card'))el.classList.add('reveal-scale');else if(el.matches('.about-copy > *, .visit-intro > *'))el.classList.add('reveal-left')});
 const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{rootMargin:'0px 0px -45px 0px',threshold:.08});targets.forEach(el=>observer.observe(el));
 // Avoid invisible content in print or tab restoration.
 window.addEventListener('beforeprint',revealAll);reducedMotion.addEventListener('change',e=>{if(e.matches)revealAll()});
}else{revealAll()}
// Automatic light/dark inversion: mix-blend-mode:difference keeps the cursor visible over both.
const cursor=document.querySelector('.custom-cursor');
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
let hasMoved=false;
function moveCursor(e){if(!finePointer.matches||reducedMotion.matches)return;cursor.style.transform=`translate3d(${e.clientX}px,${e.clientY}px,0) translate(-50%,-50%)`;if(!hasMoved){hasMoved=true;cursor.classList.add('is-visible');document.body.classList.add('has-custom-cursor')}const interactive=!!e.target.closest('a,button,[role="button"],summary,input,select,textarea,label');cursor.classList.toggle('is-hovered',interactive)}
document.addEventListener('pointermove',moveCursor,{passive:true});
document.addEventListener('pointerdown',()=>cursor.classList.add('is-pressed'));
document.addEventListener('pointerup',()=>cursor.classList.remove('is-pressed'));
document.addEventListener('pointerleave',()=>cursor.classList.add('is-hidden'));
document.addEventListener('pointerenter',()=>cursor.classList.remove('is-hidden'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)cursor.classList.add('is-hidden');else cursor.classList.remove('is-hidden')});
finePointer.addEventListener('change',()=>{if(!finePointer.matches){document.body.classList.remove('has-custom-cursor');cursor.classList.remove('is-visible')}});
// Keep native cursor on interactive embedded map since it runs in a separate document.
const map=document.querySelector('.map-panel iframe');if(map){map.addEventListener('mouseenter',()=>{cursor.classList.add('is-hidden');document.body.classList.remove('has-custom-cursor')});map.addEventListener('mouseleave',()=>{cursor.classList.remove('is-hidden');if(hasMoved&&finePointer.matches)document.body.classList.add('has-custom-cursor')})}
