const nz=s=>String(s).replace(/[\s_"'׳״\-]/g,'');
const ist=t=>{const e=$('#ist');if(e)e.textContent=t};
function guessB(dirs){const full=nz(dirs.join(' '));let best='',sc=0;
 for(const b of S.b){const w=b.name.split(/\s+/).filter(Boolean),k=w.filter(x=>full.includes(nz(x))).length;if(k===w.length&&k>sc){best=b.id;sc=k}}
 return best||(dirs.length?'new:'+(dirs.length>1?dirs[1]:dirs[0]):'')}
function guessF(s){let m=s.match(/(?:מינוס|מרתף)\s*-?(\d)/);if(m)return'-'+m[1];m=s.match(/קומ(?:ה|ת)\s*(קרקע|גג|-?\d{1,2})/);return m?m[1]:''}
function parsePanels(s){return s.replace(/_/g,' ').split(/[,،]/).map(x=>x.trim()).filter(Boolean).map(x=>{let n=1;const m=x.match(/\s*[x×]\s*(\d+)$/i);if(m){n=+m[1];x=x.slice(0,m.index).trim()}
 const[a,...r]=x.split(' — ');if(r.length)return{name:a.trim(),desc:r.join(' — ').trim(),raw:x,n};
 const c=x.match(/[A-Za-z]{1,4}-?\d[\w.\-]*/);return c?{name:c[0].toUpperCase(),desc:x.replace(c[0],'').replace(/\s+/g,' ').trim(),raw:x,n}:{name:x,desc:'',raw:x,n}})}
const NL=/^(?:\d[\d.]*\s*[,،]\s*)*\d[\d.]*$/;
function parseName(stem){let s=stem.replace(/\s+/g,' ').trim(),date='',num='',rest=s;const notes=[],dup={},segs=[];
 const dm=s.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);let head=s;
 if(dm){let y=+dm[3];if(y<100)y+=2000;date=`${y}-${String(dm[2]).padStart(2,'0')}-${String(dm[1]).padStart(2,'0')}`;head=s.slice(0,dm.index);rest=s.slice(dm.index+dm[0].length)}
 if(/^E-/i.test(s)){if(dm)num=head.replace(/[-_.\s]+$/,'').replace(/-{2,}/g,'-');else{num=s.match(/^E-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*/)[0];rest=s.slice(num.length)}}else if(dm)rest=head+' '+rest;
 num=num.toUpperCase();rest=rest.replace(/^[\s_.\-]+/,'');
 for(let seg of rest.split(/__+/)){
  seg=seg.replace(/מספר לוח\s*([\d.]+)\s*מופיע\s*(\d+)\s*פעמים/g,(m,a,b)=>{dup[a]=+b;notes.push(m.trim());return ''}).replace(/^[\s_.\-]+|[\s_.\-]+$/g,'');if(!seg)continue;
  const ld=seg.match(/^((?:\d[\d.]*\s*[,،]\s*)*\d[\d.]*)\s*[_\-]\s*(?=\D)/);if(ld){ld[1].split(/[,،]/).forEach(n=>segs.push({name:n.trim(),desc:'',n:1}));seg=seg.slice(ld[0].length)}if(!seg)continue;
  const m=seg.match(/^(.*?)\s*[-_]\s*((?:\d[\d.]*\s*[,،]\s*)*\d[\d.]*)$/);let desc='',list=null;
  if(m){desc=m[1].trim();list=m[2];if(NL.test(desc)){list=desc+','+list;desc=''}}else if(NL.test(seg))list=seg;
  if(list)list.split(/[,،]/).forEach(n=>segs.push({name:n.trim(),desc,n:1}));
  else seg.split(/[,،]/).forEach(part=>{part=part.trim();if(!part)return;const t=part.match(/^(.*\S)\s+(\d[\d.]*)$/);
   segs.push(t&&!/(קומה|קומת|מינוס|מפלס|דירה)$/.test(t[1])?{name:t[2],desc:t[1],n:1}:{name:part,desc:'',n:1})})}
 segs.forEach(p=>{if(dup[p.name])p.n=dup[p.name]});
 return{num,date,notes,text:segs.map(p=>p.name+(p.desc?' — '+p.desc:'')+(p.n>1?' ×'+p.n:'')).join(', ')}}
async function walk(en,path,out){if(en.isFile){if(/\.pdf$/i.test(en.name))out.push({f:await new Promise((a,b)=>en.file(a,b)),dirs:path});return}
 const dir=[...path,en.name],rr=en.createReader();let all=[];for(;;){const b=await new Promise((a,c)=>rr.readEntries(a,c));if(!b.length)break;all=all.concat(b)}
 for(const c of all)await walk(c,dir,out)}
async function dropAny(e){e.preventDefault();const es=[...e.dataTransfer.items].map(i=>i.webkitGetAsEntry&&i.webkitGetAsEntry()).filter(Boolean);
 if(!es.some(x=>x.isDirectory))return prepImp([...e.dataTransfer.files].filter(f=>/pdf$/i.test(f.name)).map(f=>({f,dirs:[]})));
 const out=[];ist('סורק תיקיות...');for(const x of es)await walk(x,[],out);prepImp(out)}
const pickFiles=fs=>prepImp([...fs].map(f=>({f,dirs:[]})));
const pickDir=fs=>prepImp([...fs].map(f=>({f,dirs:f.webkitRelativePath.split('/').slice(0,-1)})));
async function prepImp(items){items=items.filter(x=>/\.pdf$/i.test(x.f.name));if(!items.length){ist('');return alert('לא נמצאו קבצי PDF')}
 const rows=[];let i=0;for(const it of items){ist(`קורא ${++i}/${items.length}...`);const r=await readPdf(it.f),stem=it.f.name.replace(/\.pdf$/i,'').replace(/_\d$/,''),full=[...it.dirs,stem].join(' '),pn=parseName(stem);
  rows.push({on:1,f:it.f,stem,num:pn.num||(r.found?r.num:stem),date:pn.date||r.date,found:!!pn.num||r.found,note:pn.notes.join(' · '),type:/(^|[-_ ])S\d\d|סכמה/i.test(stem)?'g':'p',b:guessB(it.dirs),floor:guessF(full),status:ST.find(s=>s!=='לא הוגדר'&&full.includes(s))||'לא הוגדר',panels:pn.text||stem.replace(/_/g,' ')})}
 ist('');showImp(rows)}
function showImp(rows){const d=document.createElement('dialog');d.style.width='min(780px,96vw)';
 const bo=r=>'<option value="">לא שויך</option>'+bOpts().map(([v,n])=>`<option value="${esc(v)}" ${r.b===v?'selected':''}>${esc(n)}</option>`).join('')+(r.b.startsWith('new:')?`<option value="${esc(r.b)}" selected>חדש (בניין): ${esc(r.b.slice(4))}</option><option value="newa:${esc(r.b.slice(4))}">חדש (אזור): ${esc(r.b.slice(4))}</option>`:'')+'<option value="__new">+ אזור / בניין חדש…</option>';
 d.innerHTML=`<h3>תצוגה מקדימה לייבוא — ${rows.length} קבצים</h3><div class="sub">אפשר לצפות בקובץ (כפתור "תצוגה") כדי לראות אילו לוחות יש בו. תקן בניין/אזור, קומה ושמות לוחות (מופרדים בפסיקים) לפני הייבוא. סכמה חד קווית שייכת לכל הבניין/האזור ולכן אין לה קומה.</div><label class="tog wrap"><input type="checkbox" id="imw"> מחק קודם את כל הלוחות הקיימים (כולל לוחות לדוגמה)</label><div class="implist">`+
 rows.map((r,i)=>`<div class="card" data-i="${i}"><div class="row"><label class="tog" style="border:0;padding:0;background:none"><input type="checkbox" class="c_on" checked> <b>${esc(r.f.name)}</b></label><div class="acts"><span class="sub">${esc(r.found?r.num:'מס׳ מהשם')} · ${fmt(r.date)}</span><button type="button" class="sm c_pv">${IC.file}תצוגה</button></div></div><div class="bar" style="margin:8px 0"><select class="c_t" style="flex:1;min-width:130px"><option value="p">תוכנית לוחות</option><option value="g" ${r.type==='g'?'selected':''}>סכמה חד קווית</option></select><select class="c_b" style="flex:1;min-width:150px">${bo(r)}</select><input class="c_f" placeholder="קומה" value="${esc(r.floor)}" style="max-width:100px;${r.type==='g'?'display:none':''}"></div><input class="c_p" value="${esc(r.panels)}" style="width:100%" placeholder="שמות הלוחות, מופרדים בפסיק"></div>`).join('')+
 `</div><div class="dact"><button class="pri" id="imgo">ייבא</button><button onclick="this.closest('dialog').close()">ביטול</button></div>`;
 d.onclose=()=>d.remove();document.body.append(d);d.showModal();
 d.querySelectorAll('[data-i]').forEach(c=>{const r=rows[+c.dataset.i],t=c.querySelector('.c_t'),b=c.querySelector('.c_b');let prev=b.value;
  c.querySelector('.c_pv').onclick=()=>previewPdf(r.f,r.f.name);
  t.onchange=()=>{c.querySelector('.c_f').style.display=t.value==='g'?'none':''};
  b.onchange=async()=>{if(b.value!=='__new'){prev=b.value;return}
   const o=await ask('אזור / בניין חדש',[['kind','סוג',[['a','אזור (כמה בניינים, למשל דיור מוגן)'],['b','בניין']]],['name','שם']],{kind:'a'});
   if(!o||!o.name.trim()){b.value=prev;return}const x={id:'b'+uid(),name:o.name.trim(),floors:[],area:o.kind==='a'};S.b.push(x);save();
   d.querySelectorAll('.c_b').forEach(s=>{const op=new Option(x.name+(x.area?' (אזור)':''),x.id);s.insertBefore(op,s.querySelector('option[value="__new"]'))});b.value=x.id;prev=x.id}});
 $('#imgo').onclick=()=>{d.querySelectorAll('[data-i]').forEach(c=>{const r=rows[+c.dataset.i];r.on=c.querySelector('.c_on').checked;r.type=c.querySelector('.c_t').value;r.b=c.querySelector('.c_b').value;r.floor=c.querySelector('.c_f').value.trim();r.panels=c.querySelector('.c_p').value});
  const w=$('#imw').checked;if(w&&!confirm('למחוק את כל הלוחות הקיימים לפני הייבוא?'))return;d.close();commitImp(rows,w)}}
async function commitImp(rows,wipe){if(wipe)S.p=[];const nb={};let nd=0,np=0,ng=0;
 for(const r of rows){if(!r.on)continue;let b=r.b;if(/^new[a]?:/.test(b)){const ar=b[3]==='a',nm=b.slice(ar?5:4),kk=(ar?'a:':'b:')+nm;if(!nb[kk]){const x={id:'b'+uid(),name:nm,floors:[],area:ar};S.b.push(x);nb[kk]=x.id}b=nb[kk]}
  const key=uid();try{await idb('put',key,r.f)}catch(e){}upFile(key,r.f);
  if(r.type==='g'){S.g.push({id:uid(),name:r.stem,b,key,marks:[]});ng++;continue}
  let d=S.d.find(x=>N(x.num)===N(r.num));if(!d){d={id:uid(),num:r.num,name:r.stem,status:r.status,revs:[]};S.d.push(d);nd++}
  d.revs.push({date:r.date,file:r.f.name,key,found:r.found});if(r.note)d.note=r.note;
  parsePanels(r.panels).forEach(pn=>{const f=guessF(pn.raw)||r.floor,sfx=x=>{const a=N(x.name),t=N(pn.name);return a.endsWith(t)&&(a.length===t.length||!/[\d.]/.test(a[a.length-t.length-1]))};
   for(let i=1;i<=pn.n;i++){const nm=pn.n>1?`${pn.name} (${i}/${pn.n})`:pn.name;let p=S.p.find(x=>x.b===b&&N(x.name)===N(nm));
    if(!p&&pn.n===1&&/^[\d.]+$/.test(pn.name)){const c=S.p.filter(x=>x.b===b&&sfx(x));if(c.length===1)p=c[0]}
    if(p){if(!p.dwg||!dOf(p))p.dwg=d.num;if(!p.desc)p.desc=pn.desc;if(!p.f)p.f=f}else{S.p.push({id:uid(),name:nm,desc:pn.desc+(pn.n>1?' (מספר כפול אצל היועץ)':''),b,f,dwg:d.num});np++}}})}
 save();render();info('הייבוא הסתיים',`${nd} תוכניות חדשות · ${np} לוחות חדשים · ${ng} סכמות`)}
