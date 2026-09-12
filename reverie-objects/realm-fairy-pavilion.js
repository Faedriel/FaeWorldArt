import {addPavilionBotanicalRelief} from './realm-fairy-pavilion-relief.js';

/** Original lotus pavilion. Shared kit owns all geometry/material resources.
 * Local +Z is the front entrance; the six pearl feet touch local floor Y=0.
 * No world placement, lights, animation or additional renderer passes.
 */
export function buildFairyPavilion(THREE,kit) {
  if(!kit?.builder||!kit?.surface||!kit?.petal)throw new TypeError('A fairy architecture kit is required.');
  const b=kit.builder('Lotus pavilion'),TAU=Math.PI*2,R=5.15;
  const xyz=(radius,angle,y)=>[Math.cos(angle)*radius,y,Math.sin(angle)*radius];
  const sample=(count,fn)=>Array.from({length:count+1},(_,i)=>fn(i/count));
  function orb(rx,ry,rz,segments=28,rings=12){
    return kit.surface(segments,rings,(u,t)=>{
      const a=u*TAU,p=(t-.5)*Math.PI,s=Math.cos(p);
      return [rx*s*Math.cos(a),ry*Math.sin(p),rz*s*Math.sin(a)];
    });
  }
  function bead(position,scale=.045,material='pearl'){
    b.add(orb(scale,scale*1.3,scale,10,6),material,position);
  }
  function ring(radius,y,thickness,material,position=[0,0,0],segments=48){
    b.add(new THREE.TorusGeometry(radius,thickness,6,Math.round(segments*.75)),material,[position[0],y+position[1],position[2]],[Math.PI/2,0,0]);
  }
  function petal(length,width,depth,curl){
    return kit.surface(16,10,(u,t)=>{
      const a=u*TAU,s=Math.pow(Math.sin(Math.PI*t),.78);
      return [width*s*Math.cos(a),length*t,curl*t*t+depth*s*Math.sin(a)];
    });
  }
  function leaf(position,rotation,length=.48,width=.16,material='mint'){
    b.add(petal(length,width,.045,length*.25),material,position,rotation);
    const path=sample(18,t=>[0,length*t,length*.25*t*t+.048*Math.sin(Math.PI*t)]);
    b.add(new THREE.TubeGeometry(kit.curve(path),14,.009,4,false),'gold',position,rotation);
  }
  function columnCenter(angle,t){
    const radial=R+.14*Math.sin(Math.PI*t)-.10*Math.sin(TAU*t),tangent=.11*Math.sin(TAU*t);
    return [radial*Math.cos(angle)-tangent*Math.sin(angle),.07+6.00*t,radial*Math.sin(angle)+tangent*Math.cos(angle)];
  }
  function columnRadius(t){return .155+.11*(1-t)**3+.14*t**5;}

  // Curved, gently fluted pearl columns with closed ends. The foot is a single
  // broad polished pebble, encircled by three carved leaves and thin gold bands.
  for(let i=0;i<6;i++){
    const angle=i*TAU/6,base=xyz(R,angle,0);
    b.add(orb(.42,.095,.42,32,12),'foundation',[base[0],.095,base[2]]);
    ring(.345,.082,.014,'gold',base,48);
    b.add(kit.surface(20,32,(u,t)=>{
      const p=columnCenter(angle,t),a=u*TAU;
      const cap=Math.sqrt(Math.max(0,Math.min(1,t/.015,(1-t)/.015)));
      const radius=columnRadius(t)*cap*(1+.045*Math.cos(a*6+t*.8));
      return [p[0]+radius*Math.cos(a),p[1],p[2]+radius*Math.sin(a)];
    }),'pearl');
    for(let j=0;j<3;j++){
      const phase=j*TAU/3;
      b.tube(sample(46,t=>{
        const p=columnCenter(angle,.035+t*.93),a=phase+t*1.5,r=columnRadius(.035+t*.93)+.003;
        return [p[0]+Math.cos(a)*r,p[1],p[2]+Math.sin(a)*r];
      }),.010,'gold',32,4);
      // All carved feet remain above Y=0; they do not block adjacent entrances.
      leaf([base[0]+Math.cos(phase)*.12,.12,base[2]+Math.sin(phase)*.12],[.38*Math.sin(phase),phase,-.38*Math.cos(phase)],.46,.17,'mint');
    }
    const top=columnCenter(angle,1);
    ring(.27,5.70,.019,'gold',[top[0],0,top[2]],48);
    ring(.30,5.87,.017,'gold',[top[0],0,top[2]],48);
    for(let j=0;j<3;j++){
      const a=angle+j*TAU/3;
      leaf([top[0],5.68,top[2]],[.50*Math.sin(a),a,-.50*Math.cos(a)],.79,.25,j===1?'rose':'pearl');
    }
    for(const j of [0,1]){
      const a=angle+(j?1.9:-1.5),p=columnCenter(angle,.20+j*.23);
      leaf([p[0]+Math.cos(a)*.14,p[1],p[2]+Math.sin(a)*.14],[.46*Math.sin(a),a,-.46*Math.cos(a)],.54,.17,j?'mint':'rose');
    }
  }

  // Six high, airy arches follow the column ring. Their lower gilt bead runs
  // below the pearl arch; the middle of every entry has over 5.5m clear height.
  for(let i=0;i<6;i++){
    const angle=i*TAU/6;
    const path=sample(40,t=>xyz(R-.05-.15*Math.sin(Math.PI*t),angle+t*TAU/6,5.53+1.03*Math.sin(Math.PI*t)));
    b.tube(path,.075,'pearl',64,10);
    b.tube(path.map(([x,y,z])=>[x*.995,y-.105,z*.995]),.014,'gold',48,4);
    const top=xyz(R-.20,angle+Math.PI/6,6.55);
    bead(top,.087,'rose');
    for(const side of [-1,1]){
      const a=angle+Math.PI/6+side*.115,p=xyz(R-.17,a,6.44);
      leaf(p,[.40*Math.sin(a),a,-side*.65],.39,.12,'mint');
    }
  }

  // Twelve separate thick ceramic petals form two interleaved roof courses.
  // Closed oval sections taper into the lotus tips, with an upturned eave.
  // Positive sin(u) is intentional: kit triangles are (a,c,b), and the cross
  // axis is tangent to the radial roof. This keeps the upper surface outward/up.
  function roofProfile(t,upper){
    const width=(upper?2.18:2.52)*Math.pow(Math.sin(Math.PI*t),.67)*(.47+.53*t);
    const radius=.52+(upper?6.02:6.40)*t;
    const y=7.94+(upper?.13:0)-2.34*t+.34*Math.sin(Math.PI*t)+.55*t**8;
    const depth=.145*Math.pow(Math.sin(Math.PI*t),.55);
    return {width,radius,y,depth};
  }
  function roofPoint(angle,t,signedWidth=0,top=true,upper=false){
    const p=roofProfile(t,upper),x=p.width*signedWidth;
    return [Math.cos(angle)*p.radius-Math.sin(angle)*x,p.y+(top?p.depth*Math.sqrt(Math.max(0,1-signedWidth**2)):0),Math.sin(angle)*p.radius+Math.cos(angle)*x];
  }
  for(let course=0;course<2;course++)for(let i=0;i<6;i++){
    const upper=course===1,angle=i*TAU/6+course*Math.PI/6;
    const material=upper?(i%3===0?'mint':'rose'):'lilac';
    b.add(kit.surface(20,32,(u,t)=>{
      const a=u*TAU,p=roofProfile(t,upper),x=p.width*Math.cos(a);
      return [Math.cos(angle)*p.radius-Math.sin(angle)*x,p.y+p.depth*Math.sin(a),Math.sin(angle)*p.radius+Math.cos(angle)*x];
    }),material);
    b.tube(sample(56,t=>{const p=roofPoint(angle,t,0,true,upper);p[1]+=.011;return p;}),.018,'gold',48,5);
    const rim=[];
    for(const side of [1,-1])for(let j=0;j<=24;j++){
      const t=side===1?j/24:1-j/24,p=roofPoint(angle,t,side,false,upper);p[1]+=.004;rim.push(p);
    }
    b.tube(rim,.015,'gold',56,4,true);
    // Branching surface veins are genuinely curved, not straight spokes.
    for(const t0 of [.30,.58])for(const side of [-1,1]){
      const points=sample(18,s=>{
        const p=roofPoint(angle,t0+s*.18,side*.87*Math.sin(s*Math.PI/2),true,upper);p[1]+=.009;return p;
      });
      b.tube(points,.009,'gold',18,4);
    }
    const tip=roofPoint(angle,.997,0,true,upper);
    bead([tip[0],tip[1]-.055,tip[2]],.043,'pearl');
  }
  // Small closed crown covers the roof's center opening; its bud tops at8.5m.
  b.add(orb(.70,.16,.70,48,16),'pearl',[0,7.99,0]);
  ring(.57,8.015,.023,'gold',[0,0,0],64);
  for(let i=0;i<6;i++){
    const a=i*TAU/6;
    b.add(petal(.40,.155,.055,.22),'rose',xyz(.12,a,8.005),[.20*Math.sin(a),a,-.20*Math.cos(a)]);
  }
  b.add(orb(.13,.34,.13,24,16),'gold',[0,8.16,0]);

  // Alternating rail bays leave three open entries centered on +Z and±120°.
  // Gold vines turn into paired leaves instead of vertical picket bars.
  for(let i=0;i<6;i+=2){
    const start=i*TAU/6+.075,end=(i+1)*TAU/6-.075;
    b.tube(sample(40,t=>xyz(R,start+(end-start)*t,1.19+.08*Math.sin(Math.PI*t))),.048,'pearl',56,8);
    b.tube(sample(32,t=>xyz(R,start+(end-start)*t,.38)),.023,'gold',32,5);
    b.tube(sample(40,t=>xyz(R,start+(end-start)*t,1.19+.08*Math.sin(Math.PI*t)+.05)),.012,'gold',40,4);
    for(let j=0;j<4;j++){
      const center=start+(j+.5)*(end-start)/4;
      const vine=sample(28,t=>{
        const a=center+.078*Math.sin(TAU*t),r=R+.045*Math.sin(Math.PI*t);
        return xyz(r,a,.38+.78*t);
      });
      b.tube(vine,.015,'gold',24,4);
      for(const side of [-1,1]){
        const a=center+side*.037,p=xyz(R,a,.61+(side+1)*.10);
        leaf(p,[.18*Math.sin(a),a,-side*.72],.36,.12,j%2?'mint':'rose');
      }
    }
  }

  // Hanging buds attach beneath actual roof petals near the columns. They are
  // above head height and outside the center of every entrance; no point lights.
  for(let i=0;i<6;i++){
    const angle=i*TAU/6,r=4.53,x=Math.cos(angle)*r,z=Math.sin(angle)*r;
    const roofT=(r-.52)/6.40,roof=roofProfile(roofT,false),anchorY=roof.y-roof.depth+.025;
    b.tube([[x,anchorY,z],[x-.025*Math.sin(angle),6.00,z+.025*Math.cos(angle)],[x,5.18,z]],.011,'gold',24,4);
    for(let j=1;j<=5;j++)bead([x,5.18+(anchorY-5.18)*j/6,z],.032,'pearl');
    ring(.16,5.13,.015,'gold',[x,0,z],32);
    b.add(orb(.15,.23,.15,20,14),'glow',[x,4.86,z]);
    for(let j=0;j<5;j++){
      const a=j*TAU/5;
      b.add(petal(.56,.135,.025,.25),'glass',[x,5.11,z],[0,a,Math.PI]);
      const vein=sample(18,t=>[x+Math.sin(a)*.25*t*t,5.11-.56*t,z+Math.cos(a)*.25*t*t]);
      b.tube(vein,.008,'gold',20,4);
      const p=vein.at(-1);bead([p[0],p[1]-.035,p[2]],.023,'rose');
    }
  }
  // Close-detail pass: recessed-looking hairline flutes sit on the existing
  // column profile, with fitted secondary veins across each carved capital.
  // They stay inside the original roof footprint and do not cross an entrance.
  for(let i=0;i<6;i++){
    const angle=i*TAU/6,top=columnCenter(angle,1);
    for(let j=0;j<3;j++){
      const phase=(j+.5)*TAU/3;
      b.tube(sample(28,u=>{
        const t=.08+.80*u,p=columnCenter(angle,t),r=columnRadius(t)*(1+.045*Math.cos(phase*6+t*.8))+.003;
        return [p[0]+r*Math.cos(phase),p[1],p[2]+r*Math.sin(phase)];
      }),.0045,'gold',28,4);
      const a=angle+j*TAU/3,rotation=[.50*Math.sin(a),a,-.50*Math.cos(a)],position=[top[0],5.68,top[2]];
      for(const t0 of [.30,.57])for(const side of [-1,1]){
        const points=sample(10,u=>{
          const t=t0+.20*u,s=Math.pow(Math.sin(Math.PI*t),.78),x=side*.72*u;
          return [.25*s*x,.79*t,.1975*t*t+.045*s*Math.sqrt(1-x*x)+.003];
        });
        b.add(new THREE.TubeGeometry(kit.curve(points),10,.0038,4,false),'gold',position,rotation);
      }
    }
  }
  // Roof filigree is sampled from the same thick petal surfaces. Short forked
  // inlays and pearl nodes add close-range detail without extending the eaves.
  for(let course=0;course<2;course++)for(let i=0;i<6;i++){
    const upper=course===1,angle=i*TAU/6+course*Math.PI/6;
    for(const t0 of [.18,.45,.70])for(const side of [-1,1]){
      const points=sample(10,u=>{
        const p=roofPoint(angle,t0+.105*u,side*(.24+.40*u),true,upper);p[1]+=.004;return p;
      });
      b.tube(points,.0038,'gold',10,4);
    }
    for(const t of [.39,.67]){
      const p=roofPoint(angle,t,0,true,upper);p[1]+=.030;bead(p,.019,'pearl');
    }
  }
  for(let i=0;i<3;i++){
    const a=i*TAU/3;b.add(petal(.19,.071,.021,.078),'mint',xyz(.075,a,8.155),[.12*Math.sin(a),a,-.12*Math.cos(a)]);
  }
  ring(.22,8.15,.009,'gold',[0,0,0],32);
  // Bespoke silhouette pass: carved scallop crests and curling metal lace
  // occupy only the high spandrels. Broad three-way entries remain untouched.
  for(let i=0;i<6;i++){
    const a=(i+.5)*TAU/6,yaw=Math.PI/2-a;
    b.shellFan(xyz(4.95,a,5.92),[0,yaw,0],.68,'pearl');
    for(const side of [-1,1]){
      const p=xyz(4.99,a+side*.12,6.22);
      b.scroll(p,[0,yaw,side>0?0:Math.PI],.75,.60,'gold',.018);
    }
    // Alternating ceramic acanthus brackets support the eaves visually.
    for(const side of [-1,1]){
      const p=xyz(5.10,a+side*.26,6.05);
      leaf(p,[.22,yaw,-side*.68],.64,.20,i%2?'mint':'rose');
    }
  }
  // A flower-shaped ceiling rosette and interwoven soffit ribs provide a
  // second level of close detail under the roof, visible while walking inside.
  for(let i=0;i<12;i++){
    const a=i*TAU/12;
    b.tube(sample(40,t=>{
      const r=.82+t*3.85,angle=a+.11*Math.sin(Math.PI*t),profile=roofProfile((r-.52)/6.4,false);
      return xyz(r,angle,profile.y-profile.depth-.11);
    }),.035,i%2?'gold':'pearl',36,6);
    b.tube(sample(28,t=>{
      const r=.85+3.15*t,angle=a+.065*Math.sin(TAU*t),profile=roofProfile((r-.52)/6.4,false);
      return xyz(r,angle,profile.y-profile.depth-.165);
    }),.009,'gold',28,4);
  }
  ring(.72,7.72,.033,'pearl',[0,0,0],64);
  ring(.67,7.69,.014,'gold',[0,0,0],64);
  // Leaf-shaped enamel cameos sit in the three rail bays; unlike the previous
  // bead accents they give each long rail a legible botanical centerpiece.
  for(let i=0;i<6;i+=2){
    const a=(i+.5)*TAU/6;
    b.shellFan(xyz(5.045,a,.47),[0,Math.PI/2-a,0],.54,'rose');
  }
  const botanicalRelief=addPavilionBotanicalRelief(THREE,kit,b,{roofPoint,columnCenter});
  const entranceAngles=[Math.PI/2,Math.PI/2+TAU/3,Math.PI/2+2*TAU/3];
  const group=b.finish({type:'lotusPavilion',units:'meters',frontAxis:'+Z',floorY:0,columnCount:6,
    columnCenters:Array.from({length:6},(_,i)=>[Math.cos(i*TAU/6)*R,Math.sin(i*TAU/6)*R]),
    entranceAngles,entryAngles:entranceAngles,entryClearWidth:4.1,entryClearHeight:5.4,
    roofCourses:2,roofPetals:12,lanterns:6,detailPasses:5,botanicalRelief,
    detailFeatures:['raised botanical roof relief','gilded leaf borders and venation','tapered carved ivory brackets','sculpted ceiling lotus','sculpted shell crests','open scroll spandrels','enamel railing cameos','laced ceiling ribs','textured ceramic and brushed gold','fitted column fluting','capital leaf venation','forked roof inlays','pearl roof nodes','inner finial petals'],
    description:'Open pearl-column lotus pavilion with layered ceramic petals, gilt botanical arches and three broad entrances.'});
  return group;
}
