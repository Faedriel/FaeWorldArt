/** Sculpted door and portal jewelry fitted to the exact original pink castle.
 * Original source units, +Z front; caller supplies the same source Z offset as
 * the restored castle. Independent ownership, no source edits or collision.
 */
export function addOriginalDollhousePortal(THREE, originalRoot, {sourceZOffset=2.8}={}){
  if(!THREE?.BufferGeometry||!Number.isFinite(sourceZOffset))throw new TypeError('Portal ornaments need Three.js and a finite source offset.');
  const group=new THREE.Group();group.name='Original dollhouse · the rose-carved doorway';
  group.userData.noCollision=true;group.userData.noStaticBatch=true;
  const geometries=new Set(),materials=new Set(),textures=new Set(),buckets=new Map(),prototypes=new Map();let disposed=false;
  const stats={source:'Original castle buildPanel door dimensions and closed transforms',sourceZOffset,doorCenterX:0,originalArchitectureModified:false,originalTexturesModified:false,additionalLights:0,additionalRenderPasses:0,drawCalls:0,triangles:0,geometryBytes:0,sculptedPanels:0,botanicalLeaves:0,roses:0,goldVines:0,newTextures:[]};
  const own=(value,set)=>{set.add(value);return value;};
  const release=g=>{g.dispose();geometries.delete(g);};
  function dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.clear();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();geometries.clear();materials.clear();textures.clear();buckets.clear();prototypes.clear();}
  try{
  const TAU=Math.PI*2,Z=sourceZOffset-.4,V=p=>new THREE.Vector3(...p),seq=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
  // Low-contrast native 1024 glaze grain is shared by every new material. It
  // adds quiet surface variation while preserving every original painted map.
  const resolution=1024,data=new Uint8Array(resolution*resolution*4);
  for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
    const u=x/resolution,v=y/resolution,grain=((Math.imul(x+31,73856093)^Math.imul(y+17,19349663))>>>0)%17/17;
    const h=Math.round(225+4*Math.sin(TAU*(u*11+v*3)+.4*Math.sin(TAU*v*7))+3*Math.cos(TAU*v*53)+(grain-.5)*4),i=(y*resolution+x)*4;
    data[i]=data[i+1]=data[i+2]=h;data[i+3]=255;
  }
  const glaze=own(new THREE.DataTexture(data,resolution,resolution,THREE.RGBAFormat,THREE.UnsignedByteType),textures);
  glaze.name='Rose portal · hand-burnished satin grain 1024';glaze.colorSpace=THREE.NoColorSpace;glaze.wrapS=glaze.wrapT=THREE.RepeatWrapping;glaze.generateMipmaps=true;glaze.minFilter=THREE.LinearMipmapLinearFilter;glaze.magFilter=THREE.LinearFilter;glaze.anisotropy=4;glaze.needsUpdate=true;
  stats.newTextures.push({name:glaze.name,width:resolution,height:resolution,bytes:data.byteLength});
  const mat=(name,options)=>own(new THREE.MeshPhysicalMaterial({name:`Rose portal · ${name}`,roughness:.42,roughnessMap:glaze,bumpMap:glaze,bumpScale:.00065,metalness:0,clearcoat:.24,clearcoatRoughness:.36,...options}),materials);
  const M={gold:mat('warm chased gold',{color:0xd4b476,metalness:.82,roughness:.42,clearcoat:.16}),porcelain:mat('carved warm ivory',{color:0xffefdc,roughness:.39,clearcoat:.42}),rose:mat('rose opal enamel',{color:0xeac1cc,roughness:.40,clearcoat:.46}),sage:mat('pale celadon enamel',{color:0xa5beaa,roughness:.45,clearcoat:.28})};
  function clean(g){
    const p=g.attributes.position,index=g.index,kept=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    for(let k=0;k<(index?.count??p.count);k+=3){const i=index?index.getX(k):k,j=index?index.getX(k+1):k+1,l=index?index.getX(k+2):k+2;a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,j);c.fromBufferAttribute(p,l);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-20)kept.push(i,j,l);}
    g.setIndex(kept);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(p.count*2),2));return g;
  }
  function add(g,key,p=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){
    own(g,geometries);clean(g);g.applyMatrix4(new THREE.Matrix4().compose(V(p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),V(scale)));
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(g);return g;
  }
  function tube(points,radius=.005,key='gold',segments=32,closed=false){
    const list=points.map(V);if(closed&&list.length>2&&list[0].distanceToSquared(list.at(-1))<1e-16)list.pop();
    const curve=new THREE.CatmullRomCurve3(list,closed,'centripetal');stats.goldVines++;return add(new THREE.TubeGeometry(curve,segments,radius,5,closed),key);
  }
  function orb(p,r=.018,key='porcelain',scale=[1,1,.7]){
    if(!prototypes.has('pearl'))prototypes.set('pearl',own(new THREE.SphereGeometry(1,12,8),geometries));
    return add(prototypes.get('pearl').clone(),key,p,[0,0,0],scale.map(x=>x*r));
  }
  function leafGeometry(){
    if(prototypes.has('leaf'))return prototypes.get('leaf').clone();
    const p=[],uv=[],index=[],nu=10,nv=12;
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const t=j/nv,a=i/nu*TAU,r=Math.pow(Math.sin(Math.PI*t),.78);
      p.push(.45*r*Math.cos(a),t,.14*r*Math.sin(a)+.16*Math.sin(Math.PI*t)*t);uv.push(i/nu,t);
    }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;index.push(a,c,b,b,c,d);}
    const g=own(new THREE.BufferGeometry(),geometries);g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);clean(g);g.computeVertexNormals();prototypes.set('leaf',g);return g.clone();
  }
  function leaf(p,length,width,depth,key='sage',angle=0,vein=true){
    stats.botanicalLeaves++;add(leafGeometry(),key,p,[0,0,angle],[width/.45,length,depth/.14]);
    if(vein){const origin=V(p),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),angle);tube(seq(12,t=>{const s=Math.pow(Math.sin(Math.PI*t),.78),z=depth*s+depth*(.16/.14)*Math.sin(Math.PI*t)*t+.0024;return new THREE.Vector3(0,length*t,z).applyQuaternion(q).add(origin).toArray();}),.0025,'gold',14);}
  }
  function rose(p,r=.055){
    stats.roses++;
    for(let k=0;k<7;k++)leaf(p,r,r*.42,r*.14,k%2?'porcelain':'rose',k*TAU/7,false);
    for(let k=0;k<4;k++)leaf([p[0],p[1],p[2]+r*.18],r*.60,r*.27,r*.12,'rose',k*TAU/4+.4,false);
    orb([p[0],p[1],p[2]+r*.42],r*.19,'gold',[1,1,.7]);
  }
  function cartouche(w,h){
    const s=new THREE.Shape(),x=w/2,y=h/2;
    s.moveTo(0,-y);s.bezierCurveTo(x*.35,-y*.98,x*.20,-y*.78,x*.74,-y*.72);s.bezierCurveTo(x*1.12,-y*.65,x*.90,-y*.29,x*.93,0);
    s.bezierCurveTo(x*.90,y*.29,x*1.12,y*.65,x*.74,y*.72);s.bezierCurveTo(x*.20,y*.78,x*.35,y*.98,0,y);
    s.bezierCurveTo(-x*.35,y*.98,-x*.20,y*.78,-x*.74,y*.72);s.bezierCurveTo(-x*1.12,y*.65,-x*.90,y*.29,-x*.93,0);
    s.bezierCurveTo(-x*.90,-y*.29,-x*1.12,-y*.65,-x*.74,-y*.72);s.bezierCurveTo(-x*.20,-y*.78,-x*.35,-y*.98,0,-y);s.closePath();return s;
  }
  function relief(shape,depth,key,p,bevel=.005){return add(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:20,steps:1}),key,p);}
  function panel(x,y,w,h,upper){
    stats.sculptedPanels++;
    relief(cartouche(w,h),.020,'porcelain',[x,y,Z+.082],.005);
    relief(cartouche(w*.78,h*.82),.006,upper?'rose':'sage',[x,y,Z+.110],.003);
    tube(cartouche(w*.91,h*.93).getSpacedPoints(72).map(p=>[x+p.x,y+p.y,Z+.115]),.0047,'gold',72,true);
    tube(cartouche(w*.68,h*.72).getSpacedPoints(64).map(p=>[x+p.x,y+p.y,Z+.122]),.0028,'gold',64,true);
    if(upper){
      tube(seq(32,t=>[x+.017*Math.sin(t*Math.PI*2),y-h*.30+t*h*.59,Z+.138]),.004,'gold',34);
      for(let k=0;k<4;k++)for(const side of[-1,1])leaf([x+.015*Math.sin(k),y-h*.23+k*h*.14,Z+.138],h*.15,w*.12,.0055,k%2?'porcelain':'sage',side*.68);
      rose([x,y+h*.21,Z+.143],.039);
    }else{
      rose([x,y,Z+.144],.063);
      for(const side of[-1,1]){leaf([x,y-h*.13,Z+.136],h*.22,w*.12,.006,'porcelain',side*.52+Math.PI);leaf([x,y+h*.09,Z+.138],h*.22,w*.11,.006,'sage',side*.64);}
    }
  }
  // The original heart atY1.72 and inner knobs atX±.13/Y1.10 remain fully
  // exposed. Raised fields fit inside the existing original gold rectangles.
  for(const side of[-1,1]){panel(side*.31,.52,.34,.48,false);panel(side*.32,1.28,.25,.54,true);}
  // Reeding and botanical relief conform to the original .16m white jambs.
  // No new post, footing, porch or object occupies the walking approach.
  for(const side of[-1,1]){
    const x=side*.72;
    for(const dx of[-.037,.037])tube(seq(40,t=>[x+dx,.39+t*1.55,Z+.129+.003*Math.sin(t*Math.PI)]),.004,'gold',40);
    const stem=seq(52,t=>[x+.022*Math.sin(t*TAU*1.6),.41+t*1.59,Z+.145+.007*Math.sin(t*Math.PI)]);tube(stem,.0062,'gold',56);
    for(let k=0;k<9;k++){
      const t=(k+.35)/9,p=[x+.022*Math.sin(t*TAU*1.6),.41+t*1.59,Z+.148+.007*Math.sin(t*Math.PI)],direction=k%2?1:-1;
      leaf(p,.105,.025,.007,k%3?'porcelain':'sage',direction*.80);
    }
    // Two low, shaped rose corbels and a small bud finish each vine vertically.
    relief(cartouche(.15,.22),.019,'porcelain',[x,.385,Z+.121],.006);
    rose([x,.395,Z+.153],.049);rose([x,2.025,Z+.153],.041);
  }
  // A softly rolled, scalloped arch surrounds the original rings rather than
  // replacing them. Its radial inner edge stays outside the original .956m
  // outer ring; its crown leaves the original center moon medallion unobscured.
  {
    const p=[],uv=[],index=[],nu=16,nv=128;
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const t=j/nv,theta=t*Math.PI,u=i/nu*TAU,r=1.009+.0045*Math.cos(theta*16),cross=.025*(.65+.35*Math.sin(Math.PI*t));
      p.push((r+cross*Math.cos(u))*Math.cos(theta),2.22+(r+cross*Math.cos(u))*Math.sin(theta),Z+.097+.024*Math.sin(u));uv.push(i/nu,t);
    }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;index.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();add(g,'porcelain');
    for(const radius of[.998,1.023])tube(seq(128,t=>{const a=t*Math.PI;return[radius*Math.cos(a),2.22+radius*Math.sin(a),Z+.123];}),.0042,'gold',128);
    for(const side of[-1,1])orb([side*1.0135,2.22,Z+.097],.020,'porcelain',[1,1,1.2]);
    for(let i=0;i<11;i++){
      const angle=(18+i*14.4)/180*Math.PI,p=[1.012*Math.cos(angle),2.22+1.012*Math.sin(angle),Z+.127];
      // The central moon is below this outer crown; blossoms are kept at the
      // shoulders so the original celestial sequence remains the focal point.
      leaf(p,.085,.020,.006,i%3?'porcelain':'sage',angle-Math.PI/2+(i%2?.24:-.24));
      orb([p[0],p[1],Z+.139],.010,'gold',[1,1,.55]);
    }
    for(const side of[-1,1]){
      const theta=side>0?Math.PI/6:5*Math.PI/6,p=[1.03*Math.cos(theta),2.22+1.03*Math.sin(theta),Z+.153];
      rose(p,.067);leaf([p[0],p[1]-.035,Z+.144],.103,.027,.007,'sage',side*.88+Math.PI);
    }
    rose([0,3.277,Z+.144],.052);
    for(const side of[-1,1])tube([[side*.014,3.29,Z+.163],[side*.061,3.287,Z+.163],[side*.088,3.267,Z+.156],[side*.101,3.23,Z+.150]],.004,'gold',22);
  }
  // Merge only these new ornaments. The source root and all of its resources
  // are read-only and remain under their original factory's ownership.
  for(const [key,parts]of buckets){
    let vc=0,ic=0;for(const g of parts){vc+=g.attributes.position.count;ic+=g.index.count;}
    const positions=new Float32Array(vc*3),normals=new Float32Array(vc*3),uv=new Float32Array(vc*2),indices=new Uint32Array(ic);let vo=0,io=0;
    for(const g of parts){positions.set(g.attributes.position.array,vo*3);normals.set(g.attributes.normal.array,vo*3);uv.set(g.attributes.uv.array,vo*2);for(let k=0;k<g.index.count;k++)indices[io++]=g.index.getX(k)+vo;vo+=g.attributes.position.count;release(g);}
    const g=own(new THREE.BufferGeometry(),geometries);g.setAttribute('position',new THREE.BufferAttribute(positions,3));g.setAttribute('normal',new THREE.BufferAttribute(normals,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(indices,1));g.computeBoundingBox();g.computeBoundingSphere();
    const mesh=new THREE.Mesh(g,M[key]);mesh.name=`Rose-carved doorway · ${key}`;mesh.userData.noCollision=true;mesh.userData.noStaticBatch=true;mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);
    stats.triangles+=ic/3;stats.drawCalls++;stats.geometryBytes+=positions.byteLength+normals.byteLength+uv.byteLength+indices.byteLength;
  }
  for(const prototype of prototypes.values())release(prototype);prototypes.clear();buckets.clear();group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(group);stats.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};stats.originalRoot=originalRoot?.name??null;stats.noCollision=true;stats.closedOriginalDoorPreserved=true;group.userData.originalDollhousePortal=stats;
  return{group,stats,dispose};
  }catch(error){dispose();throw error;}
}
