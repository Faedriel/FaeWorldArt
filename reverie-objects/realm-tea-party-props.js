import {createFairyArchitectureKit} from './realm-fairy-architecture-kit.js';

/** Temporary, original Wonderland tea service. Table surface is local Y 1.55;
 * its long axis is X. All static details merge by material and own their data.
 * No source model/texture changes, lights, render loop, or world placement. */
export function createTeaPartyProps(THREE) {
  const kit=createFairyArchitectureKit(THREE),b=kit.builder('The Hatter’s porcelain tea service');
  const TAU=Math.PI*2,TOP=1.55,ownedTextures=new Set(),counts={teapots:0,cups:0,saucers:0,macarons:0,petitFours:0,roses:0,candles:0,tierStands:0,pocketWatches:0,hatterHats:0};
  const placements=[],v=p=>new THREE.Vector3(...p);
  let disposed=false;
  function material(key,base,options={}){const m=kit.materials[base].clone();m.name=`Tea party ${key}`;Object.assign(m,options);kit.materials[key]=m;return m;}
  // Original painted roses, leaves and gilt bands. A shared full-size map is
  // generated once, and its mipmaps keep distant porcelain decoration calm.
  const width=1024,height=512,data=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const u=x/width,t=y/height,cell=((u*4)%1-.5),dy=(t-.48)*1.22,dx=cell*.9;
    const angle=Math.atan2(dy,dx),r=Math.hypot(dx,dy),petal=.095+.021*Math.sin(angle*5+r*48);
    let rgb=[249,242,233];
    if(Math.abs(t-.18)<.006||Math.abs(t-.77)<.006)rgb=[179,135,71];
    else if(Math.abs(t-.21)<.004||Math.abs(t-.74)<.004)rgb=[217,184,116];
    else if(r<petal){const layer=.5+.5*Math.sin(r*153-angle*2);rgb=[210+28*layer,130+53*layer,163+38*layer];}
    else if(((dx-.105)/.075)**2+((dy+.018)/.033)**2<1||((dx+.105)/.072)**2+((dy-.022)/.031)**2<1)rgb=[125,163,140];
    else if(Math.abs(dy-.020*Math.sin(dx*22))<.004&&Math.abs(dx)<.19)rgb=[154,175,136];
    else if(Math.abs(t-.25)<.014&&Math.abs((u*24)%1-.5)<.085)rgb=[190,152,84];
    const i=(y*width+x)*4;data.set([...rgb,255],i);
  }
  const painted=new THREE.DataTexture(data,width,height,THREE.RGBAFormat);
  painted.name='Original painted roses and gilt porcelain bands';painted.colorSpace=THREE.SRGBColorSpace;
  painted.wrapS=THREE.RepeatWrapping;painted.wrapT=THREE.ClampToEdgeWrapping;
  painted.generateMipmaps=true;painted.minFilter=THREE.LinearMipmapLinearFilter;painted.magFilter=THREE.LinearFilter;painted.anisotropy=4;painted.needsUpdate=true;ownedTextures.add(painted);
  for(const [key,base,color]of[['chinaIvory','pearl',0xfff6ef],['chinaRose','rose',0xefb6d0],['chinaMint','mint',0xb4dfc7],['chinaLilac','lilac',0xcebae8]])material(key,base,{color:new THREE.Color(color),map:painted});
  material('cream','pearl',{color:new THREE.Color(0xffefd4),map:null,bumpMap:null,roughness:.7,clearcoat:.08});
  material('sponge','pearl',{color:new THREE.Color(0xcba679),map:null,bumpMap:null,roughness:.85,clearcoat:0});
  material('jam','rose',{color:new THREE.Color(0xb96a87),map:null,bumpMap:null,roughness:.45,clearcoat:.18});
  material('tea','dark',{color:new THREE.Color(0x854b31),map:null,bumpMap:null,roughness:.25,clearcoat:.4});
  material('velvet','dark',{color:new THREE.Color(0x476e64),map:null,roughness:.79,metalness:0,clearcoat:0,sheen:.75,sheenColor:new THREE.Color(0xc2cbb4),sheenRoughness:.85});
  material('paper','pearl',{color:new THREE.Color(0xffeaca),map:null,roughness:.91,clearcoat:0});
  material('ink','dark',{color:new THREE.Color(0x533c57),map:null,bumpMap:null,roughness:.72,clearcoat:0});
  material('wax','pearl',{color:new THREE.Color(0xf7d4d1),map:null,bumpMap:null,roughness:.64,clearcoat:.09});

  let transform=new THREE.Matrix4();
  function at(type,position,yaw,scale,fn){
    const old=transform;transform=new THREE.Matrix4().compose(v(position),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,yaw,0)),new THREE.Vector3().setScalar(scale));
    fn();transform=old;placements.push({type,position:position.slice(),yaw,scale});
  }
  function add(g,key,p=[0,0,0],r=[0,0,0],s=[1,1,1]){
    const local=new THREE.Matrix4().compose(v(p),new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)),v(s));g.applyMatrix4(transform.clone().multiply(local));return b.add(g,key);
  }
  function lathe(profile,segments=40){
    const g=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),segments),idx=g.index,p=g.attributes.position,kept=[],a=new THREE.Vector3(),c=new THREE.Vector3(),d=new THREE.Vector3();
    for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)];a.fromBufferAttribute(p,ids[0]);c.fromBufferAttribute(p,ids[1]);d.fromBufferAttribute(p,ids[2]);if(c.sub(a).cross(d.sub(a)).lengthSq()>1e-19)kept.push(...ids);}g.setIndex(kept);return g;
  }
  function curvedLathe(profile,segments=48,rows=28){const c=new THREE.CatmullRomCurve3(profile.map(([r,y])=>new THREE.Vector3(r,y,0)),false,'centripetal');return lathe(Array.from({length:rows+1},(_,i)=>{const p=c.getPoint(i/rows);return[Math.max(0,p.x),p.y];}),segments);}
  function orb(rx,ry,rz,nu=20,nv=10){return kit.surface(nu,nv,(u,t)=>{const a=u*TAU,c=Math.cos((t-.5)*Math.PI);return[rx*c*Math.cos(a),ry*Math.sin((t-.5)*Math.PI),rz*c*Math.sin(a)];});}
  function tube(points,r,key='gold',segments=28,radial=6,closed=false){add(new THREE.TubeGeometry(kit.curve(points,closed),segments,r,radial,closed),key);}
  function ring(r,y,key='gold',thickness=.009,center=[0,0],segments=40){add(new THREE.TorusGeometry(r,thickness,6,segments),key,[center[0],y,center[1]],[Math.PI/2,0,0]);}
  function disc(r,y,key,center=[0,0],segments=40){add(new THREE.CircleGeometry(r,segments),key,[center[0],y,center[1]],[-Math.PI/2,0,0]);}
  function rose(p,size=.1,key='rose'){
    for(let tier=0;tier<2;tier++)for(let j=0;j<5;j++){
      const g=kit.surface(10,7,(u,t)=>{const a=u*TAU,q=Math.pow(Math.sin(Math.PI*t),.7);return[size*(tier?.38:.55)*q*Math.cos(a),size*(tier?.80:1)*t,size*.15*q*Math.sin(a)+size*.28*t*t];});
      g.rotateZ(tier?-.2:-.75);g.rotateY(j*TAU/5+tier*.6);add(g,key,[p[0],p[1]+tier*size*.12,p[2]]);
    }
    add(orb(size*.20,size*.24,size*.20,12,7),'jam',[p[0],p[1]+size*.7,p[2]]);counts.roses++;
  }
  function saucer(key='chinaIvory',radius=.34){
    add(curvedLathe([[0,.012],[radius*.55,.012],[radius*.95,.055],[radius,.083],[radius*.97,.097],[radius*.63,.048],[0,.043]],40,14),key);
    ring(radius*.965,.088,'gold',.007);counts.saucers++;
  }
  function cup(key='chinaRose',variant=0){
    saucer(key);
    const radius=variant===1?.195:.175,h=variant===2?.28:.24;
    add(curvedLathe([[0,.045],[.075,.045],[.093,.068],[.086,.091],[radius*.8,.12],[radius,h*.78],[radius,h+.085],[radius-.021,h+.085],[radius-.025,h*.8],[.08,.115],[0,.113]],36,22),key);
    ring(radius-.009,h+.085,'gold',.008);ring(.085,.08,'gold',.006);
    tube([[radius*.93,.12,0],[radius+.145,.135,0],[radius+.16,h+.047,0],[radius*.94,h+.056,0]],.025,key,26,8);
    tube([[radius+.03,.145,.024],[radius+.115,.18,.024],[radius+.10,h+.028,.024]],.007,'gold',18,5);
    disc(radius-.030,h+.045,'tea');
    // Gold spoon lies along the saucer, separate from its curved handle.
    tube([[-.20,.107,.07],[-.24,.102,.0],[-.28,.105,-.10]],.008,'gold',14,5);
    add(orb(.024,.008,.044,12,7),'gold',[-.288,.11,-.135]);counts.cups++;
  }
  function teapot(key='chinaMint',variant=0){
    const tall=variant===1?1.16:variant===2?.86:1;
    add(curvedLathe([[0,.01],[.17,.01],[.22,.05],[.19,.09],[.28,.15],[.34,.32],[.30,.49],[.205,.57],[.18,.64],[0,.64]].map(([r,y])=>[r,y*tall]),52,34),key);
    ring(.195,.08*tall,'gold',.01);ring(.185,.632*tall,'gold',.012);
    add(curvedLathe([[0,.67],[.15,.636],[.20,.636],[.201,.65],[.14,.687],[.07,.727],[0,.73]].map(([r,y])=>[r,y*tall]),44,16),key);
    add(orb(.048,.062,.048,20,10),'gold',[0,.769*tall,0]);
    const spout=kit.curve([[.24,.20*tall,0],[.43,.29*tall,0],[.49,.46*tall,0],[.64,.58*tall,0],[.71,.62*tall,0]]),frames=spout.computeFrenetFrames(38,false);
    add(kit.surface(14,38,(u,t)=>{const i=Math.min(38,Math.round(t*38)),a=-u*TAU,r=.10*(1-t)+.046*t,p=spout.getPointAt(t);return p.addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r).toArray();}),key);
    const tip=spout.getPointAt(1),normal=spout.getTangentAt(1).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),normal);
    const rim=new THREE.TorusGeometry(.046,.009,6,24);rim.applyQuaternion(q);add(rim,'gold',tip.toArray());
    const opening=new THREE.CircleGeometry(.037,24);opening.applyQuaternion(q);add(opening,'tea',tip.clone().addScaledVector(normal,.002).toArray());
    tube([[-.24,.15*tall,0],[-.53,.21*tall,0],[-.58,.50*tall,0],[-.40,.65*tall,0],[-.20,.55*tall,0]],.042,key,42,9);
    tube([[-.33,.16*tall,.024],[-.53,.31*tall,.029],[-.52,.49*tall,.03],[-.40,.594*tall,.02]],.009,'gold',32,6);
    for(const a of [Math.PI*.5,Math.PI*1.5])tube(Array.from({length:18},(_,i)=>{const t=i/17,angle=a+.18*Math.sin(t*Math.PI*2),r=.13+.205*Math.sin(t*Math.PI);return[r*Math.cos(angle),.085*tall+.54*t*tall,r*Math.sin(angle)];}),.006,'gold',20,5);
    counts.teapots++;
  }
  function macaron(p,key='rose',scale=1){
    add(orb(.105*scale,.050*scale,.105*scale,20,9),key,[p[0],p[1]+.065*scale,p[2]]);
    add(orb(.105*scale,.050*scale,.105*scale,20,9),key,[p[0],p[1]+.015*scale,p[2]]);
    add(lathe([[0,0],[.103,0],[.104,.020],[0,.020]],24),'cream',[p[0],p[1]+.028*scale,p[2]],[0,0,0],[scale,scale,scale]);
    for(let j=0;j<10;j++){const a=j*TAU/10;add(orb(.013,.012,.013,8,5),key,[p[0]+Math.cos(a)*.10*scale,p[1]+.022*scale,p[2]+Math.sin(a)*.10*scale]);}counts.macarons++;
  }
  function petitFour(p,key='rose'){
    add(curvedLathe([[0,0],[.13,0],[.145,.04],[.145,.14],[.13,.17],[0,.17]],24,12),'sponge',p);
    add(curvedLathe([[0,.17],[.14,.17],[.15,.15],[.145,.185],[.13,.20],[0,.20]],24,10),key,p);
    ring(.141,p[1]+.085,'jam',.015,[p[0],p[2]],24);rose([p[0],p[1]+.197,p[2]],.053,'cream');counts.petitFours++;
  }
  function tierStand(){
    add(curvedLathe([[0,0],[.22,0],[.24,.035],[.18,.07],[.095,.17],[.065,.27],[.064,.82],[0,.85]],36,22),'gold');
    for(const [tier,y,r]of[[0,.24,.43],[1,.65,.31]]){
      add(curvedLathe([[0,y-.03],[r*.85,y-.03],[r,y],[r*.99,y+.025],[r*.72,y+.025],[0,y+.012]],40,12),tier?'chinaMint':'chinaIvory');ring(r*.99,y+.023,'gold',.009);
      for(let j=0;j<(tier?4:5);j++){const a=j*TAU/(tier?4:5)+tier*.4,p=[Math.cos(a)*r*.58,y+.024,Math.sin(a)*r*.58];if(tier)macaron(p,['rose','mint','lilac','cream'][j],.83);else petitFour(p,['rose','mint','lilac','cream','rose'][j]);}
    }
    add(new THREE.TorusGeometry(.10,.014,7,32),'gold',[0,.93,0]);counts.tierStands++;
  }
  function flowerVase(){
    add(curvedLathe([[0,0],[.14,0],[.16,.045],[.12,.10],[.16,.22],[.115,.34],[.10,.40],[.08,.40],[.082,.33],[0,.08]],32,20),'chinaLilac');ring(.09,.40,'gold',.009);
    for(const [j,p]of[[0,[-.16,.64,0]],[1,[.16,.74,.05]],[2,[0,.85,-.08]]]){
      tube([[0,.19,0],[p[0]*.6,.48,p[2]*.5],p],.010,'leaf',18,5);rose(p,.12,j===1?'cream':'rose');
      const leaf=kit.petal(.19,.055,.009,.035);leaf.rotateZ(j%2?-.8:.9);add(leaf,'leaf',[p[0]*.4,.44,p[2]*.4]);
    }
  }
  function candle(height=.50){
    add(curvedLathe([[0,0],[.115,0],[.13,.03],[.11,.06],[.055,.10],[.041,.25],[.095,.29],[.10,.33],[0,.33]],28,16),'gold');
    add(lathe([[0,.32],[.057,.32],[.058,.32+height],[.052,.33+height],[0,.33+height]],24),'wax');
    for(let i=0;i<4;i++){const a=i*TAU/4+.3;add(orb(.013,.06+.018*i,.013,10,6),'wax',[.057*Math.cos(a),.30+height-.03*i,.057*Math.sin(a)]);}
    tube([[0,.32+height,0],[.002,.36+height,0]],.005,'ink',4,4);
    add(orb(.029,.073,.025,14,9),'glow',[.006,.40+height,0]);counts.candles++;
  }
  function watch(){
    add(curvedLathe([[0,0],[.28,0],[.32,.035],[.32,.085],[.28,.12],[0,.12]],48,14),'gold');
    disc(.273,.124,'paper');ring(.282,.124,'gold',.014);
    for(let j=0;j<12;j++){const a=j*TAU/12,r=.225;add(new THREE.BoxGeometry(j%3===0?.023:.012,.007,j%3===0?.044:.029),'ink',[Math.sin(a)*r,.13,Math.cos(a)*r],[0,a,0]);}
    tube([[0,.14,0],[-.115,.143,.103]],.007,'ink',4,5);tube([[0,.148,0],[.058,.151,.17]],.005,'ink',4,5);add(orb(.015,.009,.015,10,6),'gold',[0,.154,0]);
    add(new THREE.TorusGeometry(.059,.011,6,24),'gold',[.003,.06,-.358],[Math.PI/2,0,0]);
    tube([[0,.06,-.42],[.18,.038,-.39],[.33,.03,-.26],[.52,.04,-.35],[.63,.04,-.15]],.009,'gold',38,6);counts.pocketWatches++;
  }
  function roundedCard(w,h,depth=.015){
    const s=new THREE.Shape(),r=.025;s.moveTo(-w/2+r,0);s.lineTo(w/2-r,0);s.quadraticCurveTo(w/2,0,w/2,r);s.lineTo(w/2,h-r);s.quadraticCurveTo(w/2,h,w/2-r,h);s.lineTo(-w/2+r,h);s.quadraticCurveTo(-w/2,h,-w/2,h-r);s.lineTo(-w/2,r);s.quadraticCurveTo(-w/2,0,-w/2+r,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:2,curveSegments:5});
  }
  function hat(){
    // A tilted, flared crown with a soft asymmetric brim and separate silk
    // ribbon restores the instantly readable Hatter silhouette.
    const brim=curvedLathe([[.32,.075],[.65,.085],[.71,.125],[.71,.151],[.66,.155],[.34,.13],[.32,.075]],72,22),bp=brim.attributes.position;
    for(let i=0;i<bp.count;i++){const x=bp.getX(i),z=bp.getZ(i),a=Math.atan2(z,x),r=Math.hypot(x,z),wave=1+.045*Math.cos(a*3);bp.setXYZ(i,x*wave,bp.getY(i)+.047*Math.sin(a*2)*(r/.71)**2,z*wave*.83);}brim.computeVertexNormals();add(brim,'velvet');
    tube(Array.from({length:73},(_,i)=>{const a=i/72*TAU,r=.71*(1+.045*Math.cos(a*3));return[r*Math.cos(a),.14+.047*Math.sin(a*2),r*.83*Math.sin(a)];}),.021,'gold',72,6,true);
    add(kit.surface(64,28,(u,t)=>{const a=u*TAU,r=.365+.095*t+.044*t*t+.008*Math.cos(a*14)*Math.sin(t*Math.PI);return[r*Math.cos(a)+.08*t*t,.095+1.05*t,r*.84*Math.sin(a)];}),'velvet');
    add(orb(.505,.072,.425,52,16),'velvet',[.08,1.145,0]);
    add(kit.surface(64,8,(u,t)=>{const a=u*TAU,r=.389+.030*t;return[r*Math.cos(a)+.004,.20+.24*t,r*.84*Math.sin(a)];}),'rose');
    for(const y of [.20,.44])tube(Array.from({length:65},(_,i)=>{const a=i/64*TAU,r=y<.3?.391:.421;return[r*Math.cos(a)+.004,y,r*.84*Math.sin(a)];}),.008,'gold',64,5,true);
    const cp=[.16,.35,.389],cr=[-.17,0,-.19],cardMatrix=new THREE.Matrix4().compose(v(cp),new THREE.Quaternion().setFromEuler(new THREE.Euler(...cr)),new THREE.Vector3(1,1,1));
    const card=roundedCard(.41,.55);card.applyMatrix4(cardMatrix);add(card,'paper');
    function writing(points){const g=new THREE.TubeGeometry(kit.curve(points.map(([x,y])=>[x,y,.022])),14,.009,5,false);g.applyMatrix4(cardMatrix);add(g,'ink');}
    writing([[-.125,.39],[-.09,.43],[-.09,.26]]);writing([[-.13,.26],[-.045,.26]]);
    writing([[.012,.265],[-.015,.30],[-.015,.395],[.01,.427],[.059,.427],[.082,.395],[.082,.297],[.055,.264],[.012,.265]]);
    writing([[-.083,.066],[-.018,.209]]);
    writing([[.118,.211],[.073,.223],[.033,.184],[.020,.123],[.028,.073],[.064,.057],[.103,.070],[.113,.112],[.097,.142],[.056,.143],[.023,.119]]);
    rose([-.34,.38,.21],.14,'rose');
    // Two curled peacock-like feather ribs and enamel vanes, kept below cap.
    tube([[-.32,.30,.09],[-.46,.78,.03],[-.38,1.22,-.04]],.012,'gold',32,6);
    for(let j=0;j<7;j++){const y=.58+j*.073;const g=kit.petal(.20,.050,.008,.02);g.rotateZ(.7);add(g,j%2?'mint':'lilac',[-.44,y,.04-j*.01]);}
    counts.hatterHats++;
  }

  const seatXs=[-3.6,-1.2,1.2,3.6];
  for(const [i,x]of seatXs.entries())for(const side of[-1,1])at('cup',[x,TOP,side*.91],side*Math.PI/2,.90,()=>cup(['chinaRose','chinaMint','chinaLilac','chinaIvory'][(i+(side>0?1:0))%4],i%3));
  for(const [x,yaw]of[[-4.85,Math.PI],[4.87,0]])at('cup',[x,TOP,0],yaw,.83,()=>cup('chinaIvory',2));
  at('teapot',[-2.9,TOP,-.04],.20,1.02,()=>teapot('chinaRose',0));
  at('teapot',[2.65,TOP,-.05],Math.PI+.12,.98,()=>teapot('chinaMint',1));
  at('teapot',[-4.15,TOP,.14],-.36,.62,()=>teapot('chinaLilac',2));
  at('tier-stand',[-1.17,TOP,-.06],0,.91,tierStand);
  at('tier-stand',[4.25,TOP,.05],.22,.83,tierStand);
  at('hatter-hat',[.75,TOP,0],-.08,1.06,hat);
  at('rose-vase',[-.15,TOP,-.68],0,.75,flowerVase);
  at('rose-vase',[3.66,TOP,-.66],0,.61,flowerVase);
  at('candle',[-2.00,TOP,.56],0,.82,()=>candle(.50));
  at('candle',[2.00,TOP,.64],0,.82,()=>candle(.67));
  at('candle',[-4.25,TOP,-.64],0,.71,()=>candle(.45));
  at('pocket-watch',[-.30,TOP,.60],-.15,.74,watch);
  at('macaron-dish',[3.00,TOP,.58],.12,.85,()=>{saucer('chinaMint',.27);macaron([-.09,.068,0],'rose',.85);macaron([.10,.070,0],'lilac',.85);macaron([.0,.155,0],'mint',.85);});
  const group=b.finish({kind:'temporary-hatter-tea-party-service',tabletopY:TOP,originalAssetsModified:false});
  group.traverse(o=>{if(o.isMesh)o.userData.noCollision=true;});

  const steamMaterial=new THREE.ShaderMaterial({name:'Soft tea steam',transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,uniforms:{uTime:{value:0}},vertexShader:`
    varying vec2 vUv;
    void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}
  `,fragmentShader:`
    varying vec2 vUv;uniform float uTime;
    void main(){float x=vUv.x-.5-.14*sin(vUv.y*7.-uTime*.8);float ribbon=exp(-x*x*95.);float edge=smoothstep(0.,.17,vUv.y)*(1.-smoothstep(.48,1.,vUv.y));float pulse=.7+.3*sin(vUv.y*9.-uTime*.75);gl_FragColor=vec4(.95,.91,1.,ribbon*edge*pulse*.075);}
  `});
  const steamGeometry=new THREE.PlaneGeometry(.48,.78,1,1),steam=new THREE.InstancedMesh(steamGeometry,steamMaterial,6);steam.name='Three quietly steaming teapots';steam.userData.noCollision=true;steam.renderOrder=2;
  for(const [i,p]of[[-2.9,TOP+.80,-.04],[2.65,TOP+.89,-.05],[-4.15,TOP+.45,.14]].entries())for(let side=0;side<2;side++)steam.setMatrixAt(i*2+side,new THREE.Matrix4().compose(v([p[0],p[1]+.34,p[2]]),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,side*Math.PI/2,0)),new THREE.Vector3(1,1,1)));
  steam.instanceMatrix.needsUpdate=true;steam.computeBoundingBox();steam.computeBoundingSphere();group.add(steam);
  group.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(group),meta=group.userData.fairyArchitecture;
  const stats={...counts,staticTriangles:meta.triangles,triangles:meta.triangles+12,drawCalls:group.children.length,paintedTexture:[width,height],bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},placements,originalAssetsModified:false,originalTexturesModified:false,additionalRenderPasses:0,additionalLights:0};
  return {group,stats,update(delta){if(!disposed&&Number.isFinite(delta))steamMaterial.uniforms.uTime.value+=Math.max(0,Math.min(delta,.1));},dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.clear();steamGeometry.dispose();steamMaterial.dispose();kit.dispose();for(const t of ownedTextures)t.dispose();ownedTextures.clear();}};
}
