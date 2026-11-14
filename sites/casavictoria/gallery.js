// Casa-Victoria gallery: category folders are uploaded manually to images/.
// The public GitHub Contents API lists photos; the website never uploads files.
// The All tab combines the folders, eliminating duplicate image content.
(()=>{
  const repository='Merci-Chi/Steadyhandsop';
  const base='/images/';
  const folders=[
    ['wedding','Wedding'],
    ['tuxedos','Tuxedos'],
    ['dresses','Dresses'],
    ['fabrics-accessories','Fabrics & Accessories','Fabrics'],
    ['behind-the-scenes','Behind the Scenes'],
    ['other','Other']
  ];
  const tabs=Array.from(document.querySelectorAll('.cv-gallery-categories a[href^="#category-"]'));
  if(!tabs.length)return;
  const sections=new Map(tabs.map(tab=>[tab.hash.slice(1),document.getElementById(tab.hash.slice(1))]));
  const allSection=sections.get('category-all');

  // Background motion is isolated from the photo lightbox and the other tabs.
  const backdrop=document.querySelector('.cv-behind-video-layer');
  const backgroundVideo=document.getElementById('cv-behind-video');
  const videoFile='/images/Behind%20the%20Scenes/behind-the-scenes-loop.mp4';
  let fadeOutTimer=null;
  let videoLoaded=false;
  function updateBackgroundVideo(active){
    if(!backdrop || !backgroundVideo)return;
    window.clearTimeout(fadeOutTimer);
    const show=active==='category-behind-the-scenes';
    if(show){
      backgroundVideo.muted=true;
      backgroundVideo.loop=true;
      backgroundVideo.playsInline=true;
      if(!videoLoaded){
        backgroundVideo.src=videoFile;
        videoLoaded=true;
        backgroundVideo.load();
      }
      backdrop.classList.add('is-visible');
      backgroundVideo.play().catch(()=>{}); // Autoplay can be blocked by the browser.
    }else{
      backdrop.classList.remove('is-visible');
      fadeOutTimer=window.setTimeout(()=>{
        if(!backdrop.classList.contains('is-visible')){
          backgroundVideo.pause();
          backgroundVideo.currentTime=0;
        }
      },700);
    }
  }
  if(backgroundVideo){
    backgroundVideo.addEventListener('error',()=>{
      // The static site may be hosted from another path. Try the repository's
      // public raw URL once if the local path is not available.
      if(backgroundVideo.dataset.fallbackTried)return;
      backgroundVideo.dataset.fallbackTried='true';
      backgroundVideo.src='https://raw.githubusercontent.com/Merci-Chi/Steadyhandsop/main/images/Behind%20the%20Scenes/behind-the-scenes-loop.mp4';
      backgroundVideo.load();
      if(backdrop?.classList.contains('is-visible'))backgroundVideo.play().catch(()=>{});
    });
  }

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
    updateBackgroundVideo(active);
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
    button.dataset.caption='';
    button.setAttribute('aria-label','View '+label+' photo');
    const img=document.createElement('img');
    img.src=url;
    img.alt=label+' photo';
    img.loading='lazy';
    img.decoding='async';
    img.addEventListener('error',()=>{
      // Use the public repository as a fallback when the website's asset root differs.
      if(!img.dataset.fallbackTried){
        img.dataset.fallbackTried='true';
        const fallback='https://raw.githubusercontent.com/Merci-Chi/Steadyhandsop/main/images/'+encodeURIComponent(folder)+'/'+encodeURIComponent(file.name);
        img.src=fallback;
        button.dataset.img=fallback;
      }else{
        button.hidden=true;
      }
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
  // The highlighted construction photos are grouped in fixed before/after pairs.
  // Each photo remains a normal lightbox button; no files are renamed or moved.
  const behindPairs=[
    ['1daa4eb4-edda-4a08-92c6-db171449e03c 2.JPG','casa-work-15.webp'],
    ['4806bd9d-a2bc-4bd7-a423-6dd21e837dc5 2.JPG','983d3c75-06ea-464b-9621-cb9e49e8b549 2.JPG']
  ];
  function makePair(entries,label){
    const wrapper=document.createElement('div');
    wrapper.className='cv-before-after-pair';
    entries.forEach(({file,folder},index)=>{
      const button=card(file,folder,label);
      const tag=document.createElement('span');
      tag.className='cv-comparison-tag';
      tag.textContent=index===0?'Before':'After';
      tag.setAttribute('aria-hidden','true');
      button.append(tag);
      if(file.name==='4806bd9d-a2bc-4bd7-a423-6dd21e837dc5 2.JPG'){
        button.classList.add('cv-bra-after-rotated');
        button.dataset.orientation='bra-after';
      }
      wrapper.append(button);
    });
    return wrapper;
  }
  function render(panel,photos,label){
    const grid=panel?.querySelector('.cv-category-grid');
    if(!grid)return;
    if(label==='Behind the Scenes'){
      const lookup=new Map(photos.map(photo=>[photo.file.name,photo]));
      const grouped=new Set();
      const elements=[];
      for(const pair of behindPairs){
        const items=pair.map(name=>lookup.get(name)).filter(Boolean);
        if(items.length===2){
          elements.push(makePair(items,label));
          pair.forEach(name=>grouped.add(name));
        }
      }
      photos.filter(photo=>!grouped.has(photo.file.name))
        .forEach(photo=>elements.push(card(photo.file,photo.folder,label)));
      grid.replaceChildren(...elements);
    }else{
      grid.replaceChildren(...photos.map(({file,folder})=>card(file,folder,label)));
    }
    message(panel,photos.length?'':'Photos coming soon.');
  }
  async function load(){
    // Static manifest is deployed with the page; no client-side GitHub API,
    // authorization, rate limits, or cross-origin fetches are needed.
    const response=await fetch('gallery-photos.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Unable to load gallery manifest: '+response.status);
    const manifest=await response.json();
    if(!manifest.categories || typeof manifest.categories!=='object')throw new Error('Invalid gallery manifest');
    const all=[];
    const seen=new Set();
    for(const [id,folder,displayName] of folders){
      const entries=Array.isArray(manifest.categories[folder])?manifest.categories[folder]:[];
      const photos=entries.filter(file=>file && typeof file.name==='string' && webExtensions.test(file.name))
        .sort((a,b)=>{ const priority=['casa-bridal-front-studio.webp','casa-bridal-back-studio.webp','casa-bridal-sleeve-studio.webp']; if(folder==='Wedding'){const ai=priority.indexOf(a.name),bi=priority.indexOf(b.name);if(ai!==bi)return (ai<0?999:ai)-(bi<0?999:bi);} return a.name.localeCompare(b.name,undefined,{numeric:true});})
        .map(file=>({file,folder}));
      render(sections.get('category-'+id),photos,displayName || folder);
      for(const photo of photos){
        const identity=photo.file.sha || photo.folder+'/'+photo.file.name;
        if(seen.has(identity))continue;
        seen.add(identity);
        all.push(photo);
      }
    }
    render(allSection,all,'All Work');
  }
  load().catch(error=>{
    console.error('Casa-Victoria gallery:',error);
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
    picture.classList.toggle('cv-bra-after-rotated-image',item.dataset.orientation==='bra-after');
    picture.alt=item.querySelector('img')?.alt || item.dataset.caption || 'Casa-Victoria gallery photo';
    caption.textContent='';
    caption.hidden=true;
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
    picture.classList.remove('cv-bra-after-rotated-image');
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
