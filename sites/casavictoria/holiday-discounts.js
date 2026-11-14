/* Casa-Victoria seasonal discounts. Las Vegas dates; closed weekends and holidays are excluded. */
(()=>{
  const timeZone='America/Los_Angeles';
  const dateParts=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'});
  const parts=Object.fromEntries(dateParts.formatToParts(new Date()).map(p=>[p.type,p.value]));
  const today=`${parts.year}-${parts.month}-${parts.day}`;
  const isBusinessDay=!['Sat','Sun'].includes(parts.weekday);
  if(!isBusinessDay)return;

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
  const offer=offers.find(o=>today>=o.start&&today<=o.end&&!o.excluded?.includes(today));
  if(!offer)return;

  const storageKey='cv-holiday-promo-seen-'+offer.id;
  try{if(sessionStorage.getItem(storageKey))return;}catch(_){/* Browsers may block storage. */}

  const dialog=document.createElement('div');
  dialog.className='cv-holiday-backdrop';
  dialog.hidden=true;
  dialog.innerHTML=`
    <section class="cv-holiday-popup ${offer.theme==='black-friday'?'is-black-friday':''}" role="dialog" aria-modal="true" aria-labelledby="cv-holiday-heading" aria-describedby="cv-holiday-details" tabindex="-1">
      <button type="button" class="cv-holiday-close" aria-label="Close holiday offer">×</button>
      <p class="cv-holiday-eyebrow"></p>
      <h2 id="cv-holiday-heading"></h2>
      <p class="cv-holiday-percent">20% <span>OFF</span></p>
      <p class="cv-holiday-services">Eligible Alteration Services</p>
      <p class="cv-holiday-details" id="cv-holiday-details"></p>
      <a class="cv-holiday-action" href="index.html#contact">Contact Us to Claim</a>
      <p class="cv-holiday-fineprint">Valid on the listed dates only, during regular business hours. Eligible services only; cannot be combined with other discounts. Confirm details when booking.</p>
    </section>`;
  dialog.querySelector('.cv-holiday-eyebrow').textContent=offer.eyebrow;
  dialog.querySelector('#cv-holiday-heading').textContent=offer.title;
  dialog.querySelector('.cv-holiday-details').textContent=offer.dates;
  document.body.append(dialog);
  let previousFocus=null;
  let previousOverflow='';
  function close(){
    dialog.classList.remove('is-visible');
    document.body.style.overflow=previousOverflow;
    window.setTimeout(()=>dialog.remove(),280);
    if(previousFocus?.isConnected)previousFocus.focus();
  }
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
  window.setTimeout(()=>{
    if(!dialog.isConnected)return;
    previousFocus=document.activeElement;
    previousOverflow=document.body.style.overflow;
    dialog.hidden=false;
    document.body.style.overflow='hidden';
    window.requestAnimationFrame(()=>dialog.classList.add('is-visible'));
    dialog.querySelector('.cv-holiday-close').focus({preventScroll:true});
    try{sessionStorage.setItem(storageKey,'1');}catch(_){}
  },3500);
})();
