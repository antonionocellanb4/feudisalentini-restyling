/* HOME MODERNA, hero: la foto come un liquido (three.js, un solo shader). Dove passa il mouse o il dito l'immagine si gonfia e si separa
   nei tre colori, in proporzione alla velocità del gesto; a riposo respira appena; scorrendo si avvicina e si scurisce.
   Senza WebGL o con reduced motion resta la foto (l'img sotto il canvas). Si ferma quando l'hero non si vede. */
import * as THREE from 'three';

const sec = document.querySelector('.m-hero'), cv = sec?.querySelector('.m-hero__gl'), img = sec?.querySelector('.m-hero__img');
let renderer = null;
if (sec && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
}

if (renderer) {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const U = {
    uTex: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uImg: { value: new THREE.Vector2(1920, 1280) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uVel: { value: 0 }, uTime: { value: 0 }, uIn: { value: 0 }, uScroll: { value: 0 }
  };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }',
    fragmentShader: `
      precision highp float;
      uniform sampler2D uTex; uniform vec2 uRes, uImg, uMouse; uniform float uVel, uTime, uIn, uScroll;
      varying vec2 vUv;
      void main(){
        vec2 uv = vUv;
        float ar = uRes.x / uRes.y;
        vec2 d = uv - uMouse; d.x *= ar;
        float dist = length(d);
        float f = exp(-dist * dist * 14.) * uVel;                                   // campana attorno al puntatore
        uv -= d * f * .45 * vec2(1. / ar, 1.);                                       // la foto si gonfia come una goccia, liscia anche al centro
        uv += vec2(sin(uv.y * 7. + uTime * .5), cos(uv.x * 6. + uTime * .4)) * .0022; // respiro a riposo
        uv = (uv - .5) / (1. + .16 * (1. - uIn) + .1 * uScroll) + .5;               // entra da vicino, scorrendo si avvicina
        float ri = uImg.x / uImg.y;
        vec2 s = ar > ri ? vec2(1., ri / ar) : vec2(ar / ri, 1.);                   // come object-fit: cover
        vec2 c = (uv - .5) * s + .5;
        float sh = f * .014 + .0015 * uScroll;
        vec3 col = vec3(texture2D(uTex, c + vec2(sh, 0.)).r, texture2D(uTex, c).g, texture2D(uTex, c - vec2(sh, 0.)).b);
        col *= mix(.2, 1., uIn) * (1. - .4 * uScroll);
        gl_FragColor = vec4(col, 1.);
      }`
  })));

  const size = () => { const w = sec.clientWidth, h = sec.clientHeight; renderer.setSize(w, h, false); U.uRes.value.set(w, h); };
  size(); addEventListener('resize', size);

  // puntatore: posizione inseguita con ritardo, velocità che sale col gesto e si spegne da sola
  const target = new THREE.Vector2(0.5, 0.5);
  let speed = 0, last = null;
  sec.addEventListener('pointermove', (e) => {
    const r = sec.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = 1 - (e.clientY - r.top) / r.height;
    if (last) speed = Math.min(1, speed + Math.hypot(x - last[0], y - last[1]) * 6);
    last = [x, y]; target.set(x, y);
  });
  sec.addEventListener('pointerleave', () => (last = null));

  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(sec);
  const t0 = performance.now();
  const frame = () => {
    requestAnimationFrame(frame);
    if (!visible || !U.uTex.value) return;
    U.uTime.value = (performance.now() - t0) / 1000;
    U.uMouse.value.lerp(target, 0.12);
    speed *= 0.94; U.uVel.value += (speed - U.uVel.value) * 0.15;
    U.uScroll.value = Math.min(1, scrollY / innerHeight);
    renderer.render(scene, cam);
  };

  new THREE.TextureLoader().load(img.currentSrc || img.src, (t) => {
    t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
    U.uTex.value = t; U.uImg.value.set(t.image.width, t.image.height);
    renderer.render(scene, cam);
    sec.classList.add('is-gl');
    window.gsap ? gsap.to(U.uIn, { value: 1, duration: 2.4, ease: 'expo.out' }) : (U.uIn.value = 1);
    frame();
  });
}
