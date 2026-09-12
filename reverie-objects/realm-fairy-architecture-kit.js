import {createFairyFinishes} from './realm-fairy-finishes.js';
import {createFoundationFinishes} from './realm-foundation-finishes.js';

/** Shared resources for original fairy architecture. All units are meters.
 * add() takes ownership of a fresh geometry, bakes its transform and merges
 * components by material. Detach instances before disposing this kit.
 */
export function createFairyArchitectureKit(THREE) {
  const geometries=new Set(), materials={}, ownedMaterials=new Set(), TAU=Math.PI*2;
  const finishes=createFairyFinishes(THREE);
  let foundationFinishes;
  try{foundationFinishes=createFoundationFinishes(THREE);}catch(error){finishes.dispose();throw error;}
  let disposed=false;
  function material(key,options){
    const m=new THREE.MeshPhysicalMaterial({name:`Fairy architecture ${key}`,roughness:.42,metalness:0,clearcoatRoughness:.32,...options});
    const style=key==='gold'?'gold':key==='leaf'?'leaf':key==='pearl'?'porcelain':['lilac','rose','mint','dark'].includes(key)?'enamel':null;
    if(style)finishes.apply(m,style);
    m.userData.fairyArchitecture=true;materials[key]=m;ownedMaterials.add(m);return m;
  }
  // Finite coat roughness keeps subpixel highlights stable during flight.
  // Three defaults clearcoatRoughness to zero, which made curved pastel trim flash.
  material('pearl',{color:0xf0e1eb,roughness:.32,clearcoat:.65,clearcoatRoughness:.32,iridescence:.18,iridescenceThicknessRange:[200,360]});
  material('gold',{color:0xd2b477,metalness:.8,roughness:.31,clearcoat:.2});
  material('lilac',{color:0x9c77bc,roughness:.4,clearcoat:.55,iridescence:.12,iridescenceThicknessRange:[240,400]});
  material('rose',{color:0xd694b7,roughness:.4,clearcoat:.6});
  material('mint',{color:0x84baaa,roughness:.39,clearcoat:.5});
  material('mirror',{color:0xc5dedf,roughness:.22,metalness:.94,clearcoat:.35,clearcoatRoughness:.24});
  material('glass',{color:0xb0d9dc,roughness:.16,metalness:.08,clearcoat:.8,transparent:true,opacity:.23,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,transmission:0});
  material('glow',{color:0xffe5cb,emissive:0xffd3a1,emissiveIntensity:.48,roughness:.4});
  material('leaf',{color:0x658e80,roughness:.47,clearcoat:.15});
  material('dark',{color:0x594877,roughness:.38,clearcoat:.3});
  // Shared foundation materials have their own reference-counted owner.
  Object.assign(materials,foundationFinishes.materials);
  const v=(p)=>Array.isArray(p)?new THREE.Vector3(...p):p.clone();
  const stats={uniqueTriangles:0,geometryBytes:0,materials:Object.keys(materials).length,prototypes:0,textures:finishes.stats.textures??0,finishes:finishes.stats,foundationFinishes:foundationFinishes.stats,additionalRenderPasses:0};
  function smoothCoincidentNormals(g){
    const p=g.attributes.position,n=g.attributes.normal,buckets=new Map();
    for(let i=0;i<p.count;i++){
      const key=`${Math.round(p.getX(i)*1e6)},${Math.round(p.getY(i)*1e6)},${Math.round(p.getZ(i)*1e6)}`;
      let b=buckets.get(key);if(!b){b={normal:new THREE.Vector3(),indices:[]};buckets.set(key,b);}
      b.indices.push(i);b.normal.x+=n.getX(i);b.normal.y+=n.getY(i);b.normal.z+=n.getZ(i);
    }
    for(const b of buckets.values()){
      if(b.normal.lengthSq()<1e-16)continue;b.normal.normalize();
      for(const i of b.indices)n.setXYZ(i,b.normal.x,b.normal.y,b.normal.z);
    }
    return g;
  }
  function surface(nu,nv,fn){
    const positions=[],uv=[],index=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3();
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const point=fn(i/nu,j/nv);positions.push(...(Array.isArray(point)?point:point.toArray()));uv.push(i/nu,j/nv);
    }
    function triangle(i,j,k){
      a.fromArray(positions,i*3);b.fromArray(positions,j*3);c.fromArray(positions,k*3);
      if(ab.subVectors(b,a).cross(ac.subVectors(c,a)).lengthSq()>1e-18)index.push(i,j,k);
    }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
      const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;triangle(a,c,b);triangle(b,c,d);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return smoothCoincidentNormals(g);
  }
  function petal(length,width,depth,curl){return surface(20,14,(u,t)=>{
    const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.78);
    return [width*s*Math.cos(a),length*t,curl*t*t+depth*s*Math.sin(a)];
  });}
  function curve(points,closed=false){
    const clean=points.map(v).filter((p,i,a)=>!i||p.distanceToSquared(a[i-1])>1e-14);
    if(closed&&clean.length>2&&clean[0].distanceToSquared(clean.at(-1))<1e-14)clean.pop();
    if(clean.length<2)throw new Error('A fairy vine needs at least two distinct points.');
    return new THREE.CatmullRomCurve3(clean,closed,'centripetal');
  }
  function builder(name){
    const buckets=new Map();let finished=false;
    function add(g,key,position=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){
      if(finished||disposed)throw new Error('Architecture builder is closed.');
      if(key!=='foundation'&&!materials[key])throw new RangeError(`Unknown fairy material ${key}`);
      if(!g.attributes.normal)g.computeVertexNormals();
      if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));
      const m=new THREE.Matrix4().compose(v(position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),v(scale));g.applyMatrix4(m);
      function queue(part,style){
        if(style.startsWith('foundation')){
          const projected=foundationFinishes.projectUV(part,style);
          if(projected!==part)part.dispose();part=projected;
        }
        if(!buckets.has(style))buckets.set(style,[]);buckets.get(style).push(part);return part;
      }
      if(key==='foundation'){
        // Split material ownership, never the surface: copy every exact
        // triangle with its original normal and position. Upward faces get
        // floor mosaics; the skirt and bevels get fitted stone courses.
        const p=g.attributes.position,n=g.attributes.normal,idx=g.index;
        const parts={foundationFloor:{p:[],n:[]},foundationWall:{p:[],n:[]}};
        const a=new THREE.Vector3(),c=new THREE.Vector3(),d=new THREE.Vector3();
        for(let i=0;i<(idx?.count??p.count);i+=3){
          const ids=[0,1,2].map(j=>idx?idx.getX(i+j):i+j);
          a.fromBufferAttribute(p,ids[0]);c.fromBufferAttribute(p,ids[1]);d.fromBufferAttribute(p,ids[2]);
          const face=c.sub(a).cross(d.sub(a));
          const part=parts[face.y>face.length()*.60?'foundationFloor':'foundationWall'];
          for(const j of ids){part.p.push(p.getX(j),p.getY(j),p.getZ(j));part.n.push(n.getX(j),n.getY(j),n.getZ(j));}
        }
        const output=[];
        for(const [style,data]of Object.entries(parts))if(data.p.length){
          const part=new THREE.BufferGeometry();part.setAttribute('position',new THREE.Float32BufferAttribute(data.p,3));part.setAttribute('normal',new THREE.Float32BufferAttribute(data.n,3));
          output.push(queue(part,style));
        }
        g.dispose();return output;
      }
      return queue(g,key);
    }
    function tube(points,radius,key,segments=48,radial=8,closed=false){return add(new THREE.TubeGeometry(curve(points,closed),segments,radius,radial,closed),key);}
    function finish(metadata={}){
      if(finished||disposed)throw new Error('Architecture builder is closed.');finished=true;
      const group=new THREE.Group();group.name=name;let triangles=0,bytes=0;
      for(const [key,parts]of buckets){
        let vertices=0,count=0;for(const g of parts){vertices+=g.attributes.position.count;count+=g.index?.count??g.attributes.position.count;}
        const p=new Float32Array(vertices*3),n=new Float32Array(vertices*3),uv=new Float32Array(vertices*2),idx=vertices>65535?new Uint32Array(count):new Uint16Array(count);
        let vo=0,io=0;
        for(const g of parts){
          p.set(g.attributes.position.array,vo*3);n.set(g.attributes.normal.array,vo*3);uv.set(g.attributes.uv.array,vo*2);
          const count=g.index?.count??g.attributes.position.count;
          for(let i=0;i<count;i++)idx[io+i]=vo+(g.index?g.index.getX(i):i);
          vo+=g.attributes.position.count;io+=count;g.dispose();
        }
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingBox();g.computeBoundingSphere();geometries.add(g);
        const mesh=new THREE.Mesh(g,materials[key]);mesh.name=`${name} · ${key}`;mesh.castShadow=!materials[key].transparent;mesh.receiveShadow=true;mesh.userData.fairyArchitecture=true;
        if(materials[key].transparent)mesh.userData.noCollision=true;group.add(mesh);
        triangles+=idx.length/3;bytes+=p.byteLength+n.byteLength+uv.byteLength+idx.byteLength;
      }
      const box=new THREE.Box3().setFromObject(group);
      group.userData.fairyArchitecture={...metadata,name,triangles,geometryBytes:bytes,drawCalls:group.children.length,bounds:{min:box.min.toArray(),max:box.max.toArray()}};
      stats.uniqueTriangles+=triangles;stats.geometryBytes+=bytes;stats.prototypes++;buckets.clear();return group;
    }
    // Sculpted shell crests have a closed, softly bevelled body, a scalloped
    // perimeter, and radial relief ribs. +Z is the viewing side of the fan.
    function shellFan(position,rotation=[0,0,0],size=1,key='pearl'){
      const shape=new THREE.Shape(),edge=[];
      shape.moveTo(0,0);
      for(let i=0;i<=72;i++){
        const a=-1.18+i/72*2.36,r=1+.046*Math.cos(a/2.36*TAU*9);
        const p=[Math.sin(a)*r*.72*size,(Math.cos(a)*r*.80+.07)*size];
        edge.push(p);shape.lineTo(...p);
      }
      shape.quadraticCurveTo(.18*size,.035*size,0,0);shape.closePath();
      add(new THREE.ExtrudeGeometry(shape,{depth:.045*size,bevelEnabled:true,bevelThickness:.014*size,bevelSize:.014*size,bevelSegments:2,curveSegments:12}),key,position,rotation);
      const fitted=(points,r=.009,segments=16)=>add(new THREE.TubeGeometry(curve(points),segments,r*size,5,false),'gold',position,rotation);
      fitted(edge.map(([x,y])=>[x,y,.063*size]),.010,64);
      for(let i=0;i<9;i++){
        const a=-1.12+i/8*2.24;
        fitted(Array.from({length:14},(_,j)=>{
          const t=.10+j/13*.83,r=t*(1+.046*Math.cos(a/2.36*TAU*9));
          return [Math.sin(a)*r*.72*size,(Math.cos(a)*r*.80+.07*t)*size,(.064+.024*Math.sin(Math.PI*t))*size];
        }),i===4?.012:.006);
      }
    }
    // Open Art Nouveau scrolls form continuous calligraphic lines, leaving
    // the negative spaces open so distant silhouettes read as lace.
    function scroll(position,rotation=[0,0,0],width=1,height=1,key='gold',thickness=.018){
      const line=[];
      for(let i=0;i<=36;i++){
        const t=i/36,a=t*Math.PI*2.12,r=.46*(1-t)+.055;
        line.push([(.18+r*Math.cos(a))*width,t*height*.15+r*Math.sin(a)*height,.015*Math.sin(Math.PI*t)]);
      }
      add(new THREE.TubeGeometry(curve(line),44,thickness,6,false),key,position,rotation);
    }
    return {add,tube,shellFan,scroll,finish};
  }
  return {materials,builder,surface,petal,curve,stats,dispose(){
    if(disposed)return;disposed=true;for(const g of geometries)g.dispose();for(const m of ownedMaterials)m.dispose();ownedMaterials.clear();geometries.clear();foundationFinishes.dispose();finishes.dispose();
  }};
}
