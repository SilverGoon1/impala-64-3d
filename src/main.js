import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { makeMaterials, buildCar, buildEngine } from './car.js';
import { SYSTEMS, CONNECTIONS, EXPLODE, PAINTS, ENGINES, SOURCES, APPROX, DIM } from './data.js';
import './style.css';

const params = new URLSearchParams(location.search);
const $ = (s) => document.querySelector(s);
const ORDER = ['body', 'chassis', 'engine', 'suspension', 'interior', 'top'];

// ---------- renderer / scene ----------
const canvasWrap = $('#viewport');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: params.has('shot') });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
canvasWrap.appendChild(renderer.domElement);
const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'labels';
canvasWrap.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 200);
const HOME = { pos: new THREE.Vector3(6.2, 2.5, 6.0), target: new THREE.Vector3(0, 0.75, 0) };
if (innerWidth / innerHeight < 0.8) HOME.pos.sub(HOME.target).multiplyScalar(1.45).add(HOME.target);
camera.position.copy(HOME.pos);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME.target);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.minDistance = 2.2; controls.maxDistance = 22; controls.maxPolarAngle = Math.PI * 0.495;
controls.autoRotateSpeed = 0.8;

const sun = new THREE.DirectionalLight('#fff6e8', 2.4);
sun.position.set(5, 9, 4); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun);
scene.add(new THREE.HemisphereLight('#cfe3ff', '#2a2420', 0.5));
const rim = new THREE.DirectionalLight('#9cc7ff', 0.9); rim.position.set(-6, 4, -5); scene.add(rim);

const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 96), new THREE.MeshStandardMaterial({ color: '#0b0c10', roughness: 0.75, metalness: 0.0, envMapIntensity: 0.2 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 3.62, 128), new THREE.MeshBasicMaterial({ color: '#3a4250' }));
ring.rotation.x = -Math.PI / 2; ring.position.y = 0.002; scene.add(ring);

// ---------- car ----------
const M = makeMaterials(1);
const built = buildCar(M);
const holders = {}; const sysState = {};
const carRoot = new THREE.Group(); scene.add(carRoot);

function localizeMaterials(group, key) {
  const cache = new Map();
  group.traverse((o) => {
    if (!o.isMesh) return;
    o.userData.system = key;
    const src = o.material;
    if (!cache.has(src)) {
      const c = src.clone();
      c.userData.baseOpacity = src.opacity; c.userData.baseTransparent = src.transparent;
      c.userData.baseEmissive = c.emissive ? c.emissive.clone() : null; c.userData.baseEI = c.emissiveIntensity ?? 0;
      c.userData.isPaint = src === M.paint;
      cache.set(src, c);
    }
    o.material = cache.get(src);
  });
  return [...cache.values()];
}
for (const key of ORDER) {
  const h = new THREE.Group(); h.name = key; h.add(built[key]); carRoot.add(h);
  holders[key] = h;
  sysState[key] = { mats: localizeMaterials(built[key], key), extract: 0, extractTarget: 0, opacity: 1, glow: 0 };
}

// tonneau shown when top is folded
const tonneau = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 1.3, 6, 16), new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.85 }));
tonneau.rotation.x = Math.PI / 2; tonneau.position.set(-1.12, 0.93, 0); tonneau.scale.set(1.4, 1, 0.55); tonneau.castShadow = true; tonneau.visible = false;
built.top.add(tonneau); tonneau.userData.system = 'top';
sysState.top.mats.push(...localizeMaterials(tonneau, 'top'));

// ---------- connections ----------
const connGroup = new THREE.Group(); scene.add(connGroup);
const markerGeo = new THREE.SphereGeometry(0.022, 16, 12);
const connObjs = CONNECTIONS.map((c, i) => {
  const ma = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: SYSTEMS[c.a].color, depthTest: false, transparent: true }));
  const mb = new THREE.Mesh(markerGeo, new THREE.MeshBasicMaterial({ color: SYSTEMS[c.b].color, depthTest: false, transparent: true }));
  ma.position.fromArray(c.p); mb.position.fromArray(c.p2); ma.renderOrder = mb.renderOrder = 10;
  holders[c.a].add(ma); holders[c.b].add(mb);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
  const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: '#ffffff', dashSize: 0.06, gapSize: 0.035, depthTest: false, transparent: true, opacity: 0.85 }));
  line.renderOrder = 9; line.frustumCulled = false; connGroup.add(line);
  const div = document.createElement('div'); div.className = 'conn-label'; div.title = c.name;
  const label = new CSS2DObject(div); label.center.set(0.5, 1.3); ma.add(label); label.visible = false;
  return { c, ma, mb, line, label, i };
});

// ---------- state ----------
const state = {
  explode: 0, explodeTarget: 0, selected: null, isolate: false, showConn: true, xray: false,
  topDown: 0, topDownTarget: 0, hover: null, paint: PAINTS[2], engine: ENGINES[3],
};

// ---------- UI ----------
function buildUI() {
  const list = $('#system-list');
  for (const key of ORDER) {
    const s = SYSTEMS[key];
    const b = document.createElement('button'); b.className = 'sys-btn'; b.dataset.key = key;
    b.innerHTML = `<span class="dot" style="background:${s.color}"></span><span class="sys-name">${s.name}</span><span class="sys-count">${CONNECTIONS.filter(c => c.a === key || c.b === key).length} links</span>`;
    b.onclick = () => select(state.selected === key ? null : key);
    list.appendChild(b);
  }
  const sw = $('#paint-swatches');
  for (const p of PAINTS) {
    const b = document.createElement('button'); b.className = 'swatch'; b.title = `${p.name} (${p.code})`; b.style.background = p.hex;
    b.onclick = () => setPaint(p); b.dataset.code = p.code; sw.appendChild(b);
  }
  const es = $('#engine-select');
  for (const e of ENGINES) { const o = document.createElement('option'); o.value = e.id; o.textContent = `${e.name} – ${e.hp.split(' ')[0]} hp`; es.appendChild(o); }
  es.value = state.engine.id; es.onchange = () => setEngine(ENGINES.find(e => e.id === es.value));

  $('#explode').oninput = (e) => { state.explodeTarget = +e.target.value; $('#explode-val').textContent = Math.round(state.explodeTarget * 100) + '%'; };
  $('#t-conn').onchange = (e) => { state.showConn = e.target.checked; };
  $('#t-xray').onchange = (e) => { state.xray = e.target.checked; };
  $('#t-isolate').onchange = (e) => { state.isolate = e.target.checked; };
  $('#t-top').onchange = (e) => { state.topDownTarget = e.target.checked ? 0 : 1; };
  $('#t-rotate').onchange = (e) => { controls.autoRotate = e.target.checked; };
  $('#btn-reset').onclick = resetView;
  $('#btn-sources').onclick = () => $('#sources').showModal();
  $('#close-sources').onclick = () => $('#sources').close();
  $('#btn-panel').onclick = () => document.body.classList.toggle('panel-open');

  $('#source-list').innerHTML = SOURCES.map(s => `<li><span class="src-id">[${s.id}]</span> <a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`).join('');
  $('#approx-list').innerHTML = APPROX.map(a => `<li>${a}</li>`).join('');
  $('#dims').innerHTML = [
    ['Wheelbase', '119.0 in'], ['Length', '209.9 in'], ['Width', '78.1 in'], ['Height', '55.8 in'], ['Track F/R', '60.3 / 59.3 in'],
  ].map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('');
}

function srcTags(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean).map(id => `<a class="tag" href="${(SOURCES.find(z => z.id === id) || {}).url || '#'}" target="_blank" rel="noopener">${id}</a>`).join('') : ''; }

function renderInfo() {
  const key = state.selected; const info = $('#info');
  document.querySelectorAll('.sys-btn').forEach(b => b.classList.toggle('active', b.dataset.key === key));
  if (!key) { info.classList.remove('open'); document.body.classList.remove('has-info'); return; }
  document.body.classList.add('has-info');
  const s = SYSTEMS[key];
  let specs = s.specs.map(r => r.slice());
  if (key === 'engine') {
    const e = state.engine;
    specs[0] = ['Selected engine', e.name, e.src];
    specs = specs.filter(r => r[0] !== 'Transmissions');
    specs.splice(1, 0, ['Gross hp @ rpm', e.hp, e.src], ['Torque lb-ft @ rpm', e.tq, e.src], ['Bore × stroke', e.bs, e.src], ['Compression', e.cr, e.src], ['Induction', e.carb, e.src], ['Transmission pairing', e.trans, 'hemmings, hemmings2']);
  }
  const conns = CONNECTIONS.filter(c => c.a === key || c.b === key);
  const byOther = {};
  for (const c of conns) { const o = c.a === key ? c.b : c.a; (byOther[o] ||= new Set()).add(c.name); }
  info.innerHTML = `
    <div class="info-head" style="--c:${s.color}">
      <span class="dot big" style="background:${s.color}"></span>
      <div><h2>${s.name}</h2><small>${conns.length} connection points · ${Object.keys(byOther).length} linked systems</small></div>
      <button id="close-info" class="icon" aria-label="Close">✕</button>
    </div>
    <p class="blurb">${s.blurb}</p>
    <h3>Specifications</h3>
    <table class="specs">${specs.map(([k, v, src]) => `<tr><th>${k}</th><td>${v} ${srcTags(src)}</td></tr>`).join('')}</table>
    <h3>Connects to</h3>
    <div class="links">${Object.entries(byOther).map(([o, names]) => `
      <button class="link-card" data-key="${o}" style="--c:${SYSTEMS[o].color}">
        <span class="lc-title"><span class="dot" style="background:${SYSTEMS[o].color}"></span>${SYSTEMS[o].name}</span>
        <ul class="numbered">${[...names].map(n => `<li><span class="num">${state.connNames.indexOf(n) + 1}</span>${n}</li>`).join('')}</ul>
      </button>`).join('')}</div>
    <h3>Concept notes <span class="muted">— change this, and…</span></h3>
    <ul class="concept">${s.concept.map(c => `<li>${c}</li>`).join('')}</ul>`;
  info.classList.add('open');
  $('#close-info').onclick = () => select(null);
  info.querySelectorAll('.link-card').forEach(b => b.onclick = () => select(b.dataset.key));
}

function select(key) {
  state.selected = key;
  for (const k of ORDER) sysState[k].extractTarget = k === key ? 1 : 0;
  const names = [];
  for (const o of connObjs) {
    const rel = !!key && (o.c.a === key || o.c.b === key);
    o.label.visible = false;
    if (rel) { let n = names.indexOf(o.c.name); if (n < 0) { names.push(o.c.name); n = names.length - 1; } o.label.element.textContent = n + 1; o.label.element.style.borderColor = SYSTEMS[o.c.a === key ? o.c.b : o.c.a].color; o.label.visible = true; }
  }
  state.connNames = names;
  renderInfo();
  resize();
}
function setPaint(p) {
  state.paint = p;
  for (const k of ORDER) for (const m of sysState[k].mats) if (m.userData.isPaint) { m.color.set(p.hex); m.metalness = p.metal; }
  document.querySelectorAll('.swatch').forEach(b => b.classList.toggle('active', b.dataset.code === p.code));
  $('#paint-name').textContent = `${p.name} · code ${p.code}`;
}
function setEngine(e) {
  state.engine = e;
  const old = built.engine; const h = holders.engine;
  h.remove(old); old.traverse(o => o.geometry && o.geometry.dispose());
  const ng = buildEngine(M, e.type, !!e.dual); built.engine = ng; h.add(ng);
  sysState.engine.mats = localizeMaterials(ng, 'engine');
  if (state.selected === 'engine') renderInfo();
}
function resetView() { tween = { t: 0, fromP: camera.position.clone(), fromT: controls.target.clone(), toP: HOME.pos.clone(), toT: HOME.target.clone() }; }
let tween = null;
let baseZoom = 1;

// ---------- picking ----------
const ray = new THREE.Raycaster(); const ptr = new THREE.Vector2(); let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const k = pick(e); select(k && k !== state.selected ? k : (k ? k : null));
});
renderer.domElement.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') { state.hover = pick(e); if (state.hover) renderer.domElement.title = SYSTEMS[state.hover].name; else renderer.domElement.title = ''; renderer.domElement.style.cursor = state.hover ? 'pointer' : 'grab'; } });
function pick(e) {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const objs = []; for (const k of ORDER) if (holders[k].visible) holders[k].traverse(o => { if (o.isMesh && o.userData.system && o.material.opacity > 0.2) objs.push(o); });
  const hit = ray.intersectObjects(objs, false)[0];
  return hit ? hit.object.userData.system : null;
}

// ---------- resize ----------
function resize() {
  const w = canvasWrap.clientWidth, h = canvasWrap.clientHeight;
  renderer.setSize(w, h); labelRenderer.setSize(w, h);
  camera.aspect = w / h;
  const portrait = w / h < 0.8;
  camera.fov = portrait ? 42 : 32;
  baseZoom = portrait ? 0.8 : 1;
  // on phones, shift the car into the visible area above the info sheet
  if (portrait && document.body.classList.contains('has-info')) camera.setViewOffset(w, h, 0, h * 0.2, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

// ---------- loop ----------
const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); const t = clock.elapsedTime;
  const k = 1 - Math.exp(-dt * 6);
  state.explode += (state.explodeTarget - state.explode) * k;
  state.topDown += (state.topDownTarget - state.topDown) * (1 - Math.exp(-dt * 3));

  for (const key of ORDER) {
    const s = sysState[key]; const h = holders[key];
    s.extract += (s.extractTarget - s.extract) * k;
    const ev = EXPLODE[key];
    const ex = s.extract;
    // extraction: lift along its explode vector plus a float + slight tilt for a 3D "pull-out" feel
    const lift = ex * (1.0 + 0.04 * Math.sin(t * 2));
    const ve = new THREE.Vector3().fromArray(ev);
    const dir = ve.lengthSq() > 0 ? ve.clone().normalize() : new THREE.Vector3(0, 1, 0);
    h.position.copy(ve).multiplyScalar(state.explode).addScaledVector(dir, lift * (key === 'chassis' || key === 'suspension' ? 0.6 : 0.9));
    if (key === 'chassis' || key === 'suspension') h.position.y = Math.max(h.position.y, -0.9 + 0.0);
    h.rotation.y = ex * 0.06 * Math.sin(t * 0.8);
    // visibility / ghosting
    let op = 1;
    if (state.selected && state.selected !== key && state.isolate) op = 0.06;
    else if (state.selected && state.selected !== key) op = 0.35;
    if (state.xray && (key === 'body' || key === 'top') && state.selected !== key) op = Math.min(op, 0.18);
    s.opacity += (op - s.opacity) * k;
    const glowT = state.selected === key ? 0.35 + 0.15 * Math.sin(t * 3) : (state.hover === key ? 0.25 : 0);
    s.glow += (glowT - s.glow) * k;
    const col = new THREE.Color(SYSTEMS[key].color);
    for (const m of s.mats) {
      const bo = m.userData.baseOpacity;
      const o = bo * s.opacity;
      const trans = m.userData.baseTransparent || s.opacity < 0.995;
      if (m.transparent !== trans) { m.transparent = trans; m.needsUpdate = true; }
      m.opacity = o; m.depthWrite = s.opacity > 0.5;
      if (m.emissive) { m.emissive.copy(m.userData.baseEmissive).lerp(col, Math.min(1, s.glow * 1.4)); m.emissiveIntensity = Math.max(m.userData.baseEI, s.glow); }
    }
    h.traverse(o => { if (o.isMesh && o.material.depthTest !== false) o.castShadow = s.opacity > 0.5; });
  }
  carRoot.position.y = Math.max(state.explode * 0.82, Math.max(sysState.chassis.extract, sysState.suspension.extract) * 0.62);
  const z = baseZoom / (1 + 0.42 * state.explode); if (Math.abs(camera.zoom - z) > 1e-4) { camera.zoom = z; camera.updateProjectionMatrix(); }
  // convertible top fold
  const pv = built.top.userData.pivot; const td = state.topDown;
  pv.rotation.z = td * 1.75; const sc = 1 - 0.75 * td; pv.scale.set(sc, sc, 1);
  pv.visible = td < 0.97; tonneau.visible = td > 0.6;

  // connections
  const connOn = state.showConn && (state.explode > 0.04 || !!state.selected || state.xray);
  connGroup.visible = connOn;
  for (const o of connObjs) {
    o.ma.getWorldPosition(tmpA); o.mb.getWorldPosition(tmpB);
    const p = o.line.geometry.attributes.position; p.setXYZ(0, tmpA.x, tmpA.y, tmpA.z); p.setXYZ(1, tmpB.x, tmpB.y, tmpB.z); p.needsUpdate = true;
    o.line.computeLineDistances();
    const rel = !state.selected || o.c.a === state.selected || o.c.b === state.selected;
    o.line.material.opacity = rel ? 0.9 : 0.12;
    o.line.material.color.set(state.selected && rel ? SYSTEMS[state.selected].color : '#ffffff');
    o.ma.visible = o.mb.visible = connOn && (rel || !state.selected);
    o.ma.scale.setScalar(rel && state.selected ? 1.4 + 0.3 * Math.sin(t * 4 + o.i) : 1);
    o.mb.scale.copy(o.ma.scale);
  }
  if (tween) {
    tween.t = Math.min(1, tween.t + dt * 1.6); const e = 1 - Math.pow(1 - tween.t, 3);
    camera.position.lerpVectors(tween.fromP, tween.toP, e); controls.target.lerpVectors(tween.fromT, tween.toT, e);
    if (tween.t >= 1) tween = null;
  }
  // Pull the camera target up when exploded so everything stays framed
  if (!tween) controls.target.y += ((HOME.target.y + state.explode * 1.05) - controls.target.y) * k * 0.5;
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(frame);
}

buildUI();
setPaint(PAINTS.find(p => p.code === (params.get('paint') || '916')) || PAINTS[2]);
if (params.get('explode')) { state.explodeTarget = state.explode = +params.get('explode'); $('#explode').value = state.explode; $('#explode-val').textContent = Math.round(state.explode * 100) + '%'; }
if (params.get('top') === 'down') { state.topDownTarget = state.topDown = 1; $('#t-top').checked = false; }
if (params.get('engine')) { const e = ENGINES.find(x => x.id === params.get('engine')); if (e) { $('#engine-select').value = e.id; setEngine(e); } }
if (params.get('select')) select(params.get('select'));
if (params.get('cam')) { const [x, y, z] = params.get('cam').split(',').map(Number); camera.position.set(x, y, z); }
resize();
frame();
document.body.classList.add('ready');
