/* Pointer-reactive liquid gradient. Native WebGL, no external scripts or demo UI. */
(function () {
  'use strict';
  const host = document.querySelector('.liquid-background');
  if (!host) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) { canvas.remove(); return; } // The CSS gradient is the fallback.
  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;
  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uPointer;
    uniform float uEnergy;
    uniform float uScroll;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i=floor(p), f=fract(p);
      vec2 u=f*f*(3.0-2.0*f);
      return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
    }
    void main() {
      float t=uTime*0.16+uScroll*0.65;
      vec2 uv=vUv;
      float aspect=uResolution.x/max(uResolution.y,1.0);
      vec2 pointerDelta=uv-uPointer;
      pointerDelta.x*=aspect;
      float distanceToPointer=length(pointerDelta);
      float wake=exp(-distanceToPointer*4.2)*uEnergy;
      float ripple=sin(distanceToPointer*24.0-uTime*1.7)*wake*0.035;
      uv+=normalize(pointerDelta+vec2(0.0001))*(ripple+wake*0.025);
      vec2 field=vec2(noise(uv*2.7+vec2(t,-t*0.6)),noise(uv*2.7+vec2(-t*0.45,t+3.7)));
      vec2 q=uv+(field-0.5)*0.56;
      q+=vec2(sin(q.y*4.0+t*1.3),cos(q.x*4.0-t))*0.075;
      vec3 purple=vec3(0.43,0.06,0.78);
      vec3 pink=vec3(0.95,0.10,0.56);
      vec3 orchid=vec3(0.70,0.22,0.92);
      vec3 plum=vec3(0.16,0.025,0.28);
      vec3 color=vec3(0.018,0.006,0.04);
      float weight=0.0;
      for(int i=0;i<6;i++) {
        float f=float(i);
        vec2 center=vec2(0.5+sin(t*(0.5+f*0.07)+f*1.8)*0.52,0.5+cos(t*(0.6+f*0.05)+f*2.3)*0.5);
        vec2 delta=q-center;delta.x*=mix(1.0,aspect,0.35);
        float influence=exp(-dot(delta,delta)*(3.2+sin(t+f)*0.5));
        vec3 tone=mix(purple,pink,0.5+0.5*sin(f*2.4+0.7));
        tone=mix(tone,orchid,0.2+0.15*sin(t*0.5+f));
        color+=tone*influence*(0.75+0.22*sin(t+f));
        weight+=influence;
      }
      color/=max(weight,0.8);
      float flow=noise(q*3.2+vec2(t*0.4,-t*0.3));
      float ribbon=0.5+0.5*sin(q.x*7.0-q.y*5.0+field.x*6.0+t*0.8);
      color=mix(plum*0.35,color,smoothstep(0.08,0.85,ribbon));
      float pinkFlow=smoothstep(0.42,0.80,noise(q*4.0+field*1.6+vec2(t*0.5,0.0)));
      color=mix(color,pink,pinkFlow*0.45);
      color*=0.85+flow*0.35;
      color+=vec3(0.12,0.015,0.08)*wake;
      float vignette=1.0-smoothstep(0.2,0.95,length(vUv-0.5));
      color*=0.70+vignette*0.30;
      color+=(hash(mod(gl_FragCoord.xy,64.0))-0.5)*0.014;
      gl_FragColor=vec4(clamp(color,0.0,1.0),1.0);
    }
  `;
  function compile(type, source) {
    const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource), fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) { canvas.remove(); return; }
  const program = gl.createProgram(); gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.remove(); return; }
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,3,-1,-1,3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const timeUniform=gl.getUniformLocation(program,'uTime'), resolutionUniform=gl.getUniformLocation(program,'uResolution');
  const pointerUniform=gl.getUniformLocation(program,'uPointer'), energyUniform=gl.getUniformLocation(program,'uEnergy'),scrollUniform=gl.getUniformLocation(program,'uScroll');
  let scrollProgress=0;
  function readScroll(){const height=document.documentElement.scrollHeight-window.innerHeight;scrollProgress=height>0?Math.min(1,window.scrollY/height):0;}
  window.addEventListener('scroll',readScroll,{passive:true});readScroll();
  let pointerX=0.5,pointerY=0.5,targetX=0.5,targetY=0.5,energy=0,time=8,lastTime=0,frame=null,lastDraw=0,lost=false;
  function resize() {
    // Cap total fill rate and pixel ratio; the liquid texture does not need retina resolution.
    const scale=Math.min(1,1200/window.innerWidth,900/window.innerHeight);
    canvas.width=Math.max(1,Math.round(window.innerWidth*scale));
    canvas.height=Math.max(1,Math.round(window.innerHeight*scale));
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform2f(resolutionUniform,canvas.width,canvas.height);
    if (reduced.matches) draw(performance.now());
  }
  function draw(now) {
    const dt=lastTime ? Math.min((now-lastTime)/1000,0.1) : 0; lastTime=now;
    if (!reduced.matches) time+=dt;
    energy*=Math.exp(-dt*1.4);
    const smooth=1-Math.exp(-dt*7);
    pointerX+=(targetX-pointerX)*smooth;pointerY+=(targetY-pointerY)*smooth;
    gl.uniform1f(timeUniform,time);gl.uniform2f(pointerUniform,pointerX,pointerY);
    gl.uniform1f(energyUniform,reduced.matches?0:energy);gl.uniform1f(scrollUniform,reduced.matches?0:scrollProgress);gl.drawArrays(gl.TRIANGLES,0,3);
  }
  function tick(now) {
    frame=null;
    if (lost || document.hidden || reduced.matches) return;
    if (now-lastDraw>=1000/30) { draw(now);lastDraw=now; }
    frame=requestAnimationFrame(tick);
  }
  function syncAnimation() {
    if (frame) cancelAnimationFrame(frame);frame=null;lastTime=0;
    if (lost || document.hidden) return;
    if (reduced.matches) { energy=0;draw(performance.now()); }
    else frame=requestAnimationFrame(tick);
  }
  window.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    const x=event.clientX/window.innerWidth,y=1-event.clientY/window.innerHeight;
    const speed=Math.hypot(x-targetX,y-targetY);
    targetX=x;targetY=y;energy=Math.min(1,energy+speed*3.5+0.015);
  },{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',syncAnimation);
  if (reduced.addEventListener) reduced.addEventListener('change',syncAnimation);
  canvas.addEventListener('webglcontextlost',event => { event.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);frame=null;canvas.style.visibility='hidden'; });
  canvas.addEventListener('webglcontextrestored',() => { /* Continue with the static CSS fallback after a GPU reset. */ });
  resize();draw(performance.now());syncAnimation();
})();
