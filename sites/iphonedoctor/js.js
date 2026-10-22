const icon=name=>`<img class="icon" src="assets/icons/${name}.svg" alt="" aria-hidden="true">`;
const siteHeader=document.querySelector('.site-header');
if(siteHeader){
 const syncHeaderHeight=()=>document.documentElement.style.setProperty('--site-header-height',siteHeader.getBoundingClientRect().height+'px');
 new ResizeObserver(syncHeaderHeight).observe(siteHeader);
 syncHeaderHeight();
}
if(document.querySelector('#hero-video')){
const video=document.querySelector('#hero-video');
const sound=document.querySelector('#sound-toggle');
const play=document.querySelector('#play-toggle');
// Fade with the portion of the video visible below the sticky header.
function fadeAudio(){
 const rect=video.getBoundingClientRect();
 const viewportTop=Math.max(0,siteHeader?.getBoundingClientRect().bottom||0);
 const visibleHeight=Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,viewportTop));
 const availableHeight=Math.max(0,Math.min(rect.height,innerHeight-viewportTop));
 const visible=document.hidden||!availableHeight?0:Math.min(1,visibleHeight/availableHeight);
 video.volume=visible*visible*(3-2*visible);
}
let audioFrame=0;
function scheduleAudioFade(){
 if(!audioFrame)audioFrame=requestAnimationFrame(()=>{audioFrame=0;fadeAudio()});
}
addEventListener('scroll',scheduleAudioFade,{passive:true});
addEventListener('resize',scheduleAudioFade);
addEventListener('pageshow',scheduleAudioFade);
document.addEventListener('visibilitychange',fadeAudio);
const audioLayoutObserver=new ResizeObserver(scheduleAudioFade);
audioLayoutObserver.observe(video);
if(siteHeader)audioLayoutObserver.observe(siteHeader);
fadeAudio();
function syncMedia(){sound.setAttribute('aria-pressed',String(!video.muted));sound.innerHTML=icon(video.muted?'volume_off':'volume_up')+`<span>${video.muted?'Sound off — tap to listen':'Sound on'}</span>`;play.innerHTML=icon(video.paused?'play_arrow':'pause');play.setAttribute('aria-label',video.paused?'Play background video':'Pause background video')}
sound.addEventListener('click',async()=>{video.muted=!video.muted;if(video.paused){try{await video.play()}catch{}}syncMedia()});
play.addEventListener('click',async()=>{if(video.paused){try{await video.play()}catch{}}else video.pause();syncMedia()});
video.addEventListener('play',syncMedia);video.addEventListener('pause',syncMedia);video.addEventListener('volumechange',syncMedia);
if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.autoplay=false;video.pause()}else{video.play().catch(syncMedia)}syncMedia();

}
const reviews=[{"author":"Jennie Peng","text":"ABSOLUTELY RECOMMEND! I found my old iPhone XS Max, which had a broken back glass and front screen leaking. I visited three other stores, but they don’t have parts for such an old phone. However, the boss here found one for me and fixed it really fast! I thought it would take 2- 3 days, because he had to buy the parts for the phone. I drop the phone in the afternoon and the very second morning, he informed me to pick up the phone. The boss is really nice and patient!","full":true,"photos":[{"src":"assets/reviews/jennie-iphone-front.png","alt":"iPhone XS Max front from Jennie Peng’s review"},{"src":"assets/reviews/jennie-iphone-back.png","alt":"iPhone XS Max back from Jennie Peng’s review"}]},{"author":"Jacob Anderson","text":"Had a great experience replacing my shattered s21 ultra screen. Nacho was friendly, professional, and offered great value. I will return.","full":true,"photos":[{"src":"assets/reviews/jacob-samsung-cracked-screen.png","alt":"Samsung S21 Ultra cracked screen from Jacob Anderson’s review"},{"src":"assets/reviews/jacob-samsung-back-workbench.png","alt":"Samsung S21 Ultra back on a workbench from Jacob Anderson’s review"},{"src":"assets/reviews/jacob-samsung-front.png","alt":"Samsung S21 Ultra front on a countertop from Jacob Anderson’s review"},{"src":"assets/reviews/jacob-samsung-back.png","alt":"Samsung S21 Ultra back on a countertop from Jacob Anderson’s review"}]},{"author":"Laura Jones","text":"Wonderful experience. Very affordable and didn't charge a crazy diagnostic fee. Service was complete in less than 2 hours. We will definitely use for all electronic repairs.","full":true,"photos":[]}];
const carousel=document.querySelector('.review-carousel-section');
if(carousel){
 const grid=carousel.querySelector('.carousel-cards'),modal=document.querySelector('.review-popup');let start=0,current=0,cycling=!matchMedia('(prefers-reduced-motion: reduce)').matches,paused=false,lastTrigger=null;
 const wrap=i=>(i+reviews.length)%reviews.length;
 const visible=()=>innerWidth<650?1:innerWidth<1100?2:3;
 const stars=()=>Array.from({length:5},()=>icon('star')).join('');
 function reviewPhotos(r,linked=false){const gallery=document.createElement('div');gallery.className='review-photos';for(const photo of r.photos){const img=document.createElement('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';img.width=250;img.height=250;if(linked){const a=document.createElement('a');a.href=photo.src;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label','Open photo: '+photo.alt);a.append(img);gallery.append(a)}else gallery.append(img)}return gallery}
 function showReview(i){current=wrap(i);const r=reviews[current];modal.querySelector('#popup-author').textContent=r.author;modal.querySelector('.popup-review').textContent='“'+r.text+'”';modal.querySelector('.popup-label').textContent=r.full?'Google review':'Google review excerpt';modal.querySelector('.popup-stars').innerHTML=stars();modal.querySelector('.popup-photos').replaceChildren(reviewPhotos(r,true));modal.querySelector('.popup-content').scrollTop=0}
 function openReview(i,trigger){lastTrigger=trigger;showReview(i);modal.showModal();document.body.style.overflow='hidden'}
 function render(){grid.replaceChildren();for(let n=0;n<visible();n++){const i=wrap(start+n),r=reviews[i],b=document.createElement('button');b.type='button';b.className='customer-note';b.setAttribute('aria-label','Read review by '+r.author);const st=document.createElement('span');st.className='note-stars';st.setAttribute('aria-label','5 out of 5 stars');st.innerHTML=stars();const quote=document.createElement('p');quote.className='review-quote';quote.textContent='“'+r.text+'”';const author=document.createElement('strong');author.textContent=r.author;const source=document.createElement('span');source.className='note-source';source.innerHTML='Open review '+icon('open_in_new');b.append(st,quote);if(r.photos.length)b.append(reviewPhotos(r));b.append(author,source);b.addEventListener('click',()=>openReview(i,b));grid.append(b)}}
 carousel.addEventListener('mouseenter',()=>paused=true);carousel.addEventListener('mouseleave',()=>paused=false);
 setInterval(()=>{if(cycling&&!paused&&!modal.open&&!document.hidden&&!carousel.contains(document.activeElement)){start=wrap(start+1);render()}},7000);
 modal.querySelector('.popup-prev').addEventListener('click',()=>showReview(current-1));modal.querySelector('.popup-next').addEventListener('click',()=>showReview(current+1));modal.querySelector('.popup-close').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>{document.body.style.overflow='';if(lastTrigger?.isConnected)lastTrigger.focus()});
 modal.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showReview(current+1)}else if(e.key==='ArrowLeft'){e.preventDefault();showReview(current-1)}});
 modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
 document.querySelectorAll('.open-reviews').forEach(b=>b.addEventListener('click',()=>openReview(0,b)));addEventListener('resize',render);render();
}

