'use strict';
const header = document.getElementById('site-header');
const menuButton = document.getElementById('menu-button');
const mobileNav = document.getElementById('mobile-nav');
const links = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
function syncHeader(){header.classList.toggle('scrolled',window.scrollY>20)}
window.addEventListener('scroll',syncHeader,{passive:true}); syncHeader();
function closeMenu(){mobileNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open menu');menuButton.innerHTML='<i class="fa-solid fa-bars"></i>'}
menuButton.addEventListener('click',()=>{if(mobileNav.classList.contains('open')){closeMenu()}else{mobileNav.classList.add('open');menuButton.setAttribute('aria-expanded','true');menuButton.setAttribute('aria-label','Close menu');menuButton.innerHTML='<i class="fa-solid fa-xmark"></i>'}});
links.forEach(link=>link.addEventListener('click',closeMenu));
window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
const revealElements=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){const revealObserver=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}})},{threshold:.08,rootMargin:'0px 0px -25px 0px'});revealElements.forEach((el,i)=>{if(i<4)el.style.transitionDelay=`${i*90}ms`;revealObserver.observe(el)})}else{revealElements.forEach(el=>el.classList.add('visible'))}
const navSections=document.querySelectorAll('main section[id]');
if('IntersectionObserver' in window){const navObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){document.querySelectorAll('.desktop-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id))}})},{rootMargin:'-28% 0px -60% 0px'});navSections.forEach(s=>navObserver.observe(s))}
const form=document.getElementById('request-form');
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;const value=id=>document.getElementById(id).value.trim();const message=`Hello 49er Mobile RV Repair! My name is ${value('name')}. My RV/trailer is located in ${value('location')}. Vehicle: ${value('rv')||'Not specified'}. Issue: ${value('issue')}. Please let me know about appointment availability.`;const smsUrl=`sms:+15303505550?&body=${encodeURIComponent(message)}`;document.getElementById('form-hint').textContent='Opening your messaging app. If nothing happens, call (530) 350-5550.';window.location.href=smsUrl});
document.getElementById('year').textContent=new Date().getFullYear();

// Help Safari start the original muted hero video when autoplay is permitted.
const heroVideo = document.querySelector('.hero-video');
if (heroVideo) {
  heroVideo.muted = true;
  heroVideo.setAttribute('playsinline', '');
  const playVideo = () => heroVideo.play().catch(() => {});
  window.addEventListener('load', playVideo, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) heroVideo.pause();
    else playVideo();
  });
}
