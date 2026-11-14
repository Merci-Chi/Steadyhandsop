
// Gallery categories behave as tabs: swap the visible gallery without scrolling.
(()=>{
  const tabs=Array.from(document.querySelectorAll('.cv-gallery-categories a[href^="#category-"]'));
  if(!tabs.length)return;
  const sections=tabs.map(tab=>document.getElementById(tab.getAttribute('href').slice(1)));
  // Assemble the All tab from the existing category images, including alteration details.
  // Clone rather than move the cards so individual category tabs remain unchanged.
  const allGrid=document.querySelector('#category-all .cv-category-grid');
  if(allGrid){
    document.querySelectorAll('.cv-category-section:not(#category-all) .cv-category-grid > .portfolio-photo')
      .forEach(photo=>allGrid.appendChild(photo.cloneNode(true)));
  }
  const selectTab=(id,updateUrl=false)=>{
    const activeIndex=Math.max(0,tabs.findIndex(tab=>tab.getAttribute('href')==='#'+id));
    tabs.forEach((tab,index)=>{
      const selected=index===activeIndex;
      tab.classList.toggle('is-active',selected);
      tab.setAttribute('aria-selected',String(selected));
      tab.setAttribute('tabindex',selected?'0':'-1');
      if(sections[index])sections[index].hidden=!selected;
    });
    if(updateUrl)history.replaceState(null,'','#'+sections[activeIndex].id);
  };
  const tabBar=document.querySelector('.cv-gallery-categories');
  tabBar.setAttribute('role','tablist');
  tabs.forEach((tab,index)=>{
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',sections[index].id);
    sections[index].setAttribute('role','tabpanel');
    sections[index].setAttribute('aria-labelledby',tab.id ||= 'gallery-category-tab-'+index);
    tab.addEventListener('click',event=>{
      event.preventDefault();
      selectTab(sections[index].id,true);
    });
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
        (index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      selectTab(sections[next].id,true);
      tabs[next].focus();
    });
  });
  selectTab(location.hash.slice(1));
  window.addEventListener('hashchange',()=>selectTab(location.hash.slice(1)));
})();

// Shared header navigation.
const menu=document.getElementById('menu');
const nav=document.getElementById('nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));

// Gallery lightbox: buttons, left/right keyboard arrows, Escape, swipe and focus management.
(()=>{
  const lightbox=document.getElementById('lightbox');
  const allPhotos=Array.from(document.querySelectorAll('.portfolio-photo'));
  const visiblePhotos=()=>allPhotos.filter(photo=>!photo.hidden && !photo.closest('[hidden]'));
  if(!lightbox || allPhotos.length===0) return;
  const picture=lightbox.querySelector('.lightbox-stage img');
  const caption=lightbox.querySelector('.lightbox-caption');
  const counter=lightbox.querySelector('.lightbox-counter');
  const closeBtn=lightbox.querySelector('.lightbox-close');
  const prevBtn=lightbox.querySelector('.lightbox-prev');
  const nextBtn=lightbox.querySelector('.lightbox-next');
  let current=0, lastActive=null, previousOverflow='', photos=[];
  let touchX=null;
  function update(index){
    current=(index+photos.length)%photos.length;
    const item=photos[current];
    picture.src=item.dataset.img;
    picture.alt=item.querySelector('img')?.alt || item.dataset.caption || 'Casa-Victoria gallery photo';
    caption.textContent=item.dataset.caption || picture.alt;
    counter.textContent=`${current+1} / ${photos.length}`;
    // Warm up the next image without forcing all 40 images to load at once.
    const preload=new Image(); preload.src=photos[(current+1)%photos.length].dataset.img;
  }
  function open(index){
    lastActive=document.activeElement;
    previousOverflow=document.body.style.overflow;
    lightbox.hidden=false;
    document.body.style.overflow='hidden';
    update(index);
    closeBtn.focus();
  }
  function close(){
    if(lightbox.hidden) return;
    lightbox.hidden=true;
    document.body.style.overflow=previousOverflow;
    picture.removeAttribute('src');
    (lastActive?.isConnected ? lastActive : photos[current]).focus();
  }
  allPhotos.forEach(photo=>photo.addEventListener('click',()=>{photos=visiblePhotos();open(photos.indexOf(photo));}));
  closeBtn.addEventListener('click',close);
  prevBtn.addEventListener('click',()=>update(current-1));
  nextBtn.addEventListener('click',()=>update(current+1));
  lightbox.addEventListener('click',event=>{if(event.target===lightbox)close();});
  document.addEventListener('keydown',event=>{
    if(lightbox.hidden)return;
    if(event.key==='Escape'){event.preventDefault();close();}
    else if(event.key==='ArrowLeft'){event.preventDefault();update(current-1);}
    else if(event.key==='ArrowRight'){event.preventDefault();update(current+1);}
    else if(event.key==='Tab'){
      const controls=[closeBtn,prevBtn,nextBtn];
      const at=controls.indexOf(document.activeElement);
      if(event.shiftKey && at===0){event.preventDefault();controls[controls.length-1].focus();}
      else if(!event.shiftKey && at===controls.length-1){event.preventDefault();controls[0].focus();}
    }
  });
  lightbox.addEventListener('touchstart',event=>{touchX=event.changedTouches[0]?.screenX ?? null;},{passive:true});
  lightbox.addEventListener('touchend',event=>{
    if(touchX===null)return;
    const diff=(event.changedTouches[0]?.screenX ?? touchX)-touchX;
    touchX=null;
    if(Math.abs(diff)>45)update(current+(diff<0?1:-1));
  },{passive:true});
})();
