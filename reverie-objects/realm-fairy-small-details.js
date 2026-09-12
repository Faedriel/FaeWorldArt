/** Ten original garden ornaments. Clone the returned prototypes for placements;
 * geometry and materials stay shared and are disposed only by the supplied kit.
 * Pass one sculpts the silhouettes. Pass two adds fitted inlays and hardware.
 */
export function buildFairySmallDetails(THREE,kit,{detailPass=true}={}) {
  const TAU=Math.PI*2,prototypes={},builders=new Map();
  let planterOuterRings=[];
  const sample=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
  const polar=(r,a,y=0)=>[r*Math.cos(a),y,r*Math.sin(a)];
  function orb(rx,ry,rz,nu=28,nv=12,lobes=0){return kit.surface(nu,nv,(u,t)=>{
    const a=u*TAU,b=(t-.5)*Math.PI,r=Math.cos(b)*(1+.065*Math.cos(lobes*a)*(lobes?1:0));
    return [rx*r*Math.cos(a),ry*Math.sin(b),rz*r*Math.sin(a)];
  });}
  function petal(length,width,depth,curl,nu=16,nv=10){return kit.surface(nu,nv,(u,t)=>{
    const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.78);return [width*s*Math.cos(a),length*t,curl*t*t+depth*s*Math.sin(a)];
  });}
  function ring(b,r,y,key='gold',tube=.008,center=[0,0],segments=40){
    b.add(new THREE.TorusGeometry(r,tube,6,segments),key,[center[0],y,center[1]],[Math.PI/2,0,0]);
  }
  function bead(b,p,r=.025,key='pearl'){b.add(orb(r,r,r,10,6),key,p);}
  function lathe(profile,segments=40){
    const g=new THREE.LatheGeometry(profile.map(p=>new THREE.Vector2(...p)),segments),p=g.attributes.position,index=g.index,kept=[];
    const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
    for(let i=0;i<index.count;i+=3){const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)];
      a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);
      if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-20)kept.push(...ids);}
    g.setIndex(kept);return g;
  }
  function starShape(r,inner=.47){
    const points=Array.from({length:10},(_,i)=>{const a=Math.PI/2+i*Math.PI/5;return new THREE.Vector2(Math.cos(a)*r*(i%2?inner:1),Math.sin(a)*r*(i%2?inner:1));});
    const shape=new THREE.Shape();shape.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++)shape.lineTo(points[i].x,points[i].y);shape.closePath();return shape;
  }
  function star(r,thickness=.035,hole=0){
    const shape=starShape(r);if(hole)shape.holes.push(new THREE.Path(starShape(r*hole).getPoints().reverse()));
    const g=new THREE.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:true,bevelSize:.009,bevelThickness:.007,bevelSegments:3,steps:1});g.translate(0,0,-thickness*.5);return g;
  }
  function crescent(r,thickness=.06){
    const s=new THREE.Shape();s.moveTo(r*.11,r);
    s.bezierCurveTo(-r*1.12,r*.95,-r*1.12,-r*.95,r*.11,-r);
    s.bezierCurveTo(-r*.49,-r*.59,-r*.49,r*.59,r*.11,r);
    const g=new THREE.ExtrudeGeometry(s,{depth:thickness,bevelEnabled:true,bevelThickness:.010,bevelSize:.010,bevelSegments:3,curveSegments:28,steps:1});g.translate(0,0,-thickness*.5);return g;
  }
  function petalTransform(b,g,key,p,r=[0,0,0]){b.add(g,key,p,r);}
  function flower(b,p,size=.15,key='rose',count=5){
    for(let i=0;i<count;i++)b.add(petal(size,size*.33,size*.11,size*.37,14,8),key,p,[.16,i*TAU/count,0]);
    bead(b,[p[0],p[1]+size*.30,p[2]],size*.20,'gold');
  }
  function begin(type,name,data={}){const b=kit.builder(name);builders.set(type,{b,data});return b;}
  function base(b,r=.30,key='pearl'){b.add(orb(r,.055,r,32,10,6),key,[0,.055,0]);}
  function roundRectangle(w,d,thickness=.025){
    const shape=new THREE.Shape(),r=.03;
    shape.moveTo(-w/2+r,-d/2);shape.lineTo(w/2-r,-d/2);shape.quadraticCurveTo(w/2,-d/2,w/2,-d/2+r);
    shape.lineTo(w/2,d/2-r);shape.quadraticCurveTo(w/2,d/2,w/2-r,d/2);shape.lineTo(-w/2+r,d/2);
    shape.quadraticCurveTo(-w/2,d/2,-w/2,d/2-r);shape.lineTo(-w/2,-d/2+r);shape.quadraticCurveTo(-w/2,-d/2,-w/2+r,-d/2);
    const g=new THREE.ExtrudeGeometry(shape,{depth:thickness,steps:1,bevelEnabled:true,bevelSize:.005,bevelThickness:.005,bevelSegments:2,curveSegments:6});g.rotateX(-Math.PI/2);return g;
  }
  function pageHalf(side){
    // Rounded rectangular leaf with a raised fore-edge and a recessed spine.
    const g=roundRectangle(.365,.48,.025),p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=(p.getX(i)+.365/2)/.365;
      p.setX(i,side*(.014+.365*x));p.setY(i,p.getY(i)+.026+Math.sin(x*Math.PI*.85)*.055+x*x*.027);
    }
    if(side<0){const index=g.index;if(index)for(let i=0;i<index.count;i+=3){const a=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,a);}else{
      for(const attr of Object.values(g.attributes))for(let i=0;i<attr.count;i+=3)for(let c=0;c<attr.itemSize;c++){const a=attr.array[(i+1)*attr.itemSize+c];attr.array[(i+1)*attr.itemSize+c]=attr.array[(i+2)*attr.itemSize+c];attr.array[(i+2)*attr.itemSize+c]=a;}
    }}
    g.computeVertexNormals();return g;
  }

  // PASS ONE — distinct complete silhouettes, thick shells and visible backs.
  {
    const b=begin('royalPlanter','Royal petal planter');
    const profile=new THREE.CatmullRomCurve3([[0,0],[.28,0],[.32,.07],[.37,.16],[.44,.38],[.46,.47],[.445,.505],[.41,.49],[.39,.36],[.32,.13],[.27,.07],[0,.07]].map(([r,y])=>new THREE.Vector3(r,y,0)),false,'centripetal');
    planterOuterRings=sample(128,t=>profile.getPoint(t*6/11)).filter(p=>p.y>=0).sort((a,b)=>a.y-b.y);
    b.add(kit.surface(64,60,(u,t)=>{
      const p=profile.getPoint(t),a=u*TAU,y=Math.max(0,Math.min(.505,p.y)),r=Math.max(0,Math.min(.46,p.x));
      const flute=t<.56?.006*(1-Math.cos(a*12))*.5*Math.sin(Math.PI*Math.min(1,y/.505)):0;
      return [(r-flute)*Math.cos(a),y,(r-flute)*Math.sin(a)];
    }),'pearl');
    b.add(orb(.37,.024,.37,32,8),'dark',[0,.405,0]);
    for(let i=0;i<6;i++){
      const a=i*TAU/6,p=polar(.22,a,.29);b.add(petal(.58,.17,.042,.21),'mint',p,[.25*Math.sin(a),a,-.25*Math.cos(a)]);
    }
    const tops=[[-.18,.84,.03],[.20,.96,-.06]];
    for(const [i,p]of tops.entries()){
      b.tube([[0,.40,0],[p[0]*.3,.64,p[2]],[p[0],p[1],p[2]]],.015,'leaf',24,6);
      // Open rounded petals in their own tilted planes before turning them
      // around the stem. This produces a layered blossom instead of six
      // overlapping vertical leaves with the same silhouette.
      for(let tier=0;tier<2;tier++)for(let j=0;j<(tier?6:8);j++){
        const g=petal(tier?.185:.25,tier?.058:.075,.020,.035,16,10);
        g.rotateZ(tier?-.38:-.72);g.rotateY(j*TAU/(tier?6:8)+tier*.28);
        b.add(g,i?'rose':'lilac',[p[0],p[1]+tier*.032,p[2]]);
      }
      bead(b,[p[0],p[1]+.125,p[2]],.039,'gold');
    }
  }
  {
    const b=begin('starLantern','Starlight lantern');base(b,.27);
    b.tube([[-.18,.07,0],[-.22,.25,0],[0,.33,0],[.22,.25,0],[.18,.07,0]],.034,'gold',30,7);
    b.add(star(.32,.11,.66),'lilac',[0,.50,0]);
    b.add(star(.224,.009),'glass',[0,.50,.065]);b.add(star(.224,.009),'glass',[0,.50,-.065]);
    b.add(orb(.14,.15,.05,24,12),'glow',[0,.5,0]);
    b.tube([[-.21,.67,0],[-.25,.88,0],[0,1.03,0],[.25,.88,0],[.21,.67,0]],.017,'gold',36,6);
  }
  {
    const b=begin('butterflyPlaque','Butterfly garden plaque');base(b,.19);
    b.tube([[0,.06,0],[.025,.16,0],[0,.27,0]],.022,'gold',16,6);
    for(const s of [-1,1]){
      b.add(petal(.33,.145,.035,.015,20,12),'lilac',[s*.015,.32,0],[0,0,-s*.72]);
      b.add(petal(.25,.11,.03,.028,18,10),'rose',[s*.015,.34,.006],[0,0,-s*2.07]);
      b.tube([[s*.01,.49,.04],[s*.045,.64,.042],[s*.11,.68,.04]],.007,'gold',18,5);
    }
    b.add(orb(.026,.115,.031,20,12),'gold',[0,.395,.04]);
  }
  {
    const b=begin('moonSign','Moonflower sign');base(b,.28);
    b.tube([[0,.06,0],[-.11,.42,0],[-.10,.96,0],[-.24,1.45,0]],.042,'pearl',42,8);
    b.add(crescent(.38,.07),'lilac',[.13,1.39,0]);
    b.add(orb(.28,.125,.042,40,14),'pearl',[.11,.93,.015]);
    for(const s of [-1,1])b.tube([[.11+s*.18,1.16,.0],[.11+s*.18,1.04,0]],.008,'gold',8,5);
    b.add(petal(.35,.11,.03,.075),'mint',[-.10,.34,0],[0,0,.60]);
  }
  {
    const b=begin('bookPedestal','Botanical book pedestal');base(b,.30);
    b.add(kit.surface(28,28,(u,t)=>{const a=u*TAU,r=(.12+.15*(2*t-1)**4)*(1+.08*Math.cos(6*a+t*2));return [r*Math.cos(a),.06+.89*t,r*Math.sin(a)];}),'lilac');
    b.add(orb(.46,.065,.34,40,14,6),'pearl',[0,.94,0]);
    for(const s of [-1,1]){
      b.add(roundRectangle(.385,.50,.02),'lilac',[s*.203,1.002,0],[0,0,-s*.10]);
      b.add(pageHalf(s),'pearl',[0,1.005,0]);
    }
    b.tube([[0,1.02,-.25],[0,1.017,0],[0,1.02,.25]],.018,'gold',16,6);
  }
  {
    const b=begin('pearlBollard','Pearl garden bollard');base(b,.24);
    b.add(lathe([[0,.06],[.16,.06],[.17,.12],[.10,.22],[.085,.48],[.16,.56],[.14,.61],[0,.61]],36),'pearl');
    b.add(orb(.145,.175,.145,32,16),'pearl',[0,.705,0]);
    for(let i=0;i<4;i++){const a=i*TAU/4;b.add(petal(.37,.11,.033,.12),'mint',polar(.07,a,.13),[.25*Math.sin(a),a,-.25*Math.cos(a)]);}
  }
  {
    const b=begin('petalStool','Petal footstool',{seatHeight:.71});
    for(let i=0;i<3;i++){
      const a=i*TAU/3;b.tube([polar(.29,a,.025),polar(.25,a,.13),polar(.17,a,.38),polar(.31,a,.55)],.027,'gold',24,7);
      b.add(petal(.28,.085,.024,.10),'mint',polar(.25,a,.035),[.32*Math.sin(a),a,-.32*Math.cos(a)]);
    }
    b.add(orb(.40,.06,.40,48,12,6),'pearl',[0,.54,0]);
    b.add(orb(.385,.115,.385,48,16,6),'rose',[0,.605,0]);
  }
  {
    const b=begin('wishingBowl','Lotus wishing bowl');base(b,.27);
    b.add(lathe([[0,.06],[.16,.06],[.16,.15],[.09,.22],[.16,.30],[.30,.37],[.45,.48],[.49,.58],[.485,.62],[.455,.62],[.43,.52],[.27,.40],[.14,.35],[0,.34]],44),'pearl');
    b.add(orb(.38,.005,.38,40,6),'glass',[0,.53,0]);
    for(let i=0;i<5;i++){const a=i*TAU/5;b.add(petal(.34,.13,.03,.15),'mint',polar(.075,a,.11),[.3*Math.sin(a),a,-.3*Math.cos(a)]);}
  }
  {
    const b=begin('crystalCluster','Petal crystal cluster');base(b,.42,'dark');
    const crystals=[[-.03,.02,1.12,.16],[.25,.03,.70,.12],[-.26,.08,.60,.13],[.11,-.22,.89,.105],[-.20,-.17,.82,.12],[.15,.22,.43,.105]];
    for(const [i,[x,z,h,r]]of crystals.entries()){
      const positions=[],idx=[];for(const [y,rr]of [[0,r*.9],[.09,r],[h*.75,r],[h*.90,r*.7],[h,0]])for(let j=0;j<6;j++)positions.push(x+rr*Math.cos(j*TAU/6),.08+y,z+rr*Math.sin(j*TAU/6));
      for(let ring=0;ring<4;ring++)for(let j=0;j<6;j++){const a=ring*6+j,c=ring*6+(j+1)%6;idx.push(a,a+6,c);if(ring<3)idx.push(c,a+6,c+6);}
      for(let j=1;j<5;j++)idx.push(0,j,j+1);
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(idx);
      const flat=g.toNonIndexed();g.dispose();flat.computeVertexNormals();b.add(flat,i%3===0?'lilac':i%3===1?'mint':'rose');
    }
  }
  {
    const b=begin('ribbonStand','Ribbon blossom stand');base(b,.30);
    b.tube([[0,.07,0],[-.10,.55,0],[-.08,1.25,0],[0,1.86,0]],.035,'pearl',40,8);
    b.tube([[-.37,1.78,0],[-.20,1.88,.02],[0,1.89,0],[.20,1.88,.02],[.37,1.78,0]],.025,'gold',32,6);
    for(const [i,x]of [-.27,-.09,.09,.27].entries()){
      const length=.60+(i%2)*.15;
      b.add(kit.surface(18,24,(u,t)=>{const a=u*TAU,w=.055*(.92+.08*Math.cos(TAU*t));return [w*Math.cos(a),length*t,.04*Math.sin(t*TAU*1.2)+.012*Math.sin(a)];}),i%2?'mint':'rose',[x,1.80,0],[0,0,Math.PI]);
    }
    flower(b,[0,1.83,0],.19,'lilac',6);
  }

  // PASS TWO — fitted details added after the complete first-pass geometry and
  // normal review. These follow the real curved surfaces instead of floating
  // above them, and remain shared geometry when the prototypes are duplicated.
  function localTube(b,points,p=[0,0,0],r=[0,0,0],radius=.0045,segments=22,closed=false,key='gold'){
    b.add(new THREE.TubeGeometry(kit.curve(points,closed),segments,radius,4,closed),key,p,r);
  }
  function inlaidLeaf(b,L,w,d,c,p,r,{rim=false,branches=false}={}){
    localTube(b,sample(16,t=>[0,L*t,c*t*t+d*Math.pow(Math.sin(Math.PI*t),.78)+.004]),p,r,.004,18);
    if(rim){const points=[];for(const side of [1,-1])for(let i=0;i<=16;i++){
      const t=side===1?i/16:1-i/16;points.push([side*w*Math.pow(Math.sin(Math.PI*t),.78),L*t,c*t*t+.004]);}
      localTube(b,points,p,r,.0045,40,true);
    }
    if(branches)for(const start of [.25,.52])for(const side of [-1,1])localTube(b,sample(10,u=>{
      const t=start+u*.20,s=Math.pow(Math.sin(Math.PI*t),.78),x=side*.78*u;
      return [w*s*x,L*t,c*t*t+d*s*Math.sqrt(1-x*x)+.004];
    }),p,r,.003,12);
  }
  function refine(type,b,data) {
    switch(type){
      case 'royalPlanter':
        ring(b,.447,.482);ring(b,.301,.078,'gold',.006);
        for(let i=0;i<6;i++){
          const a=i*TAU/6,p=polar(.22,a,.29),r=[.25*Math.sin(a),a,-.25*Math.cos(a)];inlaidLeaf(b,.58,.17,.042,.21,p,r);
          b.add(petal(.23,.095,.018,.055,14,8),'rose',polar(.36,a,.18),[.2*Math.sin(a),a,-.2*Math.cos(a)]);
          bead(b,polar(.426,a,.39),.022,'gold');
        }
        // Broad fitted botanical ribs and a low rose cameo read at garden
        // scale without scattering isolated metallic glints over the pot.
        const wallRadius=y=>{const i=planterOuterRings.findIndex(p=>p.y>=y),a=planterOuterRings[Math.max(0,i-1)],z=planterOuterRings[Math.max(0,i)];return a.x+(z.x-a.x)*(y-a.y)/Math.max(1e-9,z.y-a.y);};
        for(let i=0;i<6;i++){
          const a=i*TAU/6;
          b.tube(sample(26,t=>{const y=.11+t*.32,r=.338+.111*Math.sin(t*Math.PI*.52);return polar(r+.005,a,y);}),.006,'gold',28,5);
          const point=(w,y,r)=>[Math.cos(a)*r-Math.sin(a)*w,y,Math.sin(a)*r+Math.cos(a)*w];
          b.add(kit.surface(24,14,(u,t)=>{const q=-u*TAU,lat=(t-.5)*Math.PI,c=Math.cos(lat),y=.305+.072*Math.sin(lat);return point(.050*c*Math.cos(q),y,wallRadius(y)+.006+.009*c*Math.sin(q));}),'rose');
          b.tube(sample(48,t=>{const q=t*TAU,y=.305+.072*Math.sin(q);return point(.050*Math.cos(q),y,wallRadius(y)+.014);}),.0048,'gold',48,5,true);
        }
        data.designPasses=3;
        data.details=['smooth twelve-flute porcelain body','layered open flower heads','rolled gold lip','six oval rose cameos','continuous botanical gilt ribs','carved rose reliefs','individual leaf veins','inset pearl rivets'];break;
      case 'starLantern': {
        const contour=starShape(.305).getPoints().map(p=>[p.x,.50+p.y,.064]);
        b.tube(contour,.007,'gold',50,5,true);b.tube(contour.map(p=>[p[0],p[1],-.064]),.007,'gold',50,5,true);
        for(let i=0;i<5;i++){const a=Math.PI/2+i*TAU/5;bead(b,[Math.cos(a)*.285,.50+Math.sin(a)*.285,.078],.023,'pearl');}
        ring(b,.235,.071,'gold',.006);
        for(const s of [-1,1]){
          b.add(new THREE.TorusGeometry(.032,.006,6,20),'gold',[s*.216,.690,.016],[0,0,0]);
          b.add(petal(.17,.06,.018,.05,14,8),'mint',[s*.10,.085,.08],[0,0,-s*.55]);
        }
        data.details=['double gold star bezel','five pearl settings','hinge eyelets','leaf-carved foot'];break;
      }
      case 'butterflyPlaque':
        for(const s of [-1,1]){
          inlaidLeaf(b,.33,.145,.035,.015,[s*.015,.32,0],[0,0,-s*.72],{rim:true,branches:true});
          inlaidLeaf(b,.25,.11,.03,.028,[s*.015,.34,.006],[0,0,-s*2.07],{rim:true,branches:true});
          bead(b,[s*.11,.68,.04],.014,'rose');
        }
        for(let i=0;i<4;i++)bead(b,[0,.325+i*.045,.065],.014,i%2?'pearl':'mint');
        ring(b,.168,.068,'gold',.005);
        data.details=['four individually veined wings','continuous fine gold wing edges','segmented jewel body','pearl antenna tips'];break;
      case 'moonSign': {
        const a=.38,outer=new THREE.CubicBezierCurve3(new THREE.Vector3(a*.11,a,.046),new THREE.Vector3(-a*1.12,a*.95,.046),new THREE.Vector3(-a*1.12,-a*.95,.046),new THREE.Vector3(a*.11,-a,.046));
        const inner=new THREE.CubicBezierCurve3(new THREE.Vector3(a*.11,-a,.046),new THREE.Vector3(-a*.49,-a*.59,.046),new THREE.Vector3(-a*.49,a*.59,.046),new THREE.Vector3(a*.11,a,.046));
        // The ceramic has sharp moon tips; stop each engraved metal edge just
        // short of the cusp instead of folding a round tube around a zero radius.
        for(const edge of [outer,inner])b.tube(sample(30,t=>{const p=edge.getPoint(.02+t*.96);return [p.x+.13,p.y+1.39,p.z];}),.006,'gold',34,5);
        b.tube(sample(48,t=>[.11+.255*Math.cos(t*TAU),.93+.107*Math.sin(t*TAU),.038]),.005,'gold',48,4,true);
        const marks=[[-.15,-.025],[-.07,.04],[.04,-.01],[.14,.03]];
        const front=(x,y)=>.015+.042*Math.sqrt(Math.max(0,1-(x/.28)**2-(y/.125)**2))+.004;
        for(let i=0;i<marks.length;i++){
          const [x,y]=marks[i];bead(b,[.11+x,.93+y,front(x,y)],.012,'gold');
          if(i) {const old=marks[i-1];b.tube(sample(10,t=>{const x=old[0]*(1-t)+marks[i][0]*t,y=old[1]*(1-t)+marks[i][1]*t;return [.11+x,.93+y,front(x,y)];}),.003,'gold',10,4);}
        }
        ring(b,.25,.067,'gold',.006);inlaidLeaf(b,.35,.11,.03,.075,[-.10,.34,0],[0,0,.60],{branches:true});
        data.details=['fitted gold crescent outline','raised constellation plaque','fine oval bezel','stem leaf veins'];break;
      }
      case 'bookPedestal':
        for(let i=0;i<6;i++){
          const a=i*TAU/6;b.tube(sample(24,u=>{const t=.04+.91*u,r=(.12+.15*(2*t-1)**4)*(1+.08*Math.cos(6*a+t*2))+.004;return [r*Math.cos(a),.06+.89*t,r*Math.sin(a)];}),.006,'gold',28,4);
        }
        b.tube(sample(48,t=>{const a=t*TAU,r=1+.065*Math.cos(6*a);return [.46*r*Math.cos(a),.945,.34*r*Math.sin(a)];}),.006,'gold',48,4,true);
        for(const side of [-1,1])for(let line=0;line<4;line++){
          b.tube(sample(16,t=>{const x=.15+t*(.67-line*.055);return [side*(.014+.365*x),1.061+Math.sin(x*Math.PI*.85)*.055+x*x*.027,-.16+line*.1];}),.0028,'gold',16,4);
        }
        b.tube([[.01,1.045,-.12],[.012,1.052,.1],[.02,1.02,.25],[.065,.962,.31]],.015,'rose',20,6);
        for(const side of [-1,1])for(const z of [-.19,.19])bead(b,[side*.329,1.097,z],.012,'gold');
        data.details=['six fitted pedestal flutes','page-following gilt markings','curved rose bookmark','gilded cover corners'];break;
      case 'pearlBollard':
        ring(b,.16,.12,'gold',.008);ring(b,.145,.592,'gold',.010);ring(b,.218,.068,'gold',.006);
        for(let i=0;i<6;i++){
          const a=i*TAU/6;b.tube(sample(18,t=>{const y=.58+t*.19,r=.12+.038*Math.sin(t*Math.PI);return polar(r,a,y);}),.006,'gold',18,4);
          bead(b,polar(.132,a,.73),.018,'rose');
        }
        for(let i=0;i<4;i++){const a=i*TAU/4;inlaidLeaf(b,.37,.11,.033,.12,polar(.07,a,.13),[.25*Math.sin(a),a,-.25*Math.cos(a)]);}
        data.details=['six pearl-cup prongs','rose bezel stones','rolled neck bands','individual leaf veins'];break;
      case 'petalStool':
        for(const [r,y]of [[.385,.605],[.40,.54]])b.tube(sample(56,t=>{const a=t*TAU,s=1+.065*Math.cos(6*a);return [r*s*Math.cos(a),y,r*s*Math.sin(a)];}),.006,'gold',56,4,true);
        for(let i=0;i<12;i++){
          const a=i*TAU/12;b.tube(sample(8,t=>{const y=.605+(t-.5)*.035,f=Math.sqrt(1-((y-.605)/.115)**2),r=.385*f*(1+.065*Math.cos(6*a))+.002;return polar(r,a,y);}),.0028,'gold',8,4);
        }
        b.add(orb(.042,.014,.042,18,8,5),'gold',[0,.720,0]);
        for(let i=0;i<3;i++){const a=i*TAU/3;inlaidLeaf(b,.28,.085,.024,.10,polar(.25,a,.035),[.32*Math.sin(a),a,-.32*Math.cos(a)]);}
        data.details=['continuous scalloped seat piping','twelve shallow seam stitches','flower tuft button','carved vine feet'];break;
      case 'wishingBowl':
        ring(b,.473,.620,'gold',.007);ring(b,.158,.150,'gold',.006);ring(b,.238,.071,'gold',.006);
        for(let i=0;i<5;i++){
          const a=i*TAU/5;inlaidLeaf(b,.34,.13,.03,.15,polar(.075,a,.11),[.3*Math.sin(a),a,-.3*Math.cos(a)]);
          const p=polar(.20,a,.539);b.add(new THREE.CylinderGeometry(.024,.024,.006,16),'gold',p);bead(b,polar(.35,a,.548),.022,'pearl');
        }
        b.tube(sample(60,t=>polar(.425+.006*Math.sin(t*TAU*10),t*TAU,.517)),.006,'gold',64,4,true);
        data.details=['rolled gold bowl lip','five inset wish medallions','interior pearl wishes','veined petal cradle'];break;
      case 'crystalCluster': {
        const crystals=[[-.03,.02,1.12,.16],[.25,.03,.70,.12],[-.26,.08,.60,.13],[.11,-.22,.89,.105],[-.20,-.17,.82,.12],[.15,.22,.43,.105]];
        for(const [x,z,h,r]of crystals){
          for(let j=0;j<3;j++){
            const a=j*TAU/3;b.tube([[x+Math.cos(a)*r,.17,z+Math.sin(a)*r],[x+Math.cos(a)*r,.08+h*.75,z+Math.sin(a)*r],[x+Math.cos(a)*r*.7,.08+h*.90,z+Math.sin(a)*r*.7]],.0045,'gold',14,4);
          }
          for(const s of [-1,1])b.tube([[x+s*r*1.25,.10,z],[x+s*r*1.13,.18,z],[x+s*r*.90,.27,z]],.010,'gold',14,5);
          bead(b,[x,.13,z+r*.94],.024,'pearl');
        }
        for(let i=0;i<6;i++){const a=i*TAU/6;b.add(petal(.30,.105,.025,.13,14,8),'mint',polar(.23,a,.055),[.35*Math.sin(a),a,-.35*Math.cos(a)]);}
        b.tube(sample(48,t=>{const a=t*TAU,r=.39*(1+.065*Math.cos(6*a));return polar(r,a,.07);}),.008,'gold',48,4,true);
        data.details=['fine facet-edge fillets','individual crystal prong settings','pearl bezel rivets','sculpted leaf cradle'];break;
      }
      case 'ribbonStand':
        for(const [i,x]of [-.27,-.09,.09,.27].entries()){
          const length=.60+(i%2)*.15;
          for(const side of [-1,1])b.tube(sample(30,t=>[x+side*.055*(.92+.08*Math.cos(TAU*t)),1.80-length*t,.04*Math.sin(t*TAU*1.2)+.003]),.0045,'gold',32,4);
          b.tube(sample(24,t=>[x+.023*Math.sin(t*TAU*2),1.80-length*t,.04*Math.sin(t*TAU*1.2)+.014]),.003,'gold',26,4);
          b.add(new THREE.TorusGeometry(.027,.006,6,20),'gold',[x,1.81,0],[0,Math.PI/2,0]);
          bead(b,[x,1.80-length-.023,.04*Math.sin(TAU*1.2)],.016,'pearl');
        }
        for(const s of [-1,1]){
          b.add(petal(.32,.10,.025,.09),'mint',[-.085,.72,0],[0,0,s*.75]);
          inlaidLeaf(b,.32,.10,.025,.09,[-.085,.72,0],[0,0,s*.75]);
        }
        ring(b,.263,.070,'gold',.007);
        data.details=['eight continuous gilded ribbon hems','raised embroidered scrolls','four hanging eyelets','pearl tassels and stem leaves'];break;
    }
  }
  if(detailPass)for(const [type,{b,data}]of builders)refine(type,b,data);
  const types={};let uniqueTriangles=0,geometryBytes=0;
  for(const [type,{b,data}]of builders){
    const group=b.finish({type,units:'meters',frontAxis:'+Z',detailPasses:detailPass?2:1,...data});
    const originalMin=group.userData.fairyArchitecture.bounds.min[1];
    for(const mesh of group.children){mesh.geometry.translate(0,-originalMin,0);mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();}
    const box=new THREE.Box3().setFromObject(group),size=box.getSize(new THREE.Vector3()),m=group.userData.fairyArchitecture;
    m.floorY=0;m.bounds={min:box.min.toArray(),max:box.max.toArray()};m.footprint={width:size.x,depth:size.z};m.height=size.y;
    if(m.seatHeight!=null)m.seatHeight-=originalMin;
    prototypes[type]=group;types[type]={...m};uniqueTriangles+=m.triangles;geometryBytes+=m.geometryBytes;
  }
  return {prototypes,stats:{types,uniqueTriangles,geometryBytes,prototypeCount:Object.keys(prototypes).length,detailPasses:detailPass?2:1,textures:0,lights:0,additionalRenderPasses:0}};
}

/** A full replacement for the existing observatory stepping-stone prototype.
 * Keep the existing .78 X/Z placement scale and ground supports. The closed
 * body retains Y[-.02,.075] and stays within the old .73m local radius.
 */
export function buildFairySteppingStone(THREE,kit) {
  const b=kit.builder('Moonpetal inlaid stepping stone'),TAU=Math.PI*2;
  const sample=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
  const outer=a=>.695+.033*Math.cos(a*6);
  const profile=new THREE.CatmullRomCurve3([[0,-.020],[.88,-.020],[.975,-.015],[1,.004],[.996,.024],[.970,.047],[.925,.061],[.850,.069],[.730,.069],[.680,.062],[0,.062]].map(([r,y])=>new THREE.Vector3(r,y,0)),false,'centripetal');
  b.add(kit.surface(112,52,(u,t)=>{
    const a=u*TAU,p=profile.getPoint(t),r=Math.max(0,Math.min(1,p.x))*outer(a);
    return [r*Math.cos(a),Math.max(-.020,Math.min(.0695,p.y)),r*Math.sin(a)];
  }),'pearl');
  // One continuous gold seam follows the raised six-lobed rim, above its glaze.
  b.tube(sample(112,t=>{const a=t*TAU,r=outer(a)*.84;return[r*Math.cos(a),.0710,r*Math.sin(a)];}),.0035,'gold',112,5,true);
  // The inset motif is shallow closed enamel geometry. Veins follow each
  // leaf's real surface; every high point remains below the old .075m tread.
  for(let i=0;i<6;i++){
    const a=i*TAU/6,c=Math.cos(a),s=Math.sin(a);
    const point=(r,w,y)=>[r*c-w*s,y,r*s+w*c];
    // Analytic ellipsoid normals stay stable on this very shallow cameo;
    // averaging the two sides of a pointed 3mm-thick leaf can invert its tips.
    b.add(new THREE.SphereGeometry(1,32,12),i%2?'mint':'lilac',point(.339,0,.065),[0,-a,0],[.161,.0024,.064]);
    b.tube(sample(24,t=>point(.175+t*.329,0,.0675)),.0024,'gold',26,5);
    for(const side of[-1,1])for(const start of[.29,.55])b.tube(sample(14,t=>{
      const q=start+t*.19;return point(.178+q*.322,side*.047*t*Math.pow(Math.sin(q*Math.PI),.78),.0670);
    }),.0018,'gold',16,5);
  }
  b.add(kit.surface(64,18,(u,t)=>{
    const a=u*TAU,lat=(t-.5)*Math.PI,r=.133*(1+.065*Math.cos(5*a))*Math.cos(lat);
    return [r*Math.cos(a),.068+.003*Math.sin(lat),r*Math.sin(a)];
  }),'rose');
  b.tube(sample(80,t=>{const a=t*TAU,r=.139*(1+.065*Math.cos(5*a));return[r*Math.cos(a),.0693,r*Math.sin(a)];}),.0030,'gold',80,5,true);
  b.tube(sample(64,t=>{const a=t*TAU*1.55,r=.058*(1-t)+.010;return[r*Math.cos(a),.0720,r*Math.sin(a)];}),.0024,'gold',64,5);
  const group=b.finish({kind:'inlaid-petal-stepping-stone',designPasses:3,walkable:true,placementScale:[.78,1,.78],topY:.075,features:['closed sculpted six-lobed stone profile','rounded rising shoulder and recessed tread','continuous gilt rim seam','six inset enamel leaves with fitted veins','low sculpted rose medallion','single restrained gold rose spiral'],preservedGroundSupport:true,extraLights:0,additionalRenderPasses:0});
  return group;
}
