let swReg=null;
const vApp=()=>`<div class="card"><b>גרסה ועדכון</b><div class="sub">גרסה ${APP_VER} · <span id="ust"></span></div><button class="pri" onclick="chkUpd()">בדוק עדכון</button> <button onclick="clrCache()">נקה מטמון ורענן</button></div><div class="card"><b>נתוני האפליקציה</b><div class="sub">מוחק רק את הנתונים והקבצים של אפליקציה זו במכשיר הזה. הענן ואפליקציות אחרות לא מושפעים.</div><button onclick="wipeApp()" style="color:#b00020">מחק את נתוני האפליקציה</button></div>`;
const ust=t=>{const e=$('#ust');if(e)e.textContent=t};
function showUpd(){if($('#updbar'))return;const b=document.createElement('div');b.id='updbar';b.innerHTML='יש גרסה חדשה <button class="pri" onclick="doUpd()">עדכן עכשיו</button>';document.body.prepend(b)}
function doUpd(){if(swReg&&swReg.waiting)swReg.waiting.postMessage('SKIP');else location.reload()}
async function chkUpd(){if(!swReg)return ust('אין Service Worker (נדרשת כתובת https)');ust('בודק...');try{await swReg.update()}catch(e){}
 if(swReg.waiting){showUpd();ust('נמצאה גרסה חדשה')}else if(swReg.installing)ust('מתקין גרסה חדשה...');else ust('הגרסה עדכנית')}
async function clrCache(){try{for(const k of await caches.keys())if(k.startsWith('ptk-cache-'))await caches.delete(k);const r=await navigator.serviceWorker.getRegistration();if(r)await r.unregister()}catch(e){}location.reload()}
async function wipeApp(){if(!confirm('למחוק את כל הנתונים וקבצי ה-PDF של אפליקציית הלוחות מהמכשיר הזה? נתוני הענן ואפליקציות אחרות לא יימחקו.'))return;
 Object.keys(localStorage).filter(k=>k.startsWith('ptk.')).forEach(k=>localStorage.removeItem(k));
 try{(await db).close();await new Promise(r=>{const q=indexedDB.deleteDatabase(K.idb);q.onsuccess=q.onerror=q.onblocked=r})}catch(e){}
 try{for(const k of await caches.keys())if(k.startsWith('ptk-cache-'))await caches.delete(k)}catch(e){}
 location.reload()}
function initUpd(){if(!('serviceWorker' in navigator))return;const had=!!navigator.serviceWorker.controller;
 navigator.serviceWorker.register('sw.js').then(r=>{swReg=r;if(r.waiting&&had)showUpd();
  r.addEventListener('updatefound',()=>{const w=r.installing;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)showUpd()})});
  setInterval(()=>r.update().catch(()=>{}),1800000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)r.update().catch(()=>{})})}).catch(()=>{});
 let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!had||rl)return;rl=true;location.reload()})}
