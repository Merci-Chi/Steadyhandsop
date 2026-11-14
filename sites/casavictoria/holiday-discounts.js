/* Casa-Victoria holiday offers and an everyday first-fitting welcome offer. */
(()=>{
  const timeZone='America/Los_Angeles';
  const dateParts=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});
  const parts=Object.fromEntries(dateParts.formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  const isBusinessDay=!['Sat','Sun'].includes(parts.weekday);

  const offers=[
    {
      id:'thanksgiving-2026',
      start:'2026-11-16',end:'2026-11-20',
      title:'A Little Thanksgiving Gift',
      eyebrow:'THANKSGIVING SPECIAL',
      dates:'November 16–20, 2026',
      theme:'holiday'
    },
    {
      id:'black-friday-2026',
      start:'2026-11-23',end:'2026-11-27',
      excluded:['2026-11-26'], // Thanksgiving Day: not an advertised open day.
      title:'Black Friday Week',
      eyebrow:'LIMITED-TIME HOLIDAY OFFER',
      dates:'November 23–25 & 27, 2026',
      theme:'black-friday'
    },
    {
      id:'christmas-2026',
      start:'2026-12-21',end:'2026-12-24',
      title:'A Little Christmas Gift',
      eyebrow:'CHRISTMAS SPECIAL',
      dates:'December 21–24, 2026',
      theme:'holiday'
    }
  ];
  const holidayOffer=isBusinessDay ? offers.find(o=>today>=o.start&&today<=o.end&&!o.excluded?.includes(today)) : null;
  const offer=holidayOffer || {
    id:'first-fitting-10',
    title:'A Little Welcome Gift',
    eyebrow:'FIRST FITTING SPECIAL',
    dates:'Available year-round for your first fitting',
    theme:'holiday',
    percent:10,
    services:'Your First Fitting',
    fineprint:'For first-time fitting customers only. Cannot be combined with other discounts. Confirm eligibility when booking.'
  };

  const storageKey='cv-holiday-promo-dismissed-v2-'+offer.id;
  let alreadyDismissed=false;
  try{alreadyDismissed=sessionStorage.getItem(storageKey)==='1';}catch(_){/* Browsers may block storage. */}

  // The coupon stays available after the modal has been dismissed.
  const coupon=document.createElement('button');
  coupon.type='button';
  coupon.className='cv-holiday-coupon';
  coupon.setAttribute('aria-label','Open '+(offer.percent || 20)+'% discount offer');
  coupon.setAttribute('title','View your discount');
  coupon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3.5a2.5 2.5 0 0 0 0 5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.5a2.5 2.5 0 0 0 0-5Z"/><path d="M12 4v2m0 3v2m0 3v2m0 3v1"/></svg>';
  coupon.hidden=true;
  document.body.append(coupon);

  const dialog=document.createElement('div');
  dialog.className='cv-holiday-backdrop';
  dialog.hidden=true;
  dialog.innerHTML=`
    <section class="cv-holiday-popup ${offer.theme==='black-friday'?'is-black-friday':''}" role="dialog" aria-modal="true" aria-labelledby="cv-holiday-heading" aria-describedby="cv-holiday-details" tabindex="-1">
      <button type="button" class="cv-holiday-close" aria-label="Close holiday offer">×</button>
      <p class="cv-holiday-eyebrow"></p>
      <h2 id="cv-holiday-heading"></h2>
      <p class="cv-holiday-percent"><span class="cv-holiday-discount-value"></span> <span>OFF</span></p>
      <p class="cv-holiday-services"></p>
      <p class="cv-holiday-details" id="cv-holiday-details"></p>
      <a class="cv-holiday-action" href="index.html#contact">Contact Us to Claim</a>
      <p class="cv-holiday-fineprint">Valid on the listed dates only, during regular business hours. Eligible services only; cannot be combined with other discounts. Confirm details when booking.</p>
    </section>`;
  dialog.querySelector('.cv-holiday-eyebrow').textContent=offer.eyebrow;
  dialog.querySelector('.cv-holiday-discount-value').textContent=(offer.percent || 20)+'%';
  dialog.querySelector('.cv-holiday-services').textContent=offer.services || 'Eligible Alteration Services';
  if(offer.fineprint)dialog.querySelector('.cv-holiday-fineprint').textContent=offer.fineprint;
  dialog.querySelector('#cv-holiday-heading').textContent=offer.title;
  dialog.querySelector('.cv-holiday-details').textContent=offer.dates;
  document.body.append(dialog);
  let previousFocus=null;
  let previousOverflow='';
  let isOpen=false;
  function showCoupon(){
    coupon.hidden=false;
    window.requestAnimationFrame(()=>coupon.classList.add('is-visible'));
  }
  function open(){
    if(isOpen)return;
    isOpen=true;
    coupon.classList.remove('is-visible');
    coupon.hidden=true;
    previousFocus=document.activeElement;
    previousOverflow=document.body.style.overflow;
    dialog.hidden=false;
    document.body.style.overflow='hidden';
    window.requestAnimationFrame(()=>dialog.classList.add('is-visible'));
    dialog.querySelector('.cv-holiday-close').focus({preventScroll:true});
  }
  function close(){
    if(!isOpen)return;
    isOpen=false;
    try{sessionStorage.setItem(storageKey,'1');}catch(_){}
    dialog.classList.remove('is-visible');
    document.body.style.overflow=previousOverflow;
    window.setTimeout(()=>{if(!isOpen)dialog.hidden=true;},280);
    showCoupon();
    coupon.focus({preventScroll:true});
  }
  coupon.addEventListener('click',open);
  dialog.querySelector('.cv-holiday-close').addEventListener('click',close);
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
  dialog.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();close();}
    if(e.key==='Tab'){
      const controls=[dialog.querySelector('.cv-holiday-close'),dialog.querySelector('.cv-holiday-action')];
      const index=controls.indexOf(document.activeElement);
      if(e.shiftKey&&index===0){e.preventDefault();controls.at(-1).focus();}
      else if(!e.shiftKey&&index===controls.length-1){e.preventDefault();controls[0].focus();}
    }
  });
  if(alreadyDismissed){
    showCoupon();
  }else{
    window.setTimeout(()=>{if(dialog.isConnected)open();},1500);
  }
})();
