/** Workspace experiment: byte-exact full-attribute indexing of triangle lists.
 * No quantization, face removal, normal averaging, UV welding, or reordering.
 * The caller owns the returned geometry; source buffers remain untouched.
 */
export function createExactIndexedGeometry(THREE,source){
 if(!source?.isBufferGeometry||source.index)return null;
 if(source.morphTargetsRelative||Object.values(source.morphAttributes||{}).some(a=>a.length))return null;
 const entries=Object.entries(source.attributes).sort(([a],[b])=>a.localeCompare(b));
 const count=source.attributes.position?.count;if(!count||count%3)return null;
 if(entries.some(([,a])=>!a.isBufferAttribute||a.isInterleavedBufferAttribute||a.isInstancedBufferAttribute||a.count!==count||a.array.BYTES_PER_ELEMENT!==4))return null;
 const fields=entries.map(([name,attribute])=>({name,attribute,words:new Uint32Array(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength/4)}));
 const heads=new Map(),links=new Int32Array(count),first=new Uint32Array(count),index=new Uint32Array(count);let unique=0;
 for(let vertex=0;vertex<count;vertex++){
  let hash=2166136261;
  for(const {attribute:a,words}of fields)for(let c=0;c<a.itemSize;c++)hash=Math.imul(hash^words[vertex*a.itemSize+c],16777619);
  hash>>>=0;let candidate=heads.get(hash)??-1,found=-1;
  while(candidate!==-1){
   const previous=first[candidate];let equal=true;
   for(const {attribute:a,words}of fields){for(let c=0;c<a.itemSize;c++)if(words[vertex*a.itemSize+c]!==words[previous*a.itemSize+c]){equal=false;break;}if(!equal)break;}
   if(equal){found=candidate;break;}candidate=links[candidate];
  }
  if(found===-1){found=unique++;first[found]=vertex;links[found]=heads.get(hash)??-1;heads.set(hash,found);}
  index[vertex]=found;
 }
 const oldBytes=entries.reduce((sum,[,a])=>sum+a.array.byteLength,0),indexBytes=count*(unique<=65535?2:4);
 const newBytes=fields.reduce((sum,{attribute:a})=>sum+unique*a.itemSize*4,0)+indexBytes;
 if(newBytes>=oldBytes)return null;
 const geometry=new THREE.BufferGeometry();geometry.name=source.name;
 for(const {name,attribute:a,words}of fields){
  const array=new a.array.constructor(unique*a.itemSize),out=new Uint32Array(array.buffer);
  for(let vertex=0;vertex<unique;vertex++)for(let c=0;c<a.itemSize;c++)out[vertex*a.itemSize+c]=words[first[vertex]*a.itemSize+c];
  const attribute=new THREE.BufferAttribute(array,a.itemSize,a.normalized);attribute.name=a.name;attribute.setUsage(a.usage);attribute.gpuType=a.gpuType;geometry.setAttribute(name,attribute);
 }
 geometry.setIndex(new THREE.BufferAttribute(unique<=65535?new Uint16Array(index):index,1));
 for(const group of source.groups)geometry.addGroup(group.start,group.count,group.materialIndex);
 geometry.setDrawRange(source.drawRange.start,source.drawRange.count);
 geometry.boundingBox=source.boundingBox?.clone()??null;geometry.boundingSphere=source.boundingSphere?.clone()??null;
 geometry.userData=structuredClone(source.userData);
 return{geometry,sourceVertices:count,uniqueVertices:unique,oldBytes,newBytes,savedBytes:oldBytes-newBytes};
}
