/* Legal links will be enabled once approved policy pages are supplied. */
(()=>{
let current=null;
document.addEventListener('click',event=>{
const trigger=event.target.closest('[data-legal-notice]');
if(!trigger)return;
if(current)current.remove();
current=document.createElement('div');
current.className='sh-wave-footer__notice';
current.setAttribute('role','status');
current.textContent=trigger.dataset.legalNotice+' page is not available yet.';
document.body.appendChild(current);
});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&current){current.remove();current=null;}});
})();
