// Steady Hands booking submissions, project glonbvrcudwuzjundrii.
// Do not deploy publicly without Turnstile verification + server-side rate limiting.
// No email provider is configured here; emailConfirmationQueued always false.
import { createClient } from 'npm:@supabase/supabase-js@2.95.0';
const allowed=new Set(['https://steadyhandsop.com','https://www.steadyhandsop.com']),zone='America/Los_Angeles';
const hdr=(o:string|null):Record<string,string>=>({'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(o&&allowed.has(o)?{'Access-Control-Allow-Origin':o,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'POST,OPTIONS'}:{})});
const reply=(body:unknown,status=200,o:string|null=null)=>new Response(JSON.stringify(body),{status,headers:hdr(o)});
const parts=(t:Date)=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(t).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)])) as Record<string,number>;
function db(){
 const keys=Deno.env.get('SUPABASE_SECRET_KEYS');let secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!secret&&keys){const parsed=JSON.parse(keys);secret=parsed.default || Object.values(parsed)[0] as string;}
 if(!secret)throw new Error('Missing server secret');
 return createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:hdr(origin)});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405,origin);
 if(origin&&!allowed.has(origin))return reply({error:'Origin not allowed'},403,origin);
 try{
  if(Number(req.headers.get('content-length')||0)>10000)return reply({error:'Request too large'},413,origin);
  const payload=await req.json(),person=payload?.customer||{};
  const business=String(person.business||'').trim(),name=String(person.name||'').trim(),email=String(person.email||'').trim().toLowerCase(),phone=String(person.phone||'').trim(),notes=String(person.notes||'').trim(),tz=String(payload?.timezone||'').trim();
  const serviceList=payload?.services,at=new Date(payload?.startTimeUTC);
  if(!Number.isFinite(at.valueOf())||at.getTime()<Date.now()||at.getTime()>Date.now()+121*86400000)return reply({error:'Invalid appointment time'},400,origin);
  const local=parts(at);
  if(!((local.hour>=9&&local.hour<17)||(local.hour===17&&local.minute===0))||![0,30].includes(local.minute)||at.getUTCSeconds()!==0||at.getUTCMilliseconds()!==0)return reply({error:'Outside appointment hours'},400,origin);
  if(!business||business.length>140||!name||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>200||phone.length>35||phone.replace(/\D/g,'').length<10||notes.length>1000||!tz||tz.length>100||!Array.isArray(serviceList)||serviceList.length>40)return reply({error:'Please check the booking details'},400,origin);
  const services=serviceList.map((s:unknown)=>({id:String((s as {id?:string})?.id||'').slice(0,160),title:String((s as {title?:string})?.title||'').slice(0,180)}));
  const {data,error}=await db().from('sh_consultation_bookings').insert({
    start_at:at.toISOString(),end_at:new Date(at.getTime()+1800000).toISOString(),timezone:tz,services,business_name:business,customer_name:name,customer_email:email,customer_phone:phone,customer_notes:notes,status:'submitted'
  }).select('id').single();
  if(error?.code==='23505')return reply({error:'That appointment was just taken. Please choose another time.'},409,origin);
  if(error)throw error;
  return reply({success:true,status:'submitted',requestId:data.id,emailConfirmationQueued:false},200,origin);
 }catch(e){console.error(e);return reply({error:'Could not submit booking'},500,origin);}
});
