/*
 * Hero fabric: the opening photo is drawn on a WebGL canvas so it can move like cloth.
 * It ripples where the pointer or a finger travels, and breathes gently on its own.
 * If WebGL is unavailable, or the visitor prefers reduced motion, the plain photo underneath stays.
 */
(() => {
  const holder = document.querySelector(".hero .zoom");
  if (!holder || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  canvas.className = "fabric";
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return;

  const MAX = 10; // ripples alive at once
  const vert = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}";
  const frag = `precision mediump float;
varying vec2 v;uniform sampler2D img;uniform float t,aspect,imgAspect,focus;uniform vec3 r[${MAX}];
void main(){
  vec2 d=vec2(0.);float lift=0.;
  for(int i=0;i<${MAX};i++){
    float age=t-r[i].z; if(age<0.||age>2.6) continue;
    vec2 q=v-r[i].xy; q.x*=aspect; float dist=length(q)+1e-4;
    float ring=sin(dist*34.-age*9.)*exp(-dist*5.5)*exp(-age*1.7)*smoothstep(0.,.12,age);
    d+=q/dist*ring; lift+=ring;
  }
  // slow folds that are always there, like air moving under the cloth
  float fold=sin(v.x*5.+t*.5)*sin(v.y*4.-t*.37);
  d+=vec2(fold*.5,cos(v.y*6.+t*.4)*.35)*.012;
  vec2 uv=v+d*.028;
  // cover-fit the photo, keeping the same focal point as the CSS fallback
  float k=aspect/imgAspect;
  if(k>1.){uv.y=(uv.y-.5)/k+.5;}else{uv.x=(uv.x-focus)*k+focus;}
  vec3 c=texture2D(img,clamp(uv,0.,1.)).rgb;
  c+=(lift*.16+fold*.012);
  gl_FragColor=vec4(c,1.);
}`;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = sh(gl.VERTEX_SHADER, vert),
    fs = sh(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(prog, n);

  const ripples = new Float32Array(MAX * 3).fill(-99);
  let next = 0,
    lastX = -1,
    lastY = -1,
    running = false,
    visible = true,
    ready = false;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  function drop(clientX, clientY) {
    const b = canvas.getBoundingClientRect();
    const x = (clientX - b.left) / b.width,
      y = (clientY - b.top) / b.height;
    if (x < 0 || x > 1 || y < 0 || y > 1) return;
    // one ripple per ~6% of travel, so a moving pointer leaves a wake rather than a blur
    if (Math.hypot(x - lastX, y - lastY) < 0.06) return;
    lastX = x;
    lastY = y;
    ripples.set([x, y, now()], next * 3);
    next = (next + 1) % MAX;
  }
  const hero = document.querySelector(".hero");
  hero.addEventListener("pointermove", (e) => drop(e.clientX, e.clientY), { passive: true });
  hero.addEventListener("pointerdown", (e) => ((lastX = -1), drop(e.clientX, e.clientY)), { passive: true });
  hero.addEventListener("touchmove", (e) => drop(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    const w = Math.round(holder.clientWidth * dpr),
      h = Math.round(holder.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform1f(U("aspect"), w / h);
  }

  function frame() {
    if (!visible || document.hidden) return void (running = false);
    resize();
    gl.uniform1f(U("t"), now());
    gl.uniform3fv(U("r"), ripples);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  const start = () => {
    if (ready && !running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    start();
  }).observe(hero);
  document.addEventListener("visibilitychange", start);

  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform1f(U("imgAspect"), img.naturalWidth / img.naturalHeight);
    gl.uniform1f(U("focus"), 0.7);
    holder.prepend(canvas);
    ready = true;
    start();
    // an opening ripple from the needle, so the cloth is visibly alive before anyone touches it
    setTimeout(() => (ripples.set([0.66, 0.6, now()], 0), (next = 1)), 900);
    requestAnimationFrame(() => canvas.classList.add("on"));
  };
  // The photo's address comes from the stylesheet, so it stays right on the server and on static hosting
  const m = getComputedStyle(document.documentElement)
    .getPropertyValue("--im22")
    .match(/url\((["']?)(.*?)\1\)/);
  if (m) img.src = new URL(m[2], [...document.styleSheets].find((s) => s.href)?.href || location.href).href;
})();
