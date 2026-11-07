const menu=document.getElementById('menu'),nav=document.getElementById('nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open))});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));

const lightbox=document.getElementById('lightbox');const lightimg=lightbox.querySelector('img');const caption=lightbox.querySelector('p');let lastActive=null;document.querySelectorAll('.gallery-image').forEach(button=>button.addEventListener('click',()=>{lastActive=document.activeElement;lightimg.src=button.dataset.img;lightimg.alt=button.querySelector('img').alt;caption.textContent=button.dataset.caption;lightbox.hidden=false;document.body.style.overflow='hidden';lightbox.querySelector('.lightbox-close').focus()}));function closeGallery(){lightbox.hidden=true;document.body.style.overflow='';if(lastActive)lastActive.focus()}lightbox.querySelector('.lightbox-close').addEventListener('click',closeGallery);lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeGallery()});window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!lightbox.hidden)closeGallery()});
if(!window.matchMedia('(prefers-reduced-motion:reduce)').matches){const bg=document.querySelector('.hero-image');const hero=document.querySelector('.hero');let scheduled=false;function update(){const rect=hero.getBoundingClientRect();if(rect.bottom>=0&&rect.top<innerHeight){const shift=Math.max(-24,Math.min(24,(rect.top/innerHeight)*-25));bg.style.setProperty('--parallax',shift+'px')}scheduled=false}window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}},{passive:true});window.addEventListener('resize',update);update()}

// Choose which map provider to open without assuming an installed app.
(function initMapsChooser(){
  const trigger=document.getElementById('open-in-maps');
  const dialog=document.getElementById('maps-choice-dialog');
  if(!trigger||!dialog)return;
  const panel=dialog.querySelector('.maps-dialog-panel');
  const close=dialog.querySelector('.maps-dialog-close');
  const copy=dialog.querySelector('.maps-copy-address');
  let previousFocus=null;
  function show(){previousFocus=document.activeElement;dialog.hidden=false;document.body.classList.add('maps-dialog-open');close.focus()}
  function hide(){dialog.hidden=true;document.body.classList.remove('maps-dialog-open');(previousFocus||trigger).focus()}
  trigger.addEventListener('click',show);
  close.addEventListener('click',hide);
  dialog.addEventListener('click',event=>{if(event.target===dialog)hide()});
  dialog.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();hide();return}
    if(event.key!=='Tab')return;
    const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  dialog.querySelectorAll('a.maps-dialog-option').forEach(a=>a.addEventListener('click',()=>{hide()}));
  copy.addEventListener('click',async()=>{
    const address='2202 W Charleston Blvd, Las Vegas, NV 89102';
    try{
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(address)}
      else{const field=document.createElement('textarea');field.value=address;field.style.position='fixed';field.style.opacity='0';document.body.appendChild(field);field.select();const ok=document.execCommand('copy');field.remove();if(!ok)throw Error('Copy unavailable')}
      copy.textContent='Address copied!';
    }catch(err){copy.textContent='Select and copy address above';}
  });
})();

// Choose call or text from the contact popup.
(function initContactChooser(){
 const trigger=document.getElementById('open-contact-options');
 const dialog=document.getElementById('contact-choice-dialog');
 if(!trigger||!dialog)return;
 const close=dialog.querySelector('.contact-dialog-close');
 let previousFocus=null;
 function show(){previousFocus=document.activeElement;dialog.hidden=false;close.focus()}
 function hide(){dialog.hidden=true;(previousFocus||trigger).focus()}
 trigger.addEventListener('click',show);
 close.addEventListener('click',hide);
 dialog.addEventListener('click',event=>{if(event.target===dialog)hide()});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();hide();return}
  if(event.key!=='Tab')return;
  const focusable=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];
  const first=focusable[0],last=focusable[focusable.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 });
 dialog.querySelectorAll('a.maps-dialog-option').forEach(a=>a.addEventListener('click',hide));
})();

// Share the actual directions URL via native share sheet, with clipboard fallback.
(function initDirectionsSharing(){
  const button=document.querySelector('.maps-share-directions');
  const modal=document.getElementById('maps-choice-dialog');
  if(!button||!modal)return;
  const link='https://www.google.com/maps/dir/?api=1&destination=2202%20W%20Charleston%20Blvd%2C%20Las%20Vegas%2C%20NV%2089102';
  const address='2202 W Charleston Blvd, Las Vegas, NV 89102';
  const help=modal.querySelector('.maps-dialog-help');
  async function copyLink(){
    try {
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(link);return true;}
      const input=document.createElement('textarea');input.value=link;input.style.position='fixed';input.style.opacity='0';input.setAttribute('readonly','');document.body.appendChild(input);input.select();const copied=document.execCommand('copy');input.remove();return copied;
    }catch(e){return false;}
  }
  button.addEventListener('click',async()=>{
    if(typeof navigator.share==='function'){
      try{
        await navigator.share({title:'Directions to Alterations Casa-Victoria',text:address,url:link});
        return;
      }catch(err){if(err && err.name==='AbortError')return;}
    }
    const copied=await copyLink();
    if(copied){help.textContent='Directions link copied! Paste it into Messages, email, or another app.';}
    else {help.textContent='Share isn’t available in this browser. Copy the directions URL from the box below.';
      let field=modal.querySelector('.maps-share-fallback-url');
      if(!field){field=document.createElement('input');field.className='maps-share-fallback-url';field.readOnly=true;field.setAttribute('aria-label','Directions link to copy');modal.querySelector('.maps-dialog-options').after(field);}
      field.value=link;field.focus();field.select();
    }
  });
})();
