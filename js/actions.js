async function editP(id,pre){const p=id?S.p.find(x=>x.id===id):{name:'',desc:'',b:'',f:'',dwg:'',...pre};
 const fl=[...new Set(S.b.flatMap(b=>b.floors))];
 const o=await ask(id?'עריכת לוח':'לוח חדש',[['name',id?'שם לוח':'שם לוח (אפשר כמה, מופרדים בפסיק)'],['desc','תיאור'],['b','בניין',[['','לא שויך'],...bOpts()]],['f','קומה',null,fl],['dwg','מס׳ תוכנית',null,nums()],['date','תאריך (yyyy-mm-dd, ריק = לפי התוכנית)']],{date:'',...p});
 if(!o)return;if(id)Object.assign(p,o);else o.name.split(/[,\n،]/).map(s=>s.trim()).filter(Boolean).forEach(n=>S.p.push({id:uid(),...o,name:n}));save();render()}
function delP(id){if(confirm('למחוק את הלוח?')){S.p=S.p.filter(x=>x.id!==id);save();render()}}
async function editD(id){const d=S.d.find(x=>x.id===id),c=cur(d);
 const o=await ask('עריכת תוכנית',[['num','מס׳ תוכנית'],['name','שם'],['status','סטטוס',ST],['date','תאריך (yyyy-mm-dd)']],{...d,date:c.date});if(!o)return;
 Object.assign(d,{num:o.num,name:o.name,status:o.status});c.date=o.date;save();render()}
function delD(id){if(!confirm('למחוק את התוכנית וכל הגרסאות?'))return;const d=S.d.find(x=>x.id===id);d.revs.forEach(r=>idb('del',r.key).catch(()=>{}));S.d=S.d.filter(x=>x!==d);save();render()}
function split(id,i){const d=S.d.find(x=>x.id===id),[r]=d.revs.splice(i,1);S.d.push({id:uid(),num:d.num+' (2)',name:r.file.replace(/\.pdf$/i,''),status:'לא הוגדר',revs:[r]});save();render()}
async function editB(id,pre){const b=id?S.b.find(x=>x.id===id):{name:'',floors:[],area:false,grp:'',...pre};
 const o=await ask(id?'עריכה':'בניין / אזור חדש',[['kind','סוג',[['b','בניין'],['a','אזור (קבוצה של כמה בניינים, למשל דיור מוגן)']]],['name','שם'],['grp','שייך לאזור',[['','ללא'],...S.b.filter(x=>x.area&&x.id!==b.id).map(x=>[x.id,x.name])]],['floors','קומות (מופרדות בפסיק, מלמטה למעלה — לא חובה באזור)']],{kind:b.area?'a':'b',name:b.name,grp:b.grp||'',floors:b.floors.join(', ')});
 if(!o||!o.name.trim())return;const fl=o.floors.split(/[,،]/).map(s=>s.trim()).filter(Boolean),r={name:o.name.trim(),floors:fl,area:o.kind==='a',grp:o.kind==='a'?'':o.grp};
 if(id)Object.assign(b,r);else S.b.push({id:'b'+uid(),...r});save();render()}
function delB(id){if(confirm('למחוק את הבניין? הלוחות שלו יעברו ל"לא שויך"')){S.p.forEach(p=>{if(p.b===id)p.b=''});S.b.forEach(x=>{if(x.grp===id)x.grp=''});S.b=S.b.filter(b=>b.id!==id);save();render()}}
const setC=(k,v)=>{S.c[k]=v;save();render()};
const dlBlob=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click()};
function exp(){dlBlob(new Blob([JSON.stringify(S)],{type:'application/json'}),'panels-backup.json')}
const loadZip=()=>window.JSZip?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';s.onload=ok;s.onerror=()=>no(new Error('אין חיבור לאינטרנט'));document.head.append(s)});
async function expZip(){try{await loadZip();const z=new JSZip();z.file('data.json',JSON.stringify(S));const ks=[...S.d.flatMap(d=>d.revs.map(r=>r.key)),...S.g.map(g=>g.key)].filter(Boolean);let n=0,miss=0;
 for(const k of ks){const f=(await idb('get',k).catch(()=>null))||await dlFile(k);if(f){z.file('files/'+k+'.pdf',f);n++}else miss++}
 dlBlob(await z.generateAsync({type:'blob'}),'panels-full-backup.zip');alert(`הגיבוי נוצר: ${n} קבצים`+(miss?` (${miss} קבצים לא נמצאו ולא נכללו)`:''))}catch(e){alert('שגיאה ביצירת גיבוי: '+(e.message||e))}}
async function imp(f){if(!f)return;try{if(/\.zip$/i.test(f.name)){await loadZip();const z=await JSZip.loadAsync(f);S=JSON.parse(await z.file('data.json').async('string'));
 for(const n of Object.keys(z.files)){const m=n.match(/^files\/(.+)\.pdf$/);if(!m)continue;const file=new File([await z.files[n].async('blob')],m[1]+'.pdf',{type:'application/pdf'});try{await idb('put',m[1],file)}catch(e){}upFile(m[1],file)}}else S=JSON.parse(await f.text());S.g=S.g||[];S.a=S.a||[];save();render()}catch(e){alert('קובץ לא תקין')}}

async function addD(){const o=await ask('תוכנית ידנית (ללא קובץ)',[['num','מס׳ תוכנית'],['name','שם'],['status','סטטוס',ST],['date','תאריך (yyyy-mm-dd)']],{status:'לא הוגדר'});if(!o||!o.num)return;S.d.push({id:uid(),num:o.num,name:o.name,status:o.status,revs:[{date:o.date,file:'',key:'',found:true}]});save();render()}
function delRev(id,i){const d=S.d.find(x=>x.id===id);if(d.revs.length<2||!confirm('למחוק את הגרסה?'))return;idb('del',d.revs[i].key).catch(()=>{});d.revs.splice(i,1);save();render()}
