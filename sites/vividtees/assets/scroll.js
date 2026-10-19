/* Scroll enhancements without changing native scrolling or touch gestures. */
(function () {
  'use strict';
  const main=document.querySelector('main');if(!main)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width:650px)');
  const sections=Array.from(main.children).filter(el=>el.matches('section,.process'));
  const intro=sections[0];
  function labelFor(section) {
    if(section.classList.contains('process'))return 'How it works';
    if(section.classList.contains('cta-band'))return 'Let’s create';
    if(section.querySelector('.service-grid'))return 'What we make';
    if(section.querySelector('#full-gallery'))return 'Explore projects';
    if(section.querySelector('.curated-gallery'))return 'Project inspiration';
    if(section.querySelector('.feature-split'))return 'The details';
    if(section.querySelector('.detail-grid'))return 'The possibilities';
    if(section.querySelector('.faq-layout'))return 'Your questions';
    if(section.querySelector('.quote-form'))return 'Your project';
    if(section.querySelector('.social-grid'))return 'Watch & explore';
    if(section.querySelector('.about-split'))return 'Meet Vivid';
    if(section.querySelector('a[href="social.html"]'))return 'More from Vivid';
    const h=section.querySelector('h2');return h ? h.innerText.replace(/\s+/g,' ').trim().slice(0,25) : null;
  }
  const chapters=[];
  sections.forEach((section,index)=>{
    if(section===intro)return;
    const label=labelFor(section);if(!label)return;
    if(!section.id)section.id='vivid-section-'+index;
    section.classList.add('chapter-target');chapters.push({section,label});
  });
  let nav=null;
  if(intro&&chapters.length>1){
    nav=document.createElement('nav');nav.className='scroll-nav';nav.setAttribute('aria-label','On this page');
    const inner=document.createElement('div');inner.className='container chapter-inner';
    const prompt=document.createElement('span');prompt.className='chapter-label';prompt.textContent='Explore';inner.appendChild(prompt);
    chapters.forEach(chapter=>{
      const link=document.createElement('a');link.className='chapter-link';link.href='#'+chapter.section.id;link.textContent=chapter.label;inner.appendChild(link);chapter.link=link;
      link.addEventListener('click',()=>{
        chapters.forEach(c=>c.link.removeAttribute('aria-current'));link.setAttribute('aria-current','location');
      });
    });
    nav.appendChild(inner);intro.insertAdjacentElement('afterend',nav);
  }
  // Every card pops on entry, then re-arms only once well outside the viewport.
  // The wider exit boundary avoids flicker when a card sits near the screen edge.
  let revealObserver=null;
  if('IntersectionObserver' in window){
    const animations=new WeakMap(),pendingTimers=new WeakMap(),observed=new Set();
    const cardSelector='.service-card,.project,.detail-card,.values-grid>div,.social-card,.service-option,.contact-aside,.contact-method,.contact-brand-art,.hero-miniatures a,.brand-banner,.steps>div,.quote-form,.feature-image,.about-picture';
    const revealSelector=cardSelector+',.feature-image,.about-picture,.section-heading,.feature-copy,.about-copy,.quote-form';
    const supportsAnimation=typeof Element.prototype.animate==='function';
    if(!supportsAnimation)document.documentElement.classList.add('no-card-waapi');
    function stopAnimation(el){
      const animation=animations.get(el);if(animation){animation.cancel();animations.delete(el);}
      const timer=pendingTimers.get(el);if(timer){clearTimeout(timer);pendingTimers.delete(el);}
      el.classList.remove('is-popping');
    }
    function reveal(el,immediate=false){
      if(immediate){stopAnimation(el);el.classList.add('is-revealed');return;}
      if(el.classList.contains('is-revealed'))return;
      el.classList.add('is-revealed');
      if(immediate||reduced.matches||!el.classList.contains('vivid-card')||!supportsAnimation)return;
      stopAnimation(el);el.classList.add('is-popping');
      const compact=window.innerWidth<=650;
      const delay=Number(el.dataset.popDelay||0);
      const restingShadow=getComputedStyle(el).boxShadow;
      const animation=el.animate([
        {opacity:0,transform:'perspective(1000px) translate3d(0,'+(compact?46:74)+'px,0) scale('+(compact?'.91':'.87')+') rotateX(7deg)',filter:'blur(3px)',boxShadow:'0 0 0 rgba(255,50,190,0)',offset:0},
        {opacity:1,transform:'perspective(1000px) translate3d(0,-7px,0) scale(1.025) rotateX(0deg)',filter:'blur(0px)',boxShadow:'0 0 35px rgba(255,50,190,.32),0 16px 45px rgba(0,0,0,.28)',offset:.68},
        {opacity:1,transform:'perspective(1000px) translate3d(0,2px,0) scale(.997) rotateX(0deg)',filter:'blur(0px)',boxShadow:'0 0 18px rgba(171,79,255,.16)',offset:.86},
        {opacity:1,transform:'translate3d(0,0,0) scale(1)',filter:'blur(0px)',boxShadow:restingShadow,offset:1}
      ],{duration:compact?680:800,delay,easing:'cubic-bezier(.18,.65,.25,1)',fill:'both'});
      animations.set(el,animation);
      animation.onfinish=()=>{
        if(animations.get(el)!==animation)return;
        animation.cancel();animations.delete(el);el.classList.remove('is-popping');
      };
    }
    revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting)reveal(entry.target);});
    },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
    const resetObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const el=entry.target;
        if(!entry.isIntersecting&&!reduced.matches&&!el.contains(document.activeElement)){
          stopAnimation(el);el.classList.remove('is-revealed');
        }
      });
    },{threshold:0,rootMargin:'160px 0px 160px 0px'});
    function observeNew(root){
      const nodes=[];
      if(root.nodeType===1&&root.matches(revealSelector))nodes.push(root);
      if(root.querySelectorAll)nodes.push(...root.querySelectorAll(revealSelector));
      nodes.forEach(el=>{
        if(observed.has(el))return;
        observed.add(el);el.classList.add('scroll-reveal');
        const isCard=el.matches(cardSelector);
        if(isCard)el.classList.add('vivid-card');
        const siblings=el.parentElement?Array.from(el.parentElement.children).filter(sibling=>sibling.matches(revealSelector)):[];
        const index=Math.max(0,siblings.indexOf(el));
        el.dataset.popDelay=String((index%(window.innerWidth<=650?2:3))*85);
        el.style.setProperty('--reveal-delay',isCard?'0ms':(index%3)*65+'ms');
        if(reduced.matches)el.classList.add('is-revealed');
        revealObserver.observe(el);resetObserver.observe(el);
      });
    }
    function stopObserving(root){
      if(root.nodeType!==1)return;
      const nodes=[root,...root.querySelectorAll('.scroll-reveal')];
      nodes.forEach(el=>{
        if(!observed.has(el))return;
        stopAnimation(el);revealObserver.unobserve(el);resetObserver.unobserve(el);observed.delete(el);
      });
    }
    observeNew(main);document.documentElement.classList.add('scroll-enhanced');
    const mutationObserver=new MutationObserver(records=>records.forEach(record=>{
      record.removedNodes.forEach(stopObserving);
      record.addedNodes.forEach(node=>{if(node.nodeType===1&&!node.closest('.scroll-nav'))observeNew(node);});
    }));
    mutationObserver.observe(main,{childList:true,subtree:true});
    main.addEventListener('focusin',event=>{
      const el=event.target.closest('.scroll-reveal');if(el)reveal(el,true);
    });
    if(reduced.addEventListener)reduced.addEventListener('change',()=>{
      observed.forEach(el=>{
        stopAnimation(el);
        if(reduced.matches)el.classList.add('is-revealed');
        else if(el.getBoundingClientRect().top>window.innerHeight+160||el.getBoundingClientRect().bottom< -160)el.classList.remove('is-revealed');
      });
    });
  }
  const process=document.querySelector('.process');
  const steps=Array.from(document.querySelectorAll('.steps>div'));
  const heroArt=document.querySelector('.hero-art');
  const quick=document.createElement('nav');quick.className='mobile-quick';quick.setAttribute('aria-label','Quick actions');
  const work=document.createElement('a');work.href='gallery.html';work.textContent='Explore our work';
  const contact=document.createElement('a');contact.href='contact.html';contact.innerHTML='Start a project <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  quick.append(work,contact);document.body.appendChild(quick);
  let queued=false,focusedField=false;
  function update(){
    queued=false;
    document.documentElement.classList.toggle('has-scrolled',window.scrollY>35);
    const vh=window.innerHeight;
    if(chapters.length){
      let current=null;
      const line=mobile.matches?180:210;
      chapters.forEach(chapter=>{if(chapter.section.getBoundingClientRect().top<=line)current=chapter;});
      chapters.forEach(chapter=>{
        if(!chapter.link)return;
        if(chapter===current)chapter.link.setAttribute('aria-current','location');else chapter.link.removeAttribute('aria-current');
      });
    }
    if(process){
      const rect=process.getBoundingClientRect();
      const amount=Math.max(0,Math.min(1,(vh*.65-rect.top)/Math.max(1,rect.height-vh*.15)));
      process.style.setProperty('--process-progress',String(amount));
      let active=steps[0];
      steps.forEach(step=>{if(step.getBoundingClientRect().top<vh*.65)active=step;});
      steps.forEach(step=>step.classList.toggle('active-step',step===active));
    }
    if(heroArt){
      if(!reduced.matches&&!mobile.matches){
        const offset=Math.min(window.scrollY,700)*.045;
        heroArt.style.transform='translate3d(0,'+offset.toFixed(1)+'px,0)';
      }else heroArt.style.transform='';
    }
    const isContact=location.pathname.endsWith('/contact.html')||location.pathname==='contact.html';
    quick.classList.toggle('visible',mobile.matches&&window.scrollY>350&&!focusedField&&!isContact&&!document.querySelector('dialog[open]'));
  }
  function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('focusin',event=>{focusedField=Boolean(event.target.closest('input,textarea,select'));schedule();});
  document.addEventListener('focusout',()=>{focusedField=false;schedule();});
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.addEventListener('close',schedule);
    const observer=new MutationObserver(schedule);observer.observe(dialog,{attributes:true,attributeFilter:['open']});
  });
  if(mobile.addEventListener)mobile.addEventListener('change',schedule);
  if(reduced.addEventListener)reduced.addEventListener('change',schedule);
  update();
})();
