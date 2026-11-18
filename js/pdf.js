async function readPdf(f){let t='';try{const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;t=(await(await pdf.getPage(1)).getTextContent()).items.map(i=>i.str).join(' ')}catch(e){}
 const codes=[...t.matchAll(/(?<![\w-])E-[A-Z]{1,3}(?:-[A-Z0-9.]+)+/g)].map(m=>m[0]);
 const ds=[...t.matchAll(/(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})/g)].map(m=>{let y=+m[3];if(y<100)y+=2000;return new Date(Date.UTC(y,m[2]-1,+m[1]))}).filter(d=>!isNaN(d)&&d.getUTCFullYear()>2015&&d.getUTCFullYear()<2032).sort((a,b)=>a-b);
 const fd=[...f.name.matchAll(/(?<!\d)(\d{1,2})[.\-_](\d{1,2})[.\-_](\d{2,4})(?!\d)/g)].map(m=>{let y=+m[3];if(y<100)y+=2000;const d=new Date(Date.UTC(y,m[2]-1,+m[1]));return d.getUTCDate()===+m[1]&&d.getUTCMonth()===m[2]-1&&y>2015&&y<2032?d:null}).filter(Boolean);
 const stem=f.name.replace(/\.pdf$/i,'').replace(/_\d+$/,'');
 return{num:codes.at(-1)||stem,date:fd.length?fd.at(-1).toISOString().slice(0,10):ds.length?ds.at(-1).toISOString().slice(0,10):'',found:!!codes.length}}
async function addFiles(files){for(const f of files){const r=await readPdf(f),key=uid();try{await idb('put',key,f)}catch(e){}upFile(key,f);
 let d=S.d.find(x=>N(x.num)===N(r.num));if(!d){d={id:uid(),num:r.num,name:f.name.replace(/\.pdf$/i,''),status:'לא הוגדר',revs:[]};S.d.push(d)}
 d.revs.push({date:r.date,file:f.name,key,found:r.found})}save();render()}
function openRev(k,find){if(!k)return alert('לתוכנית זו אין קובץ — העלה את הקובץ בלשונית תוכניות');openDoc({key:k,title:vOpenRevTitle(k),find})}
function openP(id){const p=S.p.find(x=>x.id===id),d=dOf(p);if(!d)return alert(`⚠ אין תוכנית ללוח ${p.name}`+(p.dwg?` (מצופה: ${p.dwg})`:' — לא מקושרת תוכנית'));openRev(cur(d).key,p.name)}
const nums=()=>S.d.map(d=>d.num);

