let sel=new Set(),LL=[];
const redo=()=>{const e=$('#pl');if(e)e.innerHTML=listP();else render()};
function tg(id,c){c?sel.add(id):sel.delete(id);redo()}
function selAll(){LL.forEach(p=>sel.add(p.id));redo()}
function clrSel(){sel.clear();redo()}
function moveDlg(L){return new Promise(res=>{if(!L.length){alert('אין לוחות להעברה');return res(false)}
 const d=document.createElement('dialog');d.style.width='min(580px,96vw)';
 d.innerHTML=`<h3>העברת לוחות</h3><div class="sub">סמן את הלוחות להעברה ובחר יעד. "ביטול" סוגר בלי לשנות כלום.</div><div class="acts" style="margin:10px 0"><button type="button" class="sm" id="ma">בחר הכל</button><button type="button" class="sm" id="mn">בטל הכל</button><span class="sub" id="mc"></span></div>
 <div class="implist" style="max-height:32vh">${L.map(p=>`<label class="tog rowt"><input type="checkbox" checked data-id="${p.id}"><b>${esc(p.name)}</b><span class="sub">${esc(p.desc)} · ${esc(bn(p.b))} · ${p.f?'קומה '+esc(p.f):'ללא קומה'}</span></label>`).join('')}</div>
 <label class="f">בניין / אזור יעד<select id="mb"><option value="">ללא שינוי</option><option value="__none">לא שויך</option>${bOpts().map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('')}</select></label>
 <label class="f">קומה (ריק = ללא שינוי)<input id="mf" list="mfl"><datalist id="mfl">${[...new Set(S.b.flatMap(b=>b.floors))].map(x=>`<option value="${esc(x)}">`).join('')}</datalist></label>
 <label class="f">מס׳ תוכנית (ריק = ללא שינוי)<input id="mdw" list="mdl"><datalist id="mdl">${nums().map(x=>`<option value="${esc(x)}">`).join('')}</datalist></label>
 <div class="dact"><button class="pri" id="mok">העבר</button><button id="mcn">ביטול</button></div>`;
 document.body.append(d);let ok=false;d.onclose=()=>{d.remove();res(ok)};
 const cs=()=>[...d.querySelectorAll('input[data-id]')],upd=()=>{const n=cs().filter(c=>c.checked).length;d.querySelector('#mc').textContent=n+' מתוך '+L.length+' נבחרו';const b=d.querySelector('#mok');b.disabled=!n;b.textContent='העבר '+n};
 d.addEventListener('change',upd);d.querySelector('#ma').onclick=()=>{cs().forEach(c=>c.checked=true);upd()};d.querySelector('#mn').onclick=()=>{cs().forEach(c=>c.checked=false);upd()};d.querySelector('#mcn').onclick=()=>d.close();
 d.querySelector('#mok').onclick=()=>{const b=d.querySelector('#mb').value,f=d.querySelector('#mf').value.trim(),w=d.querySelector('#mdw').value.trim();
  cs().filter(c=>c.checked).forEach(c=>{const p=S.p.find(x=>x.id===c.dataset.id);if(!p)return;if(b)p.b=b==='__none'?'':b;if(f)p.f=f;if(w)p.dwg=w});ok=true;save();d.close();render()};
 d.showModal();upd()})}
async function mvSel(){if(await moveDlg(S.p.filter(p=>sel.has(p.id)))){sel.clear();render()}}
function delSel(){if(!confirm(`למחוק ${sel.size} לוחות?`))return;S.p=S.p.filter(p=>!sel.has(p.id));sel.clear();save();render()}
function selD(id){const d=S.d.find(x=>x.id===id);moveDlg(S.p.filter(p=>N(p.dwg)===N(d.num)))}
