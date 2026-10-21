(()=>{'use strict';
const selectors=['.section-heading','.feature','.highlight','.video-tile','.video-visual','.video-description','.inner-video-message','.review-card','.visit > *','.story-grid > *','.menu-card-dark','.menu-category > h2','.gallery-card','.board-grid > *','.page-hero > *','.teaser-images > *','.footer-head','.footer-bottom','.menu-tools','.video-note','.menu-disclaimer','.hero-copy > *','.hero-visual'];
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');let observer;
function add(root=document){if(reduce.matches||!('IntersectionObserver' in window))return;
if(!observer)observer=new IntersectionObserver(items=>{for(const item of items){if(item.isIntersecting){item.target.classList.add('kss-shown');observer.unobserve(item.target)}}},{threshold:.08,rootMargin:'0px 0px -35px 0px'});
const elements=new Set();for(const selector of selectors){if(root.matches?.(selector))elements.add(root);root.querySelectorAll?.(selector).forEach(el=>elements.add(el))}
let i=0;elements.forEach(el=>{if(el.classList.contains('kss-enter'))return;const r=el.getBoundingClientRect();if(r.top<window.innerHeight*.75&&r.bottom>0)return;el.classList.add('kss-enter');el.style.setProperty('--kss-delay',`${(i++%4)*65}ms`);observer.observe(el)})}
function init(){add();const host=document.querySelector('#menu-list');if(host){new MutationObserver(()=>add(host)).observe(host,{childList:true,subtree:true})}document.querySelectorAll('a,button').forEach(a=>{if(a.querySelector('.icon-arrow-up-right'))a.classList.add('has-icon-arrow')})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();