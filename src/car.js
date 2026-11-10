import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';
import { DIM } from './data.js';

// Car space: metres, origin on the ground at mid-length, x forward, y up, z to the right.
const L = DIM.length, HL = L / 2;
const FRONT_AXLE = HL - DIM.frontOverhang;          // ≈ +1.712
const REAR_AXLE = FRONT_AXLE - DIM.wheelbase;       // ≈ -1.311
const WR = DIM.tireDia / 2;                         // ≈ 0.343
const HW = DIM.bodyWidth / 2;                       // 0.978
export const GEOM = { FRONT_AXLE, REAR_AXLE, WR, HW };

export function makeMaterials(envIntensity = 1) {
  const m = {
    paint: new THREE.MeshPhysicalMaterial({ color: '#2f5f9e', metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 1, roughness: 0.06 }),
    alloy: new THREE.MeshStandardMaterial({ color: '#c9ccd1', metalness: 1, roughness: 0.32 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#a9c4d6', metalness: 0, roughness: 0.03, transmission: 0.0, transparent: true, opacity: 0.28, side: THREE.DoubleSide }),
    tail: new THREE.MeshStandardMaterial({ color: '#b3121b', emissive: '#7a0008', emissiveIntensity: 0.9, roughness: 0.25 }),
    lamp: new THREE.MeshPhysicalMaterial({ color: '#fffbe8', emissive: '#fff1c4', emissiveIntensity: 0.35, roughness: 0.05, clearcoat: 1 }),
    rubber: new THREE.MeshStandardMaterial({ color: '#111214', roughness: 0.9 }),
    whitewall: new THREE.MeshStandardMaterial({ color: '#f1f0ea', roughness: 0.7 }),
    frame: new THREE.MeshStandardMaterial({ color: '#1b1d22', metalness: 0.45, roughness: 0.5 }),
    steel: new THREE.MeshStandardMaterial({ color: '#4b5058', metalness: 0.8, roughness: 0.4 }),
    engineOrange: new THREE.MeshStandardMaterial({ color: '#d2561e', metalness: 0.3, roughness: 0.45 }),
    black: new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.6 }),
    spring: new THREE.MeshStandardMaterial({ color: '#2a8f3c', metalness: 0.4, roughness: 0.45 }),
    vinyl: new THREE.MeshPhysicalMaterial({ color: '#7f1a1f', roughness: 0.55, sheen: 0.4, clearcoat: 0.25 }),
    carpet: new THREE.MeshStandardMaterial({ color: '#4a1014', roughness: 1 }),
    topFabric: new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.82, side: THREE.DoubleSide }),
    topFrame: new THREE.MeshStandardMaterial({ color: '#2c2f35', metalness: 0.6, roughness: 0.45 }),
    radiator: new THREE.MeshStandardMaterial({ color: '#202225', metalness: 0.7, roughness: 0.55 }),
    hydraulic: new THREE.MeshStandardMaterial({ color: '#c0c4ca', metalness: 0.9, roughness: 0.25 }),
  };
  for (const k in m) m[k].envMapIntensity = envIntensity;
  return m;
}

// ---------- helpers ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o;
}
function beam(a, b, w, h, mat) {
  const d = new THREE.Vector3().subVectors(b, a); const len = d.length();
  const o = mesh(new THREE.BoxGeometry(len, h, w), mat);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V(1, 0, 0), d.normalize());
  return o;
}
function rod(a, b, r, mat, seg = 12) {
  const d = new THREE.Vector3().subVectors(b, a); const len = d.length();
  const o = mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}
function coil(a, b, r, wire, turns, mat) {
  const d = new THREE.Vector3().subVectors(b, a); const len = d.length();
  const pts = [];
  const N = turns * 24;
  for (let i = 0; i <= N; i++) { const t = i / N, ang = t * turns * Math.PI * 2; pts.push(V(Math.cos(ang) * r, t * len, Math.sin(ang) * r)); }
  const o = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, wire, 6), mat);
  o.position.copy(a); o.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
  return o;
}
function quad(a, b, c, d) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([...a.toArray(), ...b.toArray(), ...c.toArray(), ...d.toArray()], 3));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals(); return g;
}
const smooth = (t) => t * t * (3 - 2 * t);
function interp(keys, x) {
  if (x >= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, ...a] = keys[i], [x1, ...b] = keys[i + 1];
    if (x <= x0 && x >= x1) { const t = smooth((x0 - x) / (x0 - x1)); return a.map((v, k) => v + (b[k] - v) * t); }
  }
  return keys[keys.length - 1].slice(1);
}

// Lofted hull: stations along x, superellipse cross sections.
function loft(keys, xs, P = 72, n = 6, tumble = 0.05) {
  const pos = [], idx = [];
  for (const x of xs) {
    const [w, yb, yt] = interp(keys, x);
    const ym = (yb + yt) / 2, hh = (yt - yb) / 2;
    for (let j = 0; j < P; j++) {
      const t = (j / P) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      let z = w * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
      const y = ym + hh * Math.sign(s) * Math.pow(Math.abs(s), 2 / n);
      if (s > 0) z *= 1 - tumble * s;
      pos.push(x, y, z);
    }
  }
  const S = xs.length;
  for (let i = 0; i < S - 1; i++) for (let j = 0; j < P; j++) {
    const a = i * P + j, b = (i + 1) * P + j, c = i * P + (j + 1) % P, d = (i + 1) * P + (j + 1) % P;
    idx.push(a, b, c, b, d, c);
  }
  // caps (xs ordered rear -> front)
  const rc = pos.length / 3; { const [w, yb, yt] = interp(keys, xs[0]); pos.push(xs[0], (yb + yt) / 2, 0); }
  const fc = pos.length / 3; { const [w, yb, yt] = interp(keys, xs[S - 1]); pos.push(xs[S - 1], (yb + yt) / 2, 0); }
  for (let j = 0; j < P; j++) {
    const r0 = j, r1 = (j + 1) % P; idx.push(rc, r0, r1);
    const f0 = (S - 1) * P + j, f1 = (S - 1) * P + (j + 1) % P; idx.push(fc, f1, f0);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// ---------- BODY ----------
function buildBody(M) {
  const g = new THREE.Group();
  // [x, halfWidth, bottomY, topY]  — x ordered front -> rear for interp
  const keys = [
    [HL, HW - 0.06, 0.36, 0.82],
    [HL - 0.10, HW - 0.01, 0.31, 0.88],
    [HL - 0.45, HW, 0.30, 0.905],
    [0.75, HW, 0.30, 0.93],
    [0.45, HW, 0.30, 0.975],
    [-1.1, HW, 0.30, 0.965],
    [-HL + 0.45, HW, 0.31, 0.945],
    [-HL + 0.10, HW - 0.01, 0.35, 0.93],
    [-HL, HW - 0.05, 0.40, 0.90],
  ];
  const xs = []; const S = 120;
  for (let i = 0; i <= S; i++) xs.push(-HL + (L * i) / S);
  const hull = loft(keys, xs, 80, 7, 0.06);

  const ev = new Evaluator(); ev.attributes = ['position', 'normal']; ev.useGroups = false;
  let brush = new Brush(hull); brush.updateMatrixWorld();
  const cut = (geo, x, y, z) => { const b = new Brush(geo); b.position.set(x, y, z); b.updateMatrixWorld(); brush = ev.evaluate(brush, b, SUBTRACTION); };
  // Wheel openings (both sides)
  for (const ax of [FRONT_AXLE, REAR_AXLE]) for (const s of [-1, 1]) {
    const cg = new THREE.CylinderGeometry(WR + 0.06, WR + 0.06, 0.42, 48); cg.rotateX(Math.PI / 2);
    cut(cg, ax, WR + 0.03, s * (HW - 0.12));
  }
  // Open cockpit (convertible tub)
  const tub = new THREE.BoxGeometry(1.5, 1.0, 1.66, 1, 1, 1);
  cut(tub, -0.30, 0.42 + 0.5 + 0.0, 0);
  const shell = mesh(brush.geometry, M.paint); shell.name = 'body-shell';
  g.add(shell);

  // Windshield frame + glass (wraparound-ish, raked)
  const wsBase = 0.47, wsTopX = 0.20, wsTopY = 1.36;
  const glass = mesh(quad(V(wsBase, 0.965, -0.79), V(wsBase, 0.965, 0.79), V(wsTopX, wsTopY, 0.74), V(wsTopX, wsTopY, -0.74)), M.glass); glass.castShadow = false;
  g.add(glass);
  // A-pillars and header (chrome)
  for (const s of [-1, 1]) g.add(rod(V(wsBase, 0.96, s * 0.78), V(wsTopX, wsTopY, s * 0.74), 0.018, M.chrome));
  g.add(rod(V(wsTopX, wsTopY, -0.74), V(wsTopX, wsTopY, 0.74), 0.02, M.chrome));
  g.add(rod(V(wsBase + 0.01, 0.965, -0.79), V(wsBase + 0.01, 0.965, 0.79), 0.012, M.chrome));

  // Side spear + beltline chrome
  for (const s of [-1, 1]) {
    g.add(beam(V(HL - 0.05, 0.63, s * (HW + 0.004)), V(-HL + 0.05, 0.63, s * (HW + 0.004)), 0.012, 0.022, M.chrome));
    g.add(beam(V(0.40, 0.972, s * (HW - 0.10)), V(-1.10, 0.962, s * (HW - 0.10)), 0.02, 0.012, M.chrome));
    // rocker molding
    g.add(beam(V(FRONT_AXLE - 0.45, 0.33, s * (HW - 0.005)), V(REAR_AXLE + 0.45, 0.33, s * (HW - 0.005)), 0.012, 0.04, M.chrome));
  }
  // Hood-centre chrome strip running to trunk (1964 signature)
  g.add(beam(V(HL - 0.15, 0.908, 0), V(0.55, 0.93, 0), 0.02, 0.008, M.chrome));
  g.add(beam(V(-1.15, 0.962, 0), V(-HL + 0.12, 0.932, 0), 0.02, 0.008, M.chrome));

  // Front: full-width grille + quad headlamps + bumper
  const fx = HL - 0.005;
  const grille = mesh(new THREE.BoxGeometry(0.04, 0.22, 1.72), M.alloy, fx, 0.62, 0);
  g.add(grille);
  for (let i = -9; i <= 9; i++) g.add(mesh(new THREE.BoxGeometry(0.05, 0.2, 0.012), M.chrome, fx + 0.01, 0.62, i * 0.085));
  for (let k = 0; k < 3; k++) g.add(mesh(new THREE.BoxGeometry(0.05, 0.012, 1.72), M.chrome, fx + 0.012, 0.54 + k * 0.08, 0));
  for (const s of [-1, 1]) for (const k of [0, 1]) {
    const zc = s * (0.70 - k * 0.17);
    const bez = mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.05, 32), M.chrome, fx + 0.01, 0.635, zc); bez.rotation.z = Math.PI / 2; g.add(bez);
    const lens = mesh(new THREE.SphereGeometry(0.075, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.6), M.lamp, fx + 0.02, 0.635, zc); lens.rotation.z = -Math.PI / 2; g.add(lens);
  }
  // Bumpers
  const bumper = (x, y, dir) => {
    const shape = new THREE.Shape(); shape.moveTo(0, -0.07); shape.lineTo(0.06, -0.06); shape.quadraticCurveTo(0.09, 0, 0.06, 0.06); shape.lineTo(0, 0.07); shape.lineTo(0, -0.07);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: DIM.width - 0.04, bevelEnabled: true, bevelSize: 0.015, bevelThickness: 0.02, bevelSegments: 4, curveSegments: 12 });
    geo.translate(0, 0, -(DIM.width - 0.04) / 2);
    const b = mesh(geo, M.chrome, x, y, 0); if (dir < 0) b.rotation.y = Math.PI; return b;
  };
  g.add(bumper(HL - 0.03, 0.42, 1));
  g.add(bumper(-HL + 0.03, 0.44, -1));
  // Rear: stamped alloy cove panel + 3 round taillights per side
  const rx = -HL - 0.002;
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.17, 1.70), M.alloy, rx, 0.70, 0));
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const zc = s * (0.74 - k * 0.165);
    const bez = mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 32), M.chrome, rx - 0.01, 0.70, zc); bez.rotation.z = Math.PI / 2; g.add(bez);
    const lens = mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.032, 32), M.tail, rx - 0.012, 0.70, zc); lens.rotation.z = Math.PI / 2; g.add(lens);
  }
  // Rear license recess + crossed-flags-ish badge (simple)
  g.add(mesh(new THREE.BoxGeometry(0.02, 0.06, 0.14), M.chrome, rx - 0.005, 0.80, 0));
  // Door seam lines
  for (const s of [-1, 1]) {
    g.add(beam(V(0.40, 0.36, s * (HW + 0.001)), V(0.40, 0.96, s * (HW + 0.001)), 0.003, 0.004, M.black));
    g.add(beam(V(-0.85, 0.36, s * (HW + 0.001)), V(-0.85, 0.96, s * (HW + 0.001)), 0.003, 0.004, M.black));
  }
  // Floor pan & firewall (visible when isolated)
  g.add(mesh(new THREE.BoxGeometry(2.6, 0.02, 1.8), M.steel, -0.2, 0.31, 0));
  return g;
}

// ---------- CHASSIS (X-frame) ----------
function buildChassis(M) {
  const g = new THREE.Group();
  const y = 0.22, W = 0.075, H = 0.11;
  const P = (x, z, yy = y) => V(x, yy, z);
  for (const s of [-1, 1]) {
    g.add(beam(P(HL - 0.25, s * 0.40, 0.30), P(FRONT_AXLE + 0.25, s * 0.42, 0.26), W, H, M.frame)); // front horn
    g.add(beam(P(FRONT_AXLE + 0.25, s * 0.42, 0.26), P(1.0, s * 0.40), W, H, M.frame));
    g.add(beam(P(1.0, s * 0.40), P(0.05, s * 0.13), W, H + 0.01, M.frame));                     // converge into X
    g.add(beam(P(-0.35, s * 0.13), P(-0.95, s * 0.46), W, H + 0.01, M.frame));                  // diverge
    g.add(beam(P(-0.95, s * 0.46), P(-1.10, s * 0.47, 0.42), W, H, M.frame));                   // kick-up over axle
    g.add(beam(P(-1.10, s * 0.47, 0.42), P(-1.55, s * 0.48, 0.42), W, H, M.frame));
    g.add(beam(P(-1.55, s * 0.48, 0.42), P(-1.70, s * 0.48, 0.34), W, H, M.frame));
    g.add(beam(P(-1.70, s * 0.48, 0.34), P(-HL + 0.30, s * 0.48, 0.34), W, H, M.frame));
  }
  // boxed centre section
  g.add(mesh(new THREE.BoxGeometry(0.42, H + 0.02, 0.34), M.frame, -0.15, y, 0));
  // crossmembers
  g.add(beam(P(FRONT_AXLE, -0.46, 0.26), P(FRONT_AXLE, 0.46, 0.26), 0.16, 0.10, M.frame));
  g.add(beam(P(HL - 0.27, -0.40, 0.30), P(HL - 0.27, 0.40, 0.30), 0.06, 0.07, M.frame));
  g.add(beam(P(0.45, -0.30), P(0.45, 0.30), 0.06, 0.05, M.frame));   // transmission crossmember
  g.add(beam(P(-1.62, -0.48, 0.42), P(-1.62, 0.48, 0.42), 0.07, 0.07, M.frame));
  g.add(beam(P(-HL + 0.32, -0.48, 0.34), P(-HL + 0.32, 0.48, 0.34), 0.06, 0.07, M.frame));
  // coil pockets on front crossmember
  for (const s of [-1, 1]) g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.08, 20), M.frame, FRONT_AXLE, 0.33, s * 0.50));
  // rear lower-arm brackets outboard of frame
  for (const s of [-1, 1]) g.add(beam(P(-0.75, s * 0.42, 0.24), P(-0.75, s * 0.58, 0.24), 0.06, 0.08, M.frame));
  // body mount pads (representative)
  for (const [x, z, yy] of [[2.2, 0.45, 0.30], [0.9, 0.42, 0.25], [-1.9, 0.48, 0.38]]) for (const s of [-1, 1])
    g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), M.rubber, x, yy + 0.07, s * z));
  return g;
}

// ---------- ENGINE & DRIVETRAIN ----------
export function buildEngine(M, type = 'sbc', dual = false) {
  const root = new THREE.Group();
  const g = new THREE.Group(); g.position.y = -0.085; root.add(g); // engine/trans sit low under the hood line
  const ex = 1.55; // engine centre x
  if (type === 'i6') {
    g.add(mesh(new THREE.BoxGeometry(0.80, 0.34, 0.26), M.engineOrange, ex - 0.05, 0.56, 0));
    g.add(mesh(new THREE.BoxGeometry(0.80, 0.08, 0.22), M.engineOrange, ex - 0.05, 0.77, 0.02));
    g.add(mesh(new THREE.BoxGeometry(0.74, 0.06, 0.18), M.engineOrange, ex - 0.05, 0.84, 0.02));
    const ac = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 32), M.black, ex - 0.05, 0.92, -0.14); g.add(ac);
    g.add(rod(V(ex - 0.40, 0.62, -0.17), V(ex + 0.30, 0.62, -0.17), 0.035, M.steel));
  } else {
    const big = type === 'w409';
    const bw = big ? 0.30 : 0.26, bl = big ? 0.70 : 0.62;
    g.add(mesh(new THREE.BoxGeometry(bl, 0.24, bw), M.engineOrange, ex, 0.55, 0));
    for (const s of [-1, 1]) {
      const head = mesh(new THREE.BoxGeometry(bl - 0.04, 0.16, 0.16), M.engineOrange, ex, 0.72, s * 0.18);
      head.rotation.x = s * 0.55; g.add(head);
      // valve covers: 409 "W" covers are scalloped/wider; small-block chrome covers
      const vc = mesh(new THREE.BoxGeometry(bl - 0.06, 0.05, big ? 0.17 : 0.12), big ? M.chrome : M.chrome, ex, 0.80, s * 0.24);
      vc.rotation.x = s * 0.55; g.add(vc);
      if (big) for (let k = -2; k <= 2; k++) { const sc = mesh(new THREE.SphereGeometry(0.035, 12, 8), M.chrome, ex + k * 0.13, 0.83, s * 0.25); g.add(sc); }
      // exhaust manifolds
      g.add(rod(V(ex + 0.25, 0.60, s * 0.30), V(ex - 0.30, 0.56, s * 0.30), 0.03, M.steel));
      g.add(rod(V(ex - 0.30, 0.56, s * 0.30), V(ex - 0.35, 0.30, s * 0.32), 0.03, M.steel));
    }
    g.add(mesh(new THREE.BoxGeometry(bl - 0.12, 0.08, 0.20), M.engineOrange, ex, 0.80, 0)); // intake
    const cx = dual ? [ex + 0.13, ex - 0.13] : [ex];
    for (const x of cx) {
      g.add(mesh(new THREE.BoxGeometry(0.10, 0.06, 0.10), M.steel, x, 0.87, 0));
      g.add(mesh(new THREE.CylinderGeometry(dual ? 0.12 : 0.17, dual ? 0.12 : 0.17, 0.07, 36), M.chrome, x, 0.93, 0));
    }
  }
  g.add(mesh(new THREE.BoxGeometry(0.55, 0.12, 0.24), M.black, ex - 0.02, 0.38, 0)); // oil pan
  // timing cover, water pump, fan, radiator
  g.add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), M.steel, ex + 0.38, 0.52, 0).rotateZ(Math.PI / 2));
  const fan = mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.01, 6), M.black, ex + 0.50, 0.58, 0); fan.rotation.z = Math.PI / 2; g.add(fan);
  g.add(mesh(new THREE.BoxGeometry(0.06, 0.42, 0.72), M.radiator, 2.33, 0.60, 0));
  // transmission + bellhousing
  const bell = mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.22, 24), M.alloy, ex - 0.44, 0.50, 0); bell.rotation.z = Math.PI / 2; g.add(bell);
  const tr = mesh(new THREE.CylinderGeometry(0.10, 0.075, 0.50, 20), M.alloy, ex - 0.80, 0.44, 0); tr.rotation.z = Math.PI / 2 - 0.08; g.add(tr);
  // two-piece driveshaft with carrier bearing at X centre
  const cb = V(-0.15, 0.33, 0);
  root.add(rod(V(0.55, 0.34, 0), cb, 0.035, M.steel));
  root.add(mesh(new THREE.BoxGeometry(0.08, 0.07, 0.10), M.rubber, cb.x, cb.y, 0));
  root.add(rod(cb, V(REAR_AXLE + 0.17, WR + 0.02, 0), 0.04, M.steel));
  // rear axle (hypoid, semi-floating)
  const tube = mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.42, 16), M.frame, REAR_AXLE, WR, 0); tube.rotation.x = Math.PI / 2; root.add(tube);
  root.add(mesh(new THREE.SphereGeometry(0.15, 24, 16), M.frame, REAR_AXLE + 0.02, WR, 0));
  // exhaust to rear
  for (const s of [-1, 1]) root.add(rod(V(ex - 0.35, 0.22, s * 0.32), V(-HL + 0.25, 0.26, s * 0.40), 0.028, M.steel));
  return root;
}

// ---------- SUSPENSION, STEERING, BRAKES, WHEELS ----------
function wheel(M, isSS = true) {
  const w = new THREE.Group();
  const tireW = 0.19;
  const prof = [];
  const rIn = 0.18, rOut = WR;
  for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + (i / 24) * Math.PI; prof.push(new THREE.Vector2(rOut - 0.045 + Math.cos(a) * 0.045, Math.sin(a) * tireW / 2)); }
  prof.unshift(new THREE.Vector2(rIn, -tireW / 2)); prof.push(new THREE.Vector2(rIn, tireW / 2));
  const tire = mesh(new THREE.LatheGeometry(prof, 64), M.rubber); tire.rotation.x = Math.PI / 2; w.add(tire);
  // whitewall band
  const ww = mesh(new THREE.RingGeometry(0.235, 0.29, 64), M.whitewall); ww.position.z = tireW / 2 + 0.001; w.add(ww);
  const ww2 = ww.clone(); ww2.position.z = -tireW / 2 - 0.001; ww2.rotation.y = Math.PI; w.add(ww2);
  // SS-style full wheel cover with spinner
  const cover = mesh(new THREE.CylinderGeometry(0.215, 0.20, 0.03, 48), M.chrome); cover.rotation.x = Math.PI / 2; cover.position.z = tireW / 2 - 0.005; w.add(cover);
  for (let k = 0; k < 3; k++) { const b = mesh(new THREE.BoxGeometry(0.17, 0.02, 0.012), M.chrome); b.position.z = tireW / 2 + 0.02; b.rotation.z = k * Math.PI / 3; w.add(b); }
  const hub = mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 24), M.engineOrange.clone()); hub.material.color.set('#a01822'); hub.rotation.x = Math.PI / 2; hub.position.z = tireW / 2 + 0.03; w.add(hub);
  // brake drum (11 in)
  const drum = mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.07, 32), M.steel); drum.rotation.x = Math.PI / 2; drum.position.z = -0.08; w.add(drum);
  return w;
}
function buildSuspension(M) {
  const g = new THREE.Group();
  const fx = FRONT_AXLE, rx = REAR_AXLE;
  for (const s of [-1, 1]) {
    const zt = s * DIM.trackF / 2;
    const wf = wheel(M); wf.position.set(fx, WR, zt); if (s < 0) wf.rotation.y = Math.PI; g.add(wf);
    const wr = wheel(M); wr.position.set(rx, WR, s * DIM.trackR / 2); if (s < 0) wr.rotation.y = Math.PI; g.add(wr);
    // front SLA
    const kz = s * 0.66;
    g.add(beam(V(fx + 0.12, 0.25, s * 0.40), V(fx, 0.22, kz), 0.04, 0.03, M.steel));
    g.add(beam(V(fx - 0.14, 0.25, s * 0.40), V(fx, 0.22, kz), 0.04, 0.03, M.steel));
    g.add(beam(V(fx + 0.10, 0.52, s * 0.46), V(fx, 0.50, kz), 0.035, 0.025, M.steel));
    g.add(beam(V(fx - 0.10, 0.52, s * 0.46), V(fx, 0.50, kz), 0.035, 0.025, M.steel));
    g.add(rod(V(fx, 0.20, s * 0.68), V(fx, 0.52, s * 0.68), 0.025, M.frame)); // spindle/knuckle
    g.add(coil(V(fx, 0.24, s * 0.52), V(fx, 0.31, s * 0.50), 0.06, 0.011, 6, M.spring));
    g.add(rod(V(fx + 0.04, 0.23, s * 0.55), V(fx + 0.04, 0.48, s * 0.50), 0.018, M.hydraulic)); // shock
    // tie rods
    g.add(rod(V(fx - 0.15, 0.27, s * 0.05), V(fx - 0.12, 0.27, s * 0.64), 0.012, M.steel));
    // rear: lower control arm, coil, shock
    g.add(beam(V(-0.75, 0.24, s * 0.56), V(rx, 0.26, s * 0.56), 0.05, 0.05, M.steel));
    g.add(coil(V(rx, 0.30, s * 0.56), V(rx, 0.44, s * 0.56), 0.065, 0.012, 6, M.spring));
    g.add(rod(V(rx - 0.12, 0.26, s * 0.60), V(rx - 0.20, 0.50, s * 0.55), 0.018, M.hydraulic));
  }
  // front sway bar, centre link, steering gear box (left = -z, LHD)
  g.add(rod(V(fx + 0.26, 0.28, -0.60), V(fx + 0.26, 0.28, 0.60), 0.014, M.frame));
  g.add(rod(V(fx - 0.15, 0.27, -0.45), V(fx - 0.15, 0.27, 0.45), 0.016, M.steel));
  g.add(mesh(new THREE.BoxGeometry(0.14, 0.10, 0.10), M.black, 2.0, 0.32, -0.36));
  // rear upper control arm (right side only) + diagonal Panhard rod
  g.add(beam(V(-0.85, 0.40, 0.20), V(rx + 0.04, 0.44, 0.15), 0.04, 0.04, M.steel));
  g.add(rod(V(rx - 0.08, 0.30, -0.62), V(rx - 0.08, 0.44, 0.50), 0.018, M.steel));
  return g;
}

// ---------- INTERIOR ----------
function buildInterior(M) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(1.48, 0.02, 1.64), M.carpet, -0.30, 0.43, 0));
  const bucket = (x, z) => {
    const s = new THREE.Group();
    const cushion = mesh(new THREE.BoxGeometry(0.50, 0.12, 0.50, 2, 1, 2), M.vinyl, 0, 0.55, 0); s.add(cushion);
    const back = mesh(new THREE.BoxGeometry(0.11, 0.56, 0.50), M.vinyl, -0.25, 0.86, 0); back.rotation.z = 0.18; s.add(back);
    for (let k = -2; k <= 2; k++) s.add(mesh(new THREE.BoxGeometry(0.115, 0.52, 0.006), M.carpet, -0.25, 0.86, k * 0.09).rotateZ(0.18));
    s.add(mesh(new THREE.BoxGeometry(0.30, 0.02, 0.03), M.chrome, -0.02, 0.48, 0.23));
    s.position.set(x, 0, z); return s;
  };
  g.add(bucket(-0.10, -0.37)); g.add(bucket(-0.10, 0.37));
  // SS console
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.18, 0.16), M.vinyl, 0.0, 0.53, 0));
  g.add(mesh(new THREE.BoxGeometry(0.62, 0.012, 0.13), M.chrome, 0.0, 0.625, 0));
  g.add(rod(V(0.15, 0.62, 0), V(0.12, 0.78, 0), 0.008, M.chrome)); g.add(mesh(new THREE.SphereGeometry(0.025, 16, 12), M.black, 0.12, 0.79, 0));
  // rear bench
  g.add(mesh(new THREE.BoxGeometry(0.48, 0.13, 1.40), M.vinyl, -0.80, 0.53, 0));
  const rb = mesh(new THREE.BoxGeometry(0.12, 0.45, 1.40), M.vinyl, -1.02, 0.80, 0); rb.rotation.z = 0.2; g.add(rb);
  // door / quarter trim panels
  for (const s of [-1, 1]) {
    g.add(mesh(new THREE.BoxGeometry(1.36, 0.46, 0.03), M.vinyl, -0.28, 0.72, s * 0.815));
    g.add(beam(V(0.35, 0.86, s * 0.80), V(-0.90, 0.86, s * 0.80), 0.02, 0.012, M.chrome));
  }
  // dashboard with twin-pod cluster
  g.add(mesh(new THREE.BoxGeometry(0.22, 0.18, 1.58), M.paint, 0.48, 0.86, 0));
  g.add(mesh(new THREE.BoxGeometry(0.14, 0.05, 1.58), M.vinyl, 0.45, 0.97, 0));
  g.add(mesh(new THREE.BoxGeometry(0.01, 0.04, 1.5), M.chrome, 0.37, 0.80, 0));
  for (const dz of [-0.48, -0.30]) { const p = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 28), M.black, 0.37, 0.89, dz); p.rotation.z = Math.PI / 2; g.add(p);
    const r = mesh(new THREE.TorusGeometry(0.06, 0.008, 8, 28), M.chrome, 0.355, 0.89, dz); r.rotation.y = Math.PI / 2; g.add(r); }
  // steering column & wheel (LHD, driver at -z)
  g.add(rod(V(0.45, 0.75, -0.37), V(0.20, 0.88, -0.37), 0.022, M.paint));
  const sw = mesh(new THREE.TorusGeometry(0.2, 0.013, 12, 48), M.black, 0.19, 0.90, -0.37); sw.rotation.y = Math.PI / 2; sw.rotateX(0.5); sw.rotation.set(0, Math.PI / 2, 0); sw.rotateX(-0.45);
  g.add(sw);
  const hornRing = mesh(new THREE.TorusGeometry(0.13, 0.006, 8, 40, Math.PI), M.chrome, 0.19, 0.90, -0.37); hornRing.rotation.copy(sw.rotation); g.add(hornRing);
  return g;
}

// ---------- CONVERTIBLE TOP ----------
function buildTop(M) {
  const g = new THREE.Group();
  const pivot = new THREE.Group(); pivot.position.set(-0.95, 0.92, 0); g.add(pivot); // body top pivot bracket axis
  const up = new THREE.Group(); pivot.add(up); up.position.set(0.95, -0.92, 0);
  // fabric shell: side profile extruded across the car
  const sh = new THREE.Shape();
  sh.moveTo(0.20, 1.36); sh.lineTo(-0.30, 1.40); sh.quadraticCurveTo(-0.62, 1.40, -0.85, 1.26); sh.quadraticCurveTo(-1.05, 1.10, -1.20, 0.965);
  sh.lineTo(-1.12, 0.965); sh.quadraticCurveTo(-0.98, 1.08, -0.82, 1.21); sh.quadraticCurveTo(-0.6, 1.36, -0.3, 1.365); sh.lineTo(0.20, 1.33); sh.lineTo(0.20, 1.36);
  const shellGeo = new THREE.ExtrudeGeometry(sh, { depth: 1.52, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.05, bevelSegments: 5, curveSegments: 24 });
  shellGeo.translate(0, 0, -0.76);
  up.add(mesh(shellGeo, M.topFabric));
  // side quarter fabric
  for (const s of [-1, 1]) {
    const q = new THREE.Shape(); q.moveTo(-0.62, 0.97); q.lineTo(-0.62, 1.38); q.quadraticCurveTo(-0.85, 1.28, -1.18, 0.97); q.lineTo(-0.62, 0.97);
    const qm = mesh(new THREE.ShapeGeometry(q), M.topFabric); qm.position.z = s * 0.80; up.add(qm);
    // side window glass (roll-up)
    const wq = new THREE.Shape(); wq.moveTo(0.36, 0.97); wq.lineTo(0.18, 1.33); wq.lineTo(-0.58, 1.37); wq.lineTo(-0.58, 0.97); wq.lineTo(0.36, 0.97);
    const wm = mesh(new THREE.ShapeGeometry(wq), M.glass); wm.castShadow = false; wm.position.z = s * 0.80; up.add(wm);
  }
  // rear window (zippered plastic)
  const rw = mesh(quad(V(-0.86, 1.25, -0.42), V(-0.86, 1.25, 0.42), V(-1.08, 1.04, 0.42), V(-1.08, 1.04, -0.42)), M.glass); rw.castShadow = false; rw.position.y += 0.04; rw.position.x -= 0.01; up.add(rw);
  // bows & side rails (frame)
  for (const [x, y] of [[0.20, 1.37], [-0.25, 1.395], [-0.62, 1.37], [-0.92, 1.20]]) up.add(rod(V(x, y, -0.78), V(x, y, 0.78), 0.012, M.topFrame));
  for (const s of [-1, 1]) {
    up.add(rod(V(0.20, 1.35, s * 0.79), V(-0.62, 1.36, s * 0.79), 0.014, M.topFrame));
    up.add(rod(V(-0.62, 1.36, s * 0.79), V(-0.95, 0.93, s * 0.79), 0.016, M.topFrame));
    // hydraulic lift cylinders: body quarter -> rear side rail
    g.add(rod(V(-1.05, 0.62, s * 0.78), V(-0.80, 1.05, s * 0.78), 0.022, M.hydraulic));
    g.add(mesh(new THREE.BoxGeometry(0.08, 0.08, 0.04), M.topFrame, -0.95, 0.90, s * 0.80));
  }
  // 12 V motor-pump behind rear seat + hoses
  g.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 20), M.steel, -1.12, 0.58, 0).rotateX(Math.PI / 2));
  for (const s of [-1, 1]) g.add(rod(V(-1.12, 0.58, s * 0.1), V(-1.05, 0.62, s * 0.76), 0.006, M.black));
  g.userData.pivot = pivot;
  return g;
}

export function buildCar(M) {
  const systems = {
    body: buildBody(M),
    chassis: buildChassis(M),
    engine: buildEngine(M, 'sbc', false),
    suspension: buildSuspension(M),
    interior: buildInterior(M),
    top: buildTop(M),
  };
  return systems;
}
