(()=>{const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.navlinks');menu.addEventListener('click',()=>{let open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false')});b.classList.add('active');b.setAttribute('aria-pressed','true');document.querySelectorAll('.gallery-item').forEach(x=>x.classList.toggle('hidden',b.dataset.filter!=='all'&&x.dataset.category!==b.dataset.filter))}));const lightbox=document.getElementById('lightbox'),photo=lightbox.querySelector('img'),caption=lightbox.querySelector('.lightbox-caption'),close=lightbox.querySelector('.lightbox-close');let previous=null;const hide=()=>{lightbox.classList.remove('open');lightbox.setAttribute('aria-hidden','true');photo.src='';document.body.style.overflow='';previous?.focus()};document.querySelectorAll('.gallery-open').forEach(b=>b.addEventListener('click',()=>{previous=b;photo.src=b.dataset.src;photo.alt=b.dataset.caption;caption.textContent=b.dataset.caption;lightbox.classList.add('open');lightbox.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus()}));close.addEventListener('click',hide);lightbox.addEventListener('click',e=>{if(e.target===lightbox)hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&lightbox.classList.contains('open'))hide()});// Staggered scroll reveal, accessible with reduced-motion support.
if('IntersectionObserver' in window && document.documentElement.classList.contains('js-motion')){
 const revealObserver=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}})},{threshold:0.08,rootMargin:'0px 0px -22px 0px'});
 document.querySelectorAll('.reveal').forEach((element,index)=>{element.style.setProperty('--reveal-delay',`${(index%4)*75}ms`);revealObserver.observe(element)});
 // When a filtered image comes back into view, keep its entrance state correct.
}
// Reveal headings, descriptions, labels and button copy individually on scroll.
// Avoid links inside fixed header and hidden modal, and never rewrite text content.
if ('IntersectionObserver' in window && document.documentElement.classList.contains('js-motion')) {
  const textSelector = [
    '.hero-content .eyebrow', '.hero-content h1', '.hero-content > p', '.hero-content .actions', '.hero-foot',
    '.intro-grid h2', '.intro-grid p',
    '.section-head .eyebrow', '.section-head h2', '.section-head p',
    '.service-card h3', '.service-card p', '.service-note',
    '.about-content .eyebrow', '.about-content h2', '.about-content > p', '.about-content .text-link', '.about-quote',
    '.gallery-heading .eyebrow', '.gallery-heading h2', '.gallery-heading p',
    '.feature .eyebrow', '.feature h2', '.feature p', '.feature .btn',
    '.visit-info h3', '.info-row .mini-label', '.info-row p', '.info-row .hours',
    '.footer-main h3', '.footer-main p', '.footer-main a:not(.footer-logo)', '.footer-bottom',
    '.gallery-caption', '.filter'
  ].join(',');
  const targets = [...new Set(document.querySelectorAll(textSelector))];
  const textObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('text-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -10px 0px' });
  targets.forEach((el, i) => {
    el.classList.add('text-rise');
    // Delay relative to other text in its own section, not the entire page.
    const section = el.closest('section, footer, .intro-grid') || document.body;
    const siblings = targets.filter(item => (item.closest('section, footer, .intro-grid') || document.body) === section);
    const order = siblings.indexOf(el);
    el.style.setProperty('--text-delay', `${Math.min(order % 5, 4) * 95}ms`);
    textObserver.observe(el);
  });
}
document.getElementById('year').textContent=new Date().getFullYear()})();