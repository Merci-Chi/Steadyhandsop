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
// Preserve the chosen sound state while fading the last 45% of the page.
function fadeAudio(){
 const scrollRange=Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const progress=scrollRange>0?Math.min(1,Math.max(0,scrollY/scrollRange)):0;
 const fade=Math.min(1,Math.max(0,(progress-.55)/.45));
 video.volume=1-fade*fade*(3-2*fade);
}
let audioFrame=0;
function scheduleAudioFade(){
 if(!audioFrame)audioFrame=requestAnimationFrame(()=>{audioFrame=0;fadeAudio()});
}
addEventListener('scroll',scheduleAudioFade,{passive:true});
addEventListener('resize',scheduleAudioFade);
addEventListener('pageshow',scheduleAudioFade);
new ResizeObserver(scheduleAudioFade).observe(document.querySelector('main'));
fadeAudio();
function syncMedia(){sound.setAttribute('aria-pressed',String(!video.muted));sound.innerHTML=icon(video.muted?'volume_off':'volume_up')+`<span>${video.muted?'Sound off — tap to listen':'Sound on'}</span>`;play.innerHTML=icon(video.paused?'play_arrow':'pause');play.setAttribute('aria-label',video.paused?'Play background video':'Pause background video')}
sound.addEventListener('click',async()=>{video.muted=!video.muted;if(video.paused){try{await video.play()}catch{}}syncMedia()});
play.addEventListener('click',async()=>{if(video.paused){try{await video.play()}catch{}}else video.pause();syncMedia()});
video.addEventListener('play',syncMedia);video.addEventListener('pause',syncMedia);video.addEventListener('volumechange',syncMedia);
if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.autoplay=false;video.pause()}else{video.play().catch(syncMedia)}syncMedia();

}
const reviews=[{"author": "Jennie Peng", "text": "The boss is really nice and patient!", "full": false}, {"author": "Jacob Anderson", "text": "Nacho was friendly, professional, and offered great value.", "full": false}, {"author": "Laura Jones", "text": "Wonderful experience. Very affordable", "full": false}, {"author": "Melanie Bii", "text": "Super welcoming and nice", "full": false}];
const carousel=document.querySelector('.review-carousel-section');
if(carousel){
 const grid=carousel.querySelector('.carousel-cards'),modal=document.querySelector('.review-popup');let start=0,current=0,cycling=!matchMedia('(prefers-reduced-motion: reduce)').matches,paused=false,lastTrigger=null;
 const wrap=i=>(i+reviews.length)%reviews.length;
 const visible=()=>innerWidth<650?1:innerWidth<1100?2:3;
 const stars=()=>Array.from({length:5},()=>icon('star')).join('');
 function showReview(i){current=wrap(i);const r=reviews[current];modal.querySelector('#popup-author').textContent=r.author;modal.querySelector('.popup-review').textContent='“'+r.text+'”';modal.querySelector('.popup-label').textContent=r.full?'Google review':'Google review excerpt';modal.querySelector('.popup-stars').innerHTML=stars();modal.querySelector('.popup-review').scrollTop=0}
 function openReview(i,trigger){lastTrigger=trigger;showReview(i);modal.showModal();document.body.style.overflow='hidden'}
 function render(){grid.replaceChildren();for(let n=0;n<visible();n++){const i=wrap(start+n),r=reviews[i],b=document.createElement('button');b.type='button';b.className='customer-note';b.setAttribute('aria-label','Read review by '+r.author);const st=document.createElement('span');st.className='note-stars';st.setAttribute('aria-label','5 out of 5 stars');st.innerHTML=stars();const quote=document.createElement('p');quote.className='review-quote';quote.textContent='“'+r.text+'”';const author=document.createElement('strong');author.textContent=r.author;const source=document.createElement('span');source.className='note-source';source.innerHTML='Open review '+icon('open_in_new');b.append(st,quote,author,source);b.addEventListener('click',()=>openReview(i,b));grid.append(b)}}
 carousel.addEventListener('mouseenter',()=>paused=true);carousel.addEventListener('mouseleave',()=>paused=false);
 setInterval(()=>{if(cycling&&!paused&&!modal.open&&!document.hidden&&!carousel.contains(document.activeElement)){start=wrap(start+1);render()}},7000);
 modal.querySelector('.popup-prev').addEventListener('click',()=>showReview(current-1));modal.querySelector('.popup-next').addEventListener('click',()=>showReview(current+1));modal.querySelector('.popup-close').addEventListener('click',()=>modal.close());modal.addEventListener('close',()=>{document.body.style.overflow='';if(lastTrigger?.isConnected)lastTrigger.focus()});
 modal.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();showReview(current+1)}else if(e.key==='ArrowLeft'){e.preventDefault();showReview(current-1)}});
 modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close()}});
 document.querySelectorAll('.open-reviews').forEach(b=>b.addEventListener('click',()=>openReview(0,b)));addEventListener('resize',render);render();
}

