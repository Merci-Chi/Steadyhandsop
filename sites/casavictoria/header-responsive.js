/* Keep the Casa-Victoria header in one row at every width.
   Hide the entire bilingual quote first; only then collapse navigation to a menu. */
(()=>{
  'use strict';
  const header=document.querySelector('header.header');
  const inner=header?.querySelector('.header-inner');
  const identity=inner?.querySelector('.cv-header-identity');
  const navigation=inner?.querySelector('.nav');
  const language=inner?.querySelector('.language-control');
  const contact=inner?.querySelector('.header-contact-trigger');
  const menu=inner?.querySelector('.menu');
  if(!header||!inner||!identity||!navigation||!language||!contact||!menu)return;

  let scheduled=false;
  let updating=false;
  function fit(){
    scheduled=false;
    if(updating)return;
    updating=true;
    const narrow=window.matchMedia('(max-width:760px)').matches;
    if(narrow){
      header.dataset.cvHeaderMode='menu';
    }else{
      // Measure the real unwrapped, translated elements; flex-shrink is disabled
      // in CSS, so the sum reflects the space required rather than a compressed fit.
      header.dataset.cvHeaderMode='full';
      const style=getComputedStyle(inner);
      const width=inner.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0);
      const gap=parseFloat(style.columnGap)||0;
      const required=()=>identity.getBoundingClientRect().width+
        navigation.getBoundingClientRect().width+
        language.getBoundingClientRect().width+
        contact.getBoundingClientRect().width+3*gap;
      if(required()>width-4){
        header.dataset.cvHeaderMode='no-quote';
        if(required()>width-4)header.dataset.cvHeaderMode='menu';
      }
    }
    if(header.dataset.cvHeaderMode!=='menu'){
      navigation.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
    }
    updating=false;
  }
  function requestFit(){
    if(scheduled)return;
    scheduled=true;
    window.requestAnimationFrame(fit);
  }
  // Run once immediately, then track viewport/font/translation changes.
  fit();
  window.addEventListener('resize',requestFit,{passive:true});
  window.addEventListener('pageshow',requestFit);
  document.fonts?.ready.then(requestFit).catch(()=>{});
  if(typeof ResizeObserver==='function'){
    const observer=new ResizeObserver(()=>{if(!updating)requestFit();});
    observer.observe(inner);
  }
  // Google Translate changes labels and the translated tagline asynchronously.
  const observer=new MutationObserver(mutations=>{
    if(updating)return;
    if(mutations.some(m=>m.type==='characterData'||m.type==='childList'))requestFit();
  });
  observer.observe(navigation,{subtree:true,childList:true,characterData:true});
  const translation=identity.querySelector('.brand-tagline-translation');
  if(translation)observer.observe(translation,{subtree:true,childList:true,characterData:true});
})();
