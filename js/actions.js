async function editP(id,pre){const p=id?S.p.find(x=>x.id===id):{name:'',desc:'',b:'',f:'',dwg:'',...pre};
 const fl=[...new Set(S.b.flatMap(b=>b.floors))];
 const o=await ask(id?'עריכת לוח':'לוח חדש',[['name',id?'שם לוח':'שם לוח (אפשר כמה, מופרדים בפסיק)'],['desc','תיאור'],['b','בניין',[['','לא שויך'],...S.b.map(b=>[b.id,b.name])]],['f','קומה',null,fl],['dwg','מס׳ תוכנית',null,nums()]],p);
 if(!o)return;if(id)Object.assign(p,o);else o.name.split(/[,\n،]/).map(s=>s.trim()).filter(Boolean).forEach(n=>S.p.push({id:uid(),...o,name:n}));save();render()}
function delP(id){if(confirm('למחוק את הלוח?')){S.p=S.p.filter(x=>x.id!==id);save();render()}}
async function editD(id){const d=S.d.find(x=>x.id===id),c=cur(d);
 const o=await ask('עריכת תוכנית',[['num','מס׳ תוכנית'],['name','שם'],['status','סטטוס',ST],['date','תאריך (yyyy-mm-dd)']],{...d,date:c.date});if(!o)return;
 Object.assign(d,{num:o.num,name:o.name,status:o.status});c.date=o.date;save();render()}
function delD(id){if(!confirm('למחוק את התוכנית וכל הגרסאות?'))return;const d=S.d.find(x=>x.id===id);d.revs.forEach(r=>idb('del',r.key).catch(()=>{}));S.d=S.d.filter(x=>x!==d);save();render()}
function split(id,i){const d=S.d.find(x=>x.id===id),[r]=d.revs.splice(i,1);S.d.push({id:uid(),num:d.num+' (2)',name:r.file.replace(/\.pdf$/i,''),status:'לא הוגדר',revs:[r]});save();render()}
async function editB(id){const b=id?S.b.find(x=>x.id===id):{name:'',floors:[]};
 const o=await ask(id?'עריכת בניין':'בניין חדש',[['name','שם'],['floors','קומות (מופרדות בפסיק, מלמטה למעלה)']],{name:b.name,floors:b.floors.join(', ')});if(!o)return;
 const fl=o.floors.split(/[,،]/).map(s=>s.trim()).filter(Boolean);if(id){b.name=o.name;b.floors=fl}else S.b.push({id:'b'+uid(),name:o.name,floors:fl});save();render()}
function delB(id){if(confirm('למחוק את הבניין? הלוחות שלו יעברו ל"לא שויך"')){S.p.forEach(p=>{if(p.b===id)p.b=''});S.b=S.b.filter(b=>b.id!==id);save();render()}}
const setC=(k,v)=>{S.c[k]=v;save();render()};
function exp(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:'application/json'}));a.download='panels-backup.json';a.click()}
async function imp(f){try{S=JSON.parse(await f.text());S.g=S.g||[];save();render()}catch(e){alert('קובץ לא תקין')}}

async function addD(){const o=await ask('תוכנית ידנית (ללא קובץ)',[['num','מס׳ תוכנית'],['name','שם'],['status','סטטוס',ST],['date','תאריך (yyyy-mm-dd)']],{status:'לא הוגדר'});if(!o||!o.num)return;S.d.push({id:uid(),num:o.num,name:o.name,status:o.status,revs:[{date:o.date,file:'',key:'',found:true}]});save();render()}
function delRev(id,i){const d=S.d.find(x=>x.id===id);if(d.revs.length<2||!confirm('למחוק את הגרסה?'))return;idb('del',d.revs[i].key).catch(()=>{});d.revs.splice(i,1);save();render()}
