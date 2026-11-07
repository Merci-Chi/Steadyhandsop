/* Custom dropdown for Google Translate (English is the original language). */
(function(){
  'use strict';
  const control=document.getElementById('language-control');
  if(!control)return;
  const trigger=document.getElementById('language-trigger');
  const menu=document.getElementById('language-menu');
  const more=document.getElementById('language-more');
  const moreOptions=document.getElementById('language-more-options');
  const status=document.getElementById('language-status');
  const original=document.getElementById('translation-show-original');
  const spacer=document.getElementById('translation-banner-space');
  let loading=null;
  let currentLang='en';
  const cookieName='googtrans';
  function getCookie(){const found=document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);return found?decodeURIComponent(found[1]):''}
  function selectedFromCookie(){const match=getCookie().match(/^\/en\/([^/]+)$/);return match?match[1]:'en'}
  function setCookie(value){
    // Path-rooted cookie is shared between gallery.html and index.html on hosted sites.
    document.cookie=cookieName+'='+encodeURIComponent(value)+';path=/;SameSite=Lax';
    // On file:// URLs cookies and Google translation may not work in Safari.
  }
  function updateSelected(lang){
    currentLang=lang;
    control.querySelectorAll('.language-option').forEach(item=>{
      const active=item.dataset.lang===lang;
      item.classList.toggle('selected',active);
      item.setAttribute('aria-pressed',String(active));
    });
    document.documentElement.setAttribute('data-language',lang);
    if(lang!=='en'){
      const match=control.querySelector('.language-option[data-lang="'+lang+'"]');
      if(match&&match.closest('#language-more-options')){
        moreOptions.hidden=false;
        more.setAttribute('aria-expanded','true');
      }
    }
  }
  function toggleMenu(open){menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)status.textContent=''}
  trigger.addEventListener('click',()=>toggleMenu(menu.hidden));
  more.addEventListener('click',()=>{moreOptions.hidden=!moreOptions.hidden;more.setAttribute('aria-expanded',String(!moreOptions.hidden))});
  document.addEventListener('click',e=>{if(!control.contains(e.target))toggleMenu(false)});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&!menu.hidden){toggleMenu(false);trigger.focus()}
  });
  function loadGoogle(){
    if(window.google&&window.google.translate&&document.querySelector('select.goog-te-combo'))return Promise.resolve();
    if(loading)return loading;
    loading=new Promise((resolve,reject)=>{
      const previous=window.googleTranslateElementInit;
      window.googleTranslateElementInit=()=>{
        try{
          new window.google.translate.TranslateElement({pageLanguage:'en',autoDisplay:true,layout:window.google.translate.TranslateElement.InlineLayout.SIMPLE},'google_translate_element');
          if(typeof previous==='function')previous();
          resolve();
        }catch(error){reject(error)}
      };
      const script=document.createElement('script');
      script.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async=true;
      script.onerror=()=>reject(new Error('Translation service could not be loaded'));
      document.head.appendChild(script);
    });
    return loading;
  }
  function changeGoogleLanguage(lang){
    const select=document.querySelector('select.goog-te-combo');
    if(!select)return false;
    const option=[...select.options].find(o=>o.value===lang);
    if(!option)return false;
    select.value=lang;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    return true;
  }
  function visibleHeight(element){
    if(!element)return 0;
    const computed=getComputedStyle(element);
    if(computed.display==='none'||computed.visibility==='hidden')return 0;
    const bounds=element.getBoundingClientRect();
    return bounds.width>50 && bounds.height>8 && bounds.bottom>0 ? Math.ceil(Math.min(bounds.height,bounds.bottom)) : 0;
  }
  function nativeBannerHeight(){
    // Google Translate uses different banner wrappers across browsers / releases.
    const selectors=[
      'iframe.goog-te-banner-frame',
      '.goog-te-banner-frame',
      '.VIpgJd-ZVi9od-ORHb-OEVmcd',
      'iframe[id^="\:1.container"]',
      'iframe[src*="translate.google.com"][src*="banner"]'
    ];
    let height=0;
    for(const selector of selectors){
      for(const el of document.querySelectorAll(selector)){
        height=Math.max(height,visibleHeight(el));
        // Some Google iframe banners have a zero-height iframe nested in a 40px wrapper.
        if(el.tagName==='IFRAME')height=Math.max(height,visibleHeight(el.parentElement));
      }
    }
    // Google also applies a top offset to BODY when it displays the native banner.
    const bodyOffset=parseFloat(getComputedStyle(document.body).top)||0;
    if(bodyOffset>8 && bodyOffset<130)height=Math.max(height,Math.ceil(bodyOffset));
    return Math.min(height,100);
  }
  let lastBannerHeight=-1;
  function syncBanner(){
    const height=nativeBannerHeight();
    if(height!==lastBannerHeight){
      lastBannerHeight=height;
      document.documentElement.style.setProperty('--google-banner-height',height+'px');
      document.body.classList.toggle('google-banner-active',height>0);
    }
    // Never add a second custom translation bar above the native Google one.
    spacer.hidden=height>0 || currentLang==='en';
  }
  function switchToEnglish(){
    setCookie('/en/en');
    updateSelected('en');
    spacer.hidden=true;
    status.textContent='';
    // Restore the original unmodified page reliably; Google Translate does not always undo via select.
    const url=new URL(window.location.href);window.location.assign(url.href);
  }
  original.addEventListener('click',switchToEnglish);
  control.querySelectorAll('.language-option').forEach(item=>item.addEventListener('click',async()=>{
    const lang=item.dataset.lang;
    toggleMenu(false);
    if(lang==='en'){
      if(currentLang==='en')return;
      switchToEnglish();return;
    }
    updateSelected(lang);
    setCookie('/en/'+lang);
    syncBanner();
    trigger.disabled=true;
    try{
      await loadGoogle();
      let ok=changeGoogleLanguage(lang);
      // Translator may take a moment to insert its selector.
      for(let tries=0;!ok&&tries<15;tries++){
        await new Promise(r=>setTimeout(r,180));
        ok=changeGoogleLanguage(lang);
      }
      if(!ok)throw new Error('Language not available in the translator');
      status.textContent='';
    }catch(error){
      status.textContent='Google Translate is unavailable here. Try the website after it is hosted online.';
      console.warn(error);
    }finally{trigger.disabled=false;syncBanner()}
  }));
  // Only load translation when already translated or when explicitly requested.
  const initial=selectedFromCookie();
  updateSelected(initial);
  if(initial!=='en'){
    syncBanner();
    loadGoogle().catch(()=>{});
  }
  const observer=new MutationObserver(syncBanner);
  observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('load',syncBanner);
  window.addEventListener('pageshow',syncBanner);
  window.addEventListener('resize',syncBanner);
  window.addEventListener('scroll',syncBanner,{passive:true});
  // Google Translate can insert its banner after the first DOM mutation.
  window.setInterval(syncBanner,500);
  syncBanner();
})();
