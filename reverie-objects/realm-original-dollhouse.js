import {createExactIndexedGeometry} from './realm-exact-index.js';

/** Faithful exterior from the user's August 18 original nm-castle source.
 * Geometry, original procedural texture recipes and their authored dimensions
 * are retained. Only the application shell and opening animation are omitted.
 * Original source remains in reference-dollhouse/castle.html, SHA256
 * 43c4774785601baaa9b920c3eeaa6ea9f573e888adfb5a958d6cda3b037c48cc.
 * RoundedBoxGeometry below is the original bundled Three r185 implementation
 * adapted to the host namespace (Three.js Authors, MIT license).
 */
export function createOriginalDollhouse(THREESource,{canvasFactory}={}) {
  const ownedGeometry=new Set(),ownedMaterial=new Set(),ownedTexture=new Set(),ownedInstances=new Set();
  let disposed=false,group=null;
  function own(value,set){set.add(value);value.addEventListener('dispose',()=>set.delete(value));return value;}
  function ownedConstructor(Base,set){return class extends Base{constructor(...args){super(...args);own(this,set);}};}
  const THREE={...THREESource};
  for(const [key,Base]of Object.entries(THREESource))if(typeof Base==='function'){
    if(/Geometry$/.test(key))THREE[key]=ownedConstructor(Base,ownedGeometry);
    else if(/Material$/.test(key))THREE[key]=ownedConstructor(Base,ownedMaterial);
    else if(/Texture$/.test(key))THREE[key]=ownedConstructor(Base,ownedTexture);
  }
  THREE.InstancedMesh=ownedConstructor(THREESource.InstancedMesh,ownedInstances);
  const document={createElement(type){if(type!=='canvas')throw new Error('Original dollhouse only creates texture canvases.');const canvas=canvasFactory?.()||globalThis.document?.createElement('canvas');if(!canvas?.getContext)throw new Error('Original dollhouse needs a 2D canvas factory for its preserved painted textures.');return canvas;}};
  // Private diagnostics preserve source helpers without touching browser state.
  const window={__T:{}},__mark=()=>{},world=new THREE.Group();
  function dispose(){if(disposed)return;disposed=true;group?.removeFromParent();group?.clear();for(const mesh of[...ownedInstances])mesh.dispose();for(const g of[...ownedGeometry])g.dispose();for(const m of[...ownedMaterial])m.dispose();for(const t of[...ownedTexture])t.dispose();}
  const roundedUvTemp=new THREE.Vector3();
function roundedUV(s,e,t,n,i,r){let a=2*Math.PI*i/4,o=Math.max(r-2*i,0),l=Math.PI/4;roundedUvTemp.copy(e),roundedUvTemp[n]=0,roundedUvTemp.normalize();let c=.5*a/(a+o),h=1-roundedUvTemp.angleTo(s)/l;return Math.sign(roundedUvTemp[t])===1?h*c:o/(a+o)+c+c*(1-h)}
const OriginalRoundedBoxGeometry=class s extends THREE.BoxGeometry{constructor(e=1,t=1,n=1,i=2,r=.1){let a=i*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:i,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new THREE.Vector3,c=new THREE.Vector3,h=new THREE.Vector3(e,t,n).divideScalar(2).subScalar(r),d=this.attributes.position.array,u=this.attributes.normal.array,f=this.attributes.uv.array,p=d.length/6,x=new THREE.Vector3,g=.5/a;for(let m=0,M=0;m<d.length;m+=3,M+=2)switch(l.fromArray(d,m),c.copy(l),c.x-=Math.sign(c.x)*g,c.y-=Math.sign(c.y)*g,c.z-=Math.sign(c.z)*g,c.normalize(),d[m+0]=h.x*Math.sign(l.x)+c.x*r,d[m+1]=h.y*Math.sign(l.y)+c.y*r,d[m+2]=h.z*Math.sign(l.z)+c.z*r,u[m+0]=c.x,u[m+1]=c.y,u[m+2]=c.z,Math.floor(m/p)){case 0:x.set(1,0,0),f[M+0]=roundedUV(x,c,"z","y",r,n),f[M+1]=1-roundedUV(x,c,"y","z",r,t);break;case 1:x.set(-1,0,0),f[M+0]=1-roundedUV(x,c,"z","y",r,n),f[M+1]=1-roundedUV(x,c,"y","z",r,t);break;case 2:x.set(0,1,0),f[M+0]=1-roundedUV(x,c,"x","z",r,e),f[M+1]=roundedUV(x,c,"z","x",r,n);break;case 3:x.set(0,-1,0),f[M+0]=1-roundedUV(x,c,"x","z",r,e),f[M+1]=1-roundedUV(x,c,"z","x",r,n);break;case 4:x.set(0,0,1),f[M+0]=1-roundedUV(x,c,"x","y",r,e),f[M+1]=1-roundedUV(x,c,"y","x",r,t);break;case 5:x.set(0,0,-1),f[M+0]=roundedUV(x,c,"x","y",r,e),f[M+1]=1-roundedUV(x,c,"y","x",r,t);break}}static fromJSON(e){return new s(e.width,e.height,e.depth,e.segments,e.radius)}};
THREE.RoundedBoxGeometry=ownedConstructor(OriginalRoundedBoxGeometry,ownedGeometry);
  try{
// Original castle.html:18
let __seed = 20260812;

// Original castle.html:20
function rnd() {
  __seed |= 0, __seed = __seed + 1831565813 | 0;
  let t = Math.imul(__seed ^ __seed >>> 15, 1 | __seed);
  return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296
}

// Original castle.html:25
const rr = (t, s) => t + rnd() * (s - t),
  TAU = Math.PI * 2,
  PAL = {
    wall: 16173269,
    wallHi: 16574190,
    wallDeep: 15511236,
    trim: 16774890,
    cream: 16642274,
    roof: 13658775,
    roofDark: 12146051,
    roofLight: 15177144,
    gold: 14657870,
    goldDeep: 13209390,
    wood: 10842447,
    woodDark: 8148028,
    floorWood: 13146731,
    grass: 8368965, /* kotopia's green — the whole sky shares one grass now */
    grassDark: 7645282,
    hedge: 6463583,
    hedgeDark: 5147214,
    stone: 15852495,
    stoneDark: 14732722,
    water: 11067631,
    waterDeep: 7323866,
    leaf: 7842915,
    trunk: 9069906,
    blossomA: 16371422,
    blossomB: 16640497,
    blossomC: 16776189,
    skyDayTop: 9685230,
    skyDayHor: 16770260,
    skyNightTop: 790569,
    skyNightHor: 3089224,
    fogDay: 16506060,
    fogNight: 2169666
  },
  FLOWER_COLORS = [15160448, 16230085, 16777215, 16765286, 12099816, 16748459];

// Original castle.html:63
function canvasTex(t, s, o, e = 1, n = 1) {
  const __t = performance.now(), a = document.createElement("canvas");
  a.width = t, a.height = s, o(a.getContext("2d"), t, s);
  window.__T.tex = (window.__T.tex || 0) + performance.now() - __t, window.__T.texN = (window.__T.texN || 0) + 1;
  const i = new THREE.CanvasTexture(a);
  return i.wrapS = i.wrapT = THREE.RepeatWrapping, i.repeat.set(e, n), i.anisotropy = 4, i.colorSpace = THREE.SRGBColorSpace, i
}

// Original castle.html:76
function alphaTex(t, s, o, e = 1, n = 1) {
  const a = document.createElement("canvas");
  a.width = t, a.height = s;
  const c = a.getContext("2d", { willReadFrequently: !0 });
  o(c, t, s);
  const d = c.getImageData(0, 0, t, s).data;
  let R = 0, G = 0, B = 0, W = 0;
  for (let i = 0; i < d.length; i += 4) { const k = d[i + 3]; k >= 48 && (R += d[i] * k, G += d[i + 1] * k, B += d[i + 2] * k, W += k) }
  if (W) {
    R /= W, G /= W, B /= W;
    for (let i = 0; i < d.length; i += 4) { const k = d[i + 3]; if (k < 48) { const f = k / 48; d[i] = d[i] * f + R * (1 - f), d[i + 1] = d[i + 1] * f + G * (1 - f), d[i + 2] = d[i + 2] * f + B * (1 - f) } }
  }
  const i = new THREE.DataTexture(d, t, s, THREE.RGBAFormat, THREE.UnsignedByteType);
  return i.flipY = !0, i.minFilter = THREE.LinearMipmapLinearFilter, i.magFilter = THREE.LinearFilter, i.generateMipmaps = !0, i.wrapS = i.wrapT = THREE.RepeatWrapping, i.repeat.set(e, n), i.anisotropy = 4, i.colorSpace = THREE.SRGBColorSpace, i.needsUpdate = !0, i
}

// Original castle.html:91
const css = t => "#" + t.toString(16).padStart(6, "0");

// Original castle.html:93
function texScallop(t, s, o, e = 6, n = 7) {
  return canvasTex(256, 256, (a, i, r) => {
    a.fillStyle = css(s), a.fillRect(0, 0, i, r);
    const c = i / n,
      d = r / e;
    for (let l = 0; l <= e; l++)
      for (let f = -1; f <= n; f++) {
        const p = l % 2 ? c / 2 : 0;
        a.fillStyle = l % 2 ? css(t) : css(s), a.strokeStyle = css(o), a.lineWidth = 3, a.beginPath(), a.arc(f * c + p + c / 2, l * d, c / 2, 0, Math.PI), a.fill(), a.stroke()
      }
  })
}

// Original castle.html:106
function texStripes(t, s = 12) {
  return canvasTex(256, 64, (o, e, n) => {
    const a = e / s;
    for (let i = 0; i < s; i++) o.fillStyle = css(t[i % t.length]), o.fillRect(i * a, 0, a + 1, n)
  })
}

// Original castle.html:113
function texChecker(t, s) {
  return canvasTex(128, 128, (o, e, n) => {
    o.fillStyle = css(t), o.fillRect(0, 0, e, n), o.fillStyle = css(s), o.fillRect(0, 0, e / 2, n / 2), o.fillRect(e / 2, n / 2, e / 2, n / 2)
  })
}

// Original castle.html:119
function texPlanks(t, s) {
  return canvasTex(256, 256, (o, e, n) => {
    o.fillStyle = css(t), o.fillRect(0, 0, e, n);
    const a = 6,
      i = e / a;
    for (let r = 0; r < a; r++) o.fillStyle = "rgba(255,255,255," + (.04 + .07 * (r * 37 % 10) / 10) + ")", o.fillRect(r * i, 0, i, n), o.strokeStyle = css(s), o.lineWidth = 2, o.strokeRect(r * i + 1, -2, i - 2, n + 4), o.beginPath(), o.moveTo(r * i, r * 73 % 4 / 4 * n), o.lineTo((r + 1) * i, r * 73 % 4 / 4 * n), o.stroke()
  })
}

// Original castle.html:128
function texStones(t, s) {
  return canvasTex(256, 256, (o, e, n) => {
    o.fillStyle = css(t), o.fillRect(0, 0, e, n);
    for (let a = 0; a < 5; a++)
      for (let i = 0; i < 5; i++) {
        const r = s[Math.floor(rnd() * s.length)],
          c = i * e / 5 + e / 10 + rr(-6, 6),
          d = a * n / 5 + n / 10 + rr(-5, 5),
          l = e / 13 + rr(0, 7);
        o.fillStyle = "rgba(120,95,70,0.18)", o.beginPath(), o.ellipse(c + 2, d + 3, l, l * .78, rr(0, 1), 0, TAU), o.fill(), o.fillStyle = css(r), o.beginPath(), o.ellipse(c, d, l, l * .78, rr(0, 1), 0, TAU), o.fill()
      }
  })
}

// Original castle.html:142
function texDamask(t, s) {
  return canvasTex(128, 128, (o, e, n) => {
    o.fillStyle = css(t), o.fillRect(0, 0, e, n), o.fillStyle = css(s), o.strokeStyle = css(s), o.lineWidth = 2;
    const a = (r, c, d) => {
        o.beginPath(), o.arc(r, c, d, 0, TAU), o.fill()
      },
      i = (r, c, d) => {
        o.beginPath(), o.moveTo(r, c + d * .8), o.bezierCurveTo(r - d, c - d * .2, r - d * .5, c - d, r, c - d * .35), o.bezierCurveTo(r + d * .5, c - d, r + d, c - d * .2, r, c + d * .8), o.fill()
      };
    i(e / 4, n / 4, 9), i(3 * e / 4, 3 * n / 4, 9), a(3 * e / 4, n / 4, 3), a(e / 4, 3 * n / 4, 3), a(e / 2, n / 2, 2), a(0, n / 2, 2), a(e, n / 2, 2), a(e / 2, 0, 2), a(e / 2, n, 2)
  })
}

// Original castle.html:155
function texStripeWall(t, s) {
  return canvasTex(128, 128, (o, e, n) => {
    o.fillStyle = css(t), o.fillRect(0, 0, e, n), o.fillStyle = css(s);
    for (let a = 0; a < 4; a++) o.fillRect(a * e / 4 + e / 16, 0, e / 8, n)
  })
}

// Original castle.html:162
function texRug(t, s, o) {
  const e = canvasTex(256, 256, (n, a, i) => {
    n.fillStyle = css(o), n.fillRect(0, 0, a, i), n.fillStyle = css(s), n.beginPath(), n.ellipse(a / 2, i / 2, a * .44, i * .44, 0, 0, TAU), n.fill(), n.fillStyle = css(t), n.beginPath(), n.ellipse(a / 2, i / 2, a * .33, i * .33, 0, 0, TAU), n.fill(), n.strokeStyle = css(o), n.lineWidth = 5, n.setLineDash([10, 8]), n.beginPath(), n.ellipse(a / 2, i / 2, a * .385, i * .385, 0, 0, TAU), n.stroke()
  });
  return e.wrapS = e.wrapT = THREE.ClampToEdgeWrapping, e
}

// Original castle.html:169
function M(t, s = .85, o = 0, e = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: t,
    roughness: s,
    metalness: o
  }, e))
}

// Original castle.html:176
const MAT = {
    wall: M(PAL.wall, .72),
    wallHi: M(PAL.wallHi, .72),
    wallDeep: M(PAL.wallDeep, .74),
    trim: M(PAL.trim, .62),
    cream: M(PAL.cream, .7),
    roof: M(PAL.roof, .75),
    gold: M(PAL.gold, .26, .92, { envMapIntensity: 1.6 }),
    goldDeep: M(PAL.goldDeep, .32, .88, { envMapIntensity: 1.5 }),
    wood: M(PAL.wood, .8),
    woodDark: M(PAL.woodDark, .8),
    grass: M(PAL.grass, 1),
    hedge: M(PAL.hedge, .95),
    hedgeDark: M(PAL.hedgeDark, .95),
    stone: M(PAL.stone, .95),
    leaf: M(PAL.leaf, .95),
    trunk: M(PAL.trunk, .9),
    white: M(16777215, .7)
  };

// Original castle.html:338
function mesh(t, s, o = !0, e = !0) {
  const n = new THREE.Mesh(t, s);
  return n.castShadow = o, n.receiveShadow = e, n
}

// Original castle.html:348
function box(t, s, o, e, n = !0) {
  const q = Math.min(t, s, o), r = Math.min(.045, q * .17), __t = performance.now(),
    g = THREE.RoundedBoxGeometry && q > .11 ? new THREE.RoundedBoxGeometry(t, s, o, 1, r) : new THREE.BoxGeometry(t, s, o);
  return window.__T.box = (window.__T.box || 0) + performance.now() - __t, window.__T.boxN = (window.__T.boxN || 0) + 1, mesh(g, e, n)
}

// Original castle.html:354
function cyl(t, s, o, e, n = 24, a = !0) {
  return mesh(new THREE.CylinderGeometry(t, s, o, n), e, a)
}

// Original castle.html:358
function cone(t, s, o, e = 24) {
  return mesh(new THREE.ConeGeometry(t, s, e), o)
}

// Original castle.html:362
function sph(t, s, o = 16, e = 12) {
  return mesh(new THREE.SphereGeometry(t, o, e), s)
}

// Original castle.html:365
function nmPlanarUV(g2, span, rep) {
  /* top-down planar grass mapping — no radial smear, no wrap seam */
  const p2 = g2.attributes.position, uv = g2.attributes.uv;
  for (let i = 0; i < p2.count; i++)
    uv.setXY(i, (p2.getX(i) / span + .5) * rep, (p2.getZ(i) / span + .5) * rep);
  uv.needsUpdate = !0
}

// Original castle.html:372
function nmSmoothSeams(g2) {
  /* average duplicated-position normals (lathe/cylinder wrap seams) */
  const p2 = g2.attributes.position, n2 = g2.attributes.normal, map = new Map();
  for (let i = 0; i < p2.count; i++) {
    const k2 = p2.getX(i).toFixed(3) + "," + p2.getY(i).toFixed(3) + "," + p2.getZ(i).toFixed(3),
      arr = map.get(k2) || [];
    arr.push(i), map.set(k2, arr)
  }
  for (const idxs of map.values())
    if (idxs.length > 1) {
      let nx = 0, ny = 0, nz = 0;
      for (const i of idxs) nx += n2.getX(i), ny += n2.getY(i), nz += n2.getZ(i);
      const l2 = Math.hypot(nx, ny, nz) || 1;
      for (const i of idxs) n2.setXYZ(i, nx / l2, ny / l2, nz / l2)
    }
  n2.needsUpdate = !0
}

// Original castle.html:496
const KEEP = {
    W: 8.6,
    D: 4.8,
    H: 6.45,
    cz: -2.8,
    wallT: .14,
    f1: 2.15,
    f2: 4.3,
    frontZ: -.4,
    backZ: -5.2,
    innerHalf: 4.16
  },
  NIGHT = {
    panes: [],
    pointLights: [],
    glowMats: [],
    sprites: []
  },
  FLAGS = [],
  paneMat = M(6256793, .09, 0, {
    emissive: 1778483,
    emissiveIntensity: .35,
    envMapIntensity: 1.9
  });

// Original castle.html:525
paneMat.userData = { day: .35, night: 1.65, knock: 0 }, NIGHT.panes.push(paneMat);

// Original castle.html:535
const sheenNoiseTex = canvasTex(256, 256, (g2, w2, h2) => {
    const R = fseed("sheen");
    g2.fillStyle = "#e6e6e6", g2.fillRect(0, 0, w2, h2);
    for (let k = 0; k < 900; k++) {
      const x = R() * w2, y = R() * h2, r = 6 + R() * 26, v = 200 + Math.floor(R() * 55),
        gr = g2.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, "rgba(" + v + "," + v + "," + v + ",.55)"), gr.addColorStop(1, "rgba(" + v + "," + v + "," + v + ",0)");
      g2.fillStyle = gr, g2.fillRect(x - r, y - r, r * 2, r * 2)
    }
  }, 3, 3);

// Original castle.html:545
sheenNoiseTex.colorSpace = THREE.NoColorSpace;

// Original castle.html:546
const wallpaperTexBase = canvasTex(256, 64, (g2, w2, h2) => {
    g2.fillStyle = css(PAL.wall), g2.fillRect(0, 0, w2, h2);
    for (const x2 of [0, 128]) {
      g2.fillStyle = "rgba(255,255,255,.10)", g2.fillRect(x2 + 34, 0, 60, h2);
      g2.fillStyle = "rgba(255,255,255,.28)", g2.fillRect(x2 + 61, 0, 6, h2)
    }
  }),
  wallpaperFor = wRep => {
    const t2 = wallpaperTexBase.clone();
    return t2.needsUpdate = !0, t2.repeat.set(wRep, 1), new THREE.MeshStandardMaterial({
      map: t2,
      roughness: .7,
      roughnessMap: sheenNoiseTex
    })
  },
  wpPanelMat = wallpaperFor(3),
  wpSideMat = wallpaperFor(4),
  wpBackMat = wallpaperFor(7),
  wpStripMat = wallpaperFor(.6);

// Original castle.html:565
const roofScallopTex = texScallop(PAL.roofLight, PAL.roof, PAL.roofDark, 7, 8),
  roofMat = new THREE.MeshStandardMaterial({
    map: roofScallopTex,
    roughness: .8
  }),
  roofMatBig = new THREE.MeshStandardMaterial({
    map: texScallop(PAL.roofLight, PAL.roof, PAL.roofDark, 5, 6),
    roughness: .8
  });

// Original castle.html:574
roofMatBig.map.center.set(.5, .5), roofMatBig.map.rotation = Math.PI / 2, roofMatBig.map.repeat.set(1.15, 1.15);

// Original castle.html:575
const shutterMat = M(15044526, .9),
  _m4 = new THREE.Matrix4,
  _q = new THREE.Quaternion,
  _e = new THREE.Euler;

// Original castle.html:580
function G(t, s = 0, o = 0, e = 0, n = 0, a = 0, i = 0, r = 1, c = 1, d = 1) {
  return _e.set(n, a, i), _q.setFromEuler(_e), {
    geo: t,
    matrix: new THREE.Matrix4().compose(new THREE.Vector3(s, o, e), _q.clone(), new THREE.Vector3(r, c, d))
  }
}

// Original castle.html:587
function mergeGeoms(t) {
  /* one geometry from many: every part is turned non-indexed, carried into place by
     its matrix, and copied into pre-sized typed arrays — the old spread-into-a-list
     copy was the single largest cost of building a house */
  const parts = [];
  let cnt = 0;
  for (const { geo: i, matrix: r } of t) {
    const c = i.index ? i.toNonIndexed() : i.clone();
    c.applyMatrix4(r), parts.push([c, c !== i]), cnt += c.attributes.position.count
  }
  const P = new Float32Array(cnt * 3), N = new Float32Array(cnt * 3), U = new Float32Array(cnt * 2);
  let o = 0;
  for (const [c, own] of parts) {
    const n = c.attributes.position.count;
    P.set(c.attributes.position.array, o * 3), c.attributes.normal && N.set(c.attributes.normal.array, o * 3), c.attributes.uv && U.set(c.attributes.uv.array, o * 2), o += n;
    own && c.dispose?.()
  }
  const a = new THREE.BufferGeometry;
  return a.setAttribute("position", new THREE.BufferAttribute(P, 3)), a.setAttribute("normal", new THREE.BufferAttribute(N, 3)), a.setAttribute("uv", new THREE.BufferAttribute(U, 2)), a
}

// Original castle.html:608
function heartShape(t = 1) {
  const s = new THREE.Shape;
  return s.moveTo(0, -.75 * t), s.bezierCurveTo(-1.1 * t, .1 * t, -.55 * t, .85 * t, 0, .3 * t), s.bezierCurveTo(.55 * t, .85 * t, 1.1 * t, .1 * t, 0, -.75 * t), s
}

// Original castle.html:613
function archShape(t, s) {
  const o = t / 2,
    e = new THREE.Shape;
  return e.moveTo(-o, 0), e.lineTo(-o, s - o), e.absarc(0, s - o, o, Math.PI, 0, !0), e.lineTo(o, 0), e.closePath(), e
}

// Original castle.html:619
function flatExtrude(t, s, o, e = !1) {
  const n = new THREE.ExtrudeGeometry(t, {
    depth: s,
    bevelEnabled: e,
    bevelThickness: .02,
    bevelSize: .02,
    bevelSegments: t === NM_WING ? 2 : 1,
    curveSegments: t === NM_WING ? 20 : 16
  });
  return mesh(n, o)
}

// Original castle.html:631
function crescentShape(t = .5, s = .42, o = .2) {
  const e = Math.acos((t * t + o * o - s * s) / (2 * t * o)),
    n = [];
  for (let r = 0; r <= 96; r++) {
    const c = e + (2 * Math.PI - 2 * e) * (r / 96);
    n.push([Math.cos(c) * t, Math.sin(c) * t])
  }
  const a = Math.atan2(Math.sin(e) * t, Math.cos(e) * t - o);
  for (let r = 1; r < 72; r++) {
    const c = -a - (2 * Math.PI - 2 * a) * (r / 72);
    n.push([o + Math.cos(c) * s, Math.sin(c) * s])
  }
  const i = new THREE.Shape;
  i.moveTo(n[0][0], n[0][1]);
  for (let r = 1; r < n.length; r++) i.lineTo(n[r][0], n[r][1]);
  return i.closePath(), i
}

// Original castle.html:648
const NM_CRESCENT = crescentShape(.5, .44, .18),
  NM_CRESCENT_W = crescentShape(.5, .38, .17),
  moonGlowMat = M(16177546, .3, .55, {
    emissive: 16769440,
    emissiveIntensity: .16
  });

// Original castle.html:654
NIGHT.glowMats.push(moonGlowMat);

// Original castle.html:655
const NM_WING = new THREE.Shape;

// Original castle.html:656
NM_WING.moveTo(.06, .02), NM_WING.bezierCurveTo(.02, .16, .16, .32, .42, .35), NM_WING.bezierCurveTo(.68, .38, .92, .28, .99, .12), NM_WING.bezierCurveTo(1.03, .03, .99, -.05, .9, -.07), NM_WING.bezierCurveTo(.95, -.14, .92, -.24, .83, -.26), NM_WING.bezierCurveTo(.76, -.28, .69, -.24, .66, -.18), NM_WING.bezierCurveTo(.66, -.27, .6, -.34, .51, -.34), NM_WING.bezierCurveTo(.43, -.34, .37, -.28, .37, -.2), NM_WING.bezierCurveTo(.28, -.26, .16, -.24, .1, -.16), NM_WING.bezierCurveTo(.04, -.09, .02, -.03, .06, .02), NM_WING.closePath();

// Original castle.html:657
const wingWhiteMat = M(16777215, .22),
  wingRimMat = M(15978362, .35, .6);

// Original castle.html:660
function wingCurl(t, s, o) {
  const e = [];
  for (let r = 0; r <= 22; r++) {
    const c = r / 22,
      d = Math.PI * 1.62 * c - Math.PI * .45,
      l = .185 * (1 - .7 * c);
    e.push(new THREE.Vector3(s * (.3 + Math.cos(d) * l) * t, (-.04 + Math.sin(d) * l) * t, 0))
  }
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(e), 22, Math.max(.022 * t, .015), 6), o, !1, !1)
}

// Original castle.html:671
function wingPairMolding(t = 1, s = {}) {
  const o = new THREE.Group,
    e = s.mat || wingWhiteMat;
  for (const n of [-1, 1]) {
    const a = flatExtrude(NM_WING, .03, wingRimMat, !1);
    a.scale.set(n * t * 1.1, t * 1.1, 1), a.position.set(n * .028 * t, -.012 * t, -.012), a.rotation.z = n * .1, o.add(a);
    const i = flatExtrude(NM_WING, .045, e, !0);
    i.scale.set(n * t, t, 1), i.position.set(n * .05 * t, 0, 0), i.rotation.z = n * .1, o.add(i);
    const r = wingCurl(t, n, wingRimMat);
    r.position.set(n * .05 * t, 0, .052), r.rotation.z = n * .1, o.add(r);
    const c = mesh(new THREE.OctahedronGeometry(.026 * t), MAT.gold, !1, !1);
    c.position.set(n * .62 * t, .16 * t, .05), o.add(c)
  }
  if (s.moon) {
    const n = flatExtrude(NM_CRESCENT, .05, moonGlowMat, !1);
    n.scale.setScalar(.16 * t / .5), n.rotation.z = Math.PI * .75, n.position.set(0, .05 * t, .045), o.add(n)
  } else if (s.ball !== !1) {
    const n = sph(.075 * t, MAT.gold, 8, 6);
    n.position.set(0, .03 * t, .03), o.add(n)
  }
  return o
}

// Original castle.html:693
const bloomGeo = new THREE.SphereGeometry(1, 8, 6);

// Original castle.html:695
function makeBloomCluster(t) {
  const s = new THREE.InstancedMesh(bloomGeo, M(16777215, .85), t.length),
    o = new THREE.Color;
  return t.forEach((e, n) => {
    _q.setFromEuler(_e.set(0, 0, 0)), s.setMatrixAt(n, _m4.compose(new THREE.Vector3(e.x, e.y, e.z), _q, new THREE.Vector3(e.s, e.s * (e.sy || 1), e.s))), s.setColorAt(n, o.set(e.c))
  }), s.castShadow = !0, s.instanceMatrix.needsUpdate = !0, s.instanceColor && (s.instanceColor.needsUpdate = !0), s
}

// Original castle.html:702
const merlonGeo = new THREE.BoxGeometry(.34, .4, .16);

// Original castle.html:704
function merlonRow(t) {
  const s = Math.max(2, Math.floor(t / .6)),
    o = new THREE.InstancedMesh(merlonGeo, MAT.trim, s);
  for (let e = 0; e < s; e++) {
    const n = -t / 2 + (e + .5) * (t / s);
    o.setMatrixAt(e, _m4.makeTranslation(n, 0, 0))
  }
  return o.castShadow = !0, o.instanceMatrix.needsUpdate = !0, o
}

// Original castle.html:714
function nmGem(r, c) {
  /* a cut jewel where a flat gold square used to sit: faceted, coloured,
     glowing faintly so the lamplight catches it after dark */
  c = c || 15222671;
  nmGem.m = nmGem.m || {};
  if (!nmGem.m[c]) {
    const mm = new THREE.MeshPhysicalMaterial({ color: c, roughness: .06, metalness: .05,
      transparent: !0, opacity: .8, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.7,
      flatShading: !0, emissive: c, emissiveIntensity: .12 });
    NIGHT.glowMats.push(mm), nmGem.m[c] = mm
  }
  const g = new THREE.Mesh(new THREE.OctahedronGeometry(r, 1), nmGem.m[c]);
  return g.scale.set(1, 1.35, .72), g.castShadow = !1, g.receiveShadow = !1, g
}

// Original castle.html:729
function spreadWings(sc, rake, rootX) {
  /* the crest pose: two of her exact wings, roots at the emblem's edges,
     raked upward and outward — the flying-box composition */
  const g = new THREE.Group;
  for (const d2 of [-1, 1]) {
    const bk = flatExtrude(NM_WING, .03, wingRimMat, !1);
    bk.scale.set(d2 * sc * 1.1, sc * 1.1, 1), bk.position.set(d2 * (rootX + .03 * sc), -.012 * sc, -.012), bk.rotation.z = d2 * rake, g.add(bk);
    const wm = flatExtrude(NM_WING, .045, wingWhiteMat, !0);
    wm.scale.set(d2 * sc, sc, 1), wm.position.set(d2 * rootX, 0, 0), wm.rotation.z = d2 * rake, g.add(wm);
    const cu = wingCurl(sc, d2, wingRimMat);
    cu.position.set(d2 * rootX, 0, .052), cu.rotation.z = d2 * rake, g.add(cu)
  }
  return g
}

// Original castle.html:743
function addPennant(t, s, o, e, n = PAL.roof) {
  /* the moon standard — no more cloth: a gold rod, an orb, a crescent
     holding a star. every tower keeps the moon now, not the wind. */
  const a = cyl(.022, .022, .58, MAT.gold, 8);
  a.position.set(s, o + .29, e), t.add(a);
  const i = sph(.045, MAT.gold, 10, 8);
  i.position.set(s, o + .58, e), t.add(i);
  const c = flatExtrude(NM_CRESCENT, .035, moonGlowMat, !1);
  c.scale.setScalar(.34), c.rotation.z = -Math.PI / 2, c.position.set(s, o + .72, e - .017), t.add(c);
  const st2 = nmGem(.042, 13212206);
  st2.position.set(s, o + .80, e), t.add(st2)
}

// Original castle.html:755
NIGHT.stained = [];

// Original castle.html:756
const GLASS_COLS = ["#e8478f", "#b8a0e8", "#f2b8cf", "#8a70b8", "#f7d9a8"],
  GLASS_LEAD = "#4a3550";

// Original castle.html:758
function makeStainedMat(t) {
  const s = new THREE.MeshStandardMaterial({
    map: t,
    roughness: .16,
    metalness: 0,
    emissive: 16777215,
    emissiveMap: t,
    emissiveIntensity: .2,
    envMapIntensity: 1.3,
    side: THREE.DoubleSide
  });
  return NIGHT.stained.push(s), s
}

// Original castle.html:772
function stainedTexPetal() {
  return canvasTex(256, 384, (t, s, o) => {
    t.fillStyle = "#fdf2f7", t.fillRect(0, 0, s, o);
    const e = 3,
      n = 5;
    for (let a = 0; a < e; a++)
      for (let i = 0; i < n; i++) {
        const r = (a + .5) * s / e,
          c = (i + .5) * o / n,
          d = s / e * .42,
          l = o / n * .46;
        t.fillStyle = GLASS_COLS[(a + i * 2) % GLASS_COLS.length], t.beginPath(), t.moveTo(r, c - l), t.quadraticCurveTo(r + d, c, r, c + l), t.quadraticCurveTo(r - d, c, r, c - l), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 4, t.stroke()
      }
    t.strokeStyle = GLASS_LEAD, t.lineWidth = 6;
    for (let a = 1; a < e; a++) t.beginPath(), t.moveTo(a * s / e, 0), t.lineTo(a * s / e, o), t.stroke();
    for (let a = 1; a < n; a++) t.beginPath(), t.moveTo(0, a * o / n), t.lineTo(s, a * o / n), t.stroke();
    t.fillStyle = "#dfa94e";
    for (let a = 0; a < 8; a++) t.beginPath(), t.arc((a * 97 + 40) % s, (a * 151 + 60) % o, 5, 0, TAU), t.fill()
  })
}

// Original castle.html:793
function stainedTexQuarry() {
  return canvasTex(256, 256, (t, s, o) => {
    t.fillStyle = "#f7e8f0", t.fillRect(0, 0, s, o);
    const e = 4,
      n = s / e;
    for (let a = -1; a <= e; a++)
      for (let i = -1; i <= e + 2; i++) {
        const r = a * n + ((i % 2 + 2) % 2 ? n / 2 : 0),
          c = i * n * .62;
        t.fillStyle = GLASS_COLS[((a + i * 3) % GLASS_COLS.length + GLASS_COLS.length) % GLASS_COLS.length], t.beginPath(), t.moveTo(r, c - n * .5), t.lineTo(r + n * .55, c), t.lineTo(r, c + n * .5), t.lineTo(r - n * .55, c), t.closePath(), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 4, t.stroke()
      }
  })
}

// Original castle.html:807
function stainedTexFan() {
  return canvasTex(256, 256, (t, s, o) => {
    const e = s / 2,
      n = o / 2;
    for (let a = 0; a < 12; a++) {
      t.fillStyle = GLASS_COLS[a % GLASS_COLS.length];
      const i = a / 12 * TAU,
        r = (a + 1) / 12 * TAU;
      t.beginPath(), t.moveTo(e, n), t.arc(e, n, s * .52, i, r), t.closePath(), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 4, t.beginPath(), t.moveTo(e, n), t.lineTo(e + Math.cos(i) * s * .52, n + Math.sin(i) * s * .52), t.stroke()
    }
    t.fillStyle = "#f7d9a8", t.beginPath(), t.arc(e, n, s * .1, 0, TAU), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 4, t.beginPath(), t.arc(e, n, s * .1, 0, TAU), t.stroke()
  })
}

// Original castle.html:821
function stainedTexRose() {
  return canvasTex(512, 512, (t, s, o) => {
    const e = s / 2,
      n = o / 2;
    t.fillStyle = "#fdf2f7", t.beginPath(), t.arc(e, n, s * .5, 0, TAU), t.fill();
    for (let a = 0; a < 12; a++) {
      const i = a / 12 * TAU;
      t.fillStyle = GLASS_COLS[a % GLASS_COLS.length], t.save(), t.translate(e, n), t.rotate(i), t.beginPath(), t.moveTo(s * .15, 0), t.quadraticCurveTo(s * .3, s * .105, s * .45, 0), t.quadraticCurveTo(s * .3, -s * .105, s * .15, 0), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 5, t.stroke(), t.restore()
    }
    for (let a = 0; a < 24; a++) {
      const i = (a + .5) / 24 * TAU;
      t.fillStyle = a % 2 ? "#f2b8cf" : "#b8a0e8", t.beginPath(), t.arc(e + Math.cos(i) * s * .465, n + Math.sin(i) * s * .465, s * .032, 0, TAU), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 3, t.stroke()
    }
    t.fillStyle = "#fdf2f7", t.beginPath(), t.arc(e, n, s * .14, 0, TAU), t.fill(), t.strokeStyle = GLASS_LEAD, t.lineWidth = 5, t.stroke()
  })
}

// Original castle.html:837
const __stainedTex = {
    1: stainedTexPetal(),
    2: stainedTexQuarry()
  },
  __stainedMats = {};

// Original castle.html:843
function stainedMatFor(t, s, o) {
  const e = t + ":" + s.toFixed(2) + ":" + o.toFixed(2);
  if (__stainedMats[e]) return __stainedMats[e];
  const n = __stainedTex[t].clone();
  return n.needsUpdate = !0, n.repeat.set(1 / s, 1 / o), n.offset.set(.5, 0), __stainedMats[e] = makeStainedMat(n)
}

// Original castle.html:849
const stainedMatFan = makeStainedMat(stainedTexFan());

// Original castle.html:861
function fseed(k) {
  let s = 2166136261;
  for (let i = 0; i < k.length; i++) s = Math.imul(s ^ k.charCodeAt(i), 16777619);
  return () => {
    s |= 0, s = s + 1831565813 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    return t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t, ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

// Original castle.html:872
function texFairyFelt(base, fleck, dark, n) {
  const R = fseed("felt" + base);
  return canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = css(base), x.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) {
      const px = R() * w, py = R() * h, r = 18 + R() * 44,
        g = x.createRadialGradient(px, py, 0, px, py, r),
        c2 = (i % 2 ? fleck : dark).toString(16).padStart(6, "0");
      g.addColorStop(0, "#" + c2 + "4d"), g.addColorStop(1, "#" + c2 + "00"),
      x.fillStyle = g, x.beginPath(), x.arc(px, py, r, 0, TAU), x.fill()
    }
    for (let i = 0; i < n; i++) {
      const px = R() * w, py = R() * h, a = R() * TAU, L = 2 + R() * 7;
      x.strokeStyle = "rgba(" + (R() < .5 ? "255,255,255," : "0,0,0,") + (.06 + R() * .14).toFixed(3) + ")",
      x.lineWidth = .5 + R() * .9, x.beginPath(), x.moveTo(px, py),
      x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L), x.stroke()
    }
  })
}

// Original castle.html:896
function texFairyShingle(cRoof = PAL.roof, cLight = PAL.roofLight, cHi = "#fdeef4", key = "shingle") {
  const R = fseed(key), PAL = { roof: cRoof, roofLight: cLight };
  return canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = css(PAL.roofLight), x.fillRect(0, 0, w, h);
    const CO = 3, TB = 3, ch = h / CO, tw = w / TB, rad = tw * .5;
    for (let r = -1; r <= CO; r++) {
      const yT = r * ch, off = (((r % 2) + 2) % 2) ? rad : 0;
      for (let k = -1; k <= TB + 1; k++) {
        const cx = k * tw + off + rad, cy = yT + ch - rad;
        /* the scale: shoulders up into the course above, belly a full round */
        x.beginPath();
        x.moveTo(cx - rad, yT - ch * .18);
        x.lineTo(cx - rad, cy);
        x.arc(cx, cy, rad, Math.PI, 0, !1);
        x.lineTo(cx + rad, yT - ch * .18);
        x.closePath();
        /* lit across the belly, shaded where it is lapped */
        const alt = (((r % 2) + 2) % 2) === 1;
        const g = x.createLinearGradient(0, yT - ch * .18, 0, cy + rad);
        g.addColorStop(0, css(PAL.roof));
        g.addColorStop(.26, css(alt ? PAL.roof : PAL.roofLight));
        g.addColorStop(.62, css(PAL.roofLight));
        g.addColorStop(.88, cHi);
        g.addColorStop(1, css(PAL.roofLight));
        x.fillStyle = g, x.fill();
        /* a sideways sheen, so each scale turns away at its edges */
        const s2 = x.createLinearGradient(cx - rad, 0, cx + rad, 0);
        s2.addColorStop(0, "rgba(176,96,134,.14)");
        s2.addColorStop(.32, "rgba(255,255,255,.13)");
        s2.addColorStop(.74, "rgba(255,255,255,0)");
        s2.addColorStop(1, "rgba(176,96,134,.15)");
        x.fillStyle = s2, x.fill();
        /* the shadow the scale casts on the course below it */
        x.strokeStyle = "rgba(150,74,110,.30)", x.lineWidth = 5;
        x.beginPath(), x.arc(cx, cy, rad - 2, Math.PI, 0, !1), x.stroke();
        /* and a hairline of light along its own lip */
        x.strokeStyle = "rgba(255,255,255,.42)", x.lineWidth = 2.5;
        x.beginPath(), x.arc(cx, cy, rad - 7, Math.PI * 1.08, -.08, !1), x.stroke()
      }
    }
    /* fibres last, so it stays felt and never reads as ceramic tile */
    for (let i = 0; i < 2400; i++) {
      const px = R() * w, py = R() * h, a2 = R() * TAU, L = 2 + R() * 9;
      x.strokeStyle = "rgba(" + (R() < .5 ? "255,255,255," : "0,0,0,") + (.02 + R() * .06).toFixed(3) + ")",
      x.lineWidth = .5 + R() * .9, x.beginPath(), x.moveTo(px, py),
      x.lineTo(px + Math.cos(a2) * L, py + Math.sin(a2) * L), x.stroke()
    }
  })
}

// Original castle.html:946
const fairyShingleTex = texFairyShingle();

// Original castle.html:947
fairyShingleTex.anisotropy = 8;

// Original castle.html:948
fairyShingleTex.repeat.set(1, 1);

// Original castle.html:949
const fairyWallTex = texFairyFelt(PAL.wall, PAL.wallHi, PAL.wallDeep, 700);

// Original castle.html:950
fairyWallTex.repeat.set(1.8, 1.8);

// Original castle.html:951
const MATF = {
  /* no bumpMap: the tab gradients are already painted into the texture,
     and a second texture fetch per fragment across every roof in the
     parish costs far more than the ridge it would add */
  shingle: new THREE.MeshStandardMaterial({ map: fairyShingleTex, roughness: .93 }),
  felt: M(13853593, .93),
  feltHi: M(15177144, .93),
  wall: new THREE.MeshStandardMaterial({ map: fairyWallTex, roughness: .95 }),
  moss: M(PAL.hedge, 1),
  mossHi: M(9946218, .95),
  came: M(4735808, .72, .28),
  lit: M(11901554, .9, 0, { emissive: 15782294, emissiveIntensity: 1.35 })
};

// Original castle.html:964
NIGHT.glowMats && NIGHT.glowMats.push(MATF.lit);

// Original castle.html:966
const fairyRoseMat = makeStainedMat(stainedTexRose());

// Original castle.html:970
const gableCladTex = texFairyShingle(15451583, 16240096, "#fff6f9", "gableclad");

// Original castle.html:971
gableCladTex.anisotropy = 8, gableCladTex.repeat.set(1 / 1.02, 1 / 1.02);

// Original castle.html:972
MATF.gableClad = new THREE.MeshStandardMaterial({ map: gableCladTex, roughness: .8 });

// Original castle.html:975
function fairyGableRose(R, y, z, faceOut) {
  const g = new THREE.Group;
  g.add(mesh(new THREE.CircleGeometry(R * 1.03, 20), MATF.lit, !1, !1));
  const pane = mesh(new THREE.CircleGeometry(R, 30), fairyRoseMat, !1, !1);
  pane.position.z = .014, g.add(pane);
  const ring = mesh(new THREE.TorusGeometry(R * 1.02, R * .15, 7, 22), MATF.felt);
  ring.position.z = .014, g.add(ring);
  for (let k = 0; k < 2; k++) {
    const bar = box(R * 1.9, .011, .012, MATF.came, !1);
    bar.rotation.z = k * Math.PI / 2, bar.position.z = .028, g.add(bar)
  }
  const hub = sph(R * .16, MAT.gold, 9, 7);
  return hub.scale.z = .5, hub.position.z = .034, g.add(hub),
    g.position.set(0, y, z), faceOut < 0 && (g.rotation.y = Math.PI), g
}

// Original castle.html:993
function gothicArch(w, h) {
  const s = new THREE.Shape, hw = w / 2, st = h * .58, r = hw;
  return s.moveTo(-hw, 0), s.lineTo(-hw, st),
    s.quadraticCurveTo(-hw * .92, st + r * .78, 0, st + r * 1.32),
    s.quadraticCurveTo(hw * .92, st + r * .78, hw, st),
    s.lineTo(hw, 0), s.closePath(), s
}

// Original castle.html:1002
function feltRope(pts, r, mat, closed, seg) {
  /* a rope reads off its silhouette, not its wire count — 5 radial sides
     and a segment every few points is indistinguishable at any distance
     you will ever see it from, and costs a fifth of the triangles */
  return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, !!closed),
    seg || Math.min(30, Math.max(12, Math.round(pts.length * .8))), r, 8, !!closed),
    mat || MATF.felt, !0, !1)
}

// Original castle.html:1012
function fairyVolute(r, turns, tube, mat, dir) {
  const pts = [], D = dir === -1 ? -1 : 1;
  for (let i = 0; i <= 20; i++) {
    const t = i / 20, a = t * TAU * turns, rr2 = r * (1 - t * .74);
    pts.push(new THREE.Vector3((Math.cos(a) * rr2 - r) * D, Math.sin(a) * rr2, 0))
  }
  const g = feltRope(pts, tube, mat || MATF.felt, !1, 26);
  const bud = sph(tube * 1.5, mat || MATF.felt, 7, 6);
  return bud.position.copy(pts[0]), g.add(bud), g
}

// Original castle.html:1023
function fairyMoss(r, h, mat, R) {
  const g = new THREE.Group;
  R = R || fseed("moss");
  for (let i = 0; i < 4; i++) {
    const b = sph(r * (.5 + R() * .6), i % 2 ? (mat || MATF.moss) : MATF.mossHi, 6, 5);
    b.scale.set(1, .55, 1), b.castShadow = !1,
    b.position.set((R() - .5) * r * 2.1, h * R() * .5, (R() - .5) * r * 2.1), g.add(b)
  }
  return g
}

// Original castle.html:1037
function fairyRoofSheet(w, d, ph, key, opt) {
  opt = opt || {};
  const R = fseed("roof" + key),
    p1 = R() * TAU, p2 = R() * TAU, p3 = R() * TAU,
    A = Math.min(w, d) * (opt.wave == null ? .085 : opt.wave),
    /* the eave wave can pull the hem IN by this much, and if it pulls in
       past the cornice underneath, the cornice pokes through and flashes
       white. so the roof measures itself against what it has to cover. */
    __dip = A * .37,
    over = Math.max(opt.over == null ? 1.12 : opt.over,
      opt.clear ? (opt.clear + __dip + .07) / (w * .5) : 0),
    eaveWaveY = v => (Math.sin(v * 4.6 + p1) * .40 + Math.sin(v * 8.1 + p2) * .17 + Math.sin(v * 2.3 + p3) * .24) * A,
    eaveWaveX = v => (Math.sin(v * 5.4 + p2) * .26 + Math.sin(v * 9.9 + p1) * .11) * A,
    ridgeWave = v => (Math.sin(v * 3.4 + p3) * .11 + Math.sin(v * 6.6 + p1) * .05) * A;

  /* the hem wave used to swing BELOW the roof's base, and wherever it dipped
     it exposed whatever trim band sat at the wall head — that is what was
     flashing white along half the parish. lift the whole sheet by the wave's
     deepest excursion, so the base is the hem's floor, not its average. */
  const LIFT = 1.35 * A;

  function P(s, v) {
    const t = Math.abs(s), z = (v - .5) * d * 1.06, hem = t * t,
      ridgeY = ph + ridgeWave(v),
      eaveY = eaveWaveY(v),
      eaveX = w * .5 * over + eaveWaveX(v),
      flare = Math.pow(t, 1.5),
      drop = Math.pow(t, .62),
      lobe = (Math.sin(t * 7.2 + v * 2.1 + p1) * .31 + Math.sin(t * 3.6 + p2) * .21) * Math.sin(t * Math.PI * .92) * A,
      x = (eaveX * flare + lobe) * Math.sign(s || 1);
    let y = ridgeY - (ridgeY - eaveY) * drop;
    y += eaveWaveY(v) * .55 * hem + lobe * .42;
    const sw = (Math.sin(v * 6.1 + t * 2.4 + p3) * .10 + Math.sin(v * 10.4 + p2) * .05) * A * Math.sin(t * Math.PI);
    return new THREE.Vector3(x + sw * .35 * Math.sign(s || 1), y + sw + LIFT, z)
  }

  /* the tabs have to come out square whatever the house's size, so the uv
     runs on real distance along the sheet rather than a fixed repeat —
     a shop and the town hall end up wearing the same size shingle */
  const NS = opt.ns || 16, NV = opt.nv || 16, pos = [], uv = [], idx = [], TILE = 1.02;
  const arc = [];
  {
    let acc = 0, prev = P(-1, .5);
    for (let i = 0; i <= NS; i++) {
      const s = -1 + i / NS * 2, q = P(s, .5);
      acc += q.distanceTo(prev), prev = q, arc.push(acc)
    }
    /* measured from the ridge outward on both slopes, so the courses mirror
       across the ridge and every tab still hangs downhill */
    const mid = arc[NS >> 1];
    for (let i = 0; i <= NS; i++) arc[i] = Math.abs(arc[i] - mid)
  }
  for (let i = 0; i <= NS; i++) {
    const s = -1 + i / NS * 2;
    for (let j = 0; j <= NV; j++) {
      const v = j / NV, p = P(s, v);
      pos.push(p.x, p.y, p.z), uv.push(v * d * 1.06 / TILE, arc[i] / TILE)
    }
  }
  for (let i = 0; i < NS; i++)
    for (let j = 0; j < NV; j++) {
      const a = i * (NV + 1) + j, b = a + NV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const geo = new THREE.BufferGeometry;
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)),
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)),
  geo.setIndex(idx), geo.computeVertexNormals();
  return { geo: geo, P: P, R: R, A: A, LIFT: LIFT }
}

// Original castle.html:1109
function fairyRoof(w, d, ph, key, opt) {
  opt = opt || {};
  const g = new THREE.Group, S = fairyRoofSheet(w, d, ph, key, opt), P = S.P, A = S.A, LIFT = S.LIFT;
  const sheet = mesh(S.geo, opt.mat || MATF.shingle);
  g.add(sheet);

  /* the gable ends, solid and tucked under the sheet so no daylight shows */
  const gz = [];
  for (const end of [0, 1]) {
    const N = 68, pts = [];
    for (let i = 0; i <= N; i++) pts.push(P(-1 + i / N * 2, end));
    const sh = new THREE.Shape;
    /* the gable is cut to the sheet's own outline — a hair proud in x and a
       hair low in y — so the two always overlap. inset it even slightly and
       you get a seam of daylight along every rake, which is what was
       flashing white on half the roofs in the parish. */
    sh.moveTo(pts[0].x * 1.004, pts[0].y - .006);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i].x * 1.004, pts[i].y - .006);
    const skirt = -(.30 + LIFT);
    sh.lineTo(pts[pts.length - 1].x * 1.004, skirt);
    sh.lineTo(pts[0].x * 1.004, skirt), sh.closePath();
    const m = mesh(new THREE.ExtrudeGeometry(sh, { depth: .17, bevelEnabled: !1 }), opt.gableMat || MATF.gableClad);
    m.position.z = pts[0].z + (end ? -.17 : 0), g.add(m), gz.push(pts[0].z);
    /* a scalloped board where the gable meets the wall head — the curve that
       finishes the bottom of the face the way the rope finishes its rakes */
    if (opt.gableMat === void 0) {
      let hw0 = 0;
      for (let i = 0; i <= 40; i++) { const q = P(-1 + i / 20, end); q.y <= .35 && (hw0 = Math.max(hw0, Math.abs(q.x))) }
      const fs = fasciaScallop(hw0 * 2 + .1);
      fs.position.set(0, .02, pts[0].z + (end ? .07 : -.07)), end || (fs.rotation.y = Math.PI), g.add(fs)
    }
  }

  /* a fascia hanging off each eave — felted board under the hem. it hides
     the wall head at every point of the wave, and it is what a felt roof
     actually does where the sheet is folded under. */
  {
    const SK = Math.max(.17, 1.25 * A), NVS = opt.nv || 16, fp = [], fu = [], fi = [];
    for (const side of [-1, 1])
      for (let j = 0; j <= NVS; j++) {
        const v = j / NVS, q = P(side, v);
        fp.push(q.x, q.y, q.z, q.x + side * .012, q.y - SK, q.z);
        fu.push(v * d * 1.06 / 1.02, SK / 1.02, v * d * 1.06 / 1.02, 0)
      }
    for (const k of [0, 1]) {
      const o0 = k * (NVS + 1) * 2;
      for (let j = 0; j < NVS; j++) {
        const a4 = o0 + j * 2, b4 = a4 + 2;
        k ? fi.push(a4, a4 + 1, b4, a4 + 1, b4 + 1, b4)
          : fi.push(a4, b4, a4 + 1, a4 + 1, b4, b4 + 1)
      }
    }
    const fg = new THREE.BufferGeometry;
    fg.setAttribute("position", new THREE.Float32BufferAttribute(fp, 3)),
    fg.setAttribute("uv", new THREE.Float32BufferAttribute(fu, 2)),
    fg.setIndex(fi), fg.computeVertexNormals();
    const fm = mesh(fg, opt.mat || MATF.shingle);
    fm.material.side = THREE.DoubleSide, g.add(fm)
  }

  /* the rake ropes — the thick felted edge, and the reason it reads as felt */
  const rr2 = Math.max(.035, Math.min(w, d) * .028);
  for (const end of [0, 1]) {
    const z0 = end ? -.05 : .05, pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, sg = u < .5 ? -1 : 1, t = Math.abs(u - .5) * 2,
        p = P(sg * t, end);
      pts.push(p.clone().add(new THREE.Vector3(sg * .02, .012, z0)))
    }
    g.add(feltRope(pts, rr2, opt.trimMat || MATF.felt, !1, 30))
  }
  /* the ridge bead */
  {
    const pts = [];
    for (let i = 0; i <= 14; i++) pts.push(P(0, i / 14).add(new THREE.Vector3(0, rr2 * .55, 0)));
    g.add(feltRope(pts, rr2 * .82, opt.trimMat || MATF.felt, !1, 16))
  }
  /* the eave beads */
  for (const side of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 14; i++) pts.push(P(side, i / 14).add(new THREE.Vector3(side * .012, -.022, 0)));
    g.add(feltRope(pts, rr2 * .74, opt.trimMat || MATF.felt, !1, 16))
  }

  /* what finishes an eave corner. a scroll on every house in the parish
     reads as a stamp, not a hand — so there are five of these and most
     houses get something quieter than a curl. */
  const CORNER = opt.corner === undefined ? "scroll" : opt.corner;
  if (CORNER && CORNER !== "none") {
    const vr = Math.max(.13, Math.min(w, d) * .10),
      TM = opt.trimMat || MATF.felt,
      CR = fseed("corner" + key);
    for (const end of [0, 1])
      for (const side of [-1, 1]) {
        const e = P(side, end),
          px = e.x + side * vr * .18,
          py = e.y - vr * .20,
          pz = gz[end] + (end ? -.16 : .16);
        if (CORNER === "scroll") {
          /* the coil belongs OUTBOARD, with the tail sweeping back up the
             rake. mirrored in the curve rather than by a negative scale,
             so the tube keeps its winding and its lighting. */
          const v = fairyVolute(vr, 2.2, Math.max(.028, vr * .19), TM, -side);
          v.position.set(px, py, pz), v.rotation.z = side * .5, g.add(v)
        } else if (CORNER === "drop") {
          /* a felt pendant, the way a hem gathers into a teardrop */
          const dr = new THREE.Group,
            bead = sph(vr * .34, TM, 8, 7);
          bead.scale.y = 1.7, bead.position.y = -vr * .5, dr.add(bead);
          const tip = sph(vr * .17, TM, 7, 6);
          tip.position.y = -vr * .95, dr.add(tip);
          const cap = mesh(new THREE.TorusGeometry(vr * .3, vr * .1, 6, 12), TM);
          cap.rotation.x = Math.PI / 2, dr.add(cap);
          dr.position.set(px, py, pz), g.add(dr)
        } else if (CORNER === "leaf") {
          /* a spray of leaves, as if the roof had gone to seed at the corner */
          for (let k = 0; k < 4; k++) {
            const lf = sph(vr * (.20 + CR() * .16), k % 2 ? MATF.moss : MATF.mossHi, 6, 5);
            lf.scale.set(1.6, .42, 1), lf.castShadow = !1,
            lf.position.set(px + side * CR() * vr * .5, py - CR() * vr * .7,
              pz + (CR() - .5) * vr * .8),
            lf.rotation.z = side * (.3 + CR()), lf.rotation.y = CR() * TAU, g.add(lf)
          }
          const st = sph(vr * .16, TM, 7, 6);
          st.position.set(px, py, pz), g.add(st)
        } else if (CORNER === "bud") {
          /* a plain felt bud — the quietest finish, and the right one on
             anything that wants to look civic rather than enchanted */
          const b2 = sph(vr * .30, TM, 9, 7);
          b2.scale.y = 1.25, b2.position.set(px, py - vr * .12, pz), g.add(b2);
          const nk = mesh(new THREE.TorusGeometry(vr * .24, vr * .075, 6, 12), TM);
          nk.rotation.x = Math.PI / 2, nk.position.set(px, py + vr * .16, pz), g.add(nk)
        }
      }
  }
  /* a rose in the front gable — the one thing that turns a blank felt
     triangle into a face. sized against the rake, never against hope. */
  if (opt.rose) {
    const yT = ph * .40;
    let hw = 0;
    for (let i = 0; i <= 60; i++) {
      const q = P(i / 60, 1);
      if (q.y >= yT) hw = Math.max(hw, Math.abs(q.x))
    }
    const Rr = Math.min(hw * .58, ph * .30);
    if (Rr > .12) {
      const zF = gz[1] + .05;
      g.add(fairyGableRose(Rr, yT, zF, 1));
      /* a felt eyebrow over the rose, and two attic lights low on the face
         where the gable is wide enough to hold them — glass that glows at
         night, so no gable is ever a blank field again */
      const hd = mesh(new THREE.TorusGeometry(Rr * 1.3, Math.max(.035, Rr * .09), 7, 24, Math.PI * .86), opt.trimMat || MATF.felt);
      hd.rotation.z = Math.PI * .07, hd.position.set(0, yT + Rr * .06, zF + .02), g.add(hd);
      if (hw > 1.05 && opt.attic !== !1) for (const sd3 of [-1, 1]) {
        const lc = fairyLancet(.26, .44, { stained: 2, shutters: !1 });
        lc.scale.setScalar(.62), lc.position.set(sd3 * hw * .5, .05, zF + .01), g.add(lc)
      }
      /* the face beneath her rose was the parish's last blank ground — now
         every rose roof carries the mother house's own crest: wings spread
         at its sides, a pendant moon beneath, garland swags out to the
         rakes, gold on each shoulder. everything is sized off the rose,
         and the prng is never touched. */
      if (opt.dress !== !1) {
        const rx = Rr * 1.08,
          sc = Math.max(.15, Math.min(Rr * .92, (hw * .96 - rx) / .95)),
          WG = spreadWings(sc, .36, rx);
        WG.position.set(0, yT - Rr * .12, zF + .012), g.add(WG);
        const pj = nmGem(Math.max(.046, Rr * .12), 15222671);
        pj.position.set(0, yT - Rr - .08, zF + .02), g.add(pj);
        const pc = flatExtrude(NM_CRESCENT, .022, moonGlowMat, !1);
        pc.scale.setScalar(Math.max(.13, Rr * .55)), pc.rotation.z = -Math.PI / 2, pc.position.set(0, yT - Rr - .16 - Rr * .42, zF + .02), g.add(pc);
        /* pearl garlands — white and gold beads swagged from the rose's
           shoulders out to the rakes, the mother house's eave lace made
           to hang. felt rope vanished pink-on-pink; pearls carry. */
        for (const sd2 of [-1, 1]) {
          const ax2 = Rr * .55, ay2 = yT - Rr * .5, bx2 = hw * .8, by2 = yT + Rr * .12;
          for (let k2 = 0; k2 <= 7; k2++) {
            const u2 = k2 / 7,
              bd2 = k2 % 2 ? sph(Math.max(.026, Rr * .075), MAT.gold, 6, 5) : sph(Math.max(.032, Rr * .095), MAT.white, 6, 5);
            bd2.castShadow = !1, bd2.position.set(sd2 * (ax2 + u2 * (bx2 - ax2)), ay2 + u2 * (by2 - ay2) - Math.sin(u2 * Math.PI) * Rr * .26, zF + .02), g.add(bd2)
          }
          const dp2 = sph(Math.max(.03, Rr * .085), MAT.gold, 6, 5);
          dp2.castShadow = !1, dp2.position.set(sd2 * (ax2 + .5 * (bx2 - ax2)), (ay2 + by2) / 2 - Rr * .26 - Rr * .16, zF + .02), g.add(dp2);
          const sj2 = nmGem(Math.max(.038, Rr * .105), 9072824);
          sj2.position.set(sd2 * hw * .86, yT + Rr * .14, zF + .015), g.add(sj2)
        }
        /* a bead-lace row along the eave line, tracing the face's hem */
        {
          let hw0 = 0;
          for (let i2 = 0; i2 <= 40; i2++) {
            const q2 = P(-1 + i2 / 20 * 1, 1);
            q2.y <= .3 && (hw0 = Math.max(hw0, Math.abs(q2.x)))
          }
          hw0 = Math.max(hw0, hw);
          for (let k2 = 0; k2 < 11; k2++) {
            const lx2 = (k2 - 5) / 5 * hw0 * .74,
              lb2 = k2 % 2 ? sph(Math.max(.024, Rr * .065), MAT.gold, 6, 5) : sph(Math.max(.03, Rr * .08), MAT.white, 6, 5);
            lb2.castShadow = !1, lb2.position.set(lx2, .12, zF + .02), g.add(lb2)
          }
        }
      }
    }
  }
  /* moss in the lee of the ridge, because nothing of hers stays clean */
  if (opt.moss !== !1) {
    const R = S.R;
    for (let i = 0; i < 2; i++) {
      const v = .22 + R() * .56, s = (R() < .5 ? -1 : 1) * (.4 + R() * .22),
        p = P(s, v), m = fairyMoss(Math.max(.055, w * .038), .04, null, R);
      m.position.copy(p), g.add(m)
    }
  }
  return g
}

// Original castle.html:1326
function fairyLancet(w, h, opt) {
  opt = opt || {};
  const g = new THREE.Group, sh = gothicArch(w, h);

  const pad = mesh(new THREE.ExtrudeGeometry(sh, { depth: .05, bevelEnabled: !1 }), opt.padMat || MATF.feltHi);
  pad.position.z = -.006, g.add(pad);

  const lit = mesh(new THREE.ShapeGeometry(sh), MATF.lit, !1, !1);
  lit.scale.setScalar(.99), lit.position.z = .046, g.add(lit);

  /* the castle's own stained glass, cut to a pointed head */
  const gm = stainedMatFor(opt.stained === 1 ? 1 : 2, w, h * .86),
    pane = mesh(new THREE.ShapeGeometry(sh), gm, !1, !1);
  {
    const geo = pane.geometry;
    geo.computeBoundingBox();
    const b = geo.boundingBox, sx = b.max.x - b.min.x, sy = b.max.y - b.min.y,
      uv = geo.attributes.uv, ps = geo.attributes.position;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (ps.getX(i) - b.min.x) / sx, (ps.getY(i) - b.min.y) / sy);
    uv.needsUpdate = !0
  }
  pane.scale.setScalar(.955), pane.position.z = .052, g.add(pane);

  /* saddle bars — what a glazier actually ties a lancet to */
  for (const f of [.32, .72]) {
    const bar = box(w * .95, .011, .013, MATF.came, !1);
    bar.position.set(0, h * f, .062), g.add(bar)
  }

  /* the felted surround, proud of everything */
  const rp = sh.getPoints(20).map(p => new THREE.Vector3(p.x, p.y, 0));
  const frame = feltRope(rp, Math.max(.03, w * .085), opt.trimMat || MATF.felt, !0, 26);
  frame.position.z = .052, g.add(frame);

  const sill = box(w * 1.26, .055, .14, opt.trimMat || MATF.felt);
  sill.position.set(0, -.03, .086), g.add(sill);

  /* the trough of blooms, kept from the parish's own windows */
  if (opt.flowerBox) {
    const tr = box(w * 1.2, .13, .17, opt.trimMat || MATF.felt);
    tr.position.set(0, -.14, .11), g.add(tr);
    const R = fseed("fb" + w.toFixed(2) + h.toFixed(2)), pts = [];
    for (let i = 0; i < 6; i++) pts.push({
      x: -w / 2 + (i + .5) * (w / 6) + (R() - .5) * .06,
      y: -.075 + R() * .04, z: .13 + (R() - .5) * .06,
      s: .05 + R() * .025,
      c: FLOWER_COLORS[(i * 3 + (R() < .5 ? 0 : 1)) % FLOWER_COLORS.length]
    });
    for (let i = 0; i < 4; i++) pts.push({
      x: (R() - .5) * w, y: -.09, z: .15, s: .045 + R() * .015, c: PAL.hedge
    });
    g.add(makeBloomCluster(pts))
  }
  return g
}

// Original castle.html:1385
function fairyBelt(w, d, y, gap, mat) {
  const g = new THREE.Group, hx = w / 2 + .04, hz = d / 2 + .04,
    r = Math.max(.04, Math.min(w, d) * .028);
  g.add(feltRope([
    new THREE.Vector3(hx, y, hz), new THREE.Vector3(hx, y, 0), new THREE.Vector3(hx, y, -hz),
    new THREE.Vector3(0, y, -hz),
    new THREE.Vector3(-hx, y, -hz), new THREE.Vector3(-hx, y, 0), new THREE.Vector3(-hx, y, hz)
  ], r, mat || MATF.felt, !1, 26));
  if (gap > 0 && gap < hx)
    for (const s of [-1, 1]) {
      const run = cyl(r, r, hx - gap, mat || MATF.felt, 8);
      run.rotation.z = Math.PI / 2, run.position.set(s * (hx + gap) / 2, y, hz), g.add(run);
      const cap = sph(r * 1.24, mat || MATF.felt, 9, 7);
      cap.position.set(s * gap, y, hz), g.add(cap)
    }
  else {
    const run = cyl(r, r, hx * 2, mat || MATF.felt, 8);
    run.rotation.z = Math.PI / 2, run.position.set(0, y, hz), g.add(run)
  }
  return g
}

// Original castle.html:1408
function fairyPorch(w, y, z, key) {
  const g = new THREE.Group, R = fseed("porch" + key),
    r0 = w * .42, r1 = w * .80, NA = 16, NR = 4, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NA; i++) {
    const t = i / NA, a = (t - .5) * Math.PI * 1.06;
    for (let j = 0; j <= NR; j++) {
      const u = j / NR, rad = r0 + u * (r1 - r0), sc = 1 + Math.sin(a * 7) * .05 * u;
      pos.push(Math.sin(a) * rad * sc,
        y + .30 - Math.pow(u, 1.35) * .30 + Math.cos(a * 3) * .012,
        z + Math.cos(a) * rad * sc * .82),
      uv.push(t * 2.2, (1 - u) * 1.2)
    }
  }
  for (let i = 0; i < NA; i++)
    for (let j = 0; j < NR; j++) {
      const a = i * (NR + 1) + j, b = a + NR + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const geo = new THREE.BufferGeometry;
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)),
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)),
  geo.setIndex(idx), geo.computeVertexNormals();
  const hood = mesh(geo, MATF.shingle);
  hood.material.side = THREE.DoubleSide, g.add(hood);
  const rim = [];
  for (let i = 0; i <= 30; i++) {
    const t = i / 30, a = (t - .5) * Math.PI * 1.06, rad = r1 * (1 + Math.sin(a * 7) * .05);
    rim.push(new THREE.Vector3(Math.sin(a) * rad, y + .012, z + Math.cos(a) * rad * .82))
  }
  g.add(feltRope(rim, Math.max(.03, w * .06), MATF.felt, !1, 26));
  for (const s of [-1, 1]) {
    const br = fairyVolute(w * .18, 1.5, Math.max(.026, w * .05), MATF.felt);
    br.position.set(s * r0 * 1.15, y - .26, z + .10), br.rotation.z = s > 0 ? Math.PI : 0, br.scale.x = s, g.add(br)
  }
  for (let k = 0; k < 3; k++) {
    const a = (R() - .5) * 1.7, m = fairyMoss(w * .09, .04, null, R);
    m.position.set(Math.sin(a) * r1 * .9, y + .02, z + Math.cos(a) * r1 * .74), g.add(m)
  }
  return g
}

// Original castle.html:1451
function fairyLobedCap(r0, h, key, opt) {
  opt = opt || {};
  /* the ripple and sag are charm at turret size and collapse at tower size —
     so their amplitude bows to the radius: big cones stand up straight */
  const lean = opt.lean || 0, twist = opt.twist || 0,
    CALM = opt.calm != null ? opt.calm : Math.min(1, .55 / Math.max(.35, r0)),
    BELLY = opt.belly == null ? (r0 > 1.2 ? .93 : .82) : opt.belly,
    CN = opt.cn || (r0 > 1.2 ? 18 : 12), CS = opt.cs || (r0 > 1.2 ? 28 : 16), pos = [], uv = [], idx = [], TILE = 1.02;
  for (let i = 0; i <= CN; i++) {
    const t = i / CN, y = t * h,
      rad = r0 * Math.pow(1 - t, BELLY),
      bend = Math.pow(t, 1.7) * lean, tw = t * twist;
    for (let j = 0; j <= CS; j++) {
      const a2 = j / CS * TAU + tw,
        rip = 1 + (Math.sin(a2 * 5 + t * 3) * .085 + Math.sin(a2 * 9 + 1.4) * .04) * Math.pow(1 - t, 1.3) * CALM,
        sag = Math.sin(a2 * 5 + t * 3) * r0 * .12 * Math.pow(1 - t, 2) * CALM;
      pos.push(Math.cos(a2) * rad * rip + bend, y + sag, Math.sin(a2) * rad * rip + bend * .35),
      uv.push(j / CS * TAU * r0 / TILE, (1 - t) * h / TILE)
    }
  }
  for (let i = 0; i < CN; i++)
    for (let j = 0; j < CS; j++) {
      const p0 = i * (CS + 1) + j, p1 = p0 + CS + 1;
      idx.push(p0, p1, p0 + 1, p1, p1 + 1, p0 + 1)
    }
  const geo = new THREE.BufferGeometry;
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)),
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)),
  geo.setIndex(idx), geo.computeVertexNormals();
  const g = new THREE.Group;
  g.add(mesh(geo, opt.mat || MATF.shingle));
  /* the rolled brim: the thing that stops a spire reading as a traffic cone */
  if (opt.brim !== !1) {
    const b = mesh(new THREE.TorusGeometry(r0 * 1.1, r0 * .15, 7, 20), opt.trimMat || MATF.felt);
    b.rotation.x = Math.PI / 2, g.add(b)
  }
  if (opt.moss !== !1) {
    const R = fseed("cap" + key);
    for (let i = 0; i < 2; i++) {
      const a2 = R() * TAU, t = .1 + R() * .3,
        m = fairyMoss(r0 * .16, r0 * .1, null, R);
      m.position.set(Math.cos(a2) * r0 * (1 - t) * .95, t * h, Math.sin(a2) * r0 * (1 - t) * .95), g.add(m)
    }
  }
  return g
}

// Original castle.html:1500
function fairyCone(r, h, key, opt) {
  const g = new THREE.Group,
    c = fairyLobedCap(r, h, key, opt || {});
  return c.position.y = -h / 2, g.add(c), g
}

// Original castle.html:1508
function fairyTurret(h, r0, lean, twist, key) {
  const g = new THREE.Group, prof = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    prof.push(new THREE.Vector2(r0 * (1 - t * .28 + Math.sin(t * 5.2) * .045), t * h * .58))
  }
  const shaft = mesh(new THREE.LatheGeometry(prof, 40), MATF.wall);
  g.add(shaft);
  const CN = 28, CS = 40, pos = [], uv = [], idx = [];
  for (let i = 0; i <= CN; i++) {
    const t = i / CN, y = h * .58 + t * h * .62,
      rad = r0 * 1.16 * Math.pow(1 - t, .82), bend = Math.pow(t, 1.7) * lean, tw = t * twist;
    for (let j = 0; j <= CS; j++) {
      const a = j / CS * TAU + tw,
        rip = 1 + (Math.sin(a * 5 + t * 3) * .085 + Math.sin(a * 9 + 1.4) * .04) * Math.pow(1 - t, 1.3),
        sag = Math.sin(a * 5 + t * 3) * .05 * Math.pow(1 - t, 2);
      pos.push(Math.cos(a) * rad * rip + bend, y + sag, Math.sin(a) * rad * rip + bend * .35),
      uv.push(j / CS * TAU * r0 * 1.16 / .62, (1 - t) * h * .62 / .62)
    }
  }
  for (let i = 0; i < CN; i++)
    for (let j = 0; j < CS; j++) {
      const a = i * (CS + 1) + j, b = a + CS + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  const cg = new THREE.BufferGeometry;
  cg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)),
  cg.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)),
  cg.setIndex(idx), cg.computeVertexNormals();
  g.add(mesh(cg, MATF.shingle));
  const brim = mesh(new THREE.TorusGeometry(r0 * 1.12, r0 * .17, 7, 18), MATF.felt);
  brim.rotation.x = Math.PI / 2, brim.position.y = h * .58, g.add(brim);
  /* a round light in the shaft, glazed with the castle's rose */
  const port = mesh(new THREE.TorusGeometry(r0 * .30, r0 * .09, 6, 14), MATF.felt);
  port.position.set(0, h * .40, r0 * .99), g.add(port);
  const pg = mesh(new THREE.CircleGeometry(r0 * .29, 16), stainedMatFan, !1, !1);
  return pg.position.set(0, h * .40, r0 * 1.0), g.add(pg), g
}

// Original castle.html:1548
function windowArched(t, s, o = {}) {
  const e = new THREE.Group;
  e.userData.win = { w: t, h: s, stained: o.stained || 0 };
  const
    n = .09,
    a = .1,
    i = archShape(t + n * 2, s + n);
  i.holes.push(new THREE.Path().setFromPoints(archShape(t, s - n * .4).getPoints(24).map(f => new THREE.Vector2(f.x, f.y + n * .5)).reverse()));
  const r = flatExtrude(i, a, o.frameMat || MAT.trim);
  if (r.position.z = -a / 2, e.add(r), o.stained) {
    const f = stainedMatFor(o.stained === 2 ? 2 : 1, t, s - n * .4),
      p = mesh(new THREE.ShapeGeometry(archShape(t, s - n * .4)), f, !1, !1);
    p.position.set(0, n * .5, .014), e.add(p)
  } else {
    const f = flatExtrude(archShape(t, s - n * .4), .03, paneMat);
    f.position.set(0, n * .5, .012), e.add(f)
  }
  const c = box(.035, s * .82, .02, MAT.trim, !1);
  c.position.set(0, s * .48, .052), e.add(c);
  const d = box(t * .94, .035, .02, MAT.trim, !1);
  d.position.set(0, s * .52, .052), e.add(d);
  const l = box(t + n * 2.6, .09, .16, o.frameMat || MAT.trim);
  if (l.position.set(0, -.02, .03), e.add(l), o.shutters !== !1) {
    const f = t * .46,
      p = s * .78,
      h = mergeGeoms([G(new THREE.BoxGeometry(f, p, .045)), G(new THREE.BoxGeometry(f * .8, .04, .06), 0, p * .29), G(new THREE.BoxGeometry(f * .8, .04, .06), 0, -p * .29)]);
    for (const E of [-1, 1]) {
      const u = mesh(h, shutterMat);
      /* the shutter body is .045 deep, so sitting it at .02 put its back face
         2.5mm behind the wall — flush enough for the two to fight and flicker
         as the camera moves. stand it clear of the render instead. */
      u.position.set(E * (t / 2 + n + f / 2 - .02), s * .44, .055), e.add(u);
      const y = flatExtrude(heartShape(.062), .02, MAT.trim);
      y.position.set(u.position.x, s * .62, .088), e.add(y)
    }
  }
  if (o.moonCrown) {
    const f = new THREE.Group,
      p = flatExtrude(NM_CRESCENT, .045, moonGlowMat, !1);
    p.scale.setScalar(.52), p.rotation.z = -Math.PI / 2, f.add(p);
    const h = sph(.06, M(16777215, .16, .35), 10, 8);
    h.position.set(0, .1, .022), f.add(h);
    for (const E of [-1, 1]) {
      const u = mesh(new THREE.OctahedronGeometry(.028), MAT.gold, !1, !1);
      u.position.set(E * .13, .24, .022), f.add(u)
    }
    f.position.set(0, s + n * .9, .03), e.add(f)
  } else if (o.wings) {
    const f = wingPairMolding(t * .72, {
      ball: !0
    });
    f.position.set(0, s + n * .6, .02), e.add(f);
    const p = flatExtrude(NM_CRESCENT, .035, moonGlowMat, !1);
    p.scale.setScalar(.14), p.rotation.z = -Math.PI / 2, p.position.set(0, s - .005, .055), e.add(p)
  }
  if (o.flowerBox) {
    const f = box(t + .14, .13, .17, MAT.woodDark);
    f.position.set(0, -.12, .06), e.add(f);
    const p = [],
      h = 6;
    for (let E = 0; E < h; E++) p.push({
      x: -t / 2 + (E + .5) * (t / h) + rr(-.03, .03),
      y: -.035 + rr(0, .04),
      z: .08 + rr(-.03, .03),
      s: rr(.05, .075),
      c: FLOWER_COLORS[(E * 3 + Math.floor(rnd() * 2)) % FLOWER_COLORS.length]
    });
    for (let E = 0; E < 4; E++) p.push({
      x: rr(-t / 2, t / 2),
      y: -.05,
      z: .1,
      s: rr(.045, .06),
      c: PAL.hedge
    });
    e.add(makeBloomCluster(p))
  }
  return e
}

// Original castle.html:1627
function wallpaperRound(t) {
  /* the same pinstripe the walls wear, wrapped: whole repeats around the
     drum so the seam never shows, one material per drum size */
  const k = Math.max(3, Math.round(2 * Math.PI * t / 1.2));
  return wallpaperRound.c = wallpaperRound.c || {}, wallpaperRound.c[k] || (wallpaperRound.c[k] = wallpaperFor(k))
}

// Original castle.html:1634
function towerRound(t, s, o = {}) {
  const e = new THREE.Group,
    n = cyl(t, t * 1.05, s, t >= .6 && typeof wallpaperFor == "function" ? wallpaperRound(t) : MAT.wall, 48);
  n.position.y = s / 2, e.add(n);
  const a = cyl(t * 1.13, t * 1.19, .55, MAT.cream, 48);
  a.position.y = .275, e.add(a);
  for (const h of o.bands || [KEEP.f1, KEEP.f2])
    if (h < s - .4) {
      const E = mesh(new THREE.TorusGeometry(t * 1.02, .045, 10, 48), MAT.trim, !1);
      E.rotation.x = Math.PI / 2, E.position.y = h, e.add(E)
    } const i = cyl(t * 1.2, t * 1.02, .34, MAT.trim, 48);
  i.position.y = s - .17, e.add(i);
  for (const h of o.windows || []) {
    const E = windowArched(h.w || .34, h.h || .62, {
      shutters: h.shutters !== !1,
      flowerBox: !!h.box,
      stained: h.stained || 0,
      wings: !!h.wings
    });
    E.scale.setScalar(h.sc || .92);
    /* the drum tapers — wider at its foot than under its cone — so a window hung at
       the top radius sits inside the wall lower down, and the wall swallowed the
       middle of its glass. each window is hung on the drum's own radius at its height. */
    const u = h.a, ry = t * 1.05 - t * .05 * Math.min(1, Math.max(0, h.y / s)) + .008;
    E.position.set(Math.sin(u) * ry, h.y, Math.cos(u) * ry), E.rotation.y = u, e.add(E)
  }
  /* a small stained oculus under the capital — the tower's one eye */
  if (o.oculus) for (const q of [].concat(o.oculus)) {
    const g2 = new THREE.Group, R2 = q.r || .2;
    g2.add(mesh(new THREE.CircleGeometry(R2 * 1.06, 18), MATF.lit, !1, !1));
    const gl2 = mesh(new THREE.CircleGeometry(R2, 24), stainedMatFan, !1, !1);
    gl2.position.z = .012, g2.add(gl2);
    const rg2 = mesh(new THREE.TorusGeometry(R2, .034, 8, 24), MAT.gold, !1);
    rg2.position.z = .016, g2.add(rg2);
    for (let k = 0; k < 4; k++) {
      const sp = box(.014, R2 * 1.9, .012, MAT.gold, !1);
      sp.rotation.z = k * Math.PI / 4, sp.position.z = .018, g2.add(sp)
    }
    const hb = sph(R2 * .17, MAT.gold, 8, 6);
    hb.scale.z = .5, hb.position.z = .022, g2.add(hb);
    const rq = t * 1.05 - t * .05 * Math.min(1, Math.max(0, q.y / s)) + .012;
    g2.position.set(Math.sin(q.a) * rq, q.y, Math.cos(q.a) * rq), g2.rotation.y = q.a, e.add(g2)
  }
  /* the capital: a necking ring, a dentil course, a gold fillet — so the
     drum finishes under its cone instead of just stopping */
  if (t >= .6) {
    const nk = mesh(new THREE.TorusGeometry(t * 1.03, .028, 10, 48), MAT.trim, !1);
    nk.rotation.x = Math.PI / 2, nk.position.y = s - .62, e.add(nk);
    const dg = [];
    for (let k = 0; k < 22; k++) {
      const a2 = k / 22 * TAU;
      dg.push(G(new THREE.BoxGeometry(t * .11, t * .1, t * .12), Math.sin(a2) * t * 1.04, s - .5, Math.cos(a2) * t * 1.04, 0, a2, 0))
    }
    e.add(mesh(mergeGeoms(dg), MAT.trim, !1, !1));
    const gf = mesh(new THREE.TorusGeometry(t * 1.06, .022, 10, 48), MAT.gold, !1);
    gf.rotation.x = Math.PI / 2, gf.position.y = s - .37, e.add(gf)
  }
  const r = o.coneH || t * 2.6,
    c = fairyCone(t * 1.26, r, "tw" + t.toFixed(2) + s.toFixed(2) + r.toFixed(2),
      { cn: 28, cs: 48, twist: .22, lean: .015, moss: !1 });
  c.position.y = s + r / 2 - .02, e.add(c);
  const d = mesh(new THREE.TorusGeometry(t * 1.2, .05, 10, 48), MAT.cream, !1);
  d.rotation.x = Math.PI / 2, d.position.y = s + .02, e.add(d);

  const l = new THREE.Group,
    f = sph(.09, MAT.gold, 12, 10);
  f.position.y = .05, l.add(f);
  const p = cone(.045, .3, MAT.gold, 10);
  return p.position.y = .25, l.add(p), l.position.y = s + r, e.add(l), o.flag && addPennant(e, 0, s + r + .28, 0, o.flagColor || PAL.roof), e.userData.topY = s + r, e
}

// Original castle.html:1704
__mark("garden");

// Original castle.html:1705
const castle = new THREE.Group;

// Original castle.html:1706
world.add(castle);

// Original castle.html:1707
{
  const {
    W: t,
    D: s,
    H: o,
    cz: e,
    wallT: n,
    frontZ: a,
    backZ: i
  } = KEEP, r = box(t + .5, .5, s + .5, MAT.cream);
  r.position.set(0, .25, e), castle.add(r);
  for (const b of [-1, 1]) {
    const w = new THREE.Group,
      I = box(n, o, s, wpSideMat);
    I.position.set(b * (t / 2 - n / 2), o / 2, e), castle.add(I);
    for (let g = 0; g < 3; g++)
      for (let k = 0; k < 2; k++) {
        const z = windowArched(.5, .9, {
          shutters: !0,
          flowerBox: g === 1,
          stained: g > 0 ? 2 : 0
        });
        z.position.set(b * t / 2, g * KEEP.f1 + 1.18, e - .9 + k * 1.9), z.rotation.y = b * Math.PI / 2, castle.add(z)
      }
    castle.add(w)
  }
  const c = box(t, o, n, wpBackMat);
  c.position.set(0, o / 2, i + n / 2), castle.add(c);
  for (let b = 0; b < 3; b++)
    for (let w = 0; w < 3; w++) {
      const I = windowArched(.55, .95, {
        shutters: !0,
        flowerBox: b === 1 && w === 1,
        stained: b > 0 ? 2 : 0
      });
      I.position.set(-2.4 + w * 2.4, b * KEEP.f1 + 1.18, i), I.rotation.y = Math.PI, castle.add(I)
    }
  for (const b of [-1, 1]) {
    const w = box(t / 2 - 3.6, o, n, wpStripMat);
    w.position.set(b * (3.6 + (t / 2 - 3.6) / 2), o / 2, a + n / 2 - .13), castle.add(w)
  }
  const d = box(t + .44, .16, s + .44, MAT.trim);
  d.position.set(0, o + .08, e), castle.add(d);
  const l = box(t + .3, .5, .12, MAT.wallHi);
  l.position.set(0, o + .41, a + .09), castle.add(l);
  const f = l.clone();
  f.position.z = i - .09, castle.add(f);
  for (const b of [-1, 1]) {
    const w = box(.12, .5, s + .3, MAT.wallHi);
    w.position.set(b * (t / 2 + .09), o + .41, e), castle.add(w)
  }
  const p = merlonRow(t + .2);
  p.position.set(0, o + .86, a + .09), castle.add(p);
  const h = merlonRow(t + .2);
  h.position.set(0, o + .86, i - .09), castle.add(h);
  const E = merlonRow(s + .1);
  E.rotation.y = Math.PI / 2, E.position.set(-(t / 2 + .09), o + .86, e), castle.add(E);
  const u = merlonRow(s + .1);
  u.rotation.y = Math.PI / 2, u.position.set(t / 2 + .09, o + .86, e), castle.add(u);
  /* ═══ the great roof ═══════════════════════════════════════════════
     the mother house kept a flat scalloped deck while the whole parish
     learned to sweep. this is the same roof in the parish's language: an
     ogee mansard, steep off the ridge and flaring late to a lobed hem,
     springing from BEHIND the crenellation so the parapet still reads as
     the castle's own — the crown stays, the cap changes. */
  const y = t - .7,
    m = s - .55,
    x = 3.15,
    /* the merlons top out at o+1.06, so the roof springs from just above
       them and flares OUT over the crown rather than hiding inside it —
       the parapet becomes the base course the great hat sits on */
    KBASE = o + 1.12,
    T = fairyRoof(m + .7, y / 1.06, x, "keep", {
      over: 1.14,
      corner: "drop",
      moss: !1,          /* the great roof stays clean — she keeps it swept */
      wave: .028,        /* stately, not drunk: the big span earns a calm hem */
      ns: 68, nv: 60
    });
  T.rotation.y = Math.PI / 2, T.position.set(0, KBASE, e), castle.add(T);
  const RIDGE = KBASE + x + 1.35 * (Math.min(m + .7, y / 1.06) * .085);
  const H = cyl(.05, .05, y + .3, MAT.gold, 10);
  H.rotation.z = Math.PI / 2, H.position.set(0, RIDGE + .04, e), castle.add(H);
  window.__KEEP_RIDGE = RIDGE;
  for (const b of [-1, 1]) {
    const w = cone(.05, .34, MAT.gold, 8);
    w.position.set(b * (y / 2 + .1), RIDGE + .22, e), castle.add(w)
  }
  /* two chimney stacks on the rear pitch — every cottage in the parish
     has one with a gold collar; the house they all answer to had none */
  for (const cx of [-3.3, 3.3]) {
    const ch = box(.36, RIDGE + .34 - 8.9, .36, MAT.wallHi);
    ch.position.set(cx, (RIDGE + .34 + 8.9) / 2, e - .62), castle.add(ch);
    const cc = box(.44, .08, .44, MAT.gold, !1);
    cc.position.set(cx, RIDGE + .22, e - .62), castle.add(cc);
    const ct = box(.42, .07, .42, MAT.trim, !1);
    ct.position.set(cx, RIDGE + .34, e - .62), castle.add(ct);
    for (const px of [-.09, .09]) {
      const pot = cyl(.05, .06, .12, MAT.trim, 8);
      pot.position.set(cx + px, RIDGE + .43, e - .62), castle.add(pot)
    }
  }
  for (const rb of [-2.1, 2.1]) {
    const rs2 = nmGem(.065, 13212206);
    rs2.position.set(rb, RIDGE + .16, e), castle.add(rs2)
  }

  for (const b of [-2.6, 2.6]) {
    const w = new THREE.Group,
      I = box(.85, .9, .7, MAT.wallHi);
    I.position.y = .45, w.add(I);
    const g = new THREE.Shape;
    g.moveTo(-.55, 0), g.lineTo(0, .5), g.lineTo(.55, 0), g.closePath();
    const k = new THREE.Mesh(new THREE.ExtrudeGeometry(g, {
      depth: .8,
      bevelEnabled: !1
    }), [MAT.wallHi, MATF.shingle]);
    k.castShadow = !0, k.position.set(0, .88, -.4), w.add(k);
    /* solid white bargeboards up the little gable, and a gold bead at its peak */
    for (const dg of [-1, 1]) {
      const bb = box(.74, .085, .07, MAT.trim, !1);
      bb.position.set(dg * .285, 1.15, .38), bb.rotation.z = dg * -.74, w.add(bb)
    }
    const dorb = sph(.05, MAT.gold, 8, 6);
    dorb.position.set(0, 1.47, .1), w.add(dorb);
    /* the tympanum wears her moon now: a crescent of stained glass in a
       gold bezel, a small gold star cradled between its horns */
    const dpr = NM_CRESCENT_W.getPoints(60).map(q2 => new THREE.Vector3(q2.x, q2.y, 0)),
      dgo = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dpr, !0), 84, .075, 8, !0), MAT.gold, !1, !1);
    dgo.scale.setScalar(.39), dgo.rotation.z = Math.PI / 2, dgo.position.set(0, 1.08, .408), w.add(dgo);
    const dgeo = new THREE.ShapeGeometry(NM_CRESCENT_W);
    {
      dgeo.computeBoundingBox();
      const db = dgeo.boundingBox, dsx = db.max.x - db.min.x, dsy = db.max.y - db.min.y,
        duv = dgeo.attributes.uv, dps = dgeo.attributes.position;
      for (let du = 0; du < duv.count; du++) duv.setXY(du, (dps.getX(du) - db.min.x) / dsx, (dps.getY(du) - db.min.y) / dsy);
      duv.needsUpdate = !0
    }
    const dgl = mesh(dgeo, makeStainedMat(stainedTexRose()), !1, !1);
    dgl.scale.setScalar(.39), dgl.rotation.z = Math.PI / 2, dgl.position.set(0, 1.08, .408), w.add(dgl);
    const dst = nmGem(.042, 15222671);
    dst.position.set(0, 1.15, .414), w.add(dst);
    for (const dhb of [-1, 1]) {
      const dhp = sph(.024, MAT.gold, 8, 6);
      dhp.position.set(dhb * .119, 1.234, .408), w.add(dhp)
    }
    const z = mesh(new THREE.CircleGeometry(.27, 20), stainedMatFan, !1, !1);
    z.position.set(0, .5, .36), w.add(z);
    const C = mesh(new THREE.TorusGeometry(.27, .04, 8, 22), MAT.gold, !1);
    C.position.set(0, .5, .365), w.add(C);
    for (let sp2 = 0; sp2 < 4; sp2++) {
      const spk = box(.016, .5, .014, MAT.gold, !1);
      spk.rotation.z = sp2 * Math.PI / 4, spk.position.set(0, .5, .362), w.add(spk)
    }
    for (const cxx of [-1, 1]) for (const cyy of [0, 1]) {
      const cst = nmGem(.03, cyy ? 9072824 : 15222671);
      cst.position.set(cxx * .34, .16 + cyy * .68, .37), w.add(cst)
    }
    for (const df of [-1, 1]) {
      const DF = box(.05, .9, .04, MAT.trim, !1);
      DF.position.set(df * .43, .45, .355), w.add(DF)
    }
    const dwp = spreadWings(.6, .4, .2);
    dwp.position.set(0, .52, .345), w.add(dwp);
    w.position.set(b, o + 1.62, e + m / 2 - .32), castle.add(w)
  }
  {
    /* the great rose dormer — the moon joins the roof's own dormer family */
    const GW = new THREE.Group,
      GI = box(2.15, 2.3, 1.05, MAT.wallHi);
    GI.castShadow = GI.receiveShadow = !0, GI.position.y = 1.15, GW.add(GI);
    for (const gq of [-1, 1]) {
      const gz = box(.15, 2.3, 1.09, MAT.trim, !1);
      gz.position.set(gq * 1.025, 1.15, 0), GW.add(gz)
    }
    const GS2 = new THREE.Shape;
    GS2.moveTo(-1.34, 0), GS2.lineTo(0, 1.02), GS2.lineTo(1.34, 0), GS2.closePath();
    const GK2 = new THREE.Mesh(new THREE.ExtrudeGeometry(GS2, { depth: 1.5, bevelEnabled: !1 }), [MAT.wallHi, MATF.shingle]);
    GK2.castShadow = !0, GK2.position.set(0, 2.28, -.72), GW.add(GK2);
    for (const gg of [-1, 1]) {
      const gbb = box(1.76, .11, .09, MAT.trim, !1);
      gbb.position.set(gg * .67, 2.81, .80), gbb.rotation.z = gg * -.65, GW.add(gbb)
    }
    const GF = .545;
    const gbk = mesh(new THREE.CylinderGeometry(.98, .98, .06, 28), MAT.white);
    gbk.rotation.x = Math.PI / 2, gbk.position.set(0, 1.32, GF - .02), GW.add(gbk);
    const ggl = mesh(new THREE.CircleGeometry(.86, 28), makeStainedMat(stainedTexRose()), !1, !1);
    ggl.position.set(0, 1.32, GF + .015), GW.add(ggl);
    const gtr = mesh(new THREE.TorusGeometry(.88, .055, 8, 30), MAT.gold, !1);
    gtr.position.set(0, 1.32, GF + .02), GW.add(gtr);
    for (let gu = 0; gu < 12; gu++) {
      const gy = gu / 12 * TAU,
        gm = box(.024, .7, .018, MAT.gold, !1);
      gm.position.set(Math.cos(gy) * .49, 1.32 + Math.sin(gy) * .49, GF + .022), gm.rotation.z = gy + Math.PI / 2, GW.add(gm)
    }
    const ghb = mesh(new THREE.CircleGeometry(.14, 18), M(2758710, .6), !1, !1);
    ghb.position.set(0, 1.32, GF + .025), GW.add(ghb);
    const gcr = flatExtrude(NM_CRESCENT, .03, moonGlowMat, !1);
    gcr.scale.setScalar(.21), gcr.rotation.z = .35, gcr.position.set(.012, 1.32, GF + .03), GW.add(gcr);
    for (const gt2 of [-1, 1]) {
      const gst = nmGem(.05, 9072824);
      gst.position.set(gt2 * .94, 2.04, GF + .02), GW.add(gst)
    }
    const gpk = flatExtrude(NM_CRESCENT, .04, moonGlowMat, !1);
    gpk.scale.setScalar(.2), gpk.rotation.z = -Math.PI / 2, gpk.position.set(0, 3.4, .66), GW.add(gpk);
    /* the grand tympanum: her moon over her rose — a great stained
       crescent in a gold bezel, one star held between its horns */
    const gpr = NM_CRESCENT_W.getPoints(60).map(q2 => new THREE.Vector3(q2.x, q2.y, 0)),
      ggo = mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gpr, !0), 96, .065, 8, !0), MAT.gold, !1, !1);
    ggo.scale.setScalar(.56), ggo.rotation.z = Math.PI / 2, ggo.position.set(0, 2.65, .79), GW.add(ggo);
    const ggeo = new THREE.ShapeGeometry(NM_CRESCENT_W);
    {
      ggeo.computeBoundingBox();
      const gb = ggeo.boundingBox, gsx = gb.max.x - gb.min.x, gsy = gb.max.y - gb.min.y,
        guv = ggeo.attributes.uv, gps = ggeo.attributes.position;
      for (let gu2 = 0; gu2 < guv.count; gu2++) guv.setXY(gu2, (gps.getX(gu2) - gb.min.x) / gsx, (gps.getY(gu2) - gb.min.y) / gsy);
      guv.needsUpdate = !0
    }
    const ggl2 = mesh(ggeo, makeStainedMat(stainedTexRose()), !1, !1);
    ggl2.scale.setScalar(.56), ggl2.rotation.z = Math.PI / 2, ggl2.position.set(0, 2.65, .79), GW.add(ggl2);
    for (const gcb of [-1, 0, 1]) {
      const gcm = box(.016, .26, .014, MAT.gold, !1);
      gcm.rotation.z = gcb * .55, gcm.position.set(gcb * .2, 2.47 - Math.abs(gcb) * .05, .795), GW.add(gcm)
    }
    const gst2 = nmGem(.06, 15222671);
    gst2.position.set(0, 2.76, .796), GW.add(gst2);
    for (const ghb of [-1, 1]) {
      const ghp = sph(.03, MAT.gold, 8, 6);
      ghp.position.set(ghb * .171, 2.872, .79), GW.add(ghp)
    }
    const gwp = spreadWings(.82, .4, .95);
    gwp.position.set(0, 1.3, .51), GW.add(gwp);
    GW.position.set(0, o + .96, e + m / 2 - .12), castle.add(GW)
  }
  const v = towerRound(1.35, 9.7, {
    coneH: 3.7,
    flag: !1,
    flagColor: PAL.roof,
    windows: [{
      a: Math.PI,
      y: 7.6, w: .42, h: .8, stained: 2, wings: !0
    }, {
      a: 2.35,
      y: 5.4, w: .42, h: .8, stained: 2, wings: !0
    }, {
      a: -2.35,
      y: 6.5, w: .42, h: .8, stained: 2, wings: !0
    }, {
      a: Math.PI,
      y: 4.4, w: .46, h: .88, box: !0, wings: !0
    }]
  });
  v.position.set(0, 0, i - 1.4), castle.add(v);
  {
    /* the one true flag — her banner on the highest tower: rose field,
       gold border, the flower and the moon riding together. the swallowtail
       is cut in the cloth itself, so the emblem never smooshes. */
    const bt = canvasTex(512, 192, (g2, w2, h2) => {
      g2.clearRect(0, 0, w2, h2);
      g2.fillStyle = "#b95583";
      g2.beginPath();
      g2.moveTo(0, 0), g2.lineTo(w2, 0), g2.lineTo(w2 - 96, h2 / 2), g2.lineTo(w2, h2), g2.lineTo(0, h2), g2.closePath(), g2.fill();
      g2.strokeStyle = "#dfa94e", g2.lineWidth = 14;
      g2.beginPath();
      g2.moveTo(7, 7), g2.lineTo(w2 - 9, 7), g2.lineTo(w2 - 103, h2 / 2), g2.lineTo(w2 - 9, h2 - 7), g2.lineTo(7, h2 - 7), g2.closePath(), g2.stroke();
      g2.strokeStyle = "#fff6ea", g2.lineWidth = 4;
      g2.beginPath();
      g2.moveTo(22, 22), g2.lineTo(w2 - 34, 22), g2.lineTo(w2 - 124, h2 / 2), g2.lineTo(w2 - 34, h2 - 22), g2.lineTo(22, h2 - 22), g2.closePath(), g2.stroke();
      g2.fillStyle = "#fff6ea", g2.font = "bold 92px Georgia, serif", g2.textAlign = "center", g2.textBaseline = "middle";
      g2.fillText("✿", 128, h2 / 2 + 6);
      g2.fillStyle = "#f6d98a", g2.font = "bold 84px Georgia, serif";
      g2.fillText("☽", 250, h2 / 2 + 4)
    });
    const bp3 = cyl(.03, .03, 1.35, MAT.gold, 8);
    bp3.position.set(0, 13.95, i - 1.4), castle.add(bp3);
    const bo3 = sph(.06, MAT.gold, 10, 8);
    bo3.position.set(0, 14.65, i - 1.4), castle.add(bo3);
    const bg3 = new THREE.PlaneGeometry(1.3, .48, 16, 3);
    bg3.translate(.65, 0, 0);
    const bpp = bg3.attributes.position;
    for (let bi = 0; bi < bpp.count; bi++) {
      const bx = bpp.getX(bi);
      bpp.setZ(bi, Math.sin(bx * 2.7) * .04 * (bx / 1.3))
    }
    bg3.computeVertexNormals();
    const bf3 = mesh(bg3, new THREE.MeshStandardMaterial({ map: bt, roughness: .8, side: THREE.DoubleSide, transparent: !0, alphaTest: .5 }), !1, !1);
    bf3.position.set(.03, 14.4, i - 1.4), castle.add(bf3)
  }
  const P = [{
    x: -4.45,
    z: a - .15,
    h: 7.7
  }, {
    x: 4.45,
    z: a - .15,
    h: 7.7
  }, {
    x: -4.45,
    z: i + .15,
    h: 8.35
  }, {
    x: 4.45,
    z: i + .15,
    h: 8.35
  }];
  for (const b of P) {
    /* the front pair's inner faces are swept by the opening doors, so
       their windows stack on the outer flank; the rear pair take a stack
       on the flank and one on the back. every row lines up with the
       facade's floors and wears its brows; each tower keeps one eye
       under the capital, above anything the doors can reach. */
    const fr = b.z > e, fl = Math.sign(b.x) * Math.PI / 2,
      W3 = (a, y3, st) => ({ a, y: y3, w: st ? .42 : .46, h: st ? .8 : .88, stained: st ? 2 : 0, box: !st, wings: !0 }),
      WS = fr ? [W3(fl, .72, 0), W3(fl, 3.3, 1), W3(fl, 5.0, 1)]
        : [W3(fl, .72, 0), W3(fl, 3.0, 1), W3(fl, 4.95, 1), W3(Math.PI, .72, 0), W3(Math.PI, 3.0, 1), W3(Math.PI, 4.95, 1)],
      I = towerRound(1.02, b.h, {
        coneH: 2.95,
        flag: !0,
        flagColor: b.h > 8 ? PAL.gold : PAL.roof,
        windows: WS,
        oculus: { a: fr ? 0 : Math.PI, y: fr ? 6.88 : 7.4, r: .21 }
      });
    I.position.set(b.x, 0, b.z), castle.add(I)
  }
}

// Original castle.html:2032
const PANEL_W = 3.6,
  HINGE_X = 3.6;

// Original castle.html:2035
function buildPanel(t) {
  const s = new THREE.Group,
    o = T => t * T,
    e = box(PANEL_W, KEEP.H, .12, wpPanelMat);
  e.position.set(o(PANEL_W / 2), KEEP.H / 2, -.06), s.add(e);
  for (const T of [KEEP.f1, KEEP.f2]) {
    const H = box(PANEL_W, .14, .05, MAT.trim, !1);
    H.position.set(o(PANEL_W / 2), T, .02), s.add(H)
  }
  const n = box(PANEL_W, .18, .07, MAT.trim, !1);
  n.position.set(o(PANEL_W / 2), KEEP.H - .09, .03), s.add(n);
  for (let T = 0; T < 7; T++) {
    const H = box(T % 2 ? .3 : .42, .42, .06, MAT.wallHi, !1);
    H.position.set(o(.16), .5 + T * .86, .025), s.add(H)
  }
  const a = windowArched(.72, 1.5, {
    shutters: !0,
    flowerBox: !0,
    wings: !0
  });
  a.position.set(o(1.35), .42, .005), s.add(a);
  const i = .62,
    r = 2.05,
    c = box(i + .06, r + .06, .02, M(12146051, .9), !1);
  c.position.set(o(PANEL_W - i / 2), r / 2 + .12, .012), s.add(c);
  const d = box(i, r, .07, M(16776696, .6));
  d.position.set(o(PANEL_W - i / 2), r / 2 + .12, .045), s.add(d);
  const l = [];
  l.push(G(new THREE.BoxGeometry(i * .62, .03, .012), 0, .62), G(new THREE.BoxGeometry(i * .62, .03, .012), 0, -.28)), l.push(G(new THREE.BoxGeometry(.03, .85, .012), -i * .295, .18), G(new THREE.BoxGeometry(.03, .85, .012), i * .295, .18));
  const f = mesh(mergeGeoms(l), MAT.gold, !1);
  f.position.set(o(PANEL_W - i / 2), r / 2 + .12, .085), s.add(f);
  const p = sph(.05, MAT.gold, 10, 8);
  p.position.set(o(PANEL_W - .13), 1.1, .1), s.add(p);
  const h = flatExtrude(heartShape(.13), .035, M(15044526, .85));
  h.position.set(o(PANEL_W - i / 2), 1.72, .085), s.add(h);
  const E = t > 0 ? Math.PI / 2 : 0,
    u = mesh(new THREE.CircleGeometry(.58, 14, E, Math.PI / 2), stainedMatFan, !1);
  u.position.set(o(PANEL_W), r + .17, .02), s.add(u);
  const y = mesh(new THREE.TorusGeometry(.58, .045, 8, 12, Math.PI / 2), MAT.trim, !1);
  y.rotation.z = E, y.position.set(o(PANEL_W), r + .17, .03), s.add(y);
  for (const [T, H, v] of [
      [.7, .032, MAT.white],
      [.8, .026, MAT.gold],
      [.92, .036, MAT.trim]
    ]) {
    const P = mesh(new THREE.TorusGeometry(T, H, 8, 14, Math.PI / 2), v, !1);
    P.rotation.z = E, P.position.set(o(PANEL_W), r + .17, .026), s.add(P)
  }
  const m = box(.035, .56, .02, MAT.trim, !1);
  m.rotation.z = t * Math.PI / 4, m.position.set(o(PANEL_W - .21), r + .38, .025), s.add(m);
  const x = box(.16, r + .12, .18, MAT.white);
  x.position.set(o(PANEL_W - i - .1), (r + .12) / 2 + .1, .03), s.add(x);
  const R = sph(.09, MAT.gold, 10, 8);
  R.position.set(o(PANEL_W - i - .1), r + .28, .05), s.add(R);
  for (const [T, H] of [
      [.95, !1],
      [2.35, !0]
    ]) {
    const v = windowArched(.62, 1.12, {
      shutters: !0,
      flowerBox: !H,
      wings: !0,
      stained: 2
    });
    if (v.position.set(o(T), KEEP.f1 + .72, .005), s.add(v), H) {
      const P = new THREE.Group,
        b = box(1, .09, .42, MAT.trim);
      b.position.set(0, 0, .16), P.add(b);
      const w = box(1, .045, .05, MAT.gold, !1);
      w.position.set(0, .42, .35), P.add(w);
      const I = new THREE.InstancedMesh(new THREE.CylinderGeometry(.026, .036, .38, 8), MAT.trim, 7);
      for (let g = 0; g < 7; g++) I.setMatrixAt(g, _m4.makeTranslation(-.42 + g * .14, .21, .35));
      I.castShadow = !0, P.add(I);
      for (const g of [-1, 1]) {
        const k = box(.045, .42, .05, MAT.gold, !1);
        k.position.set(g * .5, .21, .35), P.add(k)
      }
      P.position.set(o(T), KEEP.f1 + .62, 0), s.add(P)
    }
  }
  for (const T of [.95, 2.35]) {
    const H = windowArched(.54, .92, {
      shutters: !0,
      flowerBox: !0,
      wings: !0,
      stained: 2
    });
    H.position.set(o(T), KEEP.f2 + .62, .005), s.add(H)
  }
  const S = flatExtrude(heartShape(.16), .025, MAT.wallHi);
  return S.position.set(o(PANEL_W - .35), KEEP.f2 + 1.45, .01), s.add(S), s.userData.dir = t, s
}

// Original castle.html:2127
const facadeL = buildPanel(1);

// Original castle.html:2128
facadeL.position.set(-HINGE_X, 0, KEEP.frontZ);

// Original castle.html:2129
const facadeR = buildPanel(-1);

// Original castle.html:2130
facadeR.position.set(HINGE_X, 0, KEEP.frontZ), castle.add(facadeL, facadeR);

// Original castle.html:2131
for (let t = 0; t < 3; t++) {
  const s = mesh(new THREE.CylinderGeometry(1.55 - t * .3, 1.55 - t * .3, .095, 28, 1, !1, -Math.PI / 2, Math.PI), MAT.cream);
  s.position.set(0, .28 - t * .095, KEEP.frontZ + .05), castle.add(s)
}

// Original castle.html:2142
for (const t of [-1, 1]) {
  const s = new THREE.Group,
    o = cyl(.035, .05, 1.25, MAT.goldDeep, 10);
  o.position.y = .62, s.add(o);
  const e = cone(.13, .16, MAT.goldDeep, 8);
  e.position.y = 1.42, s.add(e);
  const n = M(16773839, .4, 0, {
      emissive: 16761962,
      emissiveIntensity: .25
    }),
    a = sph(.085, n, 12, 10);
  a.position.y = 1.3, s.add(a), NIGHT.glowMats.push(n), s.position.set(t * 1.6, 0, .75), castle.add(s)
}

{

// Original castle.html:3712
const s = canvasTex(256, 256, (c, d, l) => {
    const f = d / 2,
      p = l / 2,
      h = ["#e8478f", "#b8a0e8", "#f2b8cf", "#8a70b8", "#f7d9a8", "#e8478f", "#b8a0e8", "#f7d9a8"];
    for (let E = 0; E < 8; E++) {
      const u = E / 8 * TAU,
        y = (E + 1) / 8 * TAU;
      c.fillStyle = h[E], c.beginPath(), c.moveTo(f, p), c.arc(f, p, d * .46, u, y), c.closePath(), c.fill(), c.strokeStyle = "#4a3550", c.lineWidth = 5, c.beginPath(), c.moveTo(f, p), c.lineTo(f + Math.cos(u) * d * .46, p + Math.sin(u) * d * .46), c.stroke()
    }
    c.fillStyle = "#f7d9a8", c.strokeStyle = "#4a3550", c.lineWidth = 5, c.beginPath(), c.arc(f, p, d * .15, 0, TAU), c.fill(), c.stroke(), c.beginPath(), c.arc(f, p, d * .46, 0, TAU), c.stroke()
  });

// Original castle.html:3723
for (const c of [-1, 1]) {
    const d = new THREE.Group,
      l = new THREE.MeshStandardMaterial({
        map: s,
        roughness: .4,
        emissive: 16777215,
        emissiveMap: s,
        emissiveIntensity: .12
      });
    NIGHT.glowMats.push(l);
    const f = mesh(new THREE.CircleGeometry(.52, 24), l, !1);
    d.add(f);
    const p = mesh(new THREE.TorusGeometry(.52, .05, 8, 28), MAT.gold, !1);
    d.add(p);
    for (let sk2 = 0; sk2 < 8; sk2++) {
      const sk3 = box(.02, .95, .016, MAT.gold, !1);
      sk3.rotation.z = sk2 * Math.PI / 8, sk3.position.z = .012, d.add(sk3)
    }
    d.scale.setScalar(1.32), d.position.set(c * 3.97, 8.38, KEEP.cz), d.rotation.y = c * Math.PI / 2, castle.add(d)
  }

}

// Original castle.html:5042
{
  /* the wings that flanked her heart become pearl garlands: strands of
     white and gold swagging from the crest toward the towers, a gold
     heart pendant at each low point — the parish's lace, worn first here */
  for (const a of [-1, 1]) {
    for (let k2 = 0; k2 <= 10; k2++) {
      const u2 = k2 / 10,
        gb2 = k2 % 2 ? sph(.036, MAT.gold, 6, 5) : nmGem(.046, 15222671);
      gb2.castShadow = !1, gb2.position.set(a * (.78 + u2 * 2.72), 6.98 - Math.sin(u2 * Math.PI) * .26, KEEP.frontZ + .12), castle.add(gb2)
    }
    const gh2 = flatExtrude(heartShape(.07), .025, MAT.gold);
    gh2.position.set(a * 2.14, 6.6, KEEP.frontZ + .12), castle.add(gh2)
  }
  for (const a of [-1, 1]) {
    const i = wingPairMolding(.62, {
      ball: !0
    });
    i.position.set(a * (KEEP.W / 2 + .12), 6.62, KEEP.cz), i.rotation.y = a * Math.PI / 2, castle.add(i)
  }
  const s = wingPairMolding(.62, {
    ball: !0
  });
  s.position.set(0, 6.62, KEEP.backZ - .12), s.rotation.y = Math.PI, castle.add(s);
  const o = new THREE.Group,
    e = flatExtrude(heartShape(.2), .09, MAT.gold, !0);
  e.position.set(0, .1, -.045), o.add(e);
  for (const a of [-1, 1]) {
    const i = flatExtrude(NM_WING, .06, wingWhiteMat, !0);
    i.scale.set(a * .85, .85, 1), i.position.set(a * .16, .08, -.03), i.rotation.z = a * .12, o.add(i);
    const r = wingCurl(.85, a, wingRimMat);
    r.position.set(a * .16, .08, .035), r.rotation.z = a * .12, o.add(r)
  }
  const n = sph(.05, MAT.gold, 10, 8);
  n.position.y = .42, o.add(n), o.scale.setScalar(1.05), o.position.set(0, 6.88, KEEP.frontZ + .16), castle.add(o)
}

// Original castle.html:5076
{
  var phaseDisc = function(s) {
    const o = new THREE.Group,
      e = mesh(new THREE.CircleGeometry(.155, 20), M(2758710, .6), !1, !1);
    if (o.add(e), s >= .95) {
      const a = mesh(new THREE.CircleGeometry(.112, 18), moonGlowMat, !1, !1);
      a.position.z = .012, o.add(a)
    } else {
      const a = flatExtrude(crescentShape(.5, .46 - s * .28, .1 + s * .26), .02, moonGlowMat, !1);
      a.scale.setScalar(.26), a.position.z = .012, o.add(a)
    }
    const n = mesh(new THREE.TorusGeometry(.16, .015, 6, 22), MAT.gold, !1, !1);
    return o.add(n), o
  };
  {
    let s = function(a) {
        const r = .112 * (2 * a - 1),
          c = Math.asin(Math.max(-1, Math.min(1, r / .112))),
          d = [],
          l = Math.PI - c,
          f = 2 * Math.PI + c;
        for (let p = 0; p <= 26; p++) {
          const h = l + (f - l) * p / 26;
          d.push([Math.cos(h) * .112, Math.sin(h) * .112])
        }
        return d
      },
      o = function(a, i) {
        const r = [];
        for (let c = 0; c < a.length; c++) {
          const d = a[c],
            l = a[(c + 1) % a.length],
            f = d[0] * i >= 0,
            p = l[0] * i >= 0;
          if (f && r.push(d), f !== p) {
            const h = (0 - d[0]) / (l[0] - d[0]);
            r.push([0, d[1] + (l[1] - d[1]) * h])
          }
        }
        return r
      },
      e = function(a) {
        const i = new THREE.Shape;
        i.moveTo(a[0][0], a[0][1]);
        for (let r = 1; r < a.length; r++) i.lineTo(a[r][0], a[r][1]);
        return i.closePath(), i
      },
      n = function(a, i) {
        const r = new THREE.Group,
          c = i > 0 ? -Math.PI / 2 : Math.PI / 2,
          d = mesh(new THREE.CircleGeometry(.15, 14, c, Math.PI), M(16644852, .45), !1, !1);
        r.add(d);
        const l = o(s(a), i);
        if (l.length > 2) {
          const p = mesh(new THREE.ShapeGeometry(e(l)), moonGlowMat, !1, !1);
          p.position.z = .012, r.add(p)
        }
        const f = mesh(new THREE.TorusGeometry(.152, .012, 6, 14, Math.PI), MAT.gold, !1, !1);
        return f.rotation.z = i > 0 ? -Math.PI / 2 : Math.PI / 2, r.add(f), r
      };
    var litPoly = s,
      clipHalf = o,
      shapeFrom = e,
      medallionHalf = n;
    for (const a of [facadeL, facadeR]) {
      const i = a.userData.dir,
        r = i < 0 ? 1 : -1;
      [
        [5.72, .08],
        [5.02, .34],
        [4.32, 1],
        [3.62, .34],
        [2.92, .08]
      ].forEach(([c, d]) => {
        const l = n(d, r);
        l.scale.setScalar(.66), l.position.set(i * 3.6, c, .09), a.add(l)
      })
    }
  }
  for (const s of [-1, 1]) {
    const o = flatExtrude(NM_CRESCENT, .04, moonGlowMat, !1);
    o.scale.setScalar(.3), o.rotation.z = -Math.PI / 2, o.position.set(s * 1.6, 1.62, .75), castle.add(o)
  }
}

// Original castle.html:5305
{
    const r = new THREE.Group,
      c = cyl(.022, .026, 1.15, MAT.wood, 7);
    c.position.y = .7, r.add(c);
    const d = cyl(.05, .06, .07, MAT.gold, 8);
    d.position.y = .3, r.add(d);
    const l = cone(.09, .34, M(13214314, .9), 9);
    l.rotation.x = Math.PI, l.position.y = .14, r.add(l), r.rotation.z = -.26, r.rotation.y = .6, r.position.set(-1.6, 0, -5.62), castle.add(r)
  }

// Original castle.html:5318
{
  /* (the rose now lives in the great dormer on the roof itself) */
  for (const u of [-1, 1]) {
    const y = new THREE.Group,
      m = cyl(.05, .075, .62, MAT.white, 8);
    m.position.y = .31, y.add(m);
    const x = cyl(.085, .06, .07, MAT.trim, 8);
    x.position.y = .65, y.add(x);
    const R = cone(.085, .44, MAT.gold, 8);
    R.position.y = .9, y.add(R);
    const S = sph(.042, MAT.gold, 8, 6);
    S.position.y = 1.16, y.add(S), y.position.set(u * 1.78, 6.55, KEEP.frontZ + .14), castle.add(y)
  }
  const i = new THREE.Group;
  for (const u of [-1, 1]) {
    const y = cyl(.05, .06, .6, MAT.white, 8);
    y.position.set(u * .26, .3, 0), i.add(y)
  }
  const r = mesh(new THREE.TorusGeometry(.26, .05, 8, 14, Math.PI), MAT.white);
  r.position.set(0, .6, 0), i.add(r);
  const c = box(.42, .055, .34, MAT.trim);
  c.position.set(-.17, .94, 0), c.rotation.z = .5, i.add(c);
  const d = box(.42, .055, .34, MAT.trim);
  d.position.set(.17, .94, 0), d.rotation.z = -.5, i.add(d);
  const l = M(14657870, .3, .85),
    f = sph(.13, l, 12, 10);
  f.scale.y = 1.12, f.position.set(0, .5, 0), i.add(f);
  const p = cyl(.145, .15, .045, MAT.goldDeep, 12);
  p.position.set(0, .38, 0), i.add(p);
  const h = sph(.035, MAT.goldDeep, 6, 5);
  h.position.set(0, .34, 0), i.add(h);
  const E = mesh(new THREE.OctahedronGeometry(.06), MAT.gold, !1);
  E.position.set(0, 1.14, 0), i.add(E);
  const RG2 = (window.__KEEP_RIDGE || 9.7),
    bp2 = box(.56, .18, .46, MAT.trim);
  bp2.position.set(0, RG2 + .08, KEEP.cz), castle.add(bp2), i.position.set(0, RG2 + .17, KEEP.cz), castle.add(i)
}

// Original castle.html:5354
{
  for (const i of [-4, 4]) {
    const r = mesh(new THREE.OctahedronGeometry(.085), MAT.gold, !1);
    r.scale.z = .4, r.rotation.z = Math.PI / 4, r.position.set(i, 6.62, KEEP.frontZ + .13), castle.add(r)
  }
  const t = new THREE.Group,
    s = box(.52, 1.7, .52, MAT.wallHi);
  s.position.y = .85, t.add(s);
  const o = box(.6, .12, .6, MAT.trim);
  o.position.y = 1.45, t.add(o);
  const e = box(.68, .1, .68, MAT.trim);
  e.position.y = 1.74, t.add(e);
  const n = cyl(.11, .14, .3, MAT.goldDeep, 8);
  n.position.y = 1.95, t.add(n);
  const a = new THREE.MeshBasicMaterial({
    color: 14272744,
    transparent: !0,
    opacity: .3,
    depthWrite: !1
  });
  [
    [0, 2.25, .09, .3],
    [.1, 2.55, .12, .24],
    [.24, 2.9, .16, .17]
  ].forEach(([i, r, c, d]) => {
    const l = new THREE.Mesh(new THREE.SphereGeometry(c, 8, 6), a.clone());
    l.material.opacity = d, l.position.set(i, r, 0), t.add(l)
  }), t.rotation.z = .045, t.position.set(2.3, 8.35, KEEP.cz - .55), castle.add(t)
}

// Original castle.html:6878
function fasciaScallop(t) {
  /* a scalloped board under an eave */
  return mesh(new THREE.PlaneGeometry(t, .16), new THREE.MeshStandardMaterial({
    map: texScallop(PAL.roofLight, PAL.roof, PAL.roofDark, 1, Math.max(3, Math.round(t * 3))),
    roughness: .85,
    side: THREE.DoubleSide
  }), !1, !1)
}
  // Refinement layer: all original color images and authored geometry recipes
  // remain intact. These shared maps supply physical surface detail only.
  const qualityFinishMaps=[];
  function detailCanvas(size,draw){const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});draw(ctx,size);return c;}
  function detailTexture(canvas,name,repeatX=1,repeatY=1){const texture=new THREE.CanvasTexture(canvas);texture.name=name;texture.colorSpace=THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(repeatX,repeatY);texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=8;qualityFinishMaps.push(texture);return texture;}
  function embossedNormal(canvas,name,strength,rx=1,ry=1){
    const size=canvas.width,ctx=canvas.getContext('2d'),src=ctx.getImageData(0,0,size,size).data,out=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,left=(y*size+(x+size-1)%size)*4,right=(y*size+(x+1)%size)*4,up=(((y+size-1)%size)*size+x)*4,down=(((y+1)%size)*size+x)*4;
      const nx=(src[left]-src[right])*strength/255,ny=(src[down]-src[up])*strength/255,k=1/Math.hypot(nx,ny,1);out.data[i]=Math.round((nx*k*.5+.5)*255);out.data[i+1]=Math.round((ny*k*.5+.5)*255);out.data[i+2]=Math.round((k*.5+.5)*255);out.data[i+3]=255;
    }ctx.putImageData(out,0,0);return detailTexture(canvas,name,rx,ry);
  }
  const roofRelief=embossedNormal(detailCanvas(2048,(c,size)=>{
    c.fillStyle='#858585';c.fillRect(0,0,size,size);const tab=size/3,rad=tab/2;
    for(let row=-1;row<=3;row++)for(let col=-1;col<=4;col++){
      const top=row*tab,off=((row%2)+2)%2?rad:0,cx=col*tab+off+rad,cy=top+tab-rad;
      c.save();c.beginPath();c.moveTo(cx-rad,top-tab*.18);c.lineTo(cx-rad,cy);c.arc(cx,cy,rad,Math.PI,0,false);c.lineTo(cx+rad,top-tab*.18);c.closePath();c.clip();
      const g=c.createLinearGradient(0,top-tab*.18,0,cy+rad);g.addColorStop(0,'#737373');g.addColorStop(.27,'#909090');g.addColorStop(.7,'#bcbcbc');g.addColorStop(.95,'#d1d1d1');g.addColorStop(1,'#999999');c.fillStyle=g;c.fillRect(cx-rad,top-tab*.18,tab,tab*1.2);
      // A broad rolled lip follows the exact original three-by-three scallops.
      c.strokeStyle='#727272';c.lineWidth=18;c.beginPath();c.arc(cx,cy,rad-5,Math.PI,0,false);c.stroke();c.strokeStyle='#d9d9d9';c.lineWidth=8;c.beginPath();c.arc(cx,cy,rad-20,Math.PI*.98,.02,false);c.stroke();
      // Subtle pressed leaf tracery belongs to each tab, below its rounded lip.
      c.lineWidth=3.5;c.strokeStyle='rgba(218,218,218,.42)';c.beginPath();c.moveTo(cx,top+tab*.23);c.bezierCurveTo(cx-tab*.14,top+tab*.46,cx+tab*.12,top+tab*.63,cx,top+tab*.81);c.stroke();
      for(let k=0;k<3;k++)for(const side of[-1,1]){const py=top+tab*(.37+k*.13);c.beginPath();c.moveTo(cx,py+tab*.09);c.bezierCurveTo(cx+side*tab*.08,py+tab*.075,cx+side*tab*.145,py,cx+side*tab*.085,py-tab*.045);c.bezierCurveTo(cx+side*tab*.04,py-tab*.025,cx+side*tab*.015,py+tab*.045,cx,py+tab*.09);c.stroke();}
      c.restore();
    }
  }),'Original shingle • sculpted scallop and pressed leaf relief',14);
  const damaskRelief=embossedNormal(detailCanvas(1024,(c,size)=>{
    c.fillStyle='#808080';c.fillRect(0,0,size,size);c.lineCap='round';
    // Raised pearl-white acanthus flourishes sit over, never replace, pinstripes.
    for(let row=-1;row<=2;row++)for(let col=-1;col<=2;col++){
      const x=col*size/2+(row%2?size/4:0),y=row*size/2;c.save();c.translate(x,y);c.strokeStyle='#aaa';c.lineWidth=5;
      for(const side of[-1,1]){c.beginPath();c.moveTo(0,188);c.bezierCurveTo(side*22,130,side*128,101,side*130,27);c.bezierCurveTo(side*132,-20,side*63,-45,side*51,4);c.bezierCurveTo(side*39,51,side*99,52,side*89,16);c.stroke();
        c.beginPath();c.moveTo(side*65,98);c.bezierCurveTo(side*30,87,side*18,47,side*40,36);c.bezierCurveTo(side*64,55,side*86,65,side*65,98);c.stroke();
        c.beginPath();c.moveTo(side*44,132);c.bezierCurveTo(side*93,139,side*133,101,side*118,85);c.bezierCurveTo(side*103,99,side*75,113,side*44,132);c.stroke();}
      c.beginPath();c.moveTo(0,77);c.bezierCurveTo(-39,46,-32,-1,0,-23);c.bezierCurveTo(32,-1,39,46,0,77);c.stroke();c.fillStyle='#aaa';c.beginPath();c.ellipse(0,99,5,8,0,0,Math.PI*2);c.fill();c.restore();
    }
  }),'Original pinstripe • fine acanthus embossed ground',10,3,5);
  const porcelainRelief=embossedNormal(detailCanvas(512,(c,size)=>{
    const image=c.createImageData(size,size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4;const v=128+2.2*Math.sin(x*Math.PI/16)*Math.sin(y*Math.PI/32)+1.3*Math.sin((x+y)*Math.PI/8);image.data[i]=image.data[i+1]=image.data[i+2]=Math.round(v);image.data[i+3]=255;}c.putImageData(image,0,0);
  }),'Original ivory • soft fired porcelain grain',3.5,3,3);
  const brushedGold=detailTexture(detailCanvas(512,(c,size)=>{
    const image=c.createImageData(size,size);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,grain=Math.sin(y*Math.PI/8)*.55+Math.sin((x+y)*Math.PI/128)*.2+Math.sin(y*Math.PI/2)*.12;image.data[i]=128+Math.round(grain*7);image.data[i+1]=225+Math.round(grain*14);image.data[i+2]=0;image.data[i+3]=255;}c.putImageData(image,0,0);
  }),'Original gilt • brushed metal microfinish',2,2);
  for(const mat of[MATF.shingle,MATF.gableClad]){mat.normalMap=roofRelief;mat.normalScale.set(.62,.62);mat.roughness=.82;mat.envMapIntensity=.9;mat.userData.qualityFinish='embossed-original-shingles';}
  const wallpaperMaterials=new Set([wpPanelMat,wpSideMat,wpBackMat,wpStripMat,...Object.values(wallpaperRound.c||{})]);
  for(const mat of wallpaperMaterials){mat.normalMap=damaskRelief;mat.normalScale.set(.3,.3);mat.roughness=.68;mat.envMapIntensity=.86;mat.userData.qualityFinish='original-pinstripe-and-acanthus';}
  for(const mat of[MAT.trim,MAT.cream,MAT.white,MAT.wallHi,wingWhiteMat]){mat.normalMap=porcelainRelief;mat.normalScale.set(.32,.32);mat.roughness=mat===wingWhiteMat?.41:.46;mat.envMapIntensity=1.03;mat.userData.qualityFinish='fired-porcelain';}
  for(const mat of[MAT.gold,MAT.goldDeep,wingRimMat,moonGlowMat]){mat.roughnessMap=brushedGold;mat.bumpMap=brushedGold;mat.bumpScale=.00065;mat.roughness=.51;mat.envMapIntensity=1.16;mat.userData.qualityFinish='brushed-gold';}
  shutterMat.normalMap=porcelainRelief;shutterMat.normalScale.set(.4,.4);shutterMat.roughness=.62;

  // Keep the original complete hinged façade in its authored closed state.
  // No interior exists in this isolated exterior builder, and the original
  // art-glass windows are backed by the original opaque masonry panels.
  facadeL.rotation.y=0;facadeR.rotation.y=0;
  // An opaque rebate behind the two closed original panels covers their exact
  // center seam after Float32/world transforms, without changing the façade.
  const closedFacadeRebate=box(.025,KEEP.H,.03,wpPanelMat);
  closedFacadeRebate.name='Hidden closed-façade center rebate';
  closedFacadeRebate.position.set(0,KEEP.H/2,KEEP.frontZ-.14);castle.add(closedFacadeRebate);
  castle.position.z=-KEEP.cz;castle.updateWorldMatrix(true,true);
  group=new THREE.Group();group.name='The original pink dollhouse · August 18';group.userData.noStaticBatch=true;
  const sourceBounds=new THREE.Box3().setFromObject(castle),batches=new Map(),materialSignatures=new Map(),materialKeys=new Map(),vertexMaterials=new Map(),serializationMeta={textures:{},images:{}},solidFacade=new Set([facadeL.children[0],facadeR.children[0],closedFacadeRebate]),removedLights=[];
  let sourceMeshes=0,sourceTriangles=0,decorativeMeshes=0,mirroredBakes=0,omittedZeroAreaTriangles=0,correctedShadingTriangles=0;
  const localMatrix=new THREE.Matrix4(),matrix=new THREE.Matrix4(),size=new THREE.Vector3();
  function materialKey(material){
    if(materialKeys.has(material))return materialKeys.get(material);
    const json=material.toJSON(serializationMeta);delete json.uuid;delete json.name;delete json.metadata;delete json.userData;
    const key=JSON.stringify(json);if(!materialSignatures.has(key))materialSignatures.set(key,material);materialKeys.set(material,key);return key;
  }
  function recordGeometry(object,m,material,range,instanceColor){
    if(instanceColor&&!material.vertexColors){if(!vertexMaterials.has(material)){const colored=material.clone();colored.vertexColors=true;vertexMaterials.set(material,colored);}material=vertexMaterials.get(material);}
    const source=object.geometry,p=source.attributes.position,n=source.attributes.normal,uv=source.attributes.uv,color=material.vertexColors?source.attributes.color:null,index=source.index;
    const box=(source.boundingBox||((source.computeBoundingBox()),source.boundingBox)).clone().applyMatrix4(m);box.getSize(size);
    const decoration=!solidFacade.has(object)&&(Math.min(size.x,size.y,size.z)<.12||Math.max(size.x,size.y,size.z)<1.1);
    const transparent=material.transparent===true,key=`${materialKey(material)}|${decoration}|${transparent?object.uuid:''}|${object.renderOrder||0}`;
    if(!batches.has(key))batches.set(key,{p:[],n:[],uv:[],color:material.vertexColors?[]:null,material:materialSignatures.get(materialKey(material)),decoration,renderOrder:object.renderOrder||0,castShadow:object.castShadow});
    const bucket=batches.get(key),normalMatrix=new THREE.Matrix3().getNormalMatrix(m),negative=m.determinant()<0,a=new THREE.Vector3(),norm=new THREE.Vector3();
    if(negative)mirroredBakes++;
    const start=range?.start??0,count=range?.count??(index?.count??p.count),end=Math.min(start+count,index?.count??p.count);
    for(let i=start;i+2<end;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);if(negative)[ids[1],ids[2]]=[ids[2],ids[1]];
      for(const id of ids){a.fromBufferAttribute(p,id).applyMatrix4(m);norm.fromBufferAttribute(n,id).applyNormalMatrix(normalMatrix);bucket.p.push(a.x,a.y,a.z);bucket.n.push(norm.x,norm.y,norm.z);bucket.uv.push(uv?.getX(id)||0,uv?.getY(id)||0);if(bucket.color)bucket.color.push((color?.getX(id)??1)*(instanceColor?.r??1),(color?.getY(id)??1)*(instanceColor?.g??1),(color?.getZ(id)??1)*(instanceColor?.b??1));}sourceTriangles++;
    }
    if(decoration)decorativeMeshes++;
  }
  castle.traverseVisible(object=>{
    if(object.isLight){removedLights.push(object);return;}if(!object.isMesh||object.visible===false)return;sourceMeshes++;
    const geometry=object.geometry;if(!geometry.attributes.normal)geometry.computeVertexNormals();
    const ms=Array.isArray(object.material)?object.material:[object.material],ranges=Array.isArray(object.material)?geometry.groups:null;
    for(let instance=0;instance<(object.isInstancedMesh?object.count:1);instance++){
      if(object.isInstancedMesh){object.getMatrixAt(instance,localMatrix);matrix.multiplyMatrices(object.matrixWorld,localMatrix);}else matrix.copy(object.matrixWorld);
      const instanceColor=object.isInstancedMesh&&object.instanceColor?new THREE.Color().fromBufferAttribute(object.instanceColor,instance):null;
      if(ranges)for(const range of ranges)recordGeometry(object,matrix,ms[range.materialIndex],range,instanceColor);else recordGeometry(object,matrix,ms[0],null,instanceColor);
    }
  });
  for(const bucket of batches.values()){
    // Original swept ornaments contain a few collapsed cap triangles and
    // inverted vertex normals. Preserve every visible vertex/UV and silhouette;
    // omit only triangles with zero Float32 area and repair only their shading.
    const p=new Float32Array(bucket.p),n=new Float32Array(bucket.n),uv=new Float32Array(bucket.uv),colors=bucket.color?new Float32Array(bucket.color):null,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),cross=new THREE.Vector3(),edge=new THREE.Vector3(),sum=new THREE.Vector3();let kept=0;
    for(let i=0;i<p.length;i+=9){a.fromArray(p,i);b.fromArray(p,i+3);c.fromArray(p,i+6);edge.subVectors(b,a);cross.subVectors(c,a).crossVectors(edge,cross);if(cross.lengthSq()<1e-20){omittedZeroAreaTriangles++;continue;}cross.normalize();sum.set(n[i]+n[i+3]+n[i+6],n[i+1]+n[i+4]+n[i+7],n[i+2]+n[i+5]+n[i+8]).normalize();if(cross.dot(sum)<-.01){for(let j=0;j<3;j++)cross.toArray(n,i+j*3);correctedShadingTriangles++;}const k=kept*9,u=kept*6;p.copyWithin(k,i,i+9);n.copyWithin(k,i,i+9);uv.copyWithin(u,i/9*6,i/9*6+6);if(colors)colors.copyWithin(k,i,i+9);kept++;}
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(p.slice(0,kept*9),3));geometry.setAttribute('normal',new THREE.BufferAttribute(n.slice(0,kept*9),3));geometry.setAttribute('uv',new THREE.BufferAttribute(uv.slice(0,kept*6),2));if(colors)geometry.setAttribute('color',new THREE.BufferAttribute(colors.slice(0,kept*9),3));geometry.computeBoundingBox();geometry.computeBoundingSphere();
    // Share only byte-identical complete vertex records. Triangle order,
    // normals, UV seams and vertex colors stay exact; no visible detail is lost.
    const indexed=createExactIndexedGeometry(THREE,geometry),renderGeometry=indexed?.geometry||geometry;
    if(indexed)geometry.dispose();
    const mesh=new THREE.Mesh(renderGeometry,bucket.material);mesh.name=`Original dollhouse · ${bucket.material.name||'painted finish'}`;mesh.castShadow=bucket.castShadow;mesh.receiveShadow=true;mesh.renderOrder=bucket.renderOrder;mesh.userData.noStaticBatch=true;mesh.userData.noCollision=bucket.decoration;mesh.userData.originalDollhouse=true;group.add(mesh);
  }
  // Retain only resources owned by the returned model; temporary construction
  // geometry and equivalent materials are disposed without altering any pixels.
  const usedG=new Set(),usedM=new Set(),usedT=new Set();group.traverse(o=>{if(!o.isMesh)return;usedG.add(o.geometry);usedM.add(o.material);for(const value of Object.values(o.material))if(value?.isTexture)usedT.add(value);});
  for(const [name,mat] of Object.entries(MAT)){const canonical=materialSignatures.get(materialKey(mat));MAT[name]=canonical;usedM.add(canonical);for(const t of Object.values(canonical))if(t?.isTexture)usedT.add(t);}
  for(const g of[...ownedGeometry])if(!usedG.has(g))g.dispose();for(const m of[...ownedMaterial])if(!usedM.has(m))m.dispose();for(const t of[...ownedTexture])if(!usedT.has(t))t.dispose();for(const mesh of[...ownedInstances])mesh.dispose();castle.clear();
  group.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(group),structureBounds=new THREE.Box3();let geometryBytes=0;
  group.traverse(o=>{if(!o.isMesh)return;if(!o.userData.noCollision)structureBounds.union(o.geometry.boundingBox);for(const a of Object.values(o.geometry.attributes))geometryBytes+=a.array.byteLength;});
  const anchors={sourceZOffset:-KEEP.cz,frontZ:KEEP.frontZ-KEEP.cz,backZ:KEEP.backZ-KEEP.cz,floorLevels:[0,KEEP.f1,KEEP.f2],door:[0,0,KEEP.frontZ-KEEP.cz],cornerTowers:[[-4.45,0,2.25],[4.45,0,2.25],[-4.45,0,-2.25],[4.45,0,-2.25]],rearTower:[0,0,-3.8],keep:{width:KEEP.W,depth:KEEP.D,height:KEEP.H},closedFacade:true};
  const stats={source:'August 18 original nm-castle-src.zip/castle.html',sourceSha256:'43c4774785601baaa9b920c3eeaa6ea9f573e888adfb5a958d6cda3b037c48cc',sourceMeshes,triangles:sourceTriangles-omittedZeroAreaTriangles,sourceTriangles,omittedZeroAreaTriangles,correctedShadingTriangles,drawCalls:group.children.length,geometryBytes,materials:usedM.size,textures:usedT.size,textureDimensions:[...usedT].map(t=>[t.image?.width,t.image?.height]),decorativeMeshes,mirroredBakes,originalGeometryPreserved:true,originalInstanceColorsPreserved:true,textureResizing:false,qualityPass:{originalColorMapsRetained:true,additionalMaps:qualityFinishMaps.length,additionalMapDimensions:qualityFinishMaps.map(t=>[t.image.width,t.image.height]),surfaceRelief:'scalloped shingles, acanthus embossing, fired porcelain and brushed gold',originalCurveProfilesPreserved:true},exteriorPrivacy:true,facadeState:'closed',hiddenClosureRebates:1,interiorMeshes:0,additionalLights:0,additionalRenderPasses:0,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},structureBounds:{min:structureBounds.min.toArray(),max:structureBounds.max.toArray()},sourceBounds:{min:sourceBounds.min.toArray(),max:sourceBounds.max.toArray()},anchors};
  group.userData.originalDollhouse=stats;return{group,stats,anchors,materials:MAT,dispose};
  }catch(error){dispose();throw error;}
}
