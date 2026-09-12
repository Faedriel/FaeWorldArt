import {createFairyArchitectureKit} from './realm-fairy-architecture-kit.js';

/** Sculpted, shared pathway lanterns and botanical porcelain waymarkers.
 * World coordinates are supplied by the ground survey. No lights, timers,
 * render passes, route collision, or changes to existing textures. */
export function createPathOrnaments(THREE,{lanterns=[],signs=[]}={}) {
  const valid=p=>p?.position?.length===3&&p.position.every(Number.isFinite)&&Number.isFinite(p.yaw??0);
  if(!Array.isArray(lanterns)||!Array.isArray(signs)||![...lanterns,...signs].every(valid))throw new TypeError('Path ornaments require finite surveyed positions and yaws.');
  const group=new THREE.Group();group.name='Bellflower lanterns and botanical waymarkers';group.userData.noCollision=true;group.userData.noStaticBatch=true;
  const kit=createFairyArchitectureKit(THREE),instances=[],labelMaterials=new Set(),labelTextures=new Set(),labelGeometries=new Set(),textureCache=new Map();
  const TAU=Math.PI*2,vec=p=>new THREE.Vector3(...p);let disposed=false;
  kit.materials.gold.roughness=Math.max(.40,kit.materials.gold.roughness);
  kit.materials.glow.color.setHex(0xffead2);kit.materials.glow.emissive.setHex(0xffd7bc);kit.materials.glow.emissiveIntensity=.40;
  kit.materials.mirror.color.setHex(0xc7ded9);kit.materials.mirror.roughness=.35;kit.materials.mirror.metalness=.30;kit.materials.mirror.clearcoatRoughness=.35;
  const dispose=()=>{if(disposed)return;disposed=true;group.removeFromParent();group.clear();for(const m of instances)m.dispose();for(const g of labelGeometries)g.dispose();for(const m of labelMaterials)m.dispose();for(const t of labelTextures)t.dispose();kit.dispose();labelGeometries.clear();labelMaterials.clear();labelTextures.clear();textureCache.clear();};
  function lathe(profile,n=20){
    const g=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),n),idx=g.index,p=g.attributes.position,keep=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)];a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-19)keep.push(...ids);}g.setIndex(keep);return g;
  }
  function orb(rx,ry,rz,nu=12,nv=7){return kit.surface(nu,nv,(u,t)=>{const a=u*TAU,s=Math.cos((t-.5)*Math.PI);return[rx*s*Math.cos(a),ry*Math.sin((t-.5)*Math.PI),rz*s*Math.sin(a)];});}
  function petal(length,width,depth,curl){return kit.surface(8,5,(u,t)=>{const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.8);return[width*s*Math.cos(a),length*t,depth*s*Math.sin(a)+curl*t*t];});}
  function leaf(b,p,r,length=.34,width=.10,key='leaf'){
    b.add(petal(length,width,.017,.08),key,p,r);
    b.add(new THREE.TubeGeometry(kit.curve([[0,.03,.02],[0,length*.45,.033],[0,length*.91,.088]]),6,.006,4),'gold',p,r);
  }
  function lantern(variant){
    const b=kit.builder(variant?'Seafoam moonbell lantern':'Blush rosebell lantern'),hand=variant?-1:1,tint=variant?'mint':'rose';
    b.add(lathe([[0,0],[.18,0],[.225,.055],[.22,.105],[.15,.16],[.09,.24],[.065,.31],[0,.31]],16),tint);
    b.add(new THREE.TorusGeometry(.18,.013,4,20),'gold',[0,.128,0],[Math.PI/2,0,0]);
    b.tube([[0,.16,0],[hand*.025,.72,.02],[-hand*.09,1.60,0],[-hand*.12,2.49,.01],[hand*.04,2.99,.02],[hand*.37,3.15,.035],[hand*.55,2.95,.045]],.033,'gold',32,5);
    leaf(b,[-hand*.07,.31,.025],[.06,0,-hand*.53],.41,.11,tint);
    leaf(b,[-hand*.095,1.22,.025],[0,0,hand*.68],.43,.13,'leaf');
    leaf(b,[-hand*.095,1.73,.013],[.02,.4,-hand*.65],.35,.10,variant?'rose':'mint');
    b.tube([[-hand*.10,2.18,.02],[-hand*.38,2.32,.01],[-hand*.45,2.61,.005],[-hand*.27,2.69,.01],[-hand*.22,2.53,.02]],.018,'gold',18,5);
    b.add(orb(.065,.105,.041,8,5),'mirror',[-hand*.31,2.51,.025]);
    b.add(orb(.047,.074,.035,8,5),tint,[hand*.17,.235,.11]);
    b.tube([[hand*.55,2.95,.045],[hand*.55,2.84,.045]],.018,'gold',4,5);
    // A closed, scalloped bell shell: the inner surface and softened lip are
    // real geometry, so the shade remains complete from the path below.
    const neck=[hand*.55,2.84,.045];
    const shade=lathe([[.059,0],[.040,-.018],[.079,-.18],[.168,-.35],[.282,-.45],[.320,-.458],[.339,-.442],[.292,-.409],[.202,-.325],[.112,-.17],[.077,-.022],[.059,0]],24);
    const p=shade.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),t=Math.min(1,Math.max(0,-p.getY(i)/.458)),r=Math.hypot(x,z),flute=1+.10*Math.cos(a*(variant?6:5))*t*t;
      p.setXYZ(i,x*flute,p.getY(i)-.034*Math.cos(a*(variant?6:5))*t**4,z*flute);
    }shade.computeVertexNormals();b.add(shade,tint,neck);
    const rim=Array.from({length:49},(_,i)=>{const a=i/48*TAU,r=.329*(1+.10*Math.cos(a*(variant?6:5)));return[neck[0]+r*Math.cos(a),neck[1]-.45-.034*Math.cos(a*(variant?6:5)),neck[2]+r*Math.sin(a)];});
    b.tube(rim,.008,'gold',28,4,true);
    b.add(orb(.133,.163,.133,10,6),'glow',[neck[0],neck[1]-.35,neck[2]]);
    b.add(orb(.055,.075,.055,8,5),'pearl',[neck[0],neck[1]-.525,neck[2]]);
    // Three chased ribs follow the bell without overlapping the porcelain.
    for(let j=0;j<3;j++){
      const a=j*TAU/3,lobe=Math.cos(a*(variant?6:5));
      const chased=[[.045,.083],[.17,.112],[.325,.202],[.409,.292]].map(([d,rr])=>{const t=d/.458,r=rr*(1+.10*lobe*t*t)+.011;return[neck[0]+Math.cos(a)*r,neck[1]-d-.034*lobe*t**4,neck[2]+Math.sin(a)*r];});
      b.tube(chased,.006,'gold',6,4);
    }
    return b.finish({kind:'bellflower-path-lantern',variant,emissiveOnly:true});
  }
  function plaqueShape(scale=1){
    const s=new THREE.Shape();s.moveTo(-.74*scale,.10*scale);
    s.bezierCurveTo(-.94*scale,.12*scale,-.91*scale,.36*scale,-.74*scale,.40*scale);
    s.bezierCurveTo(-.39*scale,.49*scale,-.15*scale,.435*scale,0,.49*scale);
    s.bezierCurveTo(.15*scale,.435*scale,.39*scale,.49*scale,.74*scale,.40*scale);
    s.bezierCurveTo(.91*scale,.36*scale,.94*scale,.12*scale,.74*scale,.10*scale);
    s.bezierCurveTo(.38*scale,.025*scale,.14*scale,.065*scale,0,.022*scale);
    s.bezierCurveTo(-.14*scale,.065*scale,-.38*scale,.025*scale,-.74*scale,.10*scale);s.closePath();return s;
  }
  function signPrototype(){
    const b=kit.builder('Botanical porcelain path marker');
    b.add(lathe([[0,0],[.18,0],[.22,.06],[.20,.11],[.10,.18],[.064,.26],[0,.26]],18),'rose');
    b.tube([[0,.15,0],[-.035,.52,0],[.025,.92,0],[0,1.40,0]],.035,'gold',22,6);
    leaf(b,[-.005,.25,.022],[0,0,-.55],.37,.12,'mint');
    leaf(b,[.015,.85,.009],[0,0,.62],.30,.095,'rose');
    const shape=plaqueShape();b.add(new THREE.ExtrudeGeometry(shape,{depth:.056,bevelEnabled:true,bevelSize:.011,bevelThickness:.010,bevelSegments:2,curveSegments:8}),'pearl',[0,1.37,0]);
    const points=shape.getSpacedPoints(80).map(p=>[p.x,1.37+p.y,.079]);b.tube(points,.010,'gold',56,5,true);
    for(const s of[-1,1]){
      b.tube([[s*.53,1.79,.083],[s*.42,1.89,.10],[s*.22,1.88,.095],[s*.10,1.97,.07]],.014,'gold',14,5);
      leaf(b,[s*.25,1.82,.065],[0,0,-s*.94],.22,.068,s>0?'mint':'rose');
    }
    b.add(orb(.057,.068,.028,10,6),'mirror',[0,1.91,.077]);
    return b.finish({kind:'botanical-porcelain-waymarker'});
  }
  function instanced(prototype,list,name){
    if(!list.length)return;
    const matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();
    for(const part of prototype.children){
      const mesh=new THREE.InstancedMesh(part.geometry,part.material,list.length);mesh.name=`${name} · ${part.material.name}`;
      list.forEach((p,i)=>{rotation.setFromAxisAngle(new THREE.Vector3(0,1,0),p.yaw??0);matrix.compose(vec(p.position),rotation,new THREE.Vector3(1,1,1));mesh.setMatrixAt(i,matrix);});
      mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.castShadow=false;mesh.receiveShadow=true;mesh.userData.noCollision=true;mesh.userData.noStaticBatch=true;instances.push(mesh);group.add(mesh);
    }
  }
  function labelTexture(label,direction){
    const key=`${label}|${direction}`;if(textureCache.has(key))return textureCache.get(key);
    let t;
    if(typeof document!=='undefined'){
      const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d');if(!c)throw new Error('The botanical waymarker needs a 2D canvas context.');
      c.clearRect(0,0,1024,512);c.textAlign='center';c.textBaseline='middle';c.font='600 104px Georgia,serif';c.fillStyle='#64425e';c.fillText(label,512,243,820);
      c.strokeStyle='#b79962';c.lineWidth=3;c.beginPath();c.moveTo(190,374);c.bezierCurveTo(300,405,390,372,512,385);c.bezierCurveTo(635,372,727,405,834,374);c.stroke();
      c.fillStyle='#729b82';for(const x of[240,307,717,784]){c.beginPath();c.ellipse(x,378,19,7,x<512?-.4:.4,0,TAU);c.fill();}
      if(direction){const right=direction==='right'||direction===1||direction>0,sgn=right?1:-1;c.strokeStyle='#a47e41';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(512-sgn*42,436);c.lineTo(512+sgn*42,436);c.moveTo(512+sgn*22,420);c.lineTo(512+sgn*42,436);c.lineTo(512+sgn*22,452);c.stroke();}
      t=new THREE.CanvasTexture(canvas);
    }else{
      t=new THREE.DataTexture(new Uint8Array(1024*512*4),1024,512,THREE.RGBAFormat);t.needsUpdate=true;
    }
    t.name=`Original painted waymarker: ${label}`;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;labelTextures.add(t);textureCache.set(key,t);return t;
  }
  try{
    const variants=[lantern(0),lantern(1)],marker=signPrototype();
    const variantLists=[[],[]];lanterns.forEach((p,i)=>{const id=Number.isFinite(Number(p.variant))?Math.abs(Math.round(Number(p.variant)))%2:i%2;variantLists[id].push(p);});
    variants.forEach((p,i)=>instanced(p,variantLists[i],i?'Seafoam moonbells':'Blush rosebells'));instanced(marker,signs,'Porcelain path markers');
    const labelGeometry=new THREE.PlaneGeometry(1.48,.37);labelGeometries.add(labelGeometry);
    const materialCache=new Map();
    for(const sign of signs){
      const label=String(sign.label??'Tea garden'),direction=sign.direction??0,texture=labelTexture(label,direction);let material=materialCache.get(texture);
      if(!material){material=new THREE.MeshStandardMaterial({name:`Painted ${label} lettering`,map:texture,transparent:true,depthWrite:false,roughness:.75,metalness:0,polygonOffset:false});labelMaterials.add(material);materialCache.set(texture,material);}
      const root=new THREE.Group();root.name=`Way to ${label}`;root.position.fromArray(sign.position);root.rotation.y=sign.yaw??0;root.userData.noCollision=true;
      const lettering=new THREE.Mesh(labelGeometry,material);lettering.position.set(0,1.62,.081);lettering.userData.noCollision=true;lettering.userData.noStaticBatch=true;root.add(lettering);group.add(root);
    }
    group.updateMatrixWorld(true);let triangles=0,drawCalls=0;group.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);drawCalls++;}});
    const box=new THREE.Box3().setFromObject(group),stats={lanterns:lanterns.length,signs:signs.length,lanternVariants:variantLists.map(a=>a.length),triangles,uniqueTriangles:kit.stats.uniqueTriangles+2,drawCalls,textureDimensions:[1024,512],labelTextures:labelTextures.size,lanternBounds:variants.map(p=>p.userData.fairyArchitecture.bounds),signBounds:marker.userData.fairyArchitecture.bounds,worldBounds:box.isEmpty()?null:{min:box.min.toArray(),max:box.max.toArray()},goldRoughness:kit.materials.gold.roughness,additionalLights:0,additionalRenderPasses:0,originalAssetsModified:false,originalTexturesModified:false};
    return{group,stats,dispose};
  }catch(error){dispose();throw error;}
}
