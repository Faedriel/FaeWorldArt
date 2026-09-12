// Original botanical architecture, built entirely from geometry. The shared kit
// merges textured surfaces by material; neither landmark adds renderer passes.
const TAU = Math.PI * 2;

function polar(radius, angle, height = 0) {
  return [Math.cos(angle) * radius, height, Math.sin(angle) * radius];
}

function circle(radius, height, count = 96, scallops = 0, amplitude = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = i / count * TAU;
    return polar(radius + Math.cos(a * scallops) * amplitude, a, height);
  });
}

function sphere(THREE, b, radius, key, position, scale = [1, 1, 1]) {
  b.add(new THREE.SphereGeometry(radius, 12, 8), key, position, [0, 0, 0], scale);
}

function cylinderBetween(THREE, b, start, end, radiusStart, radiusEnd, key, sides = 32) {
  const a = new THREE.Vector3(...start), z = new THREE.Vector3(...end);
  const axis = z.clone().sub(a);
  const geometry = new THREE.CylinderGeometry(radiusEnd, radiusStart, axis.length(), sides, 1);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.normalize()));
  b.add(geometry, key, a.add(z).multiplyScalar(.5).toArray());
}

function starGeometry(THREE, radius, thickness = .07) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 ? radius * .43 : radius;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i) shape.lineTo(x, y); else shape.moveTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness, bevelEnabled: true, bevelThickness: .015,
    bevelSize: .025, bevelSegments: 2, steps: 1,
  });
}

function crescentGeometry(THREE, radius, thickness = .09) {
  const shape = new THREE.Shape();
  shape.moveTo(.10 * radius, radius);
  shape.bezierCurveTo(-1.24 * radius, .94 * radius, -1.24 * radius, -.94 * radius, .10 * radius, -radius);
  shape.bezierCurveTo(-.53 * radius, -.59 * radius, -.53 * radius, .59 * radius, .10 * radius, radius);
  return new THREE.ExtrudeGeometry(shape, {
    depth: thickness, bevelEnabled: true, bevelThickness: .025,
    bevelSize: .025, bevelSegments: 3, curveSegments: 32, steps: 1,
  });
}

function blossom(THREE, kit, b, position, radius, key, petals = 5, rotation = 0) {
  for (let i = 0; i < petals; i++) {
    const angle = rotation + i / petals * TAU;
    b.add(kit.petal(radius, radius * .28, radius * .075, radius * .14), key,
      position, [0, 0, angle]);
  }
  sphere(THREE, b, radius * .13, "gold", [position[0], position[1], position[2] + radius * .07]);
}

// Raised filigree follows the actual curved ceramic front face. Staying short
// of the petal tip preserves the original silhouette and avoids sharp tubes.
function petalInlay(THREE, kit, b, length, width, depth, curl, position, rotation, branches = 2) {
  const point = (t, s = 0) => {
    const profile = Math.sin(Math.PI * t) ** .78;
    return [width * profile * s, length * t,
      curl * t * t + depth * profile * Math.sqrt(1 - s * s) + .004];
  };
  const line = (points, segments, radius = .0045) =>
    b.add(new THREE.TubeGeometry(kit.curve(points), segments, radius, 4, false), 'gold', position, rotation);
  line(Array.from({ length: 13 }, (_, i) => point(.12 + .75 * i / 12)), 16);
  for (const t of branches === 4 ? [.31, .54] : branches ? [.42] : []) {
    for (const side of [-1, 1]) {
      line(Array.from({ length: 7 }, (_, i) => point(t + .19 * i / 6, side * .72 * i / 6)), 8, .0035);
    }
  }
}

function observatoryColumn(THREE, kit, b, angle) {
  const radius = 5.05;
  const base = polar(radius, angle);
  const columnPoint = y => polar(radius - .13 * Math.sin(y / 5.9 * Math.PI), angle, y);
  // One continuous tulip foot replaces the three cylindrical blocks.
  const footProfile=[[0,0],[.36,0],[.42,.035],[.43,.075],[.40,.12],[.29,.18],[.24,.26],[.23,.35],[.18,.46],[.14,.49],[0,.49]];
  b.add(kit.surface(48,footProfile.length-1,(u,t)=>{
    const index=Math.min(footProfile.length-2,Math.floor(t*(footProfile.length-1))),mix=t*(footProfile.length-1)-index;
    const radius=footProfile[index][0]*(1-mix)+footProfile[index+1][0]*mix,y=footProfile[index][1]*(1-mix)+footProfile[index+1][1]*mix;
    return [Math.cos(u*TAU)*radius,y,Math.sin(u*TAU)*radius];
  }),'foundation',base);
  for(let i=0;i<8;i++){
    const a=i/8*TAU;
    b.tube([[base[0]+Math.cos(a)*.38,.055,base[2]+Math.sin(a)*.38],
      [base[0]+Math.cos(a+.05)*.34,.145,base[2]+Math.sin(a+.05)*.34],
      [base[0]+Math.cos(a+.13)*.235,.28,base[2]+Math.sin(a+.13)*.235],
      [base[0]+Math.cos(a+.22)*.165,.445,base[2]+Math.sin(a+.22)*.165]],.011,'gold',20,5);
  }
  b.tube(Array.from({ length: 11 }, (_, j) => columnPoint(.46 + j / 10 * 5.65)), .145, "pearl", 64, 10);
  for (let strand = 0; strand < 2; strand++) {
    const points = Array.from({ length: 65 }, (_, j) => {
      const t = j / 64, y = .5 + t * 5.6, a = t * TAU * 1.65 + strand * Math.PI;
      const p = columnPoint(y);
      return [p[0] + Math.cos(a) * .158, p[1], p[2] + Math.sin(a) * .158];
    });
    b.tube(points, .025, "gold", 64, 6);
  }
  for (let i = 0; i < 3; i++) {
    const a = angle + (i - 1) * .55;
    b.add(kit.petal(.90, .16, .06, .26), i === 1 ? "mint" : "pearl",
      [base[0], .32, base[2]], [.48, a, 0]);
  }
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU;
    b.add(kit.petal(.80, .20, .055, .26), i % 2 ? "lilac" : "pearl",
      columnPoint(5.70), [.60, a, 0]);
    petalInlay(THREE, kit, b, .80, .20, .055, .26, columnPoint(5.70), [.60, a, 0]);
  }
  sphere(THREE, b, .20, "gold", columnPoint(6.02));
  // Fine upright reeds enrich the shaft between its existing broad spirals.
  for (let i = 0; i < 3; i++) {
    const a = angle + (i + .5) / 3 * TAU;
    b.tube(Array.from({ length: 17 }, (_, j) => {
      const p = columnPoint(.72 + j / 16 * 4.74);
      return [p[0] + Math.cos(a) * .145, p[1], p[2] + Math.sin(a) * .145];
    }), .0038, 'gold', 24, 4);
  }
}

function telescope(THREE, kit, b) {
  // A full, capped optical instrument: the dark and glass pieces are lenses,
  // not holes in the pearl tube. The eyepiece sits at Fae's standing head level.
  const base = [1.62, 0, .70];
  b.add(new THREE.CylinderGeometry(.29, .38, .18, 32), "dark", [base[0], .09, base[2]]);
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU;
    b.tube([[base[0] + Math.cos(a) * .72, .09, base[2] + Math.sin(a) * .72],
      [base[0] + Math.cos(a) * .49, .66, base[2] + Math.sin(a) * .49],
      [base[0], 1.50, base[2]]], .045, "gold", 24, 8);
    b.add(kit.petal(.47, .11, .035, .08), "mint",
      [base[0] + Math.cos(a) * .44, .42, base[2] + Math.sin(a) * .44], [.4, a, 0]);
  }
  cylinderBetween(THREE, b, [base[0], .20, base[2]], [base[0], 2.77, base[2]], .075, .075, "gold", 24);
  const a = new THREE.Vector3(1.15, 2.95, 1.12), z = new THREE.Vector3(2.73, 4.02, -.18);
  const axis = z.clone().sub(a), direction = axis.clone().normalize();
  cylinderBetween(THREE, b, a.toArray(), z.toArray(), .14, .28, "pearl", 40);
  for (const t of [.06, .27, .79, .97]) {
    const p = a.clone().addScaledVector(axis, t), half = direction.clone().multiplyScalar(.045);
    const r = .14 + .14 * t + .028;
    cylinderBetween(THREE, b, p.clone().sub(half).toArray(), p.clone().add(half).toArray(), r, r, "gold", 40);
  }
  cylinderBetween(THREE, b, z.toArray(), z.clone().addScaledVector(direction, .014).toArray(), .263, .263, "dark", 40);
  cylinderBetween(THREE, b, z.clone().addScaledVector(direction, .018).toArray(), z.clone().addScaledVector(direction, .035).toArray(), .245, .245, "glass", 40);
  cylinderBetween(THREE, b, a.clone().addScaledVector(direction, -.28).toArray(), a.toArray(), .073, .115, "dark", 24);
  b.add(new THREE.TorusGeometry(.39, .026, 8, 48), "gold", [1.62, 2.76, .70], [0, .55, 0]);
  sphere(THREE, b, .10, "lilac", [1.62, 2.76, 1.05]);

  // Machined focusing collars, retaining rings and radial screws follow the
  // optical axis; they are geometry so the edges catch the existing sky light.
  const u = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(direction, u).normalize();
  for (const t of [.13, .18, .23, .71, .75]) {
    const p = a.clone().addScaledVector(axis, t);
    const r = .14 + .14 * t + .008;
    cylinderBetween(THREE, b, p.clone().addScaledVector(direction, -.008).toArray(),
      p.clone().addScaledVector(direction, .008).toArray(), r, r, 'gold', 32);
  }
  for (const t of [.27, .79]) {
    const center = a.clone().addScaledVector(axis, t), r = .14 + .14 * t + .028;
    for (let i = 0; i < 8; i++) {
      const theta = i / 8 * TAU, radial = u.clone().multiplyScalar(Math.cos(theta)).addScaledVector(v, Math.sin(theta));
      const p = center.clone().addScaledVector(radial, r);
      cylinderBetween(THREE, b, p.toArray(), p.clone().addScaledVector(radial, .014).toArray(), .013, .013, 'dark', 8);
      b.tube([p.clone().addScaledVector(radial, .015).addScaledVector(direction, -.008).toArray(),
        p.clone().addScaledVector(radial, .015).addScaledVector(direction, .008).toArray()], .0028, 'gold', 2, 4);
    }
  }
  const wheelCenter = new THREE.Vector3(1.62, 2.76, .70), wheelRotation = new THREE.Euler(0, .55, 0);
  const wheelPoint = (radius, theta) => new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0)
    .applyEuler(wheelRotation).add(wheelCenter).toArray();
  for (let i = 0; i < 12; i++) {
    const theta = i / 12 * TAU;
    b.tube([wheelPoint(.35, theta), wheelPoint(.393, theta)], .005, 'pearl', 2, 4);
    if (i % 3 === 0) b.tube([wheelPoint(.07, theta), wheelPoint(.35, theta)], .009, 'gold', 8, 5);
  }
}

export function buildFairyObservatory(THREE, kit) {
  const b = kit.builder("The Celestial Bower");
  for (let i = 0; i < 8; i++) observatoryColumn(THREE, kit, b, (i + .5) / 8 * TAU);

  // Scalloped gallery rims and suspended pearl swags link the flower capitals.
  for (const [height, radius, thickness, key] of [[5.95, 5.05, .095, "pearl"], [6.10, 5.05, .034, "gold"], [6.28, 4.98, .072, "lilac"]]) {
    b.tube(circle(radius, height, 128, 8, .09), thickness, key, 128, 8, true);
  }
  for (let i = 0; i < 8; i++) {
    const start = (i + .5) / 8 * TAU;
    const points = Array.from({ length: 25 }, (_, j) => {
      const t = j / 24;
      return polar(5.03, start + t / 8 * TAU, 5.88 - .40 * Math.sin(t * Math.PI));
    });
    b.tube(points, .023, "gold", 32, 6);
    for (let bead = 1; bead <= 5; bead++) {
      const t = bead / 6;
      sphere(THREE, b, .065, "pearl", polar(5.03, start + t / 8 * TAU, 5.88 - .40 * Math.sin(t * Math.PI)));
    }
  }

  // Shell-shaped enamel crests and airy mirrored scrolls form the
  // observatory cornice, with no ornament below the existing 5.2m opening.
  for(let i=0;i<8;i++){
    const a=(i+1)/8*TAU,yaw=Math.PI/2-a;
    b.shellFan(polar(5.01,a,5.50),[0,yaw,0],.70,i%2?'mint':'pearl');
    for(const side of [-1,1])b.scroll(polar(5.025,a+side*.13,5.89),[0,yaw,side>0?0:Math.PI],.78,.66,'gold',.019);
  }

  // Sixteen sweeping ribs make a transparent architectural dome. The interior
  // and every entrance remain open below the high armillary instrument.
  for (let i = 0; i < 16; i++) {
    const angle = (i + 1) / 16 * TAU;
    for (const [offset, thickness, key] of [[0, .075, "pearl"], [.095, .024, "gold"]]) {
      const points = Array.from({ length: 33 }, (_, j) => {
        const t = j / 32, a = t * Math.PI / 2;
        return polar(4.97 * Math.cos(a) + offset * Math.sin(a * 2), angle + .06 * Math.sin(a * 2), 6.28 + 3.62 * Math.sin(a));
      });
      b.tube(points, thickness, key, 48, 8);
    }
  }
  // Interlaced botanical lancets nest between the dome's primary ribs.
  // Their curved tops meet the existing dome profile; the sky remains open.
  for(let i=0;i<16;i++){
    const angle=(i+.5)/16*TAU;
    for(const side of [-1,1]){
      b.tube(Array.from({length:33},(_,j)=>{
        const t=j/32,a=.19+t*.82,theta=angle+side*.087*Math.sin(Math.PI*t);
        return polar(4.96*Math.cos(a),theta,6.28+3.60*Math.sin(a));
      }),.022,'gold',32,5);
    }
  }
  b.tube(circle(.77, 9.79, 64), .055, "gold", 64, 8, true);
  sphere(THREE, b, .21, "pearl", [0, 9.92, 0]);

  const orbitCenter = [0, 8.03, 0];
  for (const [radius, rotation, key] of [[2.13, [0, .2, .27], "gold"], [1.78, [1.1, .45, -.2], "lilac"], [1.48, [.44, 1.16, .7], "gold"], [1.99, [Math.PI / 2, 0, 0], "gold"]]) {
    b.add(new THREE.TorusGeometry(radius, key === "lilac" ? .055 : .035, 8, 96), key, orbitCenter, rotation);
  }
  sphere(THREE, b, .31, "glow", orbitCenter);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU;
    sphere(THREE, b, i % 3 === 0 ? .105 : .065, i % 2 ? "pearl" : "mint", [Math.cos(a) * 1.99, 8.03, Math.sin(a) * 1.99]);
  }
  b.tube([[0, 9.86, 0], [.02, 10.20, 0], [.08, 10.46, 0]], .058, "gold", 18, 8);
  b.add(crescentGeometry(THREE, .96, .11), "gold", [.33, 11.13, -.045], [0, 0, -.24]);
  b.add(starGeometry(THREE, .27), "pearl", [.37, 11.32, .10], [0, 0, -.08]);
  b.add(starGeometry(THREE, .20), "gold", [0, 12.18, -.02], [0, 0, .18]);
  b.tube([[0, 11.82, 0], [0, 12.04, 0]], .025, "gold", 8, 6);

  // A pearlescent star-map desk below the hanging armillary, with carved legs
  // and raised constellation inlays that remain crisp at close range.
  const table = [-1.06, 0, -.40];
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU;
    b.tube([[table[0] + Math.cos(a) * .68, .04, table[2] + Math.sin(a) * .68],
      [table[0] + Math.cos(a) * .46, .65, table[2] + Math.sin(a) * .46],
      [table[0] + Math.cos(a) * .68, 1.70, table[2] + Math.sin(a) * .68]], .065, "gold", 30, 8);
    b.add(kit.petal(.72, .19, .065, .19), "mint", [table[0] + Math.cos(a) * .4, .45, table[2] + Math.sin(a) * .4], [.3, a, 0]);
  }
  b.add(new THREE.CylinderGeometry(1.32, 1.20, .17, 64, 1), "pearl", [table[0], 1.74, table[2]]);
  b.add(new THREE.CylinderGeometry(1.22, 1.22, .027, 64), "dark", [table[0], 1.84, table[2]]);
  for (const radius of [.51, .89, 1.22]) {
    b.tube(circle(radius, 1.861, 72).map(p => [p[0] + table[0], p[1], p[2] + table[2]]), .012, "gold", 72, 6, true);
  }
  const stars = [[-.86, -.22], [-.50, .32], [-.06, .46], [.18, .06], [.59, -.17], [.71, .40], [.25, -.69], [-.36, -.66]];
  for (let i = 0; i < stars.length; i++) {
    const [x, z] = stars[i];
    sphere(THREE, b, i % 3 ? .025 : .043, "glow", [table[0] + x, 1.873, table[2] + z]);
    if (i < 5) {
      const next = stars[i + 1];
      b.tube([[table[0] + x, 1.866, table[2] + z], [table[0] + next[0], 1.866, table[2] + next[1]]], .008, "gold", 4, 5);
    }
  }
  // Engraved divisions are small enough to read as an instrument, with four
  // longer cardinal marks and an inset rim that stays within the desk edge.
  for (let i = 0; i < 48; i++) {
    const a = i / 48 * TAU, inner = i % 12 === 0 ? 1.045 : 1.13;
    b.tube([polar(inner, a, 1.866), polar(1.19, a, 1.866)]
      .map(p => [p[0] + table[0], p[1], p[2] + table[2]]), .0038, 'gold', 2, 4);
  }
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * TAU;
    b.tube([polar(1.93, a, 8.061), polar(2.03, a, 8.061)], .0045, 'pearl', 2, 4);
  }
  telescope(THREE, kit, b);
  return b.finish({
    kind: "observatory", authoredMeters: true, openInterior: true,
    cardinalEntrances: 4, entranceClearHeight: 5.2,
    minimumPlayerHeight: 3.6, minimumPlayerRadius: .65,
    detailPasses: 4,
    detailFeatures: ['sculpted tulip pedestals', 'shell crest cornice', 'interwoven dome lancets', 'brushed metal and glazed enamel', 'raised capital veins', 'fine column reeds', 'graduated celestial circles', 'focusing collars', 'retaining screws', 'spoked setting wheel'],
    features: ["flower columns", "open ribbed dome", "hanging armillary", "crescent finial", "star-map desk", "telescope"],
  });
}

export function buildFairyGateway(THREE, kit) {
  const b = kit.builder("The Moonflower Threshold");
  for (const side of [-1, 1]) {
    for (const depth of [-.66, .66]) {
      const path = [[side * 3.07, .12, depth], [side * 3.22, 1.35, depth],
        [side * 3.04, 3.18, depth], [side * 2.63, 4.67, depth],
        [side * 1.74, 5.65, depth * .66], [0, 6.30, 0]];
      b.tube(path, .115, "pearl", 72, 12);
      b.tube(path.map(([x, y, z]) => [x + side * .13, y, z]), .043, "gold", 72, 8);
      b.add(new THREE.CylinderGeometry(.27, .40, .20, 32), "foundation", [side * 3.07, .10, depth]);
      b.add(new THREE.TorusGeometry(.31, .035, 8, 36), "gold", [side * 3.07, .23, depth], [Math.PI / 2, 0, 0]);
    }
    // The outer leaves flare away from the opening, preserving the passage.
    for (let i = 0; i < 5; i++) {
      const y = .46 + i * .80;
      const x = side * (3.04 + .10 * Math.sin(i));
      b.add(kit.petal(1.02, .26, .075, .20), i % 2 ? "mint" : "pearl", [x, y, 0], [.10, side * .45, -side * .65]);
      petalInlay(THREE, kit, b, 1.02, .26, .075, .20, [x, y, 0], [.10, side * .45, -side * .65], 4);
      b.add(kit.petal(.67, .17, .055, .18), "leaf", [x, y + .06, -.14], [-.2, side * .25, -side * .89]);
      petalInlay(THREE, kit, b, .67, .17, .055, .18, [x, y + .06, -.14], [-.2, side * .25, -side * .89]);
    }
    // Fine interwoven stems bridge front and rear columns without bars across
    // the doorway. Rosettes sit on their exterior, with three-dimensional backs.
    for (let i = 0; i < 6; i++) {
      const y = .58 + i * .67, x = side * (3.08 - .07 * i);
      b.tube([[x, y, -.66], [x + side * .25, y + .23, 0], [x, y + .39, .66]], .024, "gold", 22, 6);
    }
    for (const [y, x, radius, key] of [[.73, 3.33, .32, "rose"], [2.53, 3.17, .35, "lilac"], [4.27, 2.97, .40, "rose"], [5.50, 1.93, .35, "mint"]]) {
      blossom(THREE, kit, b, [side * x, y, .80], radius, key, 5, side * .35);
      for (let i = 0; i < 5; i++) {
        const a = side * .35 + i / 5 * TAU;
        petalInlay(THREE, kit, b, radius, radius * .28, radius * .075, radius * .14,
          [side * x, y, .80], [0, 0, a], 0);
      }
    }
    for (let i = 0; i < 4; i++) {
      const x = side * (.92 + i * .46), top = 6.16 - i * .23, drop = .30 + .14 * (i % 2);
      b.tube([[x, top, .49], [x, top - drop, .49]], .011, "gold", 8, 6);
      sphere(THREE, b, .057, "pearl", [x, top - drop, .49], [.85, 1.18, .85]);
      sphere(THREE, b, .033, "glow", [x, top - drop - .16, .49]);
    }
  }
  for (let i = -5; i <= 5; i++) {
    const x = i * .37, y = 6.17 - Math.abs(i) * .073;
    b.add(kit.petal(.86 - Math.abs(i) * .027, .20, .07, .17), i % 2 ? "lilac" : "pearl",
      [x, y, -.06], [-.06, 0, -i * .12]);
    petalInlay(THREE, kit, b, .86 - Math.abs(i) * .027, .20, .07, .17, [x, y, -.06], [-.06, 0, -i * .12]);
    if (i % 2 === 0) b.add(kit.petal(.56, .125, .05, .12), "mint", [x, y - .06, .13], [.12, 0, -i * .14]);
  }
  // Sculpted rocaille shoulders and gilt side scrolls make the gateway
  // read as hand-carved botanical metalwork rather than parallel tubes.
  for(const side of [-1,1]){
    for(const [x,y,size]of [[3.15,1.43,.56],[3.04,3.06,.60],[2.56,4.65,.52]]){
      b.shellFan([side*x,y,.76],[0,0,-side*.28],size,'pearl');
      b.scroll([side*(x+.13),y+.55,.82],[0,0,side>0?0:Math.PI],.51,.60,'gold',.021);
    }
    b.tube([[side*3.35,.24,.74],[side*3.61,.75,.70],[side*3.40,1.36,.67],
      [side*3.66,2.16,.64],[side*3.32,3.04,.68],[side*3.18,3.85,.72],
      [side*2.74,4.67,.74]],.044,'mint',54,8);
  }
  b.tube([[-2.50, 5.04, .74], [-1.26, 5.98, .63], [0, 6.33, .28], [1.26, 5.98, .63], [2.50, 5.04, .74]], .05, "gold", 64, 8);
  b.add(crescentGeometry(THREE, .57, .08), "gold", [.21, 6.70, .28], [0, 0, -.24]);
  b.add(starGeometry(THREE, .23, .07), "glow", [.21, 6.77, .43], [0, 0, .08]);
  b.tube([[0, 6.08, .44], [0, 5.56, .51]], .016, "gold", 12, 6);
  b.add(starGeometry(THREE, .14, .045), "gold", [0, 5.40, .51], [0, 0, .12]);
  return b.finish({
    kind: "gateway", authoredMeters: true,
    detailPasses: 4,
    detailFeatures: ['shell-carved rocaille shoulders', 'flowing enamel acanthus stems', 'open golden side scrolls', 'branched leaf inlays', 'gilt rosette veins', 'fitted crown filigree'],
    opening: { width: 3.6, height: 4.4, depth: 2.5 },
    features: ["twin climbing vines", "petal crown", "gold crescent", "pearl pendants", "flower rosettes"],
  });
}
