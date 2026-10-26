document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('topic-select');
  if (!root) return;
  const trigger = document.getElementById('topic-trigger');
  const panel = document.getElementById('topic-options');
  const label = document.getElementById('topic-choice');
  const hidden = document.getElementById('contact-topic');
  const options = Array.from(panel.querySelectorAll('[role="option"]'));
  let cursor = 0;
  const selectedIndex = () => Math.max(0, options.findIndex(o => o.dataset.value === hidden.value));
  const close = (focus = false) => {panel.hidden = true; trigger.setAttribute('aria-expanded','false'); trigger.removeAttribute('aria-activedescendant'); if(focus) trigger.focus();};
  const open = () => {panel.hidden = false; trigger.setAttribute('aria-expanded','true'); cursor = selectedIndex(); focusOption(cursor);};
  const focusOption = i => {cursor = (i + options.length) % options.length; options[cursor].focus();};
  const select = i => {const o = options[i]; hidden.value = o.dataset.value; label.textContent = o.textContent; options.forEach(x => x.setAttribute('aria-selected', String(x === o))); close(true);};
  trigger.addEventListener('click', () => panel.hidden ? open() : close());
  trigger.addEventListener('keydown', e => {if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();open(); if(e.key==='ArrowUp')focusOption(options.length-1);}});
  options.forEach((o,i) => {o.addEventListener('click',()=>select(i)); o.addEventListener('keydown',e => {if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();focusOption(i+(e.key==='ArrowDown'?1:-1));} else if(e.key==='Home'){e.preventDefault();focusOption(0);} else if(e.key==='End'){e.preventDefault();focusOption(options.length-1);} else if(e.key==='Escape'){e.preventDefault();close(true);} else if(e.key==='Tab'){close();}});});
  document.addEventListener('pointerdown',e => {if(!root.contains(e.target))close();});
  document.addEventListener('keydown',e => {if(e.key==='Escape'&&!panel.hidden)close(true);});
  const params = new URLSearchParams(location.search);
  if(params.get('topic')==='management') {const i=1;hidden.value=options[i].dataset.value;label.textContent=options[i].textContent;options.forEach((o,j)=>o.setAttribute('aria-selected',String(j===i)));}
});
