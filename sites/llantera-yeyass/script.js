(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  if (window.lucide) window.lucide.createIcons();
  $('#year').textContent = String(new Date().getFullYear());

  const menuButton = $('.menu-button');
  const nav = $('#nav');
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    window.lucide?.createIcons();
  });
  $$('nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.innerHTML = '<i data-lucide="menu"></i>';
    window.lucide?.createIcons();
  }));

  const progress = $('.scroll-progress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, {passive:true});
  window.addEventListener('resize', updateProgress);
  updateProgress();

  const ring = $('.cursor-ring');
  if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    let x = -100, y = -100, renderX = -100, renderY = -100;
    document.addEventListener('pointermove', e => {
      x = e.clientX; y = e.clientY;
      ring.classList.add('is-visible');
      ring.classList.toggle('is-hover', !!e.target.closest('a, button, summary, input, select, textarea, label[for], [role=button], [role=link], [tabindex]:not([tabindex="-1"])'));
    });
    document.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    document.addEventListener('pointerup', () => ring.classList.remove('is-down'));
    document.addEventListener('pointercancel', () => ring.classList.remove('is-down'));
    document.addEventListener('pointerleave', () => ring.classList.remove('is-visible'));
    const animate = () => {
      renderX += (x - renderX) * .4;
      renderY += (y - renderY) * .4;
      ring.style.left = `${renderX}px`;
      ring.style.top = `${renderY}px`;
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    // White ring with difference blend mode auto-inverts against light/dark colored backgrounds.
  }

  const modal = $('#lightbox');
  const modalImg = $('#lightbox-image');
  let lastFocused = null;
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; lastFocused?.focus(); }
  $$('.gallery-img').forEach(button => button.addEventListener('click', () => {
    lastFocused = button;
    modalImg.src = button.dataset.full;
    modalImg.alt = $('img', button).alt;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('#close-lightbox').focus();
  }));
  $('#close-lightbox').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !modal.hidden) closeModal(); });
})();




// Move the full-width brick background noticeably UP as the visitor scrolls DOWN.
// The wall remains edge-to-edge while independent tire-print PNGs stay on top.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pending = false;
  const repaint = () => {
    const displacement = reducedMotion.matches ? 0 : -Math.min(window.scrollY * 0.24, 420);
    document.body.style.setProperty('--brick-drift', `${displacement}px`);
    pending = false;
  };
  const onScroll = () => {
    if (!pending) { pending = true; requestAnimationFrame(repaint); }
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll, {passive:true});
  reducedMotion.addEventListener?.('change', onScroll);
  repaint();
})();

// Custom translated-language UI: Google's official translation engine, our own selector.
window.googleTranslateElementInit = function () {
  if (!window.google?.translate?.TranslateElement) return;
  new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'en,es,zh-CN,hi,ar,bn,pt,ru,ja,fr,ur,id',autoDisplay:false}, 'google_translate_element');
  document.dispatchEvent(new Event('yeyass:translate-ready'));
};
(() => {
  const select=document.getElementById('site-language');
  const status=document.getElementById('language-status');
  const getNativeSelect=()=>document.querySelector('#google_translate_element select.goog-te-combo');
  function applyLanguage(lang){
    if(lang==='en'){
      const native=getNativeSelect();
      if(native){native.value='en';native.dispatchEvent(new Event('change',{bubbles:true}));}
      // When Google has translated the document, resetting its cookie and reloading
      // reliably restores English without leaving mixed-language DOM fragments.
      document.cookie='googtrans=/en/en;path=/';
      document.cookie='googtrans=/en/en;path=/;SameSite=Lax';
      if(document.documentElement.classList.contains('translated-ltr')||document.documentElement.classList.contains('translated-rtl')) location.reload();
      else status.textContent='English selected';
      return;
    }
    const native=getNativeSelect();
    if(native){native.value=lang;native.dispatchEvent(new Event('change',{bubbles:true}));status.textContent='Translating with Google Translate…';}
    else { status.textContent='Google Translate is loading. Check your connection and try again.'; }
  }
  select?.addEventListener('change',()=>applyLanguage(select.value));
  document.addEventListener('yeyass:translate-ready',()=>{
    const native=getNativeSelect();
    if(native && select?.value!=='en')applyLanguage(select.value);
  });
  // Google may inject a fixed top banner. Account for its actual height in sticky offsets.
  function bannerOffset(){
    const frames=[...document.querySelectorAll('iframe.goog-te-banner-frame, iframe.skiptranslate')];
    const frame=frames.find(el=>{let r=el.getBoundingClientRect();return r.width>300&&r.height>15&&r.top<80;});
    const height=frame?Math.round(frame.getBoundingClientRect().height):0;
    if(document.documentElement.style.getPropertyValue('--translate-banner-height')!==height+'px') document.documentElement.style.setProperty('--translate-banner-height',height+'px');
  }
  const obs=new MutationObserver(bannerOffset);
  obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize',bannerOffset,{passive:true});bannerOffset();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes=[...document.querySelectorAll('main section:not(.hero), main article, .section-heading, .feature-copy, .shop-heading, .gallery-img, .shop-picture, .language-card')];
  nodes.forEach((el,i)=>{if(el.closest('.lightbox'))return;el.classList.add('scroll-reveal');el.style.setProperty('--reveal-delay',((i%4)*65)+'ms');});
  if(reduced||!('IntersectionObserver' in window)){nodes.forEach(el=>el.classList.add('is-in-view'));return;}
  const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-in-view');io.unobserve(entry.target);}});},{threshold:0.06,rootMargin:'0px 0px -35px 0px'});
  nodes.forEach(el=>io.observe(el));
})();
