// Casa-Victoria gallery: category folders are uploaded manually to images/.
// The public GitHub Contents API lists photos; the website never uploads files.
// The All tab combines the folders, eliminating duplicate image content.
(()=>{
  const repository='Merci-Chi/Steadyhandsop';
  const base='images/';
  const folders=[
    ['wedding','Wedding'],
    ['tuxedos','Tuxedos'],
    ['dresses','Dresses'],
    ['fabrics-accessories','Fabrics & Accessories'],
    ['behind-the-scenes','Behind the Scenes'],
    ['other','Other']
  ];
  const tabs=Array.from(document.querySelectorAll('.cv-gallery-categories a[href^="#category-"]'));
  if(!tabs.length)return;
  const sections=new Map(tabs.map(tab=>[tab.hash.slice(1),document.getElementById(tab.hash.slice(1))]));
  const allSection=sections.get('category-all');

  const tabBar=document.querySelector('.cv-gallery-categories');
  tabBar.setAttribute('role','tablist');

  function selectTab(id,updateUrl=false){
    const active=tabs.some(tab=>tab.hash.slice(1)===id)?id:'category-all';
    tabs.forEach((tab,index)=>{
      const selected=tab.hash.slice(1)===active;
      tab.setAttribute('aria-selected',String(selected));
      tab.setAttribute('tabindex',selected?'0':'-1');
      tab.classList.toggle('is-active',selected);
      const section=sections.get(tab.hash.slice(1));
      if(section)section.hidden=!selected;
    });
    if(updateUrl)history.replaceState(null,'','#'+active);
  }
  tabs.forEach((tab,index)=>{
    const id=tab.hash.slice(1);
    tab.id=tab.id || 'gallery-category-tab-'+index;
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',id);
    const panel=sections.get(id);
    if(panel){panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);}
    tab.addEventListener('click',event=>{event.preventDefault();selectTab(id,true);});
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:
        (index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
      const nextTab=tabs[next];
      selectTab(nextTab.hash.slice(1),true);
      nextTab.focus();
    });
  });
  selectTab(location.hash.slice(1));
  window.addEventListener('hashchange',()=>selectTab(location.hash.slice(1)));

  const imageExtensions=/\.(?:jpe?g|png|webp|gif|avif|tiff?)$/i;
  const webExtensions=/\.(?:jpe?g|png|webp|gif|avif)$/i;
  const imageFileName=name=>imageExtensions.test(name) && !name.startsWith('.') && !name.startsWith('._');
  const photoUrl=(folder,name)=>base+encodeURIComponent(folder)+'/'+encodeURIComponent(name);
  function card(file,folder,label){
    const button=document.createElement('button');
    button.type='button';
    button.className='portfolio-photo cv-client-photo';
    const url=photoUrl(folder,file.name);
    button.dataset.img=url;
    button.dataset.caption=label+' — '+file.name.replace(/\.[^.]+$/,'');
    button.setAttribute('aria-label','View '+button.dataset.caption);
    const img=document.createElement('img');
    img.src=url;
    img.alt=button.dataset.caption;
    img.loading='lazy';
    img.decoding='async';
    img.addEventListener('error',()=>{
      button.hidden=true;
      // Do not show broken or unsupported images.
    });
    const overlay=document.createElement('span');
    overlay.className='portfolio-photo-overlay';
    overlay.setAttribute('aria-hidden','true');
    overlay.textContent='View';
    button.append(img,overlay);
    return button;
  }
  function message(panel,value){
    const p=panel?.querySelector('.cv-gallery-empty');
    if(p)p.textContent=value;
  }
  function render(panel,photos,label){
    const grid=panel?.querySelector('.cv-category-grid');
    if(!grid)return;
    grid.replaceChildren(...photos.map(({file,folder})=>card(file,folder,label)));
    message(panel,photos.length?'':'Photos coming soon.');
  }
  async function listFolder(folder){
    const endpoint='https://api.github.com/repos/'+repository+'/contents/sites/casavictoria/images/'+encodeURIComponent(folder)+'?ref=main';
    const response=await fetch(endpoint,{headers:{'Accept':'application/vnd.github+json'},cache:'no-store'});
    if(response.status===404)return [];
    if(!response.ok)throw new Error('GitHub returned '+response.status);
    const entries=await response.json();
    if(!Array.isArray(entries))throw new Error('Invalid folder response');
    return entries.filter(file=>file.type==='file' && imageFileName(file.name) && webExtensions.test(file.name))
      .sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}))
      .map(file=>({file,folder}));
  }
  async function load(){
    for(const [,label] of folders){} // Categories remain visible while loading.
    const results=await Promise.allSettled(folders.map(async ([id,folder])=>({
      id,folder,photos:await listFolder(folder)
    })));
    const all=[];
    const seen=new Set();
    let failed=0;
    results.forEach((result,index)=>{
      const [id,folder]=folders[index];
      const panel=sections.get('category-'+id);
      if(result.status==='rejected'){
        failed++;
        message(panel,'Unable to load photos right now. Refresh to try again.');
        return;
      }
      render(panel,result.value.photos,folder);
      for(const photo of result.value.photos){
        const identity=photo.file.sha || photo.folder+'/'+photo.file.name;
        if(seen.has(identity))continue;
        seen.add(identity);
        all.push(photo);
      }
    });
    render(allSection,all,'All Work');
    if(failed)message(allSection,failed===folders.length?
      'Unable to load photos right now. Refresh to try again.':
      'Some categories could not load. Refresh to try again.');
  }
  load().catch(()=>{
    sections.forEach(panel=>message(panel,'Unable to load photos right now. Refresh to try again.'));
  });
})();

// Shared header navigation.
const menu=document.getElementById('menu');
const nav=document.getElementById('nav');
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.setAttribute('aria-expanded','false');}));

// Gallery viewer handles photos added asynchronously after a GitHub folder loads.
(()=>{
  const lightbox=document.getElementById('lightbox');
  if(!lightbox)return;
  const picture=lightbox.querySelector('.lightbox-stage img');
  const caption=lightbox.querySelector('.lightbox-caption');
  const counter=lightbox.querySelector('.lightbox-counter');
  const closeBtn=lightbox.querySelector('.lightbox-close');
  const prevBtn=lightbox.querySelector('.lightbox-prev');
  const nextBtn=lightbox.querySelector('.lightbox-next');
  let photos=[],current=0,lastActive=null,previousOverflow='',touchX=null;
  const visiblePhotos=()=>Array.from(document.querySelectorAll('.cv-category-section:not([hidden]) .portfolio-photo:not([hidden])'));
  function update(index){
    if(!photos.length)return;
    current=(index+photos.length)%photos.length;
    const item=photos[current];
    picture.src=item.dataset.img;
    picture.alt=item.querySelector('img')?.alt || item.dataset.caption || 'Casa-Victoria gallery photo';
    caption.textContent=item.dataset.caption || picture.alt;
    counter.textContent=(current+1)+' / '+photos.length;
    const preload=new Image();
    preload.src=photos[(current+1)%photos.length].dataset.img;
  }
  function open(clicked){
    photos=visiblePhotos();
    const index=photos.indexOf(clicked);
    if(index<0)return;
    lastActive=document.activeElement;
    previousOverflow=document.body.style.overflow;
    lightbox.hidden=false;
    document.body.style.overflow='hidden';
    update(index);
    closeBtn.focus();
  }
  function close(){
    if(lightbox.hidden)return;
    lightbox.hidden=true;
    document.body.style.overflow=previousOverflow;
    picture.removeAttribute('src');
    if(lastActive?.isConnected)lastActive.focus();
  }
  document.addEventListener('click',event=>{
    const photo=event.target.closest?.('.cv-category-section .portfolio-photo');
    if(photo && !photo.hidden)open(photo);
  });
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
      if(event.shiftKey && at===0){event.preventDefault();controls.at(-1).focus();}
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
