document.documentElement.classList.add('js-motion');
const button=document.getElementById('menuButton');const menu=document.getElementById('menu');button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')==='true';button.setAttribute('aria-expanded',String(!open));button.setAttribute('aria-label',open?'Open menu':'Close menu');menu.classList.toggle('open',!open)});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Open menu')}));

// Scroll reveal: opt into reduced-motion preferences; content remains visible if JS fails.
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const revealNodes=Array.from(document.querySelectorAll('.reveal'));
if (!reduceMotion.matches && 'IntersectionObserver' in window){
  revealNodes.forEach((node,index)=>node.style.setProperty('--reveal-delay',`${Math.min(index%3,2)*85}ms`));
  const observer=new IntersectionObserver((entries,obs)=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');obs.unobserve(entry.target)}});
  },{rootMargin:'0px 0px -6% 0px',threshold:.08});
  revealNodes.forEach(node=>observer.observe(node));
  // Force currently visible nodes into view immediately: avoids hidden content during initial load.
  requestAnimationFrame(()=>revealNodes.forEach(node=>{if(node.getBoundingClientRect().top<innerHeight*.95)node.classList.add('is-revealed')}));
}else{revealNodes.forEach(node=>node.classList.add('is-revealed'))}

// Custom cursor for precise mouse pointers. Screen difference blending ensures contrast.
const cursorEl=document.getElementById('customCursor');
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
if(cursorEl && finePointer.matches){
  const root=document.documentElement;
  root.classList.add('cursor-ready');
  let frame=0,lastX=-100,lastY=-100;
  function renderCursor(){cursorEl.style.transform=`translate3d(${lastX}px,${lastY}px,0) translate(-50%,-50%)`;frame=0}
  document.addEventListener('pointermove',ev=>{
    if(ev.pointerType && ev.pointerType!=='mouse')return;
    lastX=ev.clientX;lastY=ev.clientY;
    cursorEl.classList.add('is-visible');
    const interactive=ev.target.closest('a,button,[role="button"],input,select,textarea,summary');
    cursorEl.classList.toggle('is-interactive',Boolean(interactive));
    if(!frame)frame=requestAnimationFrame(renderCursor);
  },{passive:true});
  document.addEventListener('pointerdown',()=>cursorEl.classList.add('is-down'));
  document.addEventListener('pointerup',()=>cursorEl.classList.remove('is-down'));
  document.addEventListener('pointerleave',()=>cursorEl.classList.remove('is-visible'));
  document.addEventListener('pointerenter',()=>cursorEl.classList.add('is-visible'));
  window.addEventListener('blur',()=>cursorEl.classList.remove('is-visible'));
}


// Universal progressive entrance: animate major content, not layout-critical wrappers.
(() => {
  const selectors=['.site-header .logo','.site-header .menu a','.nav-call','.hero-content .eyebrow','.hero-content h1','.hero-content>p','.hero-content .actions','.trust-inner>*','.about-text>*','.image-panel','.review-heading .kicker','.review-heading h2','.review-heading .rating','.review-grid .review','.review-note','.cta-inner .kicker','.cta-inner h2','.cta-inner p','.cta-inner .btn','.location-grid>div:first-child>*','.map-frame','.contact-inner>*','.foot>*'];
  const items=[...new Set(selectors.flatMap(s=>[...document.querySelectorAll(s)]))];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced || !('IntersectionObserver' in window)) return;
  items.forEach((node,i)=>{node.classList.add('reveal-all');node.style.setProperty('--entry-delay',`${(i%3)*65}ms`)});
  const io=new IntersectionObserver((entries,observer)=>{for(const e of entries){if(e.isIntersecting){e.target.classList.add('is-visible-on-scroll');observer.unobserve(e.target)}}},{rootMargin:'0px 0px -25px 0px',threshold:.04});
  items.forEach(node=>io.observe(node));
  // Handle content visible on initial load, including file:// Safari.
  requestAnimationFrame(()=>items.forEach(node=>{if(node.getBoundingClientRect().top<innerHeight-15)node.classList.add('is-visible-on-scroll')}));
})();
