"use strict";
// Gallery groups use the supplied photograph collection already mapped in js.js.
const SERVICE_GROUPS=[
 {name:'T-Shirts',icon:'fa-shirt',cats:['T-SHIRTS']},
 {name:'Engravings',icon:'fa-pen-ruler',cats:['LASER ENGRAVING']},
 {name:'Hoodies & Sweatshirts',icon:'fa-vest',cats:['HOODIES','SWEATSHIRTS']},
 {name:'Hats & Caps',icon:'fa-hat-cowboy',cats:['HATS & CAPS']},
 {name:'Custom Designs',icon:'fa-palette',cats:['CUSTOM DESIGNS']},
 {name:'Gifts & Drinkware',icon:'fa-gift',cats:['GIFTS & MORE!']}
];
let currentGroup=null,currentIndex=0,previousFocus=null;
const byGroup=g=>PRODUCTS.filter(p=>g.cats.includes(p.cat));
function gallerySelect(index){
 const photos=byGroup(currentGroup);if(!photos.length)return;
 if(index>=photos.length){navigateGroup(1);return;}
 if(index<0){navigateGroup(-1);return;}
 currentIndex=index;
 const pic=photos[currentIndex];
 const main=document.getElementById('service-main-photo');main.src=pic.img;main.alt=pic.name;
 document.getElementById('service-caption').textContent=pic.name+' — example '+(currentIndex+1)+' of '+photos.length+'. Ask for customization and current pricing.';
 document.getElementById('service-counter').textContent=`${currentGroup.name} · ${currentIndex+1} / ${photos.length}`;
 document.getElementById('service-thumbnails').innerHTML=photos.map((p,i)=>`<button type="button" data-photo-index="${i}" class="${i===currentIndex?'selected':''}" aria-label="Show ${p.name}" aria-pressed="${i===currentIndex}"><img src="${p.img}" alt="" loading="lazy"></button>`).join('');
 const selected=document.querySelector('#service-thumbnails .selected');
 if(selected){const strip=selected.parentElement;strip.scrollLeft=selected.offsetLeft-strip.offsetLeft-strip.clientWidth/2+selected.clientWidth/2;}
}
function navigateGroup(direction){
 const eligible=SERVICE_GROUPS.map((g,i)=>({g,i})).filter(({g})=>byGroup(g).length);
 const pos=eligible.findIndex(({g})=>g===currentGroup);
 if(pos<0)return;
 const target=eligible[(pos+direction+eligible.length)%eligible.length];
 currentGroup=target.g;
 document.getElementById('service-title').textContent=currentGroup.name;
 const nextIndex=direction<0?byGroup(currentGroup).length-1:0;
 gallerySelect(nextIndex);
}
function openService(i){
 const g=SERVICE_GROUPS[i];if(!g||!byGroup(g).length)return;
 previousFocus=document.activeElement;currentGroup=g;currentIndex=0;
 document.getElementById('service-title').textContent=g.name;
 gallerySelect(0);
 document.getElementById('service-dialog').showModal();
}
function setupServiceGallery(){
 const grid=document.getElementById('service-gallery-grid');if(!grid)return;
 const groups=SERVICE_GROUPS.filter(g=>byGroup(g).length);
 grid.innerHTML=groups.map(g=>{const index=SERVICE_GROUPS.indexOf(g),photos=byGroup(g),representative=photos[0];return `<button type="button" class="service-card" data-service="${index}" aria-label="Explore ${g.name} gallery"><div class="service-card-photo"><img src="${representative.img}" alt="${g.name} example" loading="lazy"><span class="service-card-count"><i class="fa-regular fa-images" aria-hidden="true"></i> ${photos.length} photos</span></div><div class="service-card-label"><i class="fa-solid ${g.icon}" aria-hidden="true"></i><strong>${g.name}</strong><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i></div></button>`}).join('');
 grid.addEventListener('click',e=>{const b=e.target.closest('[data-service]');if(b)openService(Number(b.dataset.service))});
 const dialog=document.getElementById('service-dialog');
 document.getElementById('service-close').addEventListener('click',()=>dialog.close());
 document.getElementById('service-prev').addEventListener('click',()=>gallerySelect(currentIndex-1));
 document.getElementById('service-next').addEventListener('click',()=>gallerySelect(currentIndex+1));
 document.getElementById('service-thumbnails').addEventListener('click',e=>{const b=e.target.closest('[data-photo-index]');if(b)gallerySelect(Number(b.dataset.photoIndex))});
 document.getElementById('service-add').addEventListener('click',()=>{const pic=byGroup(currentGroup)[currentIndex];if(pic)addCart(pic.id)});
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>previousFocus?.focus());
 document.addEventListener('keydown',e=>{if(!dialog.open)return;if(e.key==='ArrowRight'){e.preventDefault();gallerySelect(currentIndex+1)}if(e.key==='ArrowLeft'){e.preventDefault();gallerySelect(currentIndex-1)}});
 const q=new URLSearchParams(location.search).get('category');if(q){const idx=SERVICE_GROUPS.findIndex(g=>g.cats.includes(q)||g.name.toLowerCase()===q.toLowerCase());if(idx>=0)openService(idx)}
}
document.addEventListener('DOMContentLoaded',setupServiceGallery);
