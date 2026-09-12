/** Fine jewelry applied to the exact original dollhouse, in its source units.
 * Owns only its three materials, one new native 2048 finish and merged meshes.
 * No architecture, original texture, angel wing, aperture or collision changes.
 */
export function addOriginalDollhouseJewels(THREE, originalRoot, {sourceZOffset=0}={}) {
  const TAU=Math.PI*2,group=new THREE.Group();group.name='Original dollhouse · rose-gold embroidery';
  group.userData.noCollision=true;group.userData.originalDollhouseDetail=true;
  const buckets=new Map(),ownedGeometries=new Set(),prototypes=new Map();let disposed=false;
  const stats={source:'August 18 original castle; additive jewelry only',sourceZOffset,sourceModel:originalRoot?.name??null,originalArchitectureModified:false,originalTexturesModified:false,additionalRenderPasses:0,materials:3,drawCalls:0,triangles:0,geometryBytes:0,sculptedPetals:0,goldVines:0,facadeBraids:0,towerCapitalJewels:0,centralRoseBrooches:0,newTextures:[]};
  // Native-sized microfinish, authored independently of every original asset.
  // Low contrast and nonzero roughness avoid scintillating pinprick highlights.
  const resolution=2048,pixels=new Uint8Array(resolution*resolution*4);
  for(let y=0;y<resolution;y++)for(let x=0;x<resolution;x++){
    const u=x/resolution,v=y/resolution;
    const grain=((Math.imul(x+17,73856093)^Math.imul(y+31,19349663))>>>0)%31/31;
    const value=Math.round(229+5*Math.sin(TAU*(u*23+v*3))+3*Math.cos(TAU*(v*79-u*2))+(grain-.5)*5),i=(y*resolution+x)*4;
    pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=255;
  }
  const finish=new THREE.DataTexture(pixels,resolution,resolution,THREE.RGBAFormat,THREE.UnsignedByteType);
  finish.name='Original castle jewels · hand-burnished gold / nacre grain 2048';finish.colorSpace=THREE.NoColorSpace;
  finish.wrapS=finish.wrapT=THREE.RepeatWrapping;finish.generateMipmaps=true;finish.minFilter=THREE.LinearMipmapLinearFilter;finish.magFilter=THREE.LinearFilter;finish.anisotropy=4;finish.needsUpdate=true;
  stats.newTextures.push({name:finish.name,width:resolution,height:resolution,bytes:pixels.byteLength});
  const mat=(name,options)=>new THREE.MeshPhysicalMaterial({name:`Original dollhouse jewels · ${name}`,roughness:.36,roughnessMap:finish,clearcoat:.20,clearcoatRoughness:.34,...options});
  const materials={gold:mat('soft brushed champagne gold',{color:0xd8b476,metalness:.82,roughness:.35}),nacre:mat('warm sculpted nacre',{color:0xfff1e5,roughness:.39,metalness:.04,clearcoat:.42,iridescence:.07,iridescenceThicknessRange:[250,330]}),rose:mat('rose quartz enamel',{color:0xe9adc4,metalness:.12,roughness:.37,clearcoat:.46})};
  const V=a=>new THREE.Vector3(...a),sequence=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
  function clean(g){
    const p=g.attributes.position,old=g.index,indices=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    for(let k=0;k<(old?.count??p.count);k+=3){const i=old?old.getX(k):k,j=old?old.getX(k+1):k+1,l=old?old.getX(k+2):k+2;a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,j);c.fromBufferAttribute(p,l);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-19)indices.push(i,j,l);}
    g.setIndex(indices);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(p.count*2),2));return g;
  }
  function add(geometry,key,position=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){
    const g=clean(geometry),m=new THREE.Matrix4().compose(V(position),new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),V(scale));g.applyMatrix4(m);
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(g);return g;
  }
  function tube(points,radius=.007,key='gold',segments=40,radial=6,closed=false){
    const cleanPoints=points.map(V);if(closed&&cleanPoints.length>2&&cleanPoints[0].distanceToSquared(cleanPoints.at(-1))<1e-14)cleanPoints.pop();
    const curve=new THREE.CatmullRomCurve3(cleanPoints,closed,'centripetal');stats.goldVines++;return add(new THREE.TubeGeometry(curve,segments,radius,radial,closed),key);
  }
  function petalGeometry(){
    if(prototypes.has('petal'))return prototypes.get('petal').clone();
    const p=[],uv=[],indices=[],nu=12,nv=14;
    for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){
      const t=j/nv,a=i/nu*TAU,r=Math.pow(Math.sin(Math.PI*t),.72);
      p.push(.43*r*Math.cos(a),t,.11*r*Math.sin(a)+.19*Math.sin(Math.PI*t)*t);uv.push(i/nu,t);
    }
    for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;indices.push(a,c,b,b,c,d);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);clean(g);g.computeVertexNormals();prototypes.set('petal',g);return g.clone();
  }
  function petal(p,length=.1,width=.055,key='nacre',rotation=0){
    stats.sculptedPetals++;return add(petalGeometry(),key,p,[0,0,rotation],[width/.43,length,.075]);
  }
  function pearl(p,r=.022){
    if(!prototypes.has('pearl'))prototypes.set('pearl',new THREE.SphereGeometry(1,14,10));
    return add(prototypes.get('pearl').clone(),'nacre',p,[0,0,0],[r,r,r*.64]);
  }
  const z=v=>v+sourceZOffset;
  // The original cream courses are .14m tall, ending clear of the towers.
  // Interwoven wires project .03m beyond that solid molding, not its glazing.
  function braid(x0,x1,y,cycles){
    for(const phase of[0,Math.PI])tube(sequence(Math.ceil((x1-x0)*28),t=>[x0+(x1-x0)*t,y+.010*Math.sin(t*TAU*cycles+phase),z(-.316)+.007*Math.cos(t*TAU*cycles+phase)]),.0055,'gold',Math.ceil((x1-x0)*36));
    stats.facadeBraids++;
  }
  // The original moon-phase column occupies X=0 at Y4.32. Keep its
  // full gold frame and painted disc clear rather than crossing the motif.
  braid(-3.13,-.22,4.30,7);braid(.22,3.13,4.30,7);
  braid(-3.13,-1.12,2.15,5);braid(1.12,3.13,2.15,5);
  // A few leaf clasps make the course read as a made, fitted piece of jewelry.
  for(const x of[-2.94,-1.91,-.72,.72,1.91,2.94]){
    for(const side of[-1,1])petal([x,4.30,z(-.304)],.063,.020,'nacre',side*Math.PI*.39+(side<0?Math.PI:0));
    pearl([x,4.30,z(-.279)],.013);
  }
  // The original centered moon medallions are the facade's own jewelry.
  // Leave their full vertical column untouched; no additive center brooch.
  // Original tapered capital surfaces: actual radii from towerRound(), not a
  // new architectural collar. Leaves are conformed to the existing cone face.
  for(const tower of[{x:-4.45,z:-.55,h:7.7},{x:4.45,z:-.55,h:7.7},{x:-4.45,z:-5.05,h:8.35},{x:4.45,z:-5.05,h:8.35}]){
    const radius=y=>1.02*1.02+(1.02*1.20-1.02*1.02)*Math.max(0,Math.min(1,(y-(tower.h-.34))/.34));
    function onCapital(x,y,out,angle){const a=angle+x/radius(y),r=radius(y)+out;return[tower.x+Math.sin(a)*r,y,z(tower.z)+Math.cos(a)*r];}
    for(let i=0;i<12;i++){
      const angle=i*TAU/12,y=tower.h-.285;
      for(const side of[-1,1]){
        const g=petalGeometry(),p=g.attributes.position;
        for(let k=0;k<p.count;k++){
          const px=p.getX(k)*.068+side*.014,py=y+p.getY(k)*.147,pz=p.getZ(k)*.055+.015;
          const q=onCapital(px+side*.06*p.getY(k),py,pz,angle);p.setXYZ(k,...q);
        }
        g.computeVertexNormals();add(g,i%3===0?'rose':'nacre');stats.sculptedPetals++;
        const points=sequence(16,t=>onCapital(side*(.014+.06*t),y+.147*t,.028+.009*Math.sin(Math.PI*t),angle));tube(points,.0048,'gold',18,5);
      }
      const curl=sequence(28,t=>{const a=t*Math.PI*1.64,r=.048*(1-.76*t);return onCapital(Math.cos(a)*r,tower.h-.232+Math.sin(a)*r,.024,angle);});tube(curl,.005,'gold',30,5);
      stats.towerCapitalJewels++;
    }
    // A continuous, fine cord tucks the leaf bases into the existing capital.
    tube(sequence(128,t=>onCapital(0,tower.h-.287+.006*Math.sin(t*TAU*24),.018,t*TAU)),.0058,'gold',160,5,true);
  }
  // One draw per material, with shared prototype creation and explicit ownership.
  for(const [key,parts]of buckets){
    let vc=0,ic=0;for(const g of parts){vc+=g.attributes.position.count;ic+=g.index.count;}
    const p=new Float32Array(vc*3),n=new Float32Array(vc*3),uv=new Float32Array(vc*2),index=new Uint32Array(ic);let vo=0,io=0;
    for(const g of parts){p.set(g.attributes.position.array,vo*3);n.set(g.attributes.normal.array,vo*3);uv.set(g.attributes.uv.array,vo*2);for(let k=0;k<g.index.count;k++)index[io++]=g.index.getX(k)+vo;vo+=g.attributes.position.count;g.dispose();}
    const merged=new THREE.BufferGeometry();merged.setAttribute('position',new THREE.BufferAttribute(p,3));merged.setAttribute('normal',new THREE.BufferAttribute(n,3));merged.setAttribute('uv',new THREE.BufferAttribute(uv,2));merged.setIndex(new THREE.BufferAttribute(index,1));merged.computeBoundingBox();merged.computeBoundingSphere();ownedGeometries.add(merged);
    const mesh=new THREE.Mesh(merged,materials[key]);mesh.name=`Original castle jewelry · ${key}`;mesh.userData.noCollision=true;mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);
    stats.triangles+=ic/3;stats.geometryBytes+=p.byteLength+n.byteLength+uv.byteLength+index.byteLength;stats.drawCalls++;
  }
  for(const p of prototypes.values())p.dispose();prototypes.clear();buckets.clear();group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(group);stats.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};group.userData.stats=stats;
  return{group,root:group,stats,dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const g of ownedGeometries)g.dispose();for(const m of Object.values(materials))m.dispose();finish.dispose();group.clear();}};
}
