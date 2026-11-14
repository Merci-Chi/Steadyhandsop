/* Casa-Victoria holiday offers and an everyday first-fitting welcome offer. */
(()=>{
  const timeZone='America/Los_Angeles';
  const dateParts=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});
  const parts=Object.fromEntries(dateParts.formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  const isBusinessDay=!['Sat','Sun'].includes(parts.weekday);

  // Featured coupon calendar uses Las Vegas local dates. Offers can be
  // previewed on any day; redemption is limited to the advertised open days.
  const holidayOffers=[
    {
      id:'thanksgiving-2026',
      title:'Thanksgiving Special',
      starts:'2026-11-16', ends:'2026-11-20',
      previewStarts:'2026-11-01', previewEnds:'2026-11-20',
      dates:'November 16–20, 2026',
      theme:'holiday'
    },
    {
      id:'black-friday-2026',
      title:'Black Friday Special',
      starts:'2026-11-27', ends:'2026-11-30',
      previewStarts:'2026-11-21', previewEnds:'2026-11-30',
      dates:'Friday, November 27 & Monday, November 30, 2026',
      theme:'black-friday'
    },
    {
      id:'christmas-2026',
      title:'Christmas Special',
      starts:'2026-12-21', ends:'2026-12-24',
      previewStarts:'2026-12-01', previewEnds:'2026-12-24',
      dates:'December 21–24, 2026',
      theme:'holiday'
    }
  ];
  const holiday=holidayOffers.find(o=>today>=o.previewStarts&&today<=o.previewEnds);
  const offer=holiday || {
    id:'first-fitting-10',
    title:'First Fitting Special',
    dates:'Available year-round for your first fitting',
    theme:'holiday',
    percent:10,
    services:'Your First Fitting'
  };
  const eligibleToday=holiday && today>=holiday.starts && today<=holiday.ends && isBusinessDay &&
    (holiday.id!=='black-friday-2026'||today==='2026-11-27'||today==='2026-11-30');
  const status=holiday ? (eligibleToday?'AVAILABLE NOW':'COMING SOON') : 'AVAILABLE NOW';
  const offerFineprint=holiday
    ? 'Offer valid only on the listed business days during regular hours. Eligible alteration services only; cannot be combined with other discounts. Confirm details when booking.'
    : 'For first-time fitting customers only. Cannot be combined with other discounts. Confirm eligibility when booking.';

  const storageKey='cv-holiday-promo-dismissed-v3-'+offer.id+'-'+status;
  let alreadyDismissed=false;
  try{alreadyDismissed=sessionStorage.getItem(storageKey)==='1';}catch(_){/* Browsers may block storage. */}

  // The coupon stays available after the modal has been dismissed.
  const coupon=document.createElement('button');
  coupon.type='button';
  coupon.className='cv-holiday-coupon';
  coupon.setAttribute('aria-label','Open upcoming coupons and discounts');
  coupon.setAttribute('title','Upcoming Coupons');
  coupon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3.5a2.5 2.5 0 0 0 0 5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-5.5a2.5 2.5 0 0 0 0-5Z"/><path d="M12 4v2m0 3v2m0 3v2m0 3v1"/></svg>';
  coupon.hidden=true;
  document.body.append(coupon);

  const dialog=document.createElement('div');
  dialog.className='cv-holiday-backdrop';
  dialog.hidden=true;
  dialog.innerHTML=`
    <section class="cv-holiday-popup ${offer.theme==='black-friday'?'is-black-friday':''}" role="dialog" aria-modal="true" aria-labelledby="cv-holiday-heading" aria-describedby="cv-holiday-details" tabindex="-1">
      <button type="button" class="cv-holiday-close" aria-label="Close coupons">×</button>
      <p class="cv-holiday-eyebrow">CASA-VICTORIA OFFERS</p>
      <h2 id="cv-holiday-heading">Upcoming Coupons</h2>
      <div class="cv-holiday-feature">
        <span class="cv-holiday-status"></span>
        <h3 class="cv-holiday-feature-title"></h3>
        <p class="cv-holiday-percent"><span class="cv-holiday-discount-value"></span> <span>OFF</span></p>
        <p class="cv-holiday-services"></p>
        <p class="cv-holiday-details" id="cv-holiday-details"></p>
      </div>
      <div class="cv-holiday-welcome">
        <div><strong>First Fitting Discount</strong><small>Available now for new customers</small></div>
        <strong class="cv-holiday-welcome-percent">10% OFF</strong>
      </div>
      <a class="cv-holiday-action" href="index.html#contact">Contact Us to Claim</a>
      <p class="cv-holiday-fineprint"></p>
    </section>`;
  dialog.querySelector('.cv-holiday-feature-title').textContent=offer.title;
  dialog.querySelector('.cv-holiday-status').textContent=status;
  dialog.querySelector('.cv-holiday-discount-value').textContent=(offer.percent || 20)+'%';
  dialog.querySelector('.cv-holiday-services').textContent=offer.services || 'Eligible Alteration Services';
  dialog.querySelector('#cv-holiday-details').textContent=offer.dates;
  dialog.querySelector('.cv-holiday-fineprint').textContent=offerFineprint;
  // Do not repeat the same 10% coupon when it is the featured/default offer.
  if(!holiday)dialog.querySelector('.cv-holiday-welcome').hidden=true;
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
