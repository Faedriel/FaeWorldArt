import {createFairyFinishes} from './realm-fairy-finishes.js';

/** Sculpted garden furniture, authored in meters with local +Z facing forward.
 * No world placements, lights, renderer passes, downloaded assets or source
 * texture edits. Instances share finished geometry and materials; the library
 * owns disposal. Detach all instances before calling library.dispose().
 */
export function buildFairyFurniture(THREE) {
  const TAU = Math.PI * 2;
  const finishes = createFairyFinishes(THREE);
  const resources = new Set(), materials = new Map(), prototypes = new Map();
  let disposed = false;
  const color = value => new THREE.Color(value);
  const palettes = {
    lilac: {cloth:'#a77bc6',accent:'#dfafc6',sheen:'#eee0ff'},
    rose: {cloth:'#d785aa',accent:'#c7a9df',sheen:'#ffe8f0'},
    mint: {cloth:'#77b6a1',accent:'#cda6d2',sheen:'#e4fff3'},
  };
  function physical(name, values) {
    const material = new THREE.MeshPhysicalMaterial({name:`Fairy ${name}`,roughness:.4,metalness:0,clearcoatRoughness:.30,...values});
    material.userData.fairyFurniture = true;
    const finishStyle={porcelain:'porcelain',gold:'gold',leaf:'leaf',pearl:'enamel',pages:'paper'}[name];
    if(finishStyle)finishes.apply(material,finishStyle);
    materials.set(name,material);return material;
  }
  physical('porcelain',{color:color('#f7eadd'),roughness:.26,clearcoat:.7,clearcoatRoughness:.28,iridescence:.16,iridescenceIOR:1.3,iridescenceThicknessRange:[180,340]});
  physical('gold',{color:color('#e3bd73'),metalness:.82,roughness:.28,clearcoat:.18});
  physical('leaf',{color:color('#82a99c'),metalness:.1,roughness:.42,clearcoat:.3});
  physical('pearl',{color:color('#ffedf3'),roughness:.21,clearcoat:.9,iridescence:.42,iridescenceIOR:1.3,iridescenceThicknessRange:[260,420]});
  physical('glass',{color:color('#e2d4f7'),metalness:.05,roughness:.16,clearcoat:1,clearcoatRoughness:.18,
    transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,transmission:0});
  physical('glow',{color:color('#fff0d2'),emissive:color('#ffdba4'),emissiveIntensity:.65,roughness:.35});
  physical('pages',{color:color('#eee2c9'),roughness:.88});
  physical('tea',{color:color('#866151'),roughness:.21,clearcoat:.4});
  for (const [name,palette] of Object.entries(palettes)) {
    for (const role of ['cloth','accent']) {
      const material=physical(`${name}-${role}`,{color:color(palette[role]),roughness:.76,sheen:.85,sheenColor:color(palette.sheen),sheenRoughness:.78,clearcoat:.035});
      finishes.apply(material,'brocade');
    }
  }

  const v = (x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
  const signedPower=(n,p)=>Math.sign(n)*Math.pow(Math.abs(n),p);
  function surface(nu,nv,point,invert=false) {
    const positions=[],uv=[],indices=[];
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const p=point(i/nu,j/nv);positions.push(...p);uv.push(i/nu,j/nv);
    }
    const a=v(),b=v(),c=v(),ab=v(),ac=v();
    const triangle=(i,j,k)=>{
      a.fromArray(positions,i*3);b.fromArray(positions,j*3);c.fromArray(positions,k*3);
      if(ab.subVectors(b,a).cross(ac.subVectors(c,a)).lengthSq()>1e-19)indices.push(i,invert?k:j,invert?j:k);
    };
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;triangle(a,c,b);triangle(b,c,d);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    // UV seams and collapsed petal tips intentionally duplicate positions.
    // Average their shading normals without welding or deleting UV vertices.
    const groups=new Map(),normal=g.attributes.normal;
    for(let i=0;i<positions.length/3;i++){
      const key=positions.slice(i*3,i*3+3).map(n=>Math.round(n*1e8)).join(',');
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);
    }
    for(const ids of groups.values()){
      const n=v();for(const id of ids)n.add(a.fromBufferAttribute(normal,id));
      if(n.lengthSq()<1e-20)n.set(0,1,0);else n.normalize();
      for(const id of ids)normal.setXYZ(id,n.x,n.y,n.z);
    }
    return g;
  }
  function cushion(rx,ry,rz,{segments=48,rings=14,petals=0,power=.64}={}) {
    return surface(segments,rings,(u,t)=>{
      const a=u*TAU,b=(t-.5)*Math.PI,c=Math.cos(b),edge=1+petals*.035*Math.cos(6*a);
      return [rx*signedPower(Math.cos(a),power)*Math.pow(c,.58)*edge,ry*signedPower(Math.sin(b),.6),rz*signedPower(Math.sin(a),power)*Math.pow(c,.58)*edge];
    });
  }
  function petal(length,width,depth,curl,segments=16,rings=10) {
    return surface(segments,rings,(u,t)=>{
      const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.78);
      return [width*s*Math.cos(a),length*t,curl*t*t+depth*s*Math.sin(a)];
    });
  }
  function curve(points,closed=false){
    const clean=[];for(const point of points){const p=Array.isArray(point)?v(...point):point;
      if(!clean.length||p.distanceToSquared(clean.at(-1))>1e-16)clean.push(p);}
    if(closed&&clean.length>2&&clean[0].distanceToSquared(clean.at(-1))<1e-16)clean.pop();
    return new THREE.CatmullRomCurve3(clean,closed,'centripetal');
  }
  function tube(points,radius=.025,segments=28,radial=6,closed=false){return new THREE.TubeGeometry(curve(points,closed),segments,radius,radial,closed);}
  // A closed, tapered sweep gives curved stems a carved silhouette: the
  // changing radius is visible from a distance, unlike constant-width tubes.
  function carvedStem(points,radius=.07,segments=28,radial=10,flatten=1){
    const path=curve(points),frames=path.computeFrenetFrames(segments,false);
    return surface(radial,segments,(u,t)=>{
      const i=Math.round(t*segments),a=u*TAU;
      const r=radius*Math.pow(Math.sin(Math.PI*t),.20)*(1-.35*t+.17*Math.sin(3*Math.PI*t));
      const p=path.getPointAt(t).addScaledVector(frames.normals[i],r*Math.cos(a)).addScaledVector(frames.binormals[i],r*Math.sin(a)*flatten);
      return p.toArray();
    },true);
  }
  // A continuous carved wing/scroll profile forms each arm support. Its
  // rounded, bevelled edge and fitted feather relief are part of the furniture
  // silhouette, rather than an ornament floating over a tubular frame.
  function wingArm(b,side,{x,y,z,length,height,depth=.055}){
    const shape=new THREE.Shape(),p=(u,w)=>[u*length,w*height/.5];
    shape.moveTo(...p(0,.05));
    for(const points of [
      [.15,.12,.33,.10,.46,.07], [.67,.015,.85,.03,.95,.18],
      [1.08,.38,.89,.55,.72,.44], [.64,.39,.68,.27,.75,.29],
      [.82,.31,.79,.39,.76,.35], [.71,.29,.66,.27,.58,.30],
      [.43,.40,.32,.48,.21,.47], [.055,.48,-.045,.029,0,.05],
    ])shape.bezierCurveTo(...p(points[0],points[1]),...p(points[2],points[3]),...p(points[4],points[5]));
    const position=[side*x,y,z],rotation=[0,-Math.PI/2,0];
    const body=new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:.012,bevelSize:.009,bevelSegments:3,curveSegments:16});
    body.translate(0,0,-depth/2);b.add(body,'porcelain',position,rotation);
    const face=-side*(depth/2+.011),edgePath=new THREE.Curve();
    edgePath.getPoint=(t,out=v())=>{const point=shape.getPoint(t);return out.set(point.x,point.y,face);};
    b.add(new THREE.TubeGeometry(edgePath,180,.0028,5,true),'gold',position,rotation);
    // Long rounded feathers are carved into the broad shoulder of the wing.
    for(let i=0;i<3;i++){
      const points=[[.06+i*.035,.10+i*.055],[.19+i*.05,.20+i*.065],[.41+i*.065,.22+i*.020]]
        .map(([a,c])=>[a*length,c*height/.5,face-side*.001]);
      b.add(carvedStem(points,.014,18,8,.36),'porcelain',position,rotation);
      b.add(tube(points.map(([a,c,d])=>[a,c-.009,d-side*.004]),.0038,18,4),'gold',position,rotation);
    }
  }
  function tuftedSeat(rx,ry,rz,tufts){
    const power=.64;
    const dent=(x,z)=>tufts.reduce((sum,[a,b])=>sum+.026*Math.exp(-((x/rx-a)**2+(z/rz-b)**2)/.032),0);
    const point=(x,z)=>{
      const radial=Math.pow(Math.pow(Math.abs(x/rx),2/power)+Math.pow(Math.abs(z/rz),2/power),power/2);
      const rise=Math.pow(Math.max(0,1-Math.pow(radial,2/.58)),.3);
      return [x,ry*rise-dent(x,z)*Math.pow(rise,4)+.002,z];
    };
    const geometry=surface(72,28,(u,t)=>{
      const a=u*TAU,latitude=(t-.5)*Math.PI,c=Math.pow(Math.cos(latitude),.58);
      const x=rx*signedPower(Math.cos(a),power)*c,z=rz*signedPower(Math.sin(a),power)*c;
      const rise=signedPower(Math.sin(latitude),.6);
      return [x,ry*rise-(rise>0?dent(x,z)*Math.pow(rise,4):0),z];
    });
    // Curved quilting seams follow the padded top, including each depression.
    const seams=[];
    for(const [a,b]of tufts){
      for(const side of [-1,1]){
        const points=Array.from({length:13},(_,i)=>{
          const t=i/12,x=(a+side*.19*t)*rx,z=(b+.17*Math.sin(t*Math.PI/2))*rz;
          return point(x,z);
        });
        seams.push(tube(points,.0022,14,4));
      }
    }
    return {geometry,seams};
  }
  function shellPetal(length,width,depth,curl,segments=28,rings=14){
    return surface(segments,rings,(u,t)=>{
      const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.78),edge=1+.035*Math.sin(5*Math.PI*t);
      const relief=.010*s*Math.max(0,Math.sin(a))*(.5+.5*Math.cos(Math.cos(a)*Math.PI*6));
      return [width*s*Math.cos(a)*edge,length*t,curl*t*t+depth*s*Math.sin(a)+relief];
    });
  }
  function ellipse(rx,rz,y,segments=64,lobes=0,amplitude=0,power=1){
    return Array.from({length:segments},(_,i)=>{const a=i/segments*TAU,r=1+amplitude*Math.cos(lobes*a);return [rx*signedPower(Math.cos(a),power)*r,y,rz*signedPower(Math.sin(a),power)*r];});
  }
  function petalRim(length,width,depth,curl,fluted=false){
    const points=[];
    for(let side of [1,-1])for(let i=0;i<=15;i++){
      const t=side===1?i/15:1-i/15,s=Math.pow(Math.sin(Math.PI*t),.78);
      points.push([side*width*s*(fluted?1+.035*Math.sin(5*Math.PI*t):1),length*t,curl*t*t+depth*s*.22]);
    }
    return tube(points,.009,42,5,true);
  }
  // Embroidery follows the actual padded surface. A flat ornament would cut
  // through the cushion or float in front of its rounded shoulders.
  function pillowEmbroidery(rx,ry,rz,{power=.64,petals=0,border=false}={}){
    const point=([x,y])=>{
      const a=Math.PI/2-x*.60,b=y*.60,c=Math.cos(b),edge=1+petals*.035*Math.cos(6*a);
      return [rx*signedPower(Math.cos(a),power)*Math.pow(c,.58)*edge,ry*signedPower(Math.sin(b),.6),rz*signedPower(Math.sin(a),power)*Math.pow(c,.58)*edge+.002];
    };
    const paths=[[[0,-.58],[0,0],[0,.61]]];
    for(const sign of [-1,1])for(const y of [-.23,.13])paths.push([[0,y],[sign*.18,y+.08],[sign*.34,y+.26]]);
    const result=paths.map((path,i)=>tube(path.map(point),.003,i?6:10,4));
    if(border)result.push(tube(Array.from({length:32},(_,i)=>{const a=i/32*TAU;return point([Math.cos(a)*.78,Math.sin(a)*.81]);}),.0025,32,4,true));
    return result;
  }
  function petalEmbroidery(length,width,depth,curl,fluted=false){
    const point=(t,x=0)=>{
      const s=Math.pow(Math.sin(Math.PI*t),.78),z=depth*s*Math.sqrt(Math.max(0,1-(x/(width*s))**2));
      const relief=fluted?.010*s*(.5+.5*Math.cos((x/(width*s))*Math.PI*6)):0;
      return [x,length*t,curl*t*t+z+relief+.002];
    };
    const result=[tube([point(.17),point(.43),point(.72)],.003,18,4)];
    for(const sign of [-1,1]){
      result.push(tube([point(.36),point(.44,sign*width*.20),point(.53,sign*width*.43)],.003,8,4));
      for(const t of [.30,.51]){
        const leaf=[[t,0],[t+.045,sign*width*.28],[t+.15,sign*width*.34],[t+.115,sign*width*.08],[t,0]];
        result.push(tube(leaf.map(([a,x])=>point(a,x)),.0026,18,4,true));
      }
    }
    return result;
  }
  function roundedBook(w,h,d,r=.03){
    const s=new THREE.Shape();s.moveTo(-w/2+r,-d/2);
    s.lineTo(w/2-r,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
    s.lineTo(w/2,d/2-r);s.quadraticCurveTo(w/2,d/2,w/2-r,d/2);
    s.lineTo(-w/2+r,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);
    s.lineTo(-w/2,-d/2+r);s.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
    const g=new THREE.ExtrudeGeometry(s,{depth:h,steps:1,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2,curveSegments:4});
    g.rotateX(-Math.PI/2);return g;
  }
  function lathe(profile,segments=32){
    const g=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),segments),p=g.attributes.position,index=g.index,kept=[];
    const a=v(),b=v(),c=v();
    for(let i=0;i<index.count;i+=3){const x=index.getX(i),y=index.getX(i+1),z=index.getX(i+2);
      a.fromBufferAttribute(p,x);b.fromBufferAttribute(p,y);c.fromBufferAttribute(p,z);
      if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-20)kept.push(x,y,z);}
    g.setIndex(kept);return g;
  }
  function flutedPorcelain(profile,flutes=10,amount=.035){
    const g=lathe(profile,48),p=g.attributes.position;
    const height=Math.max(...profile.map(point=>point[1]));
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(x,z);
      const r=1+amount*Math.cos(flutes*a)*Math.sin(Math.PI*y/height);
      p.setXYZ(i,x*r,y,z*r);
    }
    g.computeVertexNormals();
    const groups=new Map(),n=g.attributes.normal;
    for(let i=0;i<p.count;i++){
      const key=[p.getX(i),p.getY(i),p.getZ(i)].map(a=>Math.round(a*1e7)).join(',');
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);
    }
    for(const ids of groups.values()){
      const sum=v();for(const i of ids)sum.add(v().fromBufferAttribute(n,i));sum.normalize();
      for(const i of ids)n.setXYZ(i,sum.x,sum.y,sum.z);
    }
    return g;
  }

  // Bake each component's local transform once, then merge by material. The
  // resulting templates are typically 4–7 draw calls, not one per bead/petal.
  function builder(type,seatHeight=null) {
    const buckets=new Map();
    function add(g,slot,position=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){
      const m=new THREE.Matrix4().compose(v(...position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),v(...scale));
      g.applyMatrix4(m);if(!buckets.has(slot))buckets.set(slot,[]);buckets.get(slot).push(g);return g;
    }
    function vine(points,radius=.03,slot='gold',segments=24){return add(tube(points,radius,segments,6),slot);}
    function leaf(position,rotation=[0,0,0],length=.28,width=.09,slot='leaf'){
      add(petal(length,width,.018,.065,12,6),slot,position,rotation);
      add(tube([[0,0,.001],[0,length*.5,.018],[0,length,.065]],.006,10,4),'gold',position,rotation);
    }
    function blossom(position,size=.12,rotation=[0,0,0],slot='porcelain'){
      // A small five-petal rosette, sculpted as a single scalloped cushion.
      const g=surface(30,8,(u,t)=>{const a=u*TAU,b=(t-.5)*Math.PI,r=size*(.78+.22*Math.cos(5*a))*Math.cos(b);return [r*Math.cos(a),size*.2*Math.sin(b),r*Math.sin(a)];});
      add(g,slot,position,rotation);add(cushion(size*.2,size*.2,size*.2,{segments:10,rings:6,power:1}),'pearl',position);
    }
    function legs(x,z,top=.7){
      for(const sx of [-1,1])for(const sz of [-1,1]){
        const points=[[sx*x,top+.06,sz*z],[sx*(x+.08),top*.79,sz*(z+.04)],[sx*(x+.02),top*.40,sz*(z-.04)],[sx*(x+.14),.12,sz*(z+.07)],[sx*(x+.20),.025,sz*(z+.15)]];
        add(carvedStem(points,.080,28,10,.78),'porcelain');
        vine(points.map(([a,y,c],i)=>[a+sx*(i===1?.047:.024),y,c+sz*.024]),.008,'gold',28);
        leaf([sx*(x+.08),.12,sz*(z+.05)],[0,sz*.5,-sx*.55],.25,.09,'porcelain');
      }
    }
    // A rococo apron is one continuous curved contour, with carved petal
    // relief fitted into its low point instead of floating over the seat.
    function apron(width,z,y){
      const path=[[-width,y+.12,z],[-width*.76,y,z+.03],[-width*.36,y-.015,z+.05],[0,y-.12,z+.06],[width*.36,y-.015,z+.05],[width*.76,y,z+.03],[width,y+.12,z]];
      add(carvedStem(path,.052,34,8,.78),'porcelain');
      vine(path.map(([x,a,c])=>[x,a+.018,c+.032]),.008,'gold',34);
      for(const s of [-1,1]){
        add(shellPetal(.27,.060,.016,.026,18,8),'gold',[0,y-.10,z+.065],[0,0,-s*.98]);
        vine([[s*width*.10,y-.025,z+.075],[s*width*.26,y+.055,z+.072],[s*width*.45,y+.065,z+.057],[s*width*.50,y+.015,z+.052]],.007,'gold',18);
      }
    }
    function finish(description){
      const meshes=[];let triangles=0,bytes=0;
      for(const [slot,parts] of buckets){
        let vertices=0,indices=0;for(const g of parts){vertices+=g.attributes.position.count;indices+=g.index?.count??g.attributes.position.count;}
        const positions=new Float32Array(vertices*3),normals=new Float32Array(vertices*3),uvs=new Float32Array(vertices*2),index=vertices>65535?new Uint32Array(indices):new Uint16Array(indices);
        let vertexOffset=0,indexOffset=0;
        for(const g of parts){
          positions.set(g.attributes.position.array,vertexOffset*3);normals.set(g.attributes.normal.array,vertexOffset*3);uvs.set(g.attributes.uv.array,vertexOffset*2);
          const count=g.index?.count??g.attributes.position.count;
          for(let i=0;i<count;i++)index[indexOffset+i]=vertexOffset+(g.index?g.index.getX(i):i);
          vertexOffset+=g.attributes.position.count;indexOffset+=count;g.dispose();
        }
        const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.BufferAttribute(uvs,2));geometry.setIndex(new THREE.BufferAttribute(index,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
        resources.add(geometry);meshes.push({geometry,slot});triangles+=index.length/3;bytes+=positions.byteLength+normals.byteLength+uvs.byteLength+index.byteLength;
      }
      const box=new THREE.Box3();for(const {geometry}of meshes)box.union(geometry.boundingBox);
      // Local floor is exact zero, including the lower gold vine/leaf tips.
      const floor=box.min.y;
      for(const {geometry}of meshes){geometry.translate(0,-floor,0);geometry.computeBoundingBox();geometry.computeBoundingSphere();}
      box.makeEmpty();for(const {geometry}of meshes)box.union(geometry.boundingBox);
      const surfaceHeight=type==='flowerTable'?meshes.find(part=>part.slot==='glass').geometry.boundingBox.max.y:null;
      prototypes.set(type,{meshes,seatHeight:seatHeight===null?null:seatHeight-floor,surfaceHeight,triangles,bytes,bounds:{min:box.min.toArray(),max:box.max.toArray()},description});
    }
    return {add,vine,leaf,blossom,legs,apron,finish};
  }

  // Armchair: a five-petal upholstered fan wraps the rounded seat. Continuous
  // gilt piping follows every custom petal edge and the seat's scalloped seam.
  {
    const b=builder('petalArmchair',.88);
    b.legs(.52,.43,.7);
    b.apron(.60,.51,.52);
    b.add(cushion(.79,.095,.69,{segments:48,rings:10,petals:1}),'porcelain',[0,.69,0]);
    b.add(cushion(.75,.145,.65,{segments:48,rings:16,petals:1}),'cloth',[0,.745,.015]);
    b.add(tube(ellipse(.748,.648,.75,64,6,.034,.64),.012,64,5,true),'gold');
    for(let i=-2;i<=2;i++){
      const angle=-i*.25,length=1.30-Math.abs(i)*.11,pos=[i*.07,.70,-.50],rotation=[-.12,0,angle];
      b.add(shellPetal(length,.295,.12,.19),i%2?'accent':'cloth',pos,rotation);
      b.add(petalRim(length,.295,.12,.19,true),'gold',pos,rotation);
      if(Math.abs(i)<2)for(const g of petalEmbroidery(length,.295,.12,.19,true))b.add(g,'gold',pos,rotation);
      b.blossom([i*.24,1.17+(.11-Math.abs(i)*.035),-.365],.048,[Math.PI/2,0,0],'gold');
    }
    for(const s of [-1,1]){
      wingArm(b,s,{x:.753,y:.57,z:-.46,length:.91,height:.48});
      b.add(petal(.84,.115,.095,-.17,18,10),'accent',[s*.76,1.04,-.39],[Math.PI/2,0,s*.08]);
      b.leaf([s*.64,.36,.34],[.25,0,-s*.75],.26,.11);
      b.vine([[s*.68,.84,.53],[s*.60,.87,.57],[s*.58,.95,.55],[s*.63,1.005,.49],[s*.70,.98,.44]],.012,'gold',20);
    }
    b.finish('Fluted brocade flower throne with rounded carved wing-scroll arms, chased feather relief, gilt fern embroidery, a shell apron and porcelain cabriole feet.');
  }

  // Lotus coffee table: a six-lobed glass medallion in a porcelain flower rim,
  // petal-shaped gilt inlays, and four intertwining stems below the glass.
  {
    const b=builder('flowerTable');
    const ring=ellipse(1.0,1.0,.94,72,6,.085);
    b.add(cushion(.99,.025,.99,{segments:72,rings:10,petals:2.3,power:1}),'glass',[0,.94,0]);
    b.add(tube(ring,.044,84,8,true),'porcelain');
    b.add(tube(ellipse(1.022,1.022,.945,72,6,.085),.010,84,5,true),'gold');
    for(let i=0;i<6;i++){
      const a=i*TAU/6,c=Math.cos(a),s=Math.sin(a);
      const points=[[0,.976,0],[c*.35-s*.15,.976,s*.35+c*.15],[c*.80,.976,s*.80],[c*.35+s*.15,.976,s*.35-c*.15],[0,.976,0]];
      b.add(tube(points,.007,28,4,true),'gold');
      const scroll=[[c*.90,.982,s*.90],[c*.66-s*.105,.982,s*.66+c*.105],[c*.49-s*.075,.982,s*.49+c*.075],[c*.53+s*.022,.982,s*.53-c*.022],[c*.63+s*.033,.982,s*.63-c*.033]];
      b.add(tube(scroll,.004,22,4),'gold');
      b.add(shellPetal(.24,.072,.022,.018,18,8),'porcelain',[c*.90,.91,s*.90],[Math.PI/2,a+Math.PI/2,0]);
      b.add(petal(.53,.16,.048,.10,14,8),'porcelain',[c*.23,.56,s*.23],[s*.55,0,-c*.55]);
      // Six fitted mother-of-pearl petals sit underneath the existing glass.
      // Their convex surfaces leave a real gap to the glass, avoiding coplanar
      // flashes while retaining the glass's existing collision height.
      b.add(shellPetal(.68,.16,.017,.018,24,12),'pearl',[c*.11,.891,s*.11],[Math.PI/2,0,a-Math.PI/2]);
      const fan=Array.from({length:17},(_,j)=>{
        const t=j/16,r=.22+t*.44,w=.045*Math.sin(t*Math.PI);
        return [c*r-s*w,.906+.003*Math.sin(t*Math.PI),s*r+c*w];
      });
      b.add(tube(fan,.0032,18,4),'gold');
    }
    for(let i=0;i<4;i++){
      const a=i*TAU/4+Math.PI/4,c=Math.cos(a),s=Math.sin(a);
      const stem=[[c*.62,.035,s*.62],[c*.40,.22,s*.40],[c*.18,.58,s*.18],[c*.50,.87,s*.50]];
      b.add(carvedStem(stem,.065,26,9),'porcelain');
      b.vine(stem.map(([x,y,z])=>[x-s*.035,y,z+c*.035]),.010,'gold',24);
      b.leaf([c*.55,.015,s*.55],[s*.9,a,-c*.9],.27,.12,'porcelain');
    }
    // A pierced quatrefoil stretcher links the four legs. It gives the table a
    // recognisable hand-carved underframe while keeping knee space open.
    const stretcher=Array.from({length:65},(_,i)=>{
      const a=i/64*TAU,r=.32+.085*Math.cos(4*a);
      return [Math.cos(a)*r,.32+.028*Math.cos(4*a),Math.sin(a)*r];
    });
    b.add(tube(stretcher,.028,80,8,true),'porcelain');
    b.add(tube(stretcher.map(([x,y,z])=>[x,y+.027,z]),.005,80,4,true),'gold');
    for(let i=0;i<4;i++){
      const a=i*TAU/4,c=Math.cos(a),s=Math.sin(a);
      b.add(shellPetal(.235,.072,.021,.028,20,10),'porcelain',[c*.065,.325,s*.065],[Math.PI/2,0,a-Math.PI/2]);
      b.add(petalRim(.235,.072,.021,.028,true),'gold',[c*.065,.325,s*.065],[Math.PI/2,0,a-Math.PI/2]);
    }
    b.blossom([0,.985,0],.09,[0,0,0],'pearl');
    b.finish('Lotus tea table with convex mother-of-pearl marquetry under glass, chased gold veins, sculpted porcelain petal clasps and a pierced quatrefoil underframe.');
  }

  // A tapered moon forms the frame itself, instead of a circle assembled from
  // primitive solids. Its tips pinch to points; the broad middle is softly oval.
  {
    const b=builder('crescentSwing',1.0);
    const moon=surface(84,12,(u,t)=>{
      const a=(.18+u*1.64)*Math.PI,p=t*TAU,r=.212*Math.pow(Math.sin(u*Math.PI),.8);
      return [(1.36+r*Math.cos(p))*Math.cos(a),(1.57+r*Math.cos(p))*Math.sin(a)+1.75,r*.52*Math.sin(p)-.12];
    },true);
    b.add(moon,'porcelain');
    for(const side of [-1,1]){
      const p=Array.from({length:61},(_,i)=>{const u=i/60,a=(.18+u*1.64)*Math.PI,r=.212*Math.pow(Math.sin(u*Math.PI),.8);return [(1.36+r*.85*side)*Math.cos(a),(1.57+r*.85*side)*Math.sin(a)+1.75,.012-.12];});
      b.add(tube(p,.016,64,6),'gold');
    }
    const moonFace=(u,offset=0)=>{
      const a=(.18+u*1.64)*Math.PI,r=.212*Math.pow(Math.sin(u*Math.PI),.8);
      return [(1.36+r*offset)*Math.cos(a),(1.57+r*offset)*Math.sin(a)+1.75,r*.52*Math.sqrt(1-offset*offset)-.114];
    };
    // Engraving follows the curved porcelain face, including its narrowing
    // tips. Small opposing curls read as a continuous hand-chased gold vine.
    b.add(tube(Array.from({length:65},(_,i)=>moonFace(.10+i/64*.80,.33*Math.sin(i/64*Math.PI*8))),.0055,88,4),'gold');
    for(let i=0;i<7;i++){
      const u=.18+i*.105;
      for(const sign of [-1,1])b.add(tube([moonFace(u,0),moonFace(u+.014,sign*.48),moonFace(u+.030,sign*.66),moonFace(u+.044,sign*.30),moonFace(u+.050,0)],.0028,22,4),'gold');
    }
    b.vine([[-.82,.09,-.12],[-.62,.08,.32],[-.22,.035,.65],[.38,.02,.55]],.045,'gold',28);
    b.vine([[-.82,.09,-.12],[-.60,.055,-.51],[0,.02,-.75],[.38,.02,-.55]],.045,'gold',28);
    b.vine([[-.94,2.94,-.12],[-.65,3.05,0],[0,3.17,.01],[.65,3.05,0],[.94,2.94,-.12]],.023,'gold',32);
    b.add(cushion(.84,.095,.53,{segments:44,rings:12,petals:1}),'porcelain',[0,.77,.04]);
    b.add(cushion(.80,.135,.51,{segments:44,rings:14}),'cloth',[0,.88,.06]);
    b.add(tube(ellipse(.81,.52,.875,60,0,0,.64),.011,60,5,true),'gold');
    const chainAnchorY=1.75+1.57*Math.sqrt(1-(.65/1.36)**2);
    for(const s of [-1,1]){
      const chain=[[s*.65,chainAnchorY,-.12],[s*.68,2.26,.04],[s*.70,1.55,.07],[s*.72,.87,.11]];
      b.vine(chain,.009,'gold',24);
      const path=curve(chain);
      for(let i=1;i<=12;i++)b.add(cushion(.025,.035,.025,{segments:8,rings:6,power:1}),'pearl',path.getPoint(i/13).toArray());
      b.blossom([s*.65,chainAnchorY,-.12],.078,[Math.PI/2,0,0],'gold');
      b.leaf([s*.35,.04,.47],[.9,s*.5,-s*.7],.38,.14,'leaf');
    }
    for(let i=-1;i<=1;i++){
      const rotation=[-.18,0,-i*.28],pos=[i*.12,.85,-.31];
      b.add(shellPetal(.75-Math.abs(i)*.07,.26,.095,.12,24,12),'accent',pos,rotation);
      b.add(petalRim(.75-Math.abs(i)*.07,.26,.095,.12,true),'gold',pos,rotation);
    }
    b.add(cushion(.27,.26,.09,{segments:32,rings:12,petals:1,power:.85}),'cloth',[.34,1.18,.02],[.12,.1,-.25]);
    for(const g of pillowEmbroidery(.27,.26,.09,{power:.85,petals:1,border:true}))b.add(g,'gold',[.34,1.18,.02],[.12,.1,-.25]);
    b.finish('Hand-chased porcelain crescent with fitted gold ivy engraving, pearl-beaded suspension and a fluted brocade blossom seat.');
  }

  {
    const b=builder('readingChaise',.87);
    b.legs(1.10,.43,.68);
    b.apron(1.20,.51,.50);
    b.add(cushion(1.44,.09,.65,{segments:52,rings:12}),'porcelain',[0,.65,0]);
    const seat=tuftedSeat(1.38,.15,.62,[[-.54,-.22],[0,-.22],[.54,-.22],[-.54,.26],[0,.26],[.54,.26]]);
    b.add(seat.geometry,'cloth',[0,.73,.01]);
    for(const seam of seat.seams)b.add(seam,'accent',[0,.73,.01]);
    b.add(tube(ellipse(1.39,.63,.73,72,0,0,.64),.012,72,5,true),'gold');
    for(let i=-2;i<=2;i++){
      const length=.80+.13*Math.cos(i*.8)-i*.055,pos=[i*.46,.67,-.46],rot=[-.13,0,-i*.13];
      b.add(shellPetal(length,.32,.10,.15,28,12),'accent',pos,rot);b.add(petalRim(length,.32,.10,.15,true),'gold',pos,rot);
      for(const g of petalEmbroidery(length,.32,.10,.15,true))b.add(g,'gold',pos,rot);
    }
    for(const s of [-1,1]){
      const p=[[s*1.12,.66,.50],[s*1.39,.96,.43],[s*1.42,1.12,.08],[s*1.27,1.17,-.32],[s*1.09,.94,-.44]];
      b.add(carvedStem(p,.125,40,12),'accent');b.add(tube(p.map(([x,y,z])=>[x+s*.085,y+.015,z]),.009,40,5),'gold');
      wingArm(b,s,{x:1.375,y:.61,z:-.44,length:.90,height:.42,depth:.049});
      b.add(cushion(.35,.29,.095,{segments:32,rings:12}),'accent',[s*.91,1.01,-.04],[.15,0,-s*.27]);
      for(const g of pillowEmbroidery(.35,.29,.095))b.add(g,'gold',[s*.91,1.01,-.04],[.15,0,-s*.27]);
      b.blossom([s*.91,1.02,.065],.055,[Math.PI/2,0,0],'gold');
    }
    b.add(cushion(.31,.24,.10,{segments:28,rings:12,petals:1,power:.86}),'cloth',[.15,.98,-.18],[.12,0,.17]);
    for(const g of pillowEmbroidery(.31,.24,.10,{power:.86,petals:1,border:true}))b.add(g,'gold',[.15,.98,-.18],[.12,0,.17]);
    b.finish('Asymmetric fern-embroidered scallop chaise with softly tufted stitched brocade, tapered bolsters, carved wing-scroll supports, gold feather relief and porcelain cabriole feet.');
  }

  {
    const b=builder('flowerLamp');
    b.add(cushion(.38,.045,.31,{segments:36,rings:10,petals:1}),'porcelain',[0,.05,0]);
    b.add(tube(ellipse(.35,.28,.075,44,6,.025),.011,48,5,true),'gold');
    b.vine([[0,.06,0],[-.13,.77,.04],[-.14,1.64,.03],[.06,2.39,0],[.36,2.58,0]],.034,'gold',44);
    b.leaf([-.10,.75,.035],[.05,0,-.85],.44,.14);
    b.leaf([-.13,1.34,.02],[0,2.5,.95],.36,.115,'porcelain');
    b.vine([[-.13,1.00,.03],[-.36,1.23,.04],[-.41,1.47,.06],[-.32,1.60,.05],[-.25,1.51,.035]],.012,'gold',26);
    b.leaf([-.37,1.29,.07],[0,0,.38],.20,.065,'porcelain');
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      b.add(petal(.69,.19,.035,.37,18,10),'glass',[.36,2.49,0],[0,a,Math.PI]);
      const points=[[0,0,0],[0,-.25,.05],[0,-.50,.20],[0,-.69,.37]].map(([x,y,z])=>[.36+x*Math.cos(a)+z*Math.sin(a),2.49+y,-x*Math.sin(a)+z*Math.cos(a)]);
      b.vine(points,.009,'gold',22);
      const tip=points.at(-1);b.add(cushion(.025,.044,.025,{segments:10,rings:6,power:1}),'pearl',[tip[0],tip[1]-.04,tip[2]]);
      // Curving side veins are carried by the glass petals themselves.
      const face=[];for(let k=0;k<=10;k++){
        const t=.27+k/10*.55,localX=.10*Math.pow(Math.sin(t*Math.PI),.78),localZ=.37*t*t+.024;
        face.push([.36+localX*Math.cos(a)+localZ*Math.sin(a),2.49-.69*t,-localX*Math.sin(a)+localZ*Math.cos(a)]);
      }
      b.vine(face,.004,'gold',14);
    }
    b.add(cushion(.17,.24,.17,{segments:24,rings:14,power:1}),'glow',[.36,2.13,0]);
    b.add(tube(ellipse(.13,.13,2.47,32),.013,36,5,true),'gold',[.36,0,0]);
    b.finish('Art nouveau bellflower lamp with a curling botanical stalk, enamel leaves, gold-veined glass petals and pearl dew drops.');
  }

  {
    const b=builder('teaSet');
    b.add(lathe([[0,0],[.21,0],[.27,.012],[.29,.027],[.26,.043],[.18,.045],[0,.033]],32),'porcelain');
    b.add(tube(ellipse(.265,.265,.037,40),.005,40,4,true),'gold');
    b.add(flutedPorcelain([[.075,.042],[.11,.055],[.125,.11],[.143,.21],[.151,.24],[.142,.245],[.134,.21],[.117,.11],[.10,.062],[.075,.057]],10,.032),'porcelain');
    b.add(tube(ellipse(.148,.148,.241,40),.004,40,4,true),'gold');
    b.add(tube([[.138,.208,0],[.228,.217,0],[.248,.156,0],[.212,.096,0],[.124,.106,0]],.012,24,6),'gold');
    b.add(tube([[.150,.210,.008],[.173,.250,.010],[.215,.256,.010],[.231,.235,.010],[.219,.218,.008]],.0045,16,5),'gold');
    b.add(tube([[.215,.100,.009],[.230,.078,.010],[.210,.064,.012],[.185,.074,.010],[.194,.091,.009]],.0045,16,5),'gold');
    b.add(cushion(.130,.003,.130,{segments:32,rings:6,power:1}),'tea',[0,.205,0]);
    for(const angle of [-.78,0,.78]){
      const point=(a,y)=>{const r=.125+(y-.11)*.18+.0015;return [Math.sin(a)*r,y,Math.cos(a)*r];};
      b.add(tube([point(angle,.121),point(angle,.153),point(angle,.192)],.0017,10,4),'gold');
      for(const side of [-1,1])b.add(tube([point(angle,.147),point(angle+side*.13,.161),point(angle+side*.22,.176)],.0017,7,4),'gold');
    }
    b.leaf([.145,.05,-.22],[Math.PI/2,.3,0],.15,.034,'gold');
    b.vine([[.18,.05,-.20],[.24,.052,-.10],[.30,.05,.03]],.007,'gold',12);
    b.finish('Fluted porcelain tea cup with miniature gilt vines, a double-scroll handle, fine gold lips and a sculpted botanical spoon.');
  }
  {
    const b=builder('bookStack');
    for(let i=0;i<3;i++){
      const w=.54-i*.035,d=.39+i*.016,y=i*.115+.012,rot=[0,(i-1)*.16,0];
      b.add(roundedBook(w-.022,.085,d-.018,.015),'pages',[0,y+.014,0],rot);
      for(const offset of [0,.099])b.add(roundedBook(w,.012,d,.025),i===1?'accent':'cloth',[0,y+offset,0],rot);
      for(let line=0;line<4;line++)b.add(tube([[-w/2+.045,.033+line*.016,d/2-.0005],[w/2-.045,.033+line*.016,d/2-.0005]],.0016,2,4),'gold',[0,y,0],rot);
      for(const z of [-.14,.14])b.add(tube([[-w/2+.03,y+.025,z],[-w/2+.016,y+.065,z],[-w/2+.03,y+.105,z]],.007,8,4),'gold');
    }
    b.leaf([.06,.354,.01],[Math.PI/2,0,.15],.20,.06,'gold');
    for(const x of [-1,1])for(const z of [-1,1])b.add(tube([[x*.125,.361,z*.158],[x*.178,.361,z*.158],[x*.184,.361,z*.116]],.0012,8,4),'gold',[0,0,0],[0,.16,0]);
    const bookmark=curve([[.084,.365,-.18],[.080,.370,.02],[.078,.367,.20],[.075,.301,.24],[.087,.165,.247],[.098,.120,.259]]);
    b.add(surface(6,26,(u,t)=>{
      const p=bookmark.getPoint(t),r=.018*(1-.22*Math.sin(t*Math.PI));
      return [p.x+(u-.5)*r*2,p.y+.0018*Math.cos(u*TAU),p.z];
    }),'accent');
    b.add(tube(Array.from({length:27},(_,i)=>{const t=i/26,p=bookmark.getPoint(t);return [p.x+.018*(1-.22*Math.sin(t*Math.PI)),p.y+.002,p.z];}),.0015,28,4),'gold');
    for(const s of [-1,1]){
      const border=[[-.03*s,.363,-.135],[-.12*s,.363,-.105],[-.15*s,.363,-.020],[-.12*s,.363,.100],[-.02*s,.363,.13]];
      b.add(tube(border,.002,20,4),'gold');
    }
    b.finish('Brocade spellbooks with gilt deckled pages, botanical cover tooling, raised spine bands and a curved silk ribbon bookmark.');
  }
  {
    const b=builder('budVase');
    b.add(flutedPorcelain([[0,0],[.14,0],[.19,.07],[.18,.18],[.12,.31],[.075,.37],[.077,.48],[.10,.50],[.085,.514],[.061,.49],[.06,.38],[.10,.31],[.155,.18],[.163,.075],[.13,.026],[0,.026]],12,.065),'porcelain');
    b.add(tube(ellipse(.090,.090,.507,36),.006,36,4,true),'gold');
    for(let i=0;i<6;i++){
      const a=i*TAU/6,c=Math.cos(a),s=Math.sin(a);
      b.vine([[s*.185,.08,c*.185],[s*.177,.17,c*.177],[s*.138,.27,c*.138],[s*.079,.37,c*.079]],.003,'gold',18);
      b.add(shellPetal(.145,.025,.005,.020,14,7),'leaf',[s*.13,.26,c*.13],[0,a,0]);
    }
    for(let i=0;i<3;i++){
      const x=(i-1)*.15,z=i===1?-.08:.04,top=.80+(i%2)*.14;
      b.vine([[0,.38,0],[x*.3,.62,z*.2],[x,top,z]],.009,'leaf',16);
      b.leaf([x*.3,.61,z*.2],[0,i*2,(i-1)*.6],.15,.045,'leaf');
      for(let j=0;j<5;j++)b.add(petal(.16,.065,.018,.085,10,6),'accent',[x,top-.06,z],[.2,j*TAU/5,0]);
      b.add(cushion(.037,.03,.037,{segments:10,rings:6,power:1}),'pearl',[x,top+.02,z]);
    }
    b.finish('Fluted glazed porcelain bud vase with chased gold ribs, enamel leaf appliqué and three sculpted pastel blossoms.');
  }

  const typeStats=Object.fromEntries([...prototypes].map(([type,p])=>[type,{triangles:p.triangles,drawCalls:p.meshes.length,bounds:p.bounds,seatHeight:p.seatHeight,surfaceHeight:p.surfaceHeight,description:p.description}]));
  const stats={types:typeStats,uniqueTriangles:[...prototypes.values()].reduce((n,p)=>n+p.triangles,0),
    geometryBytes:[...prototypes.values()].reduce((n,p)=>n+p.bytes,0),materials:materials.size,
    textures:new Set([...materials.values()].flatMap(m=>Object.values(m).filter(value=>value?.isTexture))).size,
    finishes:finishes.stats||null,additionalRenderPasses:0,createdInstances:0,units:'meters',frontAxis:'+Z'};
  function create(type,{palette='lilac'}={}){
    if(disposed)throw new Error('Fairy furniture library has been disposed.');
    const prototype=prototypes.get(type);if(!prototype)throw new RangeError(`Unknown fairy furniture type: ${type}`);
    if(!palettes[palette])throw new RangeError(`Unknown fairy furniture palette: ${palette}`);
    const group=new THREE.Group();group.name=`Fairy ${type}`;
    group.userData.fairyFurniture={type,palette,triangles:prototype.triangles,seatHeight:prototype.seatHeight,surfaceHeight:prototype.surfaceHeight,bounds:structuredClone(prototype.bounds),description:prototype.description};
    for(const {geometry,slot}of prototype.meshes){
      const material=materials.get(slot==='cloth'||slot==='accent'?`${palette}-${slot}`:slot);
      const mesh=new THREE.Mesh(geometry,material);mesh.name=`${type} · ${slot}`;mesh.castShadow=!material.transparent;mesh.receiveShadow=true;
      mesh.userData.fairyFurniture=true;
      if(material.transparent){
        if(type==='flowerTable')mesh.userData.solidCollision=true;
        else mesh.userData.noCollision=true;
      }
      group.add(mesh);
    }
    stats.createdInstances++;return group;
  }
  return {create,types:Object.freeze([...prototypes.keys()]),palettes:Object.freeze(Object.keys(palettes)),stats,
    dispose(){if(disposed)return;disposed=true;for(const geometry of resources)geometry.dispose();for(const material of materials.values())material.dispose();finishes.dispose();resources.clear();materials.clear();prototypes.clear();},
  };
}
