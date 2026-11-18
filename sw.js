importScripts('js/version.js');
const C='ptk-cache-'+APP_VER,A=['./', 'index.html', 'css/style.css', 'manifest.json', 'icon-192.png', 'icon-512.png', 'js/version.js', 'js/data.js', 'js/forms.js', 'js/pdf.js', 'js/actions.js', 'js/help.js', 'js/views.js', 'js/diagram.js', 'js/sync.js', 'js/update.js', 'js/main.js','js/folder.js','js/bulk.js','js/search.js','js/nav.js','js/viewer.js','js/team.js'];
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(A))));
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('ptk-cache-')&&x!==C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{if(r.ok||r.type==='opaque'){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
