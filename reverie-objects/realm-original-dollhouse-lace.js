/** Dimensional lace for the ORIGINAL castle's own frames, shutters and wings.
 * Source units and measured anchors match August 18 castle.html. All additions
 * sit on existing trim; the stained-glass images and architecture stay intact.
 */
export function addOriginalDollhouseLace(THREE, originalRoot, {sourceZOffset=2.8}={}) {
  const group=new THREE.Group();group.name='Original dollhouse · hand-carved window lace';group.userData.noCollision=true;
  const T=Math.PI*2,buckets=new Map(),cache=new Map(),owned=new Set();let disposed=false;
  const materials={
    gold:new THREE.MeshPhysicalMaterial({name:'Original window lace · satin champagne gold',color:0xd8b77e,metalness:.80,roughness:.36,clearcoat:.18,clearcoatRoughness:.34}),
    nacre:new THREE.MeshPhysicalMaterial({name:'Original window lace · carved warm nacre',color:0xffeee1,metalness:.05,roughness:.38,clearcoat:.38,clearcoatRoughness:.33,iridescence:.06,iridescenceThicknessRange:[240,330]}),
    rose:new THREE.MeshPhysicalMaterial({name:'Original window lace · blush porcelain',color:0xe4abc1,metalness:.08,roughness:.39,clearcoat:.35,clearcoatRoughness:.34})
  };
  const stats={source:'Original August 18 windowArched / spreadWings / rose dormers',sourceZOffset,sourceModel:originalRoot?.name??null,originalArchitectureModified:false,originalTexturesModified:false,additionalLights:0,additionalRenderPasses:0,windows:0,frontShutters:0,engravedWingPairs:0,roseBezels:0,sculptedPetals:0,triangles:0,drawCalls:0,geometryBytes:0,materials:3,windowAnchors:[],glassClearanceNativeMetres:.022,originalJewelryCourses:[2.15,4.30]};
  const V=a=>new THREE.Vector3(...a),seq=(n,f)=>Array.from({length:n+1},(_,i)=>f(i/n));
  function cleaned(g){
    const p=g.attributes.position,index=g.index,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),idx=[];
    for(let k=0;k<(index?.count??p.count);k+=3){const i=index?.getX(k)??k,j=index?.getX(k+1)??k+1,l=index?.getX(k+2)??k+2;a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,j);c.fromBufferAttribute(p,l);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-20)idx.push(i,j,l);}
    g.setIndex(idx);if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(p.count*2),2));return g;
  }
  function add(g,key,anchor=null){
    cleaned(g);if(anchor){const m=new THREE.Matrix4().compose(V(anchor.p),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,anchor.yaw??0,0)),new THREE.Vector3(1,1,1));g.applyMatrix4(m);}
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(g);return g;
  }
  function tube(points,r,key,anchor,segments=32,closed=false,radial=5){
    const pts=points.map(V);if(closed&&pts[0].distanceToSquared(pts.at(-1))<1e-14)pts.pop();
    return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,closed,'centripetal'),segments,r,radial,closed),key,anchor);
  }
  function prototype(key,build){if(!cache.has(key))cache.set(key,build());return cache.get(key).clone();}
  function archGeometry(w,h,margin,radius,depth){
    return prototype(`arch:${w}:${h}:${margin}:${radius}`,()=>{
      const radiusX=w/2+margin,top=h+margin+.006,bottom=.062,straight=top-radiusX-bottom,length=straight*2+Math.PI*radiusX;
      const curve=new class extends THREE.Curve{getPoint(t,target=new THREE.Vector3()){
        let d=t*length;
        if(d<straight)return target.set(-radiusX,bottom+d,depth);
        d-=straight;if(d<=Math.PI*radiusX){const a=Math.PI-d/radiusX;return target.set(Math.cos(a)*radiusX,top-radiusX+Math.sin(a)*radiusX,depth);}
        return target.set(radiusX,top-radiusX-(d-Math.PI*radiusX),depth);
      }};
      return new THREE.TubeGeometry(curve,72,radius,5,false);
    });
  }
  function petalGeometry(){
    return prototype('petal',()=>{
      const p=[],uv=[],idx=[],nu=10,nv=12;
      for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const t=j/nv,a=i/nu*T,r=Math.pow(Math.sin(Math.PI*t),.75);p.push(.42*r*Math.cos(a),t,.105*r*Math.sin(a)+.15*Math.sin(Math.PI*t)*t);uv.push(i/nu,t);}
      for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,c,b,b,c,d);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);cleaned(g);g.computeVertexNormals();return g;
    });
  }
  function petal(position,length,width,angle,key,anchor){
    const g=petalGeometry(),m=new THREE.Matrix4().compose(V(position),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,angle)),new THREE.Vector3(width/.42,length,.045));g.applyMatrix4(m);stats.sculptedPetals++;return add(g,key,anchor);
  }
  function featherPair(anchor,scale,rootX,rake){
    // These strokes stay inside the original NM_WING silhouette and outside
    // its existing root spiral. Their depth clears the original beveled face.
    const strokes=[[[.48,.19],[.70,.205],[.90,.095]],[[.49,.060],[.67,-.055],[.77,-.18]]];
    for(const side of[-1,1])for(const points of strokes){
      const c=Math.cos(side*rake),s=Math.sin(side*rake);
      tube(points.map(([x,y])=>{x*=side*scale;y*=scale;return[side*rootX+x*c-y*s,x*s+y*c,.078];}),.0033,'gold',anchor,22,false,5);
    }
    stats.engravedWingPairs++;
  }
  function windowLace({x,y,z,w,h,yaw=0,front=false}){
    const anchor={p:[x,y,z+sourceZOffset],yaw};
    add(archGeometry(w,h,.035,.009, .077),'nacre',anchor);
    add(archGeometry(w,h,.070,.0054,.077),'gold',anchor);
    stats.windows++;stats.windowAnchors.push({position:anchor.p,yaw,width:w,height:h,front});
    if(!front)return;
    const width=w*.46,center=w/2+.09+width/2-.02;
    for(const side of[-1,1]){
      const x0=side*center,y0=h*.36;
      // Relief occupies the lower blank shutter panel; the original heart,
      // crossbars and flower box remain visible and physically separated.
      tube([[x0-side*.014,y0-h*.095,.101],[x0+side*.015,y0-h*.025,.108],[x0-side*.012,y0+h*.045,.105],[x0+side*.006,y0+h*.092,.102]],.0042,'gold',anchor,24);
      for(const sign of[-1,1]){
        const py=y0+sign*h*.030;
        petal([x0,py,.100],h*.060,.018,sign*.9,'nacre',anchor);
        tube([[x0,py,.108],[x0-sign*.016,py+h*.022,.115],[x0-sign*.031,py+h*.034,.107]],.0030,'gold',anchor,14,false,5);
      }
      // Two small folded porcelain buds complement the preexisting heart.
      petal([x0,y0+h*.064,.104],h*.034,.013,-side*.36,'rose',anchor);stats.frontShutters++;
    }
    featherPair({p:[x,y+h+.054,z+sourceZOffset+.02],yaw},w*.72,.05*w*.72,.10);
  }
  for(const sign of[-1,1]){
    windowLace({x:sign*2.25,y:.42,z:-.395,w:.72,h:1.5,front:true});
    for(const x of[1.25,2.65]){
      windowLace({x:sign*x,y:2.87,z:-.395,w:.62,h:1.12,front:true});
      windowLace({x:sign*x,y:4.92,z:-.395,w:.54,h:.92,front:true});
    }
    for(let floor=0;floor<3;floor++)for(const z of[-3.7,-1.8])windowLace({x:sign*4.3,y:floor*2.15+1.18,z,w:.50,h:.90,yaw:sign*Math.PI/2});
  }
  for(let floor=0;floor<3;floor++)for(const x of[-2.4,0,2.4])windowLace({x,y:floor*2.15+1.18,z:-5.2,w:.55,h:.95,yaw:Math.PI});
  function roseBezel(anchor,radius,scale=1){
    // This lies outside the original glass aperture, on its opaque backing.
    // A continuous gold outline and individual carved lancets give the bezel
    // real depth while keeping every original painted petal unobscured.
    tube(seq(120,t=>{const a=t*T,r=radius+.006*scale*Math.cos(24*a);return[Math.cos(a)*r,Math.sin(a)*r,.036];}),.0048*scale,'gold',anchor,132,true,5);
    for(let i=0;i<24;i++){
      const a=i*T/24,start=radius-.023*scale;
      petal([Math.cos(a)*start,Math.sin(a)*start,.029],.040*scale,.011*scale,a-Math.PI/2,i%4===0?'rose':'nacre',anchor);
    }
    stats.roseBezels++;
  }
  // Original great rose center: keepH+.96+1.32, sourceZ−.795+.545.
  roseBezel({p:[0,8.73,-.250+sourceZOffset]},.965,1);
  featherPair({p:[0,8.71,-.285+sourceZOffset]},.82,.95,.4);
  // Original smaller winged dormers, with the same unapplied source transforms.
  for(const x of[-2.6,2.6]){
    roseBezel({p:[x,8.57,-.635+sourceZOffset]},.327,.62);
    featherPair({p:[x,8.59,-.650+sourceZOffset]},.6,.2,.4);
  }
  for(const [key,parts]of buckets){
    let vc=0,ic=0;for(const g of parts){vc+=g.attributes.position.count;ic+=g.index.count;}
    const p=new Float32Array(vc*3),n=new Float32Array(vc*3),uv=new Float32Array(vc*2),idx=new Uint32Array(ic);let vo=0,io=0;
    for(const g of parts){p.set(g.attributes.position.array,vo*3);n.set(g.attributes.normal.array,vo*3);uv.set(g.attributes.uv.array,vo*2);for(let i=0;i<g.index.count;i++)idx[io++]=g.index.getX(i)+vo;vo+=g.attributes.position.count;g.dispose();}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(n,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingBox();g.computeBoundingSphere();owned.add(g);
    const mesh=new THREE.Mesh(g,materials[key]);mesh.name=`Original window lace · ${key}`;mesh.userData.noCollision=true;mesh.userData.noStaticBatch=true;mesh.castShadow=false;mesh.receiveShadow=true;group.add(mesh);stats.triangles+=ic/3;stats.geometryBytes+=p.byteLength+n.byteLength+uv.byteLength+idx.byteLength;stats.drawCalls++;
  }
  for(const g of cache.values())g.dispose();cache.clear();buckets.clear();group.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(group);stats.bounds={min:box.min.toArray(),max:box.max.toArray()};group.userData.originalDollhouseLace=stats;
  return{group,stats,dispose(){if(disposed)return;disposed=true;group.removeFromParent();for(const g of owned)g.dispose();for(const m of Object.values(materials))m.dispose();group.clear();}};
}
