(()=>{'use strict';
const q=new URLSearchParams(location.search);
const slugByOriginal={
'pkg-orlando-florida-std':['Summer Bay Orlando · 1-Bedroom Condo',149,'5 days · 4 nights','images/summer-bay/resort-01.webp'],
'pkg-orlando-fl-ste':['Summer Bay Orlando · 2-Bedroom Condo',199,'5 days · 4 nights','images/summer-bay/resort-01.webp'],
'pkg-daytona-beach-fl':['Daytona Beach Getaway',null,'4 days · 3 nights','images/daytona/resort-01.webp']};
const allowedPrice=Object.freeze({'pkg-orlando-florida-std':149,'pkg-orlando-fl-ste':199});
const productParam=q.get('package')||'';
let slug=productParam.toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,100);
if(!slug){try{const u=new URL(q.get('product')||'');if(['vacationdestinationsfl.com','www.vacationdestinationsfl.com'].includes(u.hostname)&&u.pathname.startsWith('/product/'))slug=(u.pathname.split('/').filter(Boolean).pop()||'').replace(/[^a-z0-9_-]/gi,'').toLowerCase()}catch{}}
const cleanName=(q.get('name')||'').trim().slice(0,100);const priceArg=q.get('price');const num=priceArg===null?null:Number(priceArg);const safePrice=num!==null&&Number.isFinite(num)&&num>=0&&num<=10000?num:null;
const known=slugByOriginal[slug];const title=known?.[0]||cleanName||slug.replace(/^pkg-/,'').replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const price=known?.[1]??(known?null:safePrice);const stay=known?.[2]||'Vacation package';
const hasPackage=Boolean(slug||cleanName);
document.getElementById('filled').hidden=!hasPackage;document.getElementById('empty').hidden=hasPackage;document.getElementById('count').textContent=hasPackage?'1':'0';if(!hasPackage)return;
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
document.getElementById('productName').textContent=title;document.getElementById('packageDetail').textContent=stay;document.getElementById('packagePrice').textContent=price===null?'Confirm with reservations':money(price);document.getElementById('totalPrice').textContent=price===null?'To be confirmed':money(price);
const imageEl=document.getElementById('packageImage');
const imageArg=(q.get('image')||'').trim();
const safeImage=/^images\/[a-zA-Z0-9_/-]+\.(?:webp|png|jpe?g)$/i;
const mappedPhotos={
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
const preferred=safeImage.test(imageArg)&&!imageArg.includes('..')?imageArg:(mappedPhotos[slug]||known?.[3]||'');
const fallback=known?.[3]||mappedPhotos[slug]||'images/summer-bay/resort-01.webp';
const applyImage=src=>{imageEl.style.backgroundImage='linear-gradient(0deg,rgba(7,48,68,.08),rgba(7,48,68,.08)),url("'+src+'")';imageEl.setAttribute('aria-label',title+' vacation package photo')};
if(preferred){
const test=new Image();test.onload=()=>applyImage(preferred);test.onerror=()=>{const backup=new Image();backup.onload=()=>applyImage(fallback);backup.src=fallback};test.src=preferred;
}else applyImage(fallback);
let details={};const form=document.getElementById('detailsForm');
const panelIds=['guestPanel','reviewPanel','paymentPanel'];
function go(step){panelIds.forEach((id,i)=>document.getElementById(id).hidden=i!==step-1);document.querySelectorAll('.step').forEach((el,i)=>{el.classList.toggle('active',i+1===step);el.setAttribute('aria-current',i+1===step?'step':'false')});document.querySelector('.steps').scrollIntoView({behavior:'smooth',block:'start'})}
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;details=Object.fromEntries(new FormData(form).entries());const rows=[['Vacation package',title],['Primary guest',details.first+' '+details.last],['Email',details.email],['Phone',details.phone],['Travelers',details.adults+' adult(s), '+details.children+' child(ren)'],['Preferred dates',details.travel||'Flexible / not specified'],['Special requests',details.notes||'None']];document.getElementById('reviewContent').innerHTML=rows.map(([k,v])=>'<div class="reviewrow"><span>'+escapeHtml(k)+'</span><strong>'+escapeHtml(v)+'</strong></div>').join('');go(2)});
document.getElementById('editDetails').addEventListener('click',()=>go(1));
document.getElementById('continuePayment').addEventListener('click',()=>{const terms=document.getElementById('terms');if(!terms.checked){terms.focus();terms.setCustomValidity('Please acknowledge the package terms before continuing.');terms.reportValidity();return}terms.setCustomValidity('');go(3)});
document.getElementById('terms').addEventListener('change',e=>e.target.setCustomValidity(''));
document.getElementById('backReview').addEventListener('click',()=>go(2));
})();