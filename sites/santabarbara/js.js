'use strict';
(() => {
 const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
 const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
 const menuButton = document.querySelector('.menu-toggle');
 const mobileNav = document.querySelector('#mobile-nav');
 const desktop = window.matchMedia('(min-width: 851px)');
 function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  mobileNav.hidden = true;
  if (returnFocus) menuButton.focus();
 }
 menuButton.addEventListener('click', () => {
  const opening = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(opening));
  menuButton.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  mobileNav.hidden = !opening;
 });
 mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
 document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
 });
 desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
 });
 document.querySelector('#year').textContent = new Date().getFullYear();
 // Stagger individual content, including nested text, images and SVG icons.
 if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (entry.isIntersecting) {
     entry.target.classList.add('is-visible');
     observer.unobserve(entry.target);
    }
   });
  }, { threshold: 0.04, rootMargin: '0px 0px -12px 0px' });
  const elements = document.querySelectorAll('.site-header .brand, .site-header nav a, .header-call, .menu-toggle, main h1, main h2, main h3, main p, main a, main button, main figure, main img, main svg, main figcaption, main summary, main .material-number, main .swatch-stack, main .hero-location, main .location-tag, main .contact-label, main .visit-stamp, main .expand-control, main .rating-stars, main .rating-score, main .rating-source, main .rating-score strong, .site-footer > *, .site-footer a, .site-footer button, .site-footer small');
  elements.forEach((element, i) => {
   element.classList.add('reveal');
   element.style.setProperty('--delay', `${(i % 3) * 55}ms`);
   observer.observe(element);
  });
  motion.addEventListener('change', event => {
   if (event.matches) {
    elements.forEach(element => element.classList.add('is-visible'));
    observer.disconnect();
   }
  });
 }
 // A white difference-blended circle becomes dark over light surfaces.
 const cursor = document.querySelector('.cursor');
 let pointerX = 0, pointerY = 0, x = 0, y = 0, running = false, frame = 0;
 const clickable = 'a, button, summary, input, textarea, select, [role="button"]';
 function canUseCursor() { return fine.matches && !motion.matches; }
 function stopCursor() {
  running = false;
  cancelAnimationFrame(frame);
  document.documentElement.classList.remove('cursor-active');
 }
 function animateCursor() {
  if (!running) return;
  x += (pointerX - x) * 0.45;
  y += (pointerY - y) * 0.45;
  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  if (Math.abs(x - pointerX) + Math.abs(y - pointerY) > 0.1) frame = requestAnimationFrame(animateCursor);
  else running = false;
 }
 document.addEventListener('pointermove', event => {
  if (!canUseCursor() || event.pointerType !== 'mouse') { stopCursor(); return; }
  pointerX = event.clientX; pointerY = event.clientY;
  if (!document.documentElement.classList.contains('cursor-active')) {
   x = pointerX; y = pointerY;
   document.documentElement.classList.add('cursor-active');
  }
  cursor.classList.toggle('is-clickable', !!event.target.closest(clickable));
  if (!running) { running = true; animateCursor(); }
 }, {passive:true});
 document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'), {passive:true});
 document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'), {passive:true});
 document.addEventListener('pointerout', event => { if (!event.relatedTarget) stopCursor(); });
 window.addEventListener('blur', stopCursor);
 document.addEventListener('keydown', event => { if (event.key === 'Tab') stopCursor(); });
 fine.addEventListener('change', stopCursor); motion.addEventListener('change', stopCursor);
 // Native dialogs provide focus containment, Escape and accessible names.
 const photoDialog = document.querySelector('#photo-dialog');
 const creditsDialog = document.querySelector('#credits-dialog');
 function show(dialog) {
  if (typeof dialog.showModal === 'function') {
   dialog.appendChild(cursor);
   dialog.showModal(); document.body.classList.add('dialog-open');
  } else dialog.setAttribute('open', '');
 }
 document.querySelector('.image-expand')?.addEventListener('click', () => {
  const view = document.querySelector('#photo-view');
  if (!view.firstChild) {
   const image = document.createElement('img');
   image.src = 'assets/upholstered-sofa.webp';
   image.alt = 'Expanded stock inspiration photo of a green upholstered sofa; not the company’s work.';
   view.appendChild(image);
  }
  show(photoDialog);
 });
 document.querySelector('.credits-open').addEventListener('click', () => show(creditsDialog));
 [photoDialog, creditsDialog].forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); document.body.appendChild(cursor); });
  dialog.addEventListener('click', event => {
   if (event.target !== dialog) return;
   const rect = dialog.getBoundingClientRect();
   if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
 });
 // Reflect the section currently in view in desktop navigation.
 if ('IntersectionObserver' in window) {
  const navLinks = document.querySelectorAll('.desktop-nav a');
  const sectionObserver = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => {
     if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
     else link.removeAttribute('aria-current');
    });
   });
  }, { rootMargin:'-20% 0px -60% 0px', threshold:0 });
  document.querySelectorAll('main section[id]').forEach(section => sectionObserver.observe(section));
 }
})();

(()=>{const slides=[...document.querySelectorAll('.cover-slide')];if(slides.length<2)return;let current=0;const motion=matchMedia('(prefers-reduced-motion: reduce)');let timer=null;function stop(){clearInterval(timer);}if(!motion.matches)timer=setInterval(()=>{slides[current].classList.remove('active');current=(current+1)%slides.length;slides[current].classList.add('active');},5500);motion.addEventListener('change',e=>{if(e.matches)stop();});})();

(()=>{
 const tabs=[...document.querySelectorAll('[data-material]')];
 const panel=document.querySelector('#material-panel');if(!panel)return;
 const sets={fabrics:[[5,'Fabrics','Explore fabrics and upholstery materials.'],[6,'Automotive Materials','Material details for your next project.'],[23,'Leather','Explore textures and finishes.']],leather:[[23,'Leather','Explore textures and finishes.'],[21,'Boat Upholstery','A closer look at the details.'],[20,'Automotive Upholstery','Explore the gallery.']],starlights:[[12,'Starlight Headliners','Explore fiber optic starlight details.'],[11,'Fiber Optic Details','A closer look at starlight materials.'],[16,'Headliner Details','Explore the gallery.']]};
 function activate(tab){
  tabs.forEach(t=>{const active=t===tab;t.classList.toggle('selected',active);t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;});
  panel.setAttribute('aria-labelledby',tab.id);
  panel.querySelectorAll('.mock-card').forEach((card,i)=>{const [n,title,description]=sets[tab.dataset.material][i];const image=card.querySelector('img');image.src=`assets/company-${String(n).padStart(2,'0')}.webp`;image.alt=title;card.querySelector('h3').textContent=title;card.querySelector('p').textContent=description;});
 }
 activate(tabs.find(tab=>tab.dataset.material==='starlights'));
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();tabs[n].focus({preventScroll:true});activate(tabs[n]);});});
})();

(()=>{const dialog=document.querySelector('#directions-dialog');let trigger;
 document.querySelectorAll('[data-directions]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();trigger=link;dialog.appendChild(document.querySelector('.cursor'));dialog.showModal();}));
 dialog.querySelector('.directions-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.appendChild(document.querySelector('.cursor'));trigger?.focus({preventScroll:true});});
 dialog.querySelector('#copy-address').addEventListener('click',async()=>{const address='3319 E Charleston Blvd, Las Vegas, NV 89104';const field=dialog.querySelector('#address-copy-field');const status=dialog.querySelector('#copy-status');try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(address);}else{field.hidden=false;field.focus({preventScroll:true});field.select();if(!document.execCommand('copy'))throw new Error('copy');field.hidden=true;}status.textContent='Address copied.';}catch{field.hidden=false;field.focus({preventScroll:true});field.select();status.textContent='Select and copy the address below.';}});
})();
