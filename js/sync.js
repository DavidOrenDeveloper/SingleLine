let sb=null,sbUser=null,role=null,sstat='לא מחובר',busy=false,again=false,syncT=null,
 snap=JSON.parse(localStorage.getItem(K.snap)||'{}'),lastSync=+localStorage.getItem(K.ls)||0;
const setStat=t=>{sstat=t;const e=$('#sst');if(e)e.textContent=t};
const ents=()=>{const o={};['b','p','d','g'].forEach(k=>S[k].forEach(x=>o[k+':'+x.id]=x));o['c:c']=S.c;return o};
function syncSoon(){clearTimeout(syncT);syncT=setTimeout(()=>sync(),1500)}
function vSync(){const c=JSON.parse(localStorage.getItem(K.sb)||'{}'),i='style="width:100%;margin:3px 0"';
 return`<div class="card"><div class="row"><b>סנכרון בענן (Supabase)</b><button class="q" onclick="help('sync')">?</button></div><div class="sub" id="sst">${esc(sstat)}</div>
 <input id="su" placeholder="Project URL" value="${esc(c.url)}" ${i}><input id="sk" placeholder="anon public key" value="${esc(c.key)}" ${i}><input id="se" type="email" placeholder="אימייל" ${i}><input id="sp" type="password" placeholder="סיסמה" ${i}>
 <button class="pri" onclick="sbLogin()">התחבר</button> <button onclick="sync()">סנכרן עכשיו</button> <button onclick="upAll()">העלה את כל הקבצים</button> <button onclick="sbOut()">התנתק</button></div>`}
async function sbLogin(){const url=$('#su').value.trim(),key=$('#sk').value.trim();localStorage.setItem(K.sb,JSON.stringify({url,key}));
 if(!window.supabase)return setStat('ספריית Supabase לא נטענה (אין אינטרנט?)');sb=supabase.createClient(url,key,SBO);
 const{error}=await sb.auth.signInWithPassword({email:$('#se').value.trim(),password:$('#sp').value});if(error)return setStat('שגיאת התחברות: '+error.message);await afterAuth(true)}
async function sbInit(){const c=JSON.parse(localStorage.getItem(K.sb)||'{}');if(!c.url||!window.supabase)return;sb=supabase.createClient(c.url,c.key,SBO);const{data}=await sb.auth.getSession();if(data.session)afterAuth(false)}
async function sbOut(){if(sb)await sb.auth.signOut();sbUser=null;role=null;setStat('מנותק')}
async function afterAuth(first){sbUser=(await sb.auth.getUser()).data.user;const r=await sb.from('members').select('role').maybeSingle();role=r.data?r.data.role:null;
 if(!role)return setStat('המשתמש לא מורשה — חסר בטבלת members');
 if(first&&!Object.keys(snap).length){const{count}=await sb.from('entities').select('id',{count:'exact',head:true});
  if(count&&confirm('בענן כבר יש נתונים. להחליף את הנתונים במכשיר בנתוני הענן?\nאישור = החלף, ביטול = המשך עם הנתונים המקומיים')){S={b:[],p:[],d:[],g:[],c:{...DEF}};lastSync=0;snap={'c:c':{h:JSON.stringify(S.c),u:0}}}}
 sb.channel('e').on('postgres_changes',{event:'*',schema:'public',table:'entities'},()=>syncSoon()).subscribe();sync()}
function apply(r){const k=r.id[0],id=r.id.slice(2);
 if(k==='c'){if(!r.deleted)S.c={...DEF,...r.data};snap[r.id]={h:JSON.stringify(S.c),u:r.updated_at};return}
 const a=S[k];if(!a)return;const i=a.findIndex(x=>x.id===id);
 if(r.deleted){if(i>=0)a.splice(i,1);snap[r.id]={del:1,u:r.updated_at}}else{if(i>=0)a[i]=r.data;else a.push(r.data);snap[r.id]={h:JSON.stringify(r.data),u:r.updated_at}}}
async function sync(){if(!sb||!sbUser||!role)return;if(busy){again=true;return}busy=true;setStat('מסנכרן...');
 try{const E=ents(),now=Date.now(),up=[];
  if(role==='editor'){for(const[id,v]of Object.entries(E)){const h=JSON.stringify(v);if(!snap[id]||snap[id].h!==h){snap[id]={h,u:now};up.push({id,data:v,updated_at:now,deleted:false})}}
   for(const id of Object.keys(snap))if(!(id in E)&&!snap[id].del){snap[id]={del:1,u:now};up.push({id,data:{},updated_at:now,deleted:true})}
   if(up.length){const{error}=await sb.from('entities').upsert(up);if(error)throw error}}
  const{data,error}=await sb.from('entities').select('*').gt('updated_at',Math.max(0,lastSync-60000)).limit(5000);if(error)throw error;
  let ch=false;for(const r of data){lastSync=Math.max(lastSync,r.updated_at);const s=snap[r.id];if(s&&s.u>=r.updated_at)continue;apply(r);ch=true}
  localStorage.setItem(K.snap,JSON.stringify(snap));localStorage.setItem(K.ls,lastSync);
  if(ch){localStorage.setItem(K.data,JSON.stringify(S));render()}
  setStat('סונכרן '+new Date().toLocaleTimeString('he-IL')+(role==='editor'?'':' · קריאה בלבד'))}
 catch(e){setStat('שגיאת סנכרון: '+(e.message||e))}
 busy=false;if(again){again=false;syncSoon()}}
async function upFile(k,f){if(!sb||role!=='editor')return;const{error}=await sb.storage.from('plans').upload(k,f,{upsert:true,contentType:'application/pdf'});if(error)setStat('שגיאת העלאת קובץ: '+error.message)}
async function dlFile(k){if(!sb||!sbUser||!k)return null;const{data,error}=await sb.storage.from('plans').download(k);if(error||!data)return null;try{await idb('put',k,data)}catch(e){}return data}
async function upAll(){if(role!=='editor')return setStat('נדרשת הרשאת עריכה');const ks=[...S.d.flatMap(d=>d.revs.map(r=>r.key)),...S.g.map(g=>g.key)].filter(Boolean);let n=0;
 for(const k of ks){const f=await idb('get',k).catch(()=>null);if(f){await upFile(k,f);n++;setStat(`מעלה קבצים ${n}/${ks.length}`)}}setStat(`הועלו ${n} קבצים`)}
window.addEventListener('online',syncSoon);document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
