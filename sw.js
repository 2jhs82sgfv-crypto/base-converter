const CACHE='base-converter-online-v2';
const IMPORT_CACHE='base-converter-imported-app-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.all(ASSETS.map(async url=>{try{const r=await fetch(url,{cache:'reload'});if(r.ok)await c.put(url,r);}catch(e){}}));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('base-converter-online-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);
 if(url.origin!==self.location.origin)return;\n if(url.searchParams.has('remote-check')){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
 event.respondWith((async()=>{
  const imported=await caches.open(IMPORT_CACHE);
  const importedResponse=await imported.match(event.request,{ignoreSearch:true});
  if(importedResponse)return importedResponse;
  if(event.request.mode==='navigate'){
   try{const network=await fetch(event.request,{cache:'no-cache'});if(network.ok){const c=await caches.open(CACHE);await c.put('./index.html',network.clone());return network;}}catch(e){}
   return (await caches.match('./index.html'))||Response.error();
  }
  const cached=await caches.match(event.request);
  try{const network=await fetch(event.request);if(network.ok){const c=await caches.open(CACHE);c.put(event.request,network.clone());}return network;}catch(e){return cached||Response.error();}
 })());
});
