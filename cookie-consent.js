/* Privacy settings: only optional third-party functionality requires permission. */
(()=>{'use strict';
const KEY='sh_cookie_consent_v1';
const saved=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v&&typeof v.optional==='boolean'?v:null;}catch{return null;}};
const persist=(v)=>{try{localStorage.setItem(KEY,JSON.stringify({optional:!!v,updatedAt:new Date().toISOString()}));}catch{}};
const getDismissed=()=>{try{return sessionStorage.getItem('sh_consent_dismissed')==='1';}catch{return false;}};
const dismissSession=()=>{try{sessionStorage.setItem('sh_consent_dismissed','1');}catch{}};
const popup=document.getElementById('sh-consent');
const footerSettings=document.querySelectorAll('[data-sh-open-settings]');
const settings=document.getElementById('sh-consent-settings');
const toggle=document.getElementById('sh-consent-optional');
if(!popup)return;
const status=()=>saved()?.optional===true;
window.steadyHandsConsent={hasOptional:status,openSettings:()=>open(true)};
function apply(){
 const allow=status();
 document.dispatchEvent(new CustomEvent('steadyhands:consent-change',{detail:{optional:allow}}));
 document.querySelectorAll('iframe[data-sh-preview-src]').forEach(frame=>{
  if(allow&&!frame.getAttribute('src'))frame.setAttribute('src',frame.dataset.shPreviewSrc);
  if(!allow&&frame.getAttribute('src'))frame.removeAttribute('src');
  const overlay=frame.closest('.ref-iframe-clip')?.querySelector('.sh-preview-blocked');
  if(overlay)overlay.hidden=allow;
 });
}
function open(toSettings=false){popup.hidden=false;settings.hidden=!toSettings;toggle.checked=status();}
function close(){popup.hidden=true;settings.hidden=true;dismissSession();}
function select(allow){persist(allow);apply();close();}
popup.querySelector('[data-sh-close]').addEventListener('click',close);
popup.querySelector('[data-sh-decline]').addEventListener('click',()=>select(false));
popup.querySelector('[data-sh-accept]').addEventListener('click',()=>select(true));
footerSettings.forEach(button=>button.addEventListener('click',()=>open(true)));
popup.querySelector('[data-sh-save]').addEventListener('click',()=>select(toggle.checked));

apply();
if(!saved()&&!getDismissed()){setTimeout(()=>{if(!saved()&&!getDismissed())open();},3000);}

})();
