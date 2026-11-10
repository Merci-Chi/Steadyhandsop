(() => {
  'use strict';
  const KEY = 'steady-hands-selected-services-v1';
  const SERVICES = window.STEADY_SERVICES || [];
  const LEGACY = ['new-business:Launch landing page / single-page website', 'new-business:Multi-page starter website'];
  const WEBSITE = 'new-business:Website Development';
  const steps = ['Verify Your Services', 'Choose a Date', 'Choose a Time', 'Business Information', 'Review & Confirm'];
  const $ = (q, scope = document) => scope.querySelector(q);
  const escapeText = x => String(x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read = () => {
    try { const arr = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(arr) ? [...new Set(arr.map(id => LEGACY.includes(id) ? WEBSITE : id))].filter(id => SERVICES.some(s => s.id === id)) : []; }
    catch { return []; }
  };
  const save = selected => { try { localStorage.setItem(KEY, JSON.stringify(selected)); } catch {} window.dispatchEvent(new Event('steady-services-changed')); };
  const BASE_TZ = 'America/Los_Angeles';
  const TZ_OPTIONS = [
    ['America/Los_Angeles','Pacific Time (Los Angeles)'],
    ['America/Denver','Mountain Time (Denver)'],
    ['America/Phoenix','Arizona Time (Phoenix)'],
    ['America/Chicago','Central Time (Chicago)'],
    ['America/New_York','Eastern Time (New York)'],
    ['America/Anchorage','Alaska Time'],
    ['Pacific/Honolulu','Hawaii Time'],
    ['America/Toronto','Toronto'],
    ['America/Vancouver','Vancouver'],
    ['America/Mexico_City','Mexico City'],
    ['America/Bogota','Bogotá'],
    ['America/Lima','Lima'],
    ['America/Sao_Paulo','São Paulo'],
    ['Europe/London','London'],
    ['Europe/Paris','Paris'],
    ['Europe/Berlin','Berlin'],
    ['Africa/Johannesburg','Johannesburg'],
    ['Asia/Dubai','Dubai'],
    ['Asia/Kolkata','India'],
    ['Asia/Singapore','Singapore'],
    ['Asia/Tokyo','Tokyo'],
    ['Australia/Sydney','Sydney'],
    ['Pacific/Auckland','Auckland'],
    ['UTC','Coordinated Universal Time']
  ];
  const supportedTimezone = value => {
    try { new Intl.DateTimeFormat('en-US', {timeZone:value}).format(new Date()); return true; }
    catch { return false; }
  };
  // Automatically use the visitor's time zone; the select also supports manual overrides.
  let visitorTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || BASE_TZ;
  if (!supportedTimezone(visitorTZ)) visitorTZ = BASE_TZ;
  let chosen = read(), reviewable = [...chosen], step = 0, date = '', time = '', month = new Date(), previousFocus = null;
  let availableSlots = null, availabilityState = 'idle', availabilityMessage = '', availabilityRequest = 0;
  const availabilityCache = new Map();
  const pad2 = value => String(value).padStart(2,'0');
  const zoneParts = (instant, tz) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle:'h23'
    }).formatToParts(instant);
    return Object.fromEntries(parts.filter(p => p.type !== 'literal').map(p => [p.type,Number(p.value)]));
  };
  const zoneOffset = (instant, tz) => {
    const p = zoneParts(new Date(instant),tz);
    return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second) - instant;
  };
  const pacificToUTC = (day,hour,minute) => {
    const [year,mon,d] = day.split('-').map(Number);
    const intended = Date.UTC(year,mon-1,d,hour,minute);
    let guess = intended;
    for (let i=0;i<3;i++) guess = intended-zoneOffset(guess,BASE_TZ);
    return new Date(guess).toISOString();
  };
  const slotsForDay = day => {
    const values=[];
    for(let hour=9;hour<=17;hour++) for(let minute=0;minute<60;minute+=30) {
      if(hour===17&&minute!==0)continue;
      values.push(pacificToUTC(day,hour,minute));
    }
    return values;
  };
  const localTime = (instant,tz) => new Intl.DateTimeFormat('en-US', {
    timeZone:tz,hour:'numeric',minute:'2-digit',hour12:true
  }).format(new Date(instant));
  const localDay = (instant,tz) => new Intl.DateTimeFormat('en-US', {
    timeZone:tz,weekday:'short',month:'short',day:'numeric',year:'numeric'
  }).format(new Date(instant));
  const getTimezoneLabel = tz => TZ_OPTIONS.find(o => o[0]===tz)?.[1] || tz.replaceAll('_',' ').split('/').pop();
  const zoneAbbr = (instant,tz) => new Intl.DateTimeFormat('en-US',{timeZone:tz,timeZoneName:'short'}).formatToParts(new Date(instant)).find(p=>p.type==='timeZoneName')?.value || tz;
  function displayedTime(instant) { return instant ? `${localTime(instant,visitorTZ)} ${zoneAbbr(instant,visitorTZ)}` : 'Not chosen'; }
  function displayedDate(instant) { return instant ? localDay(instant,visitorTZ) : 'Not chosen'; }
  function changeDate(next) {
    date=next;time='';availableSlots=null;availabilityState='idle';availabilityMessage='';
  }
  async function fetchAvailability(day){
    // When configured, the server must provide verified instants and revalidate at confirmation.
    const endpoint=String(window.STEADY_AVAILABILITY_ENDPOINT||'').trim();
    availableSlots=null; availabilityMessage='';
    if(!endpoint){availabilityState='not-configured';return;}
    if(!/^https:\/\//i.test(endpoint)){availabilityState='error';availabilityMessage='Availability service is not configured correctly.';return;}
    // Always get a fresh snapshot: another visitor may have booked a slot since the last check.
    const request=++availabilityRequest;
    availabilityState='loading';renderTime();
    try{
      const url=new URL(endpoint);
      url.searchParams.set('date',day);
      url.searchParams.set('timezone',BASE_TZ);
      const res=await fetch(url.toString(),{method:'GET',headers:{Accept:'application/json'},credentials:'omit',cache:'no-store'});
      if(!res.ok)throw new Error(`Availability request failed (${res.status})`);
      const body=await res.json();
      if(!Array.isArray(body.available))throw new Error('Availability response must include an available array.');
      const baseSlots=new Set(slotsForDay(day));
      const confirmed=new Set(body.available.filter(x=>typeof x==='string' && !Number.isNaN(Date.parse(x))).map(x=>new Date(x).toISOString()));
      const result=[...baseSlots].filter(x=>confirmed.has(x));
      if(request!==availabilityRequest||date!==day||root.hidden)return;
      availableSlots=result;availabilityState='ready';
      if(time&&!availableSlots.includes(time))time='';
    }catch(err){
      if(request!==availabilityRequest||date!==day||root.hidden)return;
      availableSlots=[];availabilityState='error';availabilityMessage='Unable to load appointment times. Please try again.';
      console.warn('Steady Hands availability request:',err);
    }
    if(step===2)renderTime();
  }

  // Keep a ten-digit national number. Extra digits (up to 3) become
  // the international dialing prefix rather than being silently dropped.
  // This 10-digit layout is intended for US/Canada-style national numbers.
  const formatPhone = (value, previous = '', insertionAtEnd = false) => {
    let digits = String(value || '').replace(/\D/g, '').slice(0, 13);
    const prevDigits = String(previous || '').replace(/\D/g, '');
    // When an extra digit is typed at the end of a complete number, move
    // that *newly typed* digit into the country code and preserve the number.
    // Pasted international numbers continue to use their leading prefix.
    if (insertionAtEnd && prevDigits.length >= 10 && digits.length > prevDigits.length &&
        digits.startsWith(prevDigits) && prevDigits.length < 13) {
      const incoming = digits.slice(prevDigits.length);
      const oldCountryLen = Math.max(0, prevDigits.length - 10);
      const oldCountry = prevDigits.slice(0, oldCountryLen);
      const national = prevDigits.slice(oldCountryLen);
      digits = (oldCountry + incoming).slice(0, 3) + national;
    }
    const countryLen = Math.max(0, digits.length - 10);
    const country = digits.slice(0, countryLen);
    const national = digits.slice(countryLen);
    let formatted = '';
    if (national.length < 4) formatted = national.length ? `(${national}` : '';
    else if (national.length < 7) formatted = `(${national.slice(0,3)}) ${national.slice(3)}`;
    else formatted = `(${national.slice(0,3)}) ${national.slice(3,6)}-${national.slice(6)}`;
    return country ? `+${country} ${formatted}` : formatted;
  };
  const data = {business:'',name:'',email:'',phone:'',notes:''};
  let sending = false, confirmation = null;
  const root = document.createElement('div'); root.id = 'book-consultation'; root.className = 'sb-overlay'; root.hidden = true;
  root.innerHTML = `<div class="sb-backdrop" data-sb-close></div><section class="sb-dialog notranslate" translate="no" role="dialog" aria-modal="true" aria-labelledby="sb-title" tabindex="-1">
    <header class="sb-head"><div class="sb-headline"><span class="sb-logo"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m9 15 2 2 4-4"/></svg></span><strong>Book a Consultation</strong></div><button type="button" class="sb-close" data-sb-close aria-label="Close booking">&times;</button></header>
    <div class="sb-progress" aria-label="Booking progress">${steps.map((_,i)=>`<span data-sb-progress="${i}"></span>`).join('')}</div>
    <main class="sb-main"><h2 id="sb-title"></h2><p id="sb-description" class="sb-subtitle"></p><div id="sb-stage"></div><p id="sb-notice" class="sb-notice" role="status" aria-live="polite"></p></main>
    <footer class="sb-actions"><button type="button" id="sb-back" class="sb-back">Back</button><button type="button" id="sb-next" class="sb-next">Continue <span aria-hidden="true">→</span></button></footer>
  </section>`;
  document.body.append(root);
  const stage = $('#sb-stage',root), notice = $('#sb-notice',root);
  const yyyyMMdd = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDay = value => new Date(value + 'T12:00:00');
  const niceDay = value => value ? parseDay(value).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'}) : 'Not chosen';
  function renderServices() {
    // Keep the original services available throughout this booking session.
    // Unchecking changes only the booking draft: it never removes a service
    // from the list or from the user's saved site-wide selections.
    const picked = reviewable.map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
    stage.innerHTML = `<div class="sb-stagebox"><p class="sb-helper">Check the services you'd like to discuss at your consultation. Unchecked services remain here if you change your mind.</p>
      <div id="sb-services" class="sb-service-list"></div></div>`;
    const list = $('#sb-services',stage);
    if (!picked.length) {
      list.innerHTML = '<p class="sb-helper">No services selected yet. Choose services on a service page to see them here.</p>';
      return;
    }
    picked.forEach(s => {
      const active = chosen.includes(s.id);
      const row = document.createElement('label');
      row.className = 'sb-service' + (active ? ' is-picked' : '');
      row.innerHTML = `<input type="checkbox" ${active ? 'checked' : ''} aria-label="Include ${escapeText(s.title)} in this consultation"><span class="sb-check" aria-hidden="true">✓</span><span class="sb-service-label"><strong>${escapeText(s.title)}</strong><small>${escapeText(s.category)} · ${escapeText(s.group)}</small></span>`;
      row.querySelector('input').addEventListener('change', e => {
        if (e.target.checked) {
          if (!chosen.includes(s.id)) chosen.push(s.id);
        } else {
          chosen = chosen.filter(id => id !== s.id);
        }
        row.classList.toggle('is-picked', e.target.checked);
      });
      list.append(row);
    });
  }
  function renderDate(){
    const today = new Date();today.setHours(0,0,0,0);
    const max = new Date(today);max.setDate(max.getDate()+120);
    const start = new Date(month.getFullYear(),month.getMonth(),1);
    const offset = start.getDay();const count = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
    const cells = Array.from({length:offset},()=>'<span class="sb-calendar-empty"></span>');
    for(let n=1;n<=count;n++) {
      const d=new Date(month.getFullYear(),month.getMonth(),n);const iso=yyyyMMdd(d);const disabled=d<today||d>max;
      cells.push(`<button type="button" class="sb-day ${iso===date?'is-picked':''}" data-day="${iso}" ${disabled?'disabled':''} aria-pressed="${iso===date}">${n}</button>`);
    }
    stage.innerHTML = `<div class="sb-stagebox"><p class="sb-helper">Choose a date for your consultation.</p><div class="sb-calendar"><div class="sb-calendar-nav"><button type="button" data-month="-1" aria-label="Previous month">‹</button><strong>${month.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</strong><button type="button" data-month="1" aria-label="Next month">›</button></div><div class="sb-calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(w=>`<small>${w}</small>`).join('')}${cells.join('')}</div></div><div class="sb-selected"><span>Preferred date</span><strong>${escapeText(niceDay(date))}</strong></div></div>`;
    stage.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{changeDate(b.dataset.day);renderDate();}));
    stage.querySelectorAll('[data-month]').forEach(b=>b.addEventListener('click',()=>{const next = new Date(month.getFullYear(),month.getMonth()+Number(b.dataset.month),1);const minMonth=new Date(today.getFullYear(),today.getMonth(),1);const maxMonth=new Date(max.getFullYear(),max.getMonth(),1);if(next>=minMonth&&next<=maxMonth){month=next;renderDate();}}));
  }
  function renderTime(){
    const base=slotsForDay(date);
    // Keep all standard slots visible. The API returns only those still free.
    const slots = availabilityState==='ready'?base
      : (availabilityState==='loading'||availabilityState==='error')?[]:base;
    const choices = TZ_OPTIONS.some(o=>o[0]===visitorTZ)
      ? TZ_OPTIONS : [[visitorTZ,`Your timezone (${getTimezoneLabel(visitorTZ)})`],...TZ_OPTIONS];
    stage.innerHTML = `<div class="sb-stagebox">
      <div class="sb-timezone-row"><label for="sb-timezone"><span aria-hidden="true">◷</span> Timezone</label>
        <select id="sb-timezone" aria-label="Select your timezone">${choices.map(([zone,label])=>`<option value="${escapeText(zone)}" ${zone===visitorTZ?'selected':''}>${escapeText(label)}</option>`).join('')}</select></div>
      <p class="sb-helper">Times are shown in your selected timezone. Appointment hours are 9:00 AM–5:00 PM Pacific Time.</p>
      ${availabilityState==='loading'?'<p class="sb-helper" role="status">Checking appointment availability…</p>':''}
      ${availabilityState==='error'?`<p class="sb-notice" role="alert">${escapeText(availabilityMessage)}</p><button class="sb-retry" type="button">Try again</button>`:''}
      <div class="sb-times">${slots.map(instant=>{
        const p=zoneParts(new Date(instant),visitorTZ);
        const localISO=`${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
        const nextDay=localISO!==date?`<small>${escapeText(localDay(instant,visitorTZ))}</small>`:'';
        const booked=availabilityState==='ready'&&!availableSlots.includes(instant);
        return `<button type="button" class="sb-time ${booked?'is-booked':''} ${time===instant&&!booked?'is-picked':''}" data-time="${instant}" aria-pressed="${time===instant&&!booked}" aria-label="${escapeText(localTime(instant,visitorTZ))}${booked?' (Booked)':''}" ${booked?'disabled aria-disabled="true" title="Already booked"':''}>${escapeText(localTime(instant,visitorTZ))}${nextDay}${booked?'<small class="sb-booked-label">Booked</small>':''}</button>`;
      }).join('')}</div>
      ${availabilityState==='ready'&&!base.some(x=>availableSlots.includes(x))?'<p class="sb-helper">All times are booked on this date. Please choose another day.</p>':''}
      <div class="sb-selected"><span>Selected time</span><strong>${escapeText(displayedTime(time))}</strong></div>
      <p class="sb-tz-hint">Pacific base: ${escapeText(date ? niceDay(date) : '')}. Your time may fall on a different local date.</p>
    </div>`;
    stage.querySelector('#sb-timezone').addEventListener('change',e=>{visitorTZ=e.target.value;renderTime();});
    stage.querySelectorAll('[data-time]:not([disabled])').forEach(b=>b.addEventListener('click',()=>{if(availabilityState==='ready'&&!availableSlots.includes(b.dataset.time))return;time=b.dataset.time;renderTime();}));
    stage.querySelector('.sb-retry')?.addEventListener('click',()=>fetchAvailability(date));
  }
  function renderInfo(){
    stage.innerHTML = `<form class="sb-fields" id="sb-fields" novalidate>
    <label><span class="sb-field-title">Business name <em>*</em></span><input name="business" autocomplete="organization" required maxlength="140" placeholder="Your business name" value="${escapeText(data.business)}"></label>
    <label><span class="sb-field-title">Your name <em>*</em></span><input name="name" autocomplete="name" required maxlength="120" placeholder="Full name" value="${escapeText(data.name)}"></label>
    <label><span class="sb-field-title">Email address <em>*</em></span><input name="email" type="email" autocomplete="email" required maxlength="200" placeholder="you@business.com" value="${escapeText(data.email)}"></label>
    <label><span class="sb-field-title">Phone number <em>*</em></span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20" pattern="(\\+[0-9]{1,3} )?\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}" title="Enter a 10-digit number, with an optional 1–3 digit country code" placeholder="(702) 555-0123" value="${escapeText(data.phone)}"></label>
    <label><span class="sb-field-title">Notes <span>(optional)</span></span><textarea name="notes" rows="2" maxlength="1000" placeholder="Anything we should know? Please avoid sensitive information.">${escapeText(data.notes)}</textarea></label></form>`;
    $('#sb-fields',stage).addEventListener('input',e=>{
      if (!Object.hasOwn(data,e.target.name)) return;
      if (e.target.name === 'phone') {
        // Auto-format typed or pasted values, retaining international prefixes.
        const raw = e.target.value;
        const prior = data.phone;
        const before = raw.slice(0,e.target.selectionStart ?? raw.length).replace(/\D/g,'').length;
        const appended = e.inputType === 'insertText' &&
          (e.target.selectionStart ?? raw.length) === raw.length &&
          raw.replace(/\D/g,'').length > prior.replace(/\D/g,'').length;
        const formatted = formatPhone(raw, prior, appended);
        e.target.value = formatted;
        const movedNewDigitToPrefix = appended && prior.replace(/\D/g,'').length >= 10;
        if (movedNewDigitToPrefix) {
          e.target.setSelectionRange(formatted.length,formatted.length);
        } else {
          let caret = 0, seen = 0;
          while (caret < formatted.length && seen < before) {
            if (/\d/.test(formatted[caret])) seen++;
            caret++;
          }
          if (before > 0 && caret < formatted.length && /[) -]/.test(formatted[caret])) {
            while (caret < formatted.length && /[) -]/.test(formatted[caret])) caret++;
          }
          e.target.setSelectionRange(caret,caret);
        }
      }
      data[e.target.name] = e.target.value;
    });
  }
  function renderConfirm(){
    const serviceNames=chosen.map(id=>SERVICES.find(s=>s.id===id)?.title).filter(Boolean);
    stage.innerHTML = `<div class="sb-confirm"><div class="sb-summary-row"><span>Services</span><strong>${serviceNames.length?serviceNames.map(escapeText).join('<br>'):'General consultation'}</strong></div><div class="sb-summary-row"><span>Date</span><strong>${escapeText(displayedDate(time))}</strong></div><div class="sb-summary-row"><span>Time</span><strong>${escapeText(displayedTime(time))}</strong></div><div class="sb-summary-row"><span>Business</span><strong>${escapeText(data.business||'Not provided')}</strong></div><div class="sb-summary-row"><span>Name</span><strong>${escapeText(data.name)}</strong></div><div class="sb-summary-row"><span>Email</span><strong>${escapeText(data.email)}</strong></div>${data.phone?`<div class="sb-summary-row"><span>Phone</span><strong>${escapeText(data.phone)}</strong></div>`:''}</div><p class="sb-confirm-note">Review your consultation details before continuing.</p>`;
  }
  function renderSubmitted(){
    const emailReady = confirmation?.emailConfirmationQueued === true;
    stage.innerHTML = `<div class="sb-success-card" role="status" aria-live="polite">
      <div class="sb-success-icon" aria-hidden="true">✓</div>
      <h3>Your request has been submitted!</h3>
      <p>${emailReady ? 'You’ll receive an email confirming your booking details.' : 'We’ll follow up using the contact information you provided to confirm your booking details.'}</p>
      <div class="sb-success-summary">
        <div><span>Requested date</span><strong>${escapeText(displayedDate(time))}</strong></div>
        <div><span>Requested time</span><strong>${escapeText(displayedTime(time))}</strong></div>
        <div><span>Contact</span><strong>${escapeText(data.email)}</strong></div>
        ${confirmation?.requestId ? `<div><span>Request ID</span><strong>${escapeText(confirmation.requestId)}</strong></div>` : ''}
      </div>
      <p class="sb-success-small">Please check your inbox and spam folder for any follow-up message.</p>
    </div>`;
  }
  function bookingEmailDetails(){
    const lines = [
      'STEADY HANDS — CONSULTATION REQUEST',
      '',
      'Services:',
      ...chosen.map(id => '- ' + (SERVICES.find(s => s.id === id)?.title || id)),
      '',
      'Requested date: ' + displayedDate(time),
      'Requested time: ' + displayedTime(time),
      'Pacific time: ' + localDay(time,BASE_TZ) + ' ' + localTime(time,BASE_TZ),
      'UTC timestamp: ' + time,
      '',
      'Business name: ' + data.business.trim(),
      'Contact name: ' + data.name.trim(),
      'Email: ' + data.email.trim(),
      'Phone: ' + data.phone.trim(),
      '',
      'Notes: ' + (data.notes.trim() || 'None'),
      '',
      'This is a request. The appointment is not confirmed until Steady Hands responds.'
    ];
    return lines.join('\n');
  }
  function launchEmailDraft(){
    const email = String(window.STEADY_BOOKING_REQUEST_EMAIL || 'kiara@steadyhandsop.com').trim();
    const subject = 'Steady Hands consultation request — ' + data.business.trim();
    const uri = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bookingEmailDetails())}`;
    // This launches the visitor's email application; it does not send the message.
    window.location.href = uri;
  }
  function renderEmailDraft(){
    stage.innerHTML = `<div class="sb-success-card">
      <div class="sb-email-icon" aria-hidden="true">✉</div>
      <h3>Finish sending your request</h3>
      <p>We've prepared an email with your consultation details. Please send it from your email app to submit your request. Your appointment is not confirmed yet.</p>
      <div class="sb-success-summary">
        <div><span>Requested date</span><strong>${escapeText(displayedDate(time))}</strong></div>
        <div><span>Requested time</span><strong>${escapeText(displayedTime(time))}</strong></div>
        <div><span>Contact</span><strong>${escapeText(data.email)}</strong></div>
      </div>
      <p class="sb-success-small">If your email app didn't open, copy the request below and send it using your preferred email service.</p>
      <button type="button" class="sb-copy-request" id="sb-copy-request">Copy booking request</button>
    </div>`;
    $('#sb-copy-request',stage).addEventListener('click',async event=>{
      const value = bookingEmailDetails();
      try {
        if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
        else throw new Error('Clipboard API unavailable');
      } catch {
        const textarea=document.createElement('textarea');textarea.value=value;
        textarea.style.position='fixed';textarea.style.left='-9999px';
        document.body.appendChild(textarea);textarea.select();
        const copied=document.execCommand('copy');textarea.remove();
        if(!copied){notice.textContent='Unable to copy automatically. Please use the email button instead.';return;}
      }
      event.currentTarget.textContent='Copied!';
    });
  }
  async function submitBooking(){
    if(sending)return;
    const endpoint=String(window.STEADY_BOOKING_SUBMIT_ENDPOINT||'').trim();
    if(!endpoint || !/^https:\/\/[^\s]+$/i.test(endpoint)){
      // No booking server is configured: offer a usable email-request path.
      // Never show a false confirmation for a request that was not recorded.
      step=6;render();launchEmailDraft();return;
    }
    sending=true;
    const next=$('#sb-next',root);
    next.disabled=true;
    next.textContent='Submitting…';
    notice.textContent='';
    try{
      const response=await fetch(endpoint,{
        method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({
          services:chosen.map(id=>({id,title:SERVICES.find(s=>s.id===id)?.title||id})),
          startTimeUTC:time,timezone:visitorTZ,
          customer:{business:data.business.trim(),name:data.name.trim(),email:data.email.trim(),phone:data.phone.trim(),notes:data.notes.trim()}
        })
      });
      if(response.status===409){step=2;time='';availabilityCache.clear();await fetchAvailability(date);notice.textContent='That time was just booked. Please choose another available time.';return;}
      if(!response.ok)throw new Error('Booking submission rejected');
      const result=await response.json();
      if(result?.success!==true || result?.status!=='submitted')throw new Error('Booking submission not acknowledged');
      confirmation={requestId:typeof result.requestId==='string'?result.requestId:'',emailConfirmationQueued:result.emailConfirmationQueued===true};
      step=5;render();
    }catch(error){
      console.warn('Booking request could not be submitted',error);
      notice.textContent='Your request could not be submitted. Please try again or use Contact Us.';
    }finally{
      sending=false;
      next.disabled=false;
      if(step===4)next.innerHTML='Submit';
    }
  }
  function render(){
    notice.textContent='';$('#sb-title',root).textContent=step===5?'Request Submitted':step===6?'Send Your Booking Request':steps[step];$('#sb-description',root).textContent=['Check your services before booking.','Choose the day that suits you.','Choose a preferred appointment time.','Tell us how to reach you.','Check your details before proceeding.','','Send the prepared email to request your appointment.'][step];
    root.querySelectorAll('[data-sb-progress]').forEach((bar,i)=>bar.classList.toggle('is-filled',i<=step));
    $('#sb-back',root).hidden=step===0||step===5;$('#sb-next',root).innerHTML=step===4?'Submit':step===5?'Done':step===6?'Open Email App':'Continue <span aria-hidden="true">→</span>';
    [renderServices,renderDate,renderTime,renderInfo,renderConfirm,renderSubmitted,renderEmailDraft][step]();
    $('.sb-main',root).scrollTop=0;
  }
  function open(){previousFocus=document.activeElement;confirmation=null;sending=false;chosen=read();reviewable=[...chosen];step=0;month=date?parseDay(date):new Date();month=new Date(month.getFullYear(),month.getMonth(),1);root.hidden=false;document.body.classList.add('sb-open');render();$('.sb-dialog',root).focus()}
  function close(){root.hidden=true;document.body.classList.remove('sb-open');previousFocus?.focus?.()}
  $('#sb-back',root).addEventListener('click',()=>{if(step>0){step--;render()}});
  $('#sb-next',root).addEventListener('click',()=>{
    if(step===1&&!date){notice.textContent='Please choose a date to continue.';return;}
    if(step===2&&!time){notice.textContent='Please choose an available time to continue.';return;}
    if(step===2&&availabilityState==='ready'&&!availableSlots.includes(time)){time='';renderTime();notice.textContent='That time has been booked. Please choose another.';return;}
    if(step===2&&availabilityState!=='ready'&&String(window.STEADY_AVAILABILITY_ENDPOINT||'').trim()){notice.textContent='Unable to verify availability. Please try again.';return;}
    if(step===2&&availabilityState==='loading'){notice.textContent='Checking availability. Please choose a time when the options load.';return;}
    if(step===3){const form=$('#sb-fields',stage);if(!form.reportValidity())return;}
    if(step===4){submitBooking();return;}
    if(step===5){close();return;}
    if(step===6){launchEmailDraft();return;}
    step++;render();if(step===2)fetchAvailability(date);
  });
  root.querySelectorAll('[data-sb-close]').forEach(el=>el.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(root.hidden)return;if(e.key==='Escape'){e.preventDefault();close()}});
  document.querySelectorAll('[data-open-review]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();open()}));
  window.addEventListener('steady-open-review',open);
  function syncCount(){const n=read().length;document.querySelectorAll('[data-service-count]').forEach(el=>el.textContent=n);document.querySelectorAll('.selection-dock').forEach(el=>el.classList.toggle('has-items',n>0));}
  window.addEventListener('steady-services-changed',syncCount);window.addEventListener('storage',syncCount);syncCount();
})();
