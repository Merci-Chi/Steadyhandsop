const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../sites/iphonedoctor/js.js'),'utf8');

function setup({withHeader=true}={}){
 const events={},frames=[],observers=[];
 const element=()=>({setAttribute(){},addEventListener(name,fn){this['on'+name]=fn}});
 const bounds={top:200,bottom:1000,height:800},headerBounds={bottom:200,height:200};
 const video=Object.assign(element(),{muted:true,volume:1,paused:false,getBoundingClientRect:()=>bounds,play:async()=>{},pause(){this.paused=true}});
 const sound=element(),play=element(),header={getBoundingClientRect:()=>headerBounds};
 const document={hidden:false,documentElement:{style:{setProperty(){}}},addEventListener:(name,fn)=>events[name]=fn,
 querySelector:s=>({'#hero-video':video,'#sound-toggle':sound,'#play-toggle':play,'.site-header':withHeader?header:null})[s]||null};
 const context={document,innerHeight:1000,matchMedia:()=>({matches:false}),
 addEventListener:(name,fn)=>events[name]=fn,requestAnimationFrame:fn=>(frames.push(fn),frames.length),
 ResizeObserver:class{constructor(fn){observers.push(fn)}observe(){}}};
 vm.runInNewContext(source,context);
 const flush=()=>{while(frames.length)frames.shift()()};
 const move=(top,bottom,height=800)=>{Object.assign(bounds,{top,bottom,height});events.scroll();flush();return video.volume};
 return {video,sound,document,context,events,observers,headerBounds,flush,move};
}

test('audio fades as the hero leaves view and is silent behind the sticky header',()=>{
 const h=setup();
 assert.equal(h.video.volume,1);
 assert.equal(h.move(-200,600),.5);
 assert(h.move(-400,400)<.5);
 assert.equal(h.move(-600,200),0);
 assert.equal(h.move(-1600,-800),0);
 assert.equal(h.move(200,1000),1);
});

test('scrolling preserves sound on and manual mute preferences',async()=>{
 const h=setup();
 await h.sound.onclick();
 assert.equal(h.video.muted,false);
 h.move(-600,200);assert.equal(h.video.volume,0);assert.equal(h.video.muted,false);
 h.move(200,1000);assert.equal(h.video.volume,1);assert.equal(h.video.muted,false);
 await h.sound.onclick();
 h.move(-600,200);h.move(200,1000);
 assert.equal(h.video.muted,true);
});

test('visibility and layout changes recalculate the fade',()=>{
 const h=setup();
 h.document.hidden=true;h.events.visibilitychange();h.flush();assert.equal(h.video.volume,0);
 h.document.hidden=false;h.events.visibilitychange();h.flush();assert.equal(h.video.volume,1);
 h.move(-200,600);h.headerBounds.bottom=600;h.observers.forEach(fn=>fn());h.flush();assert.equal(h.video.volume,0);
 h.headerBounds.bottom=200;h.events.pageshow();h.flush();assert.equal(h.video.volume,.5);
 h.context.innerHeight=600;h.events.resize();h.flush();assert.equal(h.video.volume,1);
});

test('handles smaller videos, absent headers and zero-sized layouts',()=>{
 const h=setup({withHeader:false});
 assert.equal(h.move(200,600,400),1);
 assert.equal(h.move(-200,200,400),.5);
 assert.equal(h.move(-400,0,400),0);
 assert.equal(h.move(0,0,0),0);
});
