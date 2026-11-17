let sel=new Set(),LL=[];
const redo=()=>{const e=$('#pl');if(e)e.innerHTML=listP();else render()};
function tg(id,c){c?sel.add(id):sel.delete(id);redo()}
function selAll(){LL.forEach(p=>sel.add(p.id));redo()}
function clrSel(){sel.clear();redo()}
async function mvSel(){const o=await ask(`העברת ${sel.size} לוחות`,[['b','בניין',[['','ללא שינוי'],['__none','לא שויך'],...S.b.map(b=>[b.id,b.name])]],['f','קומה (ריק = ללא שינוי)',null,[...new Set(S.b.flatMap(b=>b.floors))]],['dwg','מס׳ תוכנית (ריק = ללא שינוי)',null,nums()]],{b:''});if(!o)return;
 S.p.filter(p=>sel.has(p.id)).forEach(p=>{if(o.b)p.b=o.b==='__none'?'':o.b;if(o.f.trim())p.f=o.f.trim();if(o.dwg.trim())p.dwg=o.dwg.trim()});sel.clear();save();render()}
function delSel(){if(!confirm(`למחוק ${sel.size} לוחות?`))return;S.p=S.p.filter(p=>!sel.has(p.id));sel.clear();save();render()}
function selD(id){const d=S.d.find(x=>x.id===id);S.p.filter(p=>N(p.dwg)===N(d.num)).forEach(p=>sel.add(p.id));if(!sel.size)return alert('אין לוחות מקושרים לתוכנית');tab='p';render();mvSel()}
