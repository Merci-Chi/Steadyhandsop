'use strict';
const BUSINESS_EMAIL='vividteesllc@gmail.com';
const PRODUCTS=[{"id":"img_5379","name":"Theyll Always Be The Redskins Shirt","cat":"T-SHIRTS","img":"shop-images/IMG_5379.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_5195","name":"Mother Daughter Trip 2026 Shirt","cat":"T-SHIRTS","img":"shop-images/IMG_5195.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6200","name":"Vivid Event Table Cover","cat":"CUSTOM DESIGNS","img":"shop-images/IMG_6200.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6201","name":"Mary Slade Engraved Marker","cat":"LASER ENGRAVING","img":"shop-images/IMG_6201.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6215","name":"Mr Wright White Tumbler","cat":"GIFTS & MORE!","img":"shop-images/IMG_6215.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6203","name":"Custom White Polo","cat":"CUSTOM DESIGNS","img":"shop-images/IMG_6203.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6216","name":"Capt Dewey Evan Tumbler","cat":"GIFTS & MORE!","img":"shop-images/IMG_6216.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_5864","name":"Personalized Engraved Keychain","cat":"LASER ENGRAVING","img":"shop-images/IMG_5864.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6206","name":"Blue Logo Drawstring Bag","cat":"GIFTS & MORE!","img":"shop-images/IMG_6206.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6212","name":"Custom Print Sample Shirts","cat":"T-SHIRTS","img":"shop-images/IMG_6212.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6213","name":"Capt Dewey Evan Artwork","cat":"CUSTOM DESIGNS","img":"shop-images/IMG_6213.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6207","name":"Im Just Mean Shirt","cat":"T-SHIRTS","img":"shop-images/IMG_6207.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6211","name":"Cozy Seiz Pink Tumbler","cat":"GIFTS & MORE!","img":"shop-images/IMG_6211.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6204","name":"Big Sister Personalized Bodysuits","cat":"CUSTOM DESIGNS","img":"shop-images/IMG_6204.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6210","name":"Love Stay Destinations Table Cover","cat":"CUSTOM DESIGNS","img":"shop-images/IMG_6210.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6180","name":"SVR Gray Hoodies","cat":"HOODIES","img":"shop-images/IMG_6180.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6209","name":"Travel Theme Hat and Stickers","cat":"HATS & CAPS","img":"shop-images/IMG_6209.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6208","name":"Blue Logo Tote Bags","cat":"GIFTS & MORE!","img":"shop-images/IMG_6208.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6195","name":"Chincoteague Island Shirt","cat":"T-SHIRTS","img":"shop-images/IMG_6195.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6181","name":"Girls Trip Palm Tree Shirt","cat":"T-SHIRTS","img":"shop-images/IMG_6181.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6183","name":"Washington Jaguars Shirts","cat":"T-SHIRTS","img":"shop-images/IMG_6183.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6182","name":"Custom Promotional Product Assortment","cat":"GIFTS & MORE!","img":"shop-images/IMG_6182.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6196","name":"Pink Embroidered Cap","cat":"HATS & CAPS","img":"shop-images/IMG_6196.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6193","name":"HDH Plumbing Service Uniforms","cat":"CUSTOM DESIGNS","img":"shop-images/IMG_6193.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."},{"id":"img_6184","name":"Mckenzies Beach Bash 2026 Shirts","cat":"T-SHIRTS","img":"shop-images/IMG_6184.jpg","desc":"Custom design example. Contact us to confirm options, availability, and pricing."}];
const SHOP_CATEGORIES=["ALL", "T-SHIRTS", "HOODIES", "JACKETS", "HATS & CAPS", "SWEATSHIRTS", "CUSTOM DESIGNS", "LASER ENGRAVING", "GIFTS & MORE!"];
const KEY='vividtees-quote-cart-v1';
function readCart(){try{let cart=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(cart)?cart.filter(x=>PRODUCTS.some(p=>p.id===x.id)&&Number.isInteger(x.qty)&&x.qty>0):[]}catch{return []}}
function saveCart(cart){localStorage.setItem(KEY,JSON.stringify(cart));updateCount()}
function updateCount(){document.querySelectorAll('.cart-count').forEach(e=>e.textContent=readCart().reduce((n,x)=>n+x.qty,0))}
function notify(msg){let el=document.getElementById('notice');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(window._vividNotice);window._vividNotice=setTimeout(()=>el.classList.remove('show'),2800)}
function addCart(id){let cart=readCart(),item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveCart(cart);notify('Added to your quote cart.');}
function setQty(id,qty){let cart=readCart().filter(x=>x.id!==id),n=Math.min(Math.max(0,qty),999);if(n)cart.push({id,qty:n});saveCart(cart);renderCart()}
function renderShop(){
 const grid=document.getElementById('product-grid');if(!grid)return;
 const query=(document.getElementById('product-search')?.value||'').toLowerCase().trim();
 const active=window._activeShopCategory||'ALL';
 const shown=PRODUCTS.filter(p=>(active==='ALL'||p.cat===active)&&(`${p.name} ${p.cat}`).toLowerCase().includes(query));
 const count=document.getElementById('catalog-count');if(count)count.textContent=`${shown.length} design${shown.length===1?'':'s'} shown`;
 grid.innerHTML=shown.map(p=>`<article class="shop-product"><div class="shop-product-image"><img src="${p.img}" alt="${p.name}" loading="lazy"><span class="shop-product-category">${p.cat}</span><button type="button" data-view="${p.id}" aria-label="View details for ${p.name}"><i class="fa-solid fa-up-right-and-down-left-from-center" aria-hidden="true"></i></button></div><div class="shop-product-copy"><h2>${p.name}</h2><p>Custom options & pricing on request</p><button type="button" class="shop-add" data-add="${p.id}" aria-label="Add ${p.name} to quote cart"><span>Add to quote cart</span><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></button></div></article>`).join('')||'<div class="shop-no-results">No designs match. Try another category or search.</div>';
}
function setupShop(){
 const tabs=document.getElementById('category-tabs');if(!tabs)return;
 const requested=new URLSearchParams(location.search).get('category');window._activeShopCategory=SHOP_CATEGORIES.includes(requested)?requested:'ALL';
 tabs.innerHTML=SHOP_CATEGORIES.map(c=>`<button type="button" class="shop-tab ${c===window._activeShopCategory?'active':''}" data-category="${c}" aria-pressed="${c===window._activeShopCategory}">${c==='ALL'?'ALL PRODUCTS':c}</button>`).join('');
 tabs.addEventListener('click',e=>{const btn=e.target.closest('[data-category]');if(!btn)return;window._activeShopCategory=btn.dataset.category;tabs.querySelectorAll('button').forEach(b=>{b.classList.toggle('active',b===btn);b.setAttribute('aria-pressed',String(b===btn))});renderShop()});
 
 renderShop();
}
function renderCart(){let target=document.getElementById('cart-items');if(!target)return;let cart=readCart();let total=cart.reduce((n,x)=>n+x.qty,0);if(!total){target.innerHTML='<div class="empty"><h3>Your quote cart is empty.</h3><p>Add items from the shop to request custom pricing.</p><a class="pill" href="shop.html">Browse the shop <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>';document.getElementById('cart-total').textContent='0 items';return}target.innerHTML=cart.map(x=>{let p=PRODUCTS.find(p=>p.id===x.id);return `<div class="cart-line"><img src="${p.img}" alt=""><div><h3>${p.name}</h3><small class="muted">Custom quote required</small><br><button class="text-button" data-remove="${x.id}">Remove</button></div><div class="qty-control"><button aria-label="Decrease ${p.name}" data-qty="${x.id}" data-delta="-1">−</button><b>${x.qty}</b><button aria-label="Increase ${p.name}" data-qty="${x.id}" data-delta="1">+</button></div></div>`}).join('');document.getElementById('cart-total').textContent=`${total} item${total===1?'':'s'}`}
function emailHref(subject,body){return `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
function handleQuote(event){event.preventDefault();let form=event.currentTarget;let f=new FormData(form);let cart=readCart();if(!cart.length){notify('Please add at least one item.');return}let items=cart.map(x=>`${x.qty} × ${PRODUCTS.find(p=>p.id===x.id).name}`).join('\n');let body=`Hi Vivid Tee's Custom Apparel,\n\nI'd like a quote for:\n${items}\n\nName: ${f.get('name')}\nEmail: ${f.get('email')}\nPhone: ${f.get('phone')||'Not provided'}\nNeeded by: ${f.get('deadline')||'Flexible'}\nDetails, sizes, colors, design: ${f.get('details')||'Please contact me to discuss'}\n\nPlease confirm availability and pricing.\n`;window.location.href=emailHref('Website custom order quote request',body);document.getElementById('checkout-status').textContent='Your email application should open with the order details. Please send the email to complete the request. No order or payment has been placed.'}
function handleContact(e){e.preventDefault();let f=new FormData(e.currentTarget),body=`Name: ${f.get('name')}\nEmail: ${f.get('email')}\nPhone: ${f.get('phone')||'Not provided'}\nTopic: ${f.get('topic')}\n\n${f.get('message')}`;window.location.href=emailHref('Website inquiry: '+f.get('topic'),body);document.getElementById('contact-status').textContent='Your email app should open. Please send the message to complete your inquiry.'}
document.addEventListener('DOMContentLoaded',()=>{updateCount();setupShop();renderCart();document.getElementById('quote-form')?.addEventListener('submit',handleQuote);document.getElementById('contact-form')?.addEventListener('submit',handleContact);document.querySelector('.mobile-toggle')?.addEventListener('click',()=>{let nav=document.querySelector('.nav-links');let opened=nav.classList.toggle('open');document.querySelector('.mobile-toggle').setAttribute('aria-expanded',String(opened))});document.addEventListener('click',e=>{let add=e.target.closest('[data-add]'),rem=e.target.closest('[data-remove]'),qty=e.target.closest('[data-qty]');if(add)addCart(add.dataset.add);let view=e.target.closest('[data-view]');if(view)showShopDetail(view.dataset.view);if(rem)setQty(rem.dataset.remove,0);if(qty){let item=readCart().find(x=>x.id===qty.dataset.qty);setQty(qty.dataset.qty,(item?.qty||0)+Number(qty.dataset.delta))}})});

function showShopDetail(id){
 const p=PRODUCTS.find(item=>item.id===id);const dialog=document.getElementById('shop-detail');if(!p||!dialog)return;
 document.getElementById('detail-image').src=p.img;
 document.getElementById('detail-image').alt=p.name;
 document.getElementById('detail-category').textContent=p.cat;
 document.getElementById('detail-title').textContent=p.name;
 document.getElementById('detail-add').dataset.add=p.id;
 if(typeof dialog.showModal==='function')dialog.showModal();
}
document.addEventListener('DOMContentLoaded',()=>{
 const dialog=document.getElementById('shop-detail');if(!dialog)return;
 dialog.querySelector('[data-close-detail]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
});


/* Scroll-triggered entrance animations, including dynamic shop filters. */
(function(){
  const selector = '.hero-copy > *, .hero-visual, .hero-splash, .section-heading, .category-card, .feature-grid > div, .gallery-tile, .shop-product, .shop-tab, .shop-toolbar, .shop-header, .shop-intro, .content-card, .contact-details, .contact-form, .cart-line, .faq details, .faq-item, .footer-grid > div, .cta-band .container > *, .gallery-large figure, .split > *, .page-hero .container > *, .quote-note, .shop-no-results';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer;
  function prepare(el){
    if(el.dataset.revealReady)return;
    el.dataset.revealReady='true';
    if(reduced){el.classList.add('in-view');return;}
    el.classList.add('scroll-reveal');
    if(observer)observer.observe(el);
  }
  function scan(scope=document){
    if(scope.matches && scope.matches(selector))prepare(scope);
    scope.querySelectorAll(selector).forEach(prepare);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if(!reduced && 'IntersectionObserver' in window){
      observer=new IntersectionObserver(entries=>{
        for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}
      },{rootMargin:'0px 0px -35px 0px',threshold:0.07});
    }
    document.documentElement.classList.add('reveal-enabled');
    scan();
    // Cards change when visitors filter/search: animate newly added elements.
    const targets=['product-grid','cart-items','category-tabs'];
    for(const id of targets){
      const el=document.getElementById(id);
      if(el)new MutationObserver(()=>scan(el)).observe(el,{childList:true,subtree:true});
    }
    // Reveal elements inserted after load elsewhere, including FAQ sections.
    const bodyObserver=new MutationObserver(records=>{for(const rec of records)for(const node of rec.addedNodes)if(node.nodeType===1)scan(node);});
    bodyObserver.observe(document.body,{childList:true,subtree:false});
  });
})();
