// Steady Hands live availability. Deploy in project glonbvrcudwuzjundrii.
// Public endpoint: configure rate limits before launch.
import { createClient } from 'npm:@supabase/supabase-js@2.95.0';
const allowed=new Set(['https://steadyhandsop.com','https://www.steadyhandsop.com']);
const zone='America/Los_Angeles';
const hdr=(o:string|null):Record<string,string>=>({'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin',...(o&&allowed.has(o)?{'Access-Control-Allow-Origin':o,'Access-Control-Allow-Headers':'content-type,authorization,apikey','Access-Control-Allow-Methods':'GET,OPTIONS'}:{})});
const reply=(body:unknown,status=200,o:string|null=null)=>new Response(JSON.stringify(body),{status,headers:hdr(o)});
const parts=(ms:number)=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms)).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)])) as Record<string,number>;
function localToUTC(day:string,h:number,m:number):string{
 const [y,mo,d]=day.split('-').map(Number),wanted=Date.UTC(y,mo-1,d,h,m);let guess=wanted;
 for(let i=0;i<4;i++){const p=parts(guess);guess+=wanted-Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);}
 return new Date(guess).toISOString();
}
function db(){
 const keys=Deno.env.get('SUPABASE_SECRET_KEYS');let secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!secret&&keys){const parsed=JSON.parse(keys);secret=parsed.default || Object.values(parsed)[0] as string;}
 if(!secret)throw new Error('Missing server secret');
 return createClient(Deno.env.get('SUPABASE_URL')!,secret,{auth:{persistSession:false,autoRefreshToken:false}});
}
Deno.serve(async req=>{
 const origin=req.headers.get('origin');
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:hdr(origin)});
 if(req.method!=='GET')return reply({error:'Method not allowed'},405,origin);
 if(origin&&!allowed.has(origin))return reply({error:'Origin not allowed'},403,origin);
 try{
  const day=new URL(req.url).searchParams.get('date')||'';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||Number.isNaN(Date.parse(day+'T12:00:00Z')))return reply({error:'Invalid date'},400,origin);
  const p=parts(Date.now()),today=`${p.year}-${String(p.month).padStart(2,'0')}-${String(p.day).padStart(2,'0')}`;
  const diff=(Date.parse(day+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000;
  if(diff<0||diff>120)return reply({available:[]},200,origin);
  const next=new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
  const {data,error}=await db().from('sh_consultation_bookings').select('start_at').in('status',['submitted','confirmed']).gte('start_at',localToUTC(day,0,0)).lt('start_at',localToUTC(next,0,0));
  if(error)throw error;
  const busy=new Set((data||[]).map(x=>new Date(x.start_at).toISOString()));const available:string[]=[];
  for(let hour=9;hour<=17;hour++)for(const minute of [0,30]){
   if(hour===17&&minute!==0)continue;
   const instant=localToUTC(day,hour,minute);
   if(Date.parse(instant)>Date.now()&&!busy.has(instant))available.push(instant);
  }
  return reply({available},200,origin);
 }catch(e){console.error(e);return reply({error:'Unable to load availability'},500,origin);}
});
