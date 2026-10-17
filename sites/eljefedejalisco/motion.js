/* Local SVG icons from Lucide and Bootstrap; licenses included in assets/icons. */
(() => {
  'use strict';
  const glyphs={'↗':'arrow-up-right','↘':'arrow-down-right','↑':'arrow-up','←':'arrow-left','→':'arrow-right','☰':'menu','✕':'x','▶':'play','✦':'sparkle'};
  function icon(name,leading=false){const el=document.createElement('span');el.className='icon'+(leading?' leading':'');el.style.setProperty('--icon','url("assets/icons/'+name+'.svg")');el.setAttribute('aria-hidden','true');return el;}
  function replaceGlyphs(root){const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walk.nextNode()){const node=walk.currentNode;if(!node.parentElement.closest('script,style,svg,.icon')&&/[↗↘↑←→☰✕▶✦]/.test(node.nodeValue))nodes.push(node);}nodes.forEach(node=>{const fragment=document.createDocumentFragment();for(const part of node.nodeValue.split(/([↗↘↑←→☰✕▶✦])/)){if(glyphs[part])fragment.append(icon(glyphs[part]));else if(part)fragment.append(document.createTextNode(part));}node.replaceWith(fragment);});}
  replaceGlyphs(document.body);
  const socials=[['instagram.com','instagram'],['facebook.com','facebook'],['tiktok.com','tiktok']];
  document.querySelectorAll('.social-bar a,.section-head>a').forEach(link=>{for(const [domain,name] of socials)if(link.href.includes(domain)){link.prepend(icon(name,true));break;}});
  document.querySelectorAll('.reviews a').forEach(link=>link.prepend(icon(link.href.includes('yelp.com')?'yelp':'google',true)));
  document.querySelectorAll('.phone,.order-inner .button').forEach(link=>link.prepend(icon('phone',true)));
  document.querySelectorAll('.delivery-name').forEach(el=>el.prepend(icon('shopping-bag',true)));
  document.querySelectorAll('.hours h3').forEach(el=>el.prepend(icon('clock',true)));
  document.querySelectorAll('.topline a').forEach(el=>el.prepend(icon('map-pin',true)));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const selector='.hero-copy > *, .hero-art > *, .section-head .eyebrow, .section-head h2, .section-head > p, .section-head > a, .menu-tabs, .menu-item, .menu-card, .menu-photo, .gallery-grid > *, .editorial-grid > *, .menu-preview-grid > *, .menu-preview-footer, .embedded-video-grid > *, .gallery-menu-cta, .gallery-controls, .video-card, .social-bar > *, .order-inner .eyebrow, .order-inner h2, .order-inner .button, .delivery-links > *, .visit > div > *, .footer-top > *, .footer-bottom > *';
  const stoneTrack=document.querySelector('.stone-track');
  const pieces=new Map();let frame=0;
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('in-view','revealing');observer.unobserve(entry.target);setTimeout(()=>entry.target.classList.remove('revealing'),1100);}}},{threshold:0,rootMargin:'0px 0px -20px 0px'}):null;
  function register(){let i=pieces.size;document.querySelectorAll(selector).forEach(el=>{if(pieces.has(el))return;el.classList.add('motion-piece');el.style.setProperty('--motion-delay',(i%3)*75+'ms');const speed=[.035,-.025,.05,-.04,.02][i%5];pieces.set(el,{speed,last:0});if(observer)observer.observe(el);else el.classList.add('in-view');i++;});for(const [el] of pieces)if(!el.isConnected)pieces.delete(el);queue();}
  function update(){frame=0;const height=innerHeight;
    if(stoneTrack){const tile=stoneTrack.firstElementChild.getBoundingClientRect().height;const phase=reduced.matches||!tile?0:(Math.max(0,scrollY)*.12)%(tile*2);stoneTrack.style.transform='translate3d(0,'+(-phase).toFixed(3)+'px,0)';}
    for(const [el,state] of pieces){if(reduced.matches){el.style.setProperty('--scroll-y','0px');state.last=0;el.classList.add('in-view');continue;}const rect=el.getBoundingClientRect();if(rect.bottom < -140 || rect.top > height+140)continue;const baseline=rect.top-state.last;const center=baseline+rect.height/2;const limit=innerWidth<761?14:28;const scale=innerWidth<761?.5:1;const y=Math.max(-limit,Math.min(limit,(height/2-center)*state.speed*scale));el.style.setProperty('--scroll-y',y.toFixed(2)+'px');state.last=y;}}
  function queue(){if(!frame)frame=requestAnimationFrame(update);}
  if(observer&&!reduced.matches)document.documentElement.classList.add('motion-ready');
  register();addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});addEventListener('load',queue,{once:true});reduced.addEventListener('change',()=>{document.documentElement.classList.toggle('motion-ready',!reduced.matches&&!!observer);queue();});
  setupCursor();
  new MutationObserver(records=>{const roots=[...new Set(records.filter(record=>record.addedNodes.length).map(record=>record.target))];for(const root of roots)replaceGlyphs(root);if(roots.length)register();}).observe(document.querySelector('main'),{childList:true,subtree:true});
  function setupCursor(){
    const fine=matchMedia('(hover: hover) and (pointer: fine)');
    const cursors=[document.body,...document.querySelectorAll('dialog')].map(host=>{const cursor=document.createElement('div');cursor.className='custom-cursor';cursor.setAttribute('aria-hidden','true');host.append(cursor);return {host,cursor};});
    let lastX=0,lastY=0,lastTarget=null,inside=false;
    const clickable='a[href],button:not(:disabled),[role="button"]:not([aria-disabled="true"]),[role="tab"]:not([aria-disabled="true"]),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,label[for]';
    function hide(){document.documentElement.classList.remove('cursor-enabled');cursors.forEach(({cursor})=>cursor.classList.remove('visible'));}
    function paint(target){
      if(!fine.matches||!inside||!target||document.hidden||target.closest('video,iframe')){hide();return;}
      document.documentElement.classList.add('cursor-enabled');
      const dialog=document.querySelector('dialog[open]');
      const host=dialog||document.body;
      const active=!!target.closest(clickable);
      cursors.forEach(entry=>{const {cursor}=entry;cursor.style.left=lastX+'px';cursor.style.top=lastY+'px';cursor.classList.toggle('visible',entry.host===host);cursor.classList.toggle('locked',active);});
    }
    document.addEventListener('pointermove',e=>{if(e.pointerType==='touch'){hide();return;}lastX=e.clientX;lastY=e.clientY;inside=true;lastTarget=e.target;paint(lastTarget);},{passive:true});
    document.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'||e.pointerType==='pen'){lastTarget=e.target;paint(lastTarget);}},{passive:true});
    document.addEventListener('pointerout',e=>{if(!e.relatedTarget){inside=false;hide();}},{passive:true});
    document.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){inside=false;hide();}else cursors.forEach(({cursor})=>cursor.classList.add('pressed'));},{passive:true});
    document.addEventListener('pointerup',()=>cursors.forEach(({cursor})=>cursor.classList.remove('pressed')),{passive:true});
    addEventListener('scroll',()=>{if(inside){lastTarget=document.elementFromPoint(lastX,lastY);paint(lastTarget);}},{passive:true,capture:true});
    addEventListener('blur',()=>{inside=false;hide();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){inside=false;hide();}});
    document.addEventListener('keydown',e=>{if(e.key==='Tab'){inside=false;hide();}});
    document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(inside){lastTarget=document.elementFromPoint(lastX,lastY);paint(lastTarget);}}));
    const dialogObserver=new MutationObserver(()=>{if(inside){lastTarget=document.elementFromPoint(lastX,lastY);paint(lastTarget);}});
    document.querySelectorAll('dialog').forEach(dialog=>dialogObserver.observe(dialog,{attributes:true,attributeFilter:['open']}));
    fine.addEventListener('change',()=>{if(!fine.matches)hide();});
  }
})();
