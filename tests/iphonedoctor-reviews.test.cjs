const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../sites/iphonedoctor');
const source=fs.readFileSync(path.join(root,'js.js'),'utf8');
function setup(){
 class Element{
  constructor(){this.children=[];this.attributes={};this.events={};this.textContent='';this.scrollTop=0}
  append(...els){this.children.push(...els)}
  replaceChildren(...els){this.children=els}
  setAttribute(k,v){this.attributes[k]=v}
  addEventListener(k,v){this.events[k]=v}
  contains(){return false}
  focus(){this.focused=true}
 }
 const grid=new Element(),carousel=new Element(),modal=new Element();
 const fields=Object.fromEntries(['#popup-author','.popup-review','.popup-label','.popup-stars','.popup-photos','.popup-content','.popup-prev','.popup-next','.popup-close','.popup-counter'].map(s=>[s,new Element()]));
 carousel.querySelector=()=>grid;modal.querySelector=s=>fields[s];
 modal.showModal=()=>modal.open=true;modal.close=()=>modal.open=false;
 const events={};
 const context={innerWidth:1440,matchMedia:()=>({matches:true}),setInterval(){throw new Error('Reviews must not auto-rotate')},
 addEventListener:(k,v)=>events[k]=v,
 document:{hidden:false,body:{style:{}},querySelector:s=>({'.review-carousel-section':carousel,'.review-popup':modal})[s]||null,
 querySelectorAll:()=>[],createElement:()=>new Element()}};
 vm.runInNewContext(source,context);
 return {grid,modal,fields,context,events};
}
test('shows exactly the three supplied full reviews and six accessible photos',()=>{
 const h=setup();
 assert.equal(h.grid.children.length,3);
 const names=h.grid.children.map(card=>card.children.find(el=>['Jennie Peng','Jacob Anderson','Laura Jones'].includes(el.textContent))?.textContent);
 assert.deepEqual(names,['Jennie Peng','Jacob Anderson','Laura Jones']);
 const images=h.grid.children.flatMap(card=>card.children.flatMap(el=>el.children)).filter(el=>el.src?.startsWith('assets/reviews/'));
 assert.equal(images.length,6);
 for(const img of images){assert(img.alt);assert(fs.existsSync(path.join(root,img.src)))}
 const providers=h.grid.children.map(card=>card.children[0]);
 for(const provider of providers){assert.equal(provider.className,'review-provider');assert.equal(provider.children[0].alt,'Google');assert(fs.existsSync(path.join(root,provider.children[0].src)))}
});
test('review viewer exposes complete text, matching photos and clears photos for Laura',()=>{
 const h=setup();
 h.grid.children[0].events.click();
 assert.equal(h.modal.open,true);
 assert.equal(h.modal.focused,true);
 assert.equal(h.fields['.popup-prev'].disabled,true);
 assert.equal(h.fields['.popup-counter'].textContent,'1 of 3');
 assert(h.fields['.popup-review'].textContent.includes('ABSOLUTELY RECOMMEND!'));
 assert(h.fields['.popup-review'].textContent.endsWith('The boss is really nice and patient!”'));
 assert.equal(h.fields['.popup-label'].textContent,'Google review');
 assert.equal(h.fields['.popup-photos'].children[0].children.length,2);
 h.fields['.popup-next'].events.click();
 assert.equal(h.fields['#popup-author'].textContent,'Jacob Anderson');
 assert(h.fields['.popup-review'].textContent.includes('I will return.'));
 assert.equal(h.fields['.popup-photos'].children[0].children.length,4);
 const link=h.fields['.popup-photos'].children[0].children[0];
 assert.equal(link.target,'_blank');assert.equal(link.rel,'noopener noreferrer');
 h.fields['.popup-next'].events.click();
 assert.equal(h.fields['#popup-author'].textContent,'Laura Jones');
 assert(h.fields['.popup-review'].textContent.includes("didn't charge a crazy diagnostic fee."));
 assert(h.fields['.popup-review'].textContent.endsWith('We will definitely use for all electronic repairs.”'));
 assert.equal(h.fields['.popup-photos'].children[0].children.length,0);
 assert.equal(h.fields['.popup-next'].disabled,true);
 assert.equal(h.fields['.popup-counter'].textContent,'3 of 3');
 h.fields['.popup-next'].events.click();assert.equal(h.fields['#popup-author'].textContent,'Laura Jones');
});
test('review navigation never wraps and all three cards stay present',()=>{
 const h=setup();
 h.grid.children[0].events.click();
 h.fields['.popup-prev'].events.click();assert.equal(h.fields['#popup-author'].textContent,'Jennie Peng');
 const key=key=>h.modal.events.keydown({key,preventDefault(){}});
 key('ArrowLeft');assert.equal(h.fields['#popup-author'].textContent,'Jennie Peng');
 key('ArrowRight');key('ArrowRight');key('ArrowRight');
 assert.equal(h.fields['#popup-author'].textContent,'Laura Jones');
 key('ArrowLeft');assert.equal(h.fields['#popup-author'].textContent,'Jacob Anderson');
 assert.equal(h.fields['.popup-prev'].disabled,false);assert.equal(h.fields['.popup-next'].disabled,false);
 assert.equal(h.grid.children.length,3);
 assert.equal(h.events.resize,undefined);
});
