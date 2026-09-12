/** Fitted botanical relief for the lotus pavilion. Uses only the owner's
 * existing material buckets and geometries; every coordinate is in meters. */
export function addPavilionBotanicalRelief(THREE,kit,b,{roofPoint,columnCenter}){
  const TAU=Math.PI*2,seq=(n,fn)=>Array.from({length:n+1},(_,i)=>fn(i/n));
  const stats={roofLeaves:0,sculptedBrackets:0,ceilingPetals:0,additionalLights:0,additionalRenderPasses:0};
  // Each leaf is a closed lens that follows the actual compound roof surface.
  // The relief has real thickness, with its gold rim seated on the upper face;
  // the shallow raised setting keeps it clear of older roof engraving.
  for(let course=0;course<2;course++)for(let i=0;i<6;i++){
    const upper=course===1,angle=i*TAU/6+course*Math.PI/6;
    for(const start of[.315,.605])for(const side of[-1,1]){
      function point(t,s=0,depth=0){
        const swell=Math.pow(Math.sin(Math.PI*t),.83);
        const p=roofPoint(angle,start+.145*t+side*.016*swell*s,
          side*(.11+.65*t)+.13*swell*s,true,upper);
        p[1]+=.036+depth;return p;
      }
      b.add(kit.surface(16,14,(u,t)=>{
        const theta=u*TAU,swell=Math.sin(Math.PI*t);
        return point(t,Math.cos(theta),.022*swell*Math.sin(theta));
      }),upper?'pearl':'rose');
      // Two inlaid border strokes stop short of the pointed ceramic tips.
      // Wrapping a constant-width tube around those tips folds its inner wall.
      for(const edge of[-1,1])b.tube(seq(24,t=>point(.075+.85*t,edge,.010)),.012,'gold',24,5);
      // The central midrib arches over the raised leaf; side veins are fitted
      // to the same lens rather than floating over its curved surface.
      b.tube(seq(20,t=>point(t,0,.022*Math.sin(Math.PI*t)+.014)),.011,'gold',20,5);
      for(const root of[.30,.56])for(const branchSide of[-1,1]){
        b.tube(seq(10,u=>{
          const t=root+.19*u,s=.76*u*branchSide;
          return point(t,s,.022*Math.sin(Math.PI*t)*Math.sqrt(1-s*s)+.010);
        }),.0055,'gold',10,4);
      }
      stats.roofLeaves++;
    }
  }
  // Twelve hand-carved brackets grow from the column capitals into the arches.
  // A tapered fluted profile gives these solid supports a sculpted silhouette,
  // avoiding another stack of rings or constant-width tubular trim.
  for(let i=0;i<6;i++)for(const side of[-1,1]){
    const angle=i*TAU/6,base=columnCenter(angle,1);
    const axis=new THREE.Vector3(-Math.sin(angle)*side,0,Math.cos(angle)*side),radial=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle));
    const points=seq(24,t=>new THREE.Vector3(...base)
      .addScaledVector(axis,.08+.99*t)
      .addScaledVector(radial,-.025-.14*Math.sin(Math.PI*t))
      .add(new THREE.Vector3(0,-.42+.75*t-.13*Math.sin(TAU*t),0)));
    const curve=kit.curve(points),frames=curve.computeFrenetFrames(28,false);
    b.add(kit.surface(12,28,(u,t)=>{
      const p=curve.getPointAt(t),index=Math.min(28,Math.round(t*28)),phase=u*TAU;
      const radius=.075*Math.pow(Math.sin(Math.PI*t),.48)*(1+.16*Math.cos(phase*5));
      return p.addScaledVector(frames.normals[index],Math.cos(phase)*radius)
        .addScaledVector(frames.binormals[index],Math.sin(phase)*radius*.72).toArray();
    }),'pearl');
    const inlay=seq(28,t=>{
      const p=curve.getPointAt(t),index=Math.min(28,Math.round(t*28));
      return p.addScaledVector(frames.normals[index],.075*Math.pow(Math.sin(Math.PI*t),.48)+.012).toArray();
    });
    b.tube(inlay,.011,'gold',28,5);
    stats.sculptedBrackets++;
  }
  // An ivory lotus boss hangs close beneath the existing ceiling rosette.
  // Its petals curl back toward the ceiling and carry integral gold veins.
  for(let i=0;i<8;i++){
    const angle=i*TAU/8,rotation=[Math.PI,angle,0],position=[Math.sin(angle)*.055,7.62,Math.cos(angle)*.055];
    const length=.47,width=.16,curl=.31,depth=.035;
    b.add(kit.petal(length,width,depth,curl),i%2?'pearl':'mint',position,rotation);
    const midrib=seq(20,t=>[0,length*t,curl*t*t+depth*Math.pow(Math.sin(Math.PI*t),.78)+.014]);
    b.add(new THREE.TubeGeometry(kit.curve(midrib),20,.010,5,false),'gold',position,rotation);
    for(const side of[-1,1]){
      const vein=seq(10,u=>{const t=.32+.32*u,swell=Math.pow(Math.sin(Math.PI*t),.78),s=side*.72*u;
        return[width*swell*s,length*t,curl*t*t+depth*swell*Math.sqrt(1-s*s)+.010];});
      b.add(new THREE.TubeGeometry(kit.curve(vein),10,.0055,4,false),'gold',position,rotation);
    }
    stats.ceilingPetals++;
  }
  return stats;
}
