const menu=document.querySelector('.menu-toggle');const nav=document.querySelector('#navigation');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close menu':'Open menu')});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));document.querySelector('#year').textContent=new Date().getFullYear();const lightbox=document.querySelector('#lightbox');const lightboxImg=lightbox.querySelector('img');const lightboxCaption=lightbox.querySelector('.lightbox-caption');let previousFocus;function closeLightbox(){lightbox.hidden=true;document.body.classList.remove('no-scroll');previousFocus?.focus()}document.querySelectorAll('.gallery-item').forEach(item=>item.addEventListener('click',()=>{previousFocus=document.activeElement;lightboxImg.src=item.dataset.full;lightboxImg.alt=item.querySelector('img').alt;lightboxCaption.textContent=item.dataset.caption;lightbox.hidden=false;document.body.classList.add('no-scroll');lightbox.querySelector('.lightbox-close').focus()}));lightbox.querySelector('.lightbox-close').addEventListener('click',closeLightbox);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeLightbox()});
// Free, open-source Lucide icon set, loaded through a pinned CDN version.
if (window.lucide && typeof window.lucide.createIcons === 'function') {
  window.lucide.createIcons({attrs:{'stroke-width':1.8}});
}
// Reveal section content as it enters view, while keeping everything visible
// on browsers without IntersectionObserver or reduced-motion preference.
(function initScrollReveals(){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const selectors=['.hero-copy > *','.hero-visual','.intro-heading','.intro-copy','.section-heading','.service-card','.service-disclaimer','.feature-photo','.feature-copy','.gallery-item','.gallery-note','.faq > div:first-child','.faq-list details','.contact-image','.contact-content > *','.footer-main > *'];
  const items=[...document.querySelectorAll(selectors.join(','))];
  if(!items.length)return;
  items.forEach((el,i)=>{el.classList.add('reveal');if(el.classList.contains('service-card')||el.classList.contains('gallery-item'))el.style.setProperty('--reveal-delay',(i%3)*95+'ms')});
  document.body.classList.add('motion-ready');
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
  }),{threshold:.08,rootMargin:'0px 0px -20px 0px'});
  items.forEach(el=>observer.observe(el));
})();

// Individual text elements rise into view without delaying important content.
(function(){
 if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const textNodes=[...document.querySelectorAll('h1,h2,h3,h4,.hero-copy p,.intro p,.section-heading p,.service-info p,.feature-copy p,.faq-intro,.faq-list details p,.contact-content p,.contact-row,.review-feature p,.review-note,.social-note,.social-card span,.footer p')];
 const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}}},{threshold:.08,rootMargin:'0px 0px -12px 0px'});
 textNodes.forEach((el,i)=>{el.classList.add('reveal-text');el.style.setProperty('--text-delay',((i%3)*65)+'ms');observer.observe(el)});
})();
