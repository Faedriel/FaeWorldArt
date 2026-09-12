// Original fairy discoveries. Every form is meter-scale, closed geometry and
// shared-kit material; the kit owns merging and resource disposal.
const TAU = Math.PI * 2;
const DESIGN_PASSES = 2;
const ring = (r, y, n = 64, waves = 0, depth = 0) => Array.from({ length: n }, (_, i) => {
  const a = i / n * TAU, radius = r + Math.cos(a * waves) * depth;
  return [Math.cos(a) * radius, y, Math.sin(a) * radius];
});
function bead(THREE, b, r, key, p, scale = [1, 1, 1]) {
  b.add(new THREE.SphereGeometry(r, 12, 8), key, p, [0, 0, 0], scale);
}
function beam(THREE, b, a, z, r, key, top = r) {
  const start = new THREE.Vector3(...a), end = new THREE.Vector3(...z), delta = end.clone().sub(start);
  const g = new THREE.CylinderGeometry(top, r, delta.length(), 24);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()));
  b.add(g, key, start.add(end).multiplyScalar(.5).toArray());
}
function lathe(THREE, points, count = 64) {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), count);
}
function petal(THREE, kit, b, p, rotation, length, width, key, depth = .07, curl = .18) {
  // Tilt in the leaf's own plane, then turn around the stem. XYZ Euler order
  // would otherwise tip every petal toward the same world direction.
  const g = kit.petal(length, width, depth, curl);
  g.rotateX(rotation[0]); g.rotateZ(rotation[2]);
  b.add(g, key, p, [0, rotation[1], 0]);
}
function flower(THREE, kit, b, p, r, key) {
  for (let i = 0; i < 5; i++) petal(THREE, kit, b, p, [0, 0, i / 5 * TAU], r, r * .28, key, r * .08, r * .13);
  bead(THREE, b, r * .14, 'gold', [p[0], p[1], p[2] + r * .12]);
}
function wingShape(THREE) {
  const s = new THREE.Shape(); s.moveTo(0, 0);
  s.bezierCurveTo(.45, .90, 1.64, 2.11, 3.23, 1.80);
  s.bezierCurveTo(4.32, 1.56, 3.85, .34, 2.28, -.02);
  s.bezierCurveTo(3.55, -.13, 3.46, -1.49, 2.26, -1.75);
  s.bezierCurveTo(1.18, -2.15, .67, -.56, 0, 0); s.closePath(); return s;
}
function wingPoint(x, y, side, thickness = .08) {
  return [x * side, 4.63 + Math.sin(x / 3.95 * Math.PI / 2) * 1.21 + thickness + .09 * Math.sin(y * 1.8), -y];
}
function wingGeometry(kit, shape, side) {
  // Both caps are sampled across their whole area. A deformed extrusion would
  // leave long, flat cap triangles and interrupt the fine raised veins.
  return kit.surface(128, 32, (u, v) => {
    const edge = shape.getPoint(side < 0 ? 1 - u : u), r = Math.sin(v * Math.PI);
    const x = 1.60 + (edge.x - 1.60) * r, y = .05 + (edge.y - .05) * r;
    const rim = Math.min(1, (1 - r) / .025);
    const thickness = Math.sign(v - .5) * .055 * rim * rim * (3 - 2 * rim);
    return wingPoint(x, y, side, thickness);
  });
}

function buildBower(THREE, kit) {
  const b = kit.builder('The Butterfly Bower'), shape = wingShape(THREE);
  for (const side of [-1, 1]) {
    b.add(wingGeometry(kit, shape, side), 'lilac');
    for (const z of [-1.16, 1.16]) {
      b.add(new THREE.CylinderGeometry(.30, .40, .17, 32), 'foundation', [side * 3.12, .085, z]);
      b.add(new THREE.CylinderGeometry(.26, .29, .10, 32), 'gold', [side * 3.12, .22, z]);
      const arch = [[side * 3.12, .27, z], [side * 3.02, 1.85, z], [side * 2.66, 3.49, z], [side * 1.48, 4.52, z * .54], [0, 4.66, 0]];
      b.tube(arch, .12, 'pearl', 56, 10);
      b.tube(arch.map(([x, y, d]) => [x + side * .14, y, d]), .03, 'gold', 56, 6);
      for (let i = 0; i < 3; i++) petal(THREE, kit, b, [side * 3.11, .3 + i * .71, z], [.25, side * .4, -side * .45], .93, .18, i % 2 ? 'mint' : 'pearl');
    }
    // Main wing veins follow the sculpted surface, rather than crossing it as
    // flat decals. The smaller vascular branches arrive in the detail pass.
    for (const points of [[[0, 0], [.9, .66], [2.04, 1.23], [3.27, 1.6]], [[0, 0], [1.22, .23], [2.3, .52], [3.5, .85]], [[0, 0], [1.05, -.35], [1.87, -1.18], [2.51, -1.54]]]) {
      b.tube(points.map(([x, y]) => wingPoint(x, y, side, .073)), .026, 'gold', 36, 7);
    }
    for (let i = 0; i < 5; i++) {
      const x = 1.1 + i * .46, y = i < 3 ? -1.30 : .80, p = wingPoint(x, y, side, -.02), drop = .34 + i % 2 * .18;
      b.tube([p, [p[0], p[1] - drop, p[2]]], .012, 'gold', 8, 6);
      bead(THREE, b, .066, 'pearl', [p[0], p[1] - drop, p[2]]);
      bead(THREE, b, .12, 'glass', [p[0], p[1] - drop - .21, p[2]], [.67, 1.15, .67]);
    }
  }
  bead(THREE, b, .22, 'pearl', [0, 4.75, -.1], [.6, .5, 2.7]);
  for (const side of [-1, 1]) b.tube([[side * .055, 4.78, -.59], [side * .13, 5.12, -.88], [side * .36, 5.14, -1.07]], .025, 'gold', 24, 6);
  // A low, rounded seat anchors the sheltered alcove without closing its front.
  b.add(new THREE.CylinderGeometry(1, 1, .18, 48), 'pearl', [0, 1.23, -.94], [0, 0, 0], [1.55, 1, .47]);
  for (const x of [-1.18, 1.18]) b.tube([[x, .03, -1.04], [x * .88, .64, -.98], [x, 1.19, -.94]], .075, 'gold', 28, 8);
  b.tube([[-1.43, 1.37, -1.05], [-1.21, 2.08, -1.27], [0, 2.46, -1.38], [1.21, 2.08, -1.27], [1.43, 1.37, -1.05]], .047, 'gold', 48, 8);
  flower(THREE, kit, b, [0, 2.08, -1.37], .30, 'rose');
  if (DESIGN_PASSES > 1) detailBower(THREE, kit, b, shape);
  return b.finish({ kind: 'butterflyBower', designPasses: DESIGN_PASSES, front: '+Z', entrance: { width: 3.6, height: 3.8 }, features: ['sculpted butterfly canopy', 'climbing arches', 'gilt wing veins', 'pearl and glass pendants', 'sheltered seat alcove'], secondPassDetails: ['smooth closed wing caps', 'gilt edge piping', '24 fine vein branches', 'pearl vein terminals', 'column filigree', 'seat inlay and pearls'] });
}

function buildWell(THREE, kit) {
  const b = kit.builder('The Moonpetal Wishing Well');
  b.add(lathe(THREE, [[1.12, .02], [1.69, .02], [1.75, .15], [1.68, .27], [1.52, .31], [1.53, .96], [1.66, 1.04], [1.68, 1.17], [1.13, 1.17], [1.12, .02]], 80), 'foundation');
  for (const [r, y, w, key] of [[1.69, .20, .042, 'gold'], [1.53, .44, .034, 'lilac'], [1.66, 1.18, .031, 'gold']]) b.tube(ring(r, y, 96, 12, .04), w, key, 96, 8, true);
  b.add(new THREE.CylinderGeometry(1.13, 1.13, .05, 64), 'dark', [0, .055, 0]);
  b.add(new THREE.CylinderGeometry(1.12, 1.12, .018, 64), 'glass', [0, .36, 0]);
  for (const side of [-1, 1]) {
    const path = [[side * 1.49, .28, 0], [side * 1.57, 1.77, 0], [side * 1.40, 2.97, 0], [side * .74, 3.61, 0], [0, 3.80, 0]];
    b.tube(path, .095, 'mint', 56, 10);
    b.tube(path.map(([x, y, z]) => [x + side * .13, y, z]), .031, 'gold', 56, 7);
    for (let i = 0; i < 3; i++) petal(THREE, kit, b, [side * 1.53, 1.35 + i * .51, -.05], [.14, 0, -side * .50], .57, .15, i % 2 ? 'pearl' : 'mint');
    flower(THREE, kit, b, [side * .95, 3.34, .11], .27, 'rose');
  }
  beam(THREE, b, [-1.7, 2.28, 0], [1.7, 2.28, 0], .065, 'dark');
  beam(THREE, b, [-.45, 2.28, 0], [.45, 2.28, 0], .135, 'lilac');
  for (const x of [-.49, .49, -1.59, 1.59]) beam(THREE, b, [x - .04, 2.28, 0], [x + .04, 2.28, 0], Math.abs(x) < 1 ? .21 : .13, 'pearl');
  beam(THREE, b, [1.72, 2.28, 0], [1.72, 2.28, .40], .04, 'gold');
  beam(THREE, b, [1.68, 2.28, .4], [1.99, 2.28, .4], .065, 'dark');
  b.tube([[0, 2.27, .15], [0, 1.75, .15], [0, 1.26, .15]], .019, 'gold', 18, 7);
  b.add(lathe(THREE, [[.20, .64], [.25, .64], [.31, 1.06], [.27, 1.09], [.22, .71], [.20, .71], [.20, .64]], 40), 'lilac', [0, 0, .15]);
  b.tube([[-.26, 1.03, .15], [-.24, 1.32, .15], [0, 1.45, .15], [.24, 1.32, .15], [.26, 1.03, .15]], .024, 'gold', 30, 7);
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU;
    petal(THREE, kit, b, [Math.sin(a) * 1.56, .35, Math.cos(a) * 1.56], [.12, a, 0], .65, .17, i % 2 ? 'lilac' : 'mint', .035, .04);
  }
  bead(THREE, b, .13, 'gold', [0, 3.83, 0]);
  petal(THREE, kit, b, [0, 3.83, 0], [0, 0, 0], .45, .14, 'glow', .12, .05);
  if (DESIGN_PASSES > 1) detailWell(THREE, kit, b);
  return b.finish({ kind: 'wishingWell', designPasses: DESIGN_PASSES, front: '+Z', pool: { physicalTransmission: false, collision: false, surfaceY: .369 }, features: ['hollow sculpted stone basin', 'botanical arch', 'windlass and crank', 'suspended open bucket', 'clear shallow pool'], secondPassDetails: ['raised leaf veins', 'rose basin inlays', 'gilt rivets', '25-turn windlass winding', 'hexagonal pivot nuts', 'bucket seams and banding', 'pearl pendants'] });
}

function buildShrine(THREE, kit) {
  const b = kit.builder('The Crystal Bloom Shrine');
  b.add(lathe(THREE, [[0, .02], [1.17, .02], [1.38, .15], [1.34, .31], [.95, .37], [.76, .72], [.83, .87], [0, .87]], 64), 'foundation');
  for (const [r, y] of [[1.32, .21], [.86, .80]]) b.tube(ring(r, y), .033, 'gold', 64, 7, true);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    petal(THREE, kit, b, [Math.sin(a) * .35, .58, Math.cos(a) * .35], [.86, a, 0], 2.12, .42, i % 2 ? 'lilac' : 'rose', .10, .30);
    petal(THREE, kit, b, [Math.sin(a) * .19, .86, Math.cos(a) * .19], [.44, a + .22, 0], 1.52, .24, 'pearl', .09, .19);
  }
  b.add(new THREE.OctahedronGeometry(1, 0), 'glow', [0, 3.05, 0], [0, Math.PI / 4, 0], [.47, 1.31, .47]);
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * TAU;
    b.add(new THREE.OctahedronGeometry(1, 0), i % 2 ? 'mint' : 'lilac', [Math.sin(a) * .61, 2.40, Math.cos(a) * .61], [.26 * Math.cos(a), a, -.26 * Math.sin(a)], [.26, .86, .26]);
  }
  b.tube(ring(.64, 1.91), .038, 'gold', 64, 7, true);
  for (const side of [-1, 1]) {
    const path = [[side * 1.71, .06, -.42], [side * 1.92, 1.65, -.50], [side * 1.67, 3.45, -.5], [side * .92, 4.70, -.40], [0, 5.10, -.34]];
    b.tube(path, .075, 'pearl', 64, 9);
    b.tube(path.map(([x, y, z]) => [x + side * .10, y, z]), .026, 'gold', 64, 6);
    for (let i = 0; i < 3; i++) petal(THREE, kit, b, [side * (1.81 - .12 * i), 1.35 + i * .78, -.5], [0, 0, -side * .5], .58, .15, 'mint');
    flower(THREE, kit, b, [side * .98, 4.55, -.31], .25, 'rose');
  }
  bead(THREE, b, .12, 'gold', [0, 5.13, -.34]);
  petal(THREE, kit, b, [0, 5.18, -.34], [0, 0, 0], .45, .14, 'glow');
  if (DESIGN_PASSES > 1) detailShrine(THREE, kit, b);
  return b.finish({ kind: 'bloomShrine', designPasses: DESIGN_PASSES, front: '+Z', features: ['sculpted lotus pedestal', 'faceted luminous crystal bloom', 'pearl devotional arch', 'flower terminals'], secondPassDetails: ['radial lotus correction', 'gilt lotus rims and branching veins', 'pedestal pearls and inlays', 'gold crystal facet frames', 'hanging jewel ornaments'] });
}

function detailBower(THREE, kit, b, shape) {
  for (const side of [-1, 1]) {
    b.tube(shape.getSpacedPoints(128).map(p => wingPoint(p.x, p.y, side, .025)), .022, 'gold', 128, 6, true);
    // Alternating vein branches and pearl tips accent the two wing lobes.
    for (let i = 0; i < 7; i++) {
      const t = i / 6, start = [.72 + t * 2.1, .51 + t * .77], end = [.73 + t * 2.75, 1.04 + Math.sin(t * Math.PI) * .71];
      b.tube([start, [(start[0] + end[0]) / 2, end[1] - .17], end].map(([x, y]) => wingPoint(x, y, side, .073)), .015, 'gold', 22, 6);
      bead(THREE, b, .038, 'pearl', wingPoint(end[0], end[1], side, .076));
    }
    for (let i = 0; i < 5; i++) {
      const t = i / 4, start = [.72 + t * 1.42, -.22 - t * .84], end = [1.13 + t * 1.72, -.83 - t * .60];
      b.tube([start, [(start[0] + end[0]) / 2, end[1] + .04], end].map(([x, y]) => wingPoint(x, y, side, .073)), .014, 'gold', 22, 6);
      bead(THREE, b, .035, 'pearl', wingPoint(end[0], end[1], side, .077));
    }
    for (const z of [-1.16, 1.16]) {
      const filigree = Array.from({ length: 33 }, (_, i) => {
        const t = i / 32, a = t * TAU * 1.4;
        return [side * (2.98 + Math.cos(a) * .13), .36 + t * 1.93, z + Math.sin(a) * .13];
      });
      b.tube(filigree, .014, 'gold', 40, 6);
      bead(THREE, b, .046, 'pearl', filigree.at(-1));
    }
  }
  b.tube(ring(1, 1.328).map(([x, y, z]) => [x * 1.55, y, z * .47 - .94]), .020, 'gold', 64, 6, true);
  for (let i = 0; i < 9; i++) {
    const x = -.93 + i * .2325, y = 2.36 - Math.abs(x) * .26;
    bead(THREE, b, .034, 'pearl', [x, y, -1.31]);
  }
}

function transformed(THREE, points, p, tilt = 0, yaw = 0) {
  const tiltMatrix = new THREE.Matrix4().makeRotationX(tilt), yawMatrix = new THREE.Matrix4().makeRotationY(yaw);
  const matrix = yawMatrix.multiply(tiltMatrix).setPosition(...p);
  return points.map(point => new THREE.Vector3(...point).applyMatrix4(matrix).toArray());
}
function leafVeins(THREE, b, p, tilt, yaw, length, width, depth, curl, withEdges = false) {
  const stem = Array.from({ length: 25 }, (_, i) => {
    const t = .08 + i / 24 * .86, s = Math.pow(Math.sin(t * Math.PI), .78);
    return [0, length * t, curl * t * t + depth * s + .012];
  });
  b.tube(transformed(THREE, stem, p, tilt, yaw), .012, 'gold', 26, 5);
  if (withEdges) for (const sign of [-1, 1]) {
    const edge = Array.from({ length: 25 }, (_, i) => {
      const t = .07 + i / 24 * .86, s = Math.pow(Math.sin(t * Math.PI), .78);
      return [sign * width * s, length * t, curl * t * t];
    });
    b.tube(transformed(THREE, edge, p, tilt, yaw), .015, 'gold', 26, 5);
  }
  for (const t of [.34, .60]) for (const sign of [-1, 1]) {
    const end = t + .13, s = Math.pow(Math.sin(end * Math.PI), .78);
    const points = [[0, length * t, curl * t * t + depth * Math.pow(Math.sin(t * Math.PI), .78) + .012],
      [sign * width * s * .40, length * (t + .06), curl * (t + .06) ** 2 + depth * s * .91 + .015],
      [sign * width * s * .73, length * end, curl * end * end + depth * s * .685 + .012]];
    b.tube(transformed(THREE, points, p, tilt, yaw), .008, 'gold', 10, 5);
  }
}

function detailWell(THREE, kit, b) {
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, p = [Math.sin(a) * 1.56, .35, Math.cos(a) * 1.56];
    leafVeins(THREE, b, p, .12, a, .65, .17, .035, .04);
    for (const y of [.29, 1.045]) bead(THREE, b, .029, 'gold', [Math.sin(a) * 1.64, y, Math.cos(a) * 1.64]);
    const delta = a + TAU / 24;
    b.add(new THREE.OctahedronGeometry(.075, 0), 'rose', [Math.sin(delta) * 1.55, .73, Math.cos(delta) * 1.55], [0, delta, 0], [.68, 1.40, .30]);
  }
  // An actual helical winding, crank pivot nuts and bucket seams make the
  // little windlass read correctly close up without adding moving parts.
  b.tube(Array.from({ length: 301 }, (_, i) => {
    const t = i / 300, a = t * TAU * 25;
    return [-.43 + .86 * t, 2.28 + Math.cos(a) * .151, Math.sin(a) * .151];
  }), .016, 'gold', 300, 6);
  for (const x of [-1.68, 1.69]) b.add(new THREE.CylinderGeometry(.11, .11, .055, 6), 'gold', [x, 2.28, 0], [0, 0, Math.PI / 2]);
  b.add(new THREE.TorusGeometry(.12, .016, 6, 32), 'gold', [1.995, 2.28, .4], [0, Math.PI / 2, 0]);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    b.tube([[Math.cos(a) * .251, .67, Math.sin(a) * .251 + .15], [Math.cos(a) * .29, .96, Math.sin(a) * .29 + .15], [Math.cos(a) * .31, 1.06, Math.sin(a) * .31 + .15]], .011, 'gold', 16, 5);
    bead(THREE, b, .020, 'gold', [Math.cos(a) * .307, 1.015, Math.sin(a) * .307 + .15]);
  }
  b.tube(ring(.3, 1.069, 48).map(([x, y, z]) => [x, y, z + .15]), .018, 'gold', 48, 6, true);
  b.tube(ring(.25, .67, 48).map(([x, y, z]) => [x, y, z + .15]), .013, 'gold', 48, 6, true);
  for (const side of [-1, 1]) {
    b.tube([[side * .58, 3.66, .06], [side * .58, 3.34, .06]], .009, 'gold', 8, 5);
    bead(THREE, b, .060, 'pearl', [side * .58, 3.28, .06]);
  }
}

function detailShrine(THREE, kit, b) {
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    leafVeins(THREE, b, [Math.sin(a) * .35, .58, Math.cos(a) * .35], .86, a, 2.12, .42, .10, .30, true);
  }
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU;
    bead(THREE, b, .037, 'pearl', [Math.sin(a) * 1.19, .32, Math.cos(a) * 1.19]);
    b.add(new THREE.OctahedronGeometry(.066, 0), 'lilac', [Math.sin(a) * 1.25, .15, Math.cos(a) * 1.25], [0, a, 0], [.80, 1.15, .42]);
  }
  const vertices = [[0, 4.36, 0], [0, 1.74, 0], [.47, 3.05, 0], [0, 3.05, .47], [-.47, 3.05, 0], [0, 3.05, -.47]];
  const rotation = new THREE.Matrix4().makeRotationY(Math.PI / 4);
  const transformedVertices = vertices.map(v => new THREE.Vector3(...v).applyMatrix4(rotation).toArray());
  for (let i = 2; i < 6; i++) {
    for (const j of [0, 1, i === 5 ? 2 : i + 1]) beam(THREE, b, transformedVertices[i], transformedVertices[j], .010, 'gold');
    bead(THREE, b, .033, 'pearl', transformedVertices[i]);
  }
  for (const side of [-1, 1]) {
    b.tube([[side * .67, 4.88, -.34], [side * .67, 4.51, -.34]], .011, 'gold', 10, 5);
    bead(THREE, b, .063, 'pearl', [side * .67, 4.46, -.34]);
    b.add(new THREE.OctahedronGeometry(.105, 0), 'glow', [side * .67, 4.24, -.34], [0, .2, 0], [.6, 1.4, .6]);
  }
}

export function buildFairyDiscoveries(THREE, kit) {
  const prototypes = { butterflyBower: buildBower(THREE, kit), wishingWell: buildWell(THREE, kit), bloomShrine: buildShrine(THREE, kit) };
  const stats = { designPasses: DESIGN_PASSES, types: 3, triangles: 0, drawCalls: 0, geometryBytes: 0, textures: 0, additionalRenderPasses: 0 };
  for (const group of Object.values(prototypes)) for (const key of ['triangles', 'drawCalls', 'geometryBytes']) stats[key] += group.userData.fairyArchitecture[key];
  return { prototypes, stats };
}
