(()=>{'use strict';
const q=new URLSearchParams(location.search);
const slugByOriginal={
'pkg-orlando-florida-std':['Summer Bay Orlando · 1-Bedroom Condo',149,'5 days · 4 nights','images/packages/orlando/photo-01.webp'],
'pkg-orlando-fl-ste':['Summer Bay Orlando · 2-Bedroom Condo',199,'5 days · 4 nights','images/packages/orlando/photo-01.webp'],
'pkg-daytona-beach-fl':['Daytona Beach Getaway',null,'4 days · 3 nights','images/packages/daytona/photo-01.webp']};
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
if(known?.[3]){const photo=known[3];document.getElementById('packageImage').style.backgroundImage='linear-gradient(0deg,#1115,#1111),url("'+photo+'")'}
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