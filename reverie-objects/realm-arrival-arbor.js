import {createFoundationFinishes} from './realm-foundation-finishes.js';

/** A self-contained, two-sided faerie arrival threshold. Coordinates are local;
 * +Z/-Z is the walking axis and groundMinY is relative to the supplied origin.
 * All maps are authored here at their native dimensions. No asset fetches,
 * renderer hooks, lights, or browser state are needed. */
export function createArrivalArbor(THREE,{position=[0,0,0],yaw=0,groundMinY=-.3}={}){
  if(!Array.isArray(position)||position.length!==3||!position.every(Number.isFinite)||!Number.isFinite(yaw)||!Number.isFinite(groundMinY))throw new TypeError('Arrival arbor placement must be finite.');
  const foundationFinishes=createFoundationFinishes(THREE),borrowedMaterials=new Set(Object.values(foundationFinishes.materials));
  const TAU=Math.PI*2,group=new THREE.Group(),decor=new THREE.Group(),geometries=new Set(),materials=new Map(),textures=new Set(),instances=[];
  group.name='The Rosewing Arrival Arbor';group.position.fromArray(position);group.rotation.y=yaw;group.userData.noStaticBatch=true;
  decor.name='Climbing roses, wing cameos and bell lanterns';decor.userData.noCollision=true;decor.userData.noStaticBatch=true;
  let disposed=false;const footBottom=Math.min(-.035,groundMinY-.035),V=p=>new THREE.Vector3(...p),seq=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
  const counts={roses:0,leaves:0,angelWingPairs:0,roundedFeathers:0,bellLanterns:0,structuralRibs:2};
  const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();for(const mesh of instances)mesh.dispose();group.clear();for(const g of geometries)g.dispose();for(const m of materials.values())if(!borrowedMaterials.has(m))m.dispose();foundationFinishes.dispose();for(const t of textures)t.dispose();geometries.clear();materials.clear();textures.clear();};
  function map(name,size,paint,color=false){
    const data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){const value=paint(x/size,y/size),i=(y*size+x)*4;data[i]=value[0];data[i+1]=value[1];data[i+2]=value[2];data[i+3]=255;}
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);t.name=name;t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=4;t.needsUpdate=true;textures.add(t);return t;
  }
  function material(key,options){const m=new THREE.MeshPhysicalMaterial({name:`Arrival arbor · ${key}`,roughness:.46,clearcoat:.24,clearcoatRoughness:.42,...options});m.userData.arrivalArbor=true;materials.set(key,m);return m;}
  function clean(g){
    const p=g.attributes.position,index=g.index,keep=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    for(let i=0;i<(index?.count??p.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-20)keep.push(...ids);}
    g.setIndex(keep);return g;
  }
  function curve(points,closed=false){const p=points.map(V).filter((v,i,a)=>!i||v.distanceToSquared(a[i-1])>1e-14);if(closed&&p[0].distanceToSquared(p.at(-1))<1e-14)p.pop();return new THREE.CatmullRomCurve3(p,closed,'centripetal');}
  function surface(nu,nv,fn){
    const p=[],uv=[],index=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){p.push(...fn(i/nu,j/nv));uv.push(i/nu,j/nv);}
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;index.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);clean(g);g.computeVertexNormals();
    // Weld only normals at closed seams and collapsed rounded endpoints.
    const buckets=new Map(),n=g.attributes.normal;
    for(let i=0;i<g.attributes.position.count;i++){const key=[0,1,2].map(a=>Math.round(p[i*3+a]*1e6)).join(',');if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(i);}
    for(const ids of buckets.values()){const sum=new THREE.Vector3();for(const i of ids)sum.add(new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i)));if(sum.lengthSq()>1e-16){sum.normalize();for(const i of ids)n.setXYZ(i,sum.x,sum.y,sum.z);}}
    return g;
  }
  function petal(length,width,depth,curl,nu=12,nv=10){return surface(nu,nv,(u,t)=>{const a=u*TAU,r=Math.pow(Math.sin(Math.PI*t),.68);return[width*r*Math.cos(a),length*t,curl*t*t+depth*r*Math.sin(a)];});}
  function extrude(shape,depth=.05,bevel=.012){return clean(new THREE.ExtrudeGeometry(shape,{depth,steps:1,curveSegments:12,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:2}));}
  function lathe(profile,segments=28){return clean(new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),segments));}
  function builder(name){
    const buckets=new Map();
    function add(g,key,p=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){
      g.applyMatrix4(new THREE.Matrix4().compose(V(p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),V(scale)));
      if(key==='foundationWall'){const projected=foundationFinishes.projectUV(g,key);if(projected!==g)g.dispose();g=projected;}
      if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(g);geometries.add(g);return g;
    }
    function tube(points,r,key='gold',segments=32,radial=6,closed=false){return add(new THREE.TubeGeometry(curve(points,closed),segments,r,radial,closed),key);}
    function finish(){const result=new THREE.Group();result.name=name;
      for(const [key,parts]of buckets){let vc=0,ic=0;for(const g of parts){vc+=g.attributes.position.count;ic+=g.index?.count??g.attributes.position.count;}
        const p=new Float32Array(vc*3),n=new Float32Array(vc*3),uv=new Float32Array(vc*2),indices=vc>65535?new Uint32Array(ic):new Uint16Array(ic);let vo=0,io=0;
        for(const g of parts){if(!g.attributes.normal)g.computeVertexNormals();p.set(g.attributes.position.array,vo*3);n.set(g.attributes.normal.array,vo*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,vo*2);const count=g.index?.count??g.attributes.position.count;for(let i=0;i<count;i++)indices[io+i]=vo+(g.index?g.index.getX(i):i);vo+=g.attributes.position.count;io+=count;g.dispose();geometries.delete(g);}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(indices,1));g.computeBoundingBox();g.computeBoundingSphere();geometries.add(g);
        const mesh=new THREE.Mesh(g,materials.get(key));mesh.name=`${name} · ${key}`;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.noStaticBatch=true;result.add(mesh);
      }buckets.clear();return result;
    }return{add,tube,finish};
  }
  function installPrototype(prototype,placements,label){
    for(const part of prototype.children){const mesh=new THREE.InstancedMesh(part.geometry,part.material,placements.length);mesh.name=`${label} · ${part.material.name}`;
      placements.forEach((p,i)=>mesh.setMatrixAt(i,new THREE.Matrix4().compose(V(p.position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rotation||[0,0,0]))),new THREE.Vector3().setScalar(p.scale??1))));
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.noCollision=true;mesh.userData.noStaticBatch=true;instances.push(mesh);decor.add(mesh);
    }prototype.clear();
  }
  try{
    const grain=(u,v)=>Math.sin(TAU*(u*47+v*31))*.5+Math.cos(TAU*(u*113-v*89))*.3;
    const porcelain=map('Arrival arbor · newly painted porcelain grain',512,(u,v)=>{const h=245+2*Math.sin(TAU*(u*3+v*2)+Math.sin(v*TAU*2))+grain(u,v)*3;return[h,h-2,h+2];},true);
    const brushed=map('Arrival arbor · newly chased gold roughness',256,(u,v)=>{const h=222+10*Math.sin(TAU*v*91+.35*Math.sin(u*TAU*3))+grain(u,v)*6;return[h,h,h];});
    material('pearl',{color:0xf3e2dc,map:porcelain,roughness:.43,clearcoat:.32});
    material('blush',{color:0xe2a9c8,map:porcelain,roughness:.47});
    material('lilac',{color:0xc4addc,map:porcelain,roughness:.47});
    material('gold',{color:0xd5b470,metalness:.86,roughness:.56,roughnessMap:brushed,clearcoat:.12,clearcoatRoughness:.46});
    material('leaf',{color:0x8aaea1,roughness:.53,clearcoat:.14});
    material('glow',{color:0xffe5b8,emissive:0xf3bb7c,emissiveIntensity:.28,roughness:.51});
    materials.set('foundationWall',foundationFinishes.materials.foundationWall);
    const frame=builder('Grounded porcelain arch structure'),ornament=builder('Chased branches and wing relief');
    const archPoints=z=>[[-3.02,.31,z],[-3.04,2.1,z],[-3.10,4.30,z],[-2.96,6.03,z],[-2.49,7.13,z],[-1.35,7.82,z],[0,8.00,z],[1.35,7.82,z],[2.49,7.13,z],[2.96,6.03,z],[3.10,4.30,z],[3.04,2.1,z],[3.02,.31,z]];
    for(const z of[-.70,.70]){
      frame.tube(archPoints(z),.165,'pearl',112,10);
      const line=curve(archPoints(z));
      for(const offset of[-1,1])ornament.tube(seq(112,t=>{const p=line.getPoint(t);return[p.x+Math.sin(t*TAU*5)*.145,p.y+Math.cos(t*TAU*5)*.075,p.z+offset*.14];}),.033,'gold',112,6);
    }
    for(const side of[-1,1])for(const z of[-.70,.70]){
      const x=side*3.02;
      frame.add(lathe([[0,footBottom],[.42,footBottom],[.50,footBottom+.06],[.49,.07],[.47,.16],[.32,.25],[.28,.40],[.18,.56],[0,.56]],32),'foundationWall',[x,0,z]);
      ornament.add(lathe([[.30,.19],[.36,.20],[.39,.24],[.37,.28],[.29,.29],[.30,.19]],24),'gold',[x,0,z]);
      for(let i=0;i<5;i++){const a=i/5*TAU;ornament.add(petal(.57,.14,.040,.11),'blush',[x+.10*Math.sin(a),.16,z+.10*Math.cos(a)],[0,a,side*.13]);}
    }
    for(const [x,y]of[[-2.55,7.10],[-1.36,7.82],[0,8.0],[1.36,7.82],[2.55,7.10]])frame.tube([[x,y,-.70],[x,y+.12,0],[x,y,.70]],.055,'gold',24,6);
    for(const side of[-1,1]){
      // The outer branch loops retain negative space and never enter the walk.
      ornament.tube([[side*3.02,.40,-.02],[side*3.30,1.5,-.10],[side*3.62,3.0,-.06],[side*3.79,4.5,0],[side*3.49,5.48,.08],[side*2.86,6.73,.04]],.080,'gold',60,8);
      ornament.tube([[side*3.04,1.00,0],[side*3.67,2.35,.08],[side*3.84,3.65,.03],[side*3.62,4.42,-.06],[side*3.10,4.88,-.02]],.053,'pearl',52,8);
      for(const z of[-.95,.95])ornament.tube(seq(54,t=>[side*(3.06+.19*Math.sin(t*TAU*2)),.48+t*6.0,z+.05*Math.cos(t*TAU*2)]),.026,'leaf',64,6);
    }
    // A closed rounded-petal rosette is shared by every climbing flower.
    const rose=builder('Sculpted spiral rose prototype');
    for(let ring=0;ring<2;ring++){const n=ring?5:7;for(let i=0;i<n;i++){const a=i/n*TAU+ring*.31;rose.add(petal(ring?.51:.80,ring?.235:.31,ring?.055:.042,ring?.28:.19,8,8),ring?'blush':'lilac',[Math.sin(a)*.065,Math.cos(a)*.065,ring*.13],[0,0,-a]);}}
    rose.add(new THREE.SphereGeometry(.16,12,8),'blush',[0,0,.26],[0,0,0],[1,1,1.2]);
    const flowers=[];
    for(const face of[-1,1])for(const side of[-1,1]){
      const levels=face<0?[.85,2.04,3.28,4.59,5.89,7.14]:[1.30,3.00,4.80,6.56];
      for(const [i,y]of levels.entries()){const x=side*(y>6.8?2.29:y>6.2?2.84:3.07+.11*Math.sin(i*1.7+side));flowers.push({position:[x,y,face*1.00],rotation:[0,face>0?0:Math.PI,side*(.13+i*.37)],scale:(i%3===0?.53:.40)+(face>0?.025:0)});}
    }
    installPrototype(rose.finish(),flowers,'Layered climbing roses');counts.roses=flowers.length;
    const leaf=builder('Carved climbing-leaf prototype');leaf.add(petal(.75,.205,.030,.14,8,8),'leaf');leaf.tube(seq(12,t=>[0,.75*t,.14*t*t+.034*Math.sin(Math.PI*t)+.006]),.008,'gold',12,4);
    const leaves=[];
    for(const flower of flowers)for(const side of[-1,1]){
      const face=flower.position[2]>0?1:-1;leaves.push({position:[flower.position[0]+side*.11,flower.position[1]-.17,face*.965],rotation:[0,face>0?0:Math.PI,-side*(.85+(flower.position[1]%1)*.32)],scale:.66+(flower.position[1]%1)*.25});
    }
    for(const side of[-1,1])for(let i=0;i<4;i++)leaves.push({position:[side*(1.05+i*.43),7.93-i*.18,-.85],rotation:[0,Math.PI,-side*(1.08+i*.08)],scale:.64});
    installPrototype(leaf.finish(),leaves,'Gilt-veined climbing leaves');counts.leaves=leaves.length;
    function wingShape(side){const s=new THREE.Shape(),C=(...a)=>s.bezierCurveTo(...a.map((v,i)=>i%2===0?v*side:v));s.moveTo(side*.05,0);C(.01,.17,.22,.37,.45,.38);C(.76,.42,1.00,.28,1.02,.12);C(1.03,.025,.98,-.045,.90,-.06);C(.95,-.15,.90,-.25,.82,-.26);C(.73,-.27,.67,-.21,.64,-.17);C(.64,-.28,.57,-.35,.49,-.34);C(.38,-.33,.35,-.25,.35,-.19);C(.20,-.25,.07,-.15,.05,0);s.closePath();return s;}
    function heartShape(){const s=new THREE.Shape();s.moveTo(0,-.27);s.bezierCurveTo(-.46,.02,-.24,.38,0,.15);s.bezierCurveTo(.24,.38,.46,.02,0,-.27);s.closePath();return s;}
    function wings(p,scale=1,yaw=0){const origin=new THREE.Matrix4().compose(V(p),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3().setScalar(scale));
      function add(g,key,shift=[0,0,0]){g.translate(...shift);g.applyMatrix4(origin);ornament.add(g,key);}
      for(const side of[-1,1]){
        const gold=extrude(wingShape(side),.03,.012);gold.scale(1.07,1.07,1);add(gold,'gold',[side*.13,0,-.018]);
        add(extrude(wingShape(side),.04,.017),'pearl',[side*.13,0,0]);
        for(let i=0;i<4;i++){
          const end=[[.93,.10],[.81,-.19],[.52,-.26],[.24,-.16]][i],path=curve([[side*.18,.16,.082],[side*(.18+(end[0]-.18)*.58),.16+(end[1]-.16)*.32,.105],[side*end[0],end[1],.074]]);
          const g=surface(12,12,(u,t)=>{const q=path.getPoint(t),d=path.getTangent(t),len=Math.hypot(d.x,d.y)||1,r=Math.pow(Math.sin(Math.PI*t),.52),a=u*TAU,w=.060-i*.004;return[q.x+d.y/len*w*r*Math.cos(a),q.y-d.x/len*w*r*Math.cos(a),q.z+.023*r*Math.sin(a)];});
          add(g,'pearl',[side*.13,0,0]);counts.roundedFeathers++;
        }
      }
      add(extrude(heartShape(),.07,.016),'blush',[0,.035,.11]);const rim=extrude(heartShape(),.035,.010);rim.scale(1.14,1.14,1);add(rim,'gold',[0,.035,.064]);counts.angelWingPairs++;
    }
    wings([0,8.13,-.91],1.08,Math.PI);wings([0,8.13,.91],1.08,0);
    for(const side of[-1,1])wings([side*3.10,4.92,-1.03],.64,Math.PI);
    for(const side of[-1,1])for(const face of[-1,1]){
      const x=side*2.57,z=face*.78;
      ornament.tube([[side*3.02,5.81,z],[side*2.89,6.18,z],[side*2.59,6.27,z],[x,6.06,z]],.034,'gold',28,6);
      ornament.tube([[x,6.06,z],[x-.012,5.88,z+.015],[x,5.70,z]],.013,'gold',14,5);
      ornament.add(lathe([[0,.43],[.05,.42],[.08,.35],[.12,.24],[.16,.12],[.23,.055],[.24,.01],[.21,-.02],[.10,.015],[0,.065]],28),'pearl',[x,5.19,z]);
      ornament.add(lathe([[.22,-.021],[.244,-.016],[.249,.006],[.233,.026],[.22,-.021]],24),'gold',[x,5.19,z]);
      ornament.add(new THREE.SphereGeometry(.075,12,8),'glow',[x,5.17,z],[0,0,0],[.85,1.15,.85]);
      ornament.tube([[x,5.60,z],[x,5.69,z]],.027,'gold',3,6);counts.bellLanterns++;
    }
    const structure=frame.finish();structure.userData.solidCollision=true;structure.traverse(o=>{if(o.isMesh)o.userData.solidCollision=true;});
    decor.add(ornament.finish());decor.traverse(o=>{o.userData.noCollision=true;});group.add(structure,decor);group.updateMatrixWorld(true);
    let triangles=0,drawCalls=0,geometryBytes=0;const unique=new Set();
    group.traverse(o=>{if(!o.isMesh)return;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);drawCalls++;unique.add(o.geometry);});
    let uniqueTriangles=0;for(const g of unique){uniqueTriangles+=(g.index?.count??g.attributes.position.count)/3;for(const a of Object.values(g.attributes))geometryBytes+=a.array.byteLength;geometryBytes+=g.index?.array.byteLength??0;}
    const worldBox=new THREE.Box3().setFromObject(group),localBox=new THREE.Box3(),inverse=group.matrixWorld.clone().invert();
    group.traverse(o=>{if(!o.isMesh)return;const box=o.isInstancedMesh?o.boundingBox:o.geometry.boundingBox;localBox.union(box.clone().applyMatrix4(inverse.clone().multiply(o.matrixWorld)));});
    const stats={name:group.name,...counts,triangles,uniqueTriangles,geometryBytes,drawCalls,materials:materials.size,textures:textures.size,newTextureDimensions:[[512,512],[256,256]],opening:{width:4.2,height:6.5,axis:'+Z/-Z',minX:-2.1,maxX:2.1,minimumY:0,maximumY:6.5},foundation:{groundMinY,bottomY:footBottom,bases:4,finishes:foundationFinishes.stats},position:position.slice(),yaw,localBounds:{min:localBox.min.toArray(),max:localBox.max.toArray()},worldBounds:{min:worldBox.min.toArray(),max:worldBox.max.toArray()},additionalLights:0,additionalRenderPasses:0,externalAssets:0,originalTexturesModified:false,sourceAssetsModified:false};
    group.userData.arrivalArbor=stats;return{group,stats,dispose};
  }catch(error){dispose();throw error;}
}
