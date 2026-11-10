(() => {
'use strict';
const DATA=window.STEADY_SERVICES||[];
const STORAGE_KEY='steady-hands-selected-services-v1';
const getCart=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]').filter(id=>DATA.some(s=>s.id===id));}catch{return [];}};
const saveCart=cart=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(cart));}catch(e){console.warn('Unable to save selections',e);} sync();};
const sync=()=>{
 const cart=getCart();document.querySelectorAll('[data-service-count]').forEach(el=>el.textContent=cart.length);
 document.querySelectorAll('[data-service-add]').forEach(btn=>{
  const added=cart.includes(btn.dataset.serviceAdd);btn.classList.toggle('is-added',added);
  btn.setAttribute('aria-pressed',String(added));btn.setAttribute('aria-label',(added?'Remove ':'Add ')+(DATA.find(s=>s.id===btn.dataset.serviceAdd)?.title||'service'));
  btn.setAttribute('title',added?'Remove service':'Add service');btn.innerHTML=added?'<svg class="service-check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>':'<i class="bi bi-plus-lg" aria-hidden="true"></i>';
 });
 document.querySelectorAll('.selection-dock').forEach(el=>el.classList.toggle('has-items',cart.length>0));
};
const toggle=id=>{let cart=getCart();cart=cart.includes(id)?cart.filter(x=>x!==id):[...cart,id];saveCart(cart);};
document.querySelectorAll('[data-service-add]').forEach(btn=>btn.addEventListener('click',()=>toggle(btn.dataset.serviceAdd)));
const modal=document.getElementById('service-modal'),dialog=modal?.querySelector('.nb-dialog');let previousFocus=null,currentService=null;
// Public price information is presented only in the service details popup.
// These figures are the agency's published rates, not live registrar quotes.
const DOMAIN_RATES = [
  ['.com',20],['.net',26],['.org',20],['.co',45],['.biz',26],['.info',26],
  ['.online',40],['.xyz',20],['.shop',40],['.tech',80],['.io',60],
  ['.dev',15],['.app',20],['.llc',40],['.business',26],['.agency',30],['.ai',100]
];
const priceForService = service => {
  // Design/service fees below do not include printing, postage, or third-party subscriptions.
  if(service.id==='existing-business:Promotional direct-mail flyers')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Promotional flyer design</span><strong>$50 <small>starting at · one-time</small></strong></div></div>
    <p class="sh-price-note">Printing, postage, mail-list preparation, and delivery are priced by estimate and are not included in the design fee.</p>`;
  if(service.id==='existing-business:Service menu and pricing brochure design')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Basic menu or brochure design</span><strong>$40 <small>starting at · one-time</small></strong></div></div>
    <p class="sh-price-note">Design price is for a basic layout. Printed brochures, additional pages, and specialty finishes are quoted separately.</p>`;
  if(service.id==='existing-business:Customer loyalty cards and promotional stickers')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Custom loyalty card or sticker design</span><strong>$35 <small>starting at · one-time</small></strong></div></div>
    <p class="sh-price-note">Design-only starting price. Card and sticker production, material choices, quantities, and shipping are priced by estimate.</p>`;
  if(service.id==='existing-business:Business email migration and cleanup')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Mailbox migration or cleanup</span><strong>$25 <small>starting at · per mailbox</small></strong></div></div>
    <p class="sh-price-note">One-time service, starting at $25 per mailbox. Complex migrations, large mailboxes, and third-party subscription costs are quoted separately.</p>`;
  if(service.id==='existing-business:CRM and lead pipeline setup')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Basic CRM and pipeline setup</span><strong>$100 <small>starting at · one-time</small></strong></div></div>
    <p class="sh-price-note">Includes basic setup and pipeline organization. Integrations, advanced automations, and CRM software subscriptions are quoted separately.</p>`;
  if(service.id==='existing-business:Email Newsletter Design & Management')return `
    <div class="sh-price-rows">
      <div class="sh-price-row"><span>Single branded newsletter</span><strong>$25 <small>per newsletter</small></strong></div>
      <div class="sh-price-row"><span>Starter · 2 newsletters</span><strong>$40 <small>/ month</small></strong></div>
      <div class="sh-price-row"><span>Growth · 4 newsletters</span><strong>$75 <small>/ month</small></strong></div>
    </div>
    <p class="sh-price-note">Includes newsletter design and formatting. Sending-platform fees, contact-list cleanup, advanced automation, and complex content work are quoted separately.</p>`;
  if(service.id==='existing-business:Bookkeeping')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Bookkeeping support</span><strong>$250 <small>/ month</small></strong></div></div>
    <p class="sh-price-note">Monthly bookkeeping services starting at $250. Any additional scope is discussed before service begins.</p>`;
  if(service.id==='new-business:Google Business Profile setup and verification')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Google Business Profile setup</span><strong>$20 <small>one-time</small></strong></div></div>
    <p class="sh-price-note">Includes assistance with setting up your Google Business Profile and the verification process. Google's eligibility and verification requirements apply.</p>`;
  if(service.id==='new-business:Website Development')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Website development</span><strong>$100 <small>one-time</small></strong></div>
    <div class="sh-price-row"><span>Website hosting</span><strong>$20 <small>/ month</small></strong></div></div>
    <p class="sh-price-note">Website development is a one-time charge. Hosting is billed monthly. Additional services or custom work are quoted separately.</p>`;
  if(service.id==='new-business:Custom business domain registration')return `
    <label class="sh-domain-label" for="sh-domain-extension">Choose a domain extension</label>
    <select class="sh-domain-select" id="sh-domain-extension" aria-label="Domain extension and annual price">${DOMAIN_RATES.map(([ext,price])=>`<option value="${ext}">${ext} — $${price}/year</option>`).join('')}</select>
    <div class="sh-price-rows sh-domain-price"><div class="sh-price-row"><span id="sh-domain-selected-label">.com domain registration</span><strong><span id="sh-domain-selected-price">$20</span> <small>/ year</small></strong></div></div>
    <p class="sh-price-note">Prices shown are for one year of registration. Domain availability, renewals, and any transfer fees will be confirmed before purchase.</p>`;
  if(service.id==='new-business:Dynamic QR code creation')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Custom QR code creation</span><strong>$5 <small>one-time</small></strong></div></div>
    <p class="sh-price-note">Includes QR code setup for a destination of your choice. Additional design, printing, or third-party subscription fees, if applicable, are quoted separately.</p>`;
  if(service.id==='new-business:Premium business cards')return `
    <label class="sh-domain-label" for="sh-card-quantity">Quantity</label>
    <select class="sh-domain-select" id="sh-card-quantity" aria-label="Business card quantity">
      <option value="100">100 cards — $50</option><option value="500">500 cards — $100</option><option value="1000">1,000 cards — $250</option>
    </select>
    <p class="sh-card-includes">Full-color, double-sided (front and back) business cards on cardstock. Fully customizable design.</p>
    <p class="sh-card-finishes-heading">Optional finishing <small>(select one)</small></p>
    <div class="sh-card-finishes" role="group" aria-label="Optional card finishes">
      <button type="button" class="sh-card-pill is-selected" data-card-finish="none" aria-pressed="true">Standard <span>Included</span></button>
      <button type="button" class="sh-card-pill" data-card-finish="glossy" aria-pressed="false">Glossy lamination <span>+$10</span></button>
      <button type="button" class="sh-card-pill" data-card-finish="matte" aria-pressed="false">Matte lamination <span>+$15</span></button>
      <button type="button" class="sh-card-pill" data-card-finish="soft" aria-pressed="false">Soft touch <span>+$15</span></button>
    </div>
    <div class="sh-card-total" aria-live="polite"><span>Estimated card price</span><strong id="sh-card-total">$50</strong></div>
    <p class="sh-price-note">Shipping is not included. Different materials, specialty edges, shapes, and other custom options are available by estimate; pricing may vary with your specifications.</p>`;
  if(service.id==='new-business:Professional business email setup')return `
    <div class="sh-price-rows"><div class="sh-price-row"><span>Individual email account</span><strong>$5 <small>/ email / month</small></strong></div></div>
    <div class="sh-email-bundle"><div><span class="sh-bundle-tag">5-email bundle</span><p>Five professional email accounts</p></div>
       <div class="sh-bundle-amount"><del aria-label="Regular price 25 dollars per month">$25</del><strong>$20</strong><small>/ month</small></div></div>
    <p class="sh-price-note">A custom domain is required for professional email. You can use a domain you already own or register one with Steady Hands. Domain registration is billed separately (starting at $20/year for .com).</p>`;
  return `<p class="sh-estimate-label">Price based on estimate</p><p class="sh-price-note">Final pricing depends on your needs and will be provided for approval before work begins.</p>`;
};

const openDetails=id=>{
 const service=DATA.find(s=>s.id===id);if(!service||!modal)return;
 currentService=id;previousFocus=document.activeElement;
 document.getElementById('service-title').textContent=service.title;
 document.getElementById('service-description').textContent=service.description;
 let priceBox=modal.querySelector('#service-pricing');
 if(!priceBox){priceBox=document.createElement('div');priceBox.id='service-pricing';priceBox.className='sh-service-pricing';document.getElementById('service-description').insertAdjacentElement('afterend',priceBox);}
 priceBox.innerHTML=`<h3 class="sh-pricing-heading">Pricing</h3>${priceForService(service)}`;
 const domainSelect=priceBox.querySelector('#sh-domain-extension');
 domainSelect?.addEventListener('change',()=>{
   const rate=DOMAIN_RATES.find(([ext])=>ext===domainSelect.value);
   if(!rate)return;
   priceBox.querySelector('#sh-domain-selected-label').textContent=`${rate[0]} domain registration`;
   priceBox.querySelector('#sh-domain-selected-price').textContent=`$${rate[1]}`;
 });
 const cardQuantity=priceBox.querySelector('#sh-card-quantity');
 if(cardQuantity){
   const baseRates={'100':50,'500':100,'1000':250};
   const finishRates={none:0,glossy:10,matte:15,soft:15};
   let finish='none';
   const updateCardTotal=()=>{
     const total=baseRates[cardQuantity.value]+finishRates[finish];
     priceBox.querySelector('#sh-card-total').textContent=`$${total}`;
   };
   cardQuantity.addEventListener('change',updateCardTotal);
   priceBox.querySelectorAll('[data-card-finish]').forEach(button=>button.addEventListener('click',()=>{
     finish=button.dataset.cardFinish;
     priceBox.querySelectorAll('[data-card-finish]').forEach(pill=>{
       const active=pill.dataset.cardFinish===finish;
       pill.classList.toggle('is-selected',active);
       pill.setAttribute('aria-pressed',String(active));
     });
     updateCardTotal();
   }));
 }



 modal.hidden=false;document.body.style.overflow='hidden';dialog?.focus();
 const add=modal.querySelector('#modal-add-service');if(add)add.textContent=getCart().includes(id)?'Remove Service −':'Add Service +';
};
const closeDetails=()=>{if(!modal)return;modal.hidden=true;document.body.style.overflow='';previousFocus?.focus();};
document.querySelectorAll('[data-service-details]').forEach(btn=>btn.addEventListener('click',()=>openDetails(btn.dataset.serviceDetails)));
modal?.querySelector('#modal-add-service')?.addEventListener('click',()=>{if(currentService){toggle(currentService);modal.querySelector('#modal-add-service').textContent=getCart().includes(currentService)?'Remove Service −':'Add Service +';}});
modal?.querySelectorAll('[data-close-service]').forEach(el=>el.addEventListener('click',closeDetails));
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#mobile-nav');
const closeMenu=()=>{if(!menu||!nav)return;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open menu');nav.hidden=true;nav.querySelectorAll('.mobile-nav-trigger').forEach(t=>{t.setAttribute('aria-expanded','false');const p=document.getElementById(t.getAttribute('aria-controls'));if(p)p.hidden=true;});};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));menu.setAttribute('aria-label',open?'Open menu':'Close menu');nav.hidden=open;});
nav?.querySelectorAll('.mobile-nav-trigger').forEach(t=>t.addEventListener('click',()=>{const open=t.getAttribute('aria-expanded')==='true';t.setAttribute('aria-expanded',String(!open));document.getElementById(t.getAttribute('aria-controls')).hidden=open;}));
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.querySelectorAll('.nav-trigger').forEach(t=>t.addEventListener('click',()=>{const open=t.getAttribute('aria-expanded')==='true';document.querySelectorAll('.nav-trigger').forEach(x=>x.setAttribute('aria-expanded','false'));t.setAttribute('aria-expanded',String(!open));}));
document.addEventListener('click',e=>{if(!e.target.closest('.nav-dropdown'))document.querySelectorAll('.nav-trigger').forEach(x=>x.setAttribute('aria-expanded','false'));if(nav&&!nav.hidden&&!e.target.closest('.mobile-nav')&&!e.target.closest('.menu-toggle'))closeMenu();});
document.querySelectorAll('[data-nb-start],[data-get-started],[data-get-started-mobile]').forEach(btn=>btn.addEventListener('click',()=>{closeMenu();window.dispatchEvent(new Event('steady-open-review'));}));
document.querySelectorAll('[data-info]').forEach(btn=>btn.addEventListener('click',()=>location.href='index.html?info='+encodeURIComponent(btn.dataset.info)));
const requested=new URLSearchParams(location.search).get('service');
if(requested){const service=DATA.find(s=>s.title===requested&&s.page===location.pathname.split('/').pop());if(service){openDetails(service.id);history.replaceState(null,'',location.pathname+location.hash);}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(modal&&!modal.hidden)closeDetails();else{closeMenu();document.querySelectorAll('.nav-trigger').forEach(t=>t.setAttribute('aria-expanded','false'));}}if(e.key==='Tab'&&modal&&!modal.hidden){const items=[...dialog.querySelectorAll('a[href],button:not([disabled])')];if(items.length){if(e.shiftKey&&document.activeElement===items[0]){items.at(-1).focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){items[0].focus();e.preventDefault();}}}});
window.addEventListener('storage',sync);if(document.getElementById('year'))document.getElementById('year').textContent=new Date().getFullYear();sync();
})();
