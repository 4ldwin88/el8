// Storage must not silently drop/coerce evidence through JSON serialization.
// This checks representation only; the domain validator still owns semantics.
export function assertJsonValue(value, path='state', ancestors=new Set()) {
  if (value===null || typeof value==='string' || typeof value==='boolean') return;
  if (typeof value==='number' && Number.isFinite(value) && !Object.is(value,-0)) return;
  if (typeof value!=='object' || value===null) throw new Error(`non-JSON value at ${path}`);
  const array=Array.isArray(value);
  if (Object.getPrototypeOf(value)!==(array?Array.prototype:Object.prototype)) throw new Error(`non-JSON object at ${path}`);
  if (ancestors.has(value)) throw new Error(`cyclic JSON value at ${path}`);
  ancestors.add(value);
  const descriptors=Object.getOwnPropertyDescriptors(value);
  const keys=Reflect.ownKeys(descriptors).filter(key=>!(array&&key==='length'));
  if (array && (keys.length!==value.length || keys.some((key,index)=>key!==String(index)))) throw new Error(`non-JSON array at ${path}`);
  for (const key of keys) {
    const descriptor=descriptors[key];
    if (typeof key!=='string' || !descriptor.enumerable || !Object.hasOwn(descriptor,'value')) throw new Error(`non-JSON property at ${path}`);
    assertJsonValue(descriptor.value, `${path}.${key}`, ancestors);
  }
  ancestors.delete(value);
}
