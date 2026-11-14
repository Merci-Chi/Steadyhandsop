/* Seam feathering for the unrotated horizontal ivory-satin gallery background.
   Matches CSS background-size:100% auto and background-repeat:repeat-y. */
(()=>{
  'use strict';
  const section=document.querySelector('.portfolio-section');
  if(!section)return;

  const silk=new Image();
  silk.decoding='async';
  silk.src='images/ivory-satin-horizontal.webp';
  const seamWidth=42;
  let raf=0;

  function renderSeams(){
    raf=0;
    section.querySelectorAll(':scope > .gallery-seam-blur').forEach(el=>el.remove());
    if(!silk.naturalWidth||!silk.naturalHeight)return;

    // CSS sizes every background tile to the gallery section's full height.
    const width=section.clientWidth;
    const height=section.clientHeight;
    const tileHeight=silk.naturalHeight*(width/silk.naturalWidth);
    if(!Number.isFinite(tileHeight)||tileHeight<=0||tileHeight>=height)return;

    // Add subtle horizontal white feathering centered at each repeat boundary.
    const fragment=document.createDocumentFragment();
    for(let y=tileHeight;y<height&&fragment.childNodes.length<60;y+=tileHeight){
      const seam=document.createElement('span');
      seam.className='gallery-seam-blur';
      seam.setAttribute('aria-hidden','true');
      seam.style.top=(y-seamWidth/2)+'px';
      fragment.appendChild(seam);
    }
    // Keep seam layers behind the gallery video and photo/grid content.
    section.insertBefore(fragment,section.firstChild);
  }
  function schedule(){
    if(raf)return;
    raf=window.requestAnimationFrame(renderSeams);
  }

  silk.addEventListener('load',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('pageshow',schedule);
  if(typeof ResizeObserver!=='undefined'){
    const observer=new ResizeObserver(schedule);
    observer.observe(section);
  }
  if(silk.complete&&silk.naturalWidth)schedule();
})();
