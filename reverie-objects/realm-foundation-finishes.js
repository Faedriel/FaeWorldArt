/** Shared, independently authored fairy foundation stonework. No source assets
 * are sampled or resized. All painting is created once at native 2048px. */
const POOLS=new WeakMap();
const SIZE=2048,TAU=Math.PI*2;
const METRIC=Object.freeze({foundationWall:Object.freeze([4,2]),foundationFloor:Object.freeze([4,4]),foundationStep:Object.freeze([4,4])});

export function createFoundationFinishes(THREE,{canvasFactory}={}){
  let pool=POOLS.get(THREE);
  if(!pool){pool=buildPool(THREE,canvasFactory);POOLS.set(THREE,pool);}
  pool.references++;let released=false;
  return{materials:pool.materials,stats:pool.stats,
    projectUV(geometry,key){if(released)throw new Error('Foundation finishes have been released.');return projectMetricUV(THREE,geometry,key);},
    dispose(){if(released)return;released=true;if(--pool.references===0){POOLS.delete(THREE);for(const material of Object.values(pool.materials))material.dispose();for(const texture of pool.textures)texture.dispose();}}
  };
}

function buildPool(THREE,canvasFactory){
  const textures=[],materials={};
  function canvas(){const c=canvasFactory?.()||globalThis.document?.createElement('canvas');if(!c?.getContext)throw new Error('Foundation finishes require a 2D canvas.');c.width=c.height=SIZE;return c;}
  function setup(texture,name){texture.name=name;texture.userData.pooledFoundationTexture=true;texture.colorSpace=THREE.NoColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.generateMipmaps=true;texture.anisotropy=8;texture.needsUpdate=true;textures.push(texture);return texture;}
  function colorTexture(c,name){const t=setup(new THREE.CanvasTexture(c),name);t.colorSpace=THREE.SRGBColorSpace;return t;}
  function packedTexture(height,metal,name){const h=height.getContext('2d').getImageData(0,0,SIZE,SIZE).data,m=metal.getContext('2d').getImageData(0,0,SIZE,SIZE).data,rgba=new Uint8Array(SIZE*SIZE*4);
    for(let i=0;i<rgba.length;i+=4){rgba[i]=h[i];rgba[i+1]=Math.max(184,Math.min(238,223+Math.round((h[i]-128)*.07)-Math.round(m[i]*.06)));rgba[i+2]=m[i];rgba[i+3]=255;}
    const t=setup(new THREE.DataTexture(rgba,SIZE,SIZE,THREE.RGBAFormat,THREE.UnsignedByteType),name);t.flipY=true;return t;
  }
  try{
    const wall=canvas(),wallHeight=canvas(),wallMetal=canvas();paintWall(wall.getContext('2d'),wallHeight.getContext('2d'),wallMetal.getContext('2d'));
    const wallColor=colorTexture(wall,'Fairy bases • rose ashlar and gilt floral ribbon · 2048'),wallPacked=packedTexture(wallHeight,wallMetal,'Fairy bases • ashlar relief / honed roughness / gilt inlay');
    const floor=canvas(),floorHeight=canvas(),floorMetal=canvas();paintFloor(floor.getContext('2d'),floorHeight.getContext('2d'),floorMetal.getContext('2d'));
    const floorColor=colorTexture(floor,'Fairy bases • pearl botanical mosaic · 2048'),floorPacked=packedTexture(floorHeight,floorMetal,'Fairy bases • fitted tile relief / stone roughness / botanical gilt');
    const steps=canvas();paintSteps(steps.getContext('2d'));const stepColor=colorTexture(steps,'Fairy bases • quiet pearl stair stone · 2048');
    materials.foundationWall=new THREE.MeshStandardMaterial({name:'Fairy foundation · rose ivory ashlar',map:wallColor,bumpMap:wallPacked,bumpScale:.011,roughnessMap:wallPacked,roughness:.84,metalnessMap:wallPacked,metalness:.55,envMapIntensity:1.04});
    materials.foundationFloor=new THREE.MeshStandardMaterial({name:'Fairy foundation · botanical pearl mosaic',map:floorColor,bumpMap:floorPacked,bumpScale:.006,roughnessMap:floorPacked,roughness:.82,metalnessMap:floorPacked,metalness:.68,envMapIntensity:1.08});
    materials.foundationStep=new THREE.MeshStandardMaterial({name:'Fairy foundation · honed pearl steps',map:stepColor,roughnessMap:floorPacked,roughness:.87,metalness:.025,envMapIntensity:.92});
    for(const [key,m]of Object.entries(materials)){m.transparent=false;m.opacity=1;m.userData.foundationFinish=key;m.userData.pooledFoundationMaterial=true;}
    const pool={materials,textures,references:0,stats:null};pool.stats=Object.freeze({materials:3,textures:textures.length,textureSize:SIZE,textureBytes:textures.length*SIZE*SIZE*4,textureBytesWithMipmaps:Math.round(textures.length*SIZE*SIZE*4*4/3),metricRepeats:METRIC,originalAssetsTouched:false,additionalRenderPasses:0,get references(){return pool.references;}});return pool;
  }catch(error){for(const m of Object.values(materials))m.dispose();for(const t of textures)t.dispose();throw error;}
}

function fill(c,color){c.fillStyle=color;c.fillRect(0,0,SIZE,SIZE);}
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function octagon(c,x,y,w,h,cut){c.beginPath();c.moveTo(x+cut,y);c.lineTo(x+w-cut,y);c.lineTo(x+w,y+cut);c.lineTo(x+w,y+h-cut);c.lineTo(x+w-cut,y+h);c.lineTo(x+cut,y+h);c.lineTo(x,y+h-cut);c.lineTo(x,y+cut);c.closePath();}
function gold(c,alpha=1){const g=c.createLinearGradient(0,0,SIZE,SIZE);g.addColorStop(0,`rgba(177,128,52,${alpha})`);g.addColorStop(.37,`rgba(231,204,128,${alpha})`);g.addColorStop(.65,`rgba(159,116,50,${alpha})`);g.addColorStop(1,`rgba(222,191,109,${alpha})`);return g;}
function strokePair(c,h,m,draw,width=6){for(const[ctx,color,lw]of[[c,gold(c),width],[h,'#b4b4b4',width+1],[m,'#fff',width]]){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.lineCap='round';ctx.beginPath();draw(ctx);ctx.stroke();}}
function leaf(c,cx,cy,length,width,rotation,color){c.save();c.translate(cx,cy);c.rotate(rotation);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-width,-length*.38,-width*.62,-length*.81,0,-length);c.bezierCurveTo(width*.62,-length*.81,width,-length*.38,0,0);c.closePath();c.fillStyle=color;c.fill();c.restore();}
function rose(c,h,m,x,y,r){
  for(let ring=2;ring>=0;ring--)for(let k=0;k<5;k++){const a=k/5*TAU+ring*.45,px=x+Math.cos(a)*r*ring*.2,py=y+Math.sin(a)*r*ring*.2;c.save();c.translate(px,py);c.rotate(a);c.beginPath();c.ellipse(0,-r*.13,r*(.55-ring*.05),r*.34,0,0,TAU);c.fillStyle=['#eed8df','#d4a4b8','#e8bacd'][ring];c.fill();c.strokeStyle='rgba(157,106,132,.52)';c.lineWidth=2;c.stroke();c.restore();}
  strokePair(c,h,m,q=>{q.arc(x,y,r*.23,.2,TAU*1.12);},4);
}
function stoneVeins(c,x,y,w,h,seed,alpha=.1){c.save();c.beginPath();c.rect(x+8,y+8,w-16,h-16);c.clip();c.strokeStyle=`rgba(147,122,148,${alpha})`;c.lineWidth=2;
  for(let k=0;k<3;k++){const q=((seed*17+k*31)%97)/97;c.beginPath();c.moveTo(x-w*.2,y+h*q);c.bezierCurveTo(x+w*.2,y+h*(q+.12),x+w*.56,y+h*(q-.1),x+w*1.15,y+h*(q+.18));c.stroke();}c.restore();}

function paintWall(c,h,m){
  fill(c,'#a18b98');fill(h,'#626262');fill(m,'#000');const w=SIZE/4,rh=SIZE/4;
  for(let row=0;row<4;row++)for(let col=-1;col<=4;col++){const x=col*w+(row%2?w/2:0),y=row*rh,pal=['#ecdad6','#e7d6dd','#f3e7dc','#dfc6d2'],base=pal[((col+8)*3+row)%pal.length];roundRect(c,x+7,y+7,w-14,rh-14,20);const gradient=c.createLinearGradient(x,y,x+w,y+rh);gradient.addColorStop(0,'#f7efe6');gradient.addColorStop(.22,base);gradient.addColorStop(.8,base);gradient.addColorStop(1,'#c9b3c0');c.fillStyle=gradient;c.fill();c.strokeStyle='rgba(255,249,231,.7)';c.lineWidth=5;c.stroke();stoneVeins(c,x,y,w,rh,row*13+col+20,.11);
    roundRect(h,x+7,y+7,w-14,rh-14,20);const hg=h.createLinearGradient(x,y,x,y+rh);hg.addColorStop(0,'#aaa');hg.addColorStop(.1,'#929292');hg.addColorStop(.9,'#909090');hg.addColorStop(1,'#747474');h.fillStyle=hg;h.fill();}
  // A visibly carved fairy ribbon, one course high, joins the ashlar work.
  const top=SIZE*.39,bottom=SIZE*.61; c.fillStyle='#ecdedb';c.fillRect(0,top,SIZE,bottom-top);h.fillStyle='#8c8c8c';h.fillRect(0,top,SIZE,bottom-top);
  for(const y of[top+9,bottom-9])strokePair(c,h,m,q=>{q.moveTo(0,y);q.lineTo(SIZE,y);},8);
  for(let k=-1;k<=4;k++){const x=(k+.5)*w,y=SIZE/2;
    for(const side of[-1,1]){strokePair(c,h,m,q=>{q.moveTo(x,y+30);q.bezierCurveTo(x+side*95,y+60,x+side*162,y-89,x+side*w/2,y-3);},5);
      for(let j=0;j<3;j++){const lx=x+side*(95+j*42),ly=y+(j===1?-20:15);leaf(c,lx,ly,70,26,side*(.75+j*.25),j%2?'#b8b5cb':'#a8bba9');strokePair(c,h,m,q=>{q.moveTo(lx,ly);q.lineTo(lx+Math.sin(side*(.75+j*.25))*50,ly-Math.cos(side*(.75+j*.25))*50);},2.7);}
    }rose(c,h,m,x,y,74);
    strokePair(c,h,m,q=>{q.arc(x+w/2,bottom-16,56,Math.PI,0);},4);
  }
}

function tileGrid(c,h){const cell=SIZE/8;fill(c,'#b3a1ad');if(h)fill(h,'#6e6e6e');
  const palette=['#f0e6df','#e3c5d2','#bfc3d8','#b7cbbf','#ede1db','#d8bfd2','#e9ddc9'];
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){const x=col*cell,y=row*cell,edge=row===0||row===7||col===0||col===7,pattern=((row+col)%4===0||(row-col+8)%4===0),color=edge?palette[1+(row+col)%3]:pattern?palette[(row*3+col)%palette.length]:palette[0];octagon(c,x+5,y+5,cell-10,cell-10,17);c.fillStyle=color;c.fill();c.strokeStyle='#fbf5e8';c.lineWidth=3;c.stroke();stoneVeins(c,x,y,cell,cell,row*9+col,.065);
    if(h){octagon(h,x+5,y+5,cell-10,cell-10,17);h.fillStyle='#989898';h.fill();h.strokeStyle='#aaa';h.lineWidth=4;h.stroke();}}
  return cell;
}
function paintFloor(c,h,m){const cell=tileGrid(c,h);fill(m,'#000');
  for(let row=0;row<=8;row++)for(let col=0;col<=8;col++){const x=col*cell,y=row*cell;for(const[ctx,color]of[[c,gold(c)],[h,'#979797'],[m,'#fff']]){ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x,y-16);ctx.lineTo(x+16,y);ctx.lineTo(x,y+16);ctx.lineTo(x-16,y);ctx.closePath();ctx.fill();}}
  const cx=SIZE/2,cy=SIZE/2,r=SIZE*.292;
  for(const scale of[1,1.045])strokePair(c,h,m,q=>q.arc(cx,cy,r*scale,0,TAU),scale===1?9:4);
  // An eight-petal pearl flower and sweeping inlaid foliage, large enough to
  // read from a whole-building view without turning the entire floor gold.
  for(let k=0;k<8;k++){const a=k/8*TAU;for(const[ctx,mode]of[[c,'color'],[h,'height'],[m,'metal']]){ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,-55);ctx.bezierCurveTo(-180,-165,-142,-365,0,-430);ctx.bezierCurveTo(142,-365,180,-165,0,-55);ctx.closePath();ctx.fillStyle=mode==='color'?(k%2?'#e9d4df':'#f1e8de'):mode==='height'?'#a0a0a0':'#000';ctx.fill();ctx.strokeStyle=mode==='color'?gold(ctx):mode==='height'?'#ababab':'#fff';ctx.lineWidth=mode==='color'?7:6;ctx.stroke();ctx.restore();}
    const a2=a+Math.PI/8,px=cx+Math.cos(a2)*r*.61,py=cy+Math.sin(a2)*r*.61;
    leaf(c,px,py,170,52,a2+Math.PI/2,k%2?'#9fb9ac':'#b9a7c7');strokePair(c,h,m,q=>{q.moveTo(px,py);q.lineTo(px+Math.cos(a2)*128,py+Math.sin(a2)*128);},4);
    strokePair(c,h,m,q=>{q.moveTo(cx+Math.cos(a2)*r*.68,cy+Math.sin(a2)*r*.68);q.bezierCurveTo(cx+Math.cos(a2-.14)*r*.98,cy+Math.sin(a2-.14)*r*.98,cx+Math.cos(a2+.1)*r*1.06,cy+Math.sin(a2+.1)*r*1.06,cx+Math.cos(a2+.16)*r*.85,cy+Math.sin(a2+.16)*r*.85);},4);
  }
  rose(c,h,m,cx,cy,84);
}
function paintSteps(c){tileGrid(c,null);const cell=SIZE/8;
  // Keep the same fitted joints as the floor relief, with a quieter stair tint.
  for(let row=0;row<8;row++)for(let col=0;col<8;col++){const x=col*cell,y=row*cell;octagon(c,x+5,y+5,cell-10,cell-10,17);const g=c.createLinearGradient(x,y,x+cell,y+cell);g.addColorStop(0,'#f5eee4');g.addColorStop(.7,(row+col)%3===0?'#e5dadd':'#ebe3dc');g.addColorStop(1,'#d1c5cf');c.fillStyle=g;c.fill();c.strokeStyle='#fff5e7';c.lineWidth=3;c.stroke();stoneVeins(c,x,y,cell,cell,row*9+col,.09);}
}

/** Project in metres using each triangle's dominant geometric face. Split all
 * indexed vertices first so one shared corner can never smear wall/top UVs.
 * The caller retains ownership of an indexed input and of the returned copy. */
function projectMetricUV(THREE,geometry,key){
  const metric=METRIC[key];if(!metric)throw new Error(`Unknown foundation finish: ${key}`);
  if(!geometry?.isBufferGeometry)throw new TypeError('Foundation projection requires BufferGeometry.');
  const result=geometry.index?geometry.toNonIndexed():geometry;
  if(result!==geometry){result.name=geometry.name;result.userData={...geometry.userData};result.setDrawRange(geometry.drawRange.start,geometry.drawRange.count);result.morphTargetsRelative=geometry.morphTargetsRelative;if(geometry.boundingBox)result.boundingBox=geometry.boundingBox.clone();if(geometry.boundingSphere)result.boundingSphere=geometry.boundingSphere.clone();}
  const p=result.attributes.position,count=p?.count||0,uv=new Float32Array(count*2);
  if(count&&!result.attributes.normal)result.computeVertexNormals();
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),edge=new THREE.Vector3(),normal=new THREE.Vector3();
  for(let start=0;start<count;start+=3){const end=Math.min(start+3,count);normal.set(0,1,0);
    if(end-start===3){a.fromBufferAttribute(p,start);b.fromBufferAttribute(p,start+1);c.fromBufferAttribute(p,start+2);edge.subVectors(b,a);normal.subVectors(c,a).crossVectors(edge,normal);if(normal.lengthSq()<1e-20)normal.set(0,1,0);}
    const ax=Math.abs(normal.x),ay=Math.abs(normal.y),az=Math.abs(normal.z),axis=ay>=ax&&ay>=az?'y':ax>=az?'x':'z';
    for(let i=start;i<end;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);let u,v;if(axis==='y'){u=x;v=normal.y>=0?-z:z;}else if(axis==='x'){u=normal.x>=0?-z:z;v=y;}else{u=normal.z>=0?x:-x;v=y;}uv[i*2]=u/metric[0];uv[i*2+1]=v/metric[1];}
  }
  result.setAttribute('uv',new THREE.BufferAttribute(uv,2));return result;
}
