// Share one header Contact Us action across the homepage and gallery.
(function(){
  const trigger=document.getElementById('header-contact-options');
  if(!trigger)return;
  const pageTrigger=document.getElementById('open-contact-options');
  if(pageTrigger){trigger.addEventListener('click',()=>pageTrigger.click());return;}
  const dialog=document.getElementById('contact-choice-dialog');
  if(!dialog)return;
  const close=dialog.querySelector('.contact-dialog-close');
  const show=()=>{dialog.hidden=false;close.focus()};
  const hide=()=>{dialog.hidden=true;trigger.focus()};
  trigger.addEventListener('click',show);
  close.addEventListener('click',hide);
  dialog.addEventListener('click',e=>{if(e.target===dialog)hide()});
  dialog.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();hide()}
    if(e.key==='Tab'){
      const elements=[...dialog.querySelectorAll('button:not([disabled]),a[href]')];
      if(!elements.length)return;
      if(e.shiftKey&&document.activeElement===elements[0]){e.preventDefault();elements.at(-1).focus()}
      else if(!e.shiftKey&&document.activeElement===elements.at(-1)){e.preventDefault();elements[0].focus()}
    }
  });
  dialog.querySelectorAll('a.maps-dialog-option').forEach(a=>a.addEventListener('click',()=>{dialog.hidden=true}));
})();
