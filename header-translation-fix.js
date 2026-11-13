/* Fits the existing header to real translated text widths without clipping labels. */
(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  if (!header) return;
  const wordmark = header.querySelector('.wordmark');
  const name = header.querySelector('.brand-name');
  const subtitle = header.querySelector('.brand-subtitle');
  const nav = header.querySelector('.desktop-nav');
  const actions = header.querySelector('.header-actions');
  if (!wordmark || !name || !nav || !actions) return;
  let scheduled = false;
  const root = document.documentElement;
  function actualWidth(element) { return element.getBoundingClientRect().width; }
  function setHeaderHeight(){
    const h = Math.ceil(actualWidth(header) ? header.getBoundingClientRect().height : 100);
    if (h) root.style.setProperty('--header-h', h + 'px');
  }
  function fit(){
    scheduled = false;
    // Menus must never cause the site header to switch to a second row.
    header.classList.remove('header-stacked');
    header.style.setProperty('--fit-brand-size','clamp(52px,4.3vw,70px)');
    header.style.setProperty('--fit-nav-size','16px');
    header.style.setProperty('--fit-nav-gap','clamp(8px,1.1vw,18px)');
    if (window.innerWidth <= 800){setHeaderHeight();return;}
    const style=getComputedStyle(header);
    const padding=parseFloat(style.paddingLeft)+parseFloat(style.paddingRight);
    const gap=parseFloat(style.gap)||20;
    const available=header.clientWidth-padding-2*gap;
    // Reduce only as much as necessary; the original sizing remains in English.
    const maxSize=Math.min(70,Math.max(52,window.innerWidth*.043));
    let found=false;
    for (let f=maxSize;f>=30;f-=2){
      header.style.setProperty('--fit-brand-size',f+'px');
      // Avoid flex-shrink masking the true width of the brand name.
      const naturalBrand=name.scrollWidth;
      const logo=header.querySelector('.brand-logo');
      const divider=header.querySelector('.brand-divider');
      const g=parseFloat(getComputedStyle(wordmark).gap)||6;
      const brandRequired=(logo?.offsetWidth||0)+naturalBrand+(divider?.offsetWidth||0)+(subtitle?.scrollWidth||0)+4*g;
      // Measure only visible top-level nav controls. Absolute-positioned dropdown
      // panels can extend beyond the nav box and inflate nav.scrollWidth.
      const navStyle=getComputedStyle(nav);
      const navGap=parseFloat(navStyle.columnGap)||parseFloat(navStyle.gap)||0;
      const navItems=Array.from(nav.children);
      const navRequired=navItems.reduce((total,item)=>total+item.getBoundingClientRect().width,0)+Math.max(0,navItems.length-1)*navGap;
      const required=brandRequired+navRequired+actions.getBoundingClientRect().width;
      if(required<=available+3){found=true;break;}
    }
    if(!found){
      header.style.setProperty('--fit-brand-size','clamp(32px,3.7vw,55px)');
      header.style.setProperty('--fit-nav-gap','7px');
      header.style.setProperty('--fit-nav-size','15px');
      // Do not change the header's rows or height when space is tight.
    }
    setHeaderHeight();
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(fit)}}
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('load',schedule);
  document.fonts?.ready?.then(schedule);
  // Google Translate rewrites text after initial load and again when language changes.
  const observer = new MutationObserver(schedule);
  observer.observe(header,{subtree:true,childList:true,characterData:true});
  schedule();
})();
