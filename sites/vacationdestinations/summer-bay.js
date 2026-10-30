(()=>{
 document.querySelectorAll('.summer-resort-reviews').forEach((row,rowIndex)=>{
  row.classList.add('guest-reviews-grid');row.id='resort-review-row-'+rowIndex;row.tabIndex=0;row.setAttribute('role','region');row.setAttribute('aria-label','Resort guest reviews');
  row.querySelectorAll('.summer-resort-review').forEach(card=>{
   card.classList.add('guest-review');
   const mark=document.createElement('div');mark.className='guest-review-mark';mark.textContent='“';mark.setAttribute('aria-hidden','true');card.prepend(mark);
   const name=card.querySelector(':scope > p');
   if(name){
    const author=document.createElement('div');author.className='guest-review-author';
    const avatar=document.createElement('span');avatar.className='guest-review-avatar resort-review-initials';avatar.setAttribute('aria-hidden','true');avatar.textContent=name.textContent.trim().split(/\s+/).map(word=>word[0]).slice(0,2).join('').toUpperCase();
    const title=document.createElement('h3');title.textContent=name.textContent;author.append(avatar,title);name.replaceWith(author);
   }
  });
  const controls=document.createElement('div');controls.className='guest-review-controls';
  const hint=document.createElement('p');hint.textContent='Scroll to explore all reviews';controls.append(hint);
  [-1,1].forEach(direction=>{
   const button=document.createElement('button');button.type='button';button.textContent=direction<0?'‹':'›';button.setAttribute('aria-label',direction<0?'Previous reviews':'Next reviews');button.setAttribute('aria-controls',row.id);
   button.addEventListener('click',()=>{const card=row.querySelector('.guest-review');row.scrollBy({left:direction*(card.getBoundingClientRect().width+parseFloat(getComputedStyle(row).gap||0)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});controls.append(button);
  });row.before(controls);
 });

 const gallery=document.querySelector('.summer-gallery-all'),dialog=document.querySelector('.summer-lightbox');
 if(!gallery||!dialog)return;
 const photos=[...gallery.querySelectorAll('[data-photo-index]')];
 if(!photos.length)return;
 const photo=dialog.querySelector('[data-full-photo]'),caption=dialog.querySelector('[data-photo-caption]'),counter=dialog.querySelector('[data-photo-counter]');
 const thumbnails=document.createElement('div');thumbnails.className='summer-lightbox-thumbnails';thumbnails.setAttribute('aria-label','Photos in this category');dialog.append(thumbnails);
 let current=0,trigger=null;
 function updateThumbnails(){
  const category=photos[current].dataset.photoCategory;
  thumbnails.replaceChildren();
  photos.forEach((original,index)=>{
   if(original.dataset.photoCategory!==category)return;
   const button=document.createElement('button');button.type='button';button.className='summer-lightbox-thumbnail';
   button.setAttribute('aria-label',original.querySelector('img').alt);
   button.setAttribute('aria-pressed',String(index===current));
   const image=original.querySelector('img').cloneNode(true);image.removeAttribute('width');image.removeAttribute('height');image.loading='lazy';button.append(image);
   button.addEventListener('click',()=>{show(index);thumbnails.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});});
   thumbnails.append(button);
  });
  thumbnails.querySelector('[aria-pressed="true"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
 }
 function show(index){
  current=(index+photos.length)%photos.length;
  const image=photos[current].querySelector('img');
  photo.src=image.src;photo.alt=image.alt;
  caption.textContent=image.alt;
  updateThumbnails();
  counter.textContent=`${photos[current].dataset.photoCategory} · ${current+1} / ${photos.length}`;
 }
 function open(index,button){trigger=button;show(index);dialog.showModal();}
 const groups=[...gallery.querySelectorAll('.summer-gallery-category')];
 groups.forEach(group=>{
  const originals=[...group.querySelectorAll('[data-photo-index]')];
  if(!originals.length)return;
  const category=originals[0].dataset.photoCategory;
  const button=document.createElement('button');
  button.type='button';button.className='category-stack';
  button.dataset.previewCount=String(Math.min(originals.length,3));
  button.setAttribute('aria-label',`${category}: browse ${originals.length} ${originals.length===1?'photo':'photos'}`);
  const stage=document.createElement('span');stage.className='category-stack-stage';stage.setAttribute('aria-hidden','true');
  originals.slice(0,3).forEach((original,index)=>{
   const frame=document.createElement('span');frame.className=`category-stack-frame category-stack-frame-${index}`;
   const image=original.querySelector('img').cloneNode(true);image.alt='';image.removeAttribute('width');image.removeAttribute('height');frame.append(image);stage.append(frame);
  });
  const label=document.createElement('span');label.className='category-stack-label';
  const title=document.createElement('strong');title.textContent=category;
  const count=document.createElement('span');count.textContent=`${originals.length} ${originals.length===1?'photo':'photos'} · View gallery`;
  label.append(title,count);button.append(stage,label);
  button.addEventListener('click',()=>open(photos.indexOf(originals[0]),button));
  group.querySelector('.summer-gallery').classList.add('summer-category-originals');
  group.querySelector('.summer-gallery').hidden=true;
  group.append(button);
 });
 gallery.style.setProperty('--category-count',String(groups.length));
 gallery.classList.add('category-stacks-enabled');
 dialog.querySelector('[data-gallery-close]').addEventListener('click',()=>dialog.close());
 dialog.querySelector('[data-gallery-prev]').addEventListener('click',()=>show(current-1));
 dialog.querySelector('[data-gallery-next]').addEventListener('click',()=>show(current+1));
 dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>trigger?.focus());
})();
