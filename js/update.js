let swReg=null;
const vApp=()=>`<div class="card"><h2 class="ct">גרסה ועדכון</h2><div class="sub">גרסה ${APP_VER} · <span id="ust"></span></div><div class="acts" style="margin-top:10px"><button class="pri" onclick="chkUpd()">בדוק ועדכן</button><button onclick="clrCache()">נקה מטמון ורענן</button></div></div><div class="card"><h2 class="ct">נתוני האפליקציה</h2><div class="sub">מוחק רק את הנתונים והקבצים של אפליקציה זו במכשיר הזה. הענן ואפליקציות אחרות לא מושפעים.</div><div class="acts" style="margin-top:10px"><button class="danger" onclick="wipeApp()">מחק את נתוני האפליקציה</button></div></div>`;
const ust=t=>{const e=$('#ust');if(e)e.textContent=t};
function showUpd(){if($('#updbar'))return;const b=document.createElement('div');b.id='updbar';b.innerHTML='יש גרסה חדשה <button class="pri" onclick="doUpd()">עדכן עכשיו</button>';document.body.prepend(b)}
const verOf=x=>(x.match(/APP_VER\s*=\s*'([^']+)'/)||[])[1];
async function remoteVer(){const r=await fetch('js/version.js?_='+Date.now(),{cache:'no-store'});return verOf(await r.text())}
async function forceUpdate(){ust('מעדכן...');
 try{const h=await (await fetch('index.html?_='+Date.now(),{cache:'reload'})).text(),u=new Set(['index.html','sw.js','manifest.json','css/style.css']);
  for(const m of h.matchAll(/(?:src|href)="([^"]+)"/g))if(!/^https?:|^#/.test(m[1]))u.add(m[1]);
  await Promise.all([...u].map(x=>fetch(x,{cache:'reload'}).catch(()=>{})));
  for(const k of await caches.keys())if(k.startsWith('ptk-cache-'))await caches.delete(k);
  for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}catch(e){}
 location.reload()}
const doUpd=forceUpdate;
async function chkUpd(){ust('בודק...');try{const v=await remoteVer();if(v&&v!==APP_VER){ust('נמצאה גרסה '+v+' — מעדכן...');return forceUpdate()}ust(v?'הגרסה עדכנית ('+APP_VER+')':'לא ניתן לבדוק')}catch(e){ust('אין חיבור לבדיקה')}}
const clrCache=forceUpdate;
async function wipeApp(){if(!confirm('למחוק את כל הנתונים וקבצי ה-PDF של אפליקציית הלוחות מהמכשיר הזה? נתוני הענן ואפליקציות אחרות לא יימחקו.'))return;
 Object.keys(localStorage).filter(k=>k.startsWith('ptk.')).forEach(k=>localStorage.removeItem(k));
 try{(await db).close();await new Promise(r=>{const q=indexedDB.deleteDatabase(K.idb);q.onsuccess=q.onerror=q.onblocked=r})}catch(e){}
 try{for(const k of await caches.keys())if(k.startsWith('ptk-cache-'))await caches.delete(k)}catch(e){}
 location.reload()}
function initUpd(){if(!('serviceWorker' in navigator))return;const had=!!navigator.serviceWorker.controller;
 remoteVer().then(v=>{if(v&&v!==APP_VER)showUpd()}).catch(()=>{});
 navigator.serviceWorker.register('sw.js').then(r=>{swReg=r;if(r.waiting&&had)showUpd();
  r.addEventListener('updatefound',()=>{const w=r.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpd()})});
  setInterval(()=>r.update().catch(()=>{}),1800000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update().catch(()=>{})})}).catch(()=>{});
 let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had||rl)return;rl=true;location.reload()})}
