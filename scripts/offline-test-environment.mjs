// Defense against an accidentally added live call in the default test gate.
// Disposable local services are allowed; remote sockets and fetch are denied.
import net from 'node:net';
import {syncBuiltinESMExports} from 'node:module';
const connect=net.Socket.prototype.connect;
net.Socket.prototype.connect=function(...args) {
  if(Array.isArray(args[0])) args=args[0];
  const options=typeof args[0]==='object'?args[0]:{port:args[0],host:typeof args[1]==='string'?args[1]:'localhost'};
  if(!options.path&&!['localhost','127.0.0.1','::1'].includes(options.host??'localhost')) throw new Error('Offline tests cannot open remote network connections');
  return connect.apply(this,args);
};
const fetch=globalThis.fetch;
globalThis.fetch=(input,...args)=>{
  const url=new URL(typeof input==='string'||input instanceof URL?input:input.url);
  if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname)) throw new Error('Offline tests cannot fetch remote resources');
  return fetch(input,...args);
};
syncBuiltinESMExports();
