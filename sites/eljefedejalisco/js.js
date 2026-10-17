'use strict';
(() => {
  const data=window.EL_JEFE;
  const $=(selector,root=document)=>root.querySelector(selector);
  const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
  const safeUrl=value=>{if(typeof value!=='string'||!value.trim())return '';try{const url=new URL(value,location.href);return ['http:','https:','file:'].includes(url.protocol)?url.href:'';}catch{return '';}};
  const nav=$('#navigation'),toggle=$('.nav-toggle');
  function closeNav(){nav?.classList.remove('open');toggle?.setAttribute('aria-expanded','false');}
  if(nav&&toggle){toggle.addEventListener('click',()=>toggle.setAttribute('aria-expanded',String(nav.classList.toggle('open'))));nav.addEventListener('click',e=>{if(e.target.closest('a'))closeNav();});}
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeNav();toggle?.focus();}});
  document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeNav();});
  window.matchMedia('(max-width:900px)').addEventListener('change',closeNav);
  if($('#year'))$('#year').textContent=new Date().getFullYear();
  // Each page initializes only the sections it contains. Menu HTML is already
  // rendered in menu.html and stays usable even if enhancement cannot load.
  if(data&&$('#menu-panel'))initMenu();
  if(data&&$('#delivery-links'))initOrdering();
  function initOrdering(){
    const list=$('#delivery-links');list.replaceChildren();
    data.ordering.forEach(item=>{const url=safeUrl(item.url),entry=make(url?'a':'div');if(url){entry.href=url;entry.target='_blank';entry.rel='noopener noreferrer';}entry.append(make('span','delivery-name',item.name+(url?' ↗':'')),make('span','delivery-status',url?'Order online':'Ordering link coming soon'));list.append(entry);});
  }
  function initMenu(){
    const tabs=$('.menu-tabs'),panel=$('#menu-panel'),search=$('#menu-search'),count=$('#menu-count');
    const all=data.menu.flatMap(category=>category.items);
    const categories=[{name:'ALL',items:all},...data.menu];
    const cards=[...document.querySelectorAll('[data-product-index]')];
    const productDialog=$('#product-dialog');let active=0,lastProduct=null;
    function openProduct(item,trigger){
      if(!productDialog||typeof productDialog.showModal!=='function')return false;
      lastProduct=trigger;$('#product-title').textContent=item.name;$('#product-category').textContent=item.category||'THE MENU';$('#product-description').textContent=item.description||'';$('#product-price').textContent=item.price||'ASK FOR CURRENT PRICE';
      const main=$('#product-image');main.src=safeUrl(item.image);main.alt=item.name;
      const thumbnails=$('#product-thumbs');thumbnails.replaceChildren();
      (item.photos||[item.image]).forEach((src,i)=>{const button=make('button','product-thumb');button.type='button';button.setAttribute('aria-label','View '+item.name+' photo '+(i+1));button.setAttribute('aria-pressed',String(i===0));const image=make('img');image.src=safeUrl(src);image.alt='';image.loading='lazy';button.append(image);button.addEventListener('click',()=>{main.src=safeUrl(src);main.alt=item.name+' — photo '+(i+1);[...thumbnails.children].forEach(el=>el.setAttribute('aria-pressed',String(el===button)));});thumbnails.append(button);});
      productDialog.showModal();return true;
    }
    if(productDialog){$('.close-product',productDialog)?.addEventListener('click',()=>productDialog.close());productDialog.addEventListener('click',e=>{if(e.target===productDialog)productDialog.close();});productDialog.addEventListener('close',()=>{if(lastProduct?.isConnected)lastProduct.focus();});}
    cards.forEach(card=>{const index=Number(card.dataset.productIndex),link=$('[data-product]',card);if(!all[index]||!link)return;const item=all[index];const image=$('img',card);if(image){image.src=safeUrl(item.image);image.alt=item.name;}link.href=safeUrl(item.image);link.setAttribute('aria-label','View '+item.name+' photos and details');$('h3',card).textContent=item.name;$('.menu-card-category',card).textContent=item.category;$('.menu-card-price',card).textContent=item.price||'VIEW DISH & PHOTOS';link.addEventListener('click',e=>{if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;if(openProduct(all[index],link))e.preventDefault();});});
    const empty=make('div','menu-empty');empty.hidden=true;empty.append(make('h3','','No matches. Still hungry?'),make('p','','Try another dish or explore all categories.'));const reset=make('button','button','SHOW EVERYTHING');reset.type='button';empty.append(reset);$('.menu-items').append(empty);
    function filter(){
      const query=search.value.trim().toLocaleLowerCase();let total=0;
      cards.forEach(card=>{const item=all[Number(card.dataset.productIndex)];if(!item)return;const match=(active===0||item.category===categories[active].name)&&(item.name+' '+(item.description||'')+' '+item.category).toLocaleLowerCase().includes(query);card.hidden=!match;if(match)total++;});
      empty.hidden=total!==0;count.textContent=total+' '+(total===1?'DISH':'DISHES')+(query?' MATCHING “'+search.value.trim()+'”':' TO EXPLORE');
    }
    function select(index,focus=false){active=index;[...tabs.children].forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby','menu-tab-'+index);filter();if(focus)tabs.children[index].focus();}
    tabs.replaceChildren();categories.forEach((category,i)=>{const tab=make('button','',category.name);tab.type='button';tab.id='menu-tab-'+i;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','menu-panel');tab.addEventListener('click',()=>select(i));tab.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%categories.length;else if(e.key==='ArrowLeft')next=(i-1+categories.length)%categories.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=categories.length-1;else return;e.preventDefault();select(next,true);});tabs.append(tab);});
    search.disabled=false;search.addEventListener('input',filter);reset.addEventListener('click',()=>{search.value='';select(0);search.focus();});
    document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();search.focus();}});
    select(0);
  }
})();

// TikTok documents playback failures through its player message API.
(() => {
  const frame = document.querySelector('[data-tiktok-player] iframe');
  function showFallback(container, text) {
    if (!container) return;
    const message = document.createElement('p');
    message.className = 'embed-playback-message';
    message.setAttribute('role', 'status');
    message.textContent = text;
    container.replaceChildren(message);
  }
  if (frame) {
    const fallback = () => showFallback(frame.parentElement,
      'This feature cannot play here right now. Watch the original using the TikTok link below.');
    frame.addEventListener('error', fallback);
    window.addEventListener('message', event => {
      if (event.origin !== 'https://www.tiktok.com' || event.source !== frame.contentWindow) return;
      const data = event.data;
      if (!data || data['x-tiktok-player'] !== true) return;
      if (data.type === 'onPlayerError' || data.type === 'onError') fallback();
    });
  }
  document.querySelectorAll('.video-embed-card video').forEach(video => {
    const fallback = () => showFallback(video.parentElement,
      'This clip cannot play in your browser. Watch the original using the Facebook link below.');
    video.addEventListener('error', fallback);
    video.querySelector('source')?.addEventListener('error', fallback);
  });
})();
