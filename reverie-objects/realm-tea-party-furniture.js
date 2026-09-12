import {createFairyArchitectureKit} from './realm-fairy-architecture-kit.js';
import {createFairyFinishes} from './realm-fairy-finishes.js';

/** Temporary Wonderland banquet. Local +Z is the front of each chair.
 * Shared chair prototypes are instanced; all source textures stay untouched. */
export function createTeaPartyFurniture(THREE){
  const kit=createFairyArchitectureKit(THREE),finishes=createFairyFinishes(THREE);
  const group=new THREE.Group();group.name='The Unbirthday Table · ornate fairy banquet';
  const TAU=Math.PI*2,seatHeight=.87,tableTop=1.55,instances=[];
  group.userData.noCollision=true;group.userData.noStaticBatch=true;
  const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
  const cloth=(key,color)=>{
    const m=new THREE.MeshPhysicalMaterial({name:`Unbirthday ${key}`,color,roughness:.75,sheen:.8,sheenColor:0xffe6fa,sheenRoughness:.78});
    finishes.apply(m,'brocade');kit.materials[key]=m;
  };
  cloth('silkRose',0xe3a3c2);cloth('silkLilac',0xb69bd8);cloth('silkMint',0xa5d6bd);
  const wood=new THREE.MeshPhysicalMaterial({name:'Carved rosewood',color:0x744d59,roughness:.39,clearcoat:.28,clearcoatRoughness:.35});
  finishes.apply(wood,'enamel');kit.materials.wood=wood;
  const power=(n,p)=>Math.sign(n)*Math.pow(Math.abs(n),p);
  function cushion(rx,ry,rz,segments=36,rings=12){
    return kit.surface(segments,rings,(u,t)=>{
      const a=u*TAU,b=(t-.5)*Math.PI,c=Math.pow(Math.cos(b),.64);
      const x=rx*power(Math.cos(a),.76)*c,z=rz*power(Math.sin(a),.76)*c;
      let y=ry*power(Math.sin(b),.7);
      if(y>0)y-=ry*.20*Math.exp(-((x/rx)**2+(z/rz)**2)/.045)*Math.pow(y/ry,3);
      return[x,y,z];
    });
  }
  function sweep(points,radius=.06,segments=28,radial=8){
    const path=kit.curve(points),frames=path.computeFrenetFrames(segments,false);
    const g=kit.surface(radial,segments,(u,t)=>{
      const i=Math.round(t*segments),a=u*TAU,r=radius*Math.pow(Math.sin(t*Math.PI),.20)*(1-.28*t+.15*Math.sin(t*3*Math.PI));
      return path.getPointAt(t).addScaledVector(frames.normals[i],r*Math.cos(a)).addScaledVector(frames.binormals[i],r*Math.sin(a)*.82).toArray();
    });
    for(let i=0;i<g.index.count;i+=3){const a=g.index.getX(i+1);g.index.setX(i+1,g.index.getX(i+2));g.index.setX(i+2,a);}
    const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));return g;
  }
  function outline(w,d,r){
    const s=new THREE.Shape(),x=w/2,z=d/2;
    s.moveTo(-x+r,-z);s.lineTo(x-r,-z);s.quadraticCurveTo(x,-z,x,-z+r);s.lineTo(x,z-r);
    s.quadraticCurveTo(x,z,x-r,z);s.lineTo(-x+r,z);s.quadraticCurveTo(-x,z,-x,z-r);s.lineTo(-x,-z+r);s.quadraticCurveTo(-x,-z,-x+r,-z);s.closePath();return s;
  }
  function extrude(shape,depth=.06,bevel=.018){
    return new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel,bevelSegments:3,curveSegments:14});
  }
  function contour(b,shape,z,position=[0,0,0],radius=.010,key='gold',scale=[1,1,1]){
    const path=new THREE.Curve();path.getPoint=(t,out=v())=>{const p=shape.getPoint(t);return out.set(p.x,p.y,z);};
    b.add(new THREE.TubeGeometry(path,100,radius,5,true),key,position,[0,0,0],scale);
  }
  function ellipse(rx,rz,y,segments=64){return Array.from({length:segments},(_,i)=>{const a=i/segments*TAU;return[rx*power(Math.cos(a),.76),y,rz*power(Math.sin(a),.76)];});}
  function leaf(b,position,rotation,length=.25,width=.075,key='pearl'){
    const g=kit.surface(14,8,(u,t)=>{const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.78);return[width*s*Math.cos(a),length*t,.055*t*t+.016*s*Math.sin(a)];});
    b.add(g,key,position,rotation);
    b.add(new THREE.TubeGeometry(kit.curve([[0,.025,.006],[0,length*.52,.032],[0,length*.94,.051]]),12,.0045,4), 'gold',position,rotation);
  }
  function legs(b,{x=.48,z=.4,top=.69,key='pearl'}={}){
    for(const sx of[-1,1])for(const sz of[-1,1]){
      const points=[[sx*x,top,sz*z],[sx*(x+.09),top*.8,sz*(z+.03)],[sx*(x-.015),top*.40,sz*(z-.015)],[sx*(x+.12),.14,sz*(z+.08)],[sx*(x+.18),.045,sz*(z+.14)]];
      b.add(sweep(points,.065,24,8),key);
      b.tube(points.map(([a,y,c])=>[a+sx*.025,y,c+sz*.026]),.006,'gold',24,4);
      b.add(cushion(.105,.045,.078,20,8),'wood',[sx*(x+.18),.045,sz*(z+.14)]);
      leaf(b,[sx*(x+.08),.12,sz*(z+.07)],[.4*sz,0,-sx*.48],.22,.068,'pearl');
    }
  }
  function chairBase(b,clothKey){
    legs(b);
    b.add(cushion(.71,.095,.62),'wood',[0,.65,0]);
    b.add(cushion(.675,.115,.585,40,14),clothKey,[0,.755,0]);
    b.tube(ellipse(.682,.593,.735),.009,'gold',64,5,true);
    for(const side of[-1,1]){
      const p=[[side*.57,.61,.41],[side*.74,.95,.38],[side*.72,1.06,-.05],[side*.56,1.14,-.40]];
      b.add(sweep(p,.048,24,8),'pearl');b.tube(p.map(([x,y,z])=>[x+side*.028,y+.016,z]),.008,'gold',24,4);
    }
    const apron=[[-.61,.65,.54],[-.43,.53,.58],[0,.46,.59],[.43,.53,.58],[.61,.65,.54]];
    b.add(sweep(apron,.045,28,8),'wood');b.tube(apron.map(([x,y,z])=>[x,y+.015,z+.025]),.007,'gold',28,4);
    for(const side of[-1,1])leaf(b,[0,.47,.616],[0,0,-side*.88],.24,.067,'pearl');
  }
  function heart(){
    const s=new THREE.Shape();s.moveTo(0,.10);
    s.bezierCurveTo(-.04,.10,-.11,.20,-.18,.27);s.bezierCurveTo(-.70,.68,-.83,1.09,-.51,1.29);
    s.bezierCurveTo(-.28,1.45,-.12,1.35,-.045,1.19);s.quadraticCurveTo(0,1.105,.045,1.19);
    s.bezierCurveTo(.12,1.35,.28,1.45,.51,1.29);s.bezierCurveTo(.83,1.09,.70,.68,.18,.27);
    s.bezierCurveTo(.11,.20,.04,.10,0,.10);return s;
  }
  function tuft(b,x,y,z,clothKey){
    b.add(cushion(.028,.028,.013,12,6),clothKey,[x,y,z]);
    for(const side of[-1,1])b.tube([[x-side*.09,y-.13,z-.008],[x-side*.03,y-.04,z],[x,y,z+.003],[x+side*.03,y+.04,z],[x+side*.09,y+.13,z-.008]],.0025,'gold',16,4);
  }
  function heartChair(host=false){
    const b=kit.builder(host?'Hatter host throne':'Rose-heart chair'),clothKey=host?'silkLilac':'silkRose',shape=heart();
    chairBase(b,clothKey);
    const pos=[0,1.02,-.50],scale=host?[1.16,1.53,1]:[.93,1.04,1];
    b.add(extrude(shape,.09,.027),'pearl',pos,[0,0,0],scale);
    contour(b,shape,.123,pos,.010,'gold',scale);
    b.add(extrude(shape,.040,.058),clothKey,[0,1.12,-.398],[0,0,0],[scale[0]*.81,scale[1]*.82,1]);
    for(const side of[-1,1]){
      const p=[[side*.46,.65,-.44],[side*.54,1.28,-.50],[side*.43,host?2.30:1.81,-.49]];
      b.add(sweep(p,.048,24,8),'wood');
      leaf(b,[side*.16,1.30,-.272],[0,0,-side*.70],.35,.065,'gold');
    }
    for(const side of[-1,1])tuft(b,side*.23,host?2.12:1.83,-.293,clothKey);
    tuft(b,0,host?1.71:1.47,-.285,clothKey);
    if(host){
      // A tiny tilted top-hat crest crowns the elongated heart, with an open
      // gilded brim and a curved crown rather than a rectangular signboard.
      const crown=new THREE.Shape();crown.moveTo(-.27,0);crown.bezierCurveTo(-.23,.15,-.30,.31,-.35,.51);
      crown.quadraticCurveTo(0,.62,.35,.51);crown.bezierCurveTo(.30,.31,.23,.15,.27,0);crown.quadraticCurveTo(0,-.055,-.27,0);
      b.add(extrude(crown,.065,.023),'wood',[.03,3.00,-.46],[0,0,-.13]);
      const edge2=new THREE.CurvePath();for(const curve of crown.curves.slice(0,3))edge2.add(curve);
      const edge3=new THREE.Curve();edge3.getPoint=(t,out=v())=>{const p=edge2.getPoint(t);return out.set(p.x,p.y,.091);};
      b.add(new THREE.TubeGeometry(edge3,70,.009,5,false),'gold',[.03,3.00,-.46],[0,0,-.13]);
      b.add(cushion(.46,.045,.14,36,8),'gold',[.03,3.01,-.43],[0,0,-.13]);
      b.tube([[-.24,3.17,-.348],[.01,3.155,-.347],[.27,3.19,-.348]],.021,'rose',20,6);
    }
    return b.finish({style:host?'hatter-host':'heart',seatHeight});
  }
  function cupChair(){
    const b=kit.builder('Lavender teacup chair');chairBase(b,'silkLilac');
    const s=new THREE.Shape();s.moveTo(-.28,0);s.bezierCurveTo(-.52,.20,-.65,.63,-.68,1.14);
    s.quadraticCurveTo(0,1.23,.68,1.14);s.bezierCurveTo(.65,.63,.52,.20,.28,0);s.quadraticCurveTo(0,-.08,-.28,0);
    b.add(extrude(s,.09,.027),'mint',[0,1.05,-.5]);contour(b,s,.126,[0,1.05,-.5],.010);
    b.add(extrude(s,.035,.055),'silkLilac',[0,1.16,-.393],[0,0,0],[.80,.80,1]);
    b.add(cushion(.77,.055,.22,40,8),'pearl',[0,1.035,-.415]);
    b.tube([[.63,2.08,-.42],[1.00,2.17,-.42],[1.10,1.83,-.40],[.94,1.56,-.40],[.55,1.57,-.41]],.052,'pearl',40,8);
    b.tube([[.65,2.09,-.361],[.99,2.12,-.362],[1.05,1.83,-.342],[.91,1.61,-.342],[.57,1.61,-.354]],.009,'gold',40,5);
    for(const x of[-.27,0,.27])tuft(b,x,1.69,-.285,'silkLilac');
    for(const side of[-1,1])leaf(b,[side*.12,1.34,-.264],[0,0,-side*.85],.27,.070,'gold');
    return b.finish({style:'teacup',seatHeight});
  }
  function wingShape(side){
    const s=new THREE.Shape(),p=(x,y)=>[x*side,y];s.moveTo(...p(.02,0));
    s.bezierCurveTo(...p(.48,.10),...p(.92,.70),...p(1.02,1.37));s.bezierCurveTo(...p(1.02,1.55),...p(.89,1.54),...p(.79,1.34));
    s.bezierCurveTo(...p(.66,1.61),...p(.49,1.66),...p(.45,1.38));s.bezierCurveTo(...p(.32,1.52),...p(.15,1.40),...p(.20,1.08));
    s.bezierCurveTo(...p(.02,.76),...p(-.06,.18),...p(.02,0));return s;
  }
  function wingChair(){
    const b=kit.builder('Mint feather-wing chair');chairBase(b,'silkMint');
    b.add(cushion(.42,.72,.095,36,20),'silkMint',[0,1.54,-.35]);
    for(const side of[-1,1]){
      const shape=wingShape(side),pos=[side*.03,.94,-.51],scale=[.68,1.02,1];
      b.add(extrude(shape,.07,.022),'pearl',pos,[0,0,0],scale);
      // Feather veins stop short of the sculpted shoulders; no metal tube
      // turns around the small scallop cusps.
      for(let i=0;i<3;i++){
        const points=[[side*.08,1.03,-.398],[side*(.25+i*.105),1.56+i*.15,-.397],[side*(.28+i*.16),2.18+i*.07,-.394]];
        b.add(sweep(points,.022,22,8),'pearl');b.tube(points.map(([x,y,z])=>[x+side*.013,y,z+.024]),.006,'gold',22,4);
      }
      leaf(b,[side*.13,1.00,-.233],[0,0,-side*.62],.32,.082,'gold');
    }
    tuft(b,0,1.57,-.250,'silkMint');
    return b.finish({style:'wing',seatHeight});
  }
  // The flat brocade top ends exactly at Y1.55; its drapery has real depth and
  // a continuous embroidered hem below the service surface.
  const table=kit.builder('Scalloped Unbirthday banquet table'),tableShape=outline(10.8,2.5,.26);
  table.add(extrude(outline(10.68,2.39,.25),.095,.020),'wood',[0,1.405,0],[-Math.PI/2,0,0]);
  const top=new THREE.ShapeGeometry(tableShape,24);top.rotateX(-Math.PI/2);
  const topUv=top.attributes.uv;for(let i=0;i<topUv.count;i++)topUv.setXY(i,topUv.getX(i)*.72,topUv.getY(i)*.72);
  table.add(top,'silkRose',[0,tableTop,0]);
  function drape(u,t){
    const p=tableShape.getPoint(u),tangent=tableShape.getTangent(u),n=[tangent.y,tangent.x];
    const pleat=.040*Math.sin(u*TAU*26)*Math.sin(t*Math.PI),out=.036*Math.sin(t*Math.PI)+pleat;
    const drop=.29+.15*(.5-.5*Math.cos(u*TAU*14));
    return[p.x+n[0]*out,tableTop-t*drop,-p.y+n[1]*out];
  }
  table.add(kit.surface(260,10,drape),'silkRose');
  table.tube(Array.from({length:260},(_,i)=>drape(i/260,1)),.013,'gold',260,5,true);
  for(const side of[-1,1]){
    const apron=[[-5.1,1.38,side*1.10],[-4.35,1.15,side*1.11],[-2.8,1.24,side*1.11],[0,1.11,side*1.11],[2.8,1.24,side*1.11],[4.35,1.15,side*1.11],[5.1,1.38,side*1.10]];
    table.add(sweep(apron,.081,70,10),'wood');table.tube(apron.map(([x,y,z])=>[x,y-.006,z+side*.054]),.011,'gold',70,5);
    for(const x of[-4.35,0,4.35]){
      const s=x===0?1:Math.sign(x),p=[[x,1.39,side*.89],[x+s*.15,1.11,side*.97],[x-s*.07,.62,side*.89],[x+s*.17,.19,side*1.04],[x+s*.29,.055,side*1.12]];
      table.add(sweep(p,.12,32,10),'wood');table.tube(p.map(([a,y,z])=>[a+s*.054,y,z+side*.042]),.009,'gold',32,5);
      table.add(cushion(.17,.055,.12,24,8),'pearl',[x+s*.29,.055,side*1.12]);
      leaf(table,[x+s*.13,.12,side*1.025],[side*.38,0,-s*.44],.34,.11,'pearl');
      for(const sign of[-1,1])leaf(table,[x,1.20,side*1.18],[0,side<0?Math.PI:0,-sign*.8],.28,.078,'gold');
    }
    for(const x of[-2.40,2.40]){
      // Broad, soft tied bow loops follow the hanging cloth rather than sit
      // on top of it, keeping the entire banquet available for tea service.
      for(const sign of[-1,1])table.add(kit.petal(.35,.12,.055,.08),'silkLilac',[x,1.20,side*1.272],[0,side<0?Math.PI:0,-sign*1.12]);
      table.add(cushion(.064,.066,.035,16,8),'gold',[x,1.21,side*1.30]);
    }
  }
  const tableGroup=table.finish({style:'banquet',tableTop,length:10.8,width:2.5});group.add(tableGroup);
  const prototypes={heart:heartChair(),teacup:cupChair(),wing:wingChair(),host:heartChair(true)};
  const seats=[],placements={heart:[],teacup:[],wing:[],host:[]};
  for(const [row,z]of[-2.05,2.05].entries())for(const [i,x]of[-3.6,-1.2,1.2,3.6].entries()){
    const style=[['heart','teacup','wing','heart'],['wing','heart','teacup','wing']][row][i],yaw=z<0?0:Math.PI;
    placements[style].push({position:[x,0,z],yaw});seats.push({id:`guest-${row*4+i+1}`,style,position:[x,seatHeight,z],floorPosition:[x,0,z],yaw,front:[Math.sin(yaw),0,Math.cos(yaw)]});
  }
  placements.host.push({position:[-6,0,0],yaw:Math.PI/2});seats.push({id:'hatter-host',style:'host',position:[-6,seatHeight,0],floorPosition:[-6,0,0],yaw:Math.PI/2,front:[1,0,0]});
  const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion();
  for(const [style,prototype]of Object.entries(prototypes))for(const child of prototype.children){
    const list=placements[style],mesh=new THREE.InstancedMesh(child.geometry,child.material,list.length);mesh.name=`${style} chairs · ${child.material.name}`;
    list.forEach((p,i)=>{matrix.compose(v(...p.position),quaternion.setFromAxisAngle(v(0,1,0),p.yaw),v(1,1,1));mesh.setMatrixAt(i,matrix);});
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData.noCollision=true;mesh.userData.noStaticBatch=true;instances.push(mesh);group.add(mesh);
  }
  group.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(group);let triangles=0,drawCalls=0;
  group.traverse(o=>{if(o.isMesh){triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);drawCalls++;o.userData.noCollision=true;o.userData.noStaticBatch=true;}});
  const stats={tableTop,seatHeight,seats,chairs:9,chairStyles:4,triangles,uniqueTriangles:kit.stats.uniqueTriangles,drawCalls,geometryBytes:kit.stats.geometryBytes,
    bounds:{min:box.min.toArray(),max:box.max.toArray()},sourceTexturesModified:false,resizedTextures:0,additionalRenderPasses:0,
    features:['curved rosewood and porcelain cabriole legs','scalloped rose brocade drapery','gilded bows and carved aprons','heart, teacup and feather-wing guest chairs','elongated Hatter heart throne with hat crest','shared instanced chair geometry']};
  let disposed=false;return{group,stats,dispose(){if(disposed)return;disposed=true;group.removeFromParent();group.clear();for(const mesh of instances)mesh.dispose();kit.dispose();finishes.dispose();}};
}
