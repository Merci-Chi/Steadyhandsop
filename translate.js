/* Language selector: custom display, Google Translate-powered translation. */
(() => {
  'use strict';
  const primary = [
    ['en','English'], ['es','Español (Spanish)'],
    ['zh-CN','中文 (Chinese)'], ['hi','हिन्दी (Hindi)'],
    ['ar','العربية (Arabic)'], ['fr','Français (French)'],
    ['pt','Português'], ['ru','Русский (Russian)'],
    ['bn','বাংলা (Bengali)'], ['ja','日本語 (Japanese)'],
    ['de','Deutsch (German)'], ['ko','한국어 (Korean)']
  ];
  const extra = [
    ['af','Afrikaans'],['sq','Albanian'],['am','Amharic'],['hy','Armenian'],['az','Azerbaijani'],
    ['eu','Basque'],['be','Belarusian'],['bs','Bosnian'],['bg','Bulgarian'],['ca','Catalan'],
    ['ceb','Cebuano'],['ny','Chichewa'],['co','Corsican'],['hr','Croatian'],['cs','Czech'],
    ['da','Danish'],['nl','Dutch'],['eo','Esperanto'],['et','Estonian'],['tl','Filipino'],
    ['fi','Finnish'],['fy','Frisian'],['gl','Galician'],['ka','Georgian'],['el','Greek'],
    ['gu','Gujarati'],['ht','Haitian Creole'],['ha','Hausa'],['haw','Hawaiian'],['iw','Hebrew'],
    ['hmn','Hmong'],['hu','Hungarian'],['is','Icelandic'],['ig','Igbo'],['id','Indonesian'],
    ['ga','Irish'],['it','Italian'],['jw','Javanese'],['kn','Kannada'],['kk','Kazakh'],
    ['km','Khmer'],['ku','Kurdish'],['ky','Kyrgyz'],['lo','Lao'],['la','Latin'],
    ['lv','Latvian'],['lt','Lithuanian'],['lb','Luxembourgish'],['mk','Macedonian'],['mg','Malagasy'],
    ['ms','Malay'],['ml','Malayalam'],['mt','Maltese'],['mi','Maori'],['mr','Marathi'],
    ['mn','Mongolian'],['my','Myanmar (Burmese)'],['ne','Nepali'],['no','Norwegian'],['ps','Pashto'],
    ['fa','Persian'],['pl','Polish'],['pa','Punjabi'],['ro','Romanian'],['sm','Samoan'],
    ['gd','Scots Gaelic'],['sr','Serbian'],['st','Sesotho'],['sn','Shona'],['sd','Sindhi'],
    ['si','Sinhala'],['sk','Slovak'],['sl','Slovenian'],['so','Somali'],['su','Sundanese'],
    ['sw','Swahili'],['sv','Swedish'],['tg','Tajik'],['ta','Tamil'],['te','Telugu'],
    ['th','Thai'],['tr','Turkish'],['uk','Ukrainian'],['ur','Urdu'],['uz','Uzbek'],
    ['vi','Vietnamese'],['cy','Welsh'],['xh','Xhosa'],['yi','Yiddish'],['yo','Yoruba'],['zu','Zulu']
  ];
  const pickers = [...document.querySelectorAll('.language-picker')];
  if (!pickers.length) return;
  let selected = 'en';
  let initialized = false;
  let pending = null;
  const googleSelect = () => document.querySelector('#google_translate_element select.goog-te-combo');
  const getCookie = name => {
    const item = document.cookie.split('; ').find(part=>part.startsWith(name+'='));
    return item ? decodeURIComponent(item.substring(name.length+1)) : '';
  };
  function currentLanguage(){
    const match = getCookie('googtrans').match(/^\/[^/]*\/([^/]+)$/);
    return match ? match[1] : 'en';
  }
  selected = currentLanguage();
  function paint(){
    document.querySelectorAll('.language-option').forEach(button=>{
      button.setAttribute('aria-current', String(button.dataset.lang===selected));
    });
  }
  function clearTranslation(){
    for(const domain of ['', location.hostname.startsWith('www.') ? location.hostname.slice(4) : '.'+location.hostname]) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`+(domain ? `; domain=${domain}` : '');
    }
    location.reload();
  }
  function choose(lang){
    closeAll();
    if(lang==='en') { if(selected!=='en') clearTranslation(); return; }
    if(!window.steadyHandsConsent?.hasOptional()){
      window.steadyHandsConsent?.openSettings();
      return;
    }
    selected=lang; paint();
    loadTranslate();
    const select=googleSelect();
    if(select){
      select.value=lang;
      select.dispatchEvent(new Event('change',{bubbles:true}));
    } else {
      // Google may still be loading; a cookie also carries the preference after refresh.
      pending=lang;
      const message=document.querySelector('.language-credit');
      if(message) message.textContent='Loading Google Translate…';
    }
  }
  function addOptions(container, items){
    if(!container) return;
    for(const [code,label] of items){
      const button=document.createElement('button');
      button.type='button';button.className='language-option notranslate';button.setAttribute('translate','no');
      button.dataset.lang=code;button.textContent=label;
      button.addEventListener('click',()=>choose(code));container.appendChild(button);
    }
  }
  function closeAll(){
    for(const picker of pickers){
      picker.querySelector('.language-panel').hidden=true;
      picker.querySelector('.language-toggle').setAttribute('aria-expanded','false');
    }
  }
  for(const picker of pickers){
    const panel=picker.querySelector('.language-panel');
    const toggle=picker.querySelector('.language-toggle');
    const more=picker.querySelector('.language-more');
    const extraPanel=picker.querySelector('.language-extra');
    addOptions(picker.querySelector('.language-options'),primary);
    addOptions(extraPanel,extra);
    toggle.addEventListener('click',()=>{
      const shouldOpen=panel.hidden;closeAll();panel.hidden=!shouldOpen;
      toggle.setAttribute('aria-expanded',String(shouldOpen));
    });
    picker.querySelector('.language-close').addEventListener('click',closeAll);
    more.addEventListener('click',()=>{
      extraPanel.hidden=!extraPanel.hidden;
      more.setAttribute('aria-expanded',String(!extraPanel.hidden));
    });
  }
  document.addEventListener('pointerdown',event=>{
    if(!event.target.closest('.language-picker')) closeAll();
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape') closeAll();
  });
  paint();
  // Visible Google toolbar is fixed at the top. Some Google versions shift body themselves.
  // Compensate sticky header only by any remaining unaccounted portion.
  function syncBanner(){
    const frames=[...document.querySelectorAll('iframe.goog-te-banner-frame, iframe.skiptranslate')];
    const banner=frames.find(el=>{
      const rect=el.getBoundingClientRect();
      const style=getComputedStyle(el);
      return rect.height>15 && rect.top<10 && rect.bottom>0 && style.visibility!=='hidden' && style.display!=='none';
    });
    const height=banner?Math.ceil(banner.getBoundingClientRect().height):0;
    const bodyShift=Math.max(0, Math.round(document.body.getBoundingClientRect().top));
    const offset=Math.max(0,height-bodyShift);
    const root=document.documentElement;
    const old=root.style.getPropertyValue('--translate-header-offset');
    if(old!==`${offset}px`)root.style.setProperty('--translate-header-offset',`${offset}px`);
    if(root.style.getPropertyValue('--translate-banner-height')!==`${height}px`)root.style.setProperty('--translate-banner-height',`${height}px`);
  }
  new MutationObserver(syncBanner).observe(document.body,{childList:true,subtree:false,attributes:true,attributeFilter:['style','class']});
  window.addEventListener('resize',syncBanner);
  window.addEventListener('scroll',syncBanner,{passive:true});
  setInterval(syncBanner,1000);
  syncBanner();
  window.steadyHandsGoogleTranslateInit=()=>{
    if(initialized || !window.google?.translate?.TranslateElement)return;
    initialized=true;
    new google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false,includedLanguages:[...primary,...extra].map(([code])=>code).filter(code=>code!=='en').join(',')},'google_translate_element');
    let tries=0;
    const wait=setInterval(()=>{
      tries++;
      const select=googleSelect();
      if(select){
        clearInterval(wait);
        if(pending){const wanted=pending;pending=null;choose(wanted);}
      } else if(tries>100)clearInterval(wait);
    },120);
  };
  let loading=false;
  function loadTranslate(){
    if(loading||initialized)return;
    loading=true;
    const script=document.createElement('script');
    script.src='https://translate.google.com/translate_a/element.js?cb=steadyHandsGoogleTranslateInit';
    script.async=true;
    script.onerror=()=>{loading=false;document.querySelectorAll('.language-credit').forEach(el=>el.textContent='Translation unavailable. Check your connection and try again.');};
    document.head.appendChild(script);
  }
  document.addEventListener('steadyhands:consent-change', e=>{
    if(e.detail?.optional)loadTranslate();
  });
  if(window.steadyHandsConsent?.hasOptional())loadTranslate();
})();
