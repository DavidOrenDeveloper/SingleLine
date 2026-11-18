const K={data:'ptk.data',sb:'ptk.sb',snap:'ptk.snap',ls:'ptk.ls',idb:'ptk-files'},SBO={auth:{storageKey:'ptk.auth'}};
const ST=['לביצוע','לעיון','מכרז','לא הוגדר'],TABS=[['p','לוחות'],['m','מפה'],['d','תוכניות'],['b','מבנה'],['g','סכמות'],['s','הגדרות']];
const DEF={ok:'#c8f0d0',miss:'#f8c8c8','לביצוע':'#cfe3ff','לעיון':'#fff3b8','מכרז':'#e3d4f5','לא הוגדר':'#e5e7eb'};
const $=s=>document.querySelector(s),uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let tab='p',q='',fb='',fs='',onlyMiss=false;
function seed(){
 const up=n=>Array.from({length:n},(_,i)=>''+(i+1)),al=['-1','קרקע',...up(8),'גג'];
 const b=[['דיור מוגן דרומי',al],['דיור מוגן מרכזי',al],['דיור מוגן צפוני',al],['משרדים',['-2','-1','קרקע',...up(9),'גג']],['סיעודי',['-2','-1','קרקע',...up(3),'גג']],['טיגארט',['-1','קרקע',...up(2),'גג']],['חניונים',['-2','-1']]].map(([name,floors],i)=>({id:'b'+i,name,floors}));
 const P=[['DPB-23','לוח ציבורי',5,'קרקע','E-TIG-P03-2'],['DPB-24','לוח ציבורי',5,'קרקע','E-TIG-P03-2'],
 ['DPB-104','לוח קריטי חניונים+טיגארט',6,'','E-PAR-PB-01-2'],['DPB-105','חלוקת הזנות גנרטור',6,'','E-PAR-PB-01-2'],['DPB-106','לוח חיוני גג חניונים+טיגארט',6,'','E-PAR-PB-01-2'],
 ['DPB-10','לוח משנה מרתף -2',6,'-2','E-PAR-PB-02-2'],['DPB-11','לוח משנה מרתף -2',6,'-2','E-PAR-PB-02-2'],
 ['DPB-31','לוח שרות ח"ח משרדים',3,'','E-OB-P-03'],['DPB-36','לוח שרותי גג',3,'גג','E-OB-P-03'],
 ['DPB-204','לוח קריטי מגדל משרדים',3,'','E-OB-P-02'],['DPB-205','חלוקת הזנות גנרטור',3,'','E-OB-P-02'],['DPB-206','לוח חיוני גג משרדים',3,'גג','E-OB-P-02'],
 ['DPB-32','לוח חיוני קומת חניון',3,'-1','E-OB-P-05'],['DPB-33','לוח חיוני קומת חניון',3,'-1','E-OB-P-05'],
 ['PB-93.1','חלוקת הזנות קומתי',2,'3','E-OB-N-P03.2'],['PB-94.1','חלוקת הזנות קומתי',2,'4','E-OB-N-P03.2'],['PB-95.1','חלוקת הזנות קומתי',2,'5','E-OB-N-P03.2'],['PB-96.1','חלוקת הזנות קומתי',2,'6','E-OB-N-P03.2'],['PB-97.1','חלוקת הזנות קומתי',2,'7','E-OB-N-P03.2'],['PB-98.1','חלוקת הזנות קומתי',2,'8','E-OB-N-P03.2'],
 ['DPB-308','לוח קריטי',-1,'','E-AL-P01-4']];
 return{b,p:P.map(([name,desc,i,f,dwg])=>({id:uid(),name,desc,b:i<0?'':'b'+i,f,dwg})),d:[],c:{...DEF}};
}
let S;try{S=JSON.parse(localStorage.getItem(K.data))}catch(e){}S=S||seed();S.g=S.g||[];S.a=S.a||[];
const save=()=>{try{localStorage.setItem(K.data,JSON.stringify(S))}catch(e){}if(window.syncSoon)syncSoon()};
const db=new Promise((res,rej)=>{const r=indexedDB.open(K.idb,1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const idb=async(m,k,v)=>{const d=await db;return new Promise((res,rej)=>{const o=d.transaction('f',m==='get'?'readonly':'readwrite').objectStore('f');const r=m==='get'?o.get(k):m==='put'?o.put(v,k):o.delete(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})};
const N=s=>String(s||'').trim().toUpperCase(),bn=id=>(S.b.find(b=>b.id===id)||{name:'לא שויך'}).name;
const dOf=p=>p.dwg?S.d.find(d=>N(d.num)===N(p.dwg)):null,has=p=>!!dOf(p),st=p=>has(p)?dOf(p).status:'חסר',col=p=>has(p)?S.c.ok:S.c.miss;
const cur=d=>d.revs.reduce((a,r)=>!a||(r.date||'')>=(a.date||'')?r:a,null);
const fmt=d=>d?d.split('-').reverse().join('/'):'ללא תאריך';

