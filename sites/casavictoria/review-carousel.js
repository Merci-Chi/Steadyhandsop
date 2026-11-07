(()=>{
 const vp=document.getElementById('cv-reviews-viewport');
 const track=document.getElementById('cv-reviews-track');
 if(!vp||!track)return;
 const prev=document.getElementById('cv-review-prev'),next=document.getElementById('cv-review-next');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let running=false,timer=null;
 const cards=()=>Array.from(track.querySelectorAll('.cv-review-card'));
 const gap=()=>parseFloat(getComputedStyle(track).columnGap)||14;
 const step=()=>cards()[0].getBoundingClientRect().width+gap();
 const motion=()=>!reduced;
 function move(dir){
   if(running)return;
   running=true;
   const width=step();
   if(dir<0){
     track.style.transition='none';
     track.insertBefore(track.lastElementChild,track.firstElementChild);
     track.style.transform=`translate3d(-${width}px,0,0)`;
     track.offsetHeight;
   }
   track.style.transition=motion()?'transform .48s cubic-bezier(.23,.71,.23,1)':'none';
   track.style.transform=dir>0?`translate3d(-${width}px,0,0)`:'translate3d(0,0,0)';
   const done=()=>{
     track.style.transition='none';
     if(dir>0)track.appendChild(track.firstElementChild);
     track.style.transform='translate3d(0,0,0)';
     track.offsetHeight;
     running=false;
   };
   if(motion())setTimeout(done,510);else done();
 }
 function stop(){clearInterval(timer);timer=null}
 function play(){stop();if(!reduced)timer=setInterval(()=>{if(document.visibilityState==='visible'&&!document.hidden)move(1)},4300)}
 prev?.addEventListener('click',()=>{move(-1);play()});
 next?.addEventListener('click',()=>{move(1);play()});
 vp.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();move(e.key==='ArrowRight'?1:-1);play()}});
 vp.addEventListener('mouseenter',stop);vp.addEventListener('mouseleave',play);
 vp.addEventListener('focusin',stop);vp.addEventListener('focusout',e=>{if(!vp.contains(e.relatedTarget))play()});
 let sx=null;
 vp.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;stop()},{passive:true});
 vp.addEventListener('touchend',e=>{if(sx!==null){const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)move(dx<0?1:-1);sx=null}play()},{passive:true});
 window.addEventListener('resize',()=>{track.style.transition='none';track.style.transform='translate3d(0,0,0)'});
 play();
 const reviewModal=document.getElementById('cv-review-text-modal');
 let lastFocus=null;
 const closeText=()=>{reviewModal.hidden=true;document.body.style.removeProperty('overflow');lastFocus?.focus()};
 track.addEventListener('click',e=>{
   const btn=e.target.closest('.cv-review-read-more');if(!btn)return;
   const card=btn.closest('.cv-review-card');lastFocus=btn;
   reviewModal.querySelector('.cv-review-text-source').innerHTML=card.querySelector('.cv-review-source').innerHTML;
   reviewModal.querySelector('#cv-review-text-title').textContent=card.querySelector('h3').textContent;
   reviewModal.querySelector('.cv-review-text-body').textContent=card.querySelector('.cv-review-quote').textContent;
   reviewModal.querySelector('.cv-review-text-link').href=card.querySelector('.cv-review-original').href;
   reviewModal.hidden=false;document.body.style.overflow='hidden';stop();reviewModal.querySelector('.cv-review-text-close').focus();
 });
 reviewModal.querySelector('.cv-review-text-close').addEventListener('click',()=>{closeText();play()});
 reviewModal.addEventListener('click',e=>{if(e.target===reviewModal){closeText();play()}});
 reviewModal.addEventListener('keydown',e=>{if(e.key==='Tab'){const focusable=[reviewModal.querySelector('.cv-review-text-close'),reviewModal.querySelector('.cv-review-text-link')];let dest=e.shiftKey?focusable[1]:focusable[0];if(e.shiftKey&&document.activeElement===focusable[0]){e.preventDefault();dest.focus()}else if(!e.shiftKey&&document.activeElement===focusable[1]){e.preventDefault();dest.focus()}}});
 const photoModal=document.getElementById('cv-review-image-modal');
 let focusBefore=null;
 track.addEventListener('click',e=>{
   const photo=e.target.closest('.cv-review-photo');if(!photo||!photoModal)return;
   focusBefore=photo;
   photoModal.querySelector('img').src=photo.dataset.full;
   photoModal.querySelector('img').alt=photo.getAttribute('aria-label');
   photoModal.hidden=false;stop();photoModal.querySelector('.cv-review-image-close').focus();
 });
 function closePhoto(){photoModal.hidden=true;photoModal.querySelector('img').removeAttribute('src');focusBefore?.focus();play()}
 photoModal?.querySelector('.cv-review-image-close')?.addEventListener('click',closePhoto);
 photoModal?.addEventListener('click',e=>{if(e.target===photoModal)closePhoto()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!reviewModal.hidden){closeText();play()}else if(photoModal&&!photoModal.hidden)closePhoto()}});
})();