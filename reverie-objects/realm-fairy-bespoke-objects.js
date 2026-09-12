/** Seven original garden heirlooms. Sculpted shells and continuous curved
 * silhouettes are followed by fitted metalwork, hinges, seams and small jewels.
 * Geometry is merged by the shared kit; clones share geometry and materials.
 */
export function buildFairyBespokeObjects(THREE, kit) {
  const TAU = Math.PI * 2, prototypes = {}, reports = {};
  const sample = (n, fn) => Array.from({length:n + 1}, (_, i) => fn(i / n));
  const polar = (r, a, y = 0) => [r * Math.cos(a), y, r * Math.sin(a)];
  const ellipse = (rx, ry, z, y = 0) => sample(64, t => [rx * Math.cos(t * TAU), y + ry * Math.sin(t * TAU), z]);
  function orb(b, p, size, key = 'pearl', segments = 24) {
    b.add(new THREE.SphereGeometry(1, segments, 12), key, p, [0, 0, 0], size);
  }
  function bead(b, p, r = .025, key = 'pearl') { orb(b, p, [r, r, r], key, 12); }
  function tube(b, points, r = .009, key = 'gold', n = 32, closed = false) { b.tube(points, r, key, n, 6, closed); }
  function ring(b, r, y, thickness = .012, key = 'gold', waves = 0, depth = 0) {
    tube(b, sample(64, t => polar(r + Math.cos(t * TAU * waves) * depth, t * TAU, y)), thickness, key, 64, true);
  }
  function turned(b, profile, key, p = [0, 0, 0]) {
    const curve = new THREE.CatmullRomCurve3(profile.map(([r, y]) => new THREE.Vector3(r, y, 0)), false, 'centripetal');
    const points = curve.getPoints(profile.length * 5).map(p => new THREE.Vector2(Math.max(0, p.x), p.y));
    const g = new THREE.LatheGeometry(points, 48), index = g.index, kept = [];
    const a = new THREE.Vector3(), b0 = new THREE.Vector3(), c = new THREE.Vector3();
    for (let i = 0; i < index.count; i += 3) {
      const ids = [index.getX(i), index.getX(i + 1), index.getX(i + 2)];
      a.fromBufferAttribute(g.attributes.position, ids[0]); b0.fromBufferAttribute(g.attributes.position, ids[1]); c.fromBufferAttribute(g.attributes.position, ids[2]);
      if (b0.sub(a).cross(c.sub(a)).lengthSq() > 1e-20) kept.push(...ids);
    }
    g.setIndex(kept); b.add(g, key, p);
  }
  function petal(b, p, length, width, key, rotation = [0, 0, 0], curl = .10, depth = .035) {
    b.add(kit.petal(length, width, depth, curl), key, p, rotation);
  }
  function localTube(b, points, p, rotation, radius = .007, key = 'gold') {
    const g = new THREE.TubeGeometry(kit.curve(points), Math.max(16, points.length), radius, 5, false);
    b.add(g, key, p, rotation);
  }
  function veinedPetal(b, p, length, width, key, rotation = [0, 0, 0], curl = .1, depth = .035) {
    petal(b, p, length, width, key, rotation, curl, depth);
    localTube(b, sample(24, t => [0, length * t, curl * t * t + depth * Math.pow(Math.sin(Math.PI * t), .78) + .006]), p, rotation);
    for (const side of [-1, 1]) for (const start of [.23, .49]) {
      localTube(b, sample(12, v => {
        const t = start + v * .20, s = Math.pow(Math.sin(t * Math.PI), .78), x = side * v * .76;
        return [width * s * x, length * t, curl * t * t + depth * s * Math.sqrt(1 - x * x) + .006];
      }), p, rotation, .0045);
    }
  }
  function rosette(b, p, r = .15, color = 'rose', count = 7) {
    for (let i = 0; i < count; i++) petal(b, p, r, r * .30, color, [0, 0, i * TAU / count], r * .25, r * .12);
    bead(b, [p[0], p[1], p[2] + r * .16], r * .22, 'gold');
  }
  function butterfly(b, p, scale = 1, color = 'lilac') {
    for (const side of [-1, 1]) {
      veinedPetal(b, p, .34 * scale, .16 * scale, color, [0, 0, -side * .67], .025 * scale, .024 * scale);
      veinedPetal(b, p, .25 * scale, .12 * scale, 'rose', [0, 0, -side * 2.10], .035 * scale, .02 * scale);
      tube(b, [[p[0] + side * .012 * scale, p[1] + .12 * scale, p[2]], [p[0] + side * .035 * scale, p[1] + .26 * scale, p[2]], [p[0] + side * .10 * scale, p[1] + .30 * scale, p[2]]], .006 * scale, 'gold', 16);
      bead(b, [p[0] + side * .10 * scale, p[1] + .30 * scale, p[2]], .013 * scale);
    }
    orb(b, p, [.019 * scale, .13 * scale, .024 * scale], 'gold');
  }
  function scallopedDisk(b, rx, rz, y, h, key = 'pearl', lobes = 8) {
    b.add(kit.surface(64, 14, (u, v) => {
      const a = u * TAU, lat = (v - .5) * Math.PI, s = Math.cos(lat) * (1 + .055 * Math.cos(a * lobes));
      return [rx * Math.cos(a) * s, y + h * Math.sin(lat), rz * Math.sin(a) * s];
    }), key);
    tube(b, sample(64, t => { const a = t * TAU, s = 1 + .055 * Math.cos(a * lobes); return [rx * Math.cos(a) * s, y + .003, rz * Math.sin(a) * s]; }), .009, 'gold', 64, true);
  }
  function finish(type, b, features) {
    const group = b.finish({type, frontAxis:'+Z', designPasses:2, features});
    const meta = group.userData.fairyArchitecture, dy = -meta.bounds.min[1];
    for (const mesh of group.children) { mesh.geometry.translate(0, dy, 0); mesh.geometry.computeBoundingBox(); mesh.geometry.computeBoundingSphere(); }
    const box = new THREE.Box3().setFromObject(group), size = box.getSize(new THREE.Vector3());
    Object.assign(meta, {floorY:0, bounds:{min:box.min.toArray(), max:box.max.toArray()}, footprint:{width:size.x, depth:size.z}, height:size.y});
    group.userData.fairyBespoke = true; prototypes[type] = group; reports[type] = {...meta};
  }

  // The dressing mirror is an asymmetric botanical oval, with a usable shallow
  // porcelain tray, cabriole vine legs and a butterfly crown above the glass.
  {
    const b = kit.builder('Butterfly dressing mirror');
    for (const x of [-.67, .67]) for (const z of [-.20, .20]) {
      tube(b, [[x * 1.12, .02, z * 1.22], [x * .93, .16, z], [x * .90, .66, z * .68], [x, .87, z]], .036, 'gold', 28);
      veinedPetal(b, [x * 1.09, .03, z * 1.17], .22, .07, 'mint', [0, 0, -Math.sign(x) * .38]);
    }
    scallopedDisk(b, .82, .34, .88, .06);
    orb(b, [0, 1.63, -.10], [.54, .70, .047], 'pearl', 48);
    orb(b, [0, 1.63, -.045], [.484, .637, .022], kit.materials.mirror ? 'mirror' : 'dark', 48);
    if (!kit.materials.mirror) orb(b, [0, 1.63, -.020], [.481, .633, .008], 'glass', 48);
    tube(b, ellipse(.505, .663, -.023, 1.63), .019, 'gold', 80, true);
    tube(b, ellipse(.550, .716, -.027, 1.63), .011, 'gold', 80, true);
    for (const side of [-1, 1]) {
      tube(b, [[side * .59, .9, -.10], [side * .72, 1.14, -.08], [side * .68, 1.68, -.07], [side * .50, 2.1, -.10]], .025, 'gold', 44);
      for (let i = 0; i < 3; i++) veinedPetal(b, [side * (.62 + i * .007), 1.18 + i * .21, -.04], .27, .078, i % 2 ? 'mint' : 'pearl', [0, 0, -side * .74]);
      rosette(b, [side * .45, 2.12, .002], .14);
      for (let i = 0; i < 7; i++) { const a = side * (.23 + i * .17); bead(b, [.526 * Math.sin(a), 1.63 + .688 * Math.cos(a), -.012], .016); }
    }
    butterfly(b, [0, 2.33, -.06], .88);
    turned(b, [[0, 0], [.065, 0], [.09, .04], [.065, .12], [.03, .15], [.031, .18], [0, .18]], 'rose', [-.49, .945, .11]);
    bead(b, [-.49, 1.147, .11], .035, 'gold');
    scallopedDisk(b, .18, .11, .954, .018, 'mint');
    finish('butterflyVanity', b, ['gilt oval mirror', 'scalloped porcelain tray', 'four curved vine legs', 'raised veined acanthus leaves', 'butterfly crown', 'pearl bezel', 'stoppered rose perfume bottle']);
  }

  // A continuous swept trumpet is hollow from its narrow neck to its scalloped
  // bluebell mouth. Its ribs follow the same swept surface precisely.
  {
    const b = kit.builder('Bluebell gramophone');
    scallopedDisk(b, .40, .34, .10, .09, 'lilac');
    turned(b, [[0, .12], [.24, .12], [.30, .19], [.28, .29], [.18, .33], [0, .33]], 'pearl');
    b.add(new THREE.CylinderGeometry(.23, .23, .018, 48), 'dark', [0, .343, .02]);
    for (const r of [.10, .15, .19, .215]) ring(b, r, .355, .003, 'gold');
    bead(b, [0, .365, .02], .027, 'gold');
    tube(b, [[.26, .19, -.13], [.28, .57, -.12], [.16, .88, -.11], [.05, 1.08, -.07]], .043, 'gold', 32);
    const center = new THREE.CatmullRomCurve3([new THREE.Vector3(.05, 1.05, -.07), new THREE.Vector3(-.03, 1.16, .02), new THREE.Vector3(-.17, 1.22, .20), new THREE.Vector3(-.23, 1.22, .44)]);
    const frames = center.computeFrenetFrames(64, false);
    function horn(u, t, inner = false) {
      const a = u * TAU, i = Math.min(64, Math.round(t * 64)), p = center.getPoint(t);
      const r = (.044 + .34 * t ** 2.3) * (1 + .055 * Math.cos(a * 6) * t ** 3) - (inner ? .012 : 0);
      p.addScaledVector(frames.normals[i], Math.cos(a) * r).addScaledVector(frames.binormals[i], Math.sin(a) * r); return p.toArray();
    }
    b.add(kit.surface(64, 64, (u, t) => horn(1 - u, t)), 'lilac');
    b.add(kit.surface(64, 64, (u, t) => horn(u, t, true)), 'pearl');
    tube(b, sample(64, u => horn(u, 1)), .015, 'gold', 64, true);
    for (let i = 0; i < 6; i++) tube(b, sample(44, t => horn(i / 6, t)), .009, 'gold', 44);
    tube(b, [[.26, .31, .07], [.25, .49, .07], [.10, .47, .10], [.075, .375, .13]], .012, 'gold', 24);
    tube(b, [[.29, .23, 0], [.46, .23, 0], [.46, .23, .10]], .012, 'gold', 16);
    orb(b, [.46, .23, .11], [.024, .024, .055], 'dark');
    for (const side of [-1, 1]) { rosette(b, [side * .26, .21, .19], .10); bead(b, [side * .29, .12, .22], .026); }
    finish('bluebellGramophone', b, ['hollow swept bluebell horn', 'six raised trumpet ribs', 'rolled gilt scalloped mouth', 'inlaid record grooves', 'curved tone arm', 'hand crank', 'porcelain and rose soundbox']);
  }

  {
    const b = kit.builder('Aureole wing harp');
    scallopedDisk(b, .65, .29, .07, .065);
    const left = [[-.48, .09, 0], [-.67, .58, -.01], [-.71, 1.34, -.02], [-.49, 1.98, 0], [-.12, 2.21, 0], [.36, 2.03, 0], [.58, 1.74, 0]];
    tube(b, left, .050, 'pearl', 72);
    tube(b, left.map(p => [p[0], p[1], p[2] + .049]), .013, 'gold', 72);
    // A tapered carved soundboard, rounded at both ends.
    const board = kit.surface(32, 36, (u, t) => {
      const a = u * TAU, shape = Math.pow(Math.sin(Math.PI * t), .45), x = -.34 + .91 * t, y = .17 + 1.58 * t;
      return [x + .10 * shape * Math.cos(a), y - .06 * shape * Math.cos(a), .085 * shape * Math.sin(a)];
    }); b.add(board, 'lilac');
    for (let i = 0; i < 11; i++) {
      const t = (i + 1) / 12, x = -.50 + t * .98, low = .20 + ((x + .34) / .91) * 1.58;
      const high = 2.11 - .55 * Math.pow(Math.abs(x + .06) / .64, 2);
      if (high <= low) continue;
      tube(b, [[x, Math.max(.21, low), .025], [x, high, .025]], .0045, 'gold', 2);
      bead(b, [x, high, .025], .016, 'gold');
      bead(b, [x, Math.max(.21, low), .03], .014, 'pearl');
    }
    for (let i = 0; i < 5; i++) veinedPetal(b, [-.62, .42 + i * .25, -.045], .40, .125, i % 2 ? 'mint' : 'pearl', [0, 0, .88 + i * .07]);
    rosette(b, [-.47, 1.92, .05], .16); butterfly(b, [-.12, 2.21, 0], .60);
    for (const side of [-1, 1]) tube(b, [[side * .4, .09, .08], [side * .47, .16, .1], [side * .35, .25, .08], [side * .22, .20, .065]], .011, 'gold', 22);
    finish('wingedHarp', b, ['rounded asymmetric harp frame', 'eleven individual strings', 'tapered enamel soundboard', 'five carved wing feathers', 'gilt tuning pins', 'butterfly terminal', 'scalloped foot']);
  }

  {
    const b = kit.builder('Nacre shell birdbath');
    scallopedDisk(b, .36, .34, .065, .06);
    turned(b, [[0, .09], [.20, .09], [.24, .19], [.13, .35], [.10, .70], [.18, .86], [.28, .94], [0, .94]], 'pearl');
    function shell(u, v, inner = false) {
      const a = (u - .5) * Math.PI * 1.54, r = v, ridge = .032 * Math.cos(u * TAU * 9) * Math.sin(v * Math.PI / 2);
      return [Math.sin(a) * r * .70, .94 + r * r * .26 + ridge + (inner ? .027 : 0), -.26 + Math.cos(a) * r * .80];
    }
    b.add(kit.surface(80, 30, (u, v) => shell(1 - u, v)), 'rose');
    b.add(kit.surface(80, 30, (u, v) => shell(u, v, true)), 'pearl');
    tube(b, sample(80, u => shell(u, 1, true)), .016, 'gold', 80);
    for (let i = 0; i <= 9; i++) tube(b, sample(30, t => shell(i / 9, t, true)), .007, 'gold', 30);
    orb(b, [0, 1.017, .09], [.36, .009, .27], 'glass', 40);
    for (let i = 0; i < 4; i++) { const a = i * TAU / 4; veinedPetal(b, polar(.09, a, .18), .64, .125, 'mint', [.23 * Math.sin(a), a, -.23 * Math.cos(a)]); }
    for (const side of [-1, 1]) {
      orb(b, [side * .40, 1.28, .13], [.10, .12, .16], 'pearl');
      orb(b, [side * .40, 1.40, .22], [.070, .075, .075], 'pearl');
      petal(b, [side * .40, 1.35, .27], .09, .025, 'gold', [Math.PI / 2, 0, 0], .01, .017);
      petal(b, [side * .40, 1.24, .03], .18, .065, 'mint', [-1.12, 0, 0]);
      for (const dx of [-.024, .024]) bead(b, [side * .40 + dx, 1.42, .276], .008, 'dark');
    }
    finish('shellBirdbath', b, ['ribbed concave scallop shell', 'rolled nacre edge', 'nine gilt shell ribs', 'two perched porcelain birds', 'leaf wrapped pedestal', 'clear shallow basin']);
  }

  {
    const b = kit.builder('Petal post letter shrine');
    scallopedDisk(b, .34, .30, .065, .06);
    tube(b, [[0, .06, 0], [-.07, .50, .01], [-.05, .95, 0], [0, 1.18, 0]], .062, 'pearl', 40);
    for (let i = 0; i < 3; i++) veinedPetal(b, [-.045, .23 + i * .23, .014], .36, .105, 'mint', [0, 0, (i % 2 ? -1 : 1) * .70]);
    // A hollow folded flower bud protects the little oval letter door.
    for (let i = 0; i < 6; i++) { const a = i * TAU / 6; petal(b, polar(.16, a, 1.03), .74, .25, i % 2 ? 'lilac' : 'pearl', [.29 * Math.sin(a), a, -.29 * Math.cos(a)], .06, .06); }
    orb(b, [0, 1.30, .254], [.255, .245, .035], 'rose', 40);
    tube(b, ellipse(.24, .23, .29, 1.30), .011, 'gold', 64, true);
    tube(b, [[-.145, 1.38, .292], [0, 1.36, .301], [.145, 1.38, .292]], .012, 'dark', 24);
    tube(b, [[-.14, 1.28, .292], [0, 1.19, .306], [.14, 1.28, .292]], .007, 'gold', 24);
    bead(b, [0, 1.20, .318], .032, 'gold');
    for (const y of [1.15, 1.45]) b.add(new THREE.CylinderGeometry(.021, .021, .065, 16), 'gold', [-.232, y, .272]);
    butterfly(b, [0, 1.75, .014], .60);
    tube(b, [[.23, 1.29, 0], [.35, 1.29, 0], [.35, 1.58, 0]], .012, 'gold', 20);
    veinedPetal(b, [.35, 1.43, .0], .19, .07, 'rose', [0, 0, -Math.PI / 2], .02, .015);
    finish('petalPostbox', b, ['six folded porcelain bud panels', 'gilt oval envelope door', 'recessed letter slot', 'two little hinges', 'wax seal medallion', 'leaf postal flag', 'butterfly crown']);
  }

  {
    const b = kit.builder('Dewdrop jewel terrarium');
    scallopedDisk(b, .39, .39, .06, .055);
    turned(b, [[0, .08], [.33, .08], [.36, .14], [.30, .20], [0, .20]], 'lilac');
    ring(b, .337, .159, .011);
    const curve = t => .335 * Math.pow(Math.sin(Math.PI * t), .63) * (1 - .12 * t);
    b.add(kit.surface(48, 36, (u, t) => polar(curve(t), u * TAU, .18 + t * .92)), 'glass');
    for (let i = 0; i < 8; i++) tube(b, sample(40, t => polar(curve(t) + .006, i * TAU / 8, .18 + t * .92)), .010, 'gold', 40);
    ring(b, curve(.45), .18 + .45 * .92, .008);
    for (let i = 0; i < 5; i++) { const a = i * TAU / 5; veinedPetal(b, polar(.10, a, .21), .39, .09, i % 2 ? 'mint' : 'leaf', [.25 * Math.sin(a), a, -.25 * Math.cos(a)], .07, .02); }
    const jewels = [[0, .43, 0, .14], [.12, .36, .08, .09], [-.11, .35, .03, .085]];
    for (const [x, y, z, s] of jewels) b.add(new THREE.OctahedronGeometry(s, 0), 'rose', [x, y, z], [.1, .5, 0], [.7, 1.8, .7]);
    bead(b, [0, 1.135, 0], .048, 'gold');
    b.add(new THREE.TorusGeometry(.075, .012, 7, 28), 'gold', [0, 1.222, 0]);
    for (let i = 0; i < 8; i++) bead(b, polar(curve(.45) + .012, i * TAU / 8, .18 + .45 * .92), .022);
    finish('jewelTerrarium', b, ['transparent dewdrop shell', 'eight fitted gilt ribs', 'pearl crossbar settings', 'three pronged rose crystals', 'living enamel leaf miniature', 'scalloped pedestal', 'carrying loop']);
  }

  {
    const b = kit.builder('Moonvine folding screen');
    for (const panel of [-1, 0, 1]) {
      const x = panel * .65, h = panel ? 2.23 : 2.54, z = Math.abs(panel) * .105;
      for (const side of [-1, 1]) tube(b, [[x + side * .26, .025, z], [x + side * .30, .30, z], [x + side * .30, h - .4, z], [x + side * .22, h - .12, z], [x, h, z]], .028, 'pearl', 44);
      tube(b, [[x - .29, .36, z], [x, .25, z], [x + .29, .36, z]], .018, 'gold', 22);
      for (let i = 0; i < 4; i++) {
        const y = .40 + i * .43;
        for (const side of [-1, 1]) veinedPetal(b, [x, y, z], .47, .14, i % 2 ? 'mint' : 'lilac', [0, 0, -side * .47], .045, .020);
        bead(b, [x, y + .08, z + .035], .023, 'pearl');
      }
      tube(b, [[x, .30, z], [x - .04, .80, z + .024], [x + .035, 1.40, z + .024], [x, h - .19, z]], .013, 'gold', 44);
      rosette(b, [x, h - .13, z + .025], .10, 'rose');
      for (const side of [-1, 1]) {
        tube(b, [[x + side * .26, .045, z - .17], [x + side * .26, .12, z], [x + side * .26, .045, z + .17]], .026, 'gold', 20);
        tube(b, [[x + side * .275, .40, z + .03], [x + side * .282, h - .4, z + .03], [x + side * .19, h - .14, z + .03]], .008, 'gold', 32);
      }
    }
    for (const x of [-.325, .325]) for (const y of [.45, 1.8]) { b.add(new THREE.CylinderGeometry(.029, .029, .13, 16), 'gold', [x, y, .053]); bead(b, [x, y + .082, .053], .024); }
    butterfly(b, [0, 2.57, .015], .60);
    finish('floralScreen', b, ['three graduated botanical arches', 'twenty four carved enamel leaves', 'open lattice with fine branching veins', 'four articulated pearl hinges', 'stabilizing scroll feet', 'gilt outer piping', 'butterfly crest']);
  }
  return {prototypes, stats:{prototypeCount:Object.keys(prototypes).length, types:reports, uniqueTriangles:Object.values(reports).reduce((sum, r) => sum + r.triangles, 0), geometryBytes:Object.values(reports).reduce((sum, r) => sum + r.geometryBytes, 0), drawCalls:Object.values(reports).reduce((sum, r) => sum + r.drawCalls, 0), designPasses:2, textures:0, lights:0, additionalRenderPasses:0}};
}
