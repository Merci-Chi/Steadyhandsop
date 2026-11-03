(()=>{'use strict';
const q=new URLSearchParams(location.search);
const slugByOriginal={
'pkg-orlando-florida-std':['Summer Bay Orlando · 1-Bedroom Condo',149,'5 days · 4 nights','images/summer-bay/resort-01.webp'],
'pkg-orlando-fl-ste':['Summer Bay Orlando · 2-Bedroom Condo',199,'5 days · 4 nights','images/summer-bay/resort-01.webp'],
'pkg-daytona-beach-fl':['Daytona Beach Getaway',null,'4 days · 3 nights','images/daytona/resort-01.webp']};
const allowedPrice=Object.freeze({'pkg-orlando-florida-std':149,'pkg-orlando-fl-ste':199});
const storageKey='vd_selected_vacation_v2';
const safeImage=/^images\/[a-zA-Z0-9_/-]+\.(?:webp|png|jpe?g)$/i;
const isSafeImage=value=>safeImage.test(value)&&!value.includes('..');
const mappedPhotos={
'pkg-orlando-florida-std':'images/summer-bay/resort-01.webp',
'pkg-orlando-fl-ste':'images/summer-bay/resort-01.webp',
'pkg-daytona-beach-fl':'images/daytona/resort-01.webp',
'pkg-las-vegas-nv':'images/packages/vegas/photo-01.webp',
'pkg-gatlinburg':'images/packages/gatlinburg/photo-01.webp',
'package-hilton-head':'images/packages/hilton/photo-01.webp',
'package-orlando-fl-the-club-at-holiday-inn-resort-by-kissimmee-park':'images/packages/holiday/photo-01.webp',
'intpkg-freeport-bahamas':'images/packages/freeport/photo-01.webp',
'intpkg-cancun-mx':'images/packages/cancun/photo-02.webp',
'pkg-branson-mo':'images/packages/branson/photo-01.webp',
'intpkg-cabo-san-lucas-mx':'images/packages/dominican/photo-01.webp',
'intpkg-grand-cayman':'images/packages/cayman/photo-01.webp',
'pkg-virginia-beach':'images/packages/virginia/photo-01.webp',
'pkg-calyspo-cay-resort-orlando':'images/packages/cayman/photo-03.webp',
'you-westgate-lake-resort':'images/destination-1.jpg',
'orlando-florida-summerbay-1bdst':'images/summer-bay/resort-01.webp'
};
const titleBySlug={
'pkg-las-vegas-nv':'Las Vegas Resort Getaway',
'pkg-gatlinburg':'Gatlinburg Resort Getaway',
'package-hilton-head':'Hilton Head Island Getaway',
'package-orlando-fl-the-club-at-holiday-inn-resort-by-kissimmee-park':'Holiday Inn Kissimmee',
'intpkg-freeport-bahamas':'Freeport Bahamas Getaway',
'intpkg-cancun-mx':'Cancún Getaway',
'pkg-branson-mo':'Branson Getaway',
'intpkg-cabo-san-lucas-mx':'Cabo San Lucas Getaway',
'intpkg-grand-cayman':'Grand Cayman Getaway',
'pkg-virginia-beach':'Virginia Beach Getaway',
'pkg-calyspo-cay-resort-orlando':'Calypso Cay Orlando',
'you-westgate-lake-resort':'Westgate Lakes Orlando',
'orlando-florida-summerbay-1bdst':'Summer Bay Orlando'
};
let remembered=null;
try{const item=JSON.parse(localStorage.getItem(storageKey)||'null');if(item&&typeof item.slug==='string'&&/^[a-z0-9_-]{1,100}$/.test(item.slug))remembered=item}catch{}
let slug=(q.get('package')||'').toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,100);
if(!slug){try{const u=new URL(q.get('product')||'');if(['vacationdestinationsfl.com','www.vacationdestinationsfl.com'].includes(u.hostname)&&u.pathname.startsWith('/product/'))slug=(u.pathname.split('/').filter(Boolean).pop()||'').replace(/[^a-z0-9_-]/gi,'').toLowerCase()}catch{}}
const named=(q.get('name')||'').trim().slice(0,100);
const directSelection=Boolean(slug||named);
if(!directSelection&&remembered)slug=remembered.slug;
const known=slugByOriginal[slug];
const title=known?.[0]||titleBySlug[slug]||(directSelection?named:'')||(remembered?.slug===slug?remembered.title:'')||slug.replace(/^pkg-/,'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const priceParam=q.get('price');
const rawPrice=priceParam===null?null:Number(priceParam);
const safePrice=rawPrice!==null&&Number.isFinite(rawPrice)&&rawPrice>=0&&rawPrice<=10000?rawPrice:null;
const price=known?.[1]??(directSelection?safePrice:(remembered?.slug===slug?remembered.price:null));
const stay=known?.[2]||(remembered?.slug===slug?remembered.stay:'')||'Vacation package';
const imageArg=(q.get('image')||'').trim();
const rememberedImage=remembered?.slug===slug&&isSafeImage(remembered.image||'')?remembered.image:'';
const cover=isSafeImage(imageArg)?imageArg:(mappedPhotos[slug]||rememberedImage||known?.[3]||'');
const hasPackage=Boolean(slug||named);
document.getElementById('filled').hidden=!hasPackage;
document.getElementById('empty').hidden=hasPackage;
const counter=document.getElementById('count');if(counter)counter.textContent=hasPackage?'1':'0';
if(!hasPackage)return;
try{
localStorage.setItem(storageKey,JSON.stringify({slug,title:title.slice(0,120),image:cover,price,stay:stay.slice(0,120)}))
}catch{}
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
document.getElementById('productName').textContent=title;
document.getElementById('packageDetail').textContent=stay;
document.getElementById('packagePrice').textContent=price===null?'Confirm with reservations':money(price);
document.getElementById('totalPrice').textContent=price===null?'To be confirmed':money(price);
const photoEl=document.getElementById('selectedCover');
const photoFallback=document.getElementById('photoFallback');
const photoPaths=[cover,rememberedImage,mappedPhotos[slug],known?.[3]].filter((v,i,a)=>v&&isSafeImage(v)&&a.indexOf(v)===i);
let imageIndex=0;
photoEl.alt=title+' vacation package';
function tryPhoto(){
 if(imageIndex>=photoPaths.length){photoEl.hidden=true;photoFallback.hidden=false;return}
 const next=photoPaths[imageIndex++];
 photoEl.onerror=tryPhoto;
 photoEl.onload=()=>{photoEl.hidden=false;photoFallback.hidden=true};
 photoEl.src=next;
}
tryPhoto();
let details={};const form=document.getElementById('detailsForm');
const dialog=document.getElementById('reviewDialog');
const popupRows=document.getElementById('reviewPopupRows');
const popupClose=document.getElementById('popupClose');
const popupEdit=document.getElementById('popupEdit');
const popupConfirm=document.getElementById('popupConfirm');
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const panelIds=['guestPanel','reviewPanel','paymentPanel'];
function go(step){
 panelIds.forEach((id,i)=>document.getElementById(id).hidden=i!==step-1);
 document.querySelectorAll('.step').forEach((el,i)=>{el.classList.toggle('active',i+1===step);el.setAttribute('aria-current',i+1===step?'step':'false')});
 document.querySelector('.steps').scrollIntoView({behavior:'smooth',block:'start'});
}
function closePopup(){
 if(typeof dialog.close==='function'&&dialog.open)dialog.close();
 else dialog.removeAttribute('open');
}
form.addEventListener('submit',e=>{
 e.preventDefault();
 if(!form.reportValidity())return;
 details=Object.fromEntries(new FormData(form).entries());
 const rows=[
  ['Vacation package',title],['Advertised price',price===null?'To be confirmed':money(price)],
  ['Primary guest',details.first+' '+details.last],['Email',details.email],['Phone',details.phone],
  ['Travelers',details.adults+' adult(s), '+details.children+' child(ren)'],
  ['Preferred travel dates',details.travel||'Flexible / not specified'],
  ['Special requests',details.notes||'None']
 ];
 const markup=rows.map(([k,v])=>'<div class="reviewrow"><span>'+escapeHtml(k)+'</span><strong>'+escapeHtml(v)+'</strong></div>').join('');
 popupRows.innerHTML=markup;
 document.getElementById('reviewContent').innerHTML=markup;
 document.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('active',i===1));
 if(typeof dialog.showModal==='function')dialog.showModal();
 else dialog.setAttribute('open','');
});
popupClose.addEventListener('click',()=>{closePopup();go(1)});
popupEdit.addEventListener('click',()=>{closePopup();go(1);form.querySelector('input[name="first"]').focus()});
popupConfirm.addEventListener('click',()=>{const terms=document.getElementById('popupTerms');if(!terms.checked){terms.setCustomValidity('Please accept the package terms to continue.');terms.reportValidity();return}terms.setCustomValidity('');closePopup();go(3)});
document.getElementById('popupTerms').addEventListener('change',e=>e.target.setCustomValidity(''));
dialog.addEventListener('click',e=>{if(e.target===dialog){closePopup();go(1)}});
dialog.addEventListener('close',()=>{if(!document.getElementById('guestPanel').hidden)document.querySelectorAll('.step').forEach((el,i)=>el.classList.toggle('active',i===0))});
document.getElementById('editDetails').addEventListener('click',()=>go(1));
document.getElementById('continuePayment').addEventListener('click',()=>{
 const terms=document.getElementById('terms');
 if(!terms.checked){terms.focus();terms.setCustomValidity('Please acknowledge the package terms before continuing.');terms.reportValidity();return}
 terms.setCustomValidity('');go(3);
});
document.getElementById('terms').addEventListener('change',e=>e.target.setCustomValidity(''));
document.getElementById('backReview').addEventListener('click',()=>go(1));
})();