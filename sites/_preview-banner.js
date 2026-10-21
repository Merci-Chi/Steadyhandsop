/* Shared preview banner for every static site under /sites/. */
(()=>{'use strict';
if(document.getElementById('sh-site-preview-bar'))return;
const match=location.pathname.match(/\/sites\/([^/]+)\//);
const site=match?decodeURIComponent(match[1]):location.pathname.split('/').filter(Boolean)[0];
if(!site)return;
const style=document.createElement('style');
style.textContent=`
:root{--sh-preview-bar-height:0px}
#sh-site-preview-bar{box-sizing:border-box!important;position:relative!important;z-index:2147483000!important;width:100%!important;max-width:none!important;min-height:48px!important;margin:0!important;padding:10px 16px!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px 22px!important;flex-wrap:wrap!important;background:#102b4c!important;color:#fff!important;text-align:center!important;font:700 15px/1.4 Arial,sans-serif!important;letter-spacing:normal!important;box-shadow:0 2px 10px #0002!important;transform:none!important}
#sh-site-preview-bar[hidden]{display:none!important}
#sh-site-preview-bar span{color:#fff!important;font:inherit!important}
#sh-site-preview-bar a{color:#fff!important;background:none!important;font:800 15px/1.4 Arial,sans-serif!important;text-decoration:underline!important;text-underline-offset:3px!important;white-space:normal!important}
#sh-site-preview-bar a:focus-visible{outline:2px solid #ffbf00!important;outline-offset:4px!important}
body.sh-custom-preview{padding-top:0!important}
body.sh-custom-preview>.site-header,body.sh-custom-preview>header.topbar,body.sh-custom-preview>header.header{top:var(--sh-preview-bar-height)!important}
@media(max-width:480px){#sh-site-preview-bar{gap:3px 12px!important;padding:8px 12px!important}#sh-site-preview-bar a{min-height:36px!important}}
`;
const bar=document.createElement('aside');bar.id='sh-site-preview-bar';bar.setAttribute('aria-label','Website preview');
const text=document.createElement('span');text.textContent='WEBSITE PREVIEW';
const link=document.createElement('a');link.href='https://portal.steadyhandsop.com/index.html?preview='+encodeURIComponent(site);link.textContent='Approve preview & continue ↗';
bar.append(text,link);
const insert=()=>{if(document.getElementById('sh-site-preview-bar'))return;document.head.append(style);document.body.classList.add('sh-custom-preview');document.body.prepend(bar);
if(window.self!==window.top)bar.hidden=true;
const measure=()=>document.documentElement.style.setProperty('--sh-preview-bar-height',bar.hidden?'0px':bar.getBoundingClientRect().height+'px');
measure();if(typeof ResizeObserver!=='undefined')new ResizeObserver(measure).observe(bar);else window.addEventListener('resize',measure);
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',insert,{once:true});else insert();
})();