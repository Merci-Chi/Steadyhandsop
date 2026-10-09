(() => {
"use strict";
const params = new URLSearchParams(location.search);
const siteKey = (params.get("sitekey") || "").trim();
const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean = v => v == null || ["","NOT FOUND","NULL","EMPTY","UNDEFINED","N/A","NA","NONE","NAN"].includes(String(v).trim().toUpperCase()) ? "" : v;
const toList = v => Array.isArray(v) ? v : (typeof v==="string" ? v.split(/[\n\r,;]+/) : []);
const aliases = {
 "bookkeeping service":"tax-accounting","bookkeeping":"tax-accounting","bookkeeper":"tax-accounting",
 "accountant":"tax-accounting","accounting service":"tax-accounting","tax preparation service":"tax-accounting","tax preparer":"tax-accounting",
 "auto repair shop":"auto-repair","auto mechanic":"auto-repair","automotive repair shop":"auto-repair",
 "auto body shop":"auto-body","beauty salon":"beauty","hair salon":"beauty","barber shop":"barber-salon","barber":"barber-salon",
 "chiropractor":"chiropractic","trucking company":"trucking-freight","attorney":"attorney-law","law firm":"attorney-law",
 "optometrist":"optometry","plumber":"plumbing","insurance agency":"insurance","day care center":"daycare-childcare",
 "daycare center":"daycare-childcare","electrician":"electrical","used car dealer":"auto-dealer","roofing contractor":"roofing",
 "pet groomer":"pet-grooming","landscaper":"landscaping","mexican restaurant":"restaurant","bakery":"bakery-desserts",
 "real estate agency":"real-estate","veterinarian":"veterinary","nail salon":"day-spa-med-spa",
 "cleaning service":"cleaning","janitorial service":"cleaning","landscape service":"landscaping","hvac contractor":"hvac",
 "tax accountant":"tax-accounting","general contractor":"construction","plumbing service":"plumbing",
 "electrical contractor":"electrical","massage therapist":"massage-spa","event venue":"event-venue"
};
const profiles = {
 "tax-accounting":["Bookkeeping & Accounting",["Bookkeeping","Tax Preparation","Payroll Support","Financial Organization","Business Tax Planning","Consultation"],"Sample preview copy: describe your bookkeeping, tax, and accounting approach here."],
 "barber-salon":["Barbering & Grooming",["Classic Haircuts","Skin Fades","Beard Trims","Lineups & Shape-Ups","Kids’ Cuts","Style Consultation"],"Sample preview copy: introduce your barbering services, experience, and grooming approach here."],
 "beauty":["Beauty & Salon Services",["Hair Styling","Color Services","Treatments","Special-Event Styling","Consultations","Maintenance & Care"],"Sample preview copy: describe your salon services, specialties, and approach to personal care here."],
 "landscaping":["Landscaping & Outdoor Care",["Landscape Maintenance","Yard Cleanups","Irrigation & Sprinklers","Planting & Enhancements","Turf & Pavers","Seasonal Property Care"],"Sample preview copy: describe your landscaping services, care options, and service area here."],
 "restaurant":["Dining & Food Service",["Dine-In","Takeout","Signature Dishes","Family Favorites","Catering Inquiries","Group Orders"],"Sample preview copy: introduce your food, dining experience, menu, and ordering options here."],
 "cleaning":["Cleaning Services",["Recurring Cleaning","Deep Cleaning","Move-In / Move-Out","Office Cleaning","Kitchen & Bathroom Care","Custom Cleaning Plans"],"Sample preview copy: describe your cleaning services, property types, and service area here."],
 "auto-repair":["Automotive Repair & Maintenance",["Diagnostic Checks","Routine Maintenance","Brake Service","Engine & Performance","Fluid & Filter Service","Repair Estimates"],"Sample preview copy: introduce your automotive maintenance and repair specialties here."],
 "plumbing":["Plumbing Services",["Leak Repairs","Drain Service","Fixture Installation","Water Heater Service","Pipe Repairs","Plumbing Inspections"],"Sample preview copy: describe your plumbing services and service area here."],
 "electrical":["Electrical Services",["Troubleshooting","Lighting Installation","Outlet & Switch Service","Panel Consultation","Fixture Upgrades","Electrical Maintenance"],"Sample preview copy: describe your electrical services, qualifications, and coverage area here."],
 "hvac":["Heating & Air Conditioning",["System Maintenance","Heating Service","Cooling Service","Airflow Troubleshooting","Thermostat Installation","System Estimates"],"Sample preview copy: introduce your heating, cooling, and maintenance services here."],
 "real-estate":["Real Estate Services",["Buying Guidance","Selling Preparation","Property Search","Market Consultations","Listing Support","Local Area Guidance"],"Sample preview copy: explain your real estate services and the customers you help here."],
 "generic":["Professional Business Services",["Consultations","Service Planning","Custom Solutions","Ongoing Support","Project Requests","Frequently Asked Questions"],"Sample preview copy: introduce your company, main services, and what customers can expect here."]
};
function resolveSlug(label, preferred) {
 const raw=String(preferred || label || "generic").trim().toLowerCase();
 return aliases[raw] || raw.replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"") || "generic";
}
function getProfile(slug,label) {
 const p=profiles[slug] || profiles.generic;
 return {title:p[0] || label || "Professional Services", services:p[1], description:p[2]};
}
async function getConfig() {
 if(window.STEADY_HANDS) return window.STEADY_HANDS;
 await new Promise((resolve,reject)=>{const s=document.createElement("script");s.src="../config.js?v=20261009-template-preserve1";s.onload=resolve;s.onerror=()=>reject(new Error("Could not load preview configuration."));document.head.appendChild(s);});
 if(!window.STEADY_HANDS) throw new Error("Preview configuration is unavailable.");
 return window.STEADY_HANDS;
}
async function lookup(key) {
 const cfg=await getConfig();
 const response=await fetch(cfg.supabaseUrl.replace(/\/$/,"")+"/rest/v1/rpc/get_site_by_key",{
   method:"POST",headers:{apikey:cfg.supabaseAnonKey,Authorization:"Bearer "+cfg.supabaseAnonKey,"Content-Type":"application/json"},
   body:JSON.stringify({p_site_key:key})
 });
 if(!response.ok) throw new Error("Site lookup returned HTTP "+response.status+".");
 const data=await response.json(), row=Array.isArray(data)?data[0]:data;
 if(!row) return null;
 const links=Array.isArray(row.links)?row.links:[];
 for(const [label,href] of [["Facebook",row.facebook_url],["Instagram",row.instagram_url],["Yelp",row.yelp_url],["Google Maps",row.google_maps_url],["Website",row.website_url]]) if(href) links.push({text:label,href});
 return {
  sitekey:row.site_key||key,site_key:row.site_key||key,slug:row.site_key||key,
  business_name:clean(row.company_name)||"",title:clean(row.company_name)||"",
  name:clean(row.company_name)||"",category:clean(row.business_category)||clean(row.template_key)||"",
  template_key:clean(row.template_key)||"",template:clean(row.template_key)||"",
  description:clean(row.about_business)||clean(row.description)||"",
  paragraphs:toList(row.paragraphs||row.about_business||row.description),
  phone:clean(row.public_phone)||clean(row.phone)||"",email:clean(row.public_email)||clean(row.email)||"",
  address:clean(row.address_or_service_area)||clean(row.address)||"",
  website:clean(row.website_url)||"",services:toList(row.services),links
 };
}
function profileRecord(source, requestedSlug) {
 const raw=source||{};
 const category=clean(raw.category)||clean(raw.business_category)||clean(raw.template_key)||requestedSlug.replace(/-/g," ");
 const slug=resolveSlug(category,raw.template_key||requestedSlug);
 const p=getProfile(slug,category);
 const business=clean(raw.business_name)||clean(raw.businessName)||clean(raw.company_name)||clean(raw.title);
 const phone=clean(raw.phone), email=clean(raw.email), address=clean(raw.address);
 const realDescription=clean(raw.description);
 const services=toList(raw.services).map(clean).filter(Boolean);
 const paragraphs=toList(raw.paragraphs).map(clean).filter(Boolean);
 const links=Array.isArray(raw.links)?raw.links.filter(l=>l&&clean(l.href)):[];

 // All examples are generated in memory. Nothing here is written back to Supabase.
 const finalBusiness=business||("Example "+p.title+" Business");
 const finalPhone=phone||"(000)000-0000";
 const finalEmail=email||"email@example.com";
 const finalAddress=address||"1234 Example Street, Example City, ST 00000";
 const finalDescription=realDescription||p.description;
 const finalServices=services.length?services:p.services;
 const finalParagraphs=paragraphs.length?paragraphs:[finalDescription, "SAMPLE PREVIEW COPY: Add more information about your services, your process, and what customers can expect after unlocking your website."];
 const finalLinks=links.length?links:[
  {text:"Example Instagram",href:"https://instagram.com/example"},
  {text:"Example Facebook",href:"https://facebook.com/example"},
  {text:"Example Google listing",href:"https://www.google.com/maps/search/?api=1&query=Example+Business"}
 ];
 return {
  sitekey:clean(raw.sitekey)||clean(raw.site_key)||siteKey,site_key:clean(raw.site_key)||clean(raw.sitekey)||siteKey,slug:clean(raw.slug)||siteKey,
  business_name:finalBusiness,title:finalBusiness,name:finalBusiness,category,template_key:slug,template:slug,
  description:finalDescription,paragraphs:finalParagraphs,phone:finalPhone,email:finalEmail,address:finalAddress,
  website:clean(raw.website)||"www.example.com",services:finalServices,links:finalLinks,
  // Add common data properties original templates reference.
  service_area:finalAddress,public_phone:finalPhone,public_email:finalEmail,
  _example:{business:!business,phone:!phone,email:!email,address:!address,description:!realDescription,services:!services.length,links:!links.length}
 };
}
function escapeTemplateValue(v) { return esc(v==null?"":v); }
function splitTopLevel(text, operator) {
 let depth=0, quote="", out=[];
 for(let i=0;i<text.length;i++){const ch=text[i];if(quote){if(ch===quote&&text[i-1]!=="\\")quote="";continue;}if(ch==='"'||ch==="'"){quote=ch;continue;}if(ch==="("||ch==="["||ch==="{")depth++;else if(ch===")"||ch==="]"||ch==="}")depth--;
  if(depth===0&&text.slice(i,i+operator.length)===operator){out.push(text.slice(0,i).trim(),text.slice(i+operator.length).trim());return out;}
 }return null;
}
function stripOuter(s) { s=s.trim();if(s[0]!=="("||s[s.length-1]!==")")return s;let depth=0,quote="";for(let i=0;i<s.length;i++){let ch=s[i];if(quote){if(ch===quote&&s[i-1]!=="\\")quote="";continue;}if(ch==='"'||ch==="'")quote=ch;else if(ch==="(")depth++;else if(ch===")"){depth--;if(depth===0&&i<s.length-1)return s;}}return s.slice(1,-1).trim();}
function truthy(v){return Array.isArray(v)?v.length>0:!!v;}
function evalExpr(expr,ctx) {
 expr=stripOuter(String(expr||"").replace(/\s+/g," ").trim());
 if(!expr)return "";
 const tern=expr.match(/^(.+?)\s+if\s+(.+?)\s+else\s+([\s\S]+)$/);if(tern)return truthy(evalExpr(tern[2],ctx))?evalExpr(tern[1],ctx):evalExpr(tern[3],ctx);
 let split=splitTopLevel(expr," or ");if(split)return truthy(evalExpr(split[0],ctx))?evalExpr(split[0],ctx):evalExpr(split[1],ctx);
 split=splitTopLevel(expr," and ");if(split)return truthy(evalExpr(split[0],ctx))&&truthy(evalExpr(split[1],ctx))?evalExpr(split[1],ctx):false;
 if(expr.startsWith("not "))return !truthy(evalExpr(expr.slice(4),ctx));
 for(const op of [" == "," != "," >= "," <= "," > "," < "]){split=splitTopLevel(expr,op);if(split){const a=evalExpr(split[0],ctx),b=evalExpr(split[1],ctx);switch(op.trim()){case"==":return String(a)===String(b);case"!=":return String(a)!==String(b);case">=":return Number(a)>=Number(b);case"<=":return Number(a)<=Number(b);case">":return Number(a)>Number(b);case"<":return Number(a)<Number(b);}}}
 split=splitTopLevel(expr," in ");if(split){const a=evalExpr(split[0],ctx),b=evalExpr(split[1],ctx);return Array.isArray(b)?b.includes(a):String(b).includes(String(a));}
 const method=expr.match(/^(.+?)\.startswith\((['"])(.*?)\2\)$/);if(method)return String(evalExpr(method[1],ctx)).startsWith(method[3]);
 const pipes=[];{let depth=0,quote="";let last=0;for(let i=0;i<expr.length;i++){const ch=expr[i];if(quote){if(ch===quote&&expr[i-1]!=="\\")quote="";continue;}if(ch==="'"||ch==='"'){quote=ch;continue;}if(ch==="("||ch==="[")depth++;else if(ch===")"||ch==="]")depth--;else if(ch==="|"&&depth===0){pipes.push(expr.slice(last,i).trim());last=i+1;}}if(pipes.length){pipes.push(expr.slice(last).trim());let v=evalExpr(pipes.shift(),ctx);for(const f of pipes){const [name,arg]=f.split(":").map(x=>x.trim());if(name==="lower")v=String(v).toLowerCase();else if(name==="upper")v=String(v).toUpperCase();else if(name==="title")v=String(v).replace(/\b\w/g,ch=>ch.toUpperCase());else if(name==="length")v=v==null?0:(typeof v==="string"||Array.isArray(v)?v.length:Object.keys(v).length);else if(name==="first")v=Array.isArray(v)?v[0]:"";else if(name==="default"&&!truthy(v))v=arg?evalExpr(arg,ctx):"";}return v;}}
 if((expr[0]==='"'&&expr.at(-1)==='"')||(expr[0]==="'"&&expr.at(-1)==="'"))return expr.slice(1,-1);
 if(/^-?\d+(\.\d+)?$/.test(expr))return Number(expr);
 const path=expr.match(/^([a-zA-Z_$][\w$]*)([\s\S]*)$/);if(!path)return "";
 let v=ctx[path[1]];let rest=path[2];
 const indexer=/^(\.[a-zA-Z_$][\w$]*|\[(?:\d+|:\d*)\])/.exec(rest);
 while(indexer){const part=indexer[0];rest=rest.slice(part.length);if(part[0]===".")v=v==null?"":v[part.slice(1)];else if(part[1]===":")v=Array.isArray(v)?v.slice(0,Number(part.slice(2,-1))||undefined):"";else v=v==null?"":v[Number(part.slice(1,-1))];const next=/^(\.[a-zA-Z_$][\w$]*|\[(?:\d+|:\d*)\])/.exec(rest);if(!next)break;indexer[0]=next[0];}
 return v==null?"":v;
}
function tokenize(template){const parts=[];const re=/({{[\s\S]*?}}|{%[\s\S]*?%})/g;let last=0,m;while((m=re.exec(template))){if(m.index>last)parts.push({type:"text",value:template.slice(last,m.index)});const token=m[0];parts.push({type:token.startsWith("{{")?"var":"tag",value:token.slice(2,-2).trim()});last=re.lastIndex;}if(last<template.length)parts.push({type:"text",value:template.slice(last)});return parts;}
function renderNodes(tokens,ctx,pos,stops) {
 let out="";
 while(pos.i<tokens.length){
  const t=tokens[pos.i++];
  if(t.type==="tag"){
   const cmd=t.value.split(/\s+/,1)[0];
   if(stops&&stops.has(cmd)){pos.i--;return {out,stop:t.value};}
   if(cmd==="if"){
    const branches=[];let condition=t.value.slice(2).trim();let selected="";
    while(true){
     const part=renderNodes(tokens,ctx,pos,new Set(["elif","else","endif"]));
     branches.push({condition,html:part.out});
     const stop=part.stop||"";
     if(stop.startsWith("elif")){const tok=tokens[pos.i++];condition=tok.value.slice(4).trim();continue;}
     if(stop.startsWith("else")){pos.i++;const otherwise=renderNodes(tokens,ctx,pos,new Set(["endif"]));branches.push({condition:"__else__",html:otherwise.out});if(tokens[pos.i]&&tokens[pos.i].type==="tag"&&tokens[pos.i].value.startsWith("endif"))pos.i++;break;}
     if(stop.startsWith("endif")){pos.i++;break;}
     break;
    }
    const hit=branches.find(b=>b.condition==="__else__"||truthy(evalExpr(b.condition,ctx)));
    out+=hit?hit.html:"";
   } else if(cmd==="for"){
    const m=t.value.match(/^for\s+(\w+)\s+in\s+([\s\S]+)$/);if(!m)continue;
    const bodyStart=pos.i;let depth=1,end=bodyStart;
    for(;end<tokens.length;end++){if(tokens[end].type!=="tag")continue;const cc=tokens[end].value.split(/\s+/,1)[0];if(cc==="for")depth++;if(cc==="endfor"&&--depth===0)break;}
    const body=tokens.slice(bodyStart,end);
    const items=evalExpr(m[2],ctx);if(Array.isArray(items))items.slice(0,30).forEach((item,index)=>{const loopCtx=Object.assign({},ctx,{[m[1]]:item,loop:{index:index+1,index0:index,first:index===0,last:index===items.length-1}});out+=renderNodes(body,loopCtx,{i:0}).out;});
    pos.i=Math.min(end+1,tokens.length);
   } else if(cmd==="set"){
    const m=t.value.match(/^set\s+(\w+)\s*=\s*([\s\S]+)$/);if(m)ctx[m[1]]=evalExpr(m[2],ctx);
   }
   continue;
  }
  if(t.type==="var"){out+=escapeTemplateValue(evalExpr(t.value,ctx));continue;}
  out+=t.value;
 }
 return {out,stop:""};
}
function renderJinja(template,site,niche) {
 const ctx={site,niche,range:n=>Array.from({length:Math.max(0,Math.min(Number(n)||0,50))},(_,i)=>i)};
 return renderNodes(tokenize(template),ctx,{i:0}).out;
}
function makeUnlockUrl(site) {
 const u=new URL("/make-site.html",location.origin);
 u.searchParams.set("from_preview","1");
 if(site.sitekey)u.searchParams.set("sitekey",site.sitekey);
 if(site.business_name)u.searchParams.set("business",site.business_name);
 if(site.template_key)u.searchParams.set("template",site.template_key);
 return u.toString();
}
function showFailure(message) {
 document.title="Preview unavailable";
 document.body.innerHTML='<main style="min-height:100vh;display:grid;place-items:center;background:#102332;color:white;font-family:Arial;padding:24px"><section style="max-width:620px"><h1>We couldn’t load this preview.</h1><p>'+esc(message)+'</p><a style="color:#ffbf00" href="../preview.html">Back to preview entry</a></section></main>';
}
function addPreviewControls(html,site) {
 const doc=new DOMParser().parseFromString(html,"text/html");
 // Keep original markup and CSS; only add the standard preview strip and modal.
 doc.querySelectorAll(".sh-preview-banner,#shPreviewBanner,.sh-preview-footer").forEach(n=>n.remove());
 const banner=doc.createElement("div");banner.className="steady-preview-strip";
 banner.innerHTML='WEBSITE PREVIEW — interactions are disabled. <strong>Any example details are fake placeholders.</strong> <button type="button" data-open-lock>Unlock this site ↗</button>';
 doc.body.insertBefore(banner,doc.body.firstChild);
 const modal=doc.createElement("div");modal.className="steady-preview-modal";modal.hidden=true;modal.innerHTML='<div class="steady-preview-backdrop" data-close-lock></div><section class="steady-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="steady-preview-title"><button type="button" class="steady-preview-close" data-close-lock aria-label="Close">×</button><p>STEADY HANDS PREVIEW</p><h2 id="steady-preview-title">This is just a preview.</h2><p>Unlock the full site to unlock it. Fill in your business details on the website questionnaire.</p><a class="steady-preview-unlock" href="'+esc(makeUnlockUrl(site))+'">Unlock this site ↗</a><button type="button" class="steady-preview-keep" data-close-lock>Keep Previewing</button></section>';
 doc.body.appendChild(modal);
 const css=doc.createElement("style");css.textContent='.steady-preview-strip{position:sticky;top:0;z-index:999999;background:#102b4c;color:#fff;padding:10px 16px;display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;text-align:center;font:700 13px/1.4 Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.18)}.steady-preview-strip strong{color:#ffbf00}.steady-preview-strip button{background:transparent;color:#fff;border:0;text-decoration:underline;font:800 13px Arial;cursor:pointer}.steady-preview-modal[hidden]{display:none!important}.steady-preview-modal{position:fixed;inset:0;z-index:1000000;display:grid;place-items:center;padding:20px}.steady-preview-backdrop{position:absolute;inset:0;background:rgba(4,14,27,.76);backdrop-filter:blur(7px)}.steady-preview-dialog{position:relative;width:min(480px,100%);background:white;color:#173348;padding:32px;border-radius:16px;box-shadow:0 30px 100px rgba(0,0,0,.4);font-family:Arial,sans-serif}.steady-preview-dialog h2{font-size:clamp(1.8rem,5vw,2.4rem);line-height:1.08;letter-spacing:-.04em;margin:12px 0}.steady-preview-dialog p{color:#5c6c77}.steady-preview-dialog p:first-child{font-size:11px;letter-spacing:.14em;color:#a67b34;font-weight:900}.steady-preview-close{position:absolute;right:12px;top:7px;border:0;background:transparent;font-size:28px;cursor:pointer}.steady-preview-unlock,.steady-preview-keep{display:block;width:100%;text-align:center;padding:13px 16px;border-radius:7px;margin-top:12px;font-weight:800;cursor:pointer}.steady-preview-unlock{background:#102b4c;color:white;text-decoration:none}.steady-preview-keep{background:white;border:1px solid #bdc8ce;color:#173348}.steady-example-placeholder{outline:1px dashed rgba(183,130,44,.8);outline-offset:2px;position:relative}.steady-example-label{display:inline-block;font:800 10px Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;background:#fff4d9;color:#76531e;border:1px dashed #b68630;border-radius:4px;padding:2px 5px;margin:3px}.steady-example-notice{display:block;font:800 10px Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#76531e;margin-top:5px}';
 doc.head.appendChild(css);
 return "<!doctype html>\n"+doc.documentElement.outerHTML;
}
function initLockedPreview(site) {
 const modal=document.querySelector(".steady-preview-modal");
 if(!modal)return;
 const open=()=>{modal.hidden=false;document.body.classList.add("steady-modal-open");};
 const close=()=>{modal.hidden=true;document.body.classList.remove("steady-modal-open");};
 document.addEventListener("click",e=>{
  const t=e.target;if(!(t instanceof Element))return;
  if(t.closest(".steady-preview-unlock"))return;
  if(t.closest("[data-close-lock]")){e.preventDefault();close();return;}
  if(t.closest("[data-open-lock]")){e.preventDefault();open();return;}
  const el=t.closest("a,button,[role=button],input[type=submit],input[type=button]");
  if(el){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();open();}
 },true);
 document.addEventListener("submit",e=>{e.preventDefault();open();},true);
 const st=document.createElement("style");st.textContent=".steady-modal-open{overflow:hidden}";document.head.appendChild(st);
}
async function main(){
 try {
  let data=null;
  if(siteKey)data=await lookup(siteKey);
  if(!data&&siteKey)throw new Error("The site key was not found or is inactive.");
  const requested=(location.pathname.split("/").pop()||"generic.html").replace(/\.html$/i,"");
  const rawCategory=data?data.category||data.template_key:requested;
  const slug=resolveSlug(rawCategory,data&&data.template_key);
  const candidates=[...new Set([slug,requested,resolveSlug(rawCategory), "generic"])];
  let original="", used="";
  for(const candidate of candidates){
   try{const res=await fetch("source-templates/"+encodeURIComponent(candidate)+".html",{cache:"no-store"});if(res.ok){original=await res.text();used=candidate;break;}}catch(_){}
  }
  if(!original)throw new Error("Could not find the original category template. Check Previews/source-templates.");
  const site=profileRecord(data||{category:requested,template_key:requested},used);
  let rendered=renderJinja(original,site,site.category);
  // Remove template's self-referential preview click script and footer, only from this in-memory rendered output.
  // The source-template file in GitHub remains completely untouched.
  rendered=rendered.replace(/<script>\s*\(function\(\)\{\s*document\.documentElement\.classList\.add\('sh-preview-mode'\);[\s\S]*?<\/script>/i,"");
  const finalHtml=addPreviewControls(rendered,site);
  document.open();document.write(finalHtml);document.close();
  initLockedPreview(site);
 } catch(err) { console.error("Preview renderer:",err);showFailure(err&&err.message?err.message:"Unexpected preview error."); }
}
main();
})();