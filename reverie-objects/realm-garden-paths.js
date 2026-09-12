import {createFairyFinishes} from './realm-fairy-finishes.js';
import {createFoundationFinishes} from './realm-foundation-finishes.js';

/** Surveyed, gently bevelled pavers. All positions are in world space; the
 * center and both edges come from retained ground, not a bounding-box plane. */
export function createGardenPaths(THREE,{paths=[],arrival=null}={}) {
  const group=new THREE.Group();group.name='Roseway — the garden walks';
  group.userData.noStaticBatch=true;
  const geometries=new Set(),materials=new Set(),textures=new Set(),buckets=new Map();
  let finishes=null,foundationFinishes=null,disposed=false;
  const stats={paths:0,pavers:0,length:0,triangles:0,drawCalls:0,additionalRenderPasses:0,originalTexturesModified:false,routeNames:[]};
  const ownG=g=>(geometries.add(g),g),ownM=m=>(materials.add(m),m);
  const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
  const moveY=(a,y)=>[a[0],a[1]+y,a[2]];
  const vec=a=>new THREE.Vector3(...a),TAU=Math.PI*2;
  const palette=[0xe4cfc8,0xd4bbcf,0xccd9ce];
  function paintStone() {
    if(typeof document==='undefined')return null;
    const canvas=document.createElement('canvas');canvas.width=canvas.height=2048;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Paver painting requires a canvas context.');
    ctx.fillStyle='#f9f4ed';ctx.fillRect(0,0,2048,2048);
    // Low-contrast mineral veins and engraved botanical tracery. Fine detail
    // stays in the original 2048px texture and uses ordinary mip filtering.
    for(let i=0;i<22;i++){
      ctx.beginPath();ctx.moveTo(-60,i*104-100);
      ctx.bezierCurveTo(640,i*96+170,1410,i*115-220,2110,i*102+60);
      ctx.strokeStyle=i%3?'rgba(166,141,136,.07)':'rgba(255,255,255,.42)';ctx.lineWidth=3+(i%4);ctx.stroke();
    }
    ctx.strokeStyle='#b39560';ctx.lineWidth=5;
    ctx.beginPath();ctx.roundRect(75,115,1898,1818,105);ctx.stroke();
    ctx.strokeStyle='rgba(188,160,105,.64)';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(94,137,1860,1774,94);ctx.stroke();
    ctx.save();ctx.translate(1024,1024);
    for(let k=0;k<8;k++){
      ctx.save();ctx.rotate(k*TAU/8);ctx.beginPath();ctx.moveTo(0,-42);
      ctx.bezierCurveTo(-90,-180,-112,-370,0,-448);
      ctx.bezierCurveTo(112,-370,90,-180,0,-42);
      ctx.fillStyle=k%2?'rgba(176,134,163,.11)':'rgba(139,171,154,.12)';ctx.fill();
      ctx.strokeStyle='rgba(174,143,80,.66)';ctx.lineWidth=4;ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,-98);ctx.quadraticCurveTo(15,-280,0,-390);ctx.lineWidth=2;ctx.stroke();ctx.restore();
    }
    ctx.beginPath();ctx.arc(0,0,43,0,TAU);ctx.fillStyle='#c5a86e';ctx.fill();ctx.restore();
    for(const [x,y,angle]of[[210,265,-.5],[1838,265,.5],[210,1783,-2.6],[1838,1783,2.6]]){
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.strokeStyle='rgba(170,139,82,.68)';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(60,75,-50,145,15,225);ctx.stroke();
      for(let i=0;i<4;i++){const yy=45+i*42,s=i%2?1:-1;ctx.beginPath();ctx.moveTo(4,yy);ctx.bezierCurveTo(s*55,yy-30,s*65,yy+10,4,yy+25);ctx.stroke();}ctx.restore();
    }
    const map=new THREE.CanvasTexture(canvas);map.name='Original 2048px engraved roseway porcelain';
    map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;textures.add(map);return map;
  }
  function dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();finishes?.dispose();foundationFinishes?.dispose();group.clear();}
  try {
  finishes=createFairyFinishes(THREE);foundationFinishes=createFoundationFinishes(THREE);
  const stoneMap=paintStone();
  const stoneMaterials=palette.map((color,i)=>{
    const m=ownM(new THREE.MeshPhysicalMaterial({name:`Roseway porcelain ${i+1}`,color,roughness:.62,metalness:.025}));
    finishes.apply(m,'porcelain');m.roughness=.62;m.clearcoat=.12;m.clearcoatRoughness=.48;if(stoneMap)m.map=stoneMap;return m;
  });
  const gold=ownM(new THREE.MeshStandardMaterial({name:'Roseway satin gold',color:0xc8a361,metalness:.82,roughness:.5}));
  finishes.apply(gold,'gold');gold.roughness=.56;gold.envMapIntensity=.9;
  const edge=ownM(new THREE.MeshStandardMaterial({name:'Roseway cut-stone edges',color:0xac93aa,roughness:.77}));
  const grout=ownM(new THREE.MeshStandardMaterial({name:'Roseway lavender mortar',color:0x998b97,roughness:.94}));
  function bucket(key,material,collision=true){if(!buckets.has(key))buckets.set(key,{p:[],n:[],uv:[],material,collision});return buckets.get(key);}
  function triangle(b,a,c,d,uvs=[[0,0],[0,1],[1,1]],up=false) {
    let ab=vec(c).sub(vec(a)),ac=vec(d).sub(vec(a)),n=ab.cross(ac);
    if(n.lengthSq()<1e-16)return;
    if(up&&n.y<0){[c,d]=[d,c];[uvs[1],uvs[2]]=[uvs[2],uvs[1]];n.negate();}
    n.normalize();b.p.push(...a,...c,...d);b.n.push(...n.toArray(),...n.toArray(),...n.toArray());b.uv.push(...uvs.flat());
  }
  function quad(b,a,c,d,e,uvs=[[0,0],[0,1],[1,1],[1,0]],up=false){triangle(b,a,c,d,[uvs[0],uvs[1],uvs[2]],up);triangle(b,a,d,e,[uvs[0],uvs[2],uvs[3]],up);}
  function append(g,b){
    const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
    for(let j=0;j<(g.index?.count??p.count);j++){
      const i=g.index?g.index.getX(j):j;b.p.push(p.getX(i),p.getY(i),p.getZ(i));b.n.push(n.getX(i),n.getY(i),n.getZ(i));b.uv.push(uv?.getX(i)||0,uv?.getY(i)||0);
    }
    g.dispose();
  }
  function sectionAt(a,b,t){return {left:mix(a.left,b.left,t),center:mix(a.center,b.center,t),right:mix(a.right,b.right,t)};}
  function across(s,t){return t<.5?mix(s.left,s.center,t*2):mix(s.center,s.right,(t-.5)*2);}
  function surface(b,a,z,t0=0,t1=1,raise=0){
    const cuts=[t0,...(t0<.5&&t1>.5?[.5]:[]),t1];
    for(let k=0;k<cuts.length-1;k++){
      const u=cuts[k],v=cuts[k+1];
      quad(b,moveY(across(a,u),raise),moveY(across(z,u),raise),moveY(across(z,v),raise),moveY(across(a,v),raise),[[u,0],[u,1],[v,1],[v,0]],true);
    }
  }
  function paver(a,z,index) {
    const top=bucket(`porcelain-${index%3}`,stoneMaterials[index%3]);
    const bevel=bucket('rounded-cut-edges',edge),mortar=bucket('solid-mortar',grout);
    // The thin continuous bedding is collidable, with 4cm recessed joints;
    // it prevents capsule snagging while individual bevels read in closeups.
    surface(mortar,a,z,0,1,-.024);
    const inset=.035,aa=sectionAt(a,z,inset),zz=sectionAt(a,z,1-inset);
    const insideA={left:across(aa,.018),center:aa.center,right:across(aa,.982)};
    const insideZ={left:across(zz,.018),center:zz.center,right:across(zz,.982)};
    surface(top,insideA,insideZ);
    const ring=[aa.left,aa.center,aa.right,zz.right,zz.center,zz.left];
    const inner=[insideA.left,insideA.center,insideA.right,insideZ.right,insideZ.center,insideZ.left];
    for(let k=0;k<6;k++){
      const j=(k+1)%6;
      quad(bevel,moveY(ring[k],-.025),moveY(ring[j],-.025),inner[j],inner[k],undefined,true);
      quad(bevel,moveY(ring[k],-.16),moveY(ring[k],-.025),moveY(ring[j],-.025),moveY(ring[j],-.16));
    }
    // Gold ribbons are broad enough for stable antialiasing, set proud of the
    // chamfer rather than sharing a coplanar face with the porcelain glaze.
    const gilt=bucket('gold-inlay',gold,false);
    surface(gilt,insideA,insideZ,.048,.059,.009);
    surface(gilt,insideA,insideZ,.941,.952,.009);
    stats.pavers++;
  }
  function sectionsFor(path) {
    if(path.crossSections?.length)return path.crossSections.map((s,i,list)=>{
      const a=list[Math.max(0,i-1)].center,z=list[Math.min(list.length-1,i+1)].center;
      // Surveyed edges may be named relative to the opposite travel direction.
      // Canonical order makes the bevel walls face outward on every route.
      const side=(s.left[0]-s.center[0])*(-(z[2]-a[2]))+(s.left[2]-s.center[2])*(z[0]-a[0]);
      return side<0?{...s,left:s.right,right:s.left}:s;
    });
    return (path.points||[]).map((point,i,points)=>{
      const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
      const dx=after[0]-before[0],dz=after[2]-before[2],d=Math.hypot(dx,dz)||1,w=(path.width||2.6)/2;
      return {center:point,left:[point[0]-dz/d*w,point[1],point[2]+dx/d*w],right:[point[0]+dz/d*w,point[1],point[2]-dx/d*w]};
    });
  }
  function addPlaza() {
    if(!arrival?.position)return;
    const center=arrival.position,radius=arrival.radius||4.5;
    const top=bucket('arrival-porcelain',foundationFinishes.materials.foundationFloor);
    const border=bucket('arrival-rose-petals',stoneMaterials[1]);
    const base=bucket('arrival-cut-edge',foundationFinishes.materials.foundationWall);
    const gilt=bucket('gold-inlay',gold,false);
    const floor=center[1],rings=arrival.rings||arrival.radialRings||[];
    function groundAt(r,a){
      if(!rings.length)return floor;
      const index=(((a/TAU)%1)+1)%1;
      const ringY=ring=>{
        const pts=ring.points;if(!pts?.length)return floor;
        const t=index*pts.length,i=Math.floor(t)%pts.length,j=(i+1)%pts.length;
        return pts[i][1]+(pts[j][1]-pts[i][1])*(t-Math.floor(t));
      };
      if(r<=rings[0].radius)return ringY(rings[0]);
      for(let i=1;i<rings.length;i++)if(r<=rings[i].radius){const t=(r-rings[i-1].radius)/(rings[i].radius-rings[i-1].radius);return ringY(rings[i-1])*(1-t)+ringY(rings[i])*t;}
      return ringY(rings.at(-1));
    }
    const point=(r,a,lift=0)=>[center[0]+Math.cos(a)*r,groundAt(r,a)+lift,center[2]+Math.sin(a)*r];
    // A restrained 12-petal compass gives the arrival its own recognizable
    // flower silhouette without adding tall props to the walking corridor.
    for(let i=0;i<192;i++){
      const a=i/192*TAU,b=(i+1)/192*TAU;
      const steps=Math.ceil(radius*.79/.4);
      for(let ring=0;ring<steps;ring++){
        const r0=radius*.79*ring/steps,r1=radius*.79*(ring+1)/steps;
        const uv=(r,t)=>[.5+Math.cos(t)*r/radius*.5,.5+Math.sin(t)*r/radius*.5];
        quad(top,point(r0,a),point(r0,b),point(r1,b),point(r1,a),[uv(r0,a),uv(r0,b),uv(r1,b),uv(r1,a)],true);
      }
      quad(i%32<16?border:top,point(radius*.79,a),point(radius*.79,b),point(radius,b),point(radius,a),[[0,0],[0,1],[1,1],[1,0]],true);
      quad(base,point(radius,a,-.14),point(radius,a),point(radius,b),point(radius,b,-.14));
      for(const [r,w]of[[radius*.79,.026],[radius-.1,.033],[radius-.22,.012]])quad(gilt,point(r-w,a,.012),point(r-w,b,.012),point(r+w,b,.012),point(r+w,a,.012),undefined,true);
    }
    for(let petal=0;petal<12;petal++){
      const angle=petal/12*TAU,c=Math.cos(angle),s=Math.sin(angle);
      const flower=[];
      for(let k=0;k<48;k++){
        const t=k/48*TAU,r=radius*(.30+.26*Math.cos(t)),w=radius*.105*Math.sin(t);
        const x=r*c-w*s,z=r*s+w*c;flower.push(new THREE.Vector3(center[0]+x,groundAt(Math.hypot(x,z),Math.atan2(z,x))+.028,center[2]+z));
      }
      append(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(flower,true),48,.014,5,true),gilt);
    }
    stats.arrivalRadius=radius;stats.arrivalFloor=floor;
  }
  function bridgeRailings(sections){
    const rail=bucket('bridge-gold-balustrade',gold),frame=bucket('bridge-porcelain-arches',stoneMaterials[1]);
    const tube=(points,r,b,segments)=>append(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(vec)),segments||Math.max(24,points.length*3),r,8,false),b);
    for(const side of ['left','right']){
      const railPoints=sections.map(s=>{const p=s[side],d=vec(p).sub(vec(s.center)).normalize().multiplyScalar(.1);return [p[0]+d.x,p[1],p[2]+d.z];});
      tube(railPoints.map(p=>moveY(p,1.35)),.055,rail);
      tube(railPoints.map(p=>moveY(p,.43)),.04,rail);
      tube(railPoints.map((p,i)=>moveY(p,-.16-.32*Math.sin(Math.PI*i/(railPoints.length-1)))),.15,frame);
      for(let i=0;i<railPoints.length;i+=2){
        const p=railPoints[i];tube([moveY(p,-.12),moveY(p,.35),moveY(p,.9),moveY(p,1.40)],.05,rail,8);
        const pearl=new THREE.SphereGeometry(.115,12,8);pearl.translate(...moveY(p,1.48));append(pearl,frame);
      }
      for(let i=0;i<railPoints.length-2;i+=2){
        const a=railPoints[i],z=railPoints[i+2],points=[];
        for(let k=0;k<=20;k++){
          const t=k/20,p=mix(a,z,t);p[1]+=.79+.29*Math.sin(t*TAU);points.push(p);
        }
        tube(points,.026,rail,24);
      }
    }
    stats.bridges=(stats.bridges||0)+1;
  }
    for(const path of paths){
      const sections=sectionsFor(path);if(sections.length<2)continue;
      if(sections.some(s=>![s.left,s.center,s.right].every(p=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite))))throw new Error(`Invalid surveyed route: ${path.id}`);
      for(let i=0;i<sections.length-1;i++){
        const a=sections[i],b=sections[i+1],d=vec(a.center).distanceTo(vec(b.center));if(d<.015)continue;
        paver(a,b,i);stats.length+=d;
      }
      if(path.type==='bridge'||path.bridge)bridgeRailings(sections);
      stats.paths++;stats.routeNames.push(path.title||path.id);
    }
    addPlaza();
    for(const [name,b]of buckets){
      if(!b.p.length)continue;
      const g=ownG(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));g.computeBoundingBox();g.computeBoundingSphere();
      // The radial arrival geometry uses exact surveyed vertices; only its
      // surface coordinates change to a coherent, metre-scaled mosaic.
      if(name==='arrival-porcelain'||name==='arrival-cut-edge')foundationFinishes.projectUV(g,name==='arrival-porcelain'?'foundationFloor':'foundationWall');
      const mesh=new THREE.Mesh(g,b.material);mesh.name=`Roseway ${name}`;mesh.receiveShadow=true;mesh.userData.noCollision=!b.collision;group.add(mesh);
    }
    group.traverse(o=>{if(o.isMesh){stats.triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;stats.drawCalls++;}});
    stats.length=Number(stats.length.toFixed(1));stats.textures=stoneMap?[2048,2048]:null;stats.arrivalFoundationFinishes=foundationFinishes.stats;
    return {group,stats,dispose};
  } catch(error){dispose();throw error;}
}
