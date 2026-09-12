/** Shared bespoke surface finishes. New maps retain their authored dimensions;
 * no native zone or character texture is resized or modified here. */
const pools = new WeakMap();
const pendingImages = new Set();
const TAU = Math.PI * 2;

export async function waitForFairyFinishes() {
  await Promise.all([...pendingImages]);
}

function makePool(THREE) {
  const textures = new Set();
  const stats = {textures:0, originalTexturesModified:false, resizedTextures:0,
    textile:'Custom botanical silk brocade', imageState:'headless', imageDimensions:null};
  function generated(name, paint, size=512) {
    const data=new Uint8Array(size*size*4);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const rgb=paint(x/size,y/size),i=(y*size+x)*4;
      for(let c=0;c<3;c++)data[i+c]=Math.round(Math.max(0,Math.min(255,rgb[c])));
      data[i+3]=255;
    }
    const t=new THREE.DataTexture(data,size,size,THREE.RGBAFormat,THREE.UnsignedByteType);
    t.name=name;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;
    t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
    t.anisotropy=4;t.colorSpace=THREE.NoColorSpace;t.needsUpdate=true;
    textures.add(t);return t;
  }
  const grain=(u,v)=>Math.sin(TAU*(u*37+v*53))*.34+Math.cos(TAU*(u*89-v*71))*.21+Math.sin(TAU*(u*173+v*127))*.12;
  const nacre=generated('Hand-authored pearl glaze', (u,v)=>{
    const vein=Math.sin(TAU*(u*3+v*2)+1.7*Math.sin(TAU*v*2)+.6*Math.cos(TAU*u*4));
    const shade=247-3*Math.pow(Math.abs(vein),12)+grain(u,v)*3;
    return [shade,shade-2,Math.min(255,shade+1)];
  });nacre.colorSpace=THREE.SRGBColorSpace;
  const relief=generated('Pearl glaze relief', (u,v)=>{
    const h=142+5*Math.sin(TAU*(u*3+v*2)+1.7*Math.sin(TAU*v*2))+grain(u,v)*8;return [h,h,h];
  });
  const satin=generated('Botanical silk weave relief', (u,v)=>{
    const h=140+20*Math.sin(TAU*u*128)*Math.sin(TAU*v*128)+grain(u,v)*10;return [h,h,h];
  });
  const brushed=generated('Fine chased gold roughness', (u,v)=>{
    const h=192+13*Math.sin(TAU*v*127+Math.sin(TAU*u*2)*.45)+grain(u,v)*15;return [h,h,h];
  });
  const paper=generated('Warm paper tooth', (u,v)=>{const h=235+grain(u,v)*18;return [h,h-5,h-12];});paper.colorSpace=THREE.SRGBColorSpace;
  let brocade=null,imageReady=null;
  if(typeof document!=='undefined'){
    stats.imageState='loading';
    let done,fail;
    const ready=new Promise((resolve,reject)=>{done=resolve;fail=reject;});
    imageReady=ready;pendingImages.add(ready);ready.catch(()=>{});
    brocade=new THREE.TextureLoader().load(new URL('./assets/fairy-finishes/faerie-brocade.png',import.meta.url).href,
      t=>{stats.imageState='ready';stats.imageDimensions=[t.image.width,t.image.height];done();pendingImages.delete(ready);},
      undefined,error=>{stats.imageState='error';fail(new Error('The custom fairy brocade texture could not load.'));});
    brocade.name='Original custom faerie floral brocade';brocade.colorSpace=THREE.SRGBColorSpace;
    // Mirrored edges keep a calm repeat even on narrow curved upholstery seams.
    brocade.wrapS=brocade.wrapT=THREE.MirroredRepeatWrapping;
    brocade.anisotropy=4;brocade.generateMipmaps=true;textures.add(brocade);
  }
  stats.textures=textures.size;
  return {textures,stats,refs:0,nacre,relief,satin,brushed,paper,brocade,imageReady};
}

export function createFairyFinishes(THREE) {
  let pool=pools.get(THREE);
  if(!pool){pool=makePool(THREE);pools.set(THREE,pool);}
  pool.refs++;let disposed=false;
  return {stats:pool.stats,
    apply(material,style){
      if(disposed)throw new Error('Fairy finishes have been disposed.');
      material.userData.fairyFinish=style;
      if(style==='brocade'){
        material.map=pool.brocade;material.bumpMap=pool.satin;material.bumpScale=.008;
        material.roughness=.73;material.sheen=.85;material.sheenRoughness=.78;
      }else if(style==='gold'){
        material.roughnessMap=pool.brushed;material.roughness=.43;
        material.metalness=.88;material.envMapIntensity=1.22;
        material.clearcoat=Math.min(material.clearcoat||0,.24);material.clearcoatRoughness=.34;
      }else if(style==='porcelain'||style==='enamel'){
        material.map=pool.nacre;material.bumpMap=pool.relief;material.bumpScale=.003;
        material.roughness=style==='porcelain'?.33:.38;
        material.clearcoat=.48;material.clearcoatRoughness=.32;
      }else if(style==='leaf'){
        material.bumpMap=pool.relief;material.bumpScale=.012;material.roughness=.5;
      }else if(style==='paper'){
        material.map=pool.paper;material.bumpMap=pool.satin;material.bumpScale=.002;material.roughness=.87;
      }
      material.needsUpdate=true;return material;
    },
    dispose(){
      if(disposed)return;disposed=true;
      if(--pool.refs===0){
        // A retired or failed pool must not hold later scene loads hostage.
        // Active failed pools retain their rejected promise so loading errors
        // still reach the viewer until the final owner releases the pool.
        if(pool.imageReady)pendingImages.delete(pool.imageReady);
        for(const texture of pool.textures)texture.dispose();pool.textures.clear();pools.delete(THREE);
      }
    }
  };
}
