'use strict';
const config = window.STEADY_HANDS;
const dialog = document.querySelector('#modal');
const title = document.querySelector('#modal-title');
const content = document.querySelector('#modal-content');
let previousFocus;
function escapeHTML(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function go(url) {
  try { const parsed = new URL(url); if (!['https:', 'http:'].includes(parsed.protocol)) return false; window.location.assign(parsed.href); return true; } catch { return false; }
}
function modal(heading, body) { previousFocus = document.activeElement; title.textContent = heading; content.innerHTML = body; dialog.showModal(); document.body.classList.add('modal-open'); }
function contactButton(label, subject) { return `<a class="button primary" href="mailto:${encodeURIComponent(config.email)}?subject=${encodeURIComponent(subject)}">${escapeHTML(label)}</a>`; }
function close() { dialog.close(); }
document.querySelector('.close').addEventListener('click', close);
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); previousFocus?.focus(); });
dialog.addEventListener('click', e => { if(e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } });
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav');
function setMenu(open) { nav.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); }
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a,button').forEach(el => el.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (window.innerWidth <= 820 && nav.classList.contains('open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
  switch(button.dataset.action) {
    case 'preview':
      if(config.previewPortalUrl && go(config.previewPortalUrl)) return;
      modal('View your website preview', `<p>Enter the preview code provided by Steady Hands, or open the personal preview link you received.</p><form id="preview-form"><label for="preview-code">Preview code</label><input id="preview-code" name="code" required autocomplete="off"><p class="form-message" id="preview-message" role="status"></p><button class="button primary" type="submit">Open Preview</button></form><p class="note">Need your preview link?</p>${contactButton('Request My Preview', 'Please send my website preview')}`);
      document.querySelector('#preview-form').addEventListener('submit', e => { e.preventDefault(); const code = document.querySelector('#preview-code').value.trim(); const url = Object.entries(config.previews || {}).find(([key]) => key.toLowerCase() === code.toLowerCase())?.[1]; if(url && go(url)) return; document.querySelector('#preview-message').textContent = 'This preview code is not available. Contact Steady Hands for your personal link.'; }); break;
    case 'login':
      if(config.clientPortalUrl && go(config.clientPortalUrl)) return;
      modal('Client dashboard', `<p>Online client access is not connected yet. Contact Steady Hands to manage your website, request updates, or get help with hosting.</p>${contactButton('Contact Steady Hands', 'Client dashboard access')}`); break;
    case 'references':
      if(config.referencesUrl && go(config.referencesUrl)) return;
      modal('Client references', config.references?.length ? config.references.map(ref => `<article><h3>${escapeHTML(ref.business)}</h3><p>${escapeHTML(ref.quote)}</p></article>`).join('') : `<p>Contact Steady Hands for current client references and completed website examples.</p>${contactButton('Request References', 'Website references')}`); break;
    case 'changes': modal('Request website changes', `<p>Tell us your business name, website address, and the changes you would like.</p>${contactButton('Email My Changes', 'Website change request')}`); break;
    case 'billing': if(config.billingUrl && go(config.billingUrl)) return; modal('Manage billing', `<p>Contact Steady Hands for invoices, hosting payments, or changes to your plan.</p>${contactButton('Contact About Billing', 'Website hosting and billing')}`); break;
  }
}));
document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.example;
  if(config.examples[key] && go(config.examples[key])) return;
  const label = {landscaping:'Landscaping', cleaning:'Cleaning', barbershop:'Barbershop'}[key];
  const style = {landscaping:'landscape', cleaning:'clean', barbershop:'barber'}[key];
  modal(`${label} website example`, `<div class="site-shot ${style}" role="img" aria-label="${label} concept website"></div><p>This is a sample design. Contact us to see available live websites or discuss a similar website for your business.</p>${contactButton('Ask About This Design', `${label} website design`)}`);
}));
document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => {
  const plan = button.dataset.plan;
  if(config.checkout[plan] && go(config.checkout[plan])) return;
  modal('Get your website', `<p>$100 one-time development + ${plan === 'Standard Hosting' ? '$20' : '$30'}/month ${escapeHTML(plan)}.</p><form id="order-form"><label for="business">Business name</label><input name="business" id="business" required autocomplete="organization"><label for="email">Your email</label><input name="email" id="email" type="email" required autocomplete="email"><label for="details">What does your business need?</label><textarea name="details" id="details" rows="3" required></textarea><button class="button primary" type="submit">Email My Website Request</button><p class="note">Opens your email app with the request ready to review and send. Payment is arranged separately.</p></form>`);
  document.querySelector('#order-form').addEventListener('submit', e => { e.preventDefault(); const form = new FormData(e.target); const body = `Business: ${form.get('business')}\nEmail: ${form.get('email')}\nPlan: ${plan}\n\nWebsite needs:\n${form.get('details')}`; window.location.href = `mailto:${encodeURIComponent(config.email)}?subject=${encodeURIComponent('New website request — '+plan)}&body=${encodeURIComponent(body)}`; });
}));


(function steadyHandsPreviewFlow(){
  const TEMPLATE_CATEGORIES = ["acupuncture","agricultural-service","animal-feed-store","antique-store","apartments-housing","appliance-repair","architect","art-gallery","artist-studio","assisted-living","attorney-law","auction-house","auto-body","auto-dealer","auto-detailing","auto-glass","auto-parts-accessories","auto-repair","auto-salvage-junkyard","awning-canopy","bail-bonds","bakery-desserts","bar-pub","barber-salon","beauty","beer-distributor","boat-dealer","boat-marina","boat-repair","butcher-meat-market","cabin-rental","cabinet-countertop","cabinetry","cafe-boba","car-wash","carpentry-woodworking","catering-food-truck","cattle-poultry-farm","chimney-fireplace","chiropractic","cleaning","clothing-boutique","coffee-shop","coin-dealer","community-center","computer-repair","concrete-masonry","construction","consulting","convenience-store","counseling-mental-health","countertop-stone","dance-school","day-spa-med-spa","daycare-childcare","deck-fence-outdoor-structures","deck-patio","deli","demolition","dentist","dog-breeder","driving-school","drywall","electrical","employment-agency","engine-rebuilding","engraving-trophies","equipment-rental","estate-liquidation","event-venue","events","excavation","farm-ranch-agriculture","farm-stand-produce","feed-farm-supply","fence-contractor","financial-advisor","firewood-supplier","fitness","flooring","florist","food-bakery","funeral-home","furniture-store","garage-door","gas-station","general-repair-service","generic","glass-mirror","glass-repair","glass-window-door","golf-cart-dealer","graphic-design","grocery-market","gutter-siding","gymnastics","handyman","hardware-building-supply","hearing-aid-audiology","hearing-health","heavy-equipment-sales-service","home-health-care","home-improvement-center","home-inspection","horse-boarding-stable","hvac","hydraulics","ice-cream-dessert","insulation","insurance","interior-design","irrigation-sprinkler","jewelry","junk-removal-hauling","land-surveyor","landscaping","laundry","liquor-store","locksmith","machine-shop","manufacturing-industrial","marina-marine","marine-hardware","martial-arts","massage-spa","medical-clinic","medical-doctor-specialist","medical-supply-equipment","metal-ironwork","mobile-home-supply","motorcycle-powersports","moving-company","musician-band","notary-document-services","office-space-rental","optometry","painting","park-recreation","parking-lot-truck-parking","parking-storage","party-rentals","paving-asphalt","pawn-shop","pest-control","pet-grooming","pet-store","pharmacy","photo-booth","photography-video","physical-therapy","plant-nursery-garden","plumbing","podiatry","pool-service","preschool-learning-center","pressure-washing","private-investigator","professional","propane-supplier","property-maintenance","property-management","property-services","real-estate","remodeling-renovation","restaurant","retail","roofing","rv-mobile-home-park","rv-repair","security-systems","septic-service","shopping-center","sign-printing","small-engine-repair","smoke-vape-tobacco","sod-lawn-supply","solar","speech-therapy","storage","surf-shop","tailor-alterations","tanning","tattoo-piercing","tax-accounting","taxidermy","thrift-store","tire-shop","title-escrow-company","towing","trailer-repair-dealer","transmission-shop","transportation-limo","tree-service","truck-dealer","truck-parking","truck-repair","trucking-freight","upholstery","utility-gas-company","vacation-rental","vehicle-inspection","veterinary","warehouse-logistics","waste-management","water-damage-restoration","water-well-pump","weight-loss-service","welding-fabrication","wellness-center","wholesale-distributor","window-tinting","yoga"];
  let templateSlugsCache=TEMPLATE_CATEGORIES;

  async function supabaseRequest(path, options={}){
    if(!config?.supabaseUrl || !config?.supabaseAnonKey) throw new Error('Supabase is not configured.');
    const headers={
      apikey:config.supabaseAnonKey,
      Authorization:`Bearer ${config.supabaseAnonKey}`,
      'Content-Type':'application/json',
      ...(options.headers||{})
    };
    const response=await fetch(`${config.supabaseUrl}/rest/v1/${path}`,{...options,headers});
    const text=await response.text();
    let data=null;
    try{data=text?JSON.parse(text):null}catch{data=text}
    if(!response.ok) throw new Error(data?.message||data?.error||`Request failed (${response.status})`);
    return data;
  }

  async function savePreviewRequest(record){
    return supabaseRequest('preview_requests',{
      method:'POST',
      headers:{Prefer:'return=minimal'},
      body:JSON.stringify({
        preview_type:record.mode==='full'?'full':'short',
        company_name:record.businessName,
        business_category:record.categoryLabel||record.category,
        template_key:record.category,
        email:record.email,
        phone:record.phone||null,
        services:Array.isArray(record.services)?record.services.join(', '):(record.services||null),
        about_business:record.about||null,
        address_or_service_area:record.address||null,
        instagram_url:record.instagram||null,
        facebook_url:record.facebook||null,
        tiktok_url:record.tiktok||null,
        website_url:record.website||null
      })
    });
  }

  async function getSiteByKey(code){
    const rows=await supabaseRequest('rpc/get_site_by_key',{
      method:'POST',
      body:JSON.stringify({p_site_key:String(code||'').trim()})
    });
    const row=Array.isArray(rows)?rows[0]:rows;
    if(!row) return null;
    return {
      siteKey:row.site_key,
      category:row.template_key||'generic',
      categoryLabel:row.business_category||'',
      businessName:row.company_name||'',
      email:row.public_email||'',
      phone:row.public_phone||'',
      services:String(row.services||'').split(/[,\n]/).map(v=>v.trim()).filter(Boolean),
      about:row.about_business||'',
      description:row.about_business||'',
      address:row.address_or_service_area||'',
      instagram:row.instagram_url||'',
      facebook:row.facebook_url||'',
      tiktok:row.tiktok_url||'',
      website:row.website_url||''
    };
  }

  async function saveContactRequest(payload){
    return supabaseRequest('contact_requests',{
      method:'POST',
      headers:{Prefer:'return=minimal'},
      body:JSON.stringify(payload)
    });
  }

  function toB64(value){
    const bytes=new TextEncoder().encode(value);
    let binary='';
    bytes.forEach(byte=>binary+=String.fromCharCode(byte));
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  function fromB64(value){
    const normalized=value.replace(/-/g,'+').replace(/_/g,'/');
    const raw=atob(normalized+'='.repeat((4-normalized.length%4)%4));
    const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function portableSiteKey(record){
    return `SH1.${toB64(JSON.stringify(record))}`;
  }

  function decodePortableSiteKey(code){
    if(!String(code).startsWith('SH1.')) return null;
    try{return JSON.parse(fromB64(String(code).slice(4)))}catch{return null}
  }

  function labelFromSlug(slug){
    return String(slug||'').split('-').map(w=>w?`${w[0].toUpperCase()}${w.slice(1)}`:'').join(' ');
  }

  async function loadTemplateSlugs(){
    if(templateSlugsCache) return templateSlugsCache;
    const names=['Previews/templates.br.00','Previews/templates.br.01','Previews/templates.br.02','Previews/templates.br.03'];
    const parts=await Promise.all(names.map(async n=>{
      const r=await fetch(n,{cache:'force-cache'});
      if(!r.ok) throw new Error('Could not load categories.');
      return r.text();
    }));
    const raw=atob(parts.join('').replace(/\s+/g,''));
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++) bytes[i]=raw.charCodeAt(i);
    const brotli=await import('https://unpkg.com/@kyr0/brotli-wasm@3.1.0/index.web.js?module').then(m=>m.default);
    const templates=JSON.parse(new TextDecoder().decode(brotli.decompress(bytes)));
    templateSlugsCache=Object.keys(templates).sort((a,b)=>labelFromSlug(a).localeCompare(labelFromSlug(b)));
    return templateSlugsCache;
  }

  function openCategorySite(record){
    const category=(record.category||'generic').toLowerCase();
    const data=toB64(JSON.stringify(record));
    const key=record.siteKey||portableSiteKey(record);
    location.href=`Previews/${encodeURIComponent(category)}.html?sitekey=${encodeURIComponent(key)}&data=${encodeURIComponent(data)}`;
  }

  async function resolveSiteKey(code){
    const portable=decodePortableSiteKey(code);
    if(portable) return {...portable,siteKey:code};
    const local=Object.entries(config.siteKeys||{}).find(([key])=>key.toLowerCase()===String(code).toLowerCase())?.[1];
    if(local) return {...local,siteKey:code};
    try{return await getSiteByKey(code)}catch(err){console.warn('Site-key lookup failed',err);return null}
  }


  const CATEGORY_GROUPS = [
    {name:'Home & Trades', icon:'⌂', words:['appliance','awning','cabinet','carpentry','chimney','concrete','construction','countertop','deck','demolition','drywall','electrical','excavation','fence','firewood','flooring','garage','glass','gutter','handyman','hardware','home-improvement','home-inspection','hvac','insulation','interior-design','irrigation','junk-removal','land-surveyor','landscaping','locksmith','painting','paving','pest-control','plumbing','pool-service','pressure-washing','property-maintenance','remodeling','roofing','septic','sod','solar','tree-service','water-damage','water-well','welding']},
    {name:'Auto & Transportation', icon:'◈', words:['auto-','boat-','car-wash','engine-rebuilding','golf-cart','marine-','mobile-home','motorcycle','moving-company','rv-','tire-shop','towing','trailer-','transmission','transportation','truck-','trucking','vehicle-inspection']},
    {name:'Food & Hospitality', icon:'◉', words:['bakery','bar-pub','beer-distributor','butcher','cafe','catering','coffee-shop','convenience-store','deli','food-bakery','grocery','ice-cream','liquor-store','restaurant','vacation-rental','cabin-rental']},
    {name:'Health & Wellness', icon:'✚', words:['acupuncture','assisted-living','chiropractic','counseling','day-spa','dentist','fitness','hearing','home-health','massage','medical-','optometry','pharmacy','physical-therapy','podiatry','speech-therapy','weight-loss','wellness','yoga']},
    {name:'Beauty & Personal Care', icon:'✦', words:['barber-salon','beauty','pet-grooming','tanning','tattoo-piercing']},
    {name:'Professional Services', icon:'▣', words:['architect','attorney','bail-bonds','consulting','employment-agency','financial-advisor','insurance','notary','private-investigator','professional','tax-accounting','title-escrow']},
    {name:'Retail & Shopping', icon:'◇', words:['antique-store','clothing-boutique','coin-dealer','furniture-store','jewelry','pawn-shop','pet-store','retail','shopping-center','smoke-vape','surf-shop','tailor','thrift-store']},
    {name:'Property & Real Estate', icon:'▤', words:['apartments','office-space','park-recreation','parking','property-management','property-services','real-estate','storage']},
    {name:'Events & Creative', icon:'✧', words:['art-gallery','artist-studio','auction-house','dance-school','engraving','estate-liquidation','event-venue','events','florist','funeral-home','graphic-design','musician-band','party-rentals','photo-booth','photography-video','sign-printing']},
    {name:'Industrial & Logistics', icon:'⚙', words:['equipment-rental','heavy-equipment','hydraulics','machine-shop','manufacturing','metal-ironwork','propane','utility-gas','warehouse-logistics','waste-management','wholesale-distributor']},
    {name:'Education & Community', icon:'◎', words:['community-center','daycare','driving-school','gymnastics','martial-arts','preschool-learning-center']},
    {name:'Other', icon:'•••', words:[]}
  ];

  const POPULAR_CATEGORIES = [
    'cleaning','landscaping','plumbing','roofing','barber-salon','restaurant','auto-repair','real-estate'
  ];

  const SEARCH_ALIASES = {
    'barber-salon':['hair','hair salon','barbershop','barber','salon'],
    'hvac':['ac','air conditioning','heating','air conditioner'],
    'attorney-law':['lawyer','legal','law'],
    'landscaping':['yard','lawn','gardener','landscape'],
    'cleaning':['maid','house cleaning','janitorial'],
    'auto-repair':['mechanic','car repair','garage'],
    'real-estate':['realtor','realtor','homes','house'],
    'restaurant':['food','dining'],
    'dentist':['dental'],
    'plumbing':['plumber'],
    'electrical':['electrician']
  };

  function categoryGroup(slug){
    const found=CATEGORY_GROUPS.find(group=>group.words.some(word=>slug.includes(word)));
    return found?.name||'Other';
  }

  function groupedCategories(){
    const groups=new Map(CATEGORY_GROUPS.map(group=>[group.name,[]]));
    TEMPLATE_CATEGORIES
      .filter(slug=>slug!=='generic')
      .forEach(slug=>groups.get(categoryGroup(slug)).push(slug));
    for(const values of groups.values()) values.sort((a,b)=>labelFromSlug(a).localeCompare(labelFromSlug(b)));
    return [...groups.entries()].filter(([,values])=>values.length);
  }

  function categoryField(){
    return `
      <div class="form-field custom-category-field">
        <span class="custom-category-label">Business type</span>
        <input type="hidden" id="preview-category-value" name="category" required>
        <button class="category-picker-toggle" id="preview-category-toggle" type="button"
          aria-haspopup="dialog" aria-expanded="false" aria-controls="preview-category-popup">
          <span class="category-picker-value">Select your business type</span>
          <span class="category-picker-chevron" aria-hidden="true">⌄</span>
        </button>

        <div class="category-picker-overlay" id="preview-category-overlay" hidden>
          <div class="category-picker-popup" id="preview-category-popup" role="dialog" aria-modal="true" aria-label="Choose your business type">
            <div class="category-picker-popup-head">
              <div>
                <strong>Choose your business type</strong>
                <span id="category-picker-subtitle">Search or browse by industry</span>
              </div>
              <button class="category-picker-close" type="button" aria-label="Close category picker">×</button>
            </div>
            <div class="category-picker-search-wrap">
              <input class="category-picker-search" id="preview-category-search" type="search"
                placeholder="Search business types…" autocomplete="off" aria-label="Search business types">
            </div>
            <div class="category-picker-groups" id="category-picker-content" aria-live="polite"></div>
          </div>
        </div>
      </div>`;
  }

  function hydrateCategoryList(){
    const field=document.querySelector('.custom-category-field');
    const toggle=document.querySelector('#preview-category-toggle');
    const overlay=document.querySelector('#preview-category-overlay');
    const popup=document.querySelector('#preview-category-popup');
    const search=document.querySelector('#preview-category-search');
    const contentEl=document.querySelector('#category-picker-content');
    const hidden=document.querySelector('#preview-category-value');
    const valueEl=toggle?.querySelector('.category-picker-value');
    const closeButton=overlay?.querySelector('.category-picker-close');
    const subtitle=document.querySelector('#category-picker-subtitle');
    if(!field||!toggle||!overlay||!popup||!search||!contentEl||!hidden||!valueEl||!closeButton||!subtitle) return;

    const groups=groupedCategories();
    let activeGroup=null;

    const matchesSearch=(slug,q)=>{
      const label=labelFromSlug(slug).toLowerCase();
      const aliases=(SEARCH_ALIASES[slug]||[]).join(' ').toLowerCase();
      return label.includes(q)||slug.includes(q)||aliases.includes(q);
    };

    const optionButton=slug=>`<button type="button" class="category-picker-option" role="option"
      data-category="${escapeHTML(slug)}" aria-selected="${hidden.value===slug?'true':'false'}">
      <span>${escapeHTML(labelFromSlug(slug))}</span>
    </button>`;

    const renderHome=()=>{
      activeGroup=null;
      subtitle.textContent='Search or browse by industry';
      const popular=POPULAR_CATEGORIES.filter(slug=>TEMPLATE_CATEGORIES.includes(slug));
      contentEl.innerHTML=`
        <section class="category-popular">
          <div class="category-section-title">Popular businesses</div>
          <div class="category-popular-grid">
            ${popular.map(optionButton).join('')}
          </div>
        </section>
        <section class="category-browse">
          <div class="category-section-title">Browse by industry</div>
          <div class="category-group-grid">
            ${groups.map(([name,slugs])=>{
              const meta=CATEGORY_GROUPS.find(group=>group.name===name);
              return `<button type="button" class="category-group-card" data-category-group="${escapeHTML(name)}">
                <span class="category-group-icon" aria-hidden="true">${escapeHTML(meta?.icon||'•')}</span>
                <span class="category-group-copy">
                  <strong>${escapeHTML(name)}</strong>
                  <small>${slugs.length} business types</small>
                </span>
                <span class="category-group-arrow" aria-hidden="true">→</span>
              </button>`;
            }).join('')}
          </div>
        </section>`;
    };

    const renderGroup=name=>{
      activeGroup=name;
      const group=groups.find(([groupName])=>groupName===name);
      if(!group){renderHome();return}
      subtitle.textContent=name;
      contentEl.innerHTML=`
        <button type="button" class="category-back-button" data-category-back>
          <span aria-hidden="true">←</span> Back to industries
        </button>
        <div class="category-group-view-title">
          <strong>${escapeHTML(name)}</strong>
          <span>${group[1].length} business types</span>
        </div>
        <div class="category-picker-options category-picker-options-drilldown">
          ${group[1].map(optionButton).join('')}
        </div>`;
      contentEl.scrollTop=0;
    };

    const renderSearch=query=>{
      const q=query.trim().toLowerCase();
      if(!q){
        if(activeGroup) renderGroup(activeGroup);
        else renderHome();
        return;
      }
      activeGroup=null;
      subtitle.textContent='Search results';
      const matches=TEMPLATE_CATEGORIES
        .filter(slug=>slug!=='generic'&&matchesSearch(slug,q))
        .sort((a,b)=>labelFromSlug(a).localeCompare(labelFromSlug(b)));
      contentEl.innerHTML=matches.length
        ? `<div class="category-search-results">
            <div class="category-section-title">${matches.length} result${matches.length===1?'':'s'}</div>
            <div class="category-picker-options category-picker-options-search">
              ${matches.map(optionButton).join('')}
            </div>
          </div>`
        : '<p class="category-picker-empty">No business types found. Try another word.</p>';
      contentEl.scrollTop=0;
    };

    const open=()=>{
      overlay.hidden=false;
      toggle.setAttribute('aria-expanded','true');
      field.classList.add('is-open');
      search.value='';
      renderHome();
      contentEl.scrollTop=0;
      requestAnimationFrame(()=>search.focus({preventScroll:true}));
    };

    const closePicker=()=>{
      overlay.hidden=true;
      toggle.setAttribute('aria-expanded','false');
      field.classList.remove('is-open');
    };

    const chooseCategory=slug=>{
      hidden.value=slug;
      valueEl.textContent=labelFromSlug(slug);
      valueEl.classList.add('has-value');
      closePicker();
      toggle.focus();
    };

    toggle.addEventListener('click',open);
    closeButton.addEventListener('click',closePicker);
    overlay.addEventListener('click',event=>{
      if(event.target===overlay) closePicker();
    });
    search.addEventListener('input',()=>renderSearch(search.value));

    contentEl.addEventListener('click',event=>{
      const option=event.target.closest('[data-category]');
      if(option){chooseCategory(option.dataset.category);return}
      const groupButton=event.target.closest('[data-category-group]');
      if(groupButton){
        search.value='';
        renderGroup(groupButton.dataset.categoryGroup);
        return;
      }
      if(event.target.closest('[data-category-back]')){
        search.value='';
        renderHome();
      }
    });

    popup.addEventListener('keydown',event=>{
      if(event.key==='Escape'){
        event.preventDefault();
        closePicker();
        toggle.focus();
      }
    });

    renderHome();
  }

  function showPreviewForm(mode){
    const full=mode==='full';
    modal(full?'Full Preview':'Short Preview',`
      <p class="make-flow-intro">${full?'Tell us a little more so the preview feels like your business.':'Just the basics. We’ll build a starting point.'}</p>
      <form id="make-preview-form" class="make-preview-form ${full?'full-preview-form':'short-preview-form'}">
        <div class="form-grid-two preview-main-row">
          <label class="form-field"><span>Company name</span><input name="businessName" required autocomplete="organization"></label>
          ${categoryField()}
        </div>
        ${full
          ? `<div class="form-grid-two preview-contact-row">
              <label class="form-field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
              <label class="form-field"><span>Phone <em>Optional</em></span><input name="phone" type="tel" autocomplete="tel"></label>
            </div>`
          : `<label class="form-field preview-email-full"><span>Email</span><input name="email" type="email" required autocomplete="email"><small>We’ll send your preview details here.</small></label>`
        }
        ${full?`
          <label><span>Services <em>Optional</em></span><textarea name="services" rows="3" placeholder="One per line or separated by commas"></textarea></label>
          <label><span>About your business <em>Optional</em></span><textarea name="about" rows="3" placeholder="A short description is plenty."></textarea></label>
          <label><span>Address or service area <em>Optional</em></span><input name="address" autocomplete="street-address"></label>
          <label><span>Current website <em>Optional</em></span><input name="website" type="url" placeholder="https://"></label>
          <details class="social-details"><summary>Social media <span>Optional</span></summary>
            <div class="form-grid-two social-fields">
              <label><span>Instagram</span><input name="instagram" type="url" placeholder="https://instagram.com/..."></label>
              <label><span>Facebook</span><input name="facebook" type="url" placeholder="https://facebook.com/..."></label>
              <label><span>TikTok</span><input name="tiktok" type="url" placeholder="https://tiktok.com/@..."></label>
              <label><span>Yelp / Google link</span><input name="yelp" type="url" placeholder="https://"></label>
            </div>
          </details>
          <p class="make-flow-note">Don’t have everything yet? That’s okay. Fill out what you know.</p>
        `:''}
        <p class="form-message" id="make-preview-message" role="status"></p>
        <button class="button primary" type="submit">Create My Preview <span aria-hidden="true">→</span></button>
      </form>`);
    hydrateCategoryList();
    document.querySelector('#make-preview-form')?.addEventListener('submit',async e=>{
      e.preventDefault();
      const form=new FormData(e.currentTarget);
      const category=(form.get('category')||'').toString().trim();
      const message=document.querySelector('#make-preview-message');
      if(!category){
        message.textContent='Choose your business type from the list.';
        return;
      }
      const record={
        mode,
        businessName:(form.get('businessName')||'').toString().trim(),
        category,
        categoryLabel:labelFromSlug(category),
        email:(form.get('email')||'').toString().trim(),
        phone:(form.get('phone')||'').toString().trim(),
        services:(form.get('services')||'').toString().split(/[,\n]/).map(v=>v.trim()).filter(Boolean),
        about:(form.get('about')||'').toString().trim(),
        description:(form.get('about')||'').toString().trim(),
        address:(form.get('address')||'').toString().trim(),
        website:(form.get('website')||'').toString().trim(),
        instagram:(form.get('instagram')||'').toString().trim(),
        facebook:(form.get('facebook')||'').toString().trim(),
        tiktok:(form.get('tiktok')||'').toString().trim(),
        yelp:(form.get('yelp')||'').toString().trim()
      };
      record.siteKey=portableSiteKey(record);
      message.textContent='Creating your preview…';
      try{await savePreviewRequest(record)}catch(err){console.warn('Preview request save failed',err)}
      openCategorySite(record);
    });
  }

  function showMakeSiteChoice(){
    modal('Make Your Site',`
      <p class="make-flow-intro">How much do you want to tell us?</p>
      <div class="preview-choice-grid">
        <button class="preview-choice" type="button" data-preview-choice="short"><strong>Short Preview</strong><span>Company name, category, and email.</span></button>
        <button class="preview-choice" type="button" data-preview-choice="full"><strong>Full Preview</strong><span>A few extra details for a more tailored preview.</span></button>
      </div>`);
    content.querySelectorAll('[data-preview-choice]').forEach(btn=>btn.addEventListener('click',()=>showPreviewForm(btn.dataset.previewChoice)));
  }

  function showContact(){
    modal('Contact Us',`
      <div class="contact-choice-tabs">
        <button class="contact-tab active" type="button" data-contact-tab="text">Text</button>
        <button class="contact-tab" type="button" data-contact-tab="email">Email</button>
        <button class="contact-tab" type="button" data-contact-tab="call">Schedule a Call</button>
      </div>
      <div id="contact-panel"></div>`);
    const panel=document.querySelector('#contact-panel');
    const render=type=>{
      content.querySelectorAll('.contact-tab').forEach(b=>b.classList.toggle('active',b.dataset.contactTab===type));
      if(type==='text') panel.innerHTML=`<div class="contact-panel-card"><p>Have a quick question? Send us a text.</p><strong>(702) 372-6399</strong><a class="button primary" href="sms:+17023726399">Send a Text</a></div>`;
      if(type==='email') panel.innerHTML=`<div class="contact-panel-card"><p>Send us what you need and we’ll get back to you.</p><strong>${escapeHTML(config.email)}</strong><a class="button primary" href="mailto:${encodeURIComponent(config.email)}">Email Us</a></div>`;
      if(type==='call'){
        panel.innerHTML=`<form id="schedule-call-form" class="make-preview-form"><p>Tell us when you’re available. We’ll follow up to confirm a time.</p><label><span>Name</span><input name="name" required autocomplete="name"></label><div class="form-grid-two"><label><span>Email</span><input name="email" type="email" autocomplete="email"></label><label><span>Phone</span><input name="phone" type="tel" autocomplete="tel"></label></div><label><span>When are you available?</span><textarea name="availability" rows="3" required placeholder="Example: Tuesday after 2 PM"></textarea></label><p class="form-message" id="call-message" role="status"></p><button class="button primary" type="submit">Request a Call</button></form>`;
        document.querySelector('#schedule-call-form')?.addEventListener('submit',async e=>{
          e.preventDefault();
          const f=new FormData(e.currentTarget);
          const msg=document.querySelector('#call-message');
          const payload={contact_type:'schedule_call',name:String(f.get('name')||''),email:String(f.get('email')||'')||null,phone:String(f.get('phone')||'')||null,message:null,availability:String(f.get('availability')||'')};
          if(!payload.email&&!payload.phone){msg.textContent='Add an email or phone number so we can reach you.';return}
          msg.textContent='Sending…';
          try{await saveContactRequest(payload);msg.textContent='Got it. We’ll follow up to confirm a time.'}
          catch(err){
            console.warn(err);
            msg.textContent='Opening your email app instead…';
            const body=`Name: ${payload.name}\nEmail: ${payload.email||''}\nPhone: ${payload.phone||''}\nAvailability: ${payload.availability}`;
            location.href=`mailto:${encodeURIComponent(config.email)}?subject=${encodeURIComponent('Schedule a Call')}&body=${encodeURIComponent(body)}`;
          }
        });
      }
    };
    content.querySelectorAll('[data-contact-tab]').forEach(btn=>btn.addEventListener('click',()=>render(btn.dataset.contactTab)));
    render('text');
  }

  document.addEventListener('click',e=>{
    const link=e.target.closest('a,button');
    if(!link) return;
    const href=link.getAttribute('href')||'';
    const text=(link.textContent||'').trim().replace(/\s+/g,' ');
    if(link.dataset.action==='make-site'){
      e.preventDefault();
      showMakeSiteChoice();
      return;
    }
    if(/^Contact Us(?:\s*→)?$/i.test(text) || link.dataset.action==='contact-us'){
      e.preventDefault();
      showContact();
    }
  });

  window.steadyHandsResolvePreview=resolveSiteKey;
  window.steadyHandsOpenPreview=openCategorySite;
})();

// Dedicated preview page form
const previewPageForm = document.querySelector('#preview-page-form');
if (previewPageForm) {
  previewPageForm.addEventListener('submit', async e => {
    e.preventDefault();
    const code = document.querySelector('#preview-page-code').value.trim();
    const message = document.querySelector('#preview-page-message');
    if (!code) return;
    message.textContent = 'Looking up your site…';
    try {
      const record = await window.steadyHandsResolvePreview(code);
      if (record) {
        message.textContent = 'Opening your preview…';
        window.steadyHandsOpenPreview(record);
        return;
      }
    } catch (err) {
      console.warn(err);
    }
    const url = Object.entries(config.previews || {}).find(([key]) => key.toLowerCase() === code.toLowerCase())?.[1];
    if (url && go(url)) return;
    message.textContent = 'We couldn’t find that site key. Check the code or contact Steady Hands.';
  });
}


// GitHub Steadyhandsop phone showcase behavior, reproduced from the repository component.
(() => {
  const section = document.querySelector('.github-showcase-exact');
  if (!section) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const formatNumber = (value, formatType) => formatType === 'comma' ? value.toLocaleString() : String(value);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    section.classList.add('cards-loaded');
  }));

  // Exact hover-lift motion from the GitHub component.
  const hoverLiftTargets = section.querySelectorAll(`
    .phone-screen .mini-header,
    .phone-screen .photo-frame,
    .phone-screen .info-card,
    .phone-screen .metric,
    .phone-screen .blog-top,
    .phone-screen .blog-viewport,
    .phone-screen .blog-copy,
    .phone-screen .blog-dots,
    .phone-screen .blog-socials,
    .phone-screen .budget-card,
    .phone-screen .category
  `);
  const hoverStates = new WeakMap();
  function renderHoverLift(target, amount) {
    const eased = 1 - Math.pow(1 - amount, 3);
    const lift = -4 * eased;
    const scale = 1 + 0.012 * eased;
    const shadowAlpha = 0.08 + 0.12 * eased;
    target.style.setProperty('transform', `translate3d(0,${lift}px,0) scale(${scale})`, 'important');
    target.style.filter = `brightness(${1 + 0.018 * eased})`;
    target.style.boxShadow = `0 ${8 + 5*eased}px ${16 + 9*eased}px rgba(3,18,47,${shadowAlpha})`;
    target.style.zIndex = target.classList.contains('photo-frame') ? '1000000' : (amount > 0.001 ? '12' : '');
  }
  function animateHoverTarget(target) {
    const state = hoverStates.get(target); if (!state || state.frame) return;
    let previousTime = performance.now();
    const frame = now => {
      const deltaMs = Math.min(now - previousTime, 64); previousTime = now;
      const smoothing = 1 - Math.exp(-deltaMs / 115);
      state.current += (state.target - state.current) * smoothing;
      if (Math.abs(state.target - state.current) < 0.001) state.current = state.target;
      renderHoverLift(target, state.current);
      if (state.current !== state.target) state.frame = requestAnimationFrame(frame);
      else {
        state.frame = null;
        if (state.current === 0) {
          target.style.removeProperty('transform'); target.style.removeProperty('filter');
          target.style.removeProperty('box-shadow'); target.style.removeProperty('z-index');
        }
      }
    };
    state.frame = requestAnimationFrame(frame);
  }
  hoverLiftTargets.forEach(target => {
    target.style.animation = 'none';
    const state = {current:0,target:0,frame:null}; hoverStates.set(target,state);
    target.addEventListener('pointerenter',()=>{state.target=1;animateHoverTarget(target)});
    target.addEventListener('pointerleave',()=>{state.target=0;animateHoverTarget(target)});
  });

  // Bowl spin / scale interaction.
  const bowlImage = section.querySelector('.photo-card');
  const bowlHitArea = section.querySelector('.bowl-hit-area');
  let bowlRotation=-18,bowlSpinFrame=null,bowlScaleFrame=null,bowlCurrentScale=1,bowlTargetScale=1;
  const bowlSpinProgress = t => t*t*t*(t*(t*6-15)+10);
  const bowlSpinScaleBoost = t => 0.42*Math.pow(Math.sin(Math.PI*t),1.25);
  function renderBowl(){ if(bowlImage) bowlImage.style.transform=`rotate(${bowlRotation}deg) scale(${bowlCurrentScale})`; }
  function approachBowlScale(deltaMs){ const smoothing=1-Math.exp(-deltaMs/240); bowlCurrentScale+=(bowlTargetScale-bowlCurrentScale)*smoothing; if(Math.abs(bowlTargetScale-bowlCurrentScale)<.001)bowlCurrentScale=bowlTargetScale; }
  function animateBowlScale(){ if(!bowlImage||bowlSpinFrame||bowlScaleFrame)return; let previousTime=performance.now(); const frame=now=>{const deltaMs=Math.min(now-previousTime,64);previousTime=now;approachBowlScale(deltaMs);renderBowl();if(bowlCurrentScale!==bowlTargetScale)bowlScaleFrame=requestAnimationFrame(frame);else bowlScaleFrame=null};bowlScaleFrame=requestAnimationFrame(frame); }
  function setBowlScaleTarget(scale){ bowlTargetScale=scale; animateBowlScale(); }
  function spinBowl(){
    if(!bowlImage||prefersReducedMotion||bowlSpinFrame)return;
    if(bowlScaleFrame){cancelAnimationFrame(bowlScaleFrame);bowlScaleFrame=null}
    const startRotation=bowlRotation, fullTurns=5+Math.floor(Math.random()*3), landingOffset=35+Math.random()*290;
    const rotationDelta=fullTurns*360+landingOffset, targetRotation=startRotation+rotationDelta, duration=4800, startTime=performance.now();
    let previousTime=startTime;
    const frame=now=>{const progress=Math.min((now-startTime)/duration,1),deltaMs=Math.min(now-previousTime,64);previousTime=now;bowlRotation=startRotation+rotationDelta*bowlSpinProgress(progress);const spinningScaleTarget=bowlTargetScale+bowlSpinScaleBoost(progress);const smoothing=1-Math.exp(-deltaMs/135);bowlCurrentScale+=(spinningScaleTarget-bowlCurrentScale)*smoothing;renderBowl();if(progress<1)bowlSpinFrame=requestAnimationFrame(frame);else{bowlRotation=targetRotation;bowlSpinFrame=null;bowlCurrentScale=bowlTargetScale;renderBowl();animateBowlScale()}};
    bowlSpinFrame=requestAnimationFrame(frame);
  }
  if(bowlImage&&bowlHitArea){renderBowl();bowlHitArea.addEventListener('mouseenter',()=>{setBowlScaleTarget(1.38);spinBowl()});bowlHitArea.addEventListener('mouseleave',()=>setBowlScaleTarget(1));if(!prefersReducedMotion){setTimeout(()=>{spinBowl();setInterval(spinBowl,9000)},900)}}

  // Number, ring, and budget animations.
  function progressColor(progress){const stops=[{p:0,rgb:[239,68,68]},{p:.33,rgb:[249,115,22]},{p:.66,rgb:[250,204,21]},{p:1,rgb:[34,197,94]}];for(let i=0;i<stops.length-1;i++){const c=stops[i],n=stops[i+1];if(progress<=n.p){const t=(progress-c.p)/(n.p-c.p||1),rgb=c.rgb.map((v,j)=>Math.round(lerp(v,n.rgb[j],t)));return `rgb(${rgb.join(',')})`}}return 'rgb(34,197,94)'}
  function animateNumber(element){const target=Number(element.dataset.target||0),duration=Number(element.dataset.duration||2000),suffix=element.dataset.suffix||'',formatType=element.dataset.format||'';if(prefersReducedMotion){element.textContent=`${formatNumber(target,formatType)}${suffix}`;return}const start=performance.now();const frame=now=>{const progress=clamp((now-start)/duration,0,1),eased=easeOutCubic(progress),current=Math.round(target*eased);element.textContent=`${formatNumber(current,formatType)}${suffix}`;if(progress<1)requestAnimationFrame(frame)};requestAnimationFrame(frame)}
  function animateRing(ring){const target=Number(ring.dataset.target||0),duration=Number(ring.dataset.duration||2800),finalAngle=target*3.2;if(prefersReducedMotion){ring.style.setProperty('--progress',target);ring.style.setProperty('--ring-color',progressColor(target/100));ring.style.setProperty('--ring-angle',`${finalAngle}deg`);return}const start=performance.now();const frame=now=>{const progress=clamp((now-start)/duration,0,1),eased=easeOutCubic(progress),value=target*eased,angle=value*3.2;ring.style.setProperty('--progress',value.toFixed(2));ring.style.setProperty('--ring-color',progressColor(value/100));ring.style.setProperty('--ring-angle',`${angle}deg`);if(progress<1)requestAnimationFrame(frame);else ring.dataset.currentProgress=String(target)};requestAnimationFrame(frame)}
  function getBarWidthPercent(bar){const track=bar.parentElement;if(!track)return Number(bar.dataset.currentWidth||bar.dataset.targetWidth||0);const tw=track.getBoundingClientRect().width,bw=bar.getBoundingClientRect().width;return tw?(bw/tw)*100:Number(bar.dataset.currentWidth||bar.dataset.targetWidth||0)}
  function animateBar(bar){const target=clamp(Number(bar.dataset.targetWidth||10),10,100),duration=Number(bar.dataset.duration||1100),color=bar.dataset.color||'#3b82f6',startValue=getBarWidthPercent(bar);bar.style.background=color;if(bar._animationFrame)cancelAnimationFrame(bar._animationFrame);if(prefersReducedMotion){bar.style.width=`${target}%`;bar.dataset.currentWidth=String(target);return}const start=performance.now();const frame=now=>{const progress=clamp((now-start)/duration,0,1),eased=easeInOutCubic(progress),value=lerp(startValue,target,eased);bar.style.width=`${value}%`;bar.dataset.currentWidth=value.toFixed(2);if(progress<1)bar._animationFrame=requestAnimationFrame(frame);else{bar.style.width=`${target}%`;bar.dataset.currentWidth=String(target);bar._animationFrame=null}};bar._animationFrame=requestAnimationFrame(frame)}
  const budgetBars=[...section.querySelectorAll('.bar i[data-target-width]')],budgetNumber=section.querySelector('.budget-value .number-pop'),budgetRing=section.querySelector('.ring[data-target]'),budgetRingLabel=budgetRing?budgetRing.querySelector('span'):null,budgetLimit=4000;let currentBudget=Number(budgetNumber?.dataset.target||2520),lastBudgetBarIndex=-1;
  function calculateBudgetTotal(overrides=new Map()){return [...section.querySelectorAll('.category[data-amount]')].reduce((sum,cat)=>sum+(overrides.has(cat)?overrides.get(cat):Number(cat.dataset.amount||0)),0)}
  function animateCategoryAmount(category,nextAmount,duration){const label=category?.querySelector('.category-amount');if(!category||!label)return;const startAmount=Number(category.dataset.amount||0),targetAmount=Math.max(0,Math.round(nextAmount));category.dataset.amount=String(targetAmount);if(prefersReducedMotion){label.textContent=`$${targetAmount.toLocaleString()}`;return}const start=performance.now();const frame=now=>{const progress=clamp((now-start)/duration,0,1),eased=easeInOutCubic(progress),value=Math.round(lerp(startAmount,targetAmount,eased));label.textContent=`$${value.toLocaleString()}`;if(progress<1)requestAnimationFrame(frame)};requestAnimationFrame(frame)}
  function animateBudgetSummary(nextBudget,duration){const startBudget=currentBudget,targetBudget=Math.round(clamp(nextBudget,budgetLimit*.13,budgetLimit*.67)),startPercent=Number(budgetRing?.dataset.currentProgress||budgetRing?.dataset.target||58),targetPercent=Math.round(targetBudget/budgetLimit*100);currentBudget=targetBudget;if(budgetNumber)budgetNumber.dataset.target=String(targetBudget);if(budgetRing)budgetRing.dataset.target=String(targetPercent);if(prefersReducedMotion){if(budgetNumber)budgetNumber.textContent=targetBudget.toLocaleString();if(budgetRing){budgetRing.style.setProperty('--progress',targetPercent);budgetRing.style.setProperty('--ring-color',progressColor(targetPercent/100));budgetRing.style.setProperty('--ring-angle',`${targetPercent*3.2}deg`);budgetRing.dataset.currentProgress=String(targetPercent);if(budgetRingLabel)budgetRingLabel.textContent=`${targetPercent}%`}return}const start=performance.now();const frame=now=>{const progress=clamp((now-start)/duration,0,1),eased=easeInOutCubic(progress),budgetValue=Math.round(lerp(startBudget,targetBudget,eased)),percentValue=lerp(startPercent,targetPercent,eased),angle=percentValue*3.2;if(budgetNumber)budgetNumber.textContent=budgetValue.toLocaleString();if(budgetRing){budgetRing.style.setProperty('--progress',percentValue.toFixed(2));budgetRing.style.setProperty('--ring-color',progressColor(percentValue/100));budgetRing.style.setProperty('--ring-angle',`${angle}deg`);budgetRing.dataset.currentProgress=percentValue.toFixed(2);if(budgetRingLabel)budgetRingLabel.textContent=`${Math.round(percentValue)}%`}if(progress<1)requestAnimationFrame(frame)};requestAnimationFrame(frame)}
  function changeRandomBudgetBar(){if(!budgetBars.length)return;let barIndex=Math.floor(Math.random()*budgetBars.length);if(budgetBars.length>1)while(barIndex===lastBudgetBarIndex)barIndex=Math.floor(Math.random()*budgetBars.length);lastBudgetBarIndex=barIndex;const bar=budgetBars[barIndex],category=bar.closest('.category');if(!category)return;const maxAmount=Number(category.dataset.max||1000),currentAmount=Number(category.dataset.amount||0),otherTotal=calculateBudgetTotal()-currentAmount,minBudget=budgetLimit*.13,maxBudget=budgetLimit*.67,minAllowed=Math.max(0,minBudget-otherTotal),maxAllowed=Math.min(maxAmount,maxBudget-otherTotal);let nextAmount=currentAmount;if(maxAllowed>minAllowed){const minRounded=Math.ceil(minAllowed/10)*10,maxRounded=Math.floor(maxAllowed/10)*10,rangeSteps=Math.max(0,Math.floor((maxRounded-minRounded)/10));for(let attempt=0;attempt<12;attempt++){const candidate=minRounded+Math.floor(Math.random()*(rangeSteps+1))*10;if(Math.abs(candidate-currentAmount)>=Math.min(80,Math.max(20,(maxRounded-minRounded)*.15))){nextAmount=candidate;break}}if(nextAmount===currentAmount)nextAmount=currentAmount>(minRounded+maxRounded)/2?minRounded:maxRounded}nextAmount=Math.round(clamp(nextAmount,minAllowed,maxAllowed)/10)*10;const accurateWidth=clamp(nextAmount/maxAmount*100,10,100),duration=Math.round(900+Math.random()*650);bar.dataset.targetWidth=accurateWidth.toFixed(2);bar.dataset.duration=String(duration);category.classList.add('is-changing');clearTimeout(category._changeTimer);category._changeTimer=setTimeout(()=>category.classList.remove('is-changing'),duration+120);const nextTotal=calculateBudgetTotal(new Map([[category,nextAmount]]));animateBar(bar);animateCategoryAmount(category,nextAmount,duration);animateBudgetSummary(nextTotal,duration)}
  const initialBudget=calculateBudgetTotal(),initialPercent=Math.round(initialBudget/budgetLimit*100);currentBudget=initialBudget;if(budgetNumber)budgetNumber.dataset.target=String(initialBudget);if(budgetRing)budgetRing.dataset.target=String(initialPercent);if(budgetRingLabel)budgetRingLabel.dataset.target=String(initialPercent);
  section.querySelectorAll('.number-pop[data-target]').forEach(animateNumber);section.querySelectorAll('.ring[data-target]').forEach(animateRing);budgetBars.forEach(animateBar);if(!prefersReducedMotion)setInterval(changeRandomBudgetBar,4200);

  // Blog carousel: same random Picsum source, infinite clones, drag/swipe, wheel, autoplay, and like syncing.
  const blogTrack=section.querySelector('#blog-track'),blogViewport=section.querySelector('.blog-viewport'),blogDots=[...section.querySelectorAll('.blog-dot')],originalBlogPosts=blogTrack?[...blogTrack.querySelectorAll('.blog-post')]:[],blogCount=originalBlogPosts.length;
  let activeBlog=0,trackPosition=1,autoplayTimer=null,dragStartX=0,dragCurrentX=0,isDraggingBlog=false,isTouchDrag=false,wheelDeltaX=0,wheelResetTimer=null,lastWheelNavigationTime=0;
  const photoSeeds=Array.from({length:blogCount},()=>Math.floor(Math.random()*10000));
  originalBlogPosts.forEach((post,index)=>{const image=post.querySelector('.blog-image');if(!image)return;post.classList.add('image-pending');let settled=false;const timeout=setTimeout(()=>markError(),8000);function markLoaded(){if(settled)return;settled=true;clearTimeout(timeout);post.classList.remove('image-error','image-pending');post.classList.add('image-loaded');image.removeAttribute('aria-hidden')}function markError(){if(settled)return;settled=true;clearTimeout(timeout);post.classList.remove('image-loaded','image-pending');post.classList.add('image-error');image.removeAttribute('src');image.alt='';image.setAttribute('aria-hidden','true')}image.addEventListener('load',markLoaded,{once:true});image.addEventListener('error',markError,{once:true});image.src=`https://picsum.photos/seed/${photoSeeds[index]}/420/300`;image.draggable=false;if(image.complete){image.naturalWidth>0?markLoaded():markError()}});
  function setupInfiniteBlogTrack(){if(!blogTrack||blogCount<2)return;const firstClone=originalBlogPosts[0].cloneNode(true),lastClone=originalBlogPosts[blogCount-1].cloneNode(true);firstClone.setAttribute('aria-hidden','true');lastClone.setAttribute('aria-hidden','true');blogTrack.insertBefore(lastClone,originalBlogPosts[0]);blogTrack.appendChild(firstClone);const all=[...blogTrack.querySelectorAll('.blog-post')],total=all.length;blogTrack.style.width=`${total*100}%`;all.forEach(post=>{post.style.flex=`0 0 ${100/total}%`;post.style.width=`${100/total}%`})}
  const logicalIndex=position=>position===0?blogCount-1:position===blogCount+1?0:position-1,trackPercent=position=>position*(100/(blogCount+2));
  function setTrackPosition(position,animate=true,pixelOffset=0){if(!blogTrack)return;blogTrack.style.transition=animate?'transform .72s cubic-bezier(.22,.75,.2,1)':'none';blogTrack.style.transform=`translate3d(calc(-${trackPercent(position)}% + ${pixelOffset}px),0,0)`}
  const updateBlogDots=()=>blogDots.forEach((dot,index)=>dot.classList.toggle('active',index===activeBlog));
  function showBlogByPosition(position,animate=true){const safe=clamp(position,0,blogCount+1);trackPosition=safe;activeBlog=logicalIndex(trackPosition);setTrackPosition(trackPosition,animate);updateBlogDots();if(animate&&blogTrack){clearTimeout(blogTrack._unlockTimer);blogTrack._unlockTimer=setTimeout(()=>{if(trackPosition===0){trackPosition=blogCount;activeBlog=blogCount-1;setTrackPosition(trackPosition,false)}else if(trackPosition===blogCount+1){trackPosition=1;activeBlog=0;setTrackPosition(trackPosition,false)}updateBlogDots()},700)}}
  function normalizeBlogPosition(){if(!blogTrack||!blogCount)return;clearTimeout(blogTrack._unlockTimer);trackPosition=activeBlog+1;setTrackPosition(trackPosition,false)}
  function showNextBlog(direction=1){if(isDraggingBlog)return;normalizeBlogPosition();showBlogByPosition(trackPosition+(direction<0?-1:1),true)}
  function startBlogAutoplay(){clearInterval(autoplayTimer);if(!prefersReducedMotion)autoplayTimer=setInterval(()=>showNextBlog(1),4200)}
  const averageTouchX=touches=>{if(!touches.length)return dragCurrentX;let total=0;for(let i=0;i<touches.length;i++)total+=touches[i].clientX;return total/touches.length};
  function beginBlogDrag(clientX,touchMode=false){if(!blogViewport||!blogTrack)return;normalizeBlogPosition();isDraggingBlog=true;isTouchDrag=touchMode;dragStartX=clientX;dragCurrentX=clientX;blogViewport.classList.add('is-dragging');clearInterval(autoplayTimer);blogTrack.style.transition='none'}
  function moveBlogDrag(clientX){if(!isDraggingBlog||!blogViewport)return;dragCurrentX=clientX;setTrackPosition(trackPosition,false,dragCurrentX-dragStartX)}
  function endBlogDrag(clientX){if(!isDraggingBlog||!blogViewport)return;isDraggingBlog=false;isTouchDrag=false;blogViewport.classList.remove('is-dragging');const distance=clientX-dragStartX,threshold=Math.min(48,blogViewport.clientWidth*.16);Math.abs(distance)>=threshold?showNextBlog(distance<0?1:-1):setTrackPosition(trackPosition,true);startBlogAutoplay()}
  function handleBlogWheel(event){if(!blogViewport||!blogTrack)return;const inside=event.target instanceof Element&&event.target.closest('.blog-shell');if(!inside)return;const mult=event.deltaMode===1?16:(event.deltaMode===2?blogViewport.clientWidth:1),dx=event.deltaX*mult,dy=event.deltaY*mult;let horizontal=dx;if(Math.abs(horizontal)<.5&&event.shiftKey)horizontal=dy;if(Math.abs(horizontal)<.5)return;event.preventDefault();event.stopPropagation();clearInterval(autoplayTimer);clearTimeout(wheelResetTimer);wheelDeltaX+=horizontal;const preview=Math.max(-22,Math.min(22,-wheelDeltaX*.20));setTrackPosition(trackPosition,false,preview);const now=performance.now(),threshold=Math.max(24,Math.min(34,blogViewport.clientWidth*.09));if(Math.abs(wheelDeltaX)>=threshold&&now-lastWheelNavigationTime>=120){lastWheelNavigationTime=now;const direction=wheelDeltaX>0?1:-1;wheelDeltaX=0;showNextBlog(direction)}wheelResetTimer=setTimeout(()=>{if(Math.abs(wheelDeltaX)>0)setTrackPosition(trackPosition,true);wheelDeltaX=0;startBlogAutoplay()},90)}
  setupInfiniteBlogTrack();
  if(blogTrack)blogTrack.addEventListener('transitionend',event=>{if(event.propertyName!=='transform')return;if(trackPosition===0){trackPosition=blogCount;activeBlog=blogCount-1;setTrackPosition(trackPosition,false)}else if(trackPosition===blogCount+1){trackPosition=1;activeBlog=0;setTrackPosition(trackPosition,false)}clearTimeout(blogTrack._unlockTimer);updateBlogDots()});
  if(blogViewport&&blogTrack){blogViewport.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse'||event.target.closest('button,a'))return;beginBlogDrag(event.clientX,false);blogViewport.setPointerCapture(event.pointerId)});blogViewport.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||!isDraggingBlog||isTouchDrag)return;moveBlogDrag(event.clientX)});blogViewport.addEventListener('pointerup',event=>{if(event.pointerType==='mouse'&&isDraggingBlog&&!isTouchDrag)endBlogDrag(event.clientX)});blogViewport.addEventListener('pointercancel',()=>{if(isDraggingBlog&&!isTouchDrag)endBlogDrag(dragCurrentX)});blogViewport.addEventListener('touchstart',event=>{if(event.target.closest('button,a'))return;if(event.touches.length===1||event.touches.length===2)beginBlogDrag(averageTouchX(event.touches),true)},{passive:true});blogViewport.addEventListener('touchmove',event=>{if(!isDraggingBlog||!isTouchDrag)return;if(event.touches.length===1||event.touches.length===2)moveBlogDrag(averageTouchX(event.touches))},{passive:true});blogViewport.addEventListener('touchend',event=>{if(!isDraggingBlog||!isTouchDrag)return;if(event.touches.length===0)endBlogDrag(dragCurrentX);else if(event.touches.length===1||event.touches.length===2){dragStartX=averageTouchX(event.touches);dragCurrentX=dragStartX}},{passive:true});blogViewport.addEventListener('touchcancel',()=>{if(isDraggingBlog&&isTouchDrag)endBlogDrag(dragCurrentX)},{passive:true});document.addEventListener('wheel',handleBlogWheel,{passive:false,capture:true})}
  showBlogByPosition(1,false);startBlogAutoplay();
  if(blogTrack)blogTrack.addEventListener('click',event=>{const button=event.target.closest('.like-btn');if(!button||!blogTrack.contains(button))return;const title=button.closest('.blog-post')?.querySelector('h3')?.textContent?.trim(),willLike=!button.classList.contains('liked'),matching=title?[...blogTrack.querySelectorAll('.blog-post')].filter(p=>p.querySelector('h3')?.textContent?.trim()===title).map(p=>p.querySelector('.like-btn')).filter(Boolean):[button];matching.forEach(btn=>{btn.classList.toggle('liked',willLike);btn.setAttribute('aria-pressed',String(willLike));btn.setAttribute('aria-label',willLike?'Unlike post':'Like post')})});
})();
