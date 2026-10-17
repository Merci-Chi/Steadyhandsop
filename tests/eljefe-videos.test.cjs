const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync,existsSync}=require('node:fs');
const {resolve}=require('node:path');
const {runInNewContext}=require('node:vm');
const root=resolve(__dirname,'../sites/eljefedejalisco');
const read=p=>readFileSync(resolve(root,p),'utf8');
function setup(){
  const media=(paused=false)=>({paused,ended:false,isConnected:true,muted:false,volume:1,events:{},addEventListener(t,fn){this.events[t]=fn},querySelector(){return null},pause(){this.paused=true},play(){this.paused=false;return Promise.resolve()}});
  const clips=[media(),media(),media(true)];
  const audio=media();
  const frame={contentWindow:{postMessage(){}},addEventListener(){}};
  const doc={hidden:false,querySelectorAll:s=>s==='video.ambient-video'?clips:[...clips,audio],querySelector:()=>frame,addEventListener(){}};
  let handler;
  const win={addEventListener(t,fn){handler=fn}};
  runInNewContext(read('js.js').split('// Silent local clips and exclusive TikTok playback.')[1],{document:doc,window:win});
  const send=(type,value,extra={})=>handler({origin:'https://www.tiktok.com',source:frame.contentWindow,data:{'x-tiktok-player':true,type,value},...extra});
  return {clips,audio,send};
}
test('source and dist keep all local videos silent, TikTok user controlled and non-looping',()=>{
  for(const prefix of ['', 'dist/']){
    const html=read(prefix+'index.html');
    assert.equal((html.match(/<video class="ambient-video" autoplay muted loop playsinline/g)||[]).length,3);
    assert.ok(!html.includes('data-video-sound'));
    assert.match(html,/autoplay=0&amp;loop=0&amp;muted=0/);
    for(const m of html.matchAll(/(?:src|poster)="(assets\/videos\/[^"?]+)"/g))assert.ok(existsSync(resolve(root,prefix,m[1])));
  }
  assert.equal(read('js.js'),read('dist/js.js'));
  assert.equal(read('css.css'),read('dist/css.css'));
  assert.match(read('css.css'),/grid-auto-flow:column/);
});
test('audible TikTok pauses other media and resumes only previously playing media at end',()=>{
  const {clips,audio,send}=setup();
  clips.forEach(v=>{assert.equal(v.muted,true);assert.equal(v.volume,0)});
  send('onStateChange',1,{origin:'https://example.com'});
  send('onStateChange',1,{source:{}});
  assert.equal(clips[0].paused,false);
  send('onStateChange',1);
  assert.ok(clips.every(v=>v.paused)); assert.equal(audio.paused,true);
  send('onStateChange',3); assert.equal(clips[0].paused,true);
  send('onStateChange',0);
  assert.equal(clips[0].paused,false);assert.equal(clips[1].paused,false);
  assert.equal(clips[2].paused,true);assert.equal(audio.paused,false);
});
test('muting, pausing, and replaying TikTok coordinate playback without unmuting clips',()=>{
  const {clips,send}=setup();
  send('onMute',true);send('onStateChange',1);assert.equal(clips[0].paused,false);
  send('onMute',false);assert.equal(clips[0].paused,true);
  send('onVolumeChange',0);assert.equal(clips[0].paused,false);
  send('onVolumeChange',80);assert.equal(clips[0].paused,true);
  send('onStateChange',2);assert.equal(clips[0].paused,false);
  send('onStateChange',1);assert.equal(clips[0].paused,true);
  clips[2].play();clips[2].events.play();assert.equal(clips[2].paused,true);
  clips[0].muted=false;clips[0].volume=1;clips[0].events.volumechange();
  assert.equal(clips[0].muted,true);assert.equal(clips[0].volume,0);
  send('onStateChange',0);assert.equal(clips[2].paused,false);
});
